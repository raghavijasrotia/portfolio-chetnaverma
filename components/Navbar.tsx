"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Scale, FileText } from "lucide-react";
import { SectionVisibility, Profile } from "@/lib/types";

interface NavbarProps {
  sections: SectionVisibility;
  profile?: Profile;
  resumeUrl?: string;
  hasExperience?: boolean;
  hasProjects?: boolean;
  hasEducation?: boolean;
  hasSkills?: boolean;
  hasCerts?: boolean;
}

export default function Navbar({
  sections,
  profile,
  resumeUrl,
  hasExperience = true,
  hasProjects = true,
  hasEducation = true,
  hasSkills = true,
  hasCerts = true,
}: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "About", href: "#about", show: sections.about },
    { name: "Academics", href: "#education", show: sections.education && hasEducation },
    { name: "Chamber Experience", href: "#experience", show: sections.experience && hasExperience },
    { name: "Legal Skills", href: "#skills", show: sections.skills && hasSkills },
    { name: "Moot Courts", href: "#projects", show: sections.projects && hasProjects },
    { name: "Certifications", href: "#certifications", show: sections.certifications && hasCerts },
  ].filter(l => l.show);

  // Parse title or name
  const fullName = profile?.name || "Chetna Verma";
  const badgeText = profile?.academicBadge || "B.A. LL.B · CGC Mohali";

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "glass py-3.5" : "bg-transparent py-5"}`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#072a24] to-[#0f3d35] border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-md shadow-emerald-950/10 group-hover:scale-105 transition-transform">
            <Scale className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <span className="font-serif font-bold text-lg tracking-tight text-slate-900 block leading-tight">
              {fullName}
            </span>
            {badgeText && (
              <span className="text-[10px] font-semibold tracking-widest text-slate-500 uppercase block">
                {badgeText}
              </span>
            )}
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-7">
          {navLinks.map(link => (
            <Link key={link.name} href={link.href} className="text-sm font-medium text-slate-700 hover:text-emerald-700 transition-colors">
              {link.name}
            </Link>
          ))}
          
          {resumeUrl && sections.resume && (
            <a
              href={resumeUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-full border border-emerald-600/30 text-emerald-900 bg-emerald-50/70 hover:bg-emerald-100/80 transition"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-700" />
              CV / Resume
            </a>
          )}

          {sections.contact && (
            <Link href="#contact" className="px-5 py-2 rounded-full bg-[#072a24] text-emerald-300 text-xs font-bold uppercase tracking-wider hover:bg-[#0f3d35] hover:text-white transition-all shadow-sm border border-emerald-500/30">
              Contact
            </Link>
          )}
        </div>

        <button className="md:hidden p-2 text-slate-700" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle Navigation">
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xl py-5 px-6 flex flex-col gap-3.5">
          {navLinks.map(link => (
            <Link key={link.name} href={link.href} className="text-base font-medium text-slate-800 py-1.5 border-b border-slate-100" onClick={() => setMobileOpen(false)}>
              {link.name}
            </Link>
          ))}
          {resumeUrl && sections.resume && (
            <a
              href={resumeUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 py-2.5 rounded-xl border border-emerald-600/30 text-emerald-900 bg-emerald-50 text-sm font-semibold"
              onClick={() => setMobileOpen(false)}
            >
              <FileText className="w-4 h-4 text-emerald-700" />
              View Legal Resume / CV
            </a>
          )}
          {sections.contact && (
            <Link href="#contact" className="mt-1 px-5 py-3 rounded-xl bg-[#072a24] text-emerald-300 text-center font-bold text-sm tracking-wider uppercase" onClick={() => setMobileOpen(false)}>
              Contact Chamber
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
