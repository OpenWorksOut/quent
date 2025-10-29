import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import api from "@/lib/api";
import {
  ArrowLeft,
  Users,
  Settings,
  Plus,
  Trash2,
  Edit,
  Eye,
  Shield,
  CreditCard,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

const AccountDetails = () => {
  const { accountId } = useParams();
  const navigate = useNavigate();
  const [account, setAccount] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showEditAccount, setShowEditAccount] = useState(false);
  
  const [newMember, setNewMember] = useState({
    email: "",
    permissions: "view"
  });
  
  const [editData, setEditData] = useState({
    name: "",
    withdrawalsEnabled: true,
    withdrawalLimit: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [accountData, userData] = await Promise.all([
          api.request(`/accounts/${accountId}`),
          api.me()
        ]);
        
        setAccount(accountData);
        setCurrentUser(userData.user || userData);
        setEditData({
          name: accountData.name,
          withdrawalsEnabled: accountData.limitations?.withdrawalsEnabled ?? true,
          withdrawalLimit: accountData.limitations?.withdrawalLimit ?? 5000
        });
      } catch (error) {
        console.error("Failed to fetch account:", error);
        toast.error("Failed to load account details");
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    };

    if (accountId) {
      fetchData();
    }
  }, [accountId, navigate]);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // This would be a new API endpoint to add members to joint accounts
      console.log("Adding member:", newMember);
      toast.success("Member added successfully!");
      setShowAddMember(false);
      setNewMember({ email: "", permissions: "view" });
      // Refresh account data
    } catch (error) {
      console.error("Failed to add member:", error);
      toast.error("Failed to add member. Please try again.");
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      // This would be a new API endpoint to remove members
      console.log("Removing member:", memberId);
      toast.success("Member removed successfully!");
      // Refresh account data
    } catch (error) {
      console.error("Failed to remove member:", error);
      toast.error("Failed to remove member. Please try again.");
    }
  };

  const handleUpdateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updatedAccount = await api.updateAccount(accountId!, {
        name: editData.name,
        limitations: {
          withdrawalsEnabled: editData.withdrawalsEnabled,
          withdrawalLimit: editData.withdrawalLimit
        }
      });
      setAccount(updatedAccount);
      setShowEditAccount(false);
      toast.success("Account updated successfully!");
    } catch (error) {
      console.error("Failed to update account:", error);
      toast.error("Failed to update account. Please try again.");
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

  if (!account || !currentUser) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-muted-foreground">Account not found</p>
        </div>
      </DashboardLayout>
    );
  }

  const isJointAccount = account.accountType === "joint";
  const isOwner = account.primaryOwner === currentUser._id;
  const secondaryOwner = account.secondaryOwners?.find((owner: any) => owner.user === currentUser._id);
  const userPermission = isOwner ? "owner" : (secondaryOwner?.permissions || "none");
  const canTransact = userPermission === "owner" || userPermission === "full" || userPermission === "transact";
  const canManage = userPermission === "owner" || userPermission === "full";
  const canViewOnly = userPermission === "view";

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto space-y-6"
      >
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/dashboard")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-1">Account Details</h1>
            <p className="text-muted-foreground">
              Manage your account settings and permissions
            </p>
          </div>
          <div className="flex gap-3">
            {canViewOnly && (
              <div className="px-3 py-2 bg-amber-100 text-amber-700 rounded-lg text-sm font-medium">
                <Shield className="h-4 w-4 mr-2 inline" />
                View Only Access
              </div>
            )}
            
            {canManage && (
              <Dialog open={showEditAccount} onOpenChange={setShowEditAccount}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Account
                  </Button>
                </DialogTrigger>
              </Dialog>
            )}
            
            {canTransact && !canViewOnly && (
              <Button variant="outline" onClick={() => navigate(`/transfer?from=${account._id}`)}>
                <Send className="h-4 w-4 mr-2" />
                Transfer
              </Button>
            )}
            
            {isJointAccount && canManage && (
              <Dialog open={showAddMember} onOpenChange={setShowAddMember}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Member
                  </Button>
                </DialogTrigger>
              </Dialog>
            )}
          </div>
        </div>

        {/* Account Overview */}
        <Card className="p-8">
          <div className="flex items-center gap-6 mb-6">
            <div className="p-4 bg-primary/10 rounded-lg">
              <CreditCard className="h-8 w-8 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-1">{account.name}</h2>
              <p className="text-muted-foreground mb-2">
                Account Number: ****{account.accountNumber?.slice(-4)}
              </p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>Type: {account.accountType}</span>
                <span>Currency: {account.currency}</span>
                <span>Status: {account.status}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground mb-1">Balance</p>
              <p className="text-3xl font-bold">
                ${(account.balance || 0).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>
          </div>

          {/* Account Settings */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              Account Settings
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Withdrawals</p>
                  <p className="text-sm text-muted-foreground">
                    Allow withdrawals from this account
                  </p>
                </div>
                <Switch
                  checked={account.limitations?.withdrawalsEnabled ?? true}
                  onCheckedChange={async (checked) => {
                    try {
                      const updated = await api.setAccountWithdrawals(
                        account._id,
                        checked
                      );
                      setAccount(updated);
                      toast.success(
                        `Withdrawals ${checked ? "enabled" : "disabled"}`
                      );
                    } catch (error) {
                      toast.error("Failed to update withdrawal settings");
                    }
                  }}
                />
              </div>
              <div>
                <p className="font-medium">Daily Withdrawal Limit</p>
                <p className="text-sm text-muted-foreground">
                  ${(account.limitations?.withdrawalLimit || 5000).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Joint Account Members */}
        {isJointAccount && (
          <Card className="p-8">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Account Members
            </h3>
            
            {/* Primary Owner */}
            <div className="mb-6">
              <h4 className="font-medium mb-3">Primary Owner</h4>
              <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                <Avatar className="h-10 w-10 bg-primary/10">
                  <AvatarFallback className="text-primary font-semibold">
                    PO
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium">Primary Owner</p>
                  <p className="text-sm text-muted-foreground">Full Access</p>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  <span className="text-sm text-primary font-medium">Owner</span>
                </div>
              </div>
            </div>

            {/* Secondary Owners */}
            {account.secondaryOwners && account.secondaryOwners.length > 0 && (
              <div>
                <h4 className="font-medium mb-3">Secondary Owners</h4>
                <div className="space-y-3">
                  {account.secondaryOwners.map((owner: any, index: number) => (
                    <div
                      key={owner.user || index}
                      className="flex items-center gap-3 p-4 border rounded-lg"
                    >
                      <Avatar className="h-10 w-10 bg-blue-500/10">
                        <AvatarFallback className="text-blue-500 font-semibold">
                          SO
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium">Secondary Owner</p>
                        <p className="text-sm text-muted-foreground">
                          {owner.permissions} access • {owner.status}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveMember(owner.user)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        )}

        {/* Edit Account Dialog */}
        <Dialog open={showEditAccount} onOpenChange={setShowEditAccount}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Account</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdateAccount} className="space-y-4">
              <div>
                <Label htmlFor="accountName">Account Name</Label>
                <Input
                  id="accountName"
                  value={editData.name}
                  onChange={(e) =>
                    setEditData({ ...editData, name: e.target.value })
                  }
                  placeholder="Account name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="withdrawalLimit">Daily Withdrawal Limit ($)</Label>
                <Input
                  id="withdrawalLimit"
                  type="number"
                  value={editData.withdrawalLimit}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      withdrawalLimit: parseFloat(e.target.value) || 0,
                    })
                  }
                  placeholder="5000"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Enable Withdrawals</p>
                  <p className="text-sm text-muted-foreground">
                    Allow withdrawals from this account
                  </p>
                </div>
                <Switch
                  checked={editData.withdrawalsEnabled}
                  onCheckedChange={(checked) =>
                    setEditData({ ...editData, withdrawalsEnabled: checked })
                  }
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1">
                  Save Changes
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowEditAccount(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Add Member Dialog */}
        <Dialog open={showAddMember} onOpenChange={setShowAddMember}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Account Member</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddMember} className="space-y-4">
              <div>
                <Label htmlFor="memberEmail">Email Address</Label>
                <Input
                  id="memberEmail"
                  type="email"
                  value={newMember.email}
                  onChange={(e) =>
                    setNewMember({ ...newMember, email: e.target.value })
                  }
                  placeholder="john.doe@example.com"
                  required
                />
              </div>
              <div>
                <Label htmlFor="permissions">Permissions</Label>
                <Select
                  value={newMember.permissions}
                  onValueChange={(value) =>
                    setNewMember({ ...newMember, permissions: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full">
                      Full Access (View, Transact, Manage)
                    </SelectItem>
                    <SelectItem value="transact">
                      Transact (View & Transfer)
                    </SelectItem>
                    <SelectItem value="view">View Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1">
                  Add Member
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddMember(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </motion.div>
    </DashboardLayout>
  );
};

export default AccountDetails;
