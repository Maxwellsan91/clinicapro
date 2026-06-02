"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { faqs } from "./data";
import { AnimateIn } from "./animations";

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      itemScope
      itemProp="mainEntity"
      itemType="https://schema.org/Question"
      className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
        open ? "bg-blue-50/60 border-blue-100" : "bg-white border-slate-100 hover:border-slate-200"
      }`}
    >
      <button
        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span itemProp="name" className={`font-medium text-sm leading-snug ${open ? "text-blue-900" : "text-slate-800"}`}>
          {question}
        </span>
        <ChevronDown
          className={`w-4 h-4 shrink-0 text-slate-400 transition-transform duration-300 ${open ? "rotate-180 text-blue-500" : ""}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            itemScope
            itemProp="acceptedAnswer"
            itemType="https://schema.org/Answer"
          >
            <p itemProp="text" className="px-6 pb-5 text-sm text-slate-500 leading-relaxed">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FAQ() {
  return (
    <section className="py-24 bg-slate-50/60" aria-labelledby="faq-heading" itemScope itemType="https://schema.org/FAQPage">
      <div className="max-w-3xl mx-auto px-5 sm:px-8">
        <AnimateIn className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 bg-indigo-50 text-indigo-600 text-xs font-semibold rounded-full border border-indigo-100 mb-4">
            Perguntas frequentes
          </span>
          <h2 id="faq-heading" className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-4">
            Tem dúvidas?{" "}
            <span className="text-indigo-600">Nós respondemos</span>
          </h2>
          <p className="text-slate-500 leading-relaxed">
            Encontre respostas às perguntas mais comuns dos nossos pacientes.
          </p>
        </AnimateIn>

        <div className="space-y-3">
          {faqs.map((faq) => (
            <FAQItem key={faq.question} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      </div>
    </section>
  );
}

