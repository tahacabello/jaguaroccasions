"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Truck, Clock, Gem } from "lucide-react";

const features = [
  {
    icon: <ShieldCheck className="w-8 h-8 text-primary" />,
    title: "ضمان الجودة",
    desc: "أجود الخامات المستخدمة بضمان الاسترجاع"
  },
  {
    icon: <Truck className="w-8 h-8 text-primary" />,
    title: "توصيل آمن",
    desc: "شحن سريع لجميع المدن الليبية"
  },
  {
    icon: <Clock className="w-8 h-8 text-primary" />,
    title: "دعم 24/7",
    desc: "فريق مخصص للرد على استفساراتكم"
  },
  {
    icon: <Gem className="w-8 h-8 text-primary" />,
    title: "تصاميم حصرية",
    desc: "تشكيلات فريدة لتناسب جميع الأذواق"
  }
];

export function TrustBadges() {
  return (
    <section className="py-16 border-y border-border bg-surface-hover">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feat, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="flex items-start gap-4 p-6 glass rounded-2xl border-border hover:border-primary/30 transition-colors"
            >
              <div className="p-3 bg-surface rounded-xl border border-border">
                {feat.icon}
              </div>
              <div>
                <h3 className="text-lg font-bold mb-1">{feat.title}</h3>
                <p className="text-sm text-foreground/60 leading-relaxed">{feat.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
