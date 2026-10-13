"use client";
import { useEffect, useState } from "react";
import { PortfolioData, ContactSettings } from "@/lib/types";
import { Loader2, Save, Check } from "lucide-react";

export default function ContactAdmin() {
  const [data, setData] = useState<PortfolioData | null>(null);
  const [contact, setContact] = useState<ContactSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetch("/api/admin/data")
      .then(r => r.json())
      .then((d: PortfolioData) => { setData(d); setContact(d.contact); setLoading(false); })
      .catch(() => { setErrorMsg('Failed to load contact data'); setLoading(false); });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data || !contact) return;
    setSaving(true);
    setErrorMsg('');
    try {
      const newData = { ...data, contact };
      const res = await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newData)
      });
      const resData = await res.json().catch(() => ({}));
      if (res.ok && resData.success !== false) {
        setData(newData);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        setErrorMsg(resData.error || 'Failed to save contact settings.');
      }
    } catch {
      setErrorMsg('Network error while saving.');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !contact) return <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;

  const inputClass = "w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm";
  const labelClass = "block text-sm font-medium text-slate-700 mb-1.5";
  const toggleRow = (label: string, key: keyof ContactSettings) => (
    <div className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <button type="button" onClick={() => setContact({ ...contact, [key]: !contact[key as keyof ContactSettings] })}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${contact[key as keyof ContactSettings] ? 'bg-blue-600' : 'bg-slate-200'}`}>
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition shadow ${contact[key as keyof ContactSettings] ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </div>
  );

  return (
    <div className="max-w-3xl">
      <div className="mb-6"><h1 className="text-2xl font-bold text-slate-900">Contact Settings</h1><p className="text-slate-500 text-sm">Manage contact methods and their visibility.</p></div>
      <form onSubmit={handleSave} className="space-y-5">
        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <h2 className="font-semibold text-slate-800 mb-4">Contact Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div><label className={labelClass}>Email</label><input type="email" value={contact.email} onChange={e => setContact({...contact, email: e.target.value})} className={inputClass} /></div>
            <div><label className={labelClass}>Phone</label><input type="text" value={contact.phone || ''} onChange={e => setContact({...contact, phone: e.target.value})} className={inputClass} /></div>
            <div><label className={labelClass}>WhatsApp (no + e.g. 917018547793)</label><input type="text" value={contact.whatsapp || ''} onChange={e => setContact({...contact, whatsapp: e.target.value})} className={inputClass} /></div>
            <div><label className={labelClass}>Location</label><input type="text" value={contact.location} onChange={e => setContact({...contact, location: e.target.value})} className={inputClass} /></div>
            <div className="md:col-span-2"><label className={labelClass}>Contact CTA Text</label><input type="text" value={contact.ctaText} onChange={e => setContact({...contact, ctaText: e.target.value})} className={inputClass} placeholder="Let's work together" /></div>
            <div className="md:col-span-2"><label className={labelClass}>Default Email Subject</label><input type="text" value={contact.emailSubject} onChange={e => setContact({...contact, emailSubject: e.target.value})} className={inputClass} /></div>
            <div className="md:col-span-2"><label className={labelClass}>Default Email Body (optional)</label><textarea value={contact.emailBody} onChange={e => setContact({...contact, emailBody: e.target.value})} rows={3} className={inputClass} /></div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <h2 className="font-semibold text-slate-800 mb-2">Visibility</h2>
          {toggleRow('Email button enabled', 'emailEnabled')}
          {toggleRow('WhatsApp button enabled', 'whatsappEnabled')}
          {toggleRow('Phone button enabled', 'phoneEnabled')}
        </div>
        <div className="flex justify-end">
          <button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-semibold transition flex items-center gap-2 disabled:opacity-70">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Contact Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
