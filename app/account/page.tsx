'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  FlaskConical, User, Users, BookOpen, Settings, LogOut,
  Plus, Trash2, Edit3, Star, ChevronRight, Search,
  ArrowRight, Crown, Clock, Loader2, X, Save, Heart
} from 'lucide-react';

interface UserData {
  id: string;
  email: string;
  name: string;
  salon: string | null;
  plan: string;
  hasWhyAddon: boolean;
  analysisCount: number;
  freeAnalysesUsed: number;
  clientCount: number;
  formulaCount: number;
}

interface ClientData {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  naturalLevel: number | null;
  currentColor: string | null;
  hairType: string | null;
  grayPercentage: number | null;
  notes: string | null;
  _count: { savedFormulas: number };
}

interface SavedFormulaData {
  id: string;
  createdAt: string;
  clientImageUrl: string | null;
  inspoImageUrl: string | null;
  analysisResult: any;
  notes: string | null;
  favorite: boolean;
  client: { id: string; name: string } | null;
}

export default function AccountPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'formulas' | 'clients' | 'settings'>('formulas');
  const [clients, setClients] = useState<ClientData[]>([]);
  const [formulas, setFormulas] = useState<SavedFormulaData[]>([]);
  const [showClientForm, setShowClientForm] = useState(false);
  const [editingClient, setEditingClient] = useState<string | null>(null);
  const [clientForm, setClientForm] = useState({
    name: '', email: '', phone: '', instagram: '', notes: '',
    naturalLevel: '', currentColor: '', hairType: '', porosity: '',
    condition: '', grayPercentage: '', allergies: '',
  });
  const [profileForm, setProfileForm] = useState({
    name: '', salon: '', city: '', state: '', phone: '', instagram: '',
  });
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchUser();
  }, []);

  async function fetchUser() {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.user) {
        setUser(data.user);
        setProfileForm({
          name: data.user.name || '',
          salon: data.user.salon || '',
          city: '',
          state: '',
          phone: '',
          instagram: '',
        });
        fetchClients();
        fetchFormulas();
      } else {
        window.location.href = '/login';
      }
    } catch {
      window.location.href = '/login';
    }
    setLoading(false);
  }

  async function fetchClients() {
    const res = await fetch('/api/clients');
    if (res.ok) {
      const data = await res.json();
      setClients(data.clients);
    }
  }

  async function fetchFormulas() {
    const res = await fetch('/api/saved-formulas');
    if (res.ok) {
      const data = await res.json();
      setFormulas(data.formulas);
    }
  }

  async function saveClient() {
    const method = editingClient ? 'PUT' : 'POST';
    const body = editingClient ? { id: editingClient, ...clientForm } : clientForm;

    const res = await fetch('/api/clients', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      setShowClientForm(false);
      setEditingClient(null);
      setClientForm({ name: '', email: '', phone: '', instagram: '', notes: '', naturalLevel: '', currentColor: '', hairType: '', porosity: '', condition: '', grayPercentage: '', allergies: '' });
      fetchClients();
    }
  }

  async function deleteClient(id: string) {
    if (!confirm('Delete this client and all their saved formulas?')) return;
    await fetch(`/api/clients?id=${id}`, { method: 'DELETE' });
    fetchClients();
    fetchFormulas();
  }

  async function toggleFavorite(id: string, current: boolean) {
    await fetch('/api/saved-formulas', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, favorite: !current }),
    });
    fetchFormulas();
  }

  async function deleteFormula(id: string) {
    if (!confirm('Delete this saved formula?')) return;
    await fetch(`/api/saved-formulas?id=${id}`, { method: 'DELETE' });
    fetchFormulas();
  }

  async function updateProfile() {
    const res = await fetch('/api/auth/me', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileForm),
    });
    if (res.ok) {
      fetchUser();
      alert('Profile updated!');
    }
  }

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    localStorage.removeItem('colorlab_user');
    window.location.href = '/';
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-pearl flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-caramel animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  const getPlanLabel = (plan: string) => {
    const labels: Record<string, string> = { free: 'Free', stylist: 'Stylist', salon: 'Salon', enterprise: 'Enterprise' };
    return labels[plan] || plan;
  };

  const getPlanLimit = (plan: string) => {
    const limits: Record<string, number | string> = { free: 3, stylist: 50, salon: 'Unlimited', enterprise: 'Unlimited' };
    return limits[plan] || 3;
  };

  return (
    <div className="min-h-screen bg-pearl">
      {/* Nav */}
      <nav className="sticky top-0 z-50 glass border-b border-sand">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-caramel to-copper flex items-center justify-center">
              <FlaskConical className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-display text-lg font-semibold tracking-tight">ColorLab</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/upload" className="text-sm text-stone hover:text-espresso transition-colors">
              New Analysis
            </Link>
            <span className="text-xs bg-caramel/10 text-caramel px-2.5 py-1 rounded-full font-medium">
              {getPlanLabel(user.plan)}
            </span>
            <button onClick={logout} className="text-sm text-stone hover:text-espresso transition-colors flex items-center gap-1">
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl font-medium mb-1">Hey, {user.name}!</h1>
          <p className="text-stone text-sm">
            {user.freeAnalysesUsed} of {getPlanLimit(user.plan)} analyses used this month
            {user.plan === 'free' && (
              <Link href="/pricing" className="text-caramel hover:text-copper ml-2 inline-flex items-center gap-1">
                <Crown className="w-3 h-3" /> Upgrade
              </Link>
            )}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="formula-card rounded-xl p-4 text-center">
            <div className="font-display text-2xl font-bold text-espresso">{user.analysisCount}</div>
            <div className="text-xs text-stone">Total Analyses</div>
          </div>
          <div className="formula-card rounded-xl p-4 text-center">
            <div className="font-display text-2xl font-bold text-espresso">{formulas.length}</div>
            <div className="text-xs text-stone">Saved Formulas</div>
          </div>
          <div className="formula-card rounded-xl p-4 text-center">
            <div className="font-display text-2xl font-bold text-espresso">{clients.length}</div>
            <div className="text-xs text-stone">Clients</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-cream rounded-lg p-1 mb-8 w-fit">
          {[
            { key: 'formulas' as const, icon: BookOpen, label: 'Saved Formulas' },
            { key: 'clients' as const, icon: Users, label: 'Clients' },
            { key: 'settings' as const, icon: Settings, label: 'Profile' },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                tab === t.key ? 'bg-white text-espresso shadow-sm' : 'text-stone hover:text-espresso'
              }`}
            >
              <t.icon className="w-4 h-4" /> {t.label}
            </button>
          ))}
        </div>

        {/* ─── SAVED FORMULAS TAB ──────────────────── */}
        {tab === 'formulas' && (
          <div>
            {formulas.length === 0 ? (
              <div className="text-center py-16">
                <BookOpen className="w-10 h-10 text-clay mx-auto mb-3" />
                <h3 className="font-display text-xl font-semibold mb-2">No Saved Formulas Yet</h3>
                <p className="text-stone text-sm mb-4">Run an analysis and save the formula to see it here.</p>
                <Link href="/upload" className="inline-flex items-center gap-2 bg-espresso text-pearl px-6 py-2.5 rounded-full text-sm font-medium hover:bg-ink transition-colors">
                  <FlaskConical className="w-4 h-4" /> New Analysis
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {formulas.map(formula => {
                  const result = formula.analysisResult;
                  const rec = result?.recommendation;
                  return (
                    <div key={formula.id} className="formula-card rounded-xl p-4 group">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm text-espresso">{rec?.technique || 'Analysis'}</span>
                            {formula.client && (
                              <span className="text-xs bg-cream px-2 py-0.5 rounded-full text-stone">{formula.client.name}</span>
                            )}
                            {rec?.difficulty && (
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                rec.difficulty === 'beginner' ? 'bg-emerald-50 text-emerald-600' :
                                rec.difficulty === 'intermediate' ? 'bg-amber-50 text-amber-600' :
                                'bg-rose-50 text-rose-600'
                              }`}>{rec.difficulty}</span>
                            )}
                          </div>
                          <p className="text-xs text-stone truncate mb-1">{rec?.summary || ''}</p>
                          <div className="flex items-center gap-3 text-xs text-clay">
                            {rec?.estimatedTime && <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {rec.estimatedTime}</span>}
                            <span>{new Date(formula.createdAt).toLocaleDateString()}</span>
                          </div>
                          {formula.notes && <p className="text-xs text-stone mt-1 italic">{formula.notes}</p>}
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => toggleFavorite(formula.id, formula.favorite)}
                            className={`p-2 rounded-lg transition-colors ${formula.favorite ? 'text-rose bg-rose/10' : 'text-stone hover:text-rose hover:bg-rose/10'}`}
                          >
                            <Heart className={`w-4 h-4 ${formula.favorite ? 'fill-current' : ''}`} />
                          </button>
                          <button onClick={() => deleteFormula(formula.id)} className="p-2 rounded-lg text-stone hover:text-rose hover:bg-rose/10 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ─── CLIENTS TAB ──────────────────────────── */}
        {tab === 'clients' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div />
              <button
                onClick={() => { setShowClientForm(true); setEditingClient(null); setClientForm({ name: '', email: '', phone: '', instagram: '', notes: '', naturalLevel: '', currentColor: '', hairType: '', porosity: '', condition: '', grayPercentage: '', allergies: '' }); }}
                className="bg-espresso text-pearl px-5 py-2 rounded-full text-sm font-medium hover:bg-ink transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add Client
              </button>
            </div>

            {/* Client Form */}
            {showClientForm && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-sand rounded-2xl p-6 mb-6 shadow-lg"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display text-lg font-semibold">{editingClient ? 'Edit Client' : 'New Client'}</h3>
                  <button onClick={() => setShowClientForm(false)} className="text-clay hover:text-espresso"><X className="w-5 h-5" /></button>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <InputField label="Name *" value={clientForm.name} onChange={v => setClientForm(p => ({ ...p, name: v }))} placeholder="Client name" />
                  <InputField label="Email" value={clientForm.email} onChange={v => setClientForm(p => ({ ...p, email: v }))} placeholder="client@email.com" />
                  <InputField label="Phone" value={clientForm.phone} onChange={v => setClientForm(p => ({ ...p, phone: v }))} placeholder="(555) 123-4567" />
                  <InputField label="Instagram" value={clientForm.instagram} onChange={v => setClientForm(p => ({ ...p, instagram: v }))} placeholder="@handle" />
                  <InputField label="Natural Level (1-10)" value={clientForm.naturalLevel} onChange={v => setClientForm(p => ({ ...p, naturalLevel: v }))} placeholder="5" />
                  <InputField label="Current Color" value={clientForm.currentColor} onChange={v => setClientForm(p => ({ ...p, currentColor: v }))} placeholder="e.g. Level 7 warm blonde" />
                  <InputField label="Hair Type" value={clientForm.hairType} onChange={v => setClientForm(p => ({ ...p, hairType: v }))} placeholder="e.g. 2B wavy, medium" />
                  <InputField label="Grey %" value={clientForm.grayPercentage} onChange={v => setClientForm(p => ({ ...p, grayPercentage: v }))} placeholder="0-100" />
                  <div className="md:col-span-2">
                    <InputField label="Notes" value={clientForm.notes} onChange={v => setClientForm(p => ({ ...p, notes: v }))} placeholder="Allergies, preferences, history..." />
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-sand">
                  <button onClick={() => setShowClientForm(false)} className="px-5 py-2 rounded-full text-sm text-stone hover:text-espresso">Cancel</button>
                  <button onClick={saveClient} disabled={!clientForm.name}
                    className="bg-espresso text-pearl px-6 py-2 rounded-full text-sm font-medium hover:bg-ink disabled:opacity-50 flex items-center gap-2">
                    <Save className="w-4 h-4" /> {editingClient ? 'Update' : 'Save'} Client
                  </button>
                </div>
              </motion.div>
            )}

            {clients.length === 0 && !showClientForm ? (
              <div className="text-center py-16">
                <Users className="w-10 h-10 text-clay mx-auto mb-3" />
                <h3 className="font-display text-xl font-semibold mb-2">No Clients Yet</h3>
                <p className="text-stone text-sm mb-4">Add your clients to track their formulas and color history.</p>
                <button
                  onClick={() => setShowClientForm(true)}
                  className="inline-flex items-center gap-2 bg-espresso text-pearl px-6 py-2.5 rounded-full text-sm font-medium hover:bg-ink transition-colors"
                >
                  <Plus className="w-4 h-4" /> Add First Client
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {clients.map(client => (
                  <div key={client.id} className="formula-card rounded-xl p-4 flex items-center gap-4 group">
                    <div className="w-10 h-10 rounded-full bg-caramel/10 flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-caramel" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-medium text-sm text-espresso">{client.name}</span>
                        {client.naturalLevel && (
                          <span className="text-xs bg-cream px-2 py-0.5 rounded-full text-stone">Level {client.naturalLevel}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-stone">
                        {client.currentColor && <span>{client.currentColor}</span>}
                        {client.grayPercentage != null && client.grayPercentage > 0 && <span>{client.grayPercentage}% grey</span>}
                        <span>{client._count.savedFormulas} formulas</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          setEditingClient(client.id);
                          setClientForm({
                            name: client.name,
                            email: client.email || '',
                            phone: client.phone || '',
                            instagram: '',
                            notes: client.notes || '',
                            naturalLevel: client.naturalLevel?.toString() || '',
                            currentColor: client.currentColor || '',
                            hairType: client.hairType || '',
                            porosity: '',
                            condition: '',
                            grayPercentage: client.grayPercentage?.toString() || '',
                            allergies: '',
                          });
                          setShowClientForm(true);
                        }}
                        className="p-2 rounded-lg hover:bg-cream text-stone hover:text-espresso"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button onClick={() => deleteClient(client.id)} className="p-2 rounded-lg hover:bg-rose/10 text-stone hover:text-rose">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── SETTINGS TAB ──────────────────────────── */}
        {tab === 'settings' && (
          <div className="max-w-lg">
            <div className="formula-card rounded-2xl p-6 mb-6">
              <h3 className="font-display text-lg font-semibold mb-4">Profile</h3>
              <div className="space-y-4">
                <InputField label="Name" value={profileForm.name} onChange={v => setProfileForm(p => ({ ...p, name: v }))} />
                <InputField label="Salon" value={profileForm.salon} onChange={v => setProfileForm(p => ({ ...p, salon: v }))} placeholder="Your salon name" />
                <InputField label="Phone" value={profileForm.phone} onChange={v => setProfileForm(p => ({ ...p, phone: v }))} />
                <InputField label="Instagram" value={profileForm.instagram} onChange={v => setProfileForm(p => ({ ...p, instagram: v }))} placeholder="@handle" />
              </div>
              <button onClick={updateProfile} className="mt-4 bg-espresso text-pearl px-6 py-2 rounded-full text-sm font-medium hover:bg-ink transition-colors">
                Save Profile
              </button>
            </div>

            <div className="formula-card rounded-2xl p-6 mb-6">
              <h3 className="font-display text-lg font-semibold mb-2">Subscription</h3>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-sm text-espresso font-medium">{getPlanLabel(user.plan)} Plan</span>
                <span className="text-xs bg-caramel/10 text-caramel px-2 py-0.5 rounded-full">
                  {getPlanLimit(user.plan)} analyses/month
                </span>
              </div>
              {user.plan === 'free' && (
                <Link href="/pricing" className="inline-flex items-center gap-2 bg-caramel text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-copper transition-colors">
                  <Crown className="w-4 h-4" /> Upgrade Plan
                </Link>
              )}
            </div>

            <div className="formula-card rounded-2xl p-6">
              <h3 className="font-display text-lg font-semibold mb-2">Account</h3>
              <p className="text-sm text-stone mb-4">{user.email}</p>
              <button onClick={logout} className="text-sm text-rose hover:text-rose/80 transition-colors flex items-center gap-1.5">
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function InputField({
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
