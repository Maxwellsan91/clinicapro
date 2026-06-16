"use client";

import { CheckCircle } from "lucide-react";
import { AnimateIn } from "./animations";

const highlights = [
  "Fundada em 2015 por uma equipa de fisioterapeutas especializados",
  "Instalações modernas com equipamentos de última geração",
  "Abordagem centrada no paciente e baseada em evidência científica",
  "Parceria com hospitais e clínicas de referência em Portugal",
  "Formação contínua da equipa em Portugal e no estrangeiro",
];

export function About() {
  return (
    <section id="sobre" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Visual side */}
          <AnimateIn>
            <div className="relative">
              {/* Main card */}
              <div className="relative bg-linear-to-br from-blue-600 to-indigo-700 rounded-3xl p-10 text-white overflow-hidden">
                {/* Decorative circles */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />

                <div className="relative space-y-6">
                  <div className="text-5xl font-black text-white/30">2015</div>
                  <div>
                    <p className="text-3xl font-bold leading-tight">Uma década de cuidados especializados</p>
                    <p className="text-blue-200 mt-3 text-sm leading-relaxed">
                      Desde a nossa fundação, temos como missão proporcionar tratamentos de excelência com uma abordagem humana e personalizada.
                    </p>
                  </div>
                  {/* Metrics */}
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/20">
                    {[
                      { n: "8+",   l: "Anos" },
                      { n: "10+",  l: "Especialistas" },
                      { n: "98%",  l: "Satisfação" },
                    ].map((m) => (
                      <div key={m.l} className="text-center">
                        <p className="text-2xl font-bold text-white">{m.n}</p>
                        <p className="text-blue-200 text-xs">{m.l}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating accent card */}
              <div className="absolute -bottom-6 -right-6 bg-white rounded-2xl p-5 shadow-xl border border-slate-100 max-w-[200px]">
                <p className="text-3xl font-black text-emerald-600 mb-1">+2000</p>
                <p className="text-xs text-slate-500 leading-tight">Pacientes que recuperaram a sua qualidade de vida</p>
              </div>
            </div>
          </AnimateIn>

          {/* Text side */}
          <AnimateIn delay={0.15}>
            <span className="inline-block px-4 py-1.5 bg-blue-50 text-blue-600 text-xs font-semibold rounded-full border border-blue-100 mb-5">
              Sobre a clínica
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-5 leading-tight">
              Saúde e bem-estar com um toque{" "}
              <span className="text-blue-600">humano</span>
            </h2>
            <p className="text-slate-500 leading-relaxed mb-6">
              A GlobalFisio nasceu com a visão de criar um espaço onde ciência e humanidade se encontram. Acreditamos que cada pessoa merece um tratamento digno, eficaz e adaptado à sua realidade.
            </p>
            <p className="text-slate-500 leading-relaxed mb-8">
              Com uma equipa de profissionais altamente qualificados e equipamentos de última geração, somos a escolha de referência para quem procura cuidados de saúde premium em Lisboa.
            </p>

            <ul className="space-y-3">
              {highlights.map((h) => (
                <li key={h} className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-emerald-50 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle className="w-3 h-3 text-emerald-600" />
                  </div>
                  <span className="text-sm text-slate-600">{h}</span>
                </li>
              ))}
            </ul>
          </AnimateIn>
        </div>
      </div>
    </section>
  );
}

