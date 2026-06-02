"use client";

import { CalendarCheck, ClipboardList, Stethoscope, TrendingUp } from "lucide-react";
import { steps } from "./data";
import { AnimateIn, StaggerContainer, fadeUp, motion } from "./animations";

const ICONS = { CalendarCheck, ClipboardList, Stethoscope, TrendingUp } as const;

export function HowItWorks() {
  return (
    <section className="py-24 bg-linear-to-b from-slate-50/60 to-white">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <AnimateIn className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 bg-violet-50 text-violet-600 text-xs font-semibold rounded-full border border-violet-100 mb-4">
            Processo
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-4">
            Simples do início ao{" "}
            <span className="text-violet-600">resultado</span>
          </h2>
          <p className="text-slate-500 max-w-lg mx-auto leading-relaxed">
            Um processo claro e acompanhado em cada etapa para que se sinta seguro e informado durante todo o tratamento.
          </p>
        </AnimateIn>

        <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => {
            const Icon = ICONS[step.icon as keyof typeof ICONS];
            const isLast = i === steps.length - 1;
            return (
              <motion.div key={step.number} variants={fadeUp} className="relative">
                {/* Connector line */}
                {!isLast && (
                  <div className="absolute top-8 left-[calc(50%+28px)] right-[-50%] h-px bg-linear-to-r from-blue-200 to-transparent hidden lg:block" />
                )}

                <div className="text-center space-y-4">
                  {/* Number + Icon */}
                  <div className="relative inline-flex">
                    <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <span className="absolute -top-2 -right-2 w-6 h-6 bg-white border-2 border-blue-100 rounded-full text-[10px] font-bold text-blue-600 flex items-center justify-center shadow-sm">
                      {i + 1}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-semibold text-slate-900 mb-2">{step.title}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">{step.description}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </StaggerContainer>
      </div>
    </section>
  );
}

