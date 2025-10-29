import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";

const FAQ = () => {
  const faqs = [
    {
      q: "How do I reset my password?",
      a: "Go to Settings → Security to change your password.",
    },
    {
      q: "How do I report a lost card?",
      a: "Lock your card in the Cards section and contact support.",
    },
    {
      q: "How long do transfers take?",
      a: "Most transfers are instant; some interbank transfers may take 1-3 business days.",
    },
  ];

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto space-y-6"
      >
        <div>
          <h1 className="text-3xl font-bold">FAQ</h1>
          <p className="text-muted-foreground">Answers to common questions.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((f, i) => (
            <Card key={i} className="p-4">
              <h3 className="font-semibold">{f.q}</h3>
              <p className="text-sm text-muted-foreground">{f.a}</p>
            </Card>
          ))}
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default FAQ;
