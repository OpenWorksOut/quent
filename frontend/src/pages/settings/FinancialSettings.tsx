import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const FinancialSettings = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>({
    monthlyIncome: { amount: 0, currency: "USD" },
    monthlyBudget: { amount: 0, currency: "USD" },
    savingsGoal: { monthlyTarget: 0, currency: "USD" },
  });

  useEffect(() => {
    api
      .getFinancialProfile()
      .then((res) => {
        setProfile(res.financialProfile || profile);
      })
      .catch((error) => {
        console.error("Failed to fetch financial profile:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.updateFinancialProfile(profile);
      navigate("/settings");
    } catch (error) {
      console.error("Failed to update financial profile:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6 max-w-4xl mx-auto"
      >
        {/* Header Section */}
        <div className="flex items-center gap-4 mb-6">
          <Link to="/settings">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold mb-1">Financial Settings</h1>
            <p className="text-muted-foreground">
              Manage your income, budget, and savings goals
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="p-6 space-y-8">
            {/* Monthly Income */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Monthly Income</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="monthlyIncome">Target Monthly Income</Label>
                  <Input
                    id="monthlyIncome"
                    type="number"
                    min="0"
                    step="0.01"
                    value={profile.monthlyIncome.amount}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        monthlyIncome: {
                          ...profile.monthlyIncome,
                          amount: parseFloat(e.target.value),
                        },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Input
                    type="text"
                    value={profile.monthlyIncome.currency}
                    disabled
                  />
                </div>
              </div>
            </div>

            {/* Monthly Budget */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Monthly Budget</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="monthlyBudget">Monthly Spending Budget</Label>
                  <Input
                    id="monthlyBudget"
                    type="number"
                    min="0"
                    step="0.01"
                    value={profile.monthlyBudget.amount}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        monthlyBudget: {
                          ...profile.monthlyBudget,
                          amount: parseFloat(e.target.value),
                        },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Input
                    type="text"
                    value={profile.monthlyBudget.currency}
                    disabled
                  />
                </div>
              </div>
            </div>

            {/* Savings Goals */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Savings Goals</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="savingsGoal">Monthly Savings Target</Label>
                  <Input
                    id="savingsGoal"
                    type="number"
                    min="0"
                    step="0.01"
                    value={profile.savingsGoal.monthlyTarget}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        savingsGoal: {
                          ...profile.savingsGoal,
                          monthlyTarget: parseFloat(e.target.value),
                        },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Input
                    type="text"
                    value={profile.savingsGoal.currency}
                    disabled
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <Link to="/settings">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </Card>
        </form>
      </motion.div>
    </DashboardLayout>
  );
};

export default FinancialSettings;
