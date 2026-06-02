"use client";

import { team } from "./data";
import { AnimateIn, StaggerContainer, fadeUp, motion } from "./animations";

export function Team() {
  return (
    <section id="equipa" className="py-24 bg-slate-50/60">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <AnimateIn className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 bg-rose-50 text-rose-600 text-xs font-semibold rounded-full border border-rose-100 mb-4">
            A nossa equipa
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-4">
            Especialistas dedicados
            <br />
            <span className="text-rose-500">à sua saúde</span>
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto leading-relaxed">
            Conheça os profissionais que formam a nossa equipa multidisciplinar, todos com formação avançada e anos de experiência clínica.
          </p>
        </AnimateIn>

        <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {team.map((member) => (
            <motion.div
              key={member.name}
              variants={fadeUp}
              className="group bg-white rounded-2xl overflow-hidden border border-slate-100 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300"
            >
              {/* Avatar */}
              <div className={`bg-linear-to-br ${member.gradient} h-36 flex items-center justify-center relative overflow-hidden`}>
                <div className="absolute inset-0 bg-black/5" />
                <div className="relative w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/30">
                  <span className="text-2xl font-bold text-white">{member.initials}</span>
                </div>
                {/* Decorative circles */}
                <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-white/10 rounded-full" />
                <div className="absolute top-2 right-2 w-8 h-8 bg-white/10 rounded-full" />
              </div>

              {/* Info */}
              <div className="p-5">
                <h3 className="font-semibold text-slate-900 text-sm mb-0.5">{member.name}</h3>
                <p className="text-xs text-blue-600 font-medium mb-3">{member.role}</p>
                <p className="text-xs text-slate-500 leading-relaxed">{member.bio}</p>
              </div>
            </motion.div>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}

