"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, CalendarCheck, Shield, Star, Users } from "lucide-react";
import { stats } from "./data";
import { fadeUp, slideRight, stagger } from "./animations";

const badges = [
  { icon: Shield,       text: "Profissionais certificados" },
  { icon: Star,         text: "98% de satisfação" },
  { icon: CalendarCheck,text: "Marcação em 2 min" },
];

export function Hero() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const handleScroll = (href: string) => {
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="inicio" className="relative min-h-screen flex items-center overflow-hidden bg-white" aria-label="Início">
      {/* Background decorations */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-linear-to-bl from-blue-50/80 via-sky-50/40 to-transparent rounded-full -translate-y-1/3 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-linear-to-tr from-emerald-50/60 to-transparent rounded-full translate-y-1/3 -translate-x-1/4" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-blue-50/20 rounded-full blur-3xl" />
        {/* Grid pattern */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e40af" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-5 sm:px-8 pt-24 pb-16 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">

          {/* Left — Text */}
          <motion.div
            initial={mounted ? "hidden" : false}
            animate="visible"
            variants={stagger}
            className="space-y-8"
          >
            {/* Pill badge */}
            <motion.div variants={fadeUp}>
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                Clínica Premium em Lisboa
              </span>
            </motion.div>

            {/* Headline */}
            <motion.div variants={fadeUp} className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-[3.4rem] font-bold text-slate-900 leading-[1.1] tracking-tight">
                Cuidamos do seu{" "}
                <span className="relative inline-block">
                  <span className="text-blue-600">corpo</span>
                  <svg className="absolute -bottom-1 left-0 w-full" viewBox="0 0 200 8" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                    <path d="M2 6C40 2 80 2 120 4C160 6 180 4 198 2" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round"/>
                  </svg>
                </span>{" "}
                com tecnologia, experiência e atenção personalizada.
              </h1>
              <p className="text-lg text-slate-500 leading-relaxed max-w-xl">
                Fisioterapia, pilates e massagens terapêuticas para melhorar a sua qualidade de vida — com uma equipa de profissionais dedicados ao seu bem-estar.
              </p>
            </motion.div>

            {/* Badges */}
            <motion.div variants={fadeUp} className="flex flex-wrap gap-3">
              {badges.map((b) => {
                const Icon = b.icon;
                return (
                  <div key={b.text} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-600 shadow-sm">
                    <Icon className="w-3.5 h-3.5 text-blue-500" />
                    {b.text}
                  </div>
                );
              })}
            </motion.div>

            {/* CTAs */}
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => handleScroll("#contactos")}
                className="group flex items-center justify-center gap-2 px-7 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-2xl transition-all shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300 active:scale-95 text-sm"
              >
                <CalendarCheck className="w-4 h-4" />
                Marcar Consulta
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => handleScroll("#servicos")}
                className="flex items-center justify-center gap-2 px-7 py-3.5 bg-white border border-slate-200 text-slate-700 font-semibold rounded-2xl hover:bg-slate-50 hover:border-slate-300 transition-all text-sm shadow-sm"
              >
                Conhecer Serviços
              </button>
            </motion.div>

            {/* Stats */}
            <motion.div variants={fadeUp} className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
              {stats.map((s) => (
                <div key={s.label} className="text-center sm:text-left">
                  <p className="text-2xl font-bold text-slate-900">{s.value}</p>
                  <p className="text-xs text-slate-400 mt-0.5 leading-tight">{s.label}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right — Visual */}
          <motion.div
            initial={mounted ? "hidden" : false}
            animate="visible"
            variants={slideRight}
            className="relative hidden lg:block"
          >
            {/* Main card */}
            <div className="relative mx-auto w-full max-w-md">
              {/* Background blob */}
              <div className="absolute inset-0 bg-linear-to-br from-blue-600 to-blue-800 rounded-3xl rotate-3 opacity-10 scale-105" />
              <div className="relative bg-linear-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-3xl p-8 shadow-2xl shadow-blue-900/30">
                {/* Stat cards floating */}
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-5 -left-5 bg-white rounded-2xl p-4 shadow-lg border border-slate-100"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                      <Users className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-slate-900">+2000</p>
                      <p className="text-xs text-slate-400">Pacientes</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  animate={{ y: [0, 8, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="absolute -bottom-5 -right-5 bg-white rounded-2xl p-4 shadow-lg border border-slate-100"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                      <Star className="w-5 h-5 text-amber-500" fill="#f59e0b" />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-slate-900">4.9/5</p>
                      <p className="text-xs text-slate-400">Avaliação</p>
                    </div>
                  </div>
                </motion.div>

                {/* Center content */}
                <div className="py-12 flex flex-col items-center text-center space-y-4">
                  <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center backdrop-blur-sm">
                    <svg viewBox="0 0 64 64" className="w-12 h-12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M32 10C21 10 12 19 12 30C12 41 21 50 32 50C43 50 52 41 52 30C52 19 43 10 32 10Z" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M32 20V40M22 30H42" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">ClinicaPro</p>
                    <p className="text-blue-200 text-sm mt-1">Centro Clínico Premium</p>
                  </div>
                  <div className="flex gap-2 flex-wrap justify-center">
                    {["Fisioterapia", "Pilates", "Massagem"].map((tag) => (
                      <span key={tag} className="px-3 py-1 bg-white/15 text-white text-xs font-medium rounded-full backdrop-blur-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bottom bar */}
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-semibold text-sm">Próxima disponibilidade</p>
                      <p className="text-blue-200 text-xs mt-0.5">Hoje · 14h30</p>
                    </div>
                    <button
                      onClick={() => handleScroll("#contactos")}
                      className="px-4 py-2 bg-white text-blue-700 font-semibold text-xs rounded-xl hover:bg-blue-50 transition-colors"
                    >
                      Reservar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-slate-400"
      >
        <span className="text-xs">Descobrir mais</span>
        <div className="w-5 h-8 border-2 border-slate-300 rounded-full flex items-start justify-center pt-1">
          <div className="w-1 h-2 bg-slate-400 rounded-full" />
        </div>
      </motion.div>
    </section>
  );
}

