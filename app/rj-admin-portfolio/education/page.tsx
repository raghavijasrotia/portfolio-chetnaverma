"use client";
import { useEffect, useState } from "react";
import { PortfolioData, Education } from "@/lib/types";
import { Loader2, Plus, Trash2, Edit2, Eye, EyeOff, Save, Check, X } from "lucide-react";

export default function EducationAdmin() {
  const [data, setData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Education>>({});
  const [isNew, setIsNew] = useState(false);

  useEffect(() => {
    fetch("/api/admin/data")
      .then(res => res.json())
      .then((d: PortfolioData) => { setData(d); setLoading(false); })
      .catch(() => { setErrorMsg('Failed to load portfolio data'); setLoading(false); });
  }, []);

  const handleSaveData = async (newData: PortfolioData) => {
    setSaving(true);
    setErrorMsg('');
    try {
      const res = await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newData),
      });
      const resData = await res.json().catch(() => ({}));
      if (res.ok && resData.success !== false) {
        setData(newData);
        setSaveMsg('Saved & published!');
        setTimeout(() => setSaveMsg(''), 3000);
      } else {
        setErrorMsg(resData.error || 'Failed to save. Please try again.');
      }
    } catch {
      setErrorMsg('Network error while saving');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleVisible = (id: string) => {
    if (!data) return;
    handleSaveData({
      ...data,
      education: data.education.map(e => e.id === id ? { ...e, isVisible: !e.isVisible } : e)
    });
  };

  const handleDelete = (id: string) => {
    if (!data || !confirm('Delete this education entry?')) return;
    handleSaveData({ ...data, education: data.education.filter(e => e.id !== id) });
  };

  const handleSaveEdit = () => {
    if (!data || !editForm.id) return;
    const finalForm: Education = {
      id: editForm.id,
      degree: editForm.degree || '',
      institution: editForm.institution || '',
      location: editForm.location || '',
      startYear: editForm.startYear || '',
      endYear: editForm.endYear || '',
      description: editForm.description || '',
      grade: editForm.grade || '',
      isVisible: editForm.isVisible ?? true,
      displayOrder: Number(editForm.displayOrder) || 1,
    };
    const updated = isNew
      ? [finalForm, ...data.education]
      : data.education.map(e => e.id === finalForm.id ? finalForm : e);
    handleSaveData({ ...data, education: updated });
    setEditingId(null);
    setIsNew(false);
  };

  const handleAdd = () => {
    if (!data) return;
    const newItem: Education = {
      id: `edu-${Date.now()}`,
      degree: "",
      institution: "",
      location: "",
      startYear: "",
      endYear: "",
      isVisible: true,
      displayOrder: data.education.length + 1
    };
    setEditingId(newItem.id);
    setEditForm(newItem);
    setIsNew(true);
  };

  if (loading || !data) return <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;

  const sorted = [...data.education].sort((a, b) => a.displayOrder - b.displayOrder);
  const inputClass = "w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none";

  return (
    <div className="max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Education</h1>
          <p className="text-slate-500 text-sm">{data.education.length} entries &middot; Updates reflect automatically on public site</p>
        </div>
        <div className="flex items-center gap-3">
          {saveMsg && <span className="text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5"><Check className="w-3.5 h-3.5" /> {saveMsg}</span>}
          {errorMsg && <span className="text-xs font-semibold text-red-600 bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg">{errorMsg}</span>}
          <button onClick={handleAdd} disabled={saving} className="bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-blue-700 transition disabled:opacity-50">
            <Plus className="w-4 h-4" /> Add Education
          </button>
        </div>
      </div>

      {editingId && (
        <div className="bg-white border-2 border-blue-200 rounded-2xl p-6 mb-6 shadow-xl space-y-4">
          <h2 className="font-bold text-slate-900 text-base">{isNew ? 'Add Education' : 'Edit Education'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-xs font-semibold text-slate-700 mb-1">Degree / Course *</label><input type="text" value={editForm.degree || ''} onChange={e => setEditForm({...editForm, degree: e.target.value})} className={inputClass} placeholder="e.g. B.Tech Computer Science" required /></div>
            <div><label className="block text-xs font-semibold text-slate-700 mb-1">Institution / University *</label><input type="text" value={editForm.institution || ''} onChange={e => setEditForm({...editForm, institution: e.target.value})} className={inputClass} placeholder="e.g. Punjab Technical University" required /></div>
            <div><label className="block text-xs font-semibold text-slate-700 mb-1">Start Year</label><input type="text" value={editForm.startYear || ''} onChange={e => setEditForm({...editForm, startYear: e.target.value})} className={inputClass} placeholder="e.g. 2019" /></div>
            <div><label className="block text-xs font-semibold text-slate-700 mb-1">End Year</label><input type="text" value={editForm.endYear || ''} onChange={e => setEditForm({...editForm, endYear: e.target.value})} className={inputClass} placeholder="e.g. 2023" /></div>
            <div><label className="block text-xs font-semibold text-slate-700 mb-1">Location</label><input type="text" value={editForm.location || ''} onChange={e => setEditForm({...editForm, location: e.target.value})} className={inputClass} placeholder="e.g. Punjab, India" /></div>
            <div><label className="block text-xs font-semibold text-slate-700 mb-1">Grade / CGPA (optional)</label><input type="text" value={editForm.grade || ''} onChange={e => setEditForm({...editForm, grade: e.target.value})} className={inputClass} placeholder="e.g. 8.2 CGPA" /></div>
            <div className="md:col-span-2"><label className="block text-xs font-semibold text-slate-700 mb-1">Description (optional)</label><textarea value={editForm.description || ''} onChange={e => setEditForm({...editForm, description: e.target.value})} className={`${inputClass} h-20 resize-y`} /></div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Display Order</label>
              <input type="number" value={editForm.displayOrder || 1} onChange={e => setEditForm({...editForm, displayOrder: parseInt(e.target.value) || 1})} className={inputClass} min="1" />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={editForm.isVisible ?? true} onChange={e => setEditForm({...editForm, isVisible: e.target.checked})} className="rounded" />
                <span className="text-sm font-medium">Visible on Public Site</span>
              </label>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button type="button" onClick={() => { setEditingId(null); setIsNew(false); }} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 border rounded-xl" disabled={saving}>
              Cancel
            </button>
            <button type="button" onClick={handleSaveEdit} disabled={saving || !editForm.degree || !editForm.institution} className="px-5 py-2 text-sm bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4"/>}
              {saving ? 'Saving...' : 'Save Education'}
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {sorted.map(item => (
          <div key={item.id} className={`bg-white border rounded-2xl p-5 shadow-sm transition hover:border-slate-300 ${!item.isVisible ? 'opacity-60 bg-slate-50/50' : ''}`}>
            <div className="flex justify-between items-center gap-4">
              <div className="min-w-0">
                <h3 className="font-bold text-slate-900 text-sm truncate">{item.degree}</h3>
                <p className="text-slate-500 text-xs">{item.institution} &bull; {item.startYear} &ndash; {item.endYear}{item.location ? ` &bull; ${item.location}` : ''}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button type="button" onClick={() => handleToggleVisible(item.id)} className={`p-2 rounded-lg border transition ${item.isVisible ? 'text-green-600 bg-green-50 border-green-200' : 'text-slate-400 bg-slate-50 border-slate-200'}`} title="Toggle visibility" disabled={saving}>
                  {item.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <button type="button" onClick={() => { setEditingId(item.id); setEditForm(item); setIsNew(false); }} className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 border border-slate-200 rounded-lg transition" title="Edit" disabled={saving}>
                  <Edit2 className="w-4 h-4"/>
                </button>
                <button type="button" onClick={() => handleDelete(item.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 border border-slate-200 rounded-lg transition" title="Delete" disabled={saving}>
                  <Trash2 className="w-4 h-4"/>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
