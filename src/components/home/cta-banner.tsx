"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { ArrowRight, CalendarCheck } from "lucide-react";
import { useRef } from "react";
import { Button } from "@/components/ui/button";

export function CtaBanner() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-12%", "12%"]);

  return (
    <section ref={ref} className="relative overflow-hidden">
      <motion.div style={{ y: reduce ? 0 : y }} className="absolute inset-0 scale-110">
        <Image src="/images/cta-bg.jpg" alt="" fill sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-ink/70" />
        <div className="absolute inset-0 bg-gradient-to-r from-rose/25 to-gold/15 mix-blend-multiply" />
      </motion.div>
      <div className="container-lux relative z-10 flex flex-col items-center gap-6 py-28 text-center md:py-36">
        <motion.span
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-[11px] font-semibold uppercase tracking-[0.3em] text-gold"
        >
          Your Transformation Awaits
        </motion.span>
        <motion.h2
          initial={{ opacity: 0, y: 26 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="max-w-3xl font-serif text-4xl leading-tight font-semibold text-white md:text-6xl"
        >
          Ready to Look and Feel <span className="text-gradient-rose">Absolutely Divine?</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="max-w-xl text-white/70"
        >
          Book your appointment in under a minute. Choose your stylist, pick your time, and we&apos;ll take care of the rest.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-2 flex flex-wrap items-center justify-center gap-4"
        >
          <Button asChild variant="gold" size="lg">
            <Link href="/booking">
              <CalendarCheck className="h-4 w-4" /> Book Appointment
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="border-white/40 bg-white/5 text-white hover:bg-white hover:text-ink">
            <Link href="/shop">
              Shop Beauty Products <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}