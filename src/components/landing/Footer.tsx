"use client";

import Link from "next/link";
import { Heart, Phone, Mail, MapPin } from "lucide-react";

// Social icons as SVGs (lucide-react doesn't include social brand icons)
function IconInstagram({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <circle cx="12" cy="12" r="4"/>
      <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none"/>
    </svg>
  );
}
function IconFacebook({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
    </svg>
  );
}
function IconLinkedIn({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/>
      <circle cx="4" cy="4" r="2"/>
    </svg>
  );
}

const footerLinks = {
  "Serviços": ["Fisioterapia", "Pilates Clínico", "Massagem Terapêutica", "Reabilitação", "Recuperação Desportiva", "Avaliação Postural"],
  "Clínica":  ["Sobre Nós", "A Nossa Equipa", "Qualidade e Certificações", "Parcerias", "Trabalhe Connosco"],
  "Informação": ["Política de Privacidade", "Termos e Condições", "Política de Cookies", "FAQ"],
};

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-16">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-2 space-y-5">
            <Link href="/" className="flex items-center gap-2.5 group w-fit">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center">
                <Heart className="w-4 h-4 text-white" fill="white" />
              </div>
              <span className="font-bold text-xl text-white tracking-tight">Global<span className="text-blue-400">Fisio</span></span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
              Centro de fisioterapia, pilates clínico e massagem terapêutica em Lisboa. Cuidamos do seu corpo com tecnologia, experiência e atenção personalizada.
            </p>
            {/* Contacts */}
            <div className="space-y-2.5">
              {[
                { icon: Phone, text: "+351 210 000 000" },
                { icon: Mail,  text: "info@globalfisio.pt" },
                { icon: MapPin,text: "Av. da Liberdade, 150 · Lisboa" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2.5 text-sm text-slate-400">
                  <Icon className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  {text}
                </div>
              ))}
            </div>
            {/* Social */}
            <div className="flex items-center gap-3">
              {[
                { Icon: IconInstagram, href: "#", label: "Instagram" },
                { Icon: IconFacebook,  href: "#", label: "Facebook" },
                { Icon: IconLinkedIn,  href: "#", label: "LinkedIn" },
              ].map(({ Icon, href, label }) => (
                <Link
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 bg-slate-800 hover:bg-blue-600 rounded-xl flex items-center justify-center transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </Link>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title} className="space-y-4">
              <h4 className="text-sm font-semibold text-white">{title}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link}>
                    <Link href="#" className="text-sm text-slate-400 hover:text-blue-400 transition-colors">
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} GlobalFisio. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span>Feito com</span>
            <Heart className="w-3 h-3 text-rose-500" fill="#f43f5e" />
            <span>em Lisboa, Portugal</span>
          </div>
          <Link href="/login" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
            Área de Gestão →
          </Link>
        </div>
      </div>
    </footer>
  );
}

