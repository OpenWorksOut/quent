import { PublicLayout } from "@/components/layout/PublicLayout";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Target, Award, Users, Heart } from "lucide-react";

const values = [
  {
    icon: Target,
    title: "Our Mission",
    description:
      "To provide accessible, transparent, and secure banking services that empower individuals and businesses to achieve their financial goals.",
  },
  {
    icon: Award,
    title: "Excellence",
    description:
      "We strive for excellence in every interaction, delivering superior service and innovative solutions to our customers.",
  },
  {
    icon: Users,
    title: "Community",
    description:
      "Building strong relationships with our customers and communities, supporting local growth and development.",
  },
  {
    icon: Heart,
    title: "Trust",
    description:
      "We earn trust through transparency, reliability, and unwavering commitment to our customers' financial wellbeing.",
  },
];

const About = () => {
  return (
    <PublicLayout>
      <div className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto text-center mb-16"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              About QuentBank
            </h1>
            <p className="text-lg text-muted-foreground">
              Founded in 2020, QuentBank has revolutionized digital banking by
              combining cutting-edge technology with personalized service. We
              believe banking should be simple, transparent, and accessible to
              everyone.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 mb-20">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="p-8 h-full hover:shadow-elegant transition-shadow">
                    <Icon className="h-12 w-12 text-primary mb-4" />
                    <h3 className="text-2xl font-semibold mb-3">
                      {value.title}
                    </h3>
                    <p className="text-muted-foreground">{value.description}</p>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-muted rounded-2xl p-12"
          >
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-6">By the Numbers</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                <div>
                  <div className="text-4xl font-bold text-primary mb-2">
                    500K+
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Active Users
                  </div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-primary mb-2">
                    $2B+
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Transactions
                  </div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-primary mb-2">
                    99.9%
                  </div>
                  <div className="text-sm text-muted-foreground">Uptime</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-primary mb-2">
                    4.9/5
                  </div>
                  <div className="text-sm text-muted-foreground">
                    User Rating
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default About;
