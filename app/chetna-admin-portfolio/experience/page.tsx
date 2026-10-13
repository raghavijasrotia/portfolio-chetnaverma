"use client";
import { useEffect, useState } from "react";
import { PortfolioData, Experience } from "@/lib/types";
import { Loader2, Plus, Trash2, Edit2, Eye, EyeOff, X, Check, MapPin, Briefcase } from "lucide-react";

const emptyExp = (): Experience => ({
  id: `exp-${Date.now()}`, company: '', position: '', startDate: '', endDate: '', isCurrent: false,
  description: '', responsibilities: [], technologies: [], location: '', workMode: 'Onsite', displayOrder: 1, isVisible: true,
});

export default function ExperienceAdmin() {
  const [data, setData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Experience>(emptyExp());
  const [saveMsg, setSaveMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isNew, setIsNew] = useState(false);

  useEffect(() => {
    fetch("/api/admin/data")
      .then(r => r.json())
      .then((d: PortfolioData) => { setData(d); setLoading(false); })
      .catch(() => { setErrorMsg('Failed to load portfolio data'); setLoading(false); });
  }, []);

  const persist = async (newData: PortfolioData) => {
    setSaving(true);
    setErrorMsg('');
    try {
      const res = await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newData)
      });
      const resData = await res.json().catch(() => ({}));
      if (res.ok) {
        setData(newData);
        setSaveMsg('Saved & published to website!');
        setTimeout(() => setSaveMsg(''), 3000);
      } else {
        if (res.status === 401) {
          setErrorMsg('Session expired. Please re-login.');
        } else {
          setErrorMsg(resData.error || 'Failed to save changes. Please try again.');
        }
      }
    } catch {
      setErrorMsg('Network error while saving');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: string) => {
    if (!data || !confirm('Delete this experience entry?')) return;
    persist({ ...data, experience: data.experience.filter(e => e.id !== id) });
  };

  const handleToggleVisible = (id: string) => {
    if (!data) return;
    persist({ ...data, experience: data.experience.map(e => e.id === id ? { ...e, isVisible: !e.isVisible } : e) });
  };

  const handleSaveEdit = () => {
    if (!data) return;
    const finalForm = {
      ...editForm,
      endDate: editForm.isCurrent ? '' : editForm.endDate,
      displayOrder: Number(editForm.displayOrder) || 1,
    };
    const updated = isNew
      ? [...data.experience, finalForm]
      : data.experience.map(e => e.id === finalForm.id ? finalForm : e);
    persist({ ...data, experience: updated });
    setEditingId(null);
    setIsNew(false);
  };

  if (loading || !data) return <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;

  const sorted = [...data.experience].sort((a, b) => a.displayOrder - b.displayOrder);
  const inputClass = "w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition";
  const labelClass = "block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5";

  return (
    <div className="max-w-4xl">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Work Experience</h1>
          <p className="text-slate-500 text-sm">{data.experience.length} entries &middot; Updates reflect automatically on public site</p>
        </div>
        <div className="flex items-center gap-3">
          {saveMsg && <span className="text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5"><Check className="w-3.5 h-3.5" /> {saveMsg}</span>}
          {errorMsg && <span className="text-xs font-semibold text-red-600 bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg">{errorMsg}</span>}
          <button
            onClick={() => {
              const e = emptyExp();
              setEditForm({ ...e, displayOrder: data.experience.length + 1 });
              setEditingId(e.id);
              setIsNew(true);
            }}
            disabled={saving}
            className="bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-blue-700 transition shadow-sm disabled:opacity-50"
          >
            <Plus className="w-4 h-4" /> Add Experience
          </button>
        </div>
      </div>

      {editingId && (
        <div className="bg-white border-2 border-blue-400/40 rounded-2xl p-6 mb-6 shadow-xl">
          <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
            <h2 className="font-bold text-slate-900 text-lg flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-blue-600" />
              {isNew ? 'Add New Experience' : 'Edit Experience'}
            </h2>
            <button onClick={() => { setEditingId(null); setIsNew(false); }} className="text-slate-400 hover:text-slate-600 p-1">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Company Name *</label>
              <input type="text" value={editForm.company} onChange={e => setEditForm({...editForm, company: e.target.value})} className={inputClass} placeholder="e.g. Pennep" required />
            </div>
            <div>
              <label className={labelClass}>Position / Role *</label>
              <input type="text" value={editForm.position} onChange={e => setEditForm({...editForm, position: e.target.value})} className={inputClass} placeholder="e.g. DevOps Engineer" required />
            </div>
            <div>
              <label className={labelClass}>Start Date *</label>
              <input type="date" value={editForm.startDate} onChange={e => setEditForm({...editForm, startDate: e.target.value})} className={inputClass} required />
            </div>
            <div>
              <label className={labelClass}>End Date</label>
              <input
                type="date"
                value={editForm.endDate || ''}
                onChange={e => setEditForm({...editForm, endDate: e.target.value})}
                className={`${inputClass} ${editForm.isCurrent ? 'bg-slate-50 text-slate-400' : ''}`}
                disabled={editForm.isCurrent}
              />
            </div>
            <div>
              <label className={labelClass}>Location</label>
              <input type="text" value={editForm.location || ''} onChange={e => setEditForm({...editForm, location: e.target.value})} className={inputClass} placeholder="e.g. Chandigarh, India or Remote" />
            </div>
            <div>
              <label className={labelClass}>Work Mode</label>
              <div className="space-y-2">
                <input
                  type="text"
                  value={editForm.workMode || ''}
                  onChange={e => setEditForm({...editForm, workMode: e.target.value})}
                  className={inputClass}
                  placeholder="e.g. Onsite, Remote, Hybrid"
                />
                <div className="flex gap-2">
                  {['Onsite', 'Remote', 'Hybrid'].map(mode => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setEditForm({...editForm, workMode: mode})}
                      className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition ${
                        editForm.workMode?.toLowerCase() === mode.toLowerCase()
                          ? 'bg-blue-50 border-blue-300 text-blue-700 font-bold'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Description</label>
              <textarea value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} className={`${inputClass} h-20 resize-y`} placeholder="Brief summary of your role" />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Key Responsibilities (one per line)</label>
              <textarea
                value={editForm.responsibilities.join('\n')}
                onChange={e => setEditForm({...editForm, responsibilities: e.target.value.split('\n').filter(Boolean)})}
                className={`${inputClass} h-28 resize-y font-mono text-xs`}
                placeholder="Designing and maintaining AWS infrastructure&#10;Building CI/CD pipelines&#10;Managing production deployments"
              />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Technologies Used (comma separated)</label>
              <input
                type="text"
                value={editForm.technologies.join(', ')}
                onChange={e => setEditForm({...editForm, technologies: e.target.value.split(',').map(s => s.trim()).filter(Boolean)})}
                className={inputClass}
                placeholder="AWS, Docker, Kubernetes, Terraform, Jenkins"
              />
            </div>
            <div>
              <label className={labelClass}>Display Order</label>
              <input type="number" value={editForm.displayOrder} onChange={e => setEditForm({...editForm, displayOrder: parseInt(e.target.value) || 1})} className={inputClass} min="1" />
            </div>
            <div className="flex gap-6 items-center pt-5">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={editForm.isCurrent}
                  onChange={e => setEditForm({...editForm, isCurrent: e.target.checked, endDate: e.target.checked ? '' : editForm.endDate})}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-semibold text-slate-800">Current Position</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={editForm.isVisible}
                  onChange={e => setEditForm({...editForm, isVisible: e.target.checked})}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-semibold text-slate-800">Visible on Site</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => { setEditingId(null); setIsNew(false); }}
              className="px-4 py-2 text-sm font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveEdit}
              disabled={saving || !editForm.company || !editForm.position || !editForm.startDate}
              className="px-5 py-2 text-sm font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50 shadow-sm"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              {saving ? 'Saving...' : 'Save & Publish'}
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {sorted.map(exp => (
          <div key={exp.id} className={`bg-white border border-slate-200 rounded-2xl p-5 shadow-sm transition hover:border-slate-300 ${!exp.isVisible ? 'opacity-60 bg-slate-50/50' : ''}`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <p className="font-bold text-slate-900 text-base">{exp.position}</p>
                  {exp.isCurrent && (
                    <span className="text-xs font-bold text-green-700 bg-green-50 border border-green-200 px-2.5 py-0.5 rounded-full">
                      Current
                    </span>
                  )}
                  {exp.workMode && (
                    <span className="text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">
                      {exp.workMode}
                    </span>
                  )}
                </div>
                <p className="text-sm text-blue-600 font-semibold">{exp.company}</p>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
                  <span>{exp.startDate} &mdash; {exp.isCurrent ? 'Present' : (exp.endDate || 'Present')}</span>
                  {exp.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {exp.location}
                    </span>
                  )}
                  <span className="font-mono text-slate-300">Order: #{exp.displayOrder}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => handleToggleVisible(exp.id)}
                  className={`p-2 rounded-xl border transition ${exp.isVisible ? 'text-green-600 bg-green-50 border-green-200 hover:bg-green-100' : 'text-slate-400 bg-slate-50 border-slate-200 hover:bg-slate-100'}`}
                  title={exp.isVisible ? 'Visible (click to hide)' : 'Hidden (click to show)'}
                  disabled={saving}
                >
                  {exp.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => { setEditingId(exp.id); setEditForm(exp); setIsNew(false); }}
                  className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 border border-slate-200 rounded-xl transition"
                  title="Edit"
                  disabled={saving}
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(exp.id)}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 border border-slate-200 rounded-xl transition"
                  title="Delete"
                  disabled={saving}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
