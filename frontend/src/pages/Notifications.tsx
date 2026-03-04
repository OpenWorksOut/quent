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
import { useState, useEffect } from "react";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

type Notification = {
  _id?: string;
  id?: string;
  type: "security" | "transaction" | "card" | "joint" | "info" | "system";
  title: string;
  message: string;
  createdAt?: string;
  status?: "read" | "unread";
};

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

  const isUnread = notification.status === "unread";
  const timeAgo = notification.createdAt
    ? new Date(notification.createdAt).toLocaleDateString()
    : "Unknown";

  return (
    <Card
      className={`p-4 ${isUnread ? "ring-1 ring-primary/20 bg-primary/5" : ""}`}
    >
      <div className="flex items-start gap-4">
        <div className="pt-1">{icon}</div>
        <div className="flex-grow">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold">{notification.title}</h3>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {timeAgo}
              </span>
              {isUnread && (
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
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.getNotifications();
      setNotifications(res || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load notifications",
        variant: "destructive",
      });
      console.error("Failed to load notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const unreadCount = notifications.filter((n) => n.status === "unread").length;

  const handleMarkAllRead = async () => {
    try {
      const unreadNotifications = notifications.filter(
        (n) => n.status === "unread"
      );
      await Promise.all(
        unreadNotifications.map((n) => api.markNotificationRead(n._id || n.id!))
      );
      await fetchNotifications();
      toast({
        title: "Success",
        description: "All notifications marked as read",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark notifications as read",
        variant: "destructive",
      });
      console.error("Failed to mark all as read:", error);
    }
  };

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
            <Button onClick={handleMarkAllRead} disabled={unreadCount === 0}>
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
          {!loading && notifications.length > 0 ? (
            notifications.map((notification) => (
              <NotificationItem
                key={notification._id || notification.id}
                notification={notification}
              />
            ))
          ) : loading ? (
            <Card className="p-6 text-center">
              <p className="text-muted-foreground">Loading notifications...</p>
            </Card>
          ) : (
            <Card className="p-6 text-center">
              <p className="text-muted-foreground">No notifications yet.</p>
            </Card>
          )}
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
