import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  Bell,
  CreditCard,
  ShieldAlert,
  ArrowDownRight,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  Info,
  Users,
} from "lucide-react";

type Notification = {
  id: number;
  type: "security" | "transaction" | "card" | "joint" | "info";
  title: string;
  message: string;
  time: string;
  unread?: boolean;
};

const demoNotifications: Notification[] = [
  {
    id: 1,
    type: "security",
    title: "New Device Login",
    message: "New login detected from London, UK",
    time: "2 hours ago",
    unread: true,
  },
  {
    id: 2,
    type: "transaction",
    title: "Payment Received",
    message: "You received$500.00 from Jane Smith",
    time: "4 hours ago",
    unread: true,
  },
  {
    id: 3,
    type: "card",
    title: "Card Transaction",
    message: "Purchase at Amazon.co.uk for$45.99",
    time: "Yesterday",
    unread: false,
  },
  {
    id: 4,
    type: "transaction",
    title: "Bill Payment",
    message: "Utility bill payment successful",
    time: "2 days ago",
    unread: false,
  },
  {
    id: 5,
    type: "security",
    title: "Password Changed",
    message: "Your account password was updated",
    time: "3 days ago",
    unread: false,
  },
  {
    id: 6,
    type: "joint",
    title: "Co-owner Added",
    message: "Sarah Johnson was added as a co-owner to Family Joint",
    time: "1 hour ago",
    unread: true,
  },
];

const NotificationItem = ({ notification }: { notification: Notification }) => {
  const icon = (() => {
    switch (notification.type) {
      case "security":
        return <ShieldAlert className="h-5 w-5 text-destructive" />;
      case "transaction":
        return <ArrowDownRight className="h-5 w-5 text-success" />;
      case "card":
        return <CreditCard className="h-5 w-5 text-primary" />;
      case "joint":
        return <Users className="h-5 w-5 text-primary" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  })();

  return (
    <Card
      className={`p-4 ${notification.unread ? "ring-1 ring-primary/20" : ""}`}
    >
      <div className="flex items-start gap-4">
        <div className="pt-1">{icon}</div>
        <div className="flex-grow">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold">{notification.title}</h3>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {notification.time}
              </span>
              {notification.unread && (
                <div className="w-2 h-2 rounded-full bg-primary" />
              )}
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            {notification.message}
          </p>
        </div>
      </div>
    </Card>
  );
};

const Notifications = () => {
  const unreadCount = demoNotifications.filter((n) => n.unread).length;

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6 max-w-4xl mx-auto"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-1">Notifications</h1>
            <p className="text-muted-foreground">
              You have {unreadCount} unread notifications
            </p>
          </div>

          <div className="flex gap-3">
            <Button variant="outline">
              <Clock className="h-4 w-4 mr-2" />
              History
            </Button>
            <Button>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Mark All Read
            </Button>
          </div>
        </div>

        <Card className="p-4">
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" className="rounded-full">
              All
            </Button>
            <Button variant="outline" className="rounded-full">
              <ShieldAlert className="h-4 w-4 mr-2 text-destructive" />
              Security
            </Button>
            <Button variant="outline" className="rounded-full">
              <ArrowDownRight className="h-4 w-4 mr-2 text-success" />
              Transactions
            </Button>
            <Button variant="outline" className="rounded-full">
              <CreditCard className="h-4 w-4 mr-2 text-primary" />
              Cards
            </Button>
            <Button variant="outline" className="rounded-full">
              <Users className="h-4 w-4 mr-2 text-primary" />
              Joint Accounts
            </Button>
          </div>
        </Card>

        <div className="space-y-4">
          {demoNotifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
            />
          ))}
        </div>

        <Card className="p-6 bg-gradient-primary text-white">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white/10 rounded-lg">
              <Bell className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">
                Notification Preferences
              </h3>
              <p className="text-sm opacity-90 mb-4">
                Customize how and when you receive notifications to stay on top
                of your banking activity.
              </p>
              <Button variant="secondary">Manage Preferences</Button>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-blue-500/10 border-blue-500/20">
          <div className="flex items-center gap-3">
            <Info className="h-5 w-5 text-blue-500" />
            <p className="text-sm text-blue-500">
              Notifications older than 30 days will be automatically archived.
              You can access them in the notification history.
            </p>
          </div>
        </Card>

        <div className="text-center">
          <Button variant="outline" className="min-w-[200px]">
            Load More
          </Button>
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default Notifications;
