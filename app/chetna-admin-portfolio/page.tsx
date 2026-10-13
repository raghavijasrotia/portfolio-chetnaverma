"use client";
import { useEffect, useState } from "react";
import { PortfolioData } from "@/lib/types";
import Link from "next/link";
import { User, Briefcase, Scale, FolderGit2, Award, GraduationCap, FileText, Link as LinkIcon, Layers, ExternalLink, Loader2 } from "lucide-react";

function getEffectiveStatus(availability: PortfolioData['availability']) {
  if (availability.statusMode === 'auto' && availability.lastWorkingDay) {
    const lastDay = new Date(availability.lastWorkingDay);
    const today = new Date(); today.setHours(0,0,0,0);
    if (today <= lastDay) return 'Serving Notice Period';
    return 'Open to Work';
  }
  const map: Record<string,string> = { notice_period:'Serving Notice Period', available:'Available for Internships', open_to_work:'Seeking Legal Internship', not_available:'Not Available', part_time:'Part-Time Intern', freelance:'Pro Bono / Research', contract:'Chamber Trainee' };
  return map[availability.status] || availability.status;
}

function getProfileCompletion(data: PortfolioData): number {
  const checks = [
    !!data.profile.profileImage, !!data.profile.bio, !!data.profile.email, !!data.profile.phone,
    !!data.profile.location, data.experience.length > 0, data.skills.length > 0,
    data.projects.length > 0, data.certifications.length > 0, data.education.length > 0,
    !!data.siteSettings.resumeUrl, data.socialLinks.length > 0,
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

export default function AdminDashboard() {
  const [data, setData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/data").then(r => r.json()).then((d: PortfolioData) => { setData(d); setLoading(false); });
  }, []);

  if (loading || !data) return <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-amber-600" /></div>;

  const startDates = data.experience
    .map(e => new Date(e.startDate).getTime())
    .filter(t => !isNaN(t));
  const earliest = startDates.length > 0 ? Math.min(...startDates) : Date.now();
  const years = Math.max(0, Math.floor((Date.now() - earliest) / (1000 * 60 * 60 * 24 * 365.25)));
  const currentExp = data.experience.find(e => e.isCurrent);
  const completion = getProfileCompletion(data);
  const status = getEffectiveStatus(data.availability);

  const statCards = [
    { label: 'Chamber Experience', value: `${data.experience.length} records`, icon: Briefcase, color: 'blue', href: '/chetna-admin-portfolio/experience' },
    { label: 'Moot Courts & Papers', value: `${data.projects.length} total`, sub: `${data.projects.filter(p=>p.isFeatured).length} featured`, icon: FolderGit2, color: 'purple', href: '/chetna-admin-portfolio/projects' },
    { label: 'Legal Skills', value: `${data.skills.length} skills`, sub: `${data.skills.filter(s=>s.isVisible).length} visible`, icon: Scale, color: 'cyan', href: '/chetna-admin-portfolio/skills' },
    { label: 'Certifications', value: `${data.certifications.length}`, sub: data.certifications[0]?.name.split('–')[0] || '', icon: Award, color: 'amber', href: '/chetna-admin-portfolio/certifications' },
    { label: 'Education & Academics', value: `${data.education.length} records`, icon: GraduationCap, color: 'green', href: '/chetna-admin-portfolio/education' },
    { label: 'Social / Contact', value: `${data.socialLinks.length} links`, sub: `${data.socialLinks.filter(s=>s.isVisible).length} visible`, icon: LinkIcon, color: 'pink', href: '/chetna-admin-portfolio/social' },
  ];

  const colorMap: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600', purple: 'bg-purple-50 text-purple-600',
    cyan: 'bg-cyan-50 text-cyan-600', amber: 'bg-amber-50 text-amber-600',
    green: 'bg-green-50 text-green-600', pink: 'bg-pink-50 text-pink-600',
  };

  const quickLinks = [
    { name: 'Edit Profile & Photo', href: '/chetna-admin-portfolio/profile', icon: User },
    { name: 'Upload CV / Resume', href: '/chetna-admin-portfolio/resume', icon: FileText },
    { name: 'Manage Sections', href: '/chetna-admin-portfolio/sections', icon: Layers },
    { name: 'Preview Public Site', href: '/', icon: ExternalLink, target: '_blank' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Legal CMS Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Welcome back, {data.profile.name}. Here's your legal portfolio overview.</p>
      </div>

      {/* Status Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-6 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">Current Status</p>
          <p className="font-bold text-slate-900">{status}</p>
          {data.availability.availableFrom && <p className="text-xs text-slate-400 mt-0.5">Available from {new Date(data.availability.availableFrom).toLocaleDateString(undefined, {month:'long', year:'numeric'})}</p>}
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-slate-500">Current Affiliation / Chamber</p>
          <p className="font-bold text-slate-900">{currentExp?.company || 'CGC University, Mohali'}</p>
          <p className="text-xs text-slate-400">{currentExp?.position || 'B.A. LL.B Scholar'}</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-slate-500">Work Mode</p>
          <p className="font-bold text-slate-900">{data.availability.currentWorkMode}</p>
        </div>
        <Link href="/chetna-admin-portfolio/profile" className="shrink-0 text-xs font-semibold text-emerald-700 hover:underline">Edit →</Link>
      </div>

      {/* Profile Completion */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold text-slate-700">Profile Completion</p>
          <p className="text-sm font-bold text-blue-600">{completion}%</p>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all" style={{ width: `${completion}%` }} />
        </div>
        {completion < 100 && (
          <p className="text-xs text-slate-400 mt-2">
            {!data.profile.profileImage && '· Upload profile photo '}{!data.siteSettings.resumeUrl && '· Upload resume '}
          </p>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {statCards.map(card => {
          const Icon = card.icon;
          return (
            <Link key={card.label} href={card.href} className="bg-white border border-slate-200 rounded-2xl p-4 hover:shadow-md transition-shadow group">
              <div className={`w-9 h-9 rounded-xl ${colorMap[card.color]} flex items-center justify-center mb-3`}>
                <Icon className="w-4 h-4" />
              </div>
              <p className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{card.value}</p>
              <p className="text-xs font-medium text-slate-500 mt-0.5">{card.label}</p>
              {card.sub && <p className="text-xs text-slate-400">{card.sub}</p>}
            </Link>
          );
        })}
      </div>

      {/* Quick Links */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5">
        <p className="font-semibold text-slate-800 text-sm mb-3">Quick Actions</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickLinks.map(link => {
            const Icon = link.icon;
            return (
              <Link key={link.name} href={link.href} target={(link as any).target} className="flex flex-col items-center gap-2 p-3 rounded-xl border border-slate-100 text-center hover:bg-blue-50 hover:border-blue-200 transition group">
                <Icon className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition" />
                <span className="text-xs font-medium text-slate-600 group-hover:text-blue-700">{link.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
