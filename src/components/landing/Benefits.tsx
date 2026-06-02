"use client";

import { UserCheck, Award, Cpu, LayoutGrid, RefreshCw, Shield } from "lucide-react";
import { benefits } from "./data";
import { AnimateIn, StaggerContainer, fadeUp, motion } from "./animations";

const ICONS = { UserCheck, Award, Cpu, LayoutGrid, RefreshCw, Shield } as const;

export function Benefits() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Left text */}
          <AnimateIn>
            <span className="inline-block px-4 py-1.5 bg-emerald-50 text-emerald-600 text-xs font-semibold rounded-full border border-emerald-100 mb-5">
              Porque escolher-nos
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-5 leading-tight">
              A excelência que
              <br />
              <span className="text-emerald-600">merece</span>
            </h2>
            <p className="text-slate-500 leading-relaxed mb-8 max-w-md">
              Na ClinicaPro, cada detalhe é pensado para garantir a melhor experiência de tratamento possível, desde o momento que entra até ao total restabelecimento da sua saúde.
            </p>

            {/* Highlight metrics */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { num: "98%", text: "Taxa de satisfação" },
                { num: "+15", text: "Anos de experiência" },
                { num: "+2000", text: "Pacientes tratados" },
                { num: "10+", text: "Especialistas" },
              ].map((m) => (
                <div key={m.text} className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <p className="text-2xl font-bold text-blue-600 mb-1">{m.num}</p>
                  <p className="text-xs text-slate-500">{m.text}</p>
                </div>
              ))}
            </div>
          </AnimateIn>

          {/* Right grid */}
          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {benefits.map((b) => {
              const Icon = ICONS[b.icon as keyof typeof ICONS];
              return (
                <motion.div
                  key={b.title}
                  variants={fadeUp}
                  className="bg-slate-50 rounded-2xl p-5 border border-slate-100 hover:bg-white hover:shadow-md hover:border-slate-200 transition-all"
                >
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
                    <Icon className="w-4.5 h-4.5 text-blue-600" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-800 mb-1.5">{b.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{b.description}</p>
                </motion.div>
              );
            })}
          </StaggerContainer>
        </div>
      </div>
    </section>
  );
}

