import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { CreditCard, Trash } from "lucide-react";

const PaymentMethods = () => {
  const demoMethods = [
    { id: 1, name: "Personal Visa", last4: "1234" },
    { id: 2, name: "Business MasterCard", last4: "4589" },
  ];

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto space-y-6"
      >
        <div>
          <h1 className="text-3xl font-bold">Payment Methods</h1>
          <p className="text-muted-foreground">
            Manage your linked cards and bank accounts.
          </p>
        </div>

        <div className="space-y-4">
          {demoMethods.map((m) => (
            <Card key={m.id} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <CreditCard className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{m.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Ending {m.last4}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline">Edit</Button>
                <Button variant="destructive">
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>

        <div className="flex justify-end">
          <Button>Link New Card</Button>
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default PaymentMethods;
