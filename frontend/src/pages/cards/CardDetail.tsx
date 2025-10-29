import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useParams } from "react-router-dom";
import { CreditCard, Lock, Unlock } from "lucide-react";
import { useEffect, useState } from "react";
import api from "@/lib/api";

const CardDetail = () => {
  const { id } = useParams();

  const [card, setCard] = useState<any>(null);

  useEffect(() => {
    if (id)
      api
        .getCard(id)
        .then((res) => setCard(res))
        .catch(() => {});
  }, [id]);

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto space-y-6"
      >
        <div>
          <h1 className="text-3xl font-bold">Card Details</h1>
          <p className="text-muted-foreground">Details for card #{id}</p>
        </div>

        <Card className="p-6 bg-gradient-primary text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold">
                {card?.cardholderName || "Card"}
              </h3>
              <p className="font-mono tracking-wider">
                {card?.maskedNumber || "**** **** **** 0000"}
              </p>
            </div>
            <CreditCard className="h-8 w-8" />
          </div>
          <div className="mt-6">
            <div className="flex gap-3">
              <Button variant="outline">View Statements</Button>
              <Button variant="outline">Set Limit</Button>
              <Button>
                <Lock className="h-4 w-4 mr-2" />
                Lock Card
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </DashboardLayout>
  );
};

export default CardDetail;
