import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { useParams } from "react-router-dom";

const TransactionDetail = () => {
  const { id } = useParams();

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto space-y-6"
      >
        <div>
          <h1 className="text-3xl font-bold">Transaction Detail</h1>
          <p className="text-muted-foreground">Details for transaction #{id}</p>
        </div>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-muted rounded-full">
                <ArrowDownRight className="h-6 w-6 text-success" />
              </div>
              <div>
                <h3 className="font-semibold">Payment from Jane Smith</h3>
                <p className="text-sm text-muted-foreground">
                  Card payment • Online
                </p>
              </div>
            </div>
            <div className="text-right font-semibold">+£500.00</div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Date</span>
              <span>2025-10-26</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Reference</span>
              <span>Salary Oct</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              <span className="text-success">Completed</span>
            </div>
          </div>

          <div className="mt-6 flex gap-2">
            <Button variant="outline">Dispute</Button>
            <Button>Save Receipt</Button>
          </div>
        </Card>
      </motion.div>
    </DashboardLayout>
  );
};

export default TransactionDetail;
