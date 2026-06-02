"use client";

import { Activity, Dumbbell, Waves, Heart, Zap, Scan, ArrowRight } from "lucide-react";
import { services } from "./data";
import { AnimateIn, StaggerContainer, fadeUp } from "./animations";
import { motion } from "./animations";

const ICONS = { Activity, Dumbbell, Waves, Heart, Zap, Scan } as const;

export function Services() {
  return (
    <section id="servicos" className="py-24 bg-slate-50/60" aria-labelledby="services-heading">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        {/* Header */}
        <AnimateIn className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 bg-blue-50 text-blue-600 text-xs font-semibold rounded-full border border-blue-100 mb-4">
            Os nossos serviços
          </span>
          <h2 id="services-heading" className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-4">
            Tratamentos especializados
            <br />
            <span className="text-blue-600">para cada necessidade</span>
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto leading-relaxed">
            Oferecemos uma gama completa de tratamentos terapêuticos, cada um adaptado às suas necessidades específicas e objetivos de saúde.
          </p>
        </AnimateIn>

        {/* Cards grid */}
        <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((s) => {
            const Icon = ICONS[s.icon as keyof typeof ICONS];
            return (
              <motion.article
                key={s.id}
                variants={fadeUp}
                aria-label={s.title}
                className={`group bg-white rounded-2xl border ${s.border} p-7 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 cursor-pointer`}
              >
                {/* Icon */}
                <div className={`inline-flex items-center justify-center w-12 h-12 bg-linear-to-br ${s.color} rounded-2xl mb-5 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={`w-5 h-5 ${s.accent}`} />
                </div>

                <h3 className="text-base font-semibold text-slate-900 mb-2">{s.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed mb-5">{s.description}</p>

                <div className={`flex items-center gap-1.5 text-xs font-semibold ${s.accent} group-hover:gap-2.5 transition-all`}>
                  Saber mais
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </motion.article>
            );
          })}
        </StaggerContainer>
      </div>
    </section>
  );
}

