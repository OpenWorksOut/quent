import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  CreditCard,
  Plus,
  Lock,
  ShieldCheck,
  Settings,
  Users,
} from "lucide-react";
import { demoAccounts } from "@/data/demoData";
import { useEffect, useState } from "react";
import api from "@/lib/api";

// Cards from demoAccounts (joint and personal)
const demoCards = [
  ...demoAccounts.map((acc) => ({
    id: acc.id,
    type: acc.type === "joint" ? `${acc.name} (Joint)` : acc.name,
    number: acc.accountNumber,
    expiryDate: "--/--", // Placeholder, could be extended
    balance: acc.balance,
    limit: undefined,
    isLocked: false,
    coOwners: acc.coOwners,
    isJoint: acc.type === "joint",
    currency: acc.currency,
  })),
  {
    id: 101,
    type: "Platinum Credit Card",
    number: "**** **** **** 4589",
    expiryDate: "12/27",
    balance: 2500,
    limit: 10000,
    isLocked: false,
  },
  {
    id: 102,
    type: "Premium Debit Card",
    number: "**** **** **** 1234",
    expiryDate: "09/26",
    balance: 0,
    isLocked: true,
  },
];

const Cards = () => {
  const [cards, setCards] = useState<any[]>([]);

  useEffect(() => {
    api
      .getCards()
      .then((res) => setCards(res))
      .catch(() => setCards([]));
  }, []);

  const displayCards = cards.length ? cards : [];

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6 max-w-7xl mx-auto"
      >
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-1">Your Cards</h1>
            <p className="text-muted-foreground">
              Manage your credit and debit cards
            </p>
          </div>
          <Link to="/cards/request">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Request New Card
            </Button>
          </Link>
        </div>

        {/* Cards Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {displayCards.length ? (
            displayCards.map((card: any) => {
              const isJoint =
                typeof card.id === "string" &&
                card.id.length > 0 &&
                card.type.includes("Joint");
              const coOwners =
                isJoint && "coOwners" in card ? card.coOwners : undefined;
              return (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ y: -5 }}
                  className="relative"
                >
                  <Link to={`/cards/${card.id}`}>
                    <Card
                      className={`p-8 bg-gradient-primary text-white h-56 ${
                        isJoint ? "border-2 border-primary" : ""
                      }`}
                    >
                      <div className="absolute top-6 right-6 flex gap-2">
                        {card.isLocked ? (
                          <Lock className="h-6 w-6 text-white/80" />
                        ) : (
                          <ShieldCheck className="h-6 w-6 text-white/80" />
                        )}
                        {isJoint && <Users className="h-6 w-6 text-white/80" />}
                      </div>
                      <div className="flex flex-col h-full justify-between">
                        <div>
                          <CreditCard className="h-10 w-10 mb-4" />
                          <h3 className="text-lg font-semibold mb-1">
                            {card.type}
                          </h3>
                          <p className="text-2xl font-mono tracking-wider">
                            {card.number}
                          </p>
                          {isJoint && coOwners && (
                            <div className="mt-2 flex gap-2 flex-wrap">
                              {coOwners.map((owner) => (
                                <span
                                  key={owner.id}
                                  className="bg-white/10 rounded px-2 py-1 text-xs font-semibold"
                                >
                                  {owner.avatar} {owner.name}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-white/70">Valid Thru</p>
                            <p className="font-mono">{card.expiryDate}</p>
                          </div>
                          {"limit" in card && card.limit !== undefined && (
                            <div className="text-right">
                              <p className="text-sm text-white/70">
                                Credit Limit
                              </p>
                              <p className="font-semibold">
                                ${card.limit.toLocaleString()}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  </Link>

                  {/* Card Actions */}
                  <div className="mt-4 flex gap-3">
                    <Button variant="outline" className="flex-1" size="sm">
                      {card.isLocked ? "Unlock Card" : "Lock Card"}
                    </Button>
                    <Button variant="outline" size="sm" className="w-10 p-0">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="text-muted-foreground">No cards yet.</div>
          )}
        </div>

        {/* Card Features */}
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <Card className="p-6">
            <ShieldCheck className="h-8 w-8 text-success mb-4" />
            <h3 className="text-lg font-semibold mb-2">Secure Spending</h3>
            <p className="text-muted-foreground text-sm">
              Advanced fraud protection and real-time transaction monitoring
            </p>
          </Card>

          <Card className="p-6">
            <CreditCard className="h-8 w-8 text-primary mb-4" />
            <h3 className="text-lg font-semibold mb-2">Flexible Payments</h3>
            <p className="text-muted-foreground text-sm">
              Choose how you want to pay and manage your credit limits
            </p>
          </Card>

          <Card className="p-6">
            <Lock className="h-8 w-8 text-blue-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Instant Card Control</h3>
            <p className="text-muted-foreground text-sm">
              Lock or unlock your card instantly from your dashboard
            </p>
          </Card>
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default Cards;
