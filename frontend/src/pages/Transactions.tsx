import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { demoTransactions, demoAccounts } from "@/data/demoData";
import { ArrowUpRight, ArrowDownRight, Search, Filter } from "lucide-react";
import { useState, useEffect } from "react";
import api from "@/lib/api";

const Transactions = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<
    "all" | "credit" | "debit" | "joint"
  >("all");

  const [transactions, setTransactions] = useState<any[]>(demoTransactions);
  const [accounts, setAccounts] = useState<any[]>(demoAccounts);

  useEffect(() => {
    api
      .getAccounts()
      .then((res) => setAccounts(res))
      .catch(() => {});
    api
      .getTransactionsForUser()
      .then((res) => setTransactions(res))
      .catch(() => {});
  }, []);

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

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div>
          <h1 className="text-3xl font-bold mb-2">Transaction History</h1>
          <p className="text-muted-foreground">
            View and manage all your transactions
          </p>
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
            {filteredTransactions.map((transaction, index) => {
              const jointAcc = demoAccounts.find(
                (a) => a.id === transaction.accountId && a.type === "joint"
              );
              return (
                <motion.div
                  key={transaction.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-4 flex items-center justify-between hover:bg-muted/50 transition-colors ${
                    transaction.isJoint ? "border-l-4 border-primary" : ""
                  }`}
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
                        {transaction.isJoint && jointAcc && (
                          <Badge variant="secondary" className="text-xs">
                            Joint
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span>{transaction.date}</span>
                        <span>•</span>
                        <span>{transaction.category}</span>
                        {transaction.isJoint && jointAcc && (
                          <span className="ml-2 flex gap-1 items-center">
                            Co-owners:
                            {jointAcc.coOwners?.map((owner) => (
                              <span
                                key={owner.id}
                                className="bg-primary/10 rounded px-1 text-xs font-semibold"
                              >
                                {owner.avatar}
                              </span>
                            ))}
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
                    {transaction.type === "credit" ? "+" : ""}$
                    {Math.abs(transaction.amount).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </Card>
      </motion.div>
    </DashboardLayout>
  );
};

export default Transactions;
