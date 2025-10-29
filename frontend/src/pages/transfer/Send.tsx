import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const Send = () => {
  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto space-y-6"
      >
        <div>
          <h1 className="text-3xl font-bold">Send Money</h1>
          <p className="text-muted-foreground">
            Quickly send money to your contacts or new recipients.
          </p>
        </div>

        <Card className="p-6">
          <form className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground">Recipient</label>
              <Input placeholder="Recipient name or account" />
            </div>

            <div>
              <label className="text-sm text-muted-foreground">Amount</label>
              <Input placeholder="0.00" />
            </div>

            <div>
              <label className="text-sm text-muted-foreground">
                Reference (optional)
              </label>
              <Input placeholder="Payment reference" />
            </div>

            <div className="flex justify-end">
              <Button className="gap-2">
                Send
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </Card>
      </motion.div>
    </DashboardLayout>
  );
};

export default Send;
