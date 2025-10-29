import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Shield, Key } from "lucide-react";

const SecurityCenter = () => {
  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto space-y-6"
      >
        <div>
          <h1 className="text-3xl font-bold">Security Center</h1>
          <p className="text-muted-foreground">
            Manage your security settings and review recent security events.
          </p>
        </div>

        <Card className="p-6">
          <div className="mb-4 p-3 bg-primary/5 rounded-lg text-xs text-muted-foreground">
            <strong>Joint Account Security:</strong> Security settings for joint
            accounts apply to all co-owners. Device management and two-factor
            authentication are recommended for every co-owner to ensure maximum
            protection.
          </div>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">
                Two-Factor Authentication
              </h3>
              <p className="text-sm text-muted-foreground">
                Protect your account with an additional verification step.
              </p>
            </div>
            <div className="ml-auto">
              <Button variant="outline">Configure</Button>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <Button variant="outline">Manage Devices</Button>
            <Button variant="outline">Review Login Activity</Button>
          </div>
        </Card>
      </motion.div>
    </DashboardLayout>
  );
};

export default SecurityCenter;
