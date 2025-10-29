import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/lib/auth";

const RequestCard = () => {
  const { user } = useAuth();
  const [type, setType] = useState("");
  const [name, setName] = useState(user?.firstName || "");

  const handleRequest = (e: React.FormEvent) => {
    e.preventDefault();
    api
      .requestCard({ cardType: type, cardholderName: name })
      .then(() => {
        window.alert("Card requested");
      })
      .catch((err) => window.alert(err.message || "Request failed"));
  };

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto space-y-6"
      >
        <div>
          <h1 className="text-3xl font-bold">Request New Card</h1>
          <p className="text-muted-foreground">
            Apply for a new credit or debit card.
          </p>
        </div>

        <Card className="p-6">
          <form className="space-y-4" onSubmit={handleRequest}>
            <div>
              <label className="text-sm text-muted-foreground">Card Type</label>
              <Input
                value={type}
                onChange={(e) => setType(e.target.value)}
                placeholder="Credit / Debit"
              />
            </div>

            <div>
              <label className="text-sm text-muted-foreground">
                Name on Card
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name"
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit" className="gap-2">
                Request
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </Card>
      </motion.div>
    </DashboardLayout>
  );
};

export default RequestCard;
