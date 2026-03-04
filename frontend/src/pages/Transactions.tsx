import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight, Search, Filter } from "lucide-react";
import { useState, useEffect } from "react";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  formatErrorToast,
  getSuggestedActions,
} from "@/lib/withdrawalErrors";
import withdrawalApi from "@/lib/withdrawalApi";
import { isRecoverableError } from "@/lib/withdrawalErrors";

const Transactions = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<
    "all" | "credit" | "debit" | "joint"
  >("all");

  const [transactions, setTransactions] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
  const [withdrawAccountId, setWithdrawAccountId] = useState<string>("",
  );
  const [withdrawAmount, setWithdrawAmount] = useState<string>("");
  const [withdrawCurrency, setWithdrawCurrency] = useState<string>("USD");
  const [withdrawDescription, setWithdrawDescription] = useState<string>("");
  const [withdrawCategory, setWithdrawCategory] = useState<string>("Withdrawal");
  const { toast } = useToast();

  useEffect(() => {
    Promise.all([api.getAccounts(), api.getTransactionsForUser()])
      .then(([accountRes, txRes]) => {
        setAccounts(accountRes || []);
        const sorted = (txRes || []).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setTransactions(sorted);
      })
      .catch((error) => {
        toast({
          title: "Error",
          description: "Failed to load transactions",
          variant: "destructive",
        });
        console.error("Failed to load transactions:", error);
      });
  }, [toast]);

  useEffect(() => {
    // default selected account for withdrawal when accounts load
    if (accounts.length && !withdrawAccountId) {
      setWithdrawAccountId(accounts[0]._id || accounts[0].id);
    }
  }, [accounts, withdrawAccountId]);

  const jointAccountIds = accounts
    .filter((a: any) => a.accountType === "joint")
    .map((a: any) => a._id || a.id);

  const transactionsWithAccount = transactions.map((t, i) => ({
    ...t,
    accountId:
      t.metadata?.account ||
      jointAccountIds[i % Math.max(1, jointAccountIds.length)],
    isJoint: jointAccountIds.includes(t.metadata?.account) || false,
  }));

  const filteredTransactions = transactionsWithAccount.filter((t) => {
    const matchesSearch = t.description
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesType =
      filterType === "all" ||
      t.type === filterType ||
      (filterType === "joint" && t.isJoint);
    return matchesSearch && matchesType;
  });

  const handleCreateWithdrawal = async () => {
    if (!withdrawAccountId) {
      toast({ title: "Error", description: "Select an account", variant: "destructive" });
      return;
    }
    const amt = parseFloat(withdrawAmount);
    if (isNaN(amt) || amt <= 0) {
      toast({ title: "Invalid amount", description: "Enter an amount greater than 0", variant: "destructive" });
      return;
    }

    try {
      const res = await withdrawalApi.createWithdrawal(
        withdrawAccountId,
        amt,
        withdrawCurrency,
        withdrawDescription,
        withdrawCategory
      );

      if (res.success) {
        toast({ title: "Withdrawal submitted", description: "Your withdrawal was processed.", variant: "default" });
        // refresh transactions
        const txs = await api.getTransactionsForUser();
        setTransactions((txs || []).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        setWithdrawDialogOpen(false);
        setWithdrawAmount("");
        setWithdrawDescription("");
      } else {
        // show tailored error toast
        toast(formatErrorToast(res.error as any));
        if (isRecoverableError(res.error as any)) {
          const suggested = getSuggestedActions(res.error as any);
          toast({ title: "Next steps", description: suggested.join(" • "), variant: "default" });
        }
      }
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to create withdrawal", variant: "destructive" });
    }
  };

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Transaction History</h1>
            <p className="text-muted-foreground">View and manage all your transactions</p>
          </div>
          <div className="pt-2">
            <Button onClick={() => setWithdrawDialogOpen(true)} size="sm">
              New Withdrawal
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterType === "all" ? "default" : "outline"}
                onClick={() => setFilterType("all")}
                size="sm"
              >
                All
              </Button>
              <Button
                variant={filterType === "credit" ? "default" : "outline"}
                onClick={() => setFilterType("credit")}
                size="sm"
              >
                Income
              </Button>
              <Button
                variant={filterType === "debit" ? "default" : "outline"}
                onClick={() => setFilterType("debit")}
                size="sm"
              >
                Expenses
              </Button>
              <Button
                variant={filterType === "joint" ? "default" : "outline"}
                onClick={() => setFilterType("joint")}
                size="sm"
              >
                Joint Accounts
              </Button>
            </div>
          </div>
        </Card>

        {/* Transactions List */}
        <Card>
          <div className="divide-y divide-border">
            {filteredTransactions.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                No transactions found
              </div>
            ) : (
              filteredTransactions.map((transaction, index) => {
                const account = accounts.find(
                  (a) => a._id === transaction.metadata?.account
                );
                return (
                  <motion.div
                    key={transaction._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`p-4 flex items-center justify-between hover:bg-muted/50 transition-colors cursor-pointer ${
                      transaction.isJoint ? "border-l-4 border-primary" : ""
                    }`}
                    onClick={() => {
                      setSelectedTransaction(transaction);
                      setDialogOpen(true);
                    }}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div
                        className={`p-3 rounded-full ${
                          transaction.type === "credit"
                            ? "bg-success/10"
                            : "bg-muted"
                        }`}
                      >
                        {transaction.type === "credit" ? (
                          <ArrowDownRight className="h-5 w-5 text-success" />
                        ) : (
                          <ArrowUpRight className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium">{transaction.description}</p>
                          <Badge
                            variant={
                              transaction.status === "completed"
                                ? "secondary"
                                : "outline"
                            }
                            className="text-xs"
                          >
                            {transaction.status}
                          </Badge>
                          {transaction.isJoint && account && (
                            <Badge variant="secondary" className="text-xs">
                              Joint
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span>
                            {new Date(transaction.createdAt).toLocaleDateString()}
                          </span>
                          <span>•</span>
                          <span>{transaction.category}</span>
                          {transaction.isJoint && account?.secondaryOwners && (
                            <span className="ml-2 flex gap-1 items-center">
                              Co-owners:
                              {account.secondaryOwners.map(
                                (owner: any, idx: number) => (
                                  <span
                                    key={idx}
                                    className="bg-primary/10 rounded px-1 text-xs font-semibold"
                                  >
                                    {owner.firstName?.[0] || owner.email?.[0]}
                                  </span>
                                )
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div
                      className={`text-lg font-semibold ${
                        transaction.type === "credit"
                          ? "text-success"
                          : "text-foreground"
                      }`}
                    >
                      {transaction.type === "credit" ? "+" : ""}
                      {transaction.currency}
                      {Math.abs(transaction.amount).toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                      })}
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </Card>
      </motion.div>

      <Dialog open={withdrawDialogOpen} onOpenChange={setWithdrawDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Withdrawal</DialogTitle>
            <DialogDescription>Withdraw funds from one of your accounts</DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 pt-4">
            <label className="text-sm">Account</label>
            <select
              value={withdrawAccountId}
              onChange={(e) => setWithdrawAccountId(e.target.value)}
              className="border rounded p-2"
            >
              {accounts.map((a: any) => (
                <option key={a._id || a.id} value={a._id || a.id}>
                  {a.name || a.accountNumber || `${a.accountType} account`}
                </option>
              ))}
            </select>

            <label className="text-sm">Amount</label>
            <Input value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} />

            <label className="text-sm">Currency</label>
            <Input value={withdrawCurrency} onChange={(e) => setWithdrawCurrency(e.target.value)} />

            <label className="text-sm">Description</label>
            <Input value={withdrawDescription} onChange={(e) => setWithdrawDescription(e.target.value)} />

            <div className="flex gap-2 justify-end pt-4">
              <Button variant="outline" onClick={() => setWithdrawDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateWithdrawal}>Submit Withdrawal</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
            <DialogDescription>
              {selectedTransaction && (
                <div className="space-y-4 mt-4">
                  <div>
                    <strong>Description:</strong> {selectedTransaction.description}
                  </div>
                  <div>
                    <strong>Amount:</strong> ${Math.abs(selectedTransaction.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </div>
                  <div>
                    <strong>Type:</strong> {selectedTransaction.type}
                  </div>
                  <div>
                    <strong>Category:</strong> {selectedTransaction.category}
                  </div>
                  <div>
                    <strong>Status:</strong> {selectedTransaction.status}
                  </div>
                  <div>
                    <strong>Date:</strong> {selectedTransaction.date}
                  </div>
                  {selectedTransaction.metadata && (
                    <div>
                      <strong>Account:</strong> {selectedTransaction.metadata.account}
                    </div>
                  )}
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Transactions;
