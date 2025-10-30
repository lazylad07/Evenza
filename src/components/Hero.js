import React from "react";
import { motion } from "framer-motion";
import { Button } from "./ui/Button";
import { MessageCircle, PlayCircle } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center text-center bg-gradient-to-br from-blue-50 via-white to-purple-50 overflow-hidden">
      {/* Floating gradient circles */}
      <div className="absolute top-10 left-10 w-64 h-64 bg-gradient-to-br from-blue-500 to-purple-500 blur-3xl opacity-10 rounded-full" />
      <div className="absolute bottom-10 right-10 w-56 h-56 bg-gradient-to-br from-pink-500 to-purple-500 blur-3xl opacity-10 rounded-full" />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="max-w-3xl px-6"
      >
        <h1 className="text-6xl font-bold text-neutral-900 leading-tight mb-4">
          Modern Event Planning<br /> Made Simple
        </h1>
        <p className="text-lg text-neutral-600 mb-8 leading-relaxed">
          Streamline your event management with intelligent guest tracking, instant WhatsApp integration, and AI-powered insights that take the stress out of planning.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="primary" icon={PlayCircle}>
            Start Planning
          </Button>
          <Button variant="whatsapp" icon={MessageCircle}>
            Share via WhatsApp
          </Button>
        </div>
      </motion.div>
    </section>
  );
}
