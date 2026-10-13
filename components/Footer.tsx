import { SocialLink } from "@/lib/types";
import { Scale, GraduationCap } from "lucide-react";

interface FooterProps {
  social: SocialLink[];
  name: string;
  title: string;
}

export default function Footer({ social, name, title }: FooterProps) {
  return (
    <footer className="bg-[#041c18] border-t border-emerald-950/40 text-slate-400 py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#072a24] border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Scale className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <span className="font-serif font-bold text-lg text-white block">{name}</span>
              <p className="text-xs text-emerald-300/80">{title}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-300 bg-[#072a24]/80 px-3.5 py-2 rounded-xl border border-emerald-900/60">
            <GraduationCap className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>B.A. LL.B &middot; CGC University Mohali | Mount Litera &middot; KV Kathua</span>
          </div>

          {social.length > 0 && (
            <div className="flex items-center gap-5">
              {social.map(link => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-medium text-slate-400 hover:text-emerald-300 transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Bar Council of India Compliance Disclaimer */}
        <div className="mt-8 pt-6 border-t border-emerald-900/50 text-xs text-slate-400 leading-relaxed">
          <p className="bg-[#072a24]/50 p-4 rounded-xl border border-emerald-900/60 text-[11px] text-slate-300">
            <strong className="text-emerald-400 uppercase tracking-wider block mb-1">Bar Council of India Compliance Note:</strong>
            As per the rules of the Bar Council of India, advocates and law students are not permitted to advertise or solicit work. This online portfolio is maintained exclusively for educational reference, academic records, and legal internship evaluation. Nothing on this website constitutes formal legal solicitation, advertisement, or legal advice.
          </p>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} {name}. All rights reserved.</p>
          <p className="flex items-center gap-1.5 text-slate-400">
            Law, Equity & Justice &middot; <span className="text-emerald-400 font-serif">Fiat Justitia Ruat Caelum</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
