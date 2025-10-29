import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import {
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Send,
  Plus,
  TrendingUp,
  PieChart,
  Bell,
  Wallet,
  CreditCard,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

interface AccountData {
  name: string;
  accountType: string;
  currency: string;
  secondaryOwnerEmail?: string;
  secondaryOwnerPermissions?: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState<any[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [userName, setUserName] = useState<string>();
  const [stats, setStats] = useState<any>();
  const [loading, setLoading] = useState(true);
  const [showAddFunds, setShowAddFunds] = useState(false);
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [addFundsData, setAddFundsData] = useState({
    accountId: "",
    amount: "",
    method: "bank_transfer",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: "",
    saveCard: false,
  });
  const [newAccountData, setNewAccountData] = useState({
    name: "",
    type: "checking",
    secondaryOwnerEmail: "",
    secondaryOwnerPermissions: "full",
  });

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.getAccounts(),
      api.getTransactionsForUser(),
      api.me(),
      api.getMonthlyStatistics(),
    ])
      .then(([accountsRes, transactionsRes, userRes, statsRes]) => {
        console.log("Dashboard data loaded:", {
          accountsRes,
          transactionsRes,
          userRes,
          statsRes,
        });
        setAccounts(accountsRes || []);
        setRecentTransactions((transactionsRes || []).slice(0, 5));
        setUserName(userRes.user?.firstName || userRes.firstName);
        setStats(statsRes || {
          currentMonth: { income: 0, expenses: 0, savingsRate: "0.0" },
          changes: { income: "0.0", expenses: "0.0", savingsRate: "0.0" }
        });
      })
      .catch((error) => {
        console.error("Failed to fetch dashboard data:", error);
        // Set fallback data to prevent UI crashes
        setAccounts([]);
        setRecentTransactions([]);
        setStats({
          totalIncome: 0,
          totalExpenses: 0,
          monthlyBudget: 0,
          savingsGoal: 0,
        });
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const totalBalance = accounts.reduce(
    (sum, acc) => sum + (acc.balance || 0),
    0
  );
  const monthlyIncome = stats?.currentMonth?.income || 0;
  const monthlyExpenses = stats?.currentMonth?.expenses || 0;
  const savingsRate = parseFloat(stats?.currentMonth?.savingsRate || "0");
  const changes = {
    income: parseFloat(stats?.changes?.income || "0"),
    expenses: parseFloat(stats?.changes?.expenses || "0"),
    savingsRate: parseFloat(stats?.changes?.savingsRate || "0"),
    balance: 2.5, // TODO: Calculate from account history
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6 max-w-7xl mx-auto"
      >
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-1">
              Welcome back, {userName || "User"}
            </h1>
            <p className="text-muted-foreground">
              Here's your financial overview for{" "}
              {new Date().toLocaleString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="sm">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </Button>
            <Button variant="default" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Transaction
            </Button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Wallet className="h-6 w-6 text-primary" />
              </div>
              <TrendingUp className="h-4 w-4 text-success" />
            </div>
            <p className="text-sm text-muted-foreground">Total Balance</p>
            <h3 className="text-2xl font-bold">
              ${totalBalance.toLocaleString()}
            </h3>
            <p
              className={`text-xs ${
                changes.balance >= 0 ? "text-success" : "text-destructive"
              } mt-2`}
            >
              {changes.balance >= 0 ? "+" : ""}
              {changes.balance}% from last month
            </p>
          </Card>

          <Card className="p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-success/10 rounded-lg">
                <ArrowDownRight className="h-6 w-6 text-success" />
              </div>
              <TrendingUp className="h-4 w-4 text-success" />
            </div>
            <p className="text-sm text-muted-foreground">Monthly Income</p>
            <h3 className="text-2xl font-bold">
              ${monthlyIncome.toLocaleString()}
            </h3>
            <p
              className={`text-xs ${
                changes.income >= 0 ? "text-success" : "text-destructive"
              } mt-2`}
            >
              {changes.income >= 0 ? "+" : ""}
              {changes.income}% from last month
            </p>
          </Card>

          <Card className="p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-destructive/10 rounded-lg">
                <ArrowUpRight className="h-6 w-6 text-destructive" />
              </div>
              <TrendingUp className="h-4 w-4 text-destructive" />
            </div>
            <p className="text-sm text-muted-foreground">Monthly Expenses</p>
            <h3 className="text-2xl font-bold">
              ${monthlyExpenses.toLocaleString()}
            </h3>
            <p
              className={`text-xs ${
                changes.expenses <= 0 ? "text-success" : "text-destructive"
              } mt-2`}
            >
              {changes.expenses >= 0 ? "+" : ""}
              {changes.expenses}% from last month
            </p>
          </Card>

          <Card className="p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <PieChart className="h-6 w-6 text-blue-500" />
              </div>
              <TrendingUp className="h-4 w-4 text-success" />
            </div>
            <p className="text-sm text-muted-foreground">Savings Rate</p>
            <h3 className="text-2xl font-bold">{savingsRate.toFixed(1)}%</h3>
            <p
              className={`text-xs ${
                changes.savingsRate >= 0 ? "text-success" : "text-destructive"
              } mt-2`}
            >
              {changes.savingsRate >= 0 ? "+" : ""}
              {changes.savingsRate}% from last month
            </p>
          </Card>
        </div>

        {/* Total Balance Card */}
        <Card className="p-8 bg-gradient-primary text-white shadow-elegant">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg opacity-90">Total Balance</h2>
            <Eye className="h-5 w-5 opacity-90" />
          </div>
          <div className="text-4xl font-bold mb-6">
            $
            {totalBalance.toLocaleString("en-GB", { minimumFractionDigits: 2 })}
          </div>
          <div className="flex gap-3">
            <Link to="/transfer" className="flex-1">
              <Button variant="secondary" className="w-full">
                <Send className="h-4 w-4 mr-2" />
                Send Money
              </Button>
            </Link>
            <Dialog open={showAddFunds} onOpenChange={setShowAddFunds}>
              <DialogTrigger asChild>
                <Button variant="secondary">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Funds
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Funds to Account</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="account">Select Account</Label>
                    <Select
                      value={addFundsData.accountId}
                      onValueChange={(value) =>
                        setAddFundsData({ ...addFundsData, accountId: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose account" />
                      </SelectTrigger>
                      <SelectContent>
                        {accounts.length === 0 ? (
                          <SelectItem value="" disabled>
                            No accounts available
                          </SelectItem>
                        ) : (
                          accounts.map((account) => (
                            <SelectItem
                              key={account._id || account.id}
                              value={account._id || account.id}
                            >
                              {account.name} -$
                              {(account.balance || 0).toLocaleString("en-GB", {
                                minimumFractionDigits: 2,
                              })}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="amount">Amount</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        $
                      </span>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        value={addFundsData.amount}
                        onChange={(e) =>
                          setAddFundsData({
                            ...addFundsData,
                            amount: e.target.value,
                          })
                        }
                        placeholder="0.00"
                        className="pl-7"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="method">Funding Method</Label>
                    <Select
                      value={addFundsData.method}
                      onValueChange={(value) =>
                        setAddFundsData({ ...addFundsData, method: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bank_transfer">
                          Bank Transfer
                        </SelectItem>
                        <SelectItem value="debit_card">Debit Card</SelectItem>
                        <SelectItem value="wire_transfer">
                          Wire Transfer
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {addFundsData.method === "debit_card" && (
                    <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
                      <h4 className="font-medium">Card Details</h4>
                      <div>
                        <Label htmlFor="cardholderName">Cardholder Name</Label>
                        <Input
                          id="cardholderName"
                          value={addFundsData.cardholderName}
                          onChange={(e) =>
                            setAddFundsData({
                              ...addFundsData,
                              cardholderName: e.target.value,
                            })
                          }
                          placeholder="John Doe"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="cardNumber">Card Number</Label>
                        <Input
                          id="cardNumber"
                          value={addFundsData.cardNumber}
                          onChange={(e) => {
                            const value = e.target.value
                              .replace(/\s/g, "")
                              .replace(/(.{4})/g, "$1 ")
                              .trim();
                            if (value.replace(/\s/g, "").length <= 16) {
                              setAddFundsData({
                                ...addFundsData,
                                cardNumber: value,
                              });
                            }
                          }}
                          placeholder="1234 5678 9012 3456"
                          maxLength={19}
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="expiryDate">Expiry Date</Label>
                          <Input
                            id="expiryDate"
                            value={addFundsData.expiryDate}
                            onChange={(e) => {
                              let value = e.target.value.replace(/\D/g, "");
                              if (value.length >= 2) {
                                value =
                                  value.substring(0, 2) +
                                  "/" +
                                  value.substring(2, 4);
                              }
                              setAddFundsData({
                                ...addFundsData,
                                expiryDate: value,
                              });
                            }}
                            placeholder="MM/YY"
                            maxLength={5}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="cvv">CVV</Label>
                          <Input
                            id="cvv"
                            type="password"
                            value={addFundsData.cvv}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, "");
                              if (value.length <= 4) {
                                setAddFundsData({
                                  ...addFundsData,
                                  cvv: value,
                                });
                              }
                            }}
                            placeholder="123"
                            maxLength={4}
                            required
                          />
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="saveCard"
                          checked={addFundsData.saveCard}
                          onCheckedChange={(checked) =>
                            setAddFundsData({
                              ...addFundsData,
                              saveCard: !!checked,
                            })
                          }
                        />
                        <Label htmlFor="saveCard" className="text-sm">
                          Save card for future payments
                        </Label>
                      </div>
                    </div>
                  )}

                  <Button
                    className="w-full"
                    onClick={async () => {
                      try {
                        // Validate required fields
                        if (!addFundsData.accountId || !addFundsData.amount) {
                          toast.error("Please fill in all required fields");
                          return;
                        }

                        if (addFundsData.method === "debit_card") {
                          if (
                            !addFundsData.cardNumber ||
                            !addFundsData.expiryDate ||
                            !addFundsData.cvv ||
                            !addFundsData.cardholderName
                          ) {
                            toast.error("Please fill in all card details");
                            return;
                          }

                          // Validate card number (basic Luhn algorithm check)
                          const cardNum = addFundsData.cardNumber.replace(
                            /\s/g,
                            ""
                          );
                          if (cardNum.length !== 16) {
                            toast.error(
                              "Please enter a valid 16-digit card number"
                            );
                            return;
                          }

                          // Validate expiry date
                          const [month, year] =
                            addFundsData.expiryDate.split("/");
                          const currentDate = new Date();
                          const expiryDate = new Date(
                            2000 + parseInt(year),
                            parseInt(month) - 1
                          );
                          if (expiryDate < currentDate) {
                            toast.error("Card has expired");
                            return;
                          }

                          // Simulate card processing
                          const isCardValid = Math.random() > 0.3; // 70% success rate for demo

                          if (!isCardValid) {
                            toast.error(
                              "Card transaction failed. Please check your card details or try a different payment method."
                            );
                            return;
                          }

                          // Save card if requested
                          if (addFundsData.saveCard) {
                            try {
                              // Simulate API call to save card
                              await new Promise((resolve) =>
                                setTimeout(resolve, 1000)
                              );
                              toast.success(
                                "Card saved successfully for future payments"
                              );
                            } catch (error) {
                              toast.error(
                                "Failed to save card details. Funds were added but card was not saved."
                              );
                            }
                          }
                        }

                        // Simulate different scenarios
                        const scenarios = [
                          {
                            success: true,
                            message: "Funds added successfully!",
                          },
                          {
                            success: false,
                            message:
                              "This action cannot be performed at the current moment. Please try again later.",
                          },
                          {
                            success: false,
                            message:
                              "Insufficient funds in the source account.",
                          },
                          {
                            success: false,
                            message:
                              "Daily limit exceeded. Please try again tomorrow.",
                          },
                        ];

                        const scenario =
                          scenarios[
                            Math.floor(Math.random() * scenarios.length)
                          ];

                        // Simulate processing delay
                        await new Promise((resolve) =>
                          setTimeout(resolve, 2000)
                        );

                        if (scenario.success) {
                          toast.success(scenario.message);
                          setShowAddFunds(false);
                          setAddFundsData({
                            accountId: "",
                            amount: "",
                            method: "bank_transfer",
                            cardNumber: "",
                            expiryDate: "",
                            cvv: "",
                            cardholderName: "",
                            saveCard: false,
                          });
                        } else {
                          toast.error(scenario.message);
                        }
                      } catch (error) {
                        toast.error(
                          "An unexpected error occurred. Please try again."
                        );
                      }
                    }}
                  >
                    Add Funds
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </Card>

        {/* Main Dashboard Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Accounts and Chart */}
          <div className="lg:col-span-2 space-y-6">
            {/* Accounts Section */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Your Accounts</h2>
                <Dialog open={showAddAccount} onOpenChange={setShowAddAccount}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Account
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Account</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="accountName">Account Name</Label>
                        <Input
                          id="accountName"
                          value={newAccountData.name}
                          onChange={(e) =>
                            setNewAccountData({
                              ...newAccountData,
                              name: e.target.value,
                            })
                          }
                          placeholder="e.g., Emergency Savings"
                        />
                      </div>
                      <div>
                        <Label htmlFor="accountType">Account Type</Label>
                        <Select
                          value={newAccountData.type}
                          onValueChange={(value) =>
                            setNewAccountData({
                              ...newAccountData,
                              type: value,
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="checking">
                              Checking Account
                            </SelectItem>
                            <SelectItem value="savings">
                              Savings Account
                            </SelectItem>
                            <SelectItem value="joint">Joint Account</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {newAccountData.type === "joint" && (
                        <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
                          <h4 className="font-medium">Joint Account Details</h4>
                          <p className="text-sm text-muted-foreground">
                            Joint accounts require at least one secondary owner
                          </p>
                          <div>
                            <Label htmlFor="secondaryOwnerEmail">
                              Secondary Owner Email
                            </Label>
                            <Input
                              id="secondaryOwnerEmail"
                              type="email"
                              value={newAccountData.secondaryOwnerEmail}
                              onChange={(e) =>
                                setNewAccountData({
                                  ...newAccountData,
                                  secondaryOwnerEmail: e.target.value,
                                })
                              }
                              placeholder="john.doe@example.com"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="secondaryOwnerPermissions">
                              Permissions
                            </Label>
                            <Select
                              value={newAccountData.secondaryOwnerPermissions}
                              onValueChange={(value) =>
                                setNewAccountData({
                                  ...newAccountData,
                                  secondaryOwnerPermissions: value,
                                })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="full">
                                  Full Access (View, Transact, Manage)
                                </SelectItem>
                                <SelectItem value="transact">
                                  Transact (View & Transfer)
                                </SelectItem>
                                <SelectItem value="view">View Only</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      )}
                      <Button
                        className="w-full"
                        onClick={async () => {
                          try {
                            // Validate required fields
                            if (!newAccountData.name) {
                              toast.error("Account name is required");
                              return;
                            }

                            // Validate joint account requirements
                            if (newAccountData.type === "joint") {
                              if (!newAccountData.secondaryOwnerEmail) {
                                toast.error(
                                  "Joint accounts must have at least one secondary owner"
                                );
                                return;
                              }

                              // Basic email validation
                              const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                              if (
                                !emailRegex.test(
                                  newAccountData.secondaryOwnerEmail
                                )
                              ) {
                                toast.error(
                                  "Please enter a valid email address for the secondary owner"
                                );
                                return;
                              }
                            }

                            // Create account via API
                            const accountData: AccountData = {
                              name: newAccountData.name,
                              accountType: newAccountData.type, // Use the type directly (checking, savings, joint)
                              currency: "USD",
                            };

                            // Add secondary owner for joint accounts
                            if (newAccountData.type === "joint") {
                              accountData.secondaryOwnerEmail =
                                newAccountData.secondaryOwnerEmail;
                              accountData.secondaryOwnerPermissions =
                                newAccountData.secondaryOwnerPermissions;
                            }

                            console.log("Frontend sending account data:", accountData);
                            console.log("Form data:", newAccountData);

                            const newAccount = await api.createAccount(accountData);

                            // Update accounts list
                            setAccounts((prev) => [...prev, newAccount]);

                            toast.success(
                              `Account "${newAccountData.name}" created successfully!`
                            );
                            setShowAddAccount(false);
                            setNewAccountData({
                              name: "",
                              type: "checking",
                              secondaryOwnerEmail: "",
                              secondaryOwnerPermissions: "full",
                            });
                          } catch (error) {
                            console.error("Account creation error:", error);
                            toast.error(
                              error.message ||
                                "Failed to create account. Please try again."
                            );
                          }
                        }}
                      >
                        Create Account
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {accounts.map((account, index) => (
                  <motion.div
                    key={account.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2 rounded-lg ${
                              account.type === "joint"
                                ? "bg-blue-500/10"
                                : account.type === "savings"
                                ? "bg-green-500/10"
                                : "bg-primary/10"
                            }`}
                          >
                            <CreditCard
                              className={`h-5 w-5 ${
                                account.type === "joint"
                                  ? "text-blue-500"
                                  : account.type === "savings"
                                  ? "text-green-500"
                                  : "text-primary"
                              }`}
                            />
                          </div>
                          <div>
                            <h3 className="font-semibold">{account.name}</h3>
                            <p className="text-sm text-muted-foreground capitalize">
                              {account.accountType || account.type}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => navigate(`/account/${account._id || account.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="mt-4">
                        <div className="text-2xl font-bold">
                          $
                          {(account.balance || 0).toLocaleString("en-GB", {
                            minimumFractionDigits: 2,
                          })}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Account ending in {account.accountNumber.slice(-4)}
                        </p>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column - Recent Transactions */}
          <div className="space-y-6">
            <section>
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Recent Transactions</h2>
                  <Link to="/transactions">
                    <Button variant="outline" size="sm">
                      View All
                    </Button>
                  </Link>
                </div>
                <div className="space-y-4">
                  {recentTransactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-full ${
                            transaction.type === "credit"
                              ? "bg-success/10"
                              : "bg-destructive/10"
                          }`}
                        >
                          {transaction.type === "credit" ? (
                            <ArrowDownRight className="h-4 w-4 text-success" />
                          ) : (
                            <ArrowUpRight className="h-4 w-4 text-destructive" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {transaction.description}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {transaction.date}
                          </p>
                        </div>
                      </div>
                      <div
                        className={`font-semibold ${
                          transaction.type === "credit"
                            ? "text-success"
                            : "text-destructive"
                        }`}
                      >
                        {transaction.type === "credit" ? "+" : "-"}$
                        {Math.abs(transaction.amount).toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                        })}
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4">
                  Load More
                </Button>
              </Card>

              {/* Quick Actions */}
              <Card className="p-6 mt-6">
                <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
                <div className="grid grid-cols-2 gap-3">
                  <Button className="w-full">
                    <Send className="h-4 w-4 mr-2" />
                    Transfer
                  </Button>
                  <Dialog open={showAddFunds} onOpenChange={setShowAddFunds}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Funds
                      </Button>
                    </DialogTrigger>
                  </Dialog>
                </div>
              </Card>
            </section>
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default Dashboard;
