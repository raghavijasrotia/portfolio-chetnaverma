"use client";
import { useEffect, useState } from "react";
import { PortfolioData, Seo } from "@/lib/types";
import { Loader2, Save, Check } from "lucide-react";

export default function SeoAdmin() {
  const [data, setData] = useState<PortfolioData | null>(null);
  const [seo, setSeo] = useState<Seo | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetch("/api/admin/data")
      .then(r => r.json())
      .then((d: PortfolioData) => { setData(d); setSeo(d.siteSettings.seo); setLoading(false); })
      .catch(() => { setErrorMsg('Failed to load SEO data'); setLoading(false); });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data || !seo) return;
    setSaving(true);
    setErrorMsg('');
    try {
      const newData = { ...data, siteSettings: { ...data.siteSettings, seo } };
      const res = await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newData)
      });
      const resData = await res.json().catch(() => ({}));
      if (res.ok && resData.success !== false) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        setErrorMsg(resData.error || 'Failed to save SEO settings.');
      }
    } catch {
      setErrorMsg('Network error while saving.');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !seo) return <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;

  const field = (label: string, key: keyof Seo, type: string = 'text', placeholder?: string) => (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
      <input type={type} value={seo[key] as string || ''} onChange={e => setSeo({ ...seo, [key]: e.target.value })}
        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" placeholder={placeholder} />
    </div>
  );

  return (
    <div className="max-w-4xl">
      <div className="mb-6"><h1 className="text-2xl font-bold text-slate-900">SEO Settings</h1><p className="text-slate-500 text-sm">Control how your site appears in search engines and social sharing.</p></div>
      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <h2 className="font-semibold text-slate-800 mb-4">General SEO</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {field('SEO Title', 'title', 'text', 'Serry Singh | DevOps Engineer')}
            {field('Author', 'author', 'text', 'Serry Singh')}
            <div className="md:col-span-2"><label className="block text-sm font-medium text-slate-700 mb-1.5">Meta Description</label>
              <textarea value={seo.description} onChange={e => setSeo({...seo, description: e.target.value})} rows={3} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" /></div>
            <div className="md:col-span-2">{field('Keywords (comma separated)', 'keywords')}</div>
            {field('Site URL', 'siteUrl', 'url', 'https://serrysingh.dev')}
            {field('Google Verification', 'googleVerification')}
            <div className="flex items-center gap-4 col-span-2">
              <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={seo.robotsIndex} onChange={e => setSeo({...seo, robotsIndex: e.target.checked})} className="rounded" /><span className="text-sm">Allow indexing</span></label>
              <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={seo.robotsFollow} onChange={e => setSeo({...seo, robotsFollow: e.target.checked})} className="rounded" /><span className="text-sm">Allow following links</span></label>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <h2 className="font-semibold text-slate-800 mb-4">Open Graph (Social Sharing)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {field('OG Title', 'ogTitle')}
            {field('OG Image URL', 'ogImage', 'url')}
            <div className="md:col-span-2"><label className="block text-sm font-medium text-slate-700 mb-1.5">OG Description</label>
              <textarea value={seo.ogDescription} onChange={e => setSeo({...seo, ogDescription: e.target.value})} rows={2} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" /></div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <h2 className="font-semibold text-slate-800 mb-4">Twitter / X Card</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {field('Twitter Title', 'twitterTitle')}
            {field('Twitter Image URL', 'twitterImage', 'url')}
            <div className="md:col-span-2"><label className="block text-sm font-medium text-slate-700 mb-1.5">Twitter Description</label>
              <textarea value={seo.twitterDescription} onChange={e => setSeo({...seo, twitterDescription: e.target.value})} rows={2} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" /></div>
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-semibold transition flex items-center gap-2 disabled:opacity-70">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving...' : saved ? 'Saved!' : 'Save SEO Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
