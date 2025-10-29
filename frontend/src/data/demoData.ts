export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: "credit" | "debit";
  category: string;
  status: "completed" | "pending";
}

export interface Account {
  id: string;
  name: string;
  type: "checking" | "savings" | "joint";
  balance: number;
  accountNumber: string;
  currency: string;
  coOwners?: User[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  joinDate: string;
}

export const demoUser: User = {
  id: "1",
  name: "John Anderson",
  email: "john.anderson@example.com",
  phone: "+1 (555) 123-4567",
  avatar: "JA",
  joinDate: "2023-01-15",
};

export const demoAccounts: Account[] = [
  {
    id: "1",
    name: "Primary Checking",
    type: "checking",
    balance: 12458.5,
    accountNumber: "****4521",
    currency: "USD",
  },
  {
    id: "2",
    name: "Savings Account",
    type: "savings",
    balance: 28750.0,
    accountNumber: "****7832",
    currency: "USD",
  },
  {
    id: "3",
    name: "Joint Account",
    type: "joint",
    balance: 5420.75,
    accountNumber: "****2198",
    currency: "USD",
    coOwners: [
      {
        id: "1",
        name: "John Anderson",
        email: "john.anderson@example.com",
        phone: "+1 (555) 123-4567",
        avatar: "JA",
        joinDate: "2023-01-15",
      },
      {
        id: "2",
        name: "Sarah Johnson",
        email: "sarah.johnson@example.com",
        phone: "+1 (555) 987-6543",
        avatar: "SJ",
        joinDate: "2023-02-10",
      },
    ],
  },
  {
    id: "4",
    name: "Family Joint",
    type: "joint",
    balance: 15680.25,
    accountNumber: "****3344",
    currency: "USD",
    coOwners: [
      {
        id: "1",
        name: "John Anderson",
        email: "john.anderson@example.com",
        phone: "+1 (555) 123-4567",
        avatar: "JA",
        joinDate: "2023-01-15",
      },
      {
        id: "3",
        name: "Emily Davis",
        email: "emily.davis@example.com",
        phone: "+1 (555) 222-3333",
        avatar: "ED",
        joinDate: "2023-03-05",
      },
      {
        id: "4",
        name: "David Wilson",
        email: "david.wilson@example.com",
        phone: "+1 (555) 444-5555",
        avatar: "DW",
        joinDate: "2023-04-12",
      },
    ],
  },
];

export const demoTransactions: Transaction[] = [
  {
    id: "1",
    date: "2025-10-22",
    description: "Amazon.com Purchase",
    amount: -89.99,
    type: "debit",
    category: "Shopping",
    status: "completed",
  },
  {
    id: "2",
    date: "2025-10-21",
    description: "Salary Deposit",
    amount: 4250.0,
    type: "credit",
    category: "Income",
    status: "completed",
  },
  {
    id: "3",
    date: "2025-10-20",
    description: "Netflix Subscription",
    amount: -15.99,
    type: "debit",
    category: "Entertainment",
    status: "completed",
  },
  {
    id: "4",
    date: "2025-10-19",
    description: "Grocery Store",
    amount: -142.5,
    type: "debit",
    category: "Food",
    status: "completed",
  },
  {
    id: "5",
    date: "2025-10-18",
    description: "Transfer from Sarah",
    amount: 200.0,
    type: "credit",
    category: "Transfer",
    status: "completed",
  },
  {
    id: "6",
    date: "2025-10-17",
    description: "Electricity Bill",
    amount: -125.0,
    type: "debit",
    category: "Utilities",
    status: "completed",
  },
  {
    id: "7",
    date: "2025-10-16",
    description: "ATM Withdrawal",
    amount: -200.0,
    type: "debit",
    category: "Cash",
    status: "completed",
  },
  {
    id: "8",
    date: "2025-10-15",
    description: "Freelance Payment",
    amount: 850.0,
    type: "credit",
    category: "Income",
    status: "completed",
  },
  {
    id: "9",
    date: "2025-10-14",
    description: "Restaurant",
    amount: -65.25,
    type: "debit",
    category: "Food",
    status: "completed",
  },
  {
    id: "10",
    date: "2025-10-13",
    description: "Gas Station",
    amount: -55.0,
    type: "debit",
    category: "Transportation",
    status: "completed",
  },
  {
    id: "11",
    date: "2025-10-12",
    description: "Mobile Payment - Pending",
    amount: -45.0,
    type: "debit",
    category: "Bills",
    status: "pending",
  },
];

export const demoContacts = [
  { id: "1", name: "Sarah Johnson", account: "****1234", avatar: "SJ" },
  { id: "2", name: "Michael Chen", account: "****5678", avatar: "MC" },
  { id: "3", name: "Emily Davis", account: "****9012", avatar: "ED" },
  { id: "4", name: "David Wilson", account: "****3456", avatar: "DW" },
];
