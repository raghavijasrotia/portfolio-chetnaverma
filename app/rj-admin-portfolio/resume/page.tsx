"use client";
import { useEffect, useState } from "react";
import { PortfolioData } from "@/lib/types";
import { Loader2, Upload, Download, Trash2, FileText, Check } from "lucide-react";

export default function ResumeAdmin() {
  const [data, setData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/data").then(r => r.json()).then((d: PortfolioData) => { setData(d); setLoading(false); });
  }, []);

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !data) return;
    if (file.type !== 'application/pdf') { setUploadError('Only PDF files are allowed'); return; }
    if (file.size > 10 * 1024 * 1024) { setUploadError('File too large. Max 10MB.'); return; }
    setUploadError('');
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    fd.append('type', 'resume');
    const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
    const result = await res.json();
    if (res.ok && result.url) {
      const newData = { ...data, siteSettings: { ...data.siteSettings, resumeUrl: result.url } };
      setData(newData);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } else {
      setUploadError(result.error || 'Upload failed');
    }
    setUploading(false);
  };

  const handleRemoveResume = async () => {
    if (!data) return;
    if (!confirm('Remove resume PDF?')) return;
    await fetch('/api/admin/upload', {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: data.siteSettings.resumeUrl, type: 'resume' }),
    });
    const newData = { ...data, siteSettings: { ...data.siteSettings, resumeUrl: '' } };
    await fetch("/api/admin/data", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newData) });
    setData(newData);
  };

  if (loading || !data) return <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;

  const resumeUrl = data.siteSettings.resumeUrl;

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Resume / CV</h1>
        <p className="text-slate-500 text-sm mt-1">Upload your resume PDF. It will be used for the public download button.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6">
        {resumeUrl ? (
          <div className="border border-slate-200 rounded-xl p-4 flex items-center justify-between gap-4 bg-slate-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">Current Resume</p>
                <p className="text-xs text-slate-400 truncate max-w-xs">{resumeUrl}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <a href={resumeUrl} target="_blank" rel="noreferrer" className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"><Download className="w-4 h-4" /></a>
              <button onClick={handleRemoveResume} className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ) : (
          <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center text-slate-400">
            <FileText className="w-10 h-10 mx-auto mb-3 text-slate-300" />
            <p className="text-sm">No resume uploaded yet</p>
          </div>
        )}

        <div>
          <label className="block">
            <span className="inline-flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-xl text-sm font-semibold cursor-pointer hover:bg-blue-700 transition">
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {uploading ? 'Uploading...' : resumeUrl ? 'Replace Resume' : 'Upload Resume PDF'}
            </span>
            <input type="file" accept="application/pdf" onChange={handleResumeUpload} className="hidden" disabled={uploading} />
          </label>
          <p className="text-xs text-slate-400 mt-2">Only PDF files. Max 10MB.</p>
          {uploadError && <p className="text-xs text-red-500 mt-1">{uploadError}</p>}
          {saved && <p className="text-xs text-green-600 mt-1 flex items-center gap-1"><Check className="w-3 h-3" /> Resume saved successfully!</p>}
        </div>

        <div className="pt-4 border-t border-slate-100">
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
            Or paste direct PDF URL (e.g. Google Drive, Cloud Storage, or external link):
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={data.siteSettings.resumeUrl || ""}
              onChange={(e) => setData({ ...data, siteSettings: { ...data.siteSettings, resumeUrl: e.target.value } })}
              placeholder="https://drive.google.com/... or https://.../resume.pdf"
              className="flex-1 px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800"
            />
            <button
              type="button"
              onClick={async () => {
                const res = await fetch("/api/admin/data", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
                if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 3000); }
              }}
              className="px-4 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition"
            >
              Save Link
            </button>
          </div>
        </div>

        {!process.env.NEXT_PUBLIC_HAS_BLOB && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-700">
            <strong>Note:</strong> BLOB_READ_WRITE_TOKEN is not configured. Files will be saved locally to /public/uploads. 
            For production on Vercel, add the BLOB_READ_WRITE_TOKEN environment variable.
          </div>
        )}
      </div>
    </div>
  );
}
