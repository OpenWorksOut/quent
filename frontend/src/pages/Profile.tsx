import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
import {
  User,
  Users,
  Mail,
  Phone,
  Calendar,
  Shield,
  Bell,
  CreditCard,
  Plus,
  Eye,
  Send,
  Settings,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
  });

  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const [userData, accountsData] = await Promise.all([
          api.me(),
          api.getAccounts()
        ]);
        
        console.log("User data:", userData);
        setUser(userData.user || userData);
        setAccounts(accountsData || []);
        
        // Set form data from user
        const userInfo = userData.user || userData;
        setFormData({
          firstName: userInfo.firstName || "",
          lastName: userInfo.lastName || "",
          email: userInfo.email || "",
          phoneNumber: userInfo.phoneNumber || "",
        });
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        toast.error("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Here you would call an API to update the user profile
      // For now, we'll just show a success message
      toast.success("Profile updated successfully!");
      console.log("Profile update data:", formData);
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error("Failed to update profile. Please try again.");
    }
  };

  // Separate owned vs accessed joint accounts
  const ownedJointAccounts = accounts.filter(
    (acc) => acc.accountType === "joint" && acc.primaryOwner === user._id
  );
  
  const accessedJointAccounts = accounts.filter(
    (acc) => acc.accountType === "joint" && 
    acc.secondaryOwners?.some((owner: any) => owner.user === user._id && owner.status === "active")
  );
  
  // Get user's permission for a specific account
  const getUserPermission = (account: any) => {
    if (account.primaryOwner === user._id) return "owner";
    const secondaryOwner = account.secondaryOwners?.find((owner: any) => owner.user === user._id);
    return secondaryOwner?.permissions || "none";
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
  
  if (!user) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-muted-foreground">Failed to load user data</p>
        </div>
      </DashboardLayout>
    );
  }
  
  const userInitials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() || 'U';

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto space-y-6"
      >
        <div>
          <h1 className="text-3xl font-bold mb-2">Profile Settings</h1>
          <p className="text-muted-foreground">
            Manage your account information and preferences
          </p>
        </div>

        {/* Profile Header */}
        <Card className="p-8 mb-6">
          <div className="flex items-center gap-6">
            <Avatar className="h-24 w-24 bg-primary/10">
              <AvatarFallback className="text-3xl font-bold text-primary">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-1">
                {user.firstName} {user.lastName}
              </h2>
              <p className="text-muted-foreground mb-3">{user.email}</p>
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 mr-2" />
                Member since{" "}
                {new Date(user.createdAt || Date.now()).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                })}
              </div>
            </div>
            <Button variant="outline">Change Photo</Button>
          </div>
        </Card>

        {/* Owned Joint Accounts Section */}
        {ownedJointAccounts.length > 0 && (
          <Card className="p-8 mb-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Users className="h-5 w-5 mr-2 text-primary" />
              Joint Accounts You Own
            </h2>
            {ownedJointAccounts.map((acc) => (
              <div key={acc._id} className="mb-6 p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="font-bold text-lg">{acc.name}</span>
                    <span className="ml-2 text-muted-foreground">
                      (****{acc.accountNumber?.slice(-4)})
                    </span>
                    <span className="ml-2 px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                      Owner
                    </span>
                  </div>
                  <span className="font-semibold text-primary">
                    ${(acc.balance || 0).toLocaleString()} {acc.currency}
                  </span>
                </div>
                
                {acc.secondaryOwners && acc.secondaryOwners.length > 0 && (
                  <div className="mb-3">
                    <div className="mb-2 text-sm text-muted-foreground">
                      Secondary Owners:
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {acc.secondaryOwners.map((owner: any, index: number) => (
                        <div
                          key={owner.user || index}
                          className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2"
                        >
                          <Avatar className="h-6 w-6 bg-blue-500/10">
                            <AvatarFallback className="text-xs font-bold text-blue-500">
                              SO
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="text-sm font-medium">Secondary Owner</div>
                            <div className="text-xs text-muted-foreground">
                              {owner.permissions} access • {owner.status}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Member
                  </Button>
                  <Button variant="outline" size="sm">
                    Manage Account
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate(`/account/${acc._id}`)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </Card>
        )}

        {/* Accessed Joint Accounts Section */}
        {accessedJointAccounts.length > 0 && (
          <Card className="p-8 mb-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Shield className="h-5 w-5 mr-2 text-blue-500" />
              Joint Accounts You Have Access To
            </h2>
            {accessedJointAccounts.map((acc) => {
              const userPermission = getUserPermission(acc);
              const canTransact = userPermission === "full" || userPermission === "transact";
              const canManage = userPermission === "full";
              
              return (
                <div key={acc._id} className="mb-6 p-4 border rounded-lg bg-blue-50/50">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="font-bold text-lg">{acc.name}</span>
                      <span className="ml-2 text-muted-foreground">
                        (****{acc.accountNumber?.slice(-4)})
                      </span>
                      <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                        userPermission === "full" 
                          ? "bg-green-100 text-green-700" 
                          : userPermission === "transact"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-700"
                      }`}>
                        {userPermission === "full" ? "Full Access" : 
                         userPermission === "transact" ? "Can Transact" : "View Only"}
                      </span>
                    </div>
                    <span className="font-semibold text-primary">
                      ${(acc.balance || 0).toLocaleString()} {acc.currency}
                    </span>
                  </div>
                  
                  <div className="mb-3 text-sm text-muted-foreground">
                    <p>Your permissions: <span className="font-medium text-foreground">{userPermission}</span></p>
                    {userPermission === "view" && (
                      <p className="text-amber-600 mt-1">⚠️ You can only view this account. No transactions allowed.</p>
                    )}
                    {userPermission === "transact" && (
                      <p className="text-blue-600 mt-1">ℹ️ You can view and make transactions, but cannot manage account settings.</p>
                    )}
                    {userPermission === "full" && (
                      <p className="text-green-600 mt-1">✅ You have full access to this account.</p>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/account/${acc._id}`)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
                    </Button>
                    
                    {canTransact && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate(`/transfer?from=${acc._id}`)}
                      >
                        <Send className="h-4 w-4 mr-1" />
                        Transfer
                      </Button>
                    )}
                    
                    {canManage && (
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4 mr-1" />
                        Manage
                      </Button>
                    )}
                    
                    {!canTransact && (
                      <Button variant="outline" size="sm" disabled>
                        <Shield className="h-4 w-4 mr-1" />
                        View Only Access
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
            <div className="text-xs text-muted-foreground mt-4 p-3 bg-muted/50 rounded-lg">
              <strong>Permission Levels:</strong><br/>
              • <strong>Full Access:</strong> View, transact, and manage account settings<br/>
              • <strong>Transact:</strong> View account and make transfers<br/>
              • <strong>View Only:</strong> Can only view account balance and transactions
            </div>
          </Card>
        )}

        {/* Personal Information */}
        <Card className="p-8">
          <h2 className="text-xl font-semibold mb-6 flex items-center">
            <User className="h-5 w-5 mr-2 text-primary" />
            Personal Information
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  placeholder="Enter your first name"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  placeholder="Enter your last name"
                />
              </div>
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="Enter your email"
                />
              </div>
              <div>
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, phoneNumber: e.target.value })
                  }
                  placeholder="Enter your phone number"
                />
              </div>
            </div>
            <Button type="submit" className="bg-gradient-primary">
              Save Changes
            </Button>
          </form>
        </Card>

        {/* Notification Settings */}
        <Card className="p-8">
          <h2 className="text-xl font-semibold mb-6 flex items-center">
            <Bell className="h-5 w-5 mr-2 text-primary" />
            Notification Preferences
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-muted-foreground">
                  Receive transaction alerts via email
                </p>
              </div>
              <Switch
                checked={notifications.email}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, email: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Push Notifications</p>
                <p className="text-sm text-muted-foreground">
                  Get instant alerts on your device
                </p>
              </div>
              <Switch
                checked={notifications.push}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, push: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">SMS Notifications</p>
                <p className="text-sm text-muted-foreground">
                  Receive text messages for important updates
                </p>
              </div>
              <Switch
                checked={notifications.sms}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, sms: checked })
                }
              />
            </div>
          </div>
        </Card>

        {/* Security Settings */}
        <Card className="p-8">
          <h2 className="text-xl font-semibold mb-6 flex items-center">
            <Shield className="h-5 w-5 mr-2 text-primary" />
            Security Settings
          </h2>
          <div className="space-y-4">
            <Button variant="outline" className="w-full justify-start">
              Change Password
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Enable Two-Factor Authentication
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Manage Connected Devices
            </Button>
          </div>
        </Card>

        {/* Account Actions */}
        <Card className="p-8">
          <h2 className="text-xl font-semibold mb-6 flex items-center">
            <CreditCard className="h-5 w-5 mr-2 text-primary" />
            Account Management
          </h2>
          <div className="space-y-4">
            <Button variant="outline" className="w-full justify-start">
              Download Account Statement
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Close Account (Joint account closure requires all co-owners'
              approval)
            </Button>
          </div>
        </Card>
      </motion.div>
    </DashboardLayout>
  );
};

export default Profile;
