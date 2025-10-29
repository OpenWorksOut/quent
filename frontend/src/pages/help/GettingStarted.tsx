import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";

const GettingStarted = () => {
  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto space-y-6"
      >
        <div>
          <h1 className="text-3xl font-bold">Getting Started</h1>
          <p className="text-muted-foreground">
            Step-by-step guide to using the banking app.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <Card className="p-4">
            <h3 className="font-semibold">Create an Account</h3>
            <p className="text-sm text-muted-foreground">
              Sign up and verify your identity to start banking.
            </p>
          </Card>

          <Card className="p-4">
            <h3 className="font-semibold">Add a Payment Method</h3>
            <p className="text-sm text-muted-foreground">
              Link a debit or credit card to start making payments.
            </p>
          </Card>

          <Card className="p-4">
            <h3 className="font-semibold">Make Your First Transfer</h3>
            <p className="text-sm text-muted-foreground">
              Use the Send flow to transfer money to others.
            </p>
          </Card>

          <Card className="p-4">
            <h3 className="font-semibold">Set Up Savings Goals</h3>
            <p className="text-sm text-muted-foreground">
              Create goals and auto-contribute each month.
            </p>
          </Card>
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default GettingStarted;
