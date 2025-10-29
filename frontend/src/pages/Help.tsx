import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  MessageSquare,
  Phone,
  Mail,
  HelpCircle,
  Book,
  FileText,
  PiggyBank,
  CreditCard,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
} from "lucide-react";

const helpCategories = [
  {
    title: "Quick Links",
    items: [
      {
        name: "Getting Started Guide",
        icon: Book,
        description: "Learn the basics of your online banking",
        path: "/help/getting-started",
      },
      {
        name: "Security Tips",
        icon: ShieldCheck,
        description: "Keep your account safe and secure",
        path: "/help/security",
      },
      {
        name: "FAQ",
        icon: HelpCircle,
        description: "Frequently asked questions",
        path: "/help/faq",
      },
    ],
  },
  {
    title: "Support Topics",
    items: [
      {
        name: "Account Management",
        icon: FileText,
        description: "Learn about account types and management",
        path: "/help/accounts",
      },
      {
        name: "Cards & Payments",
        icon: CreditCard,
        description: "Managing your cards and making payments",
        path: "/help/cards",
      },
      {
        name: "Savings & Investments",
        icon: PiggyBank,
        description: "Information about savings products",
        path: "/help/savings",
      },
    ],
  },
];

const contactMethods = [
  {
    name: "Live Chat",
    icon: MessageSquare,
    description: "Chat with our support team",
    availability: "24/7",
    buttonText: "Start Chat",
    variant: "default" as const,
  },
  {
    name: "Phone Support",
    icon: Phone,
    description: "Call our banking support",
    availability: "Mon-Fri 8am-8pm",
    buttonText: "0800 123 4567",
    variant: "outline" as const,
  },
  {
    name: "Email Support",
    icon: Mail,
    description: "Send us an email",
    availability: "Response within 24hrs",
    buttonText: "Send Email",
    variant: "outline" as const,
  },
];

const Help = () => {
  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6 max-w-5xl mx-auto"
      >
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-1">Help & Support</h1>
            <p className="text-muted-foreground">
              Find answers and get assistance with your banking needs
            </p>
          </div>
          <Button>
            <MessageSquare className="h-4 w-4 mr-2" />
            Contact Support
          </Button>
        </div>

        {/* Contact Methods */}
        <div className="grid md:grid-cols-3 gap-6">
          {contactMethods.map((method) => {
            const MethodIcon = method.icon;
            return (
              <Card key={method.name} className="p-6">
                <div className="flex flex-col h-full">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <MethodIcon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{method.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {method.availability}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 flex-grow">
                    {method.description}
                  </p>
                  <Button variant={method.variant} className="w-full">
                    {method.buttonText}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Help Categories */}
        {helpCategories.map((category) => (
          <section key={category.title} className="space-y-4">
            <h2 className="text-xl font-semibold">{category.title}</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {category.items.map((item) => {
                const ItemIcon = item.icon;
                return (
                  <Link key={item.name} to={item.path}>
                    <Card className="p-4 hover:shadow-md transition-shadow">
                      <Button variant="ghost" className="w-full h-auto p-2">
                        <div className="flex items-center gap-4 w-full">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <ItemIcon className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-grow text-left">
                            <h3 className="font-semibold">{item.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {item.description}
                            </p>
                          </div>
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        </div>
                      </Button>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </section>
        ))}

        {/* Additional Resources */}
        <Card className="p-6 bg-gradient-primary text-white">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white/10 rounded-lg">
              <Book className="h-6 w-6" />
            </div>
            <div className="flex-grow">
              <h3 className="text-lg font-semibold mb-2">Learning Center</h3>
              <p className="text-sm opacity-90 mb-4">
                Explore our comprehensive guides and tutorials to make the most
                of your banking experience.
              </p>
              <Button variant="secondary" className="gap-2">
                Visit Learning Center
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </DashboardLayout>
  );
};

export default Help;
