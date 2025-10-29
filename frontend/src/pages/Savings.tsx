import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form } from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import * as api from "@/lib/api";
import {
  PiggyBank,
  Plus,
  TrendingUp,
  Target,
  Sparkles,
  Wallet,
  ArrowDownRight,
  Clock,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";

type SavingsGoal = {
  _id: string;
  name: string;
  currentAmount: number;
  targetAmount: number;
  progress: number;
  autoSave: {
    amount: number;
    frequency: string;
    enabled: boolean;
  };
  deadline: string;
  category: string;
  status: string;
};

type Account = {
  _id: string;
  name: string;
  balance: number;
  updatedAt: string;
  accountType: string;
  status: string;
  limitations?: {
    withdrawalsEnabled?: boolean;
    withdrawalLimit?: number;
  };
};

const Savings = () => {
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showNewGoalDialog, setShowNewGoalDialog] = useState(false);
  const [showNewAccountDialog, setShowNewAccountDialog] = useState(false);
  const [depositDialog, setDepositDialog] = useState<{
    show: boolean;
    goalId: string | null;
  }>({
    show: false,
    goalId: null,
  });
  const [depositAmount, setDepositAmount] = useState("");

  const [newGoal, setNewGoal] = useState({
    name: "",
    targetAmount: "",
    category: "",
    deadline: "",
    autoSave: {
      enabled: false,
      amount: "",
      frequency: "monthly",
    },
  });

  const [newAccount, setNewAccount] = useState({
    name: "",
    accountType: "savings",
    currency: "USD",
    secondaryOwnerEmail: "",
    secondaryOwnerPermissions: "full"
  });

  const { toast: toastHook } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [goalsData, accountsData] = await Promise.all([
          api.getSavings(),
          api.getAccounts(),
        ]);
        setGoals(goalsData);
        setAccounts(accountsData);
        setError("");
      } catch (err) {
        setError(err.message || "Failed to load data");
        toastHook({
          title: "Error",
          description: "Failed to load savings data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [toastHook]);

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const goal = await api.createSavings({
        ...newGoal,
        targetAmount: parseFloat(newGoal.targetAmount),
        autoSave: {
          ...newGoal.autoSave,
          amount: parseFloat(newGoal.autoSave.amount),
        },
      });
      setGoals((prev) => [...prev, goal]);
      setShowNewGoalDialog(false);
      toastHook({
        title: "Success",
        description: "Savings goal created",
      });
    } catch (err) {
      toastHook({
        title: "Error",
        description: err.message || "Failed to create goal",
        variant: "destructive",
      });
    }
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Validate required fields
      if (!newAccount.name) {
        toast.error("Account name is required");
        return;
      }
      
      // Validate joint account requirements
      if (newAccount.accountType === "joint") {
        if (!newAccount.secondaryOwnerEmail) {
          toast.error("Joint accounts must have at least one secondary owner");
          return;
        }
        
        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(newAccount.secondaryOwnerEmail)) {
          toast.error("Please enter a valid email address for the secondary owner");
          return;
        }
      }
      
      const accountData: any = {
        name: newAccount.name,
        accountType: newAccount.accountType,
        currency: newAccount.currency
      };
      
      // Add secondary owner for joint accounts
      if (newAccount.accountType === "joint") {
        accountData.secondaryOwnerEmail = newAccount.secondaryOwnerEmail;
        accountData.secondaryOwnerPermissions = newAccount.secondaryOwnerPermissions;
      }
      
      console.log("Creating savings account:", accountData);
      
      const account = await api.createAccount(accountData);
      setAccounts((prev) => [...prev, account]);
      setShowNewAccountDialog(false);
      setNewAccount({
        name: "",
        accountType: "savings",
        currency: "USD",
        secondaryOwnerEmail: "",
        secondaryOwnerPermissions: "full"
      });
      toast.success(`Savings account "${newAccount.name}" created successfully!`);
    } catch (err) {
      console.error("Account creation error:", err);
      toast.error(err.message || "Failed to create account. Please try again.");
    }
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositDialog.goalId) return;

    try {
      const updatedGoal = await api.depositSavings(depositDialog.goalId, {
        amount: parseFloat(depositAmount),
      });
      setGoals((prev) =>
        prev.map((g) => (g._id === updatedGoal._id ? updatedGoal : g))
      );
      setDepositDialog({ show: false, goalId: null });
      setDepositAmount("");
      toastHook({
        title: "Success",
        description: "Deposit successful",
      });
    } catch (err) {
      toastHook({
        title: "Error",
        description: err.message || "Failed to deposit",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </DashboardLayout>
    );
  }

  const totalSavings = accounts.reduce((sum, acc) => sum + acc.balance, 0);
  const monthlyContributions = goals.reduce(
    (sum, goal) => sum + (goal.autoSave?.enabled ? goal.autoSave.amount : 0),
    0
  );

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
            <h1 className="text-3xl font-bold mb-1">Savings & Goals</h1>
            <p className="text-muted-foreground">
              Track your savings progress and manage your financial goals
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowNewAccountDialog(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Account
            </Button>
            <Button onClick={() => setShowNewGoalDialog(true)}>
              <Target className="h-4 w-4 mr-2" />
              Set New Goal
            </Button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <PiggyBank className="h-6 w-6 text-primary" />
              </div>
              <TrendingUp className="h-4 w-4 text-success" />
            </div>
            <p className="text-sm text-muted-foreground">Total Savings</p>
            <h3 className="text-2xl font-bold">
              ${totalSavings.toLocaleString()}
            </h3>
            <p className="text-xs text-success mt-2">Updated just now</p>
          </Card>

          <Card className="p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Target className="h-6 w-6 text-blue-500" />
              </div>
              <Sparkles className="h-4 w-4 text-blue-500" />
            </div>
            <p className="text-sm text-muted-foreground">Active Goals</p>
            <h3 className="text-2xl font-bold">
              {goals.filter((g) => g.status === "active").length}
            </h3>
            <p className="text-xs text-blue-500 mt-2">
              {goals.filter((g) => g.progress >= 80).length} goals near
              completion
            </p>
          </Card>

          <Card className="p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-success/10 rounded-lg">
                <Wallet className="h-6 w-6 text-success" />
              </div>
              <ArrowDownRight className="h-4 w-4 text-success" />
            </div>
            <p className="text-sm text-muted-foreground">Monthly Savings</p>
            <h3 className="text-2xl font-bold">
              ${monthlyContributions.toLocaleString()}
            </h3>
            <p className="text-xs text-success mt-2">Auto-save enabled</p>
          </Card>
        </div>

        {/* Savings Goals Section */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Your Savings Goals</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {goals.map((goal) => (
              <div key={goal._id}>
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500/10 rounded-lg">
                        <Target className="h-5 w-5 text-blue-500" />
                      </div>
                      <h3 className="font-semibold">{goal.name}</h3>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() =>
                        setDepositDialog({ show: true, goalId: goal._id })
                      }
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">
                        {goal.progress.toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all"
                        style={{ width: `${goal.progress}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-sm mt-2">
                      <span className="text-muted-foreground">Current</span>
                      <span className="font-medium">
                        ${goal.currentAmount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Target</span>
                      <span className="font-medium">
                        ${goal.targetAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t">
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{goal.autoSave.frequency}</span>
                      </div>
                      <span className="font-semibold text-primary">
                        ${goal.autoSave.amount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </section>

        {/* Savings Accounts Section */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Your Savings Accounts</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {accounts.map((account) => (
              <Card key={account._id} className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <PiggyBank className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{account.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Last updated:{" "}
                        {new Date(account.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        Withdrawals
                      </span>
                      <Switch
                        checked={
                          account.limitations?.withdrawalsEnabled ?? true
                        }
                        onCheckedChange={async (val) => {
                          try {
                            // send update to backend
                            const updated = await api.setAccountWithdrawals(
                              account._id,
                              !!val
                            );
                            // update local state
                            setAccounts((prev) =>
                              prev.map((a) =>
                                a._id === updated._id ? updated : a
                              )
                            );
                            toast({
                              title: "Success",
                              description: `Withdrawals ${
                                updated.limitations.withdrawalsEnabled
                                  ? "enabled"
                                  : "disabled"
                              }`,
                            });
                          } catch (err) {
                            toast({
                              title: "Error",
                              description:
                                err.message || "Failed to update setting",
                              variant: "destructive",
                            });
                          }
                        }}
                      />
                    </div>

                    <Button variant="outline" size="sm">
                      Manage
                    </Button>
                  </div>
                </div>

                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Balance
                    </p>
                    <p className="text-2xl font-bold">
                      ${account.balance.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground mb-1">
                      Account Type
                    </p>
                    <p className="text-success font-semibold">
                      {account.accountType}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>
      </motion.div>

      {/* New Goal Dialog */}
      <Dialog open={showNewGoalDialog} onOpenChange={setShowNewGoalDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Savings Goal</DialogTitle>
            <DialogDescription>
              Set up a new savings goal with auto-save options
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateGoal} className="space-y-4">
            <div>
              <Label htmlFor="name">Goal Name</Label>
              <Input
                id="name"
                value={newGoal.name}
                onChange={(e) =>
                  setNewGoal((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="e.g., Emergency Fund"
              />
            </div>

            <div>
              <Label htmlFor="targetAmount">Target Amount ($)</Label>
              <Input
                id="targetAmount"
                type="number"
                value={newGoal.targetAmount}
                onChange={(e) =>
                  setNewGoal((prev) => ({
                    ...prev,
                    targetAmount: e.target.value,
                  }))
                }
                placeholder="10000"
              />
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={newGoal.category}
                onChange={(e) =>
                  setNewGoal((prev) => ({ ...prev, category: e.target.value }))
                }
                placeholder="e.g., Emergency"
              />
            </div>

            <div>
              <Label htmlFor="deadline">Target Date</Label>
              <Input
                id="deadline"
                type="date"
                value={newGoal.deadline}
                onChange={(e) =>
                  setNewGoal((prev) => ({ ...prev, deadline: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Auto-Save Options</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={newGoal.autoSave.amount}
                  onChange={(e) =>
                    setNewGoal((prev) => ({
                      ...prev,
                      autoSave: {
                        ...prev.autoSave,
                        amount: e.target.value,
                        enabled: true,
                      },
                    }))
                  }
                  placeholder="Monthly amount"
                />
                <select
                  className="border rounded p-2"
                  value={newGoal.autoSave.frequency}
                  onChange={(e) =>
                    setNewGoal((prev) => ({
                      ...prev,
                      autoSave: { ...prev.autoSave, frequency: e.target.value },
                    }))
                  }
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            </div>

            <DialogFooter>
              <Button type="submit">Create Goal</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* New Account Dialog */}
      <Dialog
        open={showNewAccountDialog}
        onOpenChange={setShowNewAccountDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Savings Account</DialogTitle>
            <DialogDescription>Set up a new savings account</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateAccount} className="space-y-4">
            <div>
              <Label htmlFor="accountName">Account Name</Label>
              <Input
                id="accountName"
                value={newAccount.name}
                onChange={(e) =>
                  setNewAccount((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="e.g., High Yield Savings"
                required
              />
            </div>

            <div>
              <Label htmlFor="accountType">Account Type</Label>
              <Select
                value={newAccount.accountType}
                onValueChange={(value) =>
                  setNewAccount((prev) => ({ ...prev, accountType: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="savings">Savings Account</SelectItem>
                  <SelectItem value="checking">Checking Account</SelectItem>
                  <SelectItem value="joint">Joint Account</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="currency">Currency</Label>
              <Select
                value={newAccount.currency}
                onValueChange={(value) =>
                  setNewAccount((prev) => ({ ...prev, currency: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {newAccount.accountType === "joint" && (
              <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
                <h4 className="font-medium">Joint Account Details</h4>
                <p className="text-sm text-muted-foreground">
                  Joint accounts require at least one secondary owner
                </p>
                <div>
                  <Label htmlFor="secondaryOwnerEmail">Secondary Owner Email</Label>
                  <Input
                    id="secondaryOwnerEmail"
                    type="email"
                    value={newAccount.secondaryOwnerEmail}
                    onChange={(e) =>
                      setNewAccount((prev) => ({ ...prev, secondaryOwnerEmail: e.target.value }))
                    }
                    placeholder="john.doe@example.com"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="secondaryOwnerPermissions">Permissions</Label>
                  <Select
                    value={newAccount.secondaryOwnerPermissions}
                    onValueChange={(value) =>
                      setNewAccount((prev) => ({ ...prev, secondaryOwnerPermissions: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full">Full Access (View, Transact, Manage)</SelectItem>
                      <SelectItem value="transact">Transact (View & Transfer)</SelectItem>
                      <SelectItem value="view">View Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button type="submit">Create Savings Account</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Deposit Dialog */}
      <Dialog
        open={depositDialog.show}
        onOpenChange={(open) =>
          setDepositDialog((prev) => ({ ...prev, show: open }))
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Make a Deposit</DialogTitle>
            <DialogDescription>
              Add funds to your savings goal
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleDeposit} className="space-y-4">
            <div>
              <Label htmlFor="amount">Amount ($)</Label>
              <Input
                id="amount"
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>

            <DialogFooter>
              <Button type="submit">Deposit</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Savings;
