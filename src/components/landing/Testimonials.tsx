"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Star, Quote } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { testimonials } from "./data";
import { AnimateIn } from "./animations";

export function Testimonials() {
  const [current, setCurrent] = useState(0);

  const prev = () => setCurrent((c) => (c - 1 + testimonials.length) % testimonials.length);
  const next = () => setCurrent((c) => (c + 1) % testimonials.length);

  const t = testimonials[current];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <AnimateIn className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 bg-amber-50 text-amber-600 text-xs font-semibold rounded-full border border-amber-100 mb-4">
            Depoimentos
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-4">
            O que dizem os
            <br />
            <span className="text-amber-500">nossos pacientes</span>
          </h2>
        </AnimateIn>

        <div className="max-w-4xl mx-auto">
          {/* Main carousel */}
          <div className="relative bg-slate-50 rounded-3xl p-8 sm:p-12 border border-slate-100 overflow-hidden">
            {/* Decorative quote */}
            <Quote className="absolute top-8 right-8 w-12 h-12 text-blue-100" fill="currentColor" />

            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.35 }}
                className="space-y-6"
              >
                {/* Stars */}
                <div className="flex gap-1">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-amber-400" fill="#fbbf24" />
                  ))}
                </div>

                {/* Comment */}
                <blockquote className="text-lg sm:text-xl text-slate-700 leading-relaxed font-light italic">
                  "{t.comment}"
                </blockquote>

                {/* Author */}
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 bg-linear-to-br ${t.gradient} rounded-2xl flex items-center justify-center text-white font-bold`}>
                    {t.initials}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{t.name}</p>
                    <p className="text-sm text-slate-400">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between mt-6">
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`transition-all duration-300 rounded-full ${
                    i === current ? "w-8 h-2.5 bg-blue-600" : "w-2.5 h-2.5 bg-slate-200 hover:bg-slate-300"
                  }`}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={prev}
                className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center hover:bg-slate-50 hover:border-slate-300 transition-all"
              >
                <ChevronLeft className="w-4 h-4 text-slate-600" />
              </button>
              <button
                onClick={next}
                className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center hover:bg-blue-700 transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          {/* Side cards (desktop only) */}
          <div className="hidden lg:grid grid-cols-3 gap-4 mt-8">
            {testimonials.slice(0, 3).map((test, i) => (
              <button
                key={test.name}
                onClick={() => setCurrent(i)}
                className={`text-left bg-white rounded-2xl p-4 border transition-all ${
                  i === current ? "border-blue-200 shadow-md shadow-blue-50" : "border-slate-100 hover:border-slate-200 hover:shadow-sm"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-8 h-8 bg-linear-to-br ${test.gradient} rounded-lg flex items-center justify-center text-white text-xs font-bold`}>
                    {test.initials}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-900">{test.name}</p>
                    <div className="flex gap-0.5">
                      {Array.from({ length: test.rating }).map((_, j) => (
                        <Star key={j} className="w-2.5 h-2.5 text-amber-400" fill="#fbbf24" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{test.comment}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

