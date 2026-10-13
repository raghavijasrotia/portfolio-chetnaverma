"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, User, Briefcase, Scale, FolderGit2, Award,
  GraduationCap, Link as LinkIcon, LogOut, Menu, X, FileText,
  Layers, Search, Mail, ExternalLink, ChevronRight, AlertTriangle
} from "lucide-react";
import { useState, useEffect } from "react";

const navItems = [
  { name: "Dashboard", href: "/chetna-admin-portfolio", icon: LayoutDashboard, exact: true },
  { name: "Profile", href: "/chetna-admin-portfolio/profile", icon: User },
  { name: "Resume / CV", href: "/chetna-admin-portfolio/resume", icon: FileText },
  { name: "Chamber Experience", href: "/chetna-admin-portfolio/experience", icon: Briefcase },
  { name: "Legal Skills", href: "/chetna-admin-portfolio/skills", icon: Scale },
  { name: "Moot Courts & Papers", href: "/chetna-admin-portfolio/projects", icon: FolderGit2 },
  { name: "Certifications", href: "/chetna-admin-portfolio/certifications", icon: Award },
  { name: "Education", href: "/chetna-admin-portfolio/education", icon: GraduationCap },
  { name: "Social Links", href: "/chetna-admin-portfolio/social", icon: LinkIcon },
  { name: "Contact", href: "/chetna-admin-portfolio/contact", icon: Mail },
  { name: "Sections", href: "/chetna-admin-portfolio/sections", icon: Layers },
  { name: "SEO", href: "/chetna-admin-portfolio/seo", icon: Search },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sysStatus, setSysStatus] = useState<{ isVercel: boolean; redisConfigured: boolean } | null>(null);

  useEffect(() => {
    fetch("/api/admin/status")
      .then(res => res.json())
      .then(data => setSysStatus(data))
      .catch(() => {});
  }, []);

  if (pathname === "/chetna-admin-portfolio/login") return <>{children}</>;

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/chetna-admin-portfolio/login");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-60 bg-white border-r border-slate-200 transform transition-transform duration-200 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} flex flex-col`}>
        <div className="h-14 flex items-center justify-between px-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-600 to-emerald-700 flex items-center justify-center">
              <Scale className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-sm text-slate-900">Chetna CMS</span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-slate-600 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {navItems.map((item) => {
            const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link key={item.name} href={item.href}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? "bg-emerald-50 text-emerald-700 font-semibold" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}
                onClick={() => setIsSidebarOpen(false)}>
                <Icon className={`w-4 h-4 ${isActive ? "text-emerald-600" : "text-slate-400"}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-slate-100 space-y-1">
          <a href="/" target="_blank" rel="noreferrer" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors">
            <ExternalLink className="w-4 h-4 text-slate-400" /> Preview Site
          </a>
          <button onClick={handleLogout} className="flex items-center gap-2.5 px-3 py-2 w-full rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
            <LogOut className="w-4 h-4 text-red-500" /> Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0 flex flex-col">
        <header className="lg:hidden h-14 bg-white border-b border-slate-200 flex items-center px-4 sticky top-0 z-30">
          <button onClick={() => setIsSidebarOpen(true)} className="p-1.5 -ml-1.5 text-slate-600 hover:bg-slate-50 rounded-lg">
            <Menu className="w-5 h-5" />
          </button>
          <span className="ml-2 font-bold text-sm text-slate-900">Portfolio Admin</span>
        </header>

        {sysStatus?.isVercel && !sysStatus?.redisConfigured && (
          <div className="bg-amber-50 border-b border-amber-200 px-4 py-3 text-amber-900 text-xs sm:text-sm flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-950">Vercel Database Connection Required to Save Changes</p>
              <p className="mt-0.5 text-amber-800">
                On Vercel, the filesystem is read-only. Changes will not save until Upstash Redis is connected. In your Vercel Project dashboard: go to <strong>Storage → Connect Database → Upstash Redis</strong> (or add <code>UPSTASH_REDIS_REST_URL</code> and <code>UPSTASH_REDIS_REST_TOKEN</code> to your Project Environment Variables).
              </p>
            </div>
          </div>
        )}

        <div className="p-6 md:p-8 max-w-6xl w-full mx-auto flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}
