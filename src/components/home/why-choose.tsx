"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Award,
  Crown,
  Gem,
  HeartHandshake,
  Leaf,
  Sparkles,
} from "lucide-react";
import { SectionHeading } from "@/components/section-heading";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { Counter } from "@/components/counter";

const FEATURES = [
  { icon: Gem, title: "Premium Products", text: "Only luxury, salon-grade products touch your hair and skin." },
  { icon: Award, title: "Certified Stylists", text: "Internationally trained specialists at the top of their craft." },
  { icon: Crown, title: "Luxury Experience", text: "A five-star salon journey, from welcome tea to the final reveal." },
  { icon: Leaf, title: "Relaxing Atmosphere", text: "Soft light, calming scents and a sanctuary from the everyday." },
  { icon: Sparkles, title: "Affordable Luxury", text: "World-class treatments and products, priced with heart." },
  { icon: HeartHandshake, title: "Exceptional Service", text: "A team that remembers your name, your hair, your story." },
];

export function WhyChoose() {
  return (
    <section className="section-pad relative overflow-hidden">
      <div
        className="pointer-events-none absolute top-0 right-0 h-96 w-96 rounded-full opacity-60 blur-3xl"
        style={{ background: "radial-gradient(circle, #e8a8b8 0%, transparent 70%)" }}
      />
      <div className="container-lux grid items-center gap-14 lg:grid-cols-2">
        <Reveal className="relative">
          <div className="relative overflow-hidden rounded-[2rem] shadow-lux-lg">
            <Image
              src="/images/about-salon.jpg"
              alt="Inside Divine Favour Hair & Beauty"
              width={880}
              height={660}
              className="h-full w-full object-cover"
            />
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, type: "spring", stiffness: 120 }}
            className="absolute -bottom-8 -right-4 flex h-40 w-40 flex-col items-center justify-center rounded-full bg-gradient-to-br from-rose via-blush to-gold text-white shadow-lux-lg md:-right-8 md:h-44 md:w-44"
          >
            <span className="font-serif text-3xl font-bold md:text-4xl">
              <Counter to={5} suffix="+" />
            </span>
            <span className="px-6 text-center text-[10px] font-semibold uppercase tracking-widest">
              Years of Excellence
            </span>
          </motion.div>
        </Reveal>

        <div>
          <SectionHeading
            align="left"
            eyebrow="Why Divine Favour"
            title="Where Every Visit Feels Like a Celebration"
            description="We built Divine Favour on a simple belief: you deserve more than a service — you deserve an experience."
            className="mb-8"
          />
          <Stagger className="grid gap-4 sm:grid-cols-2">
            {FEATURES.map((f) => (
              <StaggerItem key={f.title}>
                <div className="group flex h-full gap-4 rounded-2xl border border-border/60 bg-card p-5 transition-all duration-300 hover:-translate-y-1 hover:border-rose/40 hover:shadow-lux">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-secondary text-rose transition-colors group-hover:bg-gradient-to-br group-hover:from-rose group-hover:to-gold group-hover:text-white">
                    <f.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-semibold">{f.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{f.text}</p>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
          <Reveal delay={0.15} className="mt-8">
            <Button asChild variant="dark">
              <Link href="/about">
                Our Story <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </Reveal>
        </div>
      </div>
    </section>
  );
}