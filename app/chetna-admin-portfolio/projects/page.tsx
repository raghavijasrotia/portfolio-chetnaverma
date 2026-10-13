"use client";
import { useEffect, useState } from "react";
import { PortfolioData, Project } from "@/lib/types";
import { Loader2, Plus, Trash2, Edit2, Save, Eye, EyeOff, Star, X, Check } from "lucide-react";

const emptyProject = (): Project => ({
  id: `p-${Date.now()}`, name: '', shortDescription: '', detailedDescription: '',
  technologies: [], architectureHighlights: [], isFeatured: false, isVisible: true, displayOrder: 1
});

export default function ProjectsAdmin() {
  const [data, setData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Project>(emptyProject());
  const [saving, setSaving] = useState(false);
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
    persist({ ...data, projects: data.projects.map(p => p.id === id ? { ...p, isVisible: !p.isVisible } : p) });
  };
  const handleToggleFeatured = (id: string) => {
    if (!data) return;
    persist({ ...data, projects: data.projects.map(p => p.id === id ? { ...p, isFeatured: !p.isFeatured } : p) });
  };
  const handleDelete = (id: string) => {
    if (!data || !confirm('Delete this project?')) return;
    persist({ ...data, projects: data.projects.filter(p => p.id !== id) });
  };
  const handleSaveEdit = () => {
    if (!data) return;
    const finalForm = { ...editForm, displayOrder: Number(editForm.displayOrder) || 1 };
    const updated = isNew
      ? [...data.projects, finalForm]
      : data.projects.map(p => p.id === finalForm.id ? finalForm : p);
    persist({ ...data, projects: updated });
    setEditingId(null);
    setIsNew(false);
  };
  const handleAddNew = () => {
    const p = emptyProject();
    setEditForm({ ...p, displayOrder: (data?.projects.length || 0) + 1 });
    setEditingId(p.id);
    setIsNew(true);
  };

  if (loading || !data) return <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;

  const sorted = [...data.projects].sort((a, b) => a.displayOrder - b.displayOrder);
  const inputClass = "w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm";
  const labelClass = "block text-xs font-semibold text-slate-600 mb-1";

  return (
    <div className="max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-slate-900">Projects</h1><p className="text-slate-500 text-sm">{data.projects.length} projects · {data.projects.filter(p => p.isFeatured).length} featured</p></div>
        <div className="flex gap-3 items-center">
          {saveMsg && <span className="text-sm text-green-600 font-medium">{saveMsg}</span>}
          <button onClick={handleAddNew} className="bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-blue-700 transition"><Plus className="w-4 h-4" /> Add Project</button>
        </div>
      </div>

      {editingId && (
        <div className="bg-white border border-blue-200 rounded-2xl p-6 mb-6 shadow-lg">
          <h2 className="font-bold text-slate-900 mb-4">{isNew ? 'New Project' : 'Edit Project'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2"><label className={labelClass}>Project Name</label><input type="text" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className={inputClass} /></div>
            <div className="md:col-span-2"><label className={labelClass}>Short Description</label><input type="text" value={editForm.shortDescription} onChange={e => setEditForm({...editForm, shortDescription: e.target.value})} className={inputClass} /></div>
            <div className="md:col-span-2"><label className={labelClass}>Detailed Description</label><textarea value={editForm.detailedDescription} onChange={e => setEditForm({...editForm, detailedDescription: e.target.value})} className={`${inputClass} h-24`} /></div>
            <div className="md:col-span-2"><label className={labelClass}>Technologies (comma separated)</label><input type="text" value={editForm.technologies.join(', ')} onChange={e => setEditForm({...editForm, technologies: e.target.value.split(',').map(s=>s.trim()).filter(Boolean)})} className={inputClass} /></div>
            <div className="md:col-span-2"><label className={labelClass}>Architecture Highlights (comma separated)</label><input type="text" value={editForm.architectureHighlights.join(', ')} onChange={e => setEditForm({...editForm, architectureHighlights: e.target.value.split(',').map(s=>s.trim()).filter(Boolean)})} className={inputClass} /></div>
            <div><label className={labelClass}>GitHub URL</label><input type="url" value={editForm.githubUrl || ''} onChange={e => setEditForm({...editForm, githubUrl: e.target.value})} className={inputClass} /></div>
            <div><label className={labelClass}>Live URL</label><input type="url" value={editForm.liveUrl || ''} onChange={e => setEditForm({...editForm, liveUrl: e.target.value})} className={inputClass} /></div>
            <div><label className={labelClass}>Display Order</label><input type="number" value={editForm.displayOrder} onChange={e => setEditForm({...editForm, displayOrder: parseInt(e.target.value) || 1})} className={inputClass} min="1" /></div>
            <div className="flex gap-4 items-end">
              <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={editForm.isFeatured} onChange={e => setEditForm({...editForm, isFeatured: e.target.checked})} /><span className="text-sm font-medium">Featured</span></label>
              <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={editForm.isVisible} onChange={e => setEditForm({...editForm, isVisible: e.target.checked})} /><span className="text-sm font-medium">Visible</span></label>
            </div>
          </div>
          <div className="flex gap-3 mt-5">
            <button onClick={() => { setEditingId(null); setIsNew(false); }} className="px-4 py-2 text-sm text-slate-600 border rounded-xl hover:bg-slate-50 transition flex items-center gap-1" disabled={saving}><X className="w-3 h-3" /> Cancel</button>
            <button onClick={handleSaveEdit} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition flex items-center gap-1 disabled:opacity-50" disabled={saving || !editForm.name}>
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              {saving ? 'Saving...' : 'Save Project'}
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {sorted.map(project => (
          <div key={project.id} className={`bg-white border rounded-xl p-4 shadow-sm ${!project.isVisible ? 'opacity-60' : ''}`}>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-xs font-mono text-slate-300 w-5 text-center">{project.displayOrder}</span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-slate-900 text-sm truncate">{project.name}</p>
                    {project.isFeatured && <span className="text-xs font-bold text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full shrink-0">⭐ Featured</span>}
                  </div>
                  <p className="text-xs text-slate-400 truncate">{project.shortDescription}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {project.technologies.slice(0, 5).map(t => <span key={t} className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded">{t}</span>)}
                  </div>
                </div>
              </div>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => handleToggleFeatured(project.id)} className={`p-2 rounded-lg transition ${project.isFeatured ? 'text-amber-500 bg-amber-50' : 'text-slate-300 hover:text-amber-400 hover:bg-amber-50'}`} title="Toggle featured"><Star className="w-4 h-4" /></button>
                <button onClick={() => handleToggleVisible(project.id)} className={`p-2 rounded-lg transition ${project.isVisible ? 'text-green-600 hover:bg-green-50' : 'text-slate-400 hover:bg-slate-50'}`} title="Toggle visibility">{project.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}</button>
                <button onClick={() => { setEditingId(project.id); setEditForm(project); setIsNew(false); }} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"><Edit2 className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(project.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
