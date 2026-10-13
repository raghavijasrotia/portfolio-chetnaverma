"use client";
import { useEffect, useState } from "react";
import { PortfolioData, SiteSettings } from "@/lib/types";
import { Loader2, Save, Check, Layers, AlertCircle } from "lucide-react";

export default function SectionsAdmin() {
  const [data, setData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    fetch("/api/admin/data")
      .then((r) => r.json())
      .then((d: PortfolioData) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => {
        setErrorMsg("Failed to load sections data");
        setLoading(false);
      });
  }, []);

  const handleToggle = (key: keyof SiteSettings["sections"]) => {
    if (!data) return;
    const newData = {
      ...data,
      siteSettings: {
        ...data.siteSettings,
        sections: {
          ...data.siteSettings.sections,
          [key]: !data.siteSettings.sections[key],
        },
      },
    };
    setData(newData);
  };

  const handleSave = async () => {
    if (!data) return;
    setSaving(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const resData = await res.json().catch(() => ({}));
      if (res.ok && resData.success !== false) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        setErrorMsg(resData.error || "Failed to save section settings.");
      }
    } catch {
      setErrorMsg("Network error while saving.");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const sectionKeys = Object.keys(data.siteSettings.sections) as (keyof SiteSettings["sections"])[];
  const sectionMeta: Record<string, { label: string; desc: string }> = {
    hero: {
      label: "Hero Section & Portrait",
      desc: "Top banner with advocate photo, seeking badge, credentials, and contact buttons.",
    },
    about: {
      label: "Chamber & Profile Overview (About Me)",
      desc: "Detailed legal bio, academic pedigree box, and quick contact chips.",
    },
    experience: {
      label: "Legal Internships & Chamber Practice",
      desc: "Courtroom exposure, senior advocate chamber internships, and High Court practice.",
    },
    skills: {
      label: "Areas of Law & Legal Competencies",
      desc: "Categorized skills like Substantive Law, Procedural Law, Legal Research, and Drafting.",
    },
    projects: {
      label: "Moot Courts, Memorials & Research Papers",
      desc: "National moot court competitions, client counselling, and legal journal publications.",
    },
    education: {
      label: "Academic Qualifications (CGC Mohali & Schooling)",
      desc: "Law school degree (B.A. LL.B) and 10th & 12th schooling from Mount Litera Zee School.",
    },
    certifications: {
      label: "Legal Honors & Certifications",
      desc: "SCC Online, Manupatra, LexisNexis, or bar council training certifications.",
    },
    resume: {
      label: "CV / Resume Download Buttons",
      desc: "Download button in hero, navbar, and dedicated resume section.",
    },
    contact: {
      label: "Chamber Contact & Consultation Section",
      desc: "Direct legal email, phone, and WhatsApp contact card.",
    },
    social: {
      label: "Professional & Legal Social Links",
      desc: "LinkedIn, SCC Online profile, LiveLaw, and other professional links.",
    },
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <Layers className="w-6 h-6 text-amber-700" /> Section Visibility Controls
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Turn sections on or off with a single click. If you are a fresher and don&apos;t have chamber experience yet, you can easily turn off &ldquo;Legal Internships&rdquo;.
          </p>
          {errorMsg && <p className="text-xs text-red-600 mt-1">{errorMsg}</p>}
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-70 transition shrink-0 shadow-sm"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
        </button>
      </div>

      <div className="p-4 rounded-xl bg-blue-50 border border-blue-200/80 flex items-start gap-3 text-xs text-blue-900 leading-relaxed">
        <AlertCircle className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
        <div>
          <strong>Fresher / Customization Note:</strong> Disabling a section will hide it from the public portfolio immediately without deleting any saved data. You can re-enable it at any time!
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm divide-y divide-slate-100">
        {sectionKeys.map((key) => {
          const isVisible = data.siteSettings.sections[key];
          const info = sectionMeta[key] || { label: key, desc: "Section content on public portfolio." };

          return (
            <div key={key} className="flex items-center justify-between px-6 py-4.5 hover:bg-slate-50/70 transition">
              <div className="pr-4">
                <p className="font-semibold text-slate-900 text-sm">{info.label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{info.desc}</p>
                <span
                  className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md mt-1.5 ${
                    isVisible
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-slate-100 text-slate-500 border border-slate-200"
                  }`}
                >
                  {isVisible ? "● Visible on Website" : "○ Hidden from Website"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleToggle(key)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none shrink-0 ${
                  isVisible ? "bg-amber-600" : "bg-slate-200"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow ${
                    isVisible ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
