const request = require("supertest");
const mongoose = require("mongoose");
const { app } = require("../server");
const User = require("../models/User");
const Notification = require("../models/Notification");

describe("Integration tests - controllers", () => {
  let tokenA;
  let tokenB;
  let userA;
  let userB;
  let accountA;
  let accountB;
  let jointAccount;

  test("Register user A and login", async () => {
    const res = await request(app).post("/api/v1/auth/register").send({
      firstName: "Alice",
      lastName: "Anderson",
      email: "alice@example.com",
      password: "password123",
      phoneNumber: "1234567890",
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.token).toBeTruthy();
    tokenA = res.body.token;

    // fetch me
    const me = await request(app)
      .get("/api/v1/auth/me")
      .set("Authorization", `Bearer ${tokenA}`);
    expect(me.statusCode).toBe(200);
    userA = me.body.user;
    expect(userA.email).toBe("alice@example.com");
  });

  test("Register user B", async () => {
    const res = await request(app).post("/api/v1/auth/register").send({
      firstName: "Bob",
      lastName: "Brown",
      email: "bob@example.com",
      password: "password123",
      phoneNumber: "0987654321",
    });
    expect(res.statusCode).toBe(201);
    tokenB = res.body.token;
    const me = await request(app)
      .get("/api/v1/auth/me")
      .set("Authorization", `Bearer ${tokenB}`);
    userB = me.body.user;
    expect(userB.email).toBe("bob@example.com");
  });

  test("Create individual account for A and B", async () => {
    const resA = await request(app)
      .post("/api/v1/accounts")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({
        accountNumber: "ACC-A-1",
        accountType: "individual",
        name: "Alice Primary",
        balance: 1000,
        currency: "USD",
      });
    expect(resA.statusCode).toBe(201);
    accountA = resA.body;

    const resB = await request(app)
      .post("/api/v1/accounts")
      .set("Authorization", `Bearer ${tokenB}`)
      .send({
        accountNumber: "ACC-B-1",
        accountType: "individual",
        name: "Bob Primary",
        balance: 200,
        currency: "USD",
      });
    expect(resB.statusCode).toBe(201);
    accountB = resB.body;
  });

  test("Create joint account with A as primary and B as active secondary", async () => {
    const res = await request(app)
      .post("/api/v1/accounts")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({
        accountNumber: "JOINT-1",
        accountType: "joint",
        name: "A&B Joint",
        currency: "USD",
        balance: 0,
        secondaryOwners: [
          {
            user: userB.id || userB._id,
            permissions: "transact",
            status: "active",
          },
        ],
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.accountType).toBe("joint");
    jointAccount = res.body;
  });

  test("Create transaction on joint account by A", async () => {
    const res = await request(app)
      .post("/api/v1/transactions")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({
        accountId: jointAccount._id || jointAccount.id,
        amount: 150,
        type: "deposit",
        currency: "USD",
        description: "Initial joint funding",
        category: "deposit",
      });
    expect(res.statusCode).toBe(201);

    // Check account balance updated
    const acc = await request(app)
      .get(`/api/v1/accounts/${jointAccount._id || jointAccount.id}`)
      .set("Authorization", `Bearer ${tokenA}`);
    expect(acc.statusCode).toBe(200);
    expect(Number(acc.body.balance)).toBeGreaterThanOrEqual(150);
  });

  test("Transfer from joint account to Bob account (instant)", async () => {
    const res = await request(app)
      .post("/api/v1/transfers")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({
        fromAccountId: jointAccount._id || jointAccount.id,
        toAccountId: accountB._id || accountB.id,
        amount: 50,
        currency: "USD",
        type: "instant",
        description: "Pay Bob",
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe("completed");

    // Check balances
    const jointAcc = await request(app)
      .get(`/api/v1/accounts/${jointAccount._id || jointAccount.id}`)
      .set("Authorization", `Bearer ${tokenA}`);
    expect(jointAcc.statusCode).toBe(200);
    const bAcc = await request(app)
      .get(`/api/v1/accounts/${accountB._id || accountB.id}`)
      .set("Authorization", `Bearer ${tokenB}`);
    expect(bAcc.statusCode).toBe(200);
    expect(Number(bAcc.body.balance)).toBeGreaterThanOrEqual(250);
  });

  test("Cards CRUD for A", async () => {
    const create = await request(app)
      .post("/api/v1/cards")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({
        cardType: "virtual",
        cardNumber: "4242424242424242",
        maskedNumber: "**** **** **** 4242",
        expiryMonth: 12,
        expiryYear: 2030,
        cvv: "123",
        cardholderName: "Alice A",
      });
    expect(create.statusCode).toBe(201);
    const list = await request(app)
      .get("/api/v1/cards")
      .set("Authorization", `Bearer ${tokenA}`);
    expect(list.statusCode).toBe(200);
    expect(Array.isArray(list.body)).toBe(true);
    expect(list.body.length).toBeGreaterThanOrEqual(1);
  });

  test("Savings goal create and deposit", async () => {
    const create = await request(app)
      .post("/api/v1/savings")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({
        name: "Vacation",
        targetAmount: 1000,
        currency: "USD",
        deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
        category: "travel",
      });
    expect(create.statusCode).toBe(201);
    const goalId = create.body._id || create.body.id;
    const deposit = await request(app)
      .post(`/api/v1/savings/${goalId}/deposit`)
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ amount: 100 });
    expect(deposit.statusCode).toBe(200);
    expect(Number(deposit.body.currentAmount)).toBeGreaterThanOrEqual(100);
  });

  test("Payment methods CRUD", async () => {
    const create = await request(app)
      .post("/api/v1/payment-methods")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({
        type: "card",
        name: "Alice Card",
        cardDetails: {
          last4: "4242",
          brand: "Visa",
          expiryMonth: 12,
          expiryYear: 2030,
        },
      });
    expect(create.statusCode).toBe(201);
    const list = await request(app)
      .get("/api/v1/payment-methods")
      .set("Authorization", `Bearer ${tokenA}`);
    expect(list.statusCode).toBe(200);
    expect(Array.isArray(list.body)).toBe(true);
    expect(list.body.length).toBeGreaterThanOrEqual(1);
  });

  test("Notifications list and mark read", async () => {
    // create notification directly
    const note = await Notification.create({
      user: userA.id || userA._id,
      type: "system",
      title: "Welcome",
      message: "Welcome to Quant Fin Suite",
    });
    const list = await request(app)
      .get("/api/v1/notifications")
      .set("Authorization", `Bearer ${tokenA}`);
    expect(list.statusCode).toBe(200);
    expect(Array.isArray(list.body)).toBe(true);
    const mark = await request(app)
      .post(`/api/v1/notifications/${note._id || note.id}/read`)
      .set("Authorization", `Bearer ${tokenA}`);
    expect(mark.statusCode).toBe(200);
    expect(mark.body.status).toBe("read");
  });

  test("Users list", async () => {
    const res = await request(app)
      .get("/api/v1/users")
      .set("Authorization", `Bearer ${tokenA}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(2);
  });
});
