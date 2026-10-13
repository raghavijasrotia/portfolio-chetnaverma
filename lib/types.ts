export interface StatHighlight {
  id: string;
  value: string; // e.g. "5th Year", "Final Year", "Fresher", "2+", "28+"
  label: string; // e.g. "B.A. LL.B Scholar", "Court Internships", "Moot Courts & Papers", "Legal Skills"
  isVisible: boolean;
}

// ==============================
// Core Data Types
// ==============================

export interface Profile {
  name: string;
  title: string;
  bio: string;
  profileImage: string; // URL (Vercel Blob URL or local path)
  location: string;
  email: string;
  phone?: string;
  whatsapp?: string; // international format e.g. 917018547793
  website?: string;
  workMode: string; // display string e.g. "On-site / Hybrid"

  // Custom Legal / Student & Hero Customizer
  academicBadge?: string; // e.g. "B.A. LL.B · CGC Mohali" (shown in Navbar)
  seekingBannerText?: string; // e.g. "Actively Seeking Legal Internship · Chamber / Firm Trainee"
  seekingBannerDegree?: string; // e.g. "B.A. LL.B"
  showSeekingBanner?: boolean; // toggle banner on/off

  aboutHeadline?: string; // e.g. "Dedicated to Constitutional Rigor, Procedural Integrity & Advocacy"
  showAcademicPedigree?: boolean; // toggle academic pedigree box in About section

  // Hero Highlights / Stats Bar
  showHeroStats?: boolean; // toggle entire stats bar on/off
  stats?: StatHighlight[]; // array of customizable stats (e.g. 5th Year, Internships, etc.)
}

export interface Availability {
  status: 'available' | 'notice_period' | 'not_available' | 'open_to_work' | 'part_time' | 'freelance' | 'contract';
  statusMode: 'auto' | 'manual'; // auto = based on lastWorkingDay date
  lastWorkingDay?: string; // YYYY-MM-DD
  availableFrom?: string; // YYYY-MM-DD
  openTo: string[]; // e.g. ['Remote', 'Hybrid']
  currentWorkMode: string;
}

export interface SectionVisibility {
  hero: boolean;
  about: boolean;
  experience: boolean;
  skills: boolean;
  projects: boolean;
  certifications: boolean;
  education: boolean;
  resume: boolean;
  contact: boolean;
  social: boolean;
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  startDate: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  isCurrent: boolean;
  description: string;
  responsibilities: string[];
  technologies: string[];
  location?: string;
  workMode?: string;
  displayOrder: number;
  isVisible: boolean;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  level?: string;
  displayOrder: number;
  isVisible: boolean;
}

export interface Project {
  id: string;
  name: string;
  shortDescription: string;
  detailedDescription: string;
  technologies: string[];
  architectureHighlights: string[];
  githubUrl?: string;
  liveUrl?: string;
  projectImage?: string; // Vercel Blob URL
  isFeatured: boolean;
  isVisible: boolean;
  displayOrder: number;
}

export interface Certification {
  id: string;
  name: string;
  level: string;
  organization: string;
  credentialId?: string;
  issueDate: string; // YYYY-MM-DD
  expirationDate?: string; // YYYY-MM-DD
  credentialUrl?: string;
  imageRef?: string;
  isVisible: boolean;
  displayOrder: number;
}

export interface Education {
  id: string;
  degree: string;
  institution: string;
  location: string;
  startYear: string;
  endYear: string;
  description?: string;
  grade?: string;
  isVisible: boolean;
  displayOrder: number;
}

export interface SocialLink {
  id: string;
  platform: string; // e.g. 'GitHub', 'LinkedIn', 'Upwork', 'WhatsApp'
  label: string;    // display name
  url: string;
  isVisible: boolean;
  displayOrder: number;
}

export interface ContactSettings {
  email: string;
  emailSubject: string;
  emailBody: string;
  phone?: string;
  whatsapp?: string; // international format without + e.g. 917018547793
  whatsappEnabled: boolean;
  emailEnabled: boolean;
  phoneEnabled: boolean;
  location: string;
  ctaText: string;
}

export interface Seo {
  siteUrl: string;
  title: string;
  description: string;
  keywords: string;
  author: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
  googleVerification?: string;
  robotsIndex: boolean;
  robotsFollow: boolean;
}

export interface SiteSettings {
  resumeUrl?: string; // Vercel Blob URL for the PDF
  sections: SectionVisibility;
  seo: Seo;
}

export interface PortfolioData {
  profile: Profile;
  availability: Availability;
  experience: Experience[];
  skills: Skill[];
  projects: Project[];
  certifications: Certification[];
  education: Education[];
  socialLinks: SocialLink[];
  contact: ContactSettings;
  siteSettings: SiteSettings;
}
