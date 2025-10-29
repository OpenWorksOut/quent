import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Calendar } from "lucide-react";

const Schedule = () => {
  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto space-y-6"
      >
        <div>
          <h1 className="text-3xl font-bold">Schedule Transfer</h1>
          <p className="text-muted-foreground">
            Set up recurring or scheduled transfers.
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
                Start Date
              </label>
              <div className="flex items-center gap-2">
                <Input placeholder="YYYY-MM-DD" />
                <Calendar className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>

            <div>
              <label className="text-sm text-muted-foreground">Frequency</label>
              <Input placeholder="Monthly / Weekly" />
            </div>

            <div className="flex justify-end">
              <Button className="gap-2">Schedule</Button>
            </div>
          </form>
        </Card>
      </motion.div>
    </DashboardLayout>
  );
};

export default Schedule;
