"use client";
import { useEffect, useState } from "react";
import { PortfolioData, Certification } from "@/lib/types";
import { Loader2, Plus, Trash2, Edit2, Eye, EyeOff, Save, Check, X } from "lucide-react";

export default function CertificationsAdmin() {
  const [data, setData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Certification>>({});
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
      certifications: data.certifications.map(c => c.id === id ? { ...c, isVisible: !c.isVisible } : c)
    });
  };

  const handleDelete = (id: string) => {
    if (!data || !confirm('Delete this certification?')) return;
    handleSaveData({ ...data, certifications: data.certifications.filter(e => e.id !== id) });
  };

  const handleSaveEdit = () => {
    if (!data || !editForm.id) return;
    const finalForm: Certification = {
      id: editForm.id,
      name: editForm.name || '',
      level: editForm.level || '',
      organization: editForm.organization || '',
      issueDate: editForm.issueDate || '',
      expirationDate: editForm.expirationDate || '',
      credentialId: editForm.credentialId || '',
      credentialUrl: editForm.credentialUrl || '',
      isVisible: editForm.isVisible ?? true,
      displayOrder: Number(editForm.displayOrder) || 1,
    };
    const updated = isNew
      ? [finalForm, ...data.certifications]
      : data.certifications.map(e => e.id === finalForm.id ? finalForm : e);
    handleSaveData({ ...data, certifications: updated });
    setEditingId(null);
    setIsNew(false);
  };

  const handleAdd = () => {
    if (!data) return;
    const newItem: Certification = {
      id: `cert-${Date.now()}`,
      name: "",
      level: "Associate",
      organization: "AWS",
      issueDate: new Date().toISOString().split('T')[0],
      isVisible: true,
      displayOrder: data.certifications.length + 1
    };
    setEditingId(newItem.id);
    setEditForm(newItem);
    setIsNew(true);
  };

  if (loading || !data) return <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;

  const sorted = [...data.certifications].sort((a, b) => a.displayOrder - b.displayOrder);
  const inputClass = "w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none";

  return (
    <div className="max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Certifications</h1>
          <p className="text-slate-500 text-sm">{data.certifications.length} certificates &middot; Updates reflect automatically on public site</p>
        </div>
        <div className="flex items-center gap-3">
          {saveMsg && <span className="text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5"><Check className="w-3.5 h-3.5" /> {saveMsg}</span>}
          {errorMsg && <span className="text-xs font-semibold text-red-600 bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg">{errorMsg}</span>}
          <button onClick={handleAdd} disabled={saving} className="bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-blue-700 transition disabled:opacity-50">
            <Plus className="w-4 h-4" /> Add Certification
          </button>
        </div>
      </div>

      {editingId && (
        <div className="bg-white border-2 border-blue-200 rounded-2xl p-6 mb-6 shadow-xl space-y-4">
          <h2 className="font-bold text-slate-900 text-base">{isNew ? 'Add Certification' : 'Edit Certification'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Certification Name *</label>
              <input type="text" value={editForm.name || ''} onChange={e => setEditForm({...editForm, name: e.target.value})} className={inputClass} placeholder="e.g. AWS Certified Solutions Architect – Associate" required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Organization *</label>
              <input type="text" value={editForm.organization || ''} onChange={e => setEditForm({...editForm, organization: e.target.value})} className={inputClass} placeholder="e.g. Amazon Web Services (AWS)" required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Level</label>
              <input type="text" value={editForm.level || ''} onChange={e => setEditForm({...editForm, level: e.target.value})} className={inputClass} placeholder="e.g. Associate, Professional" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Issue Date *</label>
              <input type="date" value={editForm.issueDate || ''} onChange={e => setEditForm({...editForm, issueDate: e.target.value})} className={inputClass} required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Expiration Date (optional)</label>
              <input type="date" value={editForm.expirationDate || ''} onChange={e => setEditForm({...editForm, expirationDate: e.target.value})} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Credential ID (optional)</label>
              <input type="text" value={editForm.credentialId || ''} onChange={e => setEditForm({...editForm, credentialId: e.target.value})} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Verification URL (optional)</label>
              <input type="url" value={editForm.credentialUrl || ''} onChange={e => setEditForm({...editForm, credentialUrl: e.target.value})} className={inputClass} placeholder="https://..." />
            </div>
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
            <button type="button" onClick={handleSaveEdit} disabled={saving || !editForm.name || !editForm.organization} className="px-5 py-2 text-sm bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4"/>}
              {saving ? 'Saving...' : 'Save Certification'}
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {sorted.map(item => (
          <div key={item.id} className={`bg-white border rounded-2xl p-5 shadow-sm transition hover:border-slate-300 ${!item.isVisible ? 'opacity-60 bg-slate-50/50' : ''}`}>
            <div className="flex justify-between items-center gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="font-bold text-slate-900 text-sm truncate">{item.name}</h3>
                  {item.level && <span className="text-[10px] bg-amber-50 text-amber-700 font-semibold px-2 py-0.5 rounded-full border border-amber-200">{item.level}</span>}
                </div>
                <p className="text-slate-500 text-xs">{item.organization} &bull; Issued {item.issueDate}{item.expirationDate ? ` &bull; Exp: ${item.expirationDate}` : ''}</p>
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
