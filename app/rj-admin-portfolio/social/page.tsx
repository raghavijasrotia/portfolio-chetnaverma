"use client";
import { useEffect, useState } from "react";
import { PortfolioData, SocialLink } from "@/lib/types";
import { Loader2, Plus, Trash2, Edit2, Save, Eye, EyeOff } from "lucide-react";

export default function SocialAdmin() {
  const [data, setData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<SocialLink>>({});
  const [saveMsg, setSaveMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/data")
      .then(r => r.json())
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
        body: JSON.stringify(newData)
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

  const toggleVisibility = (id: string) => {
    if (!data) return;
    handleSaveData({ ...data, socialLinks: data.socialLinks.map(s => s.id === id ? { ...s, isVisible: !s.isVisible } : s) });
  };

  const handleDelete = (id: string) => {
    if (!data || !confirm('Delete this social link?')) return;
    handleSaveData({ ...data, socialLinks: data.socialLinks.filter(s => s.id !== id) });
  };

  const handleSaveEdit = () => {
    if (!data || !editForm.id) return;
    const finalForm: SocialLink = {
      id: editForm.id,
      platform: editForm.platform || 'Link',
      label: editForm.label || 'Link',
      url: editForm.url || 'https://',
      isVisible: editForm.isVisible ?? true,
      displayOrder: Number(editForm.displayOrder) || 1,
    };
    handleSaveData({ ...data, socialLinks: data.socialLinks.map(s => s.id === finalForm.id ? finalForm : s) });
    setEditingId(null);
  };

  const handleAdd = () => {
    if (!data) return;
    const newItem: SocialLink = {
      id: `sl-${Date.now()}`, platform: "New Platform", label: "Label", url: "https://",
      isVisible: true, displayOrder: data.socialLinks.length + 1
    };
    const newData = { ...data, socialLinks: [...data.socialLinks, newItem] };
    handleSaveData(newData);
    setEditingId(newItem.id);
    setEditForm(newItem);
  };

  if (loading || !data) return <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;

  const sorted = [...data.socialLinks].sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <div className="max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-slate-900">Social Links</h1><p className="text-slate-500 text-sm">Add, edit or remove social/contact links. Updates reflect automatically on public site.</p></div>
        <div className="flex items-center gap-3">
          {saveMsg && <span className="text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-3 py-1.5 rounded-lg">{saveMsg}</span>}
          {errorMsg && <span className="text-xs font-semibold text-red-600 bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg">{errorMsg}</span>}
          <button onClick={handleAdd} disabled={saving} className="bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-blue-700 transition disabled:opacity-50"><Plus className="w-4 h-4" /> Add Link</button>
        </div>
      </div>
      <div className="space-y-3">
        {sorted.map(item => (
          <div key={item.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            {editingId === item.id ? (
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-medium mb-1">Platform Name</label><input type="text" value={editForm.platform} onChange={e => setEditForm({...editForm, platform: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
                <div><label className="block text-xs font-medium mb-1">Display Label</label><input type="text" value={editForm.label} onChange={e => setEditForm({...editForm, label: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
                <div className="col-span-2"><label className="block text-xs font-medium mb-1">URL</label><input type="text" value={editForm.url} onChange={e => setEditForm({...editForm, url: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
                <div><label className="block text-xs font-medium mb-1">Display Order</label><input type="number" value={editForm.displayOrder} onChange={e => setEditForm({...editForm, displayOrder: parseInt(e.target.value) || 1})} className="w-full px-3 py-2 border rounded-lg text-sm" min="1" /></div>
                <div className="flex items-end gap-2">
                  <button onClick={() => setEditingId(null)} className="flex-1 px-3 py-2 text-sm text-slate-600 border rounded-lg hover:bg-slate-50 transition" disabled={saving}>Cancel</button>
                  <button onClick={handleSaveEdit} disabled={saving} className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-1 disabled:opacity-50">
                    {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3 h-3" />}
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${item.isVisible ? 'bg-green-500' : 'bg-slate-300'}`} />
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">{item.label}</p>
                    <p className="text-xs text-slate-400 truncate max-w-xs">{item.url}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => toggleVisibility(item.id)} className={`p-2 rounded-lg transition ${item.isVisible ? 'text-green-600 hover:bg-green-50' : 'text-slate-400 hover:bg-slate-50'}`} title={item.isVisible ? 'Hide' : 'Show'}>
                    {item.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button onClick={() => { setEditingId(item.id); setEditForm(item); }} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(item.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
