"use client";

import { useState } from "react";
import { CalendarCheck, Phone, Mail, MapPin, Clock, CheckCircle } from "lucide-react";
import { AnimateIn } from "./animations";

export function Contact() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    // Simular envio
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    setSent(true);
  };

  return (
    <section id="contactos" className="py-24 bg-slate-50/60">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <AnimateIn className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 bg-blue-50 text-blue-600 text-xs font-semibold rounded-full border border-blue-100 mb-4">
            Contactos
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-4">
            Fale connosco e{" "}
            <span className="text-blue-600">marque a sua consulta</span>
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto leading-relaxed">
            Entre em contacto pela forma que preferir. Respondemos em menos de 2 horas em dias úteis.
          </p>
        </AnimateIn>

        <div className="grid lg:grid-cols-2 gap-10">
          {/* Info */}
          <AnimateIn className="space-y-6">
            {[
              { icon: Phone, label: "Telefone", value: "+351 210 000 000", href: "tel:+351210000000" },
              { icon: Mail,  label: "Email",    value: "info@globalfisio.pt", href: "mailto:info@globalfisio.pt" },
              { icon: MapPin, label: "Morada",  value: "Av. da Liberdade, 150\n1250-096 Lisboa", href: "#" },
              { icon: Clock,  label: "Horário", value: "Seg–Sex: 8h–20h\nSáb: 9h–16h", href: "#" },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.label}
                  href={item.href}
                  className="flex items-start gap-4 p-5 bg-white rounded-2xl border border-slate-100 hover:shadow-md hover:border-slate-200 transition-all group"
                >
                  <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
                    <Icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-medium mb-0.5">{item.label}</p>
                    <p className="text-sm font-semibold text-slate-800 whitespace-pre-line">{item.value}</p>
                  </div>
                </a>
              );
            })}
          </AnimateIn>

          {/* Form */}
          <AnimateIn delay={0.15}>
            <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm">
              {sent ? (
                <div className="flex flex-col items-center justify-center h-full py-10 text-center space-y-4">
                  <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Pedido enviado!</h3>
                  <p className="text-sm text-slate-500 max-w-xs">
                    Recebemos o seu pedido de marcação. Entraremos em contacto em menos de 2 horas.
                  </p>
                  <button onClick={() => setSent(false)} className="text-xs text-blue-600 hover:underline">
                    Enviar outro pedido
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <h3 className="text-base font-semibold text-slate-900 mb-1">Pedido de marcação</h3>
                    <p className="text-xs text-slate-400">Preencha o formulário e entraremos em contacto.</p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <Field label="Nome" required>
                      <input type="text" required placeholder="O seu nome" className={inputCls} />
                    </Field>
                    <Field label="Telefone" required>
                      <input type="tel" required placeholder="+351 9XX XXX XXX" className={inputCls} />
                    </Field>
                  </div>

                  <Field label="Email">
                    <input type="email" placeholder="email@exemplo.pt" className={inputCls} />
                  </Field>

                  <Field label="Serviço pretendido">
                    <select className={inputCls}>
                      <option value="">Seleccionar serviço…</option>
                      {["Fisioterapia", "Pilates Clínico", "Massagem Terapêutica", "Reabilitação", "Recuperação Desportiva", "Avaliação Postural"].map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Mensagem">
                    <textarea rows={3} placeholder="Descreva brevemente a sua situação ou dúvida…" className={inputCls} />
                  </Field>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all text-sm disabled:opacity-60 shadow-md shadow-blue-200 hover:shadow-lg hover:shadow-blue-300"
                  >
                    <CalendarCheck className="w-4 h-4" />
                    {loading ? "A enviar…" : "Enviar pedido de marcação"}
                  </button>
                </form>
              )}
            </div>
          </AnimateIn>
        </div>
      </div>
    </section>
  );
}

const inputCls = "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all";

function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1.5">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

