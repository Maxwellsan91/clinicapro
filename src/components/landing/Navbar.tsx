"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { href: "#inicio",    label: "Início" },
  { href: "#servicos",  label: "Serviços" },
  { href: "#sobre",     label: "Sobre" },
  { href: "#equipa",    label: "Equipa" },
  { href: "#contactos", label: "Contactos" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNav = (href: string) => {
    setOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-white/90 backdrop-blur-xl border-b border-slate-100 shadow-sm"
          : "bg-transparent"
      }`}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <button onClick={() => handleNav("#inicio")} className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-linear-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-sm group-hover:shadow-blue-200 transition-shadow">
              <Heart className="w-4 h-4 text-white" fill="white" />
            </div>
            <span className="font-bold text-lg text-slate-900 tracking-tight">Clinica<span className="text-blue-600">Pro</span></span>
          </button>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNav(link.href)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-blue-600 transition-colors"
            >
              Área de Gestão
            </Link>
            <button
              onClick={() => handleNav("#contactos")}
              className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all hover:shadow-lg hover:shadow-blue-200 active:scale-95"
            >
              Marcar Consulta
            </button>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
            className="fixed top-16 inset-x-0 z-40 bg-white/95 backdrop-blur-xl border-b border-slate-100 shadow-xl md:hidden"
          >
            <div className="max-w-7xl mx-auto px-5 py-5 flex flex-col gap-1">
              {navLinks.map((link) => (
                <button
                  key={link.href}
                  onClick={() => handleNav(link.href)}
                  className="text-left px-4 py-3 text-sm font-medium text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                >
                  {link.label}
                </button>
              ))}
              <div className="border-t border-slate-100 mt-3 pt-4 flex flex-col gap-2">
                <Link href="/login" onClick={() => setOpen(false)} className="px-4 py-3 text-sm font-medium text-center text-slate-700 hover:bg-slate-50 rounded-xl border border-slate-200 transition-all">
                  Área de Gestão
                </Link>
                <button
                  onClick={() => handleNav("#contactos")}
                  className="px-4 py-3 text-sm font-semibold text-center text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all"
                >
                  Marcar Consulta
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

