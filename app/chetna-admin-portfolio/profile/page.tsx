"use client";
import { useEffect, useState } from "react";
import { PortfolioData, Profile, Availability, StatHighlight } from "@/lib/types";
import {
  Loader2, Save, Check, Upload, Trash2, X, Eye, EyeOff, Plus,
  Scale, GraduationCap, Sparkles, AlertCircle
} from "lucide-react";

export default function ProfileAdmin() {
  const [data, setData] = useState<PortfolioData | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [availability, setAvailability] = useState<Availability | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  useEffect(() => {
    fetch("/api/admin/data")
      .then((r) => r.json())
      .then((d: PortfolioData) => {
        setData(d);
        // Ensure stats array exists
        const prof = {
          ...d.profile,
          showSeekingBanner: d.profile.showSeekingBanner !== false,
          showAcademicPedigree: d.profile.showAcademicPedigree !== false,
          showHeroStats: d.profile.showHeroStats !== false,
          stats: (d.profile.stats && d.profile.stats.length > 0)
            ? d.profile.stats
            : [
                { id: "stat-1", value: "5th Year", label: "B.A. LL.B Scholar", isVisible: true },
                { id: "stat-2", value: "2 Chambers", label: "Court Internships", isVisible: true },
                { id: "stat-3", value: "4+", label: "Moot Courts & Papers", isVisible: true },
                { id: "stat-4", value: "28+", label: "Legal Skills", isVisible: true },
              ],
        };
        setProfile(prof);
        setAvailability(d.availability);
        setLoading(false);
      })
      .catch(() => {
        setSaveError("Failed to load profile data");
        setLoading(false);
      });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data || !profile || !availability) return;
    setSaving(true);
    setSaveError("");
    try {
      const updatedData = { ...data, profile, availability };
      const res = await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });
      const resData = await res.json().catch(() => ({}));
      if (res.ok && resData.success !== false) {
        setData(updatedData);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        setSaveError(resData.error || "Failed to save profile changes.");
      }
    } catch {
      setSaveError("Network error while saving profile.");
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;
    setUploadError("");
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("type", "photo");
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const result = await res.json();
    setUploading(false);
    if (res.ok && result.url) {
      setProfile({ ...profile, profileImage: result.url });
    } else {
      setUploadError(result.error || "Failed to upload photo");
    }
  };

  const handleRemovePhoto = () => {
    if (profile) setProfile({ ...profile, profileImage: "" });
  };

  // Stat item controls
  const handleStatChange = (id: string, field: "value" | "label", val: string) => {
    if (!profile) return;
    const currentStats = profile.stats || [];
    const updated = currentStats.map((st) => (st.id === id ? { ...st, [field]: val } : st));
    setProfile({ ...profile, stats: updated });
  };

  const handleStatToggle = (id: string) => {
    if (!profile) return;
    const currentStats = profile.stats || [];
    const updated = currentStats.map((st) => (st.id === id ? { ...st, isVisible: !st.isVisible } : st));
    setProfile({ ...profile, stats: updated });
  };

  const handleStatDelete = (id: string) => {
    if (!profile) return;
    const currentStats = profile.stats || [];
    const updated = currentStats.filter((st) => st.id !== id);
    setProfile({ ...profile, stats: updated });
  };

  const handleAddStat = () => {
    if (!profile) return;
    const newStat: StatHighlight = {
      id: `stat-${Date.now()}`,
      value: "1st Year",
      label: "Law Student",
      isVisible: true,
    };
    setProfile({ ...profile, stats: [...(profile.stats || []), newStat] });
  };

  if (loading || !profile || !availability) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const inputClass =
    "w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 transition";
  const labelClass = "block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider";

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Profile & Hero Customization</h1>
          <p className="text-slate-500 text-sm mt-1">
            Control your identity, photo, legal qualifications, hero highlights (e.g. 5th Year), and Fresher options.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-semibold transition flex items-center justify-center gap-2 disabled:opacity-70 shadow-sm shrink-0"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Photo Upload */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Scale className="w-4 h-4 text-amber-600" /> Advocate Portrait / Photo
          </h2>
          <div className="flex items-start gap-6">
            <div className="relative">
              {profile.profileImage ? (
                <div className="relative group">
                  <img
                    src={profile.profileImage}
                    alt="Profile"
                    className="w-24 h-24 rounded-2xl object-cover object-top border-2 border-slate-200 shadow"
                  />
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition shadow"
                    title="Remove Photo"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 text-xs text-center p-2">
                  No photo
                </div>
              )}
            </div>
            <div className="flex-1">
              <label className="block">
                <span className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium cursor-pointer hover:bg-blue-700 transition">
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {uploading ? "Uploading..." : "Upload Advocate Photo"}
                </span>
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
              <p className="text-xs text-slate-400 mt-2">JPG, PNG, WEBP. Max 4MB.</p>
              {uploadError && <p className="text-xs text-red-600 font-semibold mt-1 bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg">{uploadError}</p>}
              <div className="pt-3 mt-3 border-t border-slate-100">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Or enter / paste direct Photo URL:
                </label>
                <input
                  type="text"
                  value={profile.profileImage || ""}
                  onChange={(e) => setProfile({ ...profile, profileImage: e.target.value })}
                  placeholder="https://... or /images/lawyer-avatar.png"
                  className={inputClass}
                />
              </div>
            </div>
          </div>
        </div>

        {/* HERO HIGHLIGHTS & STAT COUNTERS (5th Year / 0 Chambers Control) */}
        <div className="bg-white border-2 border-amber-500/30 rounded-2xl p-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
            <div>
              <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600" /> Hero Highlights &amp; Stat Counters
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Customize stats like &ldquo;5th Year&rdquo;, &ldquo;Court Internships&rdquo;, or hide them if you are a fresher.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-600">Show Stats Bar:</span>
              <button
                type="button"
                onClick={() => setProfile({ ...profile, showHeroStats: !profile.showHeroStats })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  profile.showHeroStats ? "bg-amber-600" : "bg-slate-200"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow ${
                    profile.showHeroStats ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Fresher Helpful Tip Banner */}
          <div className="p-3.5 mb-5 rounded-xl bg-amber-50 border border-amber-200/80 flex items-start gap-2.5 text-xs text-amber-900 leading-relaxed">
            <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <strong>Fresher / Student Tip:</strong> If you are a 1st/2nd/3rd/4th year student or haven&apos;t interned at a chamber yet, click the Eye icon on &ldquo;Court Internships&rdquo; to hide it, or edit the value to &ldquo;Fresher&rdquo; or &ldquo;Aspiring Litigator&rdquo; so it never displays &ldquo;0 Chambers&rdquo;!
            </div>
          </div>

          {profile.showHeroStats && (
            <div className="space-y-3">
              {(profile.stats || []).map((st, idx) => (
                <div
                  key={st.id}
                  className={`p-3.5 rounded-xl border transition flex flex-col sm:flex-row items-start sm:items-center gap-3 ${
                    st.isVisible ? "bg-slate-50 border-slate-200" : "bg-slate-100/60 border-slate-200/60 opacity-60"
                  }`}
                >
                  <span className="text-xs font-bold text-slate-400 w-6">#{idx + 1}</span>

                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Stat Value (e.g. 5th Year, Final Year, Fresher, 2+)
                      </label>
                      <input
                        type="text"
                        value={st.value}
                        onChange={(e) => handleStatChange(st.id, "value", e.target.value)}
                        className={inputClass}
                        placeholder="e.g. 5th Year, 1st Year, Fresher, 2+"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Stat Label / Title
                      </label>
                      <input
                        type="text"
                        value={st.label}
                        onChange={(e) => handleStatChange(st.id, "label", e.target.value)}
                        className={inputClass}
                        placeholder="e.g. B.A. LL.B Scholar, Court Internships"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center mt-2 sm:mt-5">
                    <button
                      type="button"
                      onClick={() => handleStatToggle(st.id)}
                      className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                        st.isVisible
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                          : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                      }`}
                      title={st.isVisible ? "Visible on website" : "Hidden from website"}
                    >
                      {st.isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      <span>{st.isVisible ? "Visible" : "Hidden"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleStatDelete(st.id)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Delete Stat"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={handleAddStat}
                className="w-full py-2.5 border-2 border-dashed border-slate-300 hover:border-blue-400 rounded-xl text-xs font-semibold text-slate-600 hover:text-blue-600 flex items-center justify-center gap-1.5 transition"
              >
                <Plus className="w-4 h-4" /> Add Another Highlight Stat
              </button>
            </div>
          )}
        </div>

        {/* HERO BANNER & ACADEMIC IDENTITY */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-blue-600" /> Hero Banner &amp; Academic Identity
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>Navbar &amp; Subtitle Academic Badge</label>
              <input
                type="text"
                value={profile.academicBadge || ""}
                onChange={(e) => setProfile({ ...profile, academicBadge: e.target.value })}
                className={inputClass}
                placeholder="e.g. B.A. LL.B · CGC Mohali"
              />
              <p className="text-[11px] text-slate-400 mt-1">Displays under your name in the navbar header.</p>
            </div>

            <div>
              <label className={labelClass}>Banner Degree Tag</label>
              <input
                type="text"
                value={profile.seekingBannerDegree || ""}
                onChange={(e) => setProfile({ ...profile, seekingBannerDegree: e.target.value })}
                className={inputClass}
                placeholder="e.g. B.A. LL.B"
              />
              <p className="text-[11px] text-slate-400 mt-1">Pill badge shown next to the seeking banner.</p>
            </div>

            <div className="md:col-span-2">
              <div className="flex items-center justify-between mb-1.5">
                <label className={labelClass}>Actively Seeking Internship Banner Text</label>
                <label className="flex items-center gap-2 text-xs font-medium text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={profile.showSeekingBanner !== false}
                    onChange={(e) => setProfile({ ...profile, showSeekingBanner: e.target.checked })}
                    className="rounded text-blue-600"
                  />
                  <span>Show Seeking Banner</span>
                </label>
              </div>
              <input
                type="text"
                value={profile.seekingBannerText || ""}
                onChange={(e) => setProfile({ ...profile, seekingBannerText: e.target.value })}
                className={inputClass}
                placeholder="e.g. Actively Seeking Legal Internship · Chamber / Firm Trainee"
              />
            </div>

            <div className="md:col-span-2">
              <label className={labelClass}>About Section Headline</label>
              <input
                type="text"
                value={profile.aboutHeadline || ""}
                onChange={(e) => setProfile({ ...profile, aboutHeadline: e.target.value })}
                className={inputClass}
                placeholder="e.g. Dedicated to Constitutional Rigor, Procedural Integrity & Advocacy"
              />
            </div>

            <div className="md:col-span-2 flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
              <div>
                <p className="text-xs font-bold text-slate-800">Show Academic Pedigree Box in About Section</p>
                <p className="text-[11px] text-slate-500">
                  Displays your Law School (CGC Mohali) and Schooling (Mount Litera Zee School Kathua) directly in the About overview.
                </p>
              </div>
              <input
                type="checkbox"
                checked={profile.showAcademicPedigree !== false}
                onChange={(e) => setProfile({ ...profile, showAcademicPedigree: e.target.checked })}
                className="w-4 h-4 rounded text-blue-600 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Basic Info */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h2 className="font-semibold text-slate-800 mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>Advocate / Intern Full Name</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className={labelClass}>Professional Title</label>
              <input
                type="text"
                value={profile.title}
                onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                className={inputClass}
                placeholder="e.g. Advocate & Legal Intern | B.A. LL.B Scholar"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Bio / Professional Legal Summary</label>
              <textarea
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                className={`${inputClass} h-32 leading-relaxed`}
              />
            </div>
            <div>
              <label className={labelClass}>Location</label>
              <input
                type="text"
                value={profile.location}
                onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                className={inputClass}
                placeholder="e.g. Mohali / Chandigarh & Kathua, India"
              />
            </div>
            <div>
              <label className={labelClass}>Internship / Work Mode</label>
              <input
                type="text"
                value={profile.workMode}
                onChange={(e) => setProfile({ ...profile, workMode: e.target.value })}
                className={inputClass}
                placeholder="e.g. On-site / Hybrid"
              />
            </div>
            <div>
              <label className={labelClass}>Official Legal Email</label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Phone Number</label>
              <input
                type="text"
                value={profile.phone || ""}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>WhatsApp (international format, no +)</label>
              <input
                type="text"
                value={profile.whatsapp || ""}
                onChange={(e) => setProfile({ ...profile, whatsapp: e.target.value })}
                className={inputClass}
                placeholder="919876543210"
              />
            </div>
            <div>
              <label className={labelClass}>Website / Legal Profile URL</label>
              <input
                type="text"
                value={profile.website || ""}
                onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* Availability */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h2 className="font-semibold text-slate-800 mb-4">Availability &amp; Legal Internship Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>Status Mode</label>
              <select
                value={availability.statusMode}
                onChange={(e) => setAvailability({ ...availability, statusMode: e.target.value as any })}
                className={inputClass}
              >
                <option value="manual">Manual</option>
                <option value="auto">Auto (based on date)</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Status</label>
              <select
                value={availability.status}
                onChange={(e) => setAvailability({ ...availability, status: e.target.value as any })}
                className={inputClass}
              >
                <option value="open_to_work">Open to Legal Internships</option>
                <option value="available">Immediately Available</option>
                <option value="part_time">Part-Time / Court Vacations</option>
                <option value="notice_period">Completing Current Internship</option>
                <option value="not_available">Not Available</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Available From Date</label>
              <input
                type="date"
                value={availability.availableFrom || ""}
                onChange={(e) => setAvailability({ ...availability, availableFrom: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Current Internship Mode</label>
              <input
                type="text"
                value={availability.currentWorkMode}
                onChange={(e) => setAvailability({ ...availability, currentWorkMode: e.target.value })}
                className={inputClass}
                placeholder="e.g. Available for High Court / Chamber Training"
              />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Open To Practice Areas (comma separated)</label>
              <input
                type="text"
                value={availability.openTo.join(", ")}
                onChange={(e) =>
                  setAvailability({
                    ...availability,
                    openTo: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                  })
                }
                className={inputClass}
                placeholder="Legal Internship, Chamber Trainee, Judicial Clerkship, Litigation"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
          {saveError && (
            <span className="text-xs font-semibold text-red-600 bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg">
              {saveError}
            </span>
          )}
          <button
            type="submit"
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold transition flex items-center gap-2 disabled:opacity-70 shadow-md"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saving ? "Saving..." : saved ? "Saved Successfully!" : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
