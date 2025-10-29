import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Shield,
  TrendingUp,
  CreditCard,
  Lock,
  Users,
  Smartphone,
  Star,
  MessageSquare,
} from "lucide-react";
import { useState } from "react";
import { demoAccounts } from "@/data/demoData";

const features = [
  {
    icon: Shield,
    title: "Secure Banking",
    description: "Bank-level encryption and security for all your transactions",
  },
  {
    icon: TrendingUp,
    title: "Smart Savings",
    description:
      "Automated savings tools to help you reach your financial goals",
  },
  {
    icon: CreditCard,
    title: "Easy Payments",
    description: "Send and receive money instantly with zero fees",
  },
  {
    icon: Lock,
    title: "Protected",
    description:
      "FSCS protected up to$85,000 where applicable for your peace of mind",
  },
  {
    icon: Users,
    title: "Joint Accounts",
    description: "Share accounts with family and manage finances together",
  },
  {
    icon: Smartphone,
    title: "Mobile First",
    description: "Full-featured mobile app for banking on the go",
  },
];

const Home = () => {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    // Redirect to signup and pass email as query (optional)
    const query = email ? `?email=${encodeURIComponent(email)}` : "";
    navigate(`/signup${query}`);
  };

  // Get joint accounts from demo data
  const jointAccounts = demoAccounts.filter((acc) => acc.type === "joint");

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-hero py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
                Banking Made Simple and Secure
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8">
                Experience modern banking with no hidden fees, instant
                transfers, and intelligent savings tools.{" "}
                <span className="font-semibold text-primary">
                  Now with powerful joint account features!
                </span>
              </p>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <Link to="/signup">
                  <Button
                    size="lg"
                    className="bg-gradient-primary shadow-elegant"
                  >
                    Get Started Free
                  </Button>
                </Link>
                <Link to="/about">
                  <Button size="lg" variant="outline">
                    Learn More
                  </Button>
                </Link>
              </div>

              {/* Email capture */}
              <form onSubmit={handleJoin} className="mt-6 max-w-md">
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <Button type="submit" className="bg-gradient-primary">
                    Join
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  No credit card required • We respect your privacy.
                </p>
              </form>

              {/* Joint Account Summary */}
              <div className="mt-8">
                <h3 className="text-lg font-bold mb-2 flex items-center">
                  <Users className="h-5 w-5 mr-2 text-primary" /> Joint Accounts
                </h3>
                {jointAccounts.length === 0 ? (
                  <div className="text-muted-foreground">
                    No joint accounts yet.{" "}
                    <Link to="/signup" className="text-primary underline">
                      Open one now
                    </Link>
                    .
                  </div>
                ) : (
                  <div className="space-y-4">
                    {jointAccounts.map((acc) => (
                      <Card key={acc.id} className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold">{acc.name}</span>
                          <span className="text-primary font-bold">
                            ${acc.balance.toLocaleString()} {acc.currency}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground mb-1">
                          Account: {acc.accountNumber}
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          {acc.coOwners?.map((owner) => (
                            <div
                              key={owner.id}
                              className="flex items-center gap-1 bg-muted rounded px-2 py-1"
                            >
                              <span className="font-bold text-primary text-xs">
                                {owner.avatar}
                              </span>
                              <span className="text-xs">{owner.name}</span>
                            </div>
                          ))}
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              {/* Trust badges */}
              <div className="mt-6 flex items-center gap-6 flex-wrap text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-primary" /> Bank-level security
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" /> FSCS protected
                  where applicable
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" /> 24/7 support
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative h-[400px] hidden md:block"
            >
              <div className="absolute inset-0 bg-gradient-primary opacity-20 blur-3xl rounded-full"></div>
              <div className="relative flex items-center justify-center h-full">
                <Card className="p-8 shadow-elegant">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Total Joint Account Balance
                      </span>
                      <Shield className="h-5 w-5 text-primary" />
                    </div>
                    <div className="text-3xl font-bold">
                      $
                      {jointAccounts
                        .reduce((sum, acc) => sum + acc.balance, 0)
                        .toLocaleString()}
                    </div>
                    <div className="flex items-center text-sm text-success">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      <span>Shared growth and savings</span>
                    </div>
                  </div>
                </Card>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need
            </h2>
            <p className="text-lg text-muted-foreground">
              Powerful features to manage your finances
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="p-6 h-full hover:shadow-elegant transition-shadow">
                    <Icon className="h-12 w-12 text-primary mb-4" />
                    <h3 className="text-xl font-semibold mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {feature.description}
                    </p>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
      {/* How Joint Accounts Work */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How Joint Accounts Work
            </h2>
            <p className="text-lg text-muted-foreground">
              Open a joint account, invite co-owners, and manage shared finances
              together. All co-owners have equal access, can view transactions,
              and collaborate on savings goals.
            </p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Card className="p-6 text-center">
                <Users className="h-10 w-10 mx-auto text-primary mb-4" />
                <h3 className="font-semibold text-lg mb-2">Invite Co-owners</h3>
                <p className="text-sm text-muted-foreground">
                  Easily add family or friends to your joint account. Everyone
                  gets their own login and full access.
                </p>
              </Card>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="p-6 text-center">
                <CreditCard className="h-10 w-10 mx-auto text-primary mb-4" />
                <h3 className="font-semibold text-lg mb-2">
                  Shared Transactions
                </h3>
                <p className="text-sm text-muted-foreground">
                  All co-owners can view, add, and manage transactions. Stay
                  transparent and organized together.
                </p>
              </Card>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              viewport={{ once: true }}
            >
              <Card className="p-6 text-center">
                <TrendingUp className="h-10 w-10 mx-auto text-primary mb-4" />
                <h3 className="font-semibold text-lg mb-2">
                  Collaborative Savings
                </h3>
                <p className="text-sm text-muted-foreground">
                  Set savings goals and track progress as a team. Everyone can
                  contribute and celebrate milestones.
                </p>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground">
              Open an account, fund it, and manage everything from your
              dashboard.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Card className="p-6 text-center">
                <Shield className="h-10 w-10 mx-auto text-primary mb-4" />
                <h3 className="font-semibold text-lg mb-2">Create Account</h3>
                <p className="text-sm text-muted-foreground">
                  Sign up in minutes with identity verification and secure
                  onboarding.
                </p>
              </Card>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="p-6 text-center">
                <CreditCard className="h-10 w-10 mx-auto text-primary mb-4" />
                <h3 className="font-semibold text-lg mb-2">Fund & Transact</h3>
                <p className="text-sm text-muted-foreground">
                  Instant transfers, bill pay, and debit card controls to manage
                  spending.
                </p>
              </Card>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              viewport={{ once: true }}
            >
              <Card className="p-6 text-center">
                <TrendingUp className="h-10 w-10 mx-auto text-primary mb-4" />
                <h3 className="font-semibold text-lg mb-2">Grow & Save</h3>
                <p className="text-sm text-muted-foreground">
                  Automated savings, goals, and analytics to track progress over
                  time.
                </p>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Pricing Plans
            </h2>
            <p className="text-lg text-muted-foreground">
              Transparent pricing designed for individuals and businesses.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-6 text-center">
              <h3 className="text-xl font-semibold mb-2">Starter</h3>
              <div className="text-3xl font-bold mb-4">Free</div>
              <ul className="text-sm text-muted-foreground mb-6 space-y-2">
                <li>Basic account features</li>
                <li>Free debit card</li>
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
              <div className="text-3xl font-bold mb-4">Contact Us</div>
              <ul className="text-sm text-muted-foreground mb-6 space-y-2">
                <li>Multi-user access</li>
                <li>Higher transaction limits</li>
                <li>Dedicated account manager</li>
              </ul>
              <Link to="/contact">
                <Button variant="outline">Contact Sales</Button>
              </Link>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              What Customers Say
            </h2>
            <p className="text-lg text-muted-foreground">
              Real stories from people using QuentBank.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-6">
              <div className="flex items-start gap-4">
                <MessageSquare className="h-6 w-6 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">
                    "I saved for a down payment in months thanks to the
                    automated savings tools."
                  </p>
                  <p className="mt-3 font-semibold">— Alex R.</p>
                </div>
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-start gap-4">
                <MessageSquare className="h-6 w-6 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">
                    "Transfers are instant and the app is simple to use. Highly
                    recommended."
                  </p>
                  <p className="mt-3 font-semibold">— Priya S.</p>
                </div>
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-start gap-4">
                <MessageSquare className="h-6 w-6 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">
                    "Customer support helped set up our business account
                    quickly."
                  </p>
                  <p className="mt-3 font-semibold">— Martin K.</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-muted/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-2">
              Frequently Asked Questions
            </h2>
            <p className="text-muted-foreground">
              Answers to common questions about accounts, security, and
              transfers.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h4 className="font-semibold mb-2">Is my money protected?</h4>
              <p className="text-sm text-muted-foreground">
                Yes — accounts are FSCS protected up to$85,000 where applicable.
              </p>
            </Card>
            <Card className="p-6">
              <h4 className="font-semibold mb-2">
                How long do transfers take?
              </h4>
              <p className="text-sm text-muted-foreground">
                Most internal transfers are instant. External transfers vary by
                bank (1–3 business days).
              </p>
            </Card>
            <Card className="p-6">
              <h4 className="font-semibold mb-2">
                What documents are required to sign up?
              </h4>
              <p className="text-sm text-muted-foreground">
                A government ID, email, and basic personal information are
                required for verification.
              </p>
            </Card>
            <Card className="p-6">
              <h4 className="font-semibold mb-2">How do I contact support?</h4>
              <p className="text-sm text-muted-foreground">
                Visit our{" "}
                <Link to="/contact" className="text-primary underline">
                  Contact
                </Link>{" "}
                page for support options and hours.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-gradient-primary rounded-2xl p-12 text-center shadow-elegant"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-lg text-white/90 mb-8">
              Join thousands of satisfied customers and experience better
              banking today.
            </p>
            <Link to="/signup">
              <Button size="lg" variant="secondary" className="shadow-lg">
                Open Your Account
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default Home;
