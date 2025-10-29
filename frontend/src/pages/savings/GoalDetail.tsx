import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useParams } from "react-router-dom";

const GoalDetail = () => {
  const { id } = useParams();

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto space-y-6"
      >
        <div>
          <h1 className="text-3xl font-bold">Savings Goal</h1>
          <p className="text-muted-foreground">Details for goal #{id}</p>
        </div>

        <Card className="p-6">
          <h3 className="text-lg font-semibold">Emergency Fund</h3>
          <p className="text-sm text-muted-foreground">
            Progress: 50% • Monthly contribution:$500
          </p>

          <div className="mt-4 flex gap-3">
            <Button>Manage Contribution</Button>
            <Button variant="outline">Move Funds</Button>
          </div>
        </Card>
      </motion.div>
    </DashboardLayout>
  );
};

export default GoalDetail;
