import { PublicLayout } from "@/components/layout/PublicLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { Link } from "react-router-dom";

const Pricing = () => {
  return (
    <PublicLayout>
      <div className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Pricing Plans
            </h1>
            <p className="text-lg text-muted-foreground">
              Choose a plan that fits your needs — transparent pricing with no
              hidden fees.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <Card className="p-6 text-center">
              <h3 className="text-xl font-semibold mb-2">Starter</h3>
              <div className="text-3xl font-bold mb-4">Free</div>
              <ul className="text-sm text-muted-foreground mb-6 space-y-2">
                <li>Personal account</li>
                <li>Debit card</li>
                <li>Automated savings</li>
              </ul>
              <Link to="/signup">
                <Button variant="outline">Get Started</Button>
              </Link>
            </Card>

            <Card className="p-6 text-center border-2 border-primary">
              <div className="inline-flex items-center justify-center gap-2 mb-3">
                <Star className="h-5 w-5 text-primary" />
                <h3 className="text-xl font-semibold">Pro</h3>
              </div>
              <div className="text-3xl font-bold mb-4">£9 / mo</div>
              <ul className="text-sm text-muted-foreground mb-6 space-y-2">
                <li>All Starter features</li>
                <li>Priority support</li>
                <li>Advanced analytics</li>
              </ul>
              <Link to="/signup">
                <Button className="bg-gradient-primary">Choose Pro</Button>
              </Link>
            </Card>

            <Card className="p-6 text-center">
              <h3 className="text-xl font-semibold mb-2">Business</h3>
              <div className="text-3xl font-bold mb-4">Custom</div>
              <ul className="text-sm text-muted-foreground mb-6 space-y-2">
                <li>Multi-user access</li>
                <li>Account manager</li>
                <li>Custom limits & integrations</li>
              </ul>
              <Link to="/contact">
                <Button variant="outline">Contact Sales</Button>
              </Link>
            </Card>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default Pricing;
