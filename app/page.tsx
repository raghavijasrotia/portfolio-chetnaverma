import type { Metadata } from "next";
import { getPortfolioData } from "@/lib/storage";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  ArrowRight, Download, Scale, CheckCircle2, Calendar,
  MapPin, ExternalLink, GraduationCap,
  Award, FolderGit2, Mail, Phone, MessageSquare, Briefcase, BookOpen,
  FileText, ShieldCheck, Sparkles, ScrollText, Landmark
} from "lucide-react";

export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  try {
    const data = await getPortfolioData();
    const { seo } = data.siteSettings;
    return {
      title: seo.title || "Chetna Verma | B.A. LL.B Scholar & Legal Intern | CGC University Mohali",
      description: seo.description,
      keywords: seo.keywords,
      authors: [{ name: seo.author }],
      robots: {
        index: seo.robotsIndex,
        follow: seo.robotsFollow,
      },
      openGraph: {
        title: seo.ogTitle || seo.title,
        description: seo.ogDescription || seo.description,
        images: seo.ogImage ? [seo.ogImage] : [],
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: seo.twitterTitle || seo.title,
        description: seo.twitterDescription || seo.description,
        images: seo.twitterImage ? [seo.twitterImage] : [],
      },
    };
  } catch {
    return {
      title: "Chetna Verma | B.A. LL.B Scholar & Legal Intern | CGC University Mohali",
      description: "Law scholar at CGC University Mohali, schooling from Mount Litera Zee School (60%) & KV Kathua (57%). Actively seeking legal internships.",
    };
  }
}

function formatDate(dateStr?: string, fullMonth: boolean = false): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length >= 2) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parts[2] ? parseInt(parts[2], 10) : 1;
    const d = new Date(year, month, day);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('en-US', { month: fullMonth ? 'long' : 'short', year: 'numeric' });
    }
  }
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) {
    return d.toLocaleDateString('en-US', { month: fullMonth ? 'long' : 'short', year: 'numeric' });
  }
  return dateStr;
}

export default async function Home() {
  const data = await getPortfolioData();
  const { profile, availability, experience, skills, projects, certifications, education, socialLinks, contact, siteSettings } = data;
  const sections = siteSettings.sections;

  const visibleSkills = skills.filter(s => s.isVisible).sort((a, b) => a.displayOrder - b.displayOrder);
  const visibleExperience = experience.filter(e => e.isVisible).sort((a, b) => a.displayOrder - b.displayOrder);
  const visibleProjects = projects.filter(p => p.isVisible).sort((a, b) => a.displayOrder - b.displayOrder);
  const featuredProjects = visibleProjects.filter(p => p.isFeatured);
  const otherProjects = visibleProjects.filter(p => !p.isFeatured);
  const visibleCerts = certifications.filter(c => c.isVisible).sort((a, b) => a.displayOrder - b.displayOrder);
  const visibleEducation = education.filter(e => e.isVisible).sort((a, b) => a.displayOrder - b.displayOrder);
  const visibleSocials = socialLinks.filter(s => s.isVisible).sort((a, b) => a.displayOrder - b.displayOrder);

  // Group skills by category
  const skillsByCategory = visibleSkills.reduce((acc, skill) => {
    const cat = skill.category || "General Legal Skills";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(skill);
    return acc;
  }, {} as Record<string, typeof skills>);

  return (
    <>
      <Navbar
        sections={sections}
        profile={profile}
        resumeUrl={siteSettings.resumeUrl}
        hasExperience={visibleExperience.length > 0}
        hasProjects={visibleProjects.length > 0}
        hasEducation={visibleEducation.length > 0}
        hasSkills={visibleSkills.length > 0}
        hasCerts={visibleCerts.length > 0}
      />

      <main className="flex-1 w-full pt-16">

        {/* HERO SECTION */}
        {sections.hero && (
          <section id="hero" className="min-h-[92vh] flex items-center justify-center relative overflow-hidden px-6 py-16">
            {/* Background ambient glows */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[450px] h-[450px] bg-[#072a24]/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-6xl mx-auto text-center relative z-10 flex flex-col items-center">
              
              {/* Seeking Internship Banner */}
              {profile.showSeekingBanner !== false && (
                <div className="mb-6 inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/90 backdrop-blur-md border border-emerald-600/30 shadow-sm">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs sm:text-sm font-semibold text-stone-800 tracking-wide">
                    {profile.seekingBannerText || "Actively Seeking Legal Internship · Chamber / Firm Trainee"}
                  </span>
                  {profile.seekingBannerDegree && (
                    <span className="hidden sm:inline-block text-xs font-serif font-bold text-emerald-800 bg-emerald-100/70 px-2.5 py-0.5 rounded-full">
                      {profile.seekingBannerDegree}
                    </span>
                  )}
                </div>
              )}

              {/* Portrait Display */}
              <div className="relative mb-6 group">
                <div className="absolute inset-0 bg-gradient-to-tr from-emerald-600 to-[#072a24] rounded-3xl blur-xl opacity-25 group-hover:opacity-40 transition-opacity duration-500" />
                <div className="relative p-1.5 rounded-3xl bg-gradient-to-b from-emerald-400 via-stone-200 to-emerald-700 shadow-2xl">
                  <img
                    src={profile.profileImage || "/images/chetna-avatar.jpg"}
                    alt={profile.name}
                    className="w-36 h-36 md:w-44 md:h-44 rounded-[22px] object-cover object-top border-2 border-white shadow-inner transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                  <div className="absolute -bottom-2.5 -right-2.5 bg-[#072a24] text-emerald-300 p-2.5 rounded-2xl border border-emerald-400/40 shadow-lg">
                    <Scale className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Title & Name */}
              <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-extrabold text-[#072a24] tracking-tight mb-3">
                {profile.name}
              </h1>

              <div className="flex flex-wrap items-center justify-center gap-2 text-sm md:text-lg font-medium text-emerald-950/90 mb-4">
                <span className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200/80 px-3.5 py-1 rounded-full text-emerald-900">
                  <Landmark className="w-4 h-4 text-emerald-700" /> {profile.title}
                </span>
                {profile.academicBadge && (
                  <span className="flex items-center gap-1.5 bg-stone-100 border border-stone-200 px-3.5 py-1 rounded-full text-stone-700">
                    <GraduationCap className="w-4 h-4 text-stone-600" /> {profile.academicBadge}
                  </span>
                )}
              </div>

              {/* Academic & Practice Badges */}
              <div className="flex flex-wrap items-center justify-center gap-2 mb-6 max-w-3xl">
                {[
                  "Constitutional Law",
                  "Bharatiya Nyaya Sanhita (BNS)",
                  "Legal Research & SCC Online",
                  "Moot Court Advocacy",
                  "Mount Litera Zee School (60%)",
                  "KV Kathua (57%)"
                ].map(item => (
                  <span
                    key={item}
                    className="px-3 py-1 text-xs font-semibold text-stone-700 bg-white/80 border border-stone-200 rounded-full shadow-2xs"
                  >
                    {item}
                  </span>
                ))}
              </div>

              <p className="text-stone-600 mb-9 max-w-3xl text-base md:text-lg leading-relaxed font-normal">
                {profile.bio}
              </p>

              {/* Call-to-Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3.5">
                <a
                  href="#experience"
                  className="px-6 py-3.5 rounded-xl bg-[#072a24] text-emerald-300 font-bold text-sm hover:bg-[#0f3d35] hover:text-white transition shadow-lg shadow-emerald-950/10 flex items-center gap-2 border border-emerald-500/20"
                >
                  <Briefcase className="w-4 h-4 text-emerald-400" /> Chamber &amp; Courtroom Exposure <ArrowRight className="w-4 h-4" />
                </a>

                {sections.projects && (
                  <a
                    href="#projects"
                    className="px-6 py-3.5 rounded-xl bg-white text-stone-800 font-semibold text-sm hover:bg-stone-50 transition border border-stone-300 shadow-sm flex items-center gap-2"
                  >
                    <ScrollText className="w-4 h-4 text-emerald-700" /> Moot Courts &amp; Papers
                  </a>
                )}

                {siteSettings.resumeUrl && sections.resume && (
                  <a
                    href={siteSettings.resumeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-6 py-3.5 rounded-xl bg-emerald-50 text-emerald-950 font-semibold text-sm hover:bg-emerald-100 transition border border-emerald-300/80 shadow-sm flex items-center gap-2"
                  >
                    <Download className="w-4 h-4 text-emerald-700" /> Download Legal CV
                  </a>
                )}

                {contact.whatsappEnabled && contact.whatsapp && (
                  <a
                    href={`https://wa.me/${contact.whatsapp}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-6 py-3.5 rounded-xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 transition flex items-center gap-2 shadow-sm"
                  >
                    <MessageSquare className="w-4 h-4" /> WhatsApp
                  </a>
                )}
              </div>

              {/* Key Credentials Stats Bar */}
              {profile.showHeroStats !== false && (() => {
                const rawStats = (profile.stats && profile.stats.length > 0)
                  ? profile.stats
                  : [
                      { id: "stat-1", value: "1st Year", label: "B.A. LL.B Scholar", isVisible: true },
                      { id: "stat-2", value: "CGC Mohali", label: "Law School", isVisible: true },
                      { id: "stat-3", value: "Legal Research", label: "SCC & Case Analysis", isVisible: true },
                      { id: "stat-4", value: "20+", label: "Legal Skills", isVisible: true },
                    ];

                const displayStats = rawStats.filter(st => st.isVisible);
                if (displayStats.length === 0) return null;

                return (
                  <div className="mt-14 pt-8 border-t border-stone-200/80 w-full max-w-4xl flex flex-wrap items-center justify-around gap-6 text-center">
                    {displayStats.map((st, sIdx) => (
                      <div key={st.id || sIdx} className="flex items-center">
                        <div>
                          <div className="font-serif text-3xl md:text-4xl font-extrabold text-[#072a24]">
                            {st.value}
                          </div>
                          <div className="text-xs font-bold text-stone-500 uppercase tracking-widest mt-1">
                            {st.label}
                          </div>
                        </div>
                        {sIdx < displayStats.length - 1 && (
                          <div className="w-px h-10 bg-stone-200 hidden sm:block ml-8 sm:ml-12" />
                        )}
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </section>
        )}

        {/* ABOUT & CORE LEGAL SKILLS SECTION */}
        {sections.about && (
          <section id="about" className="py-20 bg-white relative border-y border-stone-200/80">
            <div className="max-w-7xl mx-auto px-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                
                {/* About Profile Column (5 cols) */}
                <div className="lg:col-span-5 space-y-6">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-900 font-semibold text-xs border border-emerald-200 uppercase tracking-wider">
                    <Scale className="w-3.5 h-3.5 text-emerald-700" /> Chamber &amp; Profile Overview
                  </div>

                  <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#072a24] leading-tight">
                    {profile.aboutHeadline || "Dedicated to Constitutional Principles, Rigorous Research & Advocacy"}
                  </h2>

                  <p className="text-stone-600 text-base leading-relaxed">
                    {profile.bio}
                  </p>

                  {profile.showAcademicPedigree !== false && (
                    <div className="p-4 rounded-2xl bg-[#f6faf8] border border-emerald-900/10 space-y-3">
                      <h3 className="font-serif font-bold text-sm text-[#072a24] flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-emerald-700" /> Academic Pedigree
                      </h3>
                      <div className="text-xs text-stone-600 space-y-1.5">
                        {visibleEducation.length > 0 ? (
                          visibleEducation.map((edu, eIdx) => (
                            <p key={edu.id}>
                              <strong>{eIdx === 0 ? "Law School / Degree:" : "Foundational Schooling:"}</strong>{" "}
                              {edu.institution} &mdash; {edu.degree} {edu.grade ? `(${edu.grade})` : ""}
                            </p>
                          ))
                        ) : (
                          <>
                            <p>
                              <strong>Law School:</strong> CGC University (Chandigarh Group of Colleges), Mohali &mdash; B.A. LL.B 1st Year Candidate
                            </p>
                            <p>
                              <strong>12th Senior Secondary:</strong> Mount Litera Zee School, Kathua &mdash; 60%
                            </p>
                            <p>
                              <strong>10th Secondary:</strong> Kendriya Vidyalaya (KV), Kathua &mdash; 57%
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Key Contact / Availability Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-stone-50 border border-stone-100">
                      <div className="w-9 h-9 rounded-lg bg-emerald-100/70 flex items-center justify-center shrink-0">
                        <MapPin className="w-4 h-4 text-emerald-800" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] text-stone-400 font-medium">Location</p>
                        <p className="font-semibold text-stone-800 text-xs truncate">{profile.location}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-xl bg-stone-50 border border-stone-100">
                      <div className="w-9 h-9 rounded-lg bg-emerald-100/70 flex items-center justify-center shrink-0">
                        <Briefcase className="w-4 h-4 text-emerald-800" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] text-stone-400 font-medium">Internship Mode</p>
                        <p className="font-semibold text-stone-800 text-xs truncate">{profile.workMode || "On-site / Hybrid"}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-xl bg-stone-50 border border-stone-100 sm:col-span-2">
                      <div className="w-9 h-9 rounded-lg bg-stone-200/70 flex items-center justify-center shrink-0">
                        <Mail className="w-4 h-4 text-stone-700" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] text-stone-400 font-medium">Official Legal Email</p>
                        <p className="font-semibold text-stone-800 text-xs truncate">{profile.email}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Core Legal Skills Column (7 cols) */}
                {sections.skills && (
                  <div id="skills" className="lg:col-span-7 space-y-6">
                    <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#072a24] text-emerald-300 font-semibold text-xs tracking-wider uppercase">
                        <BookOpen className="w-3.5 h-3.5 text-emerald-400" /> Areas of Law &amp; Legal Competencies
                      </div>
                      <span className="text-xs text-stone-400 font-medium">
                        {visibleSkills.length} Verified Competencies
                      </span>
                    </div>

                    {/* Render ALL categories cleanly */}
                    <div className="space-y-6">
                      {Object.entries(skillsByCategory).map(([category, catSkills]) => (
                        <div key={category} className="p-4.5 rounded-2xl bg-[#f6faf8] border border-stone-200/80 hover:border-emerald-400/50 transition">
                          <div className="flex items-center justify-between mb-2.5">
                            <h3 className="text-xs font-bold text-stone-900 uppercase tracking-widest flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-emerald-600" />
                              {category}
                            </h3>
                            <span className="text-[10px] font-semibold text-stone-400 bg-white px-2 py-0.5 rounded-md border border-stone-200">
                              {catSkills.length} skills
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {catSkills.map(skill => (
                              <span
                                key={skill.id}
                                className="px-3 py-1.5 bg-white border border-stone-200 rounded-lg text-xs text-stone-800 font-medium hover:border-emerald-500 hover:text-emerald-900 transition shadow-2xs"
                              >
                                {skill.name}
                                {skill.level && (
                                  <span className="ml-1.5 text-[10px] text-emerald-700 font-semibold opacity-80">
                                    &bull; {skill.level}
                                  </span>
                                )}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </div>
          </section>
        )}

        {/* EDUCATION & ACADEMICS */}
        {sections.education && visibleEducation.length > 0 && (
          <section id="education" className="py-20 bg-[#f6faf8] relative">
            <div className="max-w-5xl mx-auto px-6">
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-900 font-semibold text-xs border border-emerald-200 uppercase tracking-wider mb-3">
                  <GraduationCap className="w-3.5 h-3.5 text-emerald-700" /> Academic Qualifications
                </div>
                <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#072a24]">
                  Education &amp; Scholastic Credentials
                </h2>
                <p className="text-stone-500 text-sm max-w-xl mx-auto mt-2">
                  Academic foundation from CGC University Mohali, Mount Litera Zee School (60%), and Kendriya Vidyalaya Kathua (57%).
                </p>
              </div>

              <div className="space-y-5">
                {visibleEducation.map((edu, idx) => (
                  <div
                    key={edu.id}
                    className="glass-card rounded-2xl p-6 relative overflow-hidden flex flex-col sm:flex-row items-start justify-between gap-4 border-l-4 border-l-emerald-600"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-md">
                          {idx === 0 ? "Current Law Degree" : "Schooling"}
                        </span>
                        {edu.grade && (
                          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                            {edu.grade}
                          </span>
                        )}
                      </div>
                      <h3 className="font-serif text-xl font-bold text-stone-900">{edu.degree}</h3>
                      <p className="text-sm font-semibold text-emerald-900 flex items-center gap-1.5">
                        <Landmark className="w-4 h-4 text-emerald-700" /> {edu.institution}
                      </p>
                      {edu.description && (
                        <p className="text-xs text-stone-600 leading-relaxed pt-1">
                          {edu.description}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col sm:items-end gap-1.5 shrink-0 text-xs text-stone-500">
                      <span className="flex items-center gap-1.5 bg-stone-100 px-3 py-1 rounded-full font-semibold">
                        <Calendar className="w-3.5 h-3.5 text-stone-400" /> {edu.startYear} &ndash; {edu.endYear}
                      </span>
                      <span className="flex items-center gap-1.5 text-stone-500">
                        <MapPin className="w-3.5 h-3.5 text-stone-400" /> {edu.location}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CHAMBER & LEGAL EXPERIENCE */}
        {sections.experience && visibleExperience.length > 0 && (
          <section id="experience" className="py-20 bg-white relative border-t border-stone-200/80">
            <div className="max-w-5xl mx-auto px-6">
              <div className="text-center mb-14">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-900 font-semibold text-xs border border-emerald-200 uppercase tracking-wider mb-3">
                  <Briefcase className="w-3.5 h-3.5 text-emerald-700" /> Courtroom &amp; Chamber Exposure
                </div>
                <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#072a24]">
                  Legal Internships &amp; Chamber Exposure
                </h2>
                <p className="text-stone-500 text-sm max-w-xl mx-auto mt-2">
                  Hands-on litigation training, legal aid outreach, and court observation across the District Judiciary.
                </p>
              </div>

              <div className="relative space-y-8 pl-6 sm:pl-8 before:absolute before:left-3 sm:before:left-4 before:top-2 before:h-[95%] before:w-0.5 before:bg-gradient-to-b before:from-emerald-600 before:via-emerald-300 before:to-transparent">
                {visibleExperience.map((exp) => (
                  <div key={exp.id} className="relative">
                    <div className="absolute -left-6 sm:-left-8 top-5 w-4 h-4 rounded-full bg-emerald-600 border-4 border-white shadow-md" />
                    
                    <div className="glass-card rounded-2xl p-6 sm:p-7">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                        <div>
                          <h3 className="font-serif text-xl font-bold text-stone-900">{exp.position}</h3>
                          <p className="text-emerald-800 font-semibold text-sm mt-0.5 flex items-center gap-1.5">
                            <Landmark className="w-4 h-4 text-emerald-700" /> {exp.company}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            {exp.location && (
                              <span className="text-xs text-stone-500 flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-stone-400" />
                                {exp.location}
                              </span>
                            )}
                            {exp.workMode && (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                                {exp.workMode}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col sm:items-end gap-1 shrink-0">
                          <span className="flex items-center gap-1.5 text-xs font-semibold text-stone-600 bg-stone-100 px-3 py-1 rounded-full">
                            <Calendar className="w-3.5 h-3.5 text-stone-400" />
                            {formatDate(exp.startDate)} &ndash; {exp.isCurrent ? 'Present' : (exp.endDate ? formatDate(exp.endDate) : 'Present')}
                          </span>
                          {exp.isCurrent && (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              Active Affiliation
                            </span>
                          )}
                        </div>
                      </div>

                      <p className="text-stone-600 text-sm mb-4 leading-relaxed">{exp.description}</p>

                      {exp.responsibilities.length > 0 && (
                        <ul className="space-y-2 mb-4 bg-[#f6faf8] p-4 rounded-xl border border-stone-100">
                          {exp.responsibilities.map((r, i) => (
                            <li key={i} className="flex items-start gap-2.5 text-xs text-stone-700 leading-relaxed">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                              <span>{r}</span>
                            </li>
                          ))}
                        </ul>
                      )}

                      <div className="flex flex-wrap gap-1.5 pt-3 border-t border-stone-100">
                        {exp.technologies.map(tag => (
                          <span key={tag} className="text-[11px] font-medium text-stone-600 bg-white px-2.5 py-1 rounded-md border border-stone-200">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* MOOT COURTS & LEGAL RESEARCH PAPERS */}
        {sections.projects && visibleProjects.length > 0 && (
          <section id="projects" className="py-20 bg-[#072a24] text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 left-0 w-[350px] h-[350px] bg-teal-500/10 rounded-full blur-[100px]" />

            <div className="max-w-7xl mx-auto px-6 relative z-10">
              <div className="text-center mb-14">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0f3d35] text-emerald-300 font-semibold text-xs border border-emerald-500/30 uppercase tracking-wider mb-3">
                  <ScrollText className="w-3.5 h-3.5 text-emerald-400" /> Competitions &amp; Publications
                </div>
                <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white">
                  Moot Courts, Memorials &amp; Legal Research
                </h2>
                <p className="text-slate-300 text-sm max-w-xl mx-auto mt-2">
                  Demonstrated courtroom advocacy, constitutional arguments, and research papers.
                </p>
              </div>

              {featuredProjects.length > 0 && (
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  {featuredProjects.map(project => (
                    <div
                      key={project.id}
                      className="bg-gradient-to-br from-[#0c3930] to-[#06241e] border border-emerald-500/30 rounded-2xl p-6 hover:border-emerald-400/60 transition-all shadow-xl group"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-300">
                            <Scale className="w-5 h-5" />
                          </div>
                          <span className="text-xs font-bold text-emerald-300 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                            ★ Featured Work
                          </span>
                        </div>
                      </div>

                      <h3 className="font-serif text-lg font-bold text-white mb-2 leading-snug">
                        {project.name}
                      </h3>
                      <p className="text-slate-300 text-xs mb-4 leading-relaxed font-normal">
                        {project.shortDescription}
                      </p>

                      {project.architectureHighlights?.length > 0 && (
                        <div className="space-y-1.5 mb-4 bg-black/25 p-3 rounded-xl border border-emerald-950/80">
                          {project.architectureHighlights.map((highlight, idx) => (
                            <p key={idx} className="text-[11px] text-emerald-200/90 flex items-start gap-1.5">
                              <Sparkles className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
                              <span>{highlight}</span>
                            </p>
                          ))}
                        </div>
                      )}

                      <div className="flex flex-wrap gap-1.5 pt-3 border-t border-emerald-900/60">
                        {project.technologies.map(tag => (
                          <span key={tag} className="text-[10px] font-medium text-emerald-300/90 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {otherProjects.length > 0 && (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {otherProjects.map(project => (
                    <div
                      key={project.id}
                      className="bg-[#0c3930]/80 border border-emerald-900/60 rounded-2xl p-5 hover:border-emerald-500/40 transition-all"
                    >
                      <div className="w-9 h-9 rounded-xl bg-emerald-950/80 flex items-center justify-center text-emerald-400 mb-3">
                        <FileText className="w-4 h-4" />
                      </div>
                      <h3 className="font-serif text-sm font-bold text-white mb-1.5">{project.name}</h3>
                      <p className="text-slate-300 text-xs mb-3 line-clamp-3">{project.shortDescription}</p>
                      <div className="flex flex-wrap gap-1 pt-2 border-t border-emerald-900/60">
                        {project.technologies.map(t => (
                          <span key={t} className="text-[10px] text-emerald-200/80 bg-emerald-950/70 px-2 py-0.5 rounded">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* CERTIFICATIONS */}
        {sections.certifications && visibleCerts.length > 0 && (
          <section id="certifications" className="py-20 bg-[#f6faf8] relative">
            <div className="max-w-5xl mx-auto px-6">
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-900 font-semibold text-xs border border-emerald-200 uppercase tracking-wider mb-3">
                  <Award className="w-3.5 h-3.5 text-emerald-700" /> Accreditations
                </div>
                <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#072a24]">
                  Legal Certifications &amp; Diplomas
                </h2>
                <p className="text-stone-500 text-sm max-w-xl mx-auto mt-2">
                  Specialized certifications in SCC Online legal research, Constitutional Law, and Citation Methodology.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {visibleCerts.map(cert => (
                  <div key={cert.id} className="glass-card rounded-2xl p-5 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="w-11 h-11 rounded-xl bg-emerald-100/70 border border-emerald-200 flex items-center justify-center text-emerald-800 mb-3">
                        <Award className="w-5 h-5 text-emerald-700" />
                      </div>
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {cert.level || "Certified"}
                      </span>
                      <h3 className="font-serif text-base font-bold text-stone-900 leading-snug">{cert.name}</h3>
                      <p className="text-xs font-semibold text-emerald-900">{cert.organization}</p>
                    </div>

                    <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-400">
                      <span>{formatDate(cert.issueDate, true)}</span>
                      {cert.credentialId && <span className="font-mono">{cert.credentialId}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CONTACT / CHAMBER INQUIRIES */}
        {sections.contact && (
          <section id="contact" className="py-20 bg-white relative border-t border-stone-200/80">
            <div className="max-w-4xl mx-auto px-6 text-center">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-900 font-semibold text-xs border border-emerald-200 uppercase tracking-wider mb-4">
                <Landmark className="w-3.5 h-3.5 text-emerald-700" /> Chamber Inquiries &amp; Coordination
              </div>

              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#072a24] mb-4">
                Inquire Regarding Internship Opportunities
              </h2>

              <p className="text-stone-600 text-sm md:text-base mb-10 max-w-2xl mx-auto leading-relaxed">
                Currently available for chamber internships, legal research assistance, and law firm trainee roles across Mohali, Chandigarh, and Jammu &amp; Kashmir.
              </p>

              <div className="flex flex-wrap justify-center gap-3.5">
                {contact.email && (
                  <a
                    href={`mailto:${contact.email}?subject=${encodeURIComponent(contact.emailSubject || "Inquiry: Legal Internship Candidate — Chetna Verma")}&body=${encodeURIComponent(contact.emailBody || "")}`}
                    className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#072a24] text-emerald-300 font-bold text-sm hover:bg-[#0f3d35] hover:text-white transition shadow-md"
                  >
                    <Mail className="w-4 h-4 text-emerald-400" /> {contact.email}
                  </a>
                )}

                {contact.whatsapp && (
                  <a
                    href={`https://wa.me/${contact.whatsapp}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 transition shadow-md"
                  >
                    <MessageSquare className="w-4 h-4" /> WhatsApp Inquiries
                  </a>
                )}

                {contact.phone && (
                  <a
                    href={`tel:${contact.phone}`}
                    className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-stone-100 text-stone-800 font-semibold text-sm hover:bg-stone-200 transition border border-stone-200"
                  >
                    <Phone className="w-4 h-4 text-stone-600" /> {contact.phone}
                  </a>
                )}
              </div>

              {sections.social && visibleSocials.length > 0 && (
                <div className="mt-12 pt-8 border-t border-stone-100 flex flex-wrap items-center justify-center gap-4">
                  {visibleSocials.map(link => (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-emerald-800 transition px-3.5 py-1.5 rounded-lg hover:bg-emerald-50"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

      </main>

      <Footer social={visibleSocials} name={profile.name} title={profile.title} />
    </>
  );
}
