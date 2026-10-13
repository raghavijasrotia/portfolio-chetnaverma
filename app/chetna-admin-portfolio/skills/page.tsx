"use client";
import { useEffect, useState } from "react";
import { PortfolioData, Skill } from "@/lib/types";
import { Loader2, Plus, Trash2, Edit2, Eye, EyeOff, X, Check, Layers, AlertCircle } from "lucide-react";

const DEFAULT_CATEGORIES = [
  "Cloud Platforms",
  "Infrastructure as Code",
  "CI/CD",
  "Containers & Orchestration",
  "Monitoring & Logging",
  "Scripting & Automation",
  "Operating Systems",
  "Web Servers & Reverse Proxy",
  "Databases",
  "Version Control",
  "Security & Networking",
];

const emptySkill = (defaultCat: string = 'Cloud Platforms'): Skill => ({
  id: `s-${Date.now()}`,
  name: '',
  category: defaultCat,
  level: '',
  displayOrder: 1,
  isVisible: true
});

export default function SkillsAdmin() {
  const [data, setData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Skill>(emptySkill());
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isNew, setIsNew] = useState(false);
  const [filterCat, setFilterCat] = useState('All');

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
      if (res.ok && resData.success !== false) {
        setData(newData);
        setSaveMsg('Saved & published live!');
        setTimeout(() => setSaveMsg(''), 3000);
      } else {
        setErrorMsg(resData.error || 'Failed to save skill. Please try again.');
      }
    } catch {
      setErrorMsg('Network error while saving');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleVisible = (id: string) => {
    if (!data) return;
    persist({ ...data, skills: data.skills.map(s => s.id === id ? { ...s, isVisible: !s.isVisible } : s) });
  };

  const handleDelete = (id: string) => {
    if (!data || !confirm('Delete this skill?')) return;
    persist({ ...data, skills: data.skills.filter(s => s.id !== id) });
  };

  const handleSaveEdit = () => {
    if (!data || !editForm.name.trim() || !editForm.category.trim()) return;
    const finalForm = {
      ...editForm,
      name: editForm.name.trim(),
      category: editForm.category.trim(),
      displayOrder: Number(editForm.displayOrder) || 1
    };
    const updated = isNew
      ? [...data.skills, finalForm]
      : data.skills.map(s => s.id === finalForm.id ? finalForm : s);
    persist({ ...data, skills: updated });
    setEditingId(null);
    setIsNew(false);
  };

  const handleOpenNew = (category?: string) => {
    if (!data) return;
    const cat = category || (filterCat !== 'All' ? filterCat : 'Cloud Platforms');
    const s = emptySkill(cat);
    setEditForm({ ...s, displayOrder: data.skills.length + 1 });
    setEditingId(s.id);
    setIsNew(true);
  };

  if (loading || !data) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // Aggregate categories
  const existingCategories = Array.from(new Set(data.skills.map(s => s.category).filter(Boolean)));
  const allCategorySuggestions = Array.from(new Set([...existingCategories, ...DEFAULT_CATEGORIES]));
  const categoriesFilterList = ['All', ...existingCategories];

  // Group skills by category
  const skillsByCategory = data.skills.reduce((acc, skill) => {
    const cat = skill.category || 'Uncategorized';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);

  // Sort skills inside each category by displayOrder
  Object.keys(skillsByCategory).forEach(cat => {
    skillsByCategory[cat].sort((a, b) => a.displayOrder - b.displayOrder);
  });

  const displayedCategories = filterCat === 'All'
    ? Object.keys(skillsByCategory)
    : [filterCat].filter(c => skillsByCategory[c]);

  const inputClass = "w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white";

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Skills Management</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {data.skills.length} skills in {existingCategories.length} categories &middot; All updates reflect immediately on your portfolio
          </p>
        </div>
        <div className="flex items-center gap-3">
          {saveMsg && (
            <span className="text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5 animate-fade-in">
              <Check className="w-3.5 h-3.5" /> {saveMsg}
            </span>
          )}
          {errorMsg && (
            <span className="text-xs font-semibold text-red-600 bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" /> {errorMsg}
            </span>
          )}
          <button
            onClick={() => handleOpenNew()}
            disabled={saving}
            className="bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-blue-700 transition shadow-sm disabled:opacity-50"
          >
            <Plus className="w-4 h-4" /> Add Skill
          </button>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap gap-2 pt-1">
        {categoriesFilterList.map(c => {
          const count = c === 'All' ? data.skills.length : (skillsByCategory[c]?.length || 0);
          const isSelected = filterCat === c;
          return (
            <button
              key={c}
              onClick={() => setFilterCat(c)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <span>{c}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Edit / Add Modal or Box */}
      {editingId && (
        <div className="bg-white border-2 border-blue-500/30 rounded-2xl p-6 shadow-xl shadow-blue-500/5 animate-fade-in">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              {isNew ? 'Add New Skill' : 'Edit Skill'}
            </h2>
            <button
              onClick={() => { setEditingId(null); setIsNew(false); }}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Skill Name *</label>
              <input
                type="text"
                value={editForm.name}
                onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                className={inputClass}
                placeholder="e.g. Zabbix, Grafana, Terraform, AWS"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Category *</label>
              <input
                type="text"
                list="category-suggestions"
                value={editForm.category}
                onChange={e => setEditForm({ ...editForm, category: e.target.value })}
                className={inputClass}
                placeholder="Choose or type e.g. Monitoring & Logging"
                required
              />
              <datalist id="category-suggestions">
                {allCategorySuggestions.map(cat => (
                  <option key={cat} value={cat} />
                ))}
              </datalist>
              <p className="text-[11px] text-slate-400 mt-1">
                Pick from list or type any custom category name
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Proficiency Level (optional)</label>
              <input
                type="text"
                value={editForm.level || ''}
                onChange={e => setEditForm({ ...editForm, level: e.target.value })}
                className={inputClass}
                placeholder="e.g. Advanced, Expert, 3+ Years"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Display Order</label>
              <input
                type="number"
                value={editForm.displayOrder}
                onChange={e => setEditForm({ ...editForm, displayOrder: parseInt(e.target.value) || 1 })}
                className={inputClass}
                min="1"
              />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={editForm.isVisible}
                onChange={e => setEditForm({ ...editForm, isVisible: e.target.checked })}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
              />
              <span className="text-sm font-semibold text-slate-700">Display on Public Website</span>
            </label>

            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => { setEditingId(null); setIsNew(false); }}
                className="px-4 py-2 text-sm font-medium border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                className="px-5 py-2 text-sm font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition flex items-center gap-1.5 disabled:opacity-50 shadow-sm"
                disabled={saving || !editForm.name.trim() || !editForm.category.trim()}
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                {saving ? 'Saving...' : 'Save Skill'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grouped Categories and Skills Display */}
      <div className="space-y-5">
        {displayedCategories.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center">
            <p className="text-slate-500 font-medium">No skills found in this category.</p>
            <button
              onClick={() => handleOpenNew(filterCat !== 'All' ? filterCat : undefined)}
              className="mt-3 text-sm font-semibold text-blue-600 hover:underline inline-flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add first skill
            </button>
          </div>
        ) : (
          displayedCategories.map(category => {
            const catSkills = skillsByCategory[category] || [];
            const visibleCount = catSkills.filter(s => s.isVisible).length;

            return (
              <div
                key={category}
                className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs transition hover:border-slate-300"
              >
                {/* Category Header */}
                <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-blue-600" />
                    <h3 className="text-sm font-bold text-slate-900 tracking-tight uppercase">
                      {category}
                    </h3>
                    <span className="text-xs text-slate-400 font-medium">
                      ({visibleCount} of {catSkills.length} visible)
                    </span>
                  </div>

                  <button
                    onClick={() => handleOpenNew(category)}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2.5 py-1 rounded-lg transition inline-flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add to {category}
                  </button>
                </div>

                {/* Skill Pills */}
                <div className="flex flex-wrap gap-2">
                  {catSkills.map(skill => (
                    <div
                      key={skill.id}
                      className={`group flex items-center gap-2 px-3 py-1.5 rounded-xl border text-sm font-medium transition ${
                        skill.isVisible
                          ? 'bg-slate-50/80 border-slate-200 text-slate-800 hover:border-blue-300 hover:bg-blue-50/30'
                          : 'bg-slate-100/60 border-slate-200/60 text-slate-400 line-through'
                      }`}
                    >
                      <span className={skill.isVisible ? 'text-slate-800' : 'text-slate-400'}>
                        {skill.name}
                      </span>
                      {skill.level && (
                        <span className="text-[10px] font-normal px-1.5 py-0.5 rounded-md bg-white border border-slate-200 text-slate-500">
                          {skill.level}
                        </span>
                      )}

                      {/* Action buttons on pill */}
                      <div className="flex items-center gap-1 pl-1 border-l border-slate-200/80">
                        <button
                          type="button"
                          onClick={() => handleToggleVisible(skill.id)}
                          title={skill.isVisible ? 'Hide from public site' : 'Show on public site'}
                          className={`p-1 rounded-md hover:bg-white transition ${
                            skill.isVisible ? 'text-slate-400 hover:text-blue-600' : 'text-amber-500 hover:text-amber-600'
                          }`}
                        >
                          {skill.isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => { setEditingId(skill.id); setEditForm(skill); setIsNew(false); }}
                          title="Edit skill"
                          className="p-1 rounded-md text-slate-400 hover:text-blue-600 hover:bg-white transition"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(skill.id)}
                          title="Delete skill"
                          className="p-1 rounded-md text-slate-400 hover:text-red-600 hover:bg-white transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
