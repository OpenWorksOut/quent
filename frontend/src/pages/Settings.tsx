import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { demoAccounts } from "@/data/demoData";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Bell,
  Shield,
  Key,
  SmartphoneNfc,
  CreditCard,
  MessageSquare,
  Mail,
  Globe,
  Clock,
  ChevronRight,
  Settings as SettingsIcon,
  Lock,
  Users,
} from "lucide-react";

const settingsGroups = [
  {
    title: "Financial",
    icon: SettingsIcon,
    items: [
      {
        name: "Monthly Income",
        icon: CreditCard,
        description: "Set your monthly income target",
        action: "Update",
        route: "/settings/financial",
      },
      {
        name: "Monthly Budget",
        icon: Clock,
        description: "Set your monthly spending budget",
        action: "Update",
        route: "/settings/financial",
      },
      {
        name: "Savings Goals",
        icon: Globe,
        description: "Configure your savings targets",
        action: "Update",
        route: "/settings/financial",
      },
    ],
  },
  {
    title: "Security",
    icon: Shield,
    items: [
      {
        name: "Two-Factor Authentication",
        icon: Key,
        description: "Add an extra layer of security to your account",
        action: "Setup",
      },
      {
        name: "Biometric Login",
        icon: SmartphoneNfc,
        description: "Use fingerprint or face recognition",
        action: "Enable",
      },
      {
        name: "Device Management",
        icon: Lock,
        description: "Manage trusted devices",
        action: "View",
      },
    ],
  },
  {
    title: "Payment Methods",
    icon: CreditCard,
    items: [
      {
        name: "Manage Cards",
        icon: CreditCard,
        description: "View and edit your linked cards",
        action: "Manage",
      },
      {
        name: "Transaction Limits",
        icon: Clock,
        description: "Set daily and monthly limits",
        action: "Edit",
      },
    ],
  },
  {
    title: "Notifications",
    icon: Bell,
    items: [
      {
        name: "Push Notifications",
        icon: Bell,
        description: "Transaction and security alerts",
        action: "Configure",
      },
      {
        name: "Email Notifications",
        icon: Mail,
        description: "Statement and policy updates",
        action: "Configure",
      },
      {
        name: "SMS Alerts",
        icon: MessageSquare,
        description: "Real-time transaction alerts",
        action: "Configure",
      },
    ],
  },
  {
    title: "Preferences",
    icon: SettingsIcon,
    items: [
      {
        name: "Language",
        icon: Globe,
        description: "Choose your preferred language",
        action: "English",
      },
      {
        name: "Time Zone",
        icon: Clock,
        description: "Set your local time zone",
        action: "GMT+1",
      },
    ],
  },
];

const Settings = () => {
  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6 max-w-4xl mx-auto"
      >
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-1">Settings</h1>
            <p className="text-muted-foreground">
              Manage your account settings and preferences
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <Link to="/settings/security">
            <Button variant="outline">Security Center</Button>
          </Link>
          <Link to="/settings/payment-methods">
            <Button variant="outline">Payment Methods</Button>
          </Link>
        </div>

        {/* Joint Account Management */}
        <Card className="p-6 border-primary/50 mb-8">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">
                Joint Account Management
              </h3>
              <p className="text-sm text-muted-foreground mb-2">
                Manage co-owners, permissions, and shared account settings for
                your joint accounts.
              </p>
              {demoAccounts
                .filter((a) => a.type === "joint")
                .map((acc) => (
                  <div key={acc.id} className="mb-3">
                    <div className="font-semibold">
                      {acc.name}{" "}
                      <span className="text-xs text-muted-foreground">
                        ({acc.accountNumber})
                      </span>
                    </div>
                    <div className="flex gap-2 flex-wrap mt-1">
                      {acc.coOwners?.map((owner) => (
                        <span
                          key={owner.id}
                          className="bg-primary/10 rounded px-2 py-1 text-xs font-semibold"
                        >
                          {owner.avatar} {owner.name}
                        </span>
                      ))}
                    </div>
                    <div className="mt-2 flex gap-2">
                      <Button variant="outline" size="sm">
                        Invite Co-owner
                      </Button>
                      <Button variant="outline" size="sm">
                        Remove Co-owner
                      </Button>
                    </div>
                  </div>
                ))}
              <div className="text-xs text-muted-foreground mt-2">
                All co-owners have equal permissions. Changes to joint account
                settings require approval from all co-owners.
              </div>
            </div>
          </div>
        </Card>

        {/* Settings Groups */}
        <div className="space-y-8">
          {settingsGroups.map((group) => {
            const GroupIcon = group.icon;
            return (
              <section key={group.title}>
                <div className="flex items-center gap-2 mb-4">
                  <GroupIcon className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-semibold">{group.title}</h2>
                </div>
                <div className="space-y-4">
                  {group.items.map((item) => {
                    const ItemIcon = item.icon;
                    return (
                      <Card
                        key={item.name}
                        className="p-4 hover:shadow-md transition-shadow"
                      >
                        <Link to={item.route || "#"}>
                          <Button
                            variant="ghost"
                            className="w-full h-auto p-2 flex items-center justify-between"
                          >
                            <div className="flex items-center gap-4">
                              <div className="p-2 bg-primary/10 rounded-lg">
                                <ItemIcon className="h-5 w-5 text-primary" />
                              </div>
                              <div className="text-left">
                                <h3 className="font-semibold">{item.name}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {item.description}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              {item.action}
                              <ChevronRight className="h-4 w-4" />
                            </div>
                          </Button>
                        </Link>
                      </Card>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>

        {/* Security Section */}
        <Card className="p-6 border-destructive/50 mt-8">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-destructive/10 rounded-lg">
              <Shield className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Security Center</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Your account security is important to us. Regular security
                checks help protect your account.
              </p>
              <Button variant="destructive">Run Security Check</Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </DashboardLayout>
  );
};

export default Settings;
