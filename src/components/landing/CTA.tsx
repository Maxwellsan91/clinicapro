"use client";

import { CalendarCheck, ArrowRight, Phone, Mail } from "lucide-react";
import { motion } from "framer-motion";
import { AnimateIn } from "./animations";

export function CTA() {
  const handleScroll = () => {
    document.querySelector("#contactos")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="py-24 bg-white">
      <div className="max-w-5xl mx-auto px-5 sm:px-8">
        <AnimateIn>
          <div className="relative bg-linear-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-3xl p-10 sm:p-16 overflow-hidden text-center">
            {/* Decorations */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full">
              <svg viewBox="0 0 600 300" className="w-full h-full opacity-5">
                <circle cx="300" cy="150" r="120" fill="none" stroke="white" strokeWidth="1" />
                <circle cx="300" cy="150" r="180" fill="none" stroke="white" strokeWidth="1" />
                <circle cx="300" cy="150" r="240" fill="none" stroke="white" strokeWidth="1" />
              </svg>
            </div>

            <div className="relative space-y-6">
              <span className="inline-block px-4 py-1.5 bg-white/10 text-white/90 text-xs font-semibold rounded-full backdrop-blur-sm border border-white/20">
                🌟 Comece hoje
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight tracking-tight">
                Comece hoje a cuidar
                <br />da sua saúde e bem-estar
              </h2>
              <p className="text-blue-100 text-lg max-w-xl mx-auto leading-relaxed">
                Agende a sua consulta de avaliação e descubra como podemos transformar a sua qualidade de vida. A primeira consulta é sem compromisso.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                <button
                  onClick={handleScroll}
                  className="group flex items-center gap-2.5 px-8 py-4 bg-white text-blue-700 font-semibold rounded-2xl hover:bg-blue-50 transition-all shadow-xl shadow-blue-900/30 text-sm"
                >
                  <CalendarCheck className="w-4 h-4" />
                  Marcar Consulta
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <a
                  href="tel:+351210000000"
                  className="flex items-center gap-2 px-6 py-4 bg-white/10 text-white border border-white/20 font-medium rounded-2xl hover:bg-white/20 transition-all backdrop-blur-sm text-sm"
                >
                  <Phone className="w-4 h-4" />
                  +351 210 000 000
                </a>
              </div>

              <p className="text-blue-200 text-xs">
                Sem compromisso · Resposta em menos de 2 horas · Horários flexíveis
              </p>
            </div>
          </div>
        </AnimateIn>
      </div>
    </section>
  );
}

