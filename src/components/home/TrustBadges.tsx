"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Truck, Clock, Gem } from "lucide-react";

import { useState, useEffect } from "react";
import { getSupabaseSettings } from "@/lib/supabase";

export function TrustBadges() {
  const [features, setFeatures] = useState([
    {
      icon: <ShieldCheck className="w-8 h-8 text-primary" />,
      title: "ضمان الجودة",
      desc: "أجود الخامات المستخدمة بضمان الاسترجاع",
      keyTitle: "trust_badge_1_title",
      keyDesc: "trust_badge_1_desc"
    },
    {
      icon: <Truck className="w-8 h-8 text-primary" />,
      title: "توصيل آمن",
      desc: "شحن سريع لجميع المدن الليبية",
      keyTitle: "trust_badge_2_title",
      keyDesc: "trust_badge_2_desc"
    },
    {
      icon: <Clock className="w-8 h-8 text-primary" />,
      title: "دعم 24/7",
      desc: "فريق مخصص للرد على استفساراتكم",
      keyTitle: "trust_badge_3_title",
      keyDesc: "trust_badge_3_desc"
    },
    {
      icon: <Gem className="w-8 h-8 text-primary" />,
      title: "تصاميم حصرية",
      desc: "تشكيلات فريدة لتناسب جميع الأذواق",
      keyTitle: "trust_badge_4_title",
      keyDesc: "trust_badge_4_desc"
    }
  ]);

  useEffect(() => {
    getSupabaseSettings().then(settings => {
      setFeatures(prev => prev.map(item => ({
        ...item,
        title: settings[item.keyTitle] || item.title,
        desc: settings[item.keyDesc] || item.desc
      })));
    }).catch(err => console.error("Error fetching trust badge settings in TrustBadges:", err));
  }, []);

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
