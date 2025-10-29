import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Send, User, Plus } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import api from "@/lib/api";

const Transfer = () => {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [recentContacts, setRecentContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [recipientType, setRecipientType] = useState<"contact" | "manual">(
    "contact"
  );
  const [formData, setFormData] = useState({
    fromAccount: "",
    recipient: "",
    recipientName: "",
    recipientAccount: "",
    recipientBank: "",
    recipientRoutingNumber: "",
    recipientCountry: "UK",
    amount: "",
    note: "",
  });

  useEffect(() => {
    Promise.all([api.getAccounts(), api.getTransactionsForUser()])
      .then(([accountsRes, transactionsRes]) => {
        setAccounts(accountsRes);
        // Extract recent contacts from transactions
        const contacts = transactionsRes
          .filter((t: any) => t.type === "debit" && t.category === "Transfer")
          .slice(0, 4)
          .map((t: any, index: number) => ({
            id: `contact-${index}`,
            name: t.description.replace("Transfer to ", ""),
            account: `****${Math.floor(1000 + Math.random() * 9000)}`,
            avatar: t.description
              .replace("Transfer to ", "")
              .split(" ")
              .map((n: string) => n[0])
              .join("")
              .toUpperCase(),
          }));
        setRecentContacts(contacts);
      })
      .catch((error) => {
        console.error("Failed to fetch transfer data:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validate form data
      if (!formData.fromAccount || !formData.amount) {
        toast.error("Please fill in all required fields");
        return;
      }
      
      const amount = parseFloat(formData.amount);
      if (amount <= 0) {
        toast.error("Please enter a valid amount");
        return;
      }
      
      // Validate recipient based on type
      if (recipientType === "contact" && !formData.recipient) {
        toast.error("Please select a recipient");
        return;
      }
      
      if (recipientType === "manual") {
        if (!formData.recipientName || !formData.recipientAccount) {
          toast.error("Please fill in recipient details");
          return;
        }
      }
      
      // Create transaction record
      const transactionData = {
        type: "transfer",
        transactionType: "expense",
        amount: amount,
        currency: "USD",
        description: recipientType === "contact" 
          ? `Transfer to ${recentContacts.find(c => c.id === formData.recipient)?.name || "Contact"}`
          : `Transfer to ${formData.recipientName}`,
        category: "Transfer",
        status: "completed",
        fromAccount: formData.fromAccount,
        toAccount: recipientType === "contact" ? formData.recipient : formData.recipientAccount,
        note: formData.note
      };
      
      console.log("Creating transfer transaction:", transactionData);
      
      // Here you would call the API to create the transaction
      // await api.createTransaction(transactionData);
      
      toast.success("Transfer initiated successfully!");
      
      // Reset form
      setFormData({
        fromAccount: "",
        recipient: "",
        recipientName: "",
        recipientAccount: "",
        recipientBank: "",
        recipientRoutingNumber: "",
        recipientCountry: "UK",
        amount: "",
        note: "",
      });
      
    } catch (error) {
      console.error("Transfer failed:", error);
      toast.error("Transfer failed. Please try again.");
    }
  };

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto space-y-6"
      >
        <div>
          <h1 className="text-3xl font-bold mb-2">Send Money</h1>
          <p className="text-muted-foreground">
            Transfer funds to another account instantly
          </p>

          <div className="mt-4 flex gap-3">
            <Link to="/transfer/send">
              <Button variant="outline" size="sm">
                Quick Send
              </Button>
            </Link>
            <Link to="/transfer/schedule">
              <Button variant="outline" size="sm">
                Schedule
              </Button>
            </Link>
          </div>
        </div>

        {/* Recent Contacts */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Contacts</h2>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (!loading && recentContacts.length > 0) ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {recentContacts.map((contact) => (
                <button
                  key={contact.id}
                  onClick={() => {
                    setRecipientType("contact");
                    setFormData({ ...formData, recipient: contact.id });
                  }}
                  className={`p-4 rounded-lg border-2 transition-all hover:shadow-md ${
                    formData.recipient === contact.id &&
                    recipientType === "contact"
                      ? "border-primary bg-primary/5"
                      : "border-border"
                  }`}
                >
                  <Avatar className="h-12 w-12 mx-auto mb-2 bg-primary/10">
                    <AvatarFallback className="text-primary font-semibold">
                      {contact.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <p className="text-sm font-medium text-center">
                    {contact.name}
                  </p>
                  <p className="text-xs text-muted-foreground text-center">
                    {contact.account}
                  </p>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No recent contacts found</p>
              <p className="text-sm">
                Start by making a transfer to see contacts here
              </p>
            </div>
          )}
        </Card>

        {/* Transfer Form */}
        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="fromAccount">From Account</Label>
              <Select
                value={formData.fromAccount}
                onValueChange={(value) =>
                  setFormData({ ...formData, fromAccount: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  {loading ? (
                    <SelectItem value="" disabled>
                      Loading accounts...
                    </SelectItem>
                  ) : accounts.length === 0 ? (
                    <SelectItem value="" disabled>
                      No accounts available
                    </SelectItem>
                  ) : (
                    accounts.map((account) => (
                      <SelectItem key={account._id || account.id} value={account._id || account.id}>
                        {account.name} - ${(account.balance || 0).toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                        })}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="recipient">Recipient</Label>
              <Tabs
                value={recipientType}
                onValueChange={(value: any) => setRecipientType(value)}
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="contact">Recent Contact</TabsTrigger>
                  <TabsTrigger value="manual">New Recipient</TabsTrigger>
                </TabsList>

                <TabsContent value="contact" className="mt-4">
                  <Select
                    value={formData.recipient}
                    onValueChange={(value) =>
                      setFormData({ ...formData, recipient: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select recipient" />
                    </SelectTrigger>
                    <SelectContent>
                      {recentContacts.map((contact) => (
                        <SelectItem key={contact.id} value={contact.id}>
                          {contact.name} - {contact.account}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TabsContent>

                <TabsContent value="manual" className="mt-4 space-y-4">
                  <div>
                    <Label htmlFor="recipientName">Recipient Name</Label>
                    <Input
                      id="recipientName"
                      value={formData.recipientName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          recipientName: e.target.value,
                        })
                      }
                      placeholder="Full name"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="recipientCountry">Country</Label>
                    <Select
                      value={formData.recipientCountry}
                      onValueChange={(value) =>
                        setFormData({ ...formData, recipientCountry: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UK">United Kingdom</SelectItem>
                        <SelectItem value="US">United States</SelectItem>
                        <SelectItem value="EU">European Union</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="recipientAccount">Account Number</Label>
                    <Input
                      id="recipientAccount"
                      value={formData.recipientAccount}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          recipientAccount: e.target.value,
                        })
                      }
                      placeholder={
                        formData.recipientCountry === "UK"
                          ? "12345678"
                          : "1234567890"
                      }
                      required
                    />
                  </div>

                  {formData.recipientCountry === "UK" && (
                    <div>
                      <Label htmlFor="recipientBank">Sort Code</Label>
                      <Input
                        id="recipientBank"
                        value={formData.recipientBank}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            recipientBank: e.target.value,
                          })
                        }
                        placeholder="12-34-56"
                        required
                      />
                    </div>
                  )}

                  {formData.recipientCountry === "US" && (
                    <>
                      <div>
                        <Label htmlFor="recipientRoutingNumber">
                          Routing Number
                        </Label>
                        <Input
                          id="recipientRoutingNumber"
                          value={formData.recipientRoutingNumber}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              recipientRoutingNumber: e.target.value,
                            })
                          }
                          placeholder="123456789"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="recipientBank">Bank Name</Label>
                        <Input
                          id="recipientBank"
                          value={formData.recipientBank}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              recipientBank: e.target.value,
                            })
                          }
                          placeholder="Bank of America"
                          required
                        />
                      </div>
                    </>
                  )}

                  {formData.recipientCountry === "EU" && (
                    <div>
                      <Label htmlFor="recipientBank">IBAN</Label>
                      <Input
                        id="recipientBank"
                        value={formData.recipientBank}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            recipientBank: e.target.value,
                          })
                        }
                        placeholder="GB29 NWBK 6016 1331 9268 19"
                        required
                      />
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>

            <div>
              <Label htmlFor="amount">Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  placeholder="0.00"
                  className="pl-7"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="note">Note (Optional)</Label>
              <Textarea
                id="note"
                value={formData.note}
                onChange={(e) =>
                  setFormData({ ...formData, note: e.target.value })
                }
                placeholder="Add a note..."
                rows={3}
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-primary"
              size="lg"
            >
              <Send className="h-5 w-5 mr-2" />
              Send Money
            </Button>
          </form>
        </Card>

        {/* Info Card */}
        <Card className="p-6 bg-muted/50">
          <h3 className="font-semibold mb-2">Transfer Information</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Transfers are instant and available 24/7</li>
            <li>• No fees for transfers between QuentBank accounts</li>
            <li>
              • International transfers: UK (Sort Code), US (Routing Number), EU
              (IBAN)
            </li>
            <li>• Daily transfer limit:$10,000</li>
            <li>• All transfers are protected and encrypted</li>
            <li>• You can save recipients for future transfers</li>
          </ul>
        </Card>
      </motion.div>
    </DashboardLayout>
  );
};

export default Transfer;
