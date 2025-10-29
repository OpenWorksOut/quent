import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";

const History = () => {
  const demo = [
    { id: 1, title: "Password changed", date: "2025-10-24" },
    { id: 2, title: "Logged in from new device", date: "2025-10-25" },
  ];

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto space-y-6"
      >
        <div>
          <h1 className="text-3xl font-bold">Notification History</h1>
          <p className="text-muted-foreground">
            All past notifications and alerts.
          </p>
        </div>

        <div className="space-y-4">
          {demo.map((d) => (
            <Card key={d.id} className="p-4 flex items-center justify-between">
              <div>
                <p className="font-medium">{d.title}</p>
                <p className="text-sm text-muted-foreground">{d.date}</p>
              </div>
              <div className="text-sm text-muted-foreground">View</div>
            </Card>
          ))}
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default History;
