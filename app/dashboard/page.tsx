'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FlaskConical, Plus, Trash2, Edit3, Save, X, Upload,
  Database, Users, BarChart3, ChevronRight, Search,
  Palette, ArrowRight
} from 'lucide-react';

interface FormulaEntry {
  id: string;
  beforeHairColor: string;
  afterHairColor: string;
  beforeLevel: number | null;
  afterLevel: number | null;
  technique: string;
  formulaDetails: string;
  colorBrand: string | null;
  developer: string | null;
  lightener: string | null;
  toner: string | null;
  tags: string[];
  difficulty: string | null;
  _count?: { analyses: number };
}

const EMPTY_FORM = {
  beforeImageUrl: '', beforeHairColor: '', beforeHairType: '', beforeCondition: '',
  beforeLevel: '', afterImageUrl: '', afterHairColor: '', afterLevel: '',
  technique: '', formulaDetails: '', colorBrand: '', colorLine: '',
  colorShades: '', developer: '', developerRatio: '', lightener: '',
  lightenerMix: '', toner: '', tonerDeveloper: '', additives: '',
  processingTime: '', tags: '', difficulty: '', priceRange: '',
  estimatedTime: '', notes: '',
};

export default function AdminPage() {
  const [secret, setSecret] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [entries, setEntries] = useState<FormulaEntry[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [tab, setTab] = useState<'formulas' | 'leads' | 'stats'>('formulas');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  async function authenticate() {
    setLoading(true);
    try {
      const res = await fetch('/api/formulas?secret=' + secret);
      if (res.ok) {
        setAuthenticated(true);
        const data = await res.json();
        setEntries(data.entries);
        // Also fetch leads
        const leadsRes = await fetch('/api/leads', {
          headers: { 'x-admin-secret': secret },
        });
        if (leadsRes.ok) {
          const leadsData = await leadsRes.json();
          setLeads(leadsData.leads);
        }
      }
    } catch {}
    setLoading(false);
  }

  async function saveFormula() {
    setLoading(true);
    const payload = {
      ...form,
      beforeLevel: form.beforeLevel || null,
      afterLevel: form.afterLevel || null,
      colorShades: form.colorShades ? form.colorShades.split(',').map(s => s.trim()) : [],
      additives: form.additives ? form.additives.split(',').map(s => s.trim()) : [],
      tags: form.tags ? form.tags.split(',').map(s => s.trim().toLowerCase()) : [],
      ...(editingId ? { id: editingId } : {}),
    };

    try {
      const res = await fetch('/api/formulas', {
        method: editingId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-secret': secret,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setShowForm(false);
        setEditingId(null);
        setForm(EMPTY_FORM);
        // Refresh
        const refreshRes = await fetch('/api/formulas?secret=' + secret);
        if (refreshRes.ok) {
          const data = await refreshRes.json();
          setEntries(data.entries);
        }
      }
    } catch {}
    setLoading(false);
  }

  async function deleteFormula(id: string) {
    if (!confirm('Delete this formula entry?')) return;
    await fetch(`/api/formulas?id=${id}`, {
      method: 'DELETE',
      headers: { 'x-admin-secret': secret },
    });
    setEntries(prev => prev.filter(e => e.id !== id));
  }

  function editFormula(entry: FormulaEntry) {
    setForm({
      beforeImageUrl: '', beforeHairColor: entry.beforeHairColor,
      beforeHairType: '', beforeCondition: '',
      beforeLevel: String(entry.beforeLevel || ''),
      afterImageUrl: '', afterHairColor: entry.afterHairColor,
      afterLevel: String(entry.afterLevel || ''),
      technique: entry.technique,
      formulaDetails: entry.formulaDetails,
      colorBrand: entry.colorBrand || '', colorLine: '',
      colorShades: '', developer: entry.developer || '',
      developerRatio: '', lightener: entry.lightener || '',
      lightenerMix: '', toner: entry.toner || '',
      tonerDeveloper: '', additives: '',
      processingTime: '', tags: entry.tags.join(', '),
      difficulty: entry.difficulty || '', priceRange: '',
      estimatedTime: '', notes: '',
    });
    setEditingId(entry.id);
    setShowForm(true);
  }

  const filteredEntries = entries.filter(e =>
    !search ||
    e.technique.toLowerCase().includes(search.toLowerCase()) ||
    e.beforeHairColor.toLowerCase().includes(search.toLowerCase()) ||
    e.afterHairColor.toLowerCase().includes(search.toLowerCase()) ||
    e.tags.some(t => t.includes(search.toLowerCase()))
  );

  // ─── AUTH GATE ────────────────────────────────────
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-pearl flex items-center justify-center p-6">
        <div className="max-w-sm w-full">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-espresso flex items-center justify-center mx-auto mb-4">
              <FlaskConical className="w-7 h-7 text-pearl" />
            </div>
            <h1 className="font-display text-2xl font-semibold">Admin Access</h1>
            <p className="text-stone text-sm mt-1">Enter your admin secret to manage the formula database.</p>
          </div>
          <div className="space-y-3">
            <input
              type="password"
              value={secret}
              onChange={e => setSecret(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && authenticate()}
              placeholder="Admin secret key"
              className="w-full px-4 py-3 rounded-xl border border-sand bg-white focus:outline-none focus:border-caramel focus:ring-2 focus:ring-caramel/20"
            />
            <button
              onClick={authenticate}
              disabled={loading || !secret}
              className="w-full bg-espresso text-pearl py-3 rounded-xl font-medium hover:bg-ink transition-colors disabled:opacity-50"
            >
              {loading ? 'Checking...' : 'Access Dashboard'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pearl">
      {/* Nav */}
      <nav className="sticky top-0 z-50 glass border-b border-sand">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-caramel to-copper flex items-center justify-center">
              <FlaskConical className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-display text-lg font-semibold">ColorLab Admin</span>
          </div>
          <div className="flex gap-1 bg-cream rounded-lg p-1">
            {[
              { key: 'formulas' as const, icon: Database, label: 'Formulas' },
              { key: 'leads' as const, icon: Users, label: 'Leads' },
              { key: 'stats' as const, icon: BarChart3, label: 'Stats' },
            ].map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  tab === t.key ? 'bg-white text-espresso shadow-sm' : 'text-stone hover:text-espresso'
                }`}
              >
                <t.icon className="w-3.5 h-3.5" /> {t.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* ─── FORMULAS TAB ────────────────────────── */}
        {tab === 'formulas' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-display text-2xl font-semibold">Formula Database</h2>
                <p className="text-stone text-sm">{entries.length} entries · Add before/after photos with formulas</p>
              </div>
              <button
                onClick={() => { setShowForm(true); setEditingId(null); setForm(EMPTY_FORM); }}
                className="bg-espresso text-pearl px-5 py-2.5 rounded-full text-sm font-medium hover:bg-ink transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add Entry
              </button>
            </div>

            {/* Search */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-clay" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by technique, color, or tag..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-sand bg-white focus:outline-none focus:border-caramel text-sm"
              />
            </div>

            {/* Entry Form Modal */}
            {showForm && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-sand rounded-2xl p-6 mb-8 shadow-lg"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-display text-xl font-semibold">
                    {editingId ? 'Edit Entry' : 'New Formula Entry'}
                  </h3>
                  <button onClick={() => setShowForm(false)} className="text-clay hover:text-espresso">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Before Section */}
                  <div>
                    <h4 className="text-sm font-semibold text-espresso mb-3 uppercase tracking-wider">Before (Client)</h4>
                    <div className="space-y-3">
                      <FormField label="Before Image URL" value={form.beforeImageUrl} onChange={v => setForm(p => ({ ...p, beforeImageUrl: v }))} placeholder="https://..." />
                      <FormField label="Before Hair Color *" value={form.beforeHairColor} onChange={v => setForm(p => ({ ...p, beforeHairColor: v }))} placeholder="e.g. Level 5 warm brown" />
                      <FormField label="Before Level (1-10)" value={form.beforeLevel} onChange={v => setForm(p => ({ ...p, beforeLevel: v }))} placeholder="5" type="number" />
                      <FormField label="Hair Type" value={form.beforeHairType} onChange={v => setForm(p => ({ ...p, beforeHairType: v }))} placeholder="e.g. 2B wavy, medium porosity" />
                      <FormField label="Condition" value={form.beforeCondition} onChange={v => setForm(p => ({ ...p, beforeCondition: v }))} placeholder="e.g. Virgin hair, no prior color" />
                    </div>
                  </div>

                  {/* After Section */}
                  <div>
                    <h4 className="text-sm font-semibold text-espresso mb-3 uppercase tracking-wider">After (Result)</h4>
                    <div className="space-y-3">
                      <FormField label="After Image URL" value={form.afterImageUrl} onChange={v => setForm(p => ({ ...p, afterImageUrl: v }))} placeholder="https://..." />
                      <FormField label="After Hair Color *" value={form.afterHairColor} onChange={v => setForm(p => ({ ...p, afterHairColor: v }))} placeholder="e.g. Level 8 cool blonde balayage" />
                      <FormField label="After Level (1-10)" value={form.afterLevel} onChange={v => setForm(p => ({ ...p, afterLevel: v }))} placeholder="8" type="number" />
                    </div>
                  </div>

                  {/* Technique & Formula */}
                  <div className="md:col-span-2">
                    <h4 className="text-sm font-semibold text-espresso mb-3 uppercase tracking-wider">Formula Details</h4>
                    <div className="grid md:grid-cols-2 gap-3">
                      <FormField label="Technique *" value={form.technique} onChange={v => setForm(p => ({ ...p, technique: v }))} placeholder="e.g. Balayage, Full foil, Shadow root" />
                      <FormField label="Color Brand" value={form.colorBrand} onChange={v => setForm(p => ({ ...p, colorBrand: v }))} placeholder="e.g. Redken, Wella, Schwarzkopf" />
                      <FormField label="Color Line" value={form.colorLine} onChange={v => setForm(p => ({ ...p, colorLine: v }))} placeholder="e.g. Shades EQ, Koleston Perfect" />
                      <FormField label="Color Shades (comma-separated)" value={form.colorShades} onChange={v => setForm(p => ({ ...p, colorShades: v }))} placeholder="e.g. 7NB, 8V, 9P" />
                      <FormField label="Developer" value={form.developer} onChange={v => setForm(p => ({ ...p, developer: v }))} placeholder="e.g. 20 vol, 30 vol" />
                      <FormField label="Developer Ratio" value={form.developerRatio} onChange={v => setForm(p => ({ ...p, developerRatio: v }))} placeholder="e.g. 1:1, 1:2" />
                      <FormField label="Lightener" value={form.lightener} onChange={v => setForm(p => ({ ...p, lightener: v }))} placeholder="e.g. Flash Lift, BlondMe" />
                      <FormField label="Lightener Mix" value={form.lightenerMix} onChange={v => setForm(p => ({ ...p, lightenerMix: v }))} placeholder="e.g. 30 vol, 1:2 ratio" />
                      <FormField label="Toner" value={form.toner} onChange={v => setForm(p => ({ ...p, toner: v }))} placeholder="e.g. Shades EQ 9V + 9T equal parts" />
                      <FormField label="Toner Developer" value={form.tonerDeveloper} onChange={v => setForm(p => ({ ...p, tonerDeveloper: v }))} placeholder="e.g. Processing solution" />
                      <FormField label="Additives (comma-separated)" value={form.additives} onChange={v => setForm(p => ({ ...p, additives: v }))} placeholder="e.g. Olaplex No.1, B3 Brazilian Bond" />
                      <FormField label="Processing Time" value={form.processingTime} onChange={v => setForm(p => ({ ...p, processingTime: v }))} placeholder="e.g. 35 minutes under heat" />
                    </div>
                  </div>

                  {/* Full formula text */}
                  <div className="md:col-span-2">
                    <label className="text-xs text-stone uppercase tracking-wider block mb-1">Full Formula Details *</label>
                    <textarea
                      value={form.formulaDetails}
                      onChange={e => setForm(p => ({ ...p, formulaDetails: e.target.value }))}
                      placeholder="Write the complete formula and technique notes here. This is the main text that gets matched and displayed..."
                      rows={4}
                      className="w-full px-3 py-2 rounded-lg border border-sand bg-pearl/50 focus:outline-none focus:border-caramel text-sm resize-none"
                    />
                  </div>

                  {/* Metadata */}
                  <div className="md:col-span-2">
                    <h4 className="text-sm font-semibold text-espresso mb-3 uppercase tracking-wider">Categorization</h4>
                    <div className="grid md:grid-cols-4 gap-3">
                      <FormField label="Tags (comma-separated)" value={form.tags} onChange={v => setForm(p => ({ ...p, tags: v }))} placeholder="blonde, balayage, cool-tone" />
                      <div>
                        <label className="text-xs text-stone uppercase tracking-wider block mb-1">Difficulty</label>
                        <select
                          value={form.difficulty}
                          onChange={e => setForm(p => ({ ...p, difficulty: e.target.value }))}
                          className="w-full px-3 py-2 rounded-lg border border-sand bg-pearl/50 focus:outline-none focus:border-caramel text-sm"
                        >
                          <option value="">Select...</option>
                          <option value="beginner">Beginner</option>
                          <option value="intermediate">Intermediate</option>
                          <option value="advanced">Advanced</option>
                        </select>
                      </div>
                      <FormField label="Estimated Time" value={form.estimatedTime} onChange={v => setForm(p => ({ ...p, estimatedTime: v }))} placeholder="e.g. 3-4 hours" />
                      <div>
                        <label className="text-xs text-stone uppercase tracking-wider block mb-1">Price Range</label>
                        <select
                          value={form.priceRange}
                          onChange={e => setForm(p => ({ ...p, priceRange: e.target.value }))}
                          className="w-full px-3 py-2 rounded-lg border border-sand bg-pearl/50 focus:outline-none focus:border-caramel text-sm"
                        >
                          <option value="">Select...</option>
                          <option value="$">$ (Budget)</option>
                          <option value="$$">$$ (Mid)</option>
                          <option value="$$$">$$$ (Premium)</option>
                          <option value="$$$$">$$$$ (Luxury)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <FormField label="Notes" value={form.notes} onChange={v => setForm(p => ({ ...p, notes: v }))} placeholder="Any additional stylist notes..." />
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-sand">
                  <button onClick={() => setShowForm(false)} className="px-5 py-2 rounded-full text-sm text-stone hover:text-espresso transition-colors">
                    Cancel
                  </button>
                  <button
                    onClick={saveFormula}
                    disabled={loading || !form.beforeHairColor || !form.afterHairColor || !form.technique || !form.formulaDetails}
                    className="bg-espresso text-pearl px-6 py-2 rounded-full text-sm font-medium hover:bg-ink transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" /> {editingId ? 'Update' : 'Save'} Entry
                  </button>
                </div>
              </motion.div>
            )}

            {/* Entries List */}
            <div className="space-y-3">
              {filteredEntries.length === 0 ? (
                <div className="text-center py-16 text-stone">
                  <Database className="w-10 h-10 mx-auto mb-3 text-clay" />
                  <p className="font-medium">No formula entries yet</p>
                  <p className="text-sm mt-1">Click &ldquo;Add Entry&rdquo; to start building your formula database.</p>
                </div>
              ) : (
                filteredEntries.map(entry => (
                  <div key={entry.id} className="formula-card rounded-xl p-4 flex items-center gap-4 group">
                    <div className="flex-shrink-0 flex items-center gap-2">
                      <div className="w-10 h-10 rounded-lg bg-cream flex items-center justify-center">
                        <span className="font-mono text-sm font-bold text-stone">{entry.beforeLevel || '?'}</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-caramel" />
                      <div className="w-10 h-10 rounded-lg bg-caramel/10 flex items-center justify-center">
                        <span className="font-mono text-sm font-bold text-caramel">{entry.afterLevel || '?'}</span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-medium text-sm text-espresso">{entry.technique}</span>
                        {entry.colorBrand && (
                          <span className="text-xs bg-cream px-2 py-0.5 rounded-full text-stone">{entry.colorBrand}</span>
                        )}
                        {entry.difficulty && (
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            entry.difficulty === 'beginner' ? 'bg-emerald-50 text-emerald-600' :
                            entry.difficulty === 'intermediate' ? 'bg-amber-50 text-amber-600' :
                            'bg-rose-50 text-rose-600'
                          }`}>{entry.difficulty}</span>
                        )}
                      </div>
                      <p className="text-xs text-stone truncate">{entry.beforeHairColor} → {entry.afterHairColor}</p>
                      <div className="flex gap-1 mt-1">
                        {entry.tags.slice(0, 4).map(tag => (
                          <span key={tag} className="text-[10px] bg-sand/60 px-1.5 py-0.5 rounded text-stone">{tag}</span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => editFormula(entry)} className="p-2 rounded-lg hover:bg-cream text-stone hover:text-espresso">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button onClick={() => deleteFormula(entry.id)} className="p-2 rounded-lg hover:bg-rose/10 text-stone hover:text-rose">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ─── LEADS TAB ──────────────────────────── */}
        {tab === 'leads' && (
          <div>
            <div className="mb-6">
              <h2 className="font-display text-2xl font-semibold">Leads & Waitlist</h2>
              <p className="text-stone text-sm">{leads.length} total leads captured</p>
            </div>
            <div className="bg-white rounded-2xl border border-sand overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-cream/50">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs text-stone uppercase tracking-wider">Email</th>
                    <th className="text-left px-4 py-3 text-xs text-stone uppercase tracking-wider">Name</th>
                    <th className="text-left px-4 py-3 text-xs text-stone uppercase tracking-wider">Salon</th>
                    <th className="text-left px-4 py-3 text-xs text-stone uppercase tracking-wider">Source</th>
                    <th className="text-left px-4 py-3 text-xs text-stone uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map(lead => (
                    <tr key={lead.id} className="border-t border-sand/50 hover:bg-cream/20">
                      <td className="px-4 py-3 font-mono text-xs">{lead.email}</td>
                      <td className="px-4 py-3">{lead.name || '—'}</td>
                      <td className="px-4 py-3">{lead.salon || '—'}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs bg-cream px-2 py-0.5 rounded-full">{lead.source || 'direct'}</span>
                      </td>
                      <td className="px-4 py-3 text-stone text-xs">
                        {new Date(lead.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {leads.length === 0 && (
                <div className="text-center py-12 text-stone">
                  <Users className="w-8 h-8 mx-auto mb-2 text-clay" />
                  <p className="text-sm">No leads yet. Share your landing page to start capturing!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── STATS TAB ─────────────────────────── */}
        {tab === 'stats' && (
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { label: 'Total Formulas', value: entries.length, icon: Database },
              { label: 'Total Leads', value: leads.length, icon: Users },
              { label: 'Total Analyses', value: entries.reduce((sum, e) => sum + (e._count?.analyses || 0), 0), icon: BarChart3 },
            ].map(stat => (
              <div key={stat.label} className="formula-card rounded-2xl p-6 text-center">
                <stat.icon className="w-8 h-8 text-caramel mx-auto mb-3" />
                <div className="font-display text-4xl font-semibold text-espresso">{stat.value}</div>
                <div className="text-sm text-stone mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function FormField({
  label, value, onChange, placeholder, type = 'text',
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string;
}) {
  return (
    <div>
      <label className="text-xs text-stone uppercase tracking-wider block mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 rounded-lg border border-sand bg-pearl/50 focus:outline-none focus:border-caramel text-sm"
      />
    </div>
  );
}
