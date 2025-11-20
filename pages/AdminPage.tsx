import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Participant, EventConfig, EmailTemplate, EmailLog } from '../types';
import { dataService } from '../services/dataService';
import { supabase } from '../services/supabase';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import {
  Users,
  UserPlus,
  Copy,
  Check,
  Download,
  Upload,
  PieChart as PieIcon,
  ChevronUp,
  ChevronDown,
  ArrowUpDown,
  X,
  Leaf,
  WheatOff,
  MilkOff,
  Wine,
  Nut,
  CalendarClock,
  StickyNote,
  AlertCircle,
  Settings,
  Save,
  MapPin,
  ExternalLink,
  Clock,
  Mail,
  Send,
  History,
  LayoutDashboard,
  FileText,
  Sparkles,
  Eye,
  Code,
  Wallet,
  LogOut,
} from 'lucide-react';
import { Avatar } from '../components/Avatar';
import { LoginPage } from '../components/LoginPage';

type SortKey = 'name' | 'status' | 'food' | 'isSecretSanta';
type Tab = 'dashboard' | 'setup' | 'guests' | 'emails';
type RecipientFilter = 'all' | 'attending' | 'pending' | 'declined' | 'single';
type EmailViewMode = 'edit' | 'preview';

const SortHeader: React.FC<{
  label: string;
  sortKey: SortKey;
  currentSort: { key: SortKey; direction: 'asc' | 'desc' };
  onSort: (key: SortKey) => void;
}> = ({ label, sortKey, currentSort, onSort }) => (
  <th
    className="p-4 font-semibold cursor-pointer hover:bg-stone-50 transition-colors text-stone-600"
    onClick={() => onSort(sortKey)}
  >
    <div className="flex items-center gap-1.5">
      {label}
      <span className="text-stone-300">
        {currentSort.key === sortKey ? (
          currentSort.direction === 'asc' ? (
            <ChevronUp size={14} />
          ) : (
            <ChevronDown size={14} />
          )
        ) : (
          <ArrowUpDown size={14} />
        )}
      </span>
    </div>
  </th>
);

export const AdminPage: React.FC = () => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [config, setConfig] = useState<EventConfig | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  // Email State
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('t1_invite');
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [recipientFilter, setRecipientFilter] = useState<RecipientFilter>('pending');
  const [singleRecipientId, setSingleRecipientId] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendFeedback, setSendFeedback] = useState('');
  const [emailViewMode, setEmailViewMode] = useState<EmailViewMode>('edit');

  // Selection State for Detail View
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  const [sortConfigState, setSortConfigState] = useState<{
    key: SortKey;
    direction: 'asc' | 'desc';
  }>({ key: 'name', direction: 'asc' });

  // New User Form
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [configFeedback, setConfigFeedback] = useState<string | null>(null);

  // Config Inputs
  const [dietaryInput, setDietaryInput] = useState('');
  const [programInput, setProgramInput] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [participantsData, configData, templatesData, logsData] = await Promise.all([
        dataService.getAll(),
        dataService.getConfig(),
        dataService.getEmailTemplates(),
        dataService.getEmailLogs(),
      ]);
      setParticipants(participantsData);
      setConfig(configData);
      setDietaryInput(configData.dietaryOptions.join(', '));
      setProgramInput(configData.program || '');
      setTemplates(templatesData);
      setEmailLogs(logsData);
    } catch (error) {
      console.error('Error loading data:', error);
      console.error('Full error details:', JSON.stringify(error, null, 2));
      // Set empty data to prevent undefined errors
      setParticipants([]);
      setConfig(null);
      setTemplates([]);
      setEmailLogs([]);
    }
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setIsAuthenticated(true);
      }
    };
    checkAuth();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      // eslint-disable-next-line
      loadData();
    }
  }, [isAuthenticated, loadData]);

  useEffect(() => {
    const t = templates.find((t) => t.id === selectedTemplateId);
    // eslint-disable-next-line
    if (t) setEditingTemplate(t);
  }, [selectedTemplateId, templates]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedParticipant(null);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newName && newEmail) {
      await dataService.create(newName, newEmail);
      await loadData();
      setNewName('');
      setNewEmail('');
      setFeedback('Teilnehmer angelegt!');
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  const handleUpdateConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (config) {
      const updatedConfig = {
        ...config,
        dietaryOptions: dietaryInput
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        program: programInput,
      };
      await dataService.updateConfig(updatedConfig);
      await loadData();
      setConfigFeedback('Einstellungen gespeichert!');
      setTimeout(() => setConfigFeedback(null), 3000);
    }
  };

  const copyLink = (id: string) => {
    const url = `${window.location.origin}/#/p/${id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const exportCSV = async () => {
    const allParticipants = await dataService.getAll();
    const headers = [
      'Name',
      'Email',
      'Status',
      'Begleitung',
      'Begleitung Ernährung',
      'Essen',
      'Kategorie',
      'Beschreibung',
      'Wichteln',
      'Ernährung/Allergien',
      'Zahlung',
      'Beiträge',
      'Notizen',
      'Link',
    ];
    const rows = allParticipants.map((p) => [
      p.name,
      p.email,
      p.status,
      p.plusOne || '',
      p.plusOneAllergies || '',
      p.food?.name || '',
      p.food?.category || '',
      p.food?.description || '',
      p.isSecretSanta ? 'Ja' : 'Nein',
      p.allergies || '',
      p.wantsInvoice ? 'Rechnung' : 'Bar',
      p.contribution || '',
      p.notes || '',
      `${window.location.origin}/#/p/${p.id}`,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'weihnachtsfeier_teilnehmer.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const lines = text.split(/\r?\n/);
      const candidates: { name: string; email: string }[] = [];
      lines.forEach((line, index) => {
        if (!line.trim()) return;
        const separator = line.includes(';') ? ';' : ',';
        const parts = line.split(separator);
        if (parts.length < 2) return;
        let name = parts[0].trim();
        let email = parts[1].trim();
        if (
          index === 0 &&
          (name.toLowerCase().includes('name') || email.toLowerCase().includes('email'))
        )
          return;
        if (name.includes('@') && !email.includes('@')) [name, email] = [email, name];
        name = name.replace(/^["']|["']$/g, '');
        email = email.replace(/^["']|["']$/g, '');
        if (name && email && email.includes('@')) candidates.push({ name, email });
      });
      const addedCount = await dataService.importBatch(candidates);
      await loadData();
      setFeedback(`${addedCount} Teilnehmer importiert!`);
      setTimeout(() => setFeedback(null), 4000);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      console.error(err);
    }
  };

  const requestSort = (key: SortKey) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfigState.key === key && sortConfigState.direction === 'asc') direction = 'desc';
    setSortConfigState({ key, direction });
  };

  const sortedParticipants = useMemo(() => {
    const items = [...participants];
    if (sortConfigState) {
      items.sort((a, b) => {
        let aVal: string | number | boolean =
          sortConfigState.key === 'food'
            ? a.food?.name || ''
            : (a[sortConfigState.key] as string | number | boolean);
        let bVal: string | number | boolean =
          sortConfigState.key === 'food'
            ? b.food?.name || ''
            : (b[sortConfigState.key] as string | number | boolean);
        if (typeof aVal === 'string') aVal = aVal.toLowerCase();
        if (typeof bVal === 'string') bVal = bVal.toLowerCase();
        if (aVal < bVal) return sortConfigState.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfigState.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return items;
  }, [participants, sortConfigState]);

  // --- Email Functions ---

  const handleSaveTemplate = async () => {
    if (editingTemplate) {
      await dataService.updateEmailTemplate(editingTemplate.id, editingTemplate);
      await loadData();
      setSendFeedback('Vorlage gespeichert!');
      setTimeout(() => setSendFeedback(''), 2000);
    }
  };

  const insertVariable = (variable: string) => {
    if (editingTemplate) {
      setEditingTemplate({
        ...editingTemplate,
        body: editingTemplate.body + ' ' + variable,
      });
    }
  };

  const getTargetRecipients = () => {
    switch (recipientFilter) {
      case 'all':
        return participants;
      case 'attending':
        return participants.filter((p) => p.status === 'attending');
      case 'pending':
        return participants.filter((p) => p.status === 'pending');
      case 'declined':
        return participants.filter((p) => p.status === 'declined');
      case 'single':
        return participants.filter((p) => p.id === singleRecipientId);
      default:
        return [];
    }
  };

  const handleSendEmails = async () => {
    const targets = getTargetRecipients();
    if (targets.length === 0) {
      alert('Keine Empfänger ausgewählt.');
      return;
    }
    if (!confirm(`Wirklich an ${targets.length} Empfänger senden?`))
      return;

    setIsSending(true);
    await dataService.sendEmailBatch(selectedTemplateId, targets);
    setIsSending(false);
    setSendFeedback(`Erfolgreich an ${targets.length} gesendet.`);
    await loadData();
    setTimeout(() => setSendFeedback(''), 3000);
  };

  const renderPreview = () => {
    if (!editingTemplate || !config) return { subject: '', body: '' };

    // Use the first available participant or a dummy one
    const sampleP =
      participants[0] ||
      ({
        id: 'dummy',
        name: 'Max Mustermann',
        email: 'max@test.de',
        status: 'pending',
        food: { name: 'Kartoffelsalat' },
        plusOne: 'Erika',
      } as Participant);

    const link = `${window.location.origin}/#/p/${sampleP.id}`;
    const attendingCount = participants.filter((p) => p.status === 'attending').length;

    const replacements: Record<string, string> = {
      '{{name}}': sampleP.name.split(' ')[0],
      '{{fullname}}': sampleP.name,
      '{{email}}': sampleP.email,
      '{{link}}': link,
      '{{date}}': config.date,
      '{{time}}': config.time,
      '{{location}}': config.location,
      '{{cost}}': config.cost,
      '{{hosts}}': config.hosts,
      '{{secretSantaLimit}}': config.secretSantaLimit.toString(),
      '{{guestCount}}': attendingCount.toString(),
      '{{food}}': sampleP.food?.name || 'noch nichts eingetragen',
      '{{plusOne}}': sampleP.plusOne || 'keine',
    };

    let subject = editingTemplate.subject;
    let body = editingTemplate.body;

    Object.entries(replacements).forEach(([key, val]) => {
      body = body.split(key).join(val);
      subject = subject.split(key).join(val);
    });

    return { subject, body, sampleP };
  };

  // Stats Logic
  const stats = {
    attending: participants.filter((p) => p.status === 'attending').length,
    plusOnes: participants.filter((p) => p.status === 'attending' && p.plusOne).length,
    declined: participants.filter((p) => p.status === 'declined').length,
    pending: participants.filter((p) => p.status === 'pending').length,
    secretSanta: participants.filter((p) => p.isSecretSanta && p.status === 'attending').length,
  };

  const chartData = [
    { name: 'Zusage', value: stats.attending, color: '#778D45' },
    { name: 'Absage', value: stats.declined, color: '#C44536' },
    {
      name: 'Offen',
      value: stats.pending + participants.filter((p) => p.status === 'maybe').length,
      color: '#D4AF37',
    },
  ];

  const DIETARY_COLORS = [
    '#778D45',
    '#C44536',
    '#D4AF37',
    '#3b82f6',
    '#a855f7',
    '#f97316',
    '#06b6d4',
    '#64748b',
  ];

  const dietaryStats = useMemo(() => {
    if (!config) return [];
    const counts: Record<string, number> = {};
    participants
      .filter((p) => p.status === 'attending')
      .forEach((p) => {
        const processString = (str?: string) => {
          if (!str) return;
          str
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
            .forEach((s) => {
              counts[s] = (counts[s] || 0) + 1;
            });
        };
        processString(p.allergies);
        if (p.plusOne) processString(p.plusOneAllergies);
      });

    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [participants, config]);

  // Input Style
  const inputStyle =
    'w-full p-3.5 bg-white border border-stone-300 text-stone-900 rounded-xl text-sm focus:ring-2 focus:ring-stone-400 outline-none transition-colors';
  const labelStyle = 'block text-xs font-bold text-stone-500 uppercase mb-1.5 ml-1';
  const cardStyle = 'bg-white p-6 rounded-2xl shadow-lg shadow-stone-200/40 border border-white';

  const EMAIL_VARIABLES = [
    '{{name}}',
    '{{link}}',
    '{{date}}',
    '{{time}}',
    '{{location}}',
    '{{food}}',
    '{{cost}}',
    '{{plusOne}}',
  ];

  if (!isAuthenticated) {
    return <LoginPage onSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="space-y-10 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 pb-4 border-b border-stone-200">
        <div>
          <h2 className="text-4xl font-serif font-bold text-stone-800">Dashboard</h2>
          <p className="text-stone-500 mt-1">Verwalte deine Gäste und die Party-Details.</p>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-stone-500 hover:text-stone-800 px-4 py-2 rounded-lg hover:bg-stone-100 transition-colors"
        >
          <LogOut size={16} />
          Abmelden
        </button>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div></div>

        {/* Tab Switcher */}
        <div className="bg-stone-100 p-1 rounded-xl flex flex-wrap gap-1">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${activeTab === 'dashboard' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
          >
            <LayoutDashboard size={16} /> Dashboard
          </button>
          <button
            onClick={() => setActiveTab('setup')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${activeTab === 'setup' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
          >
            <Settings size={16} /> Event Setup
          </button>
          <button
            onClick={() => setActiveTab('guests')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${activeTab === 'guests' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
          >
            <Users size={16} /> Gästeliste
          </button>
          <button
            onClick={() => setActiveTab('emails')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${activeTab === 'emails' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
          >
            <Mail size={16} /> E-Mail Center
          </button>
        </div>
      </div>

      {/* --- TAB: DASHBOARD --- */}
      {activeTab === 'dashboard' && (
        <div className="space-y-8 animate-fade-in">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              {
                label: 'Gäste Gesamt',
                val: stats.attending + stats.plusOnes,
                sub: `/ ${config?.maxGuests}`,
                color: 'border-blue-500',
              },
              { label: 'Zusagen', val: stats.attending, sub: 'Gäste', color: 'border-green-500' },
              {
                label: 'Offen',
                val: stats.pending,
                sub: 'Einladungen',
                color: 'border-yellow-500',
              },
              {
                label: 'Wichteln',
                val: stats.secretSanta,
                sub: 'Teilnehmer',
                color: 'border-purple-500',
              },
            ].map((stat, i) => (
              <div
                key={i}
                className={`bg-white p-6 rounded-2xl shadow-sm border-l-4 ${stat.color}`}
              >
                <p className="text-stone-400 text-xs uppercase tracking-wider font-bold mb-1">
                  {stat.label}
                </p>
                <p className="text-3xl font-serif font-bold text-stone-800">
                  {stat.val}{' '}
                  <span className="text-sm text-stone-300 font-sans font-normal">{stat.sub}</span>
                </p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Status Chart */}
            <div className={cardStyle}>
              <h3 className="font-bold text-lg text-stone-800 mb-6 flex items-center gap-2">
                <PieIcon className="text-stone-400" /> Status Übersicht
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <XAxis
                      dataKey="name"
                      stroke="#d6d3d1"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis stroke="#d6d3d1" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip
                      cursor={{ fill: '#f5f5f4' }}
                      contentStyle={{
                        borderRadius: '12px',
                        border: 'none',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      }}
                    />
                    <Bar dataKey="value" radius={[6, 6, 6, 6]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Dietary Chart Full Width */}
          <div className={cardStyle}>
            <h3 className="font-bold text-lg text-stone-800 mb-6 flex items-center gap-2">
              <Leaf className="text-stone-400" /> Ernährungs-Statistik
            </h3>
            <div className="h-64 w-full">
              {dietaryStats.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dietaryStats} margin={{ left: 10, right: 10 }}>
                    <XAxis
                      dataKey="name"
                      stroke="#d6d3d1"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      allowDecimals={false}
                      stroke="#d6d3d1"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      cursor={{ fill: '#f5f5f4' }}
                      contentStyle={{
                        borderRadius: '12px',
                        border: 'none',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      }}
                    />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={40}>
                      {dietaryStats.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={DIETARY_COLORS[index % DIETARY_COLORS.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-stone-300">
                  <Leaf size={32} className="mb-2 opacity-20" />
                  <p className="text-sm">Keine Daten vorhanden</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- TAB: EVENT SETUP --- */}
      {activeTab === 'setup' && config && (
        <div className="animate-fade-in max-w-4xl mx-auto">
          <div className={cardStyle}>
            <h3 className="font-bold text-lg text-stone-800 mb-6 flex items-center gap-2">
              <Settings className="text-stone-400" /> Konfiguration
            </h3>
            {configFeedback && (
              <div className="mb-4 p-3 bg-green-50 text-green-700 text-sm rounded-lg flex items-center gap-2">
                <Check size={16} /> {configFeedback}
              </div>
            )}
            <form onSubmit={handleUpdateConfig} className="space-y-6">
              <div>
                <label className={labelStyle}>Titel der Veranstaltung</label>
                <input
                  type="text"
                  value={config.title}
                  onChange={(e) => setConfig({ ...config, title: e.target.value })}
                  className={inputStyle}
                />
              </div>
              <div>
                <label className={labelStyle}>Untertitel</label>
                <input
                  type="text"
                  value={config.subtitle}
                  onChange={(e) => setConfig({ ...config, subtitle: e.target.value })}
                  className={inputStyle}
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className={labelStyle}>Datum (Text)</label>
                  <input
                    type="text"
                    value={config.date}
                    onChange={(e) => setConfig({ ...config, date: e.target.value })}
                    className={inputStyle}
                  />
                </div>
                <div>
                  <label className={labelStyle}>Uhrzeit</label>
                  <div className="relative">
                    <Clock size={16} className="absolute left-3 top-3.5 text-stone-400" />
                    <input
                      type="text"
                      value={config.time || ''}
                      onChange={(e) => setConfig({ ...config, time: e.target.value })}
                      className={`${inputStyle} pl-9`}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className={labelStyle}>Max Gäste</label>
                  <input
                    type="number"
                    value={config.maxGuests}
                    onChange={(e) => setConfig({ ...config, maxGuests: parseInt(e.target.value) })}
                    className={inputStyle}
                  />
                </div>
                <div>
                  <label className={labelStyle}>Anmeldeschluss (RSVP Deadline)</label>
                  <input
                    type="date"
                    value={config.rsvpDeadline}
                    onChange={(e) => setConfig({ ...config, rsvpDeadline: e.target.value })}
                    className={inputStyle}
                  />
                </div>
              </div>

              <div>
                <label className={labelStyle}>Gäste-Optionen</label>
                <div className="bg-stone-50 p-4 rounded-xl border border-stone-200">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div
                      className={`w-10 h-6 rounded-full relative transition-colors shrink-0 ${config.allowPlusOne ? 'bg-stone-800' : 'bg-stone-300'}`}
                    >
                      <input
                        type="checkbox"
                        className="hidden"
                        checked={config.allowPlusOne}
                        onChange={(e) => setConfig({ ...config, allowPlusOne: e.target.checked })}
                      />
                      <div
                        className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${config.allowPlusOne ? 'left-5' : 'left-1'}`}
                      ></div>
                    </div>
                    <span className="text-sm font-bold text-stone-700">
                      Begleitung (+1) erlauben
                    </span>
                  </label>
                </div>
              </div>

              <div>
                <label className={labelStyle}>Wichtel-Limit (€)</label>
                <input
                  type="number"
                  value={config.secretSantaLimit}
                  onChange={(e) =>
                    setConfig({ ...config, secretSantaLimit: parseInt(e.target.value) })
                  }
                  className={inputStyle}
                />
              </div>

              <div>
                <label className={labelStyle}>Ort</label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-3 top-3.5 text-stone-400" />
                  <input
                    type="text"
                    value={config.location}
                    onChange={(e) => setConfig({ ...config, location: e.target.value })}
                    className={`${inputStyle} pl-9`}
                  />
                  {config.location && (
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(config.location)}`}
                      target="_blank"
                      className="absolute right-3 top-3.5 text-stone-400 hover:text-stone-800"
                      rel="noreferrer"
                    >
                      <ExternalLink size={14} />
                    </a>
                  )}
                </div>
              </div>

              <div>
                <label className={labelStyle}>Unkostenbeitrag</label>
                <input
                  type="text"
                  value={config.cost || ''}
                  onChange={(e) => setConfig({ ...config, cost: e.target.value })}
                  className={inputStyle}
                  placeholder="z.B. 25€ pro Person"
                />
              </div>

              <div>
                <label className={labelStyle}>Gastgeber</label>
                <input
                  type="text"
                  value={config.hosts || ''}
                  onChange={(e) => setConfig({ ...config, hosts: e.target.value })}
                  className={inputStyle}
                />
              </div>

              <div>
                <label className={labelStyle}>Kontakt-Email</label>
                <input
                  type="text"
                  value={config.contactEmail || ''}
                  onChange={(e) => setConfig({ ...config, contactEmail: e.target.value })}
                  className={inputStyle}
                />
              </div>

              <div>
                <label className={labelStyle}>Programm-Highlights (Kommagetrennt)</label>
                <textarea
                  rows={2}
                  value={programInput}
                  onChange={(e) => setProgramInput(e.target.value)}
                  className={inputStyle}
                />
              </div>

              <div>
                <label className={labelStyle}>Ernährungs-Optionen (Kommagetrennt)</label>
                <input
                  type="text"
                  value={dietaryInput}
                  onChange={(e) => setDietaryInput(e.target.value)}
                  className={inputStyle}
                />
              </div>

              <button
                type="submit"
                className="w-full bg-stone-800 text-white py-3.5 rounded-xl text-sm font-bold hover:bg-stone-900 flex items-center justify-center gap-2 transition-colors shadow-md mt-4"
              >
                <Save size={16} /> Speichern
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- TAB: GUEST LIST --- */}
      {activeTab === 'guests' && (
        <div className="space-y-8 animate-fade-in grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-12 flex justify-end gap-3">
            <input
              type="file"
              accept=".csv"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 bg-white border border-stone-200 hover:bg-stone-50 text-stone-600 px-5 py-2.5 rounded-xl font-medium transition-all shadow-sm hover:shadow"
            >
              <Upload size={18} /> CSV Import
            </button>
            <button
              onClick={exportCSV}
              className="flex items-center gap-2 bg-stone-800 hover:bg-stone-900 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-stone-200"
            >
              <Download size={18} /> Export
            </button>
          </div>

          {/* Table */}
          <div className="lg:col-span-12 bg-white rounded-2xl shadow-lg shadow-stone-200/40 overflow-hidden border border-white">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-stone-50/80 text-stone-500 border-b border-stone-100">
                  <tr>
                    <SortHeader
                      label="Name"
                      sortKey="name"
                      currentSort={sortConfigState}
                      onSort={requestSort}
                    />
                    <SortHeader
                      label="Status"
                      sortKey="status"
                      currentSort={sortConfigState}
                      onSort={requestSort}
                    />
                    <SortHeader
                      label="Essen"
                      sortKey="food"
                      currentSort={sortConfigState}
                      onSort={requestSort}
                    />
                    <SortHeader
                      label="🎁"
                      sortKey="isSecretSanta"
                      currentSort={sortConfigState}
                      onSort={requestSort}
                    />
                    <th className="p-4 font-semibold text-stone-600">Link</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-50">
                  {sortedParticipants.map((p) => (
                    <tr
                      key={p.id}
                      className="hover:bg-stone-50 transition-colors cursor-pointer"
                      onClick={() => setSelectedParticipant(p)}
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <Avatar
                            style={p.avatarStyle || 'micah'}
                            seed={p.avatarSeed || p.name}
                            image={p.avatarImage}
                            size={36}
                          />
                          <div>
                            <div className="font-bold text-stone-800 text-base">{p.name}</div>
                            <div className="text-stone-400 text-xs">{p.email}</div>
                            {p.plusOne && (
                              <div className="text-xmas-red text-xs mt-1 font-medium">
                                + {p.plusOne}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                            p.status === 'attending'
                              ? 'bg-green-100 text-green-800'
                              : p.status === 'declined'
                                ? 'bg-red-50 text-red-800'
                                : 'bg-yellow-50 text-yellow-800'
                          }`}
                        >
                          {p.status === 'attending'
                            ? 'Dabei'
                            : p.status === 'declined'
                              ? 'Absage'
                              : 'Offen'}
                        </span>
                      </td>
                      <td className="p-4">
                        {p.status === 'attending' && p.food ? (
                          <span className="inline-block bg-stone-100 text-stone-600 px-2 py-1 rounded text-xs font-medium">
                            {p.food.name}
                          </span>
                        ) : (
                          <span className="text-stone-200">-</span>
                        )}
                      </td>
                      <td className="p-4 text-stone-400">
                        {p.status === 'attending' && p.isSecretSanta && (
                          <Check size={16} className="text-xmas-gold" />
                        )}
                      </td>
                      <td className="p-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            copyLink(p.id);
                          }}
                          className="text-stone-400 hover:text-stone-800 p-2 hover:bg-stone-100 rounded-full transition-all"
                        >
                          {copiedId === p.id ? (
                            <Check size={16} className="text-green-600" />
                          ) : (
                            <Copy size={16} />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Add User Form */}
          <div className={`lg:col-span-12 ${cardStyle}`}>
            <h3 className="font-bold text-lg text-stone-800 mb-6 flex items-center gap-2">
              <UserPlus className="text-stone-400" /> Neuer Gast
            </h3>
            {feedback && (
              <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm flex items-center gap-2">
                <Check size={16} /> {feedback}
              </div>
            )}
            <form
              onSubmit={handleAddUser}
              className="grid grid-cols-1 md:grid-cols-7 gap-4 items-end"
            >
              <div className="md:col-span-3">
                <label className={labelStyle}>Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className={inputStyle}
                  required
                />
              </div>
              <div className="md:col-span-3">
                <label className={labelStyle}>Email</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className={inputStyle}
                  required
                />
              </div>
              <div className="md:col-span-1">
                <button
                  type="submit"
                  className="bg-stone-800 text-white px-4 py-2.5 rounded-xl font-bold hover:bg-stone-900 w-full shadow-lg shadow-stone-200 h-[46px]"
                >
                  +
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- CONTENT: EMAIL CENTER --- */}
      {activeTab === 'emails' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
          {/* LEFT COLUMN (Editor & Templates) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Template Selection */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {templates.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTemplateId(t.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all border ${
                    selectedTemplateId === t.id
                      ? 'bg-stone-800 text-white border-stone-800 shadow-md'
                      : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  {t.name}
                </button>
              ))}
            </div>

            {/* Main Editor / Preview Container */}
            {editingTemplate ? (
              <div className={`${cardStyle} min-h-[500px] flex flex-col`}>
                <div className="flex justify-between items-center mb-4 border-b border-stone-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
                      <FileText size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-stone-800">{editingTemplate.name}</h3>
                      <p className="text-xs text-stone-400">{editingTemplate.description}</p>
                    </div>
                  </div>

                  {/* View Toggle */}
                  <div className="flex bg-stone-100 p-1 rounded-lg">
                    <button
                      onClick={() => setEmailViewMode('edit')}
                      className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1 transition-all ${emailViewMode === 'edit' ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
                    >
                      <Code size={14} /> Editor
                    </button>
                    <button
                      onClick={() => setEmailViewMode('preview')}
                      className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1 transition-all ${emailViewMode === 'preview' ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
                    >
                      <Eye size={14} /> Vorschau
                    </button>
                  </div>
                </div>

                {emailViewMode === 'edit' ? (
                  // --- EDIT MODE ---
                  <>
                    <div className="space-y-4 flex-grow">
                      <div>
                        <label className={labelStyle}>Betreff</label>
                        <input
                          type="text"
                          value={editingTemplate.subject}
                          onChange={(e) =>
                            setEditingTemplate({ ...editingTemplate, subject: e.target.value })
                          }
                          className={inputStyle}
                        />
                      </div>

                      <div className="flex-grow flex flex-col">
                        <label className={labelStyle}>Nachricht</label>
                        <textarea
                          value={editingTemplate.body}
                          onChange={(e) =>
                            setEditingTemplate({ ...editingTemplate, body: e.target.value })
                          }
                          className={`${inputStyle} flex-grow min-h-[250px] font-mono text-sm leading-relaxed`}
                        ></textarea>
                      </div>

                      {/* Variable Helpers */}
                      <div>
                        <label className={labelStyle}>Variablen einfügen</label>
                        <div className="flex flex-wrap gap-2">
                          {EMAIL_VARIABLES.map((v) => (
                            <button
                              key={v}
                              onClick={() => insertVariable(v)}
                              className="px-2 py-1 bg-stone-100 hover:bg-stone-200 text-stone-600 text-xs rounded-md border border-stone-200 transition-colors font-mono"
                              title={`Fügt ${v} hinzu`}
                            >
                              {v}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end mt-6 pt-4 border-t border-stone-100">
                      <button
                        onClick={handleSaveTemplate}
                        className="bg-white border border-stone-200 text-stone-700 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-stone-50 flex items-center gap-2 transition-colors"
                      >
                        <Save size={16} /> Änderungen speichern
                      </button>
                    </div>
                  </>
                ) : (
                  // --- PREVIEW MODE ---
                  <div className="flex-grow bg-stone-50 rounded-xl border border-stone-200 p-6 shadow-inner font-sans">
                    {(() => {
                      const { subject, body, sampleP } = renderPreview();
                      return (
                        <div className="bg-white rounded-lg shadow-sm border border-stone-200 overflow-hidden">
                          <div className="bg-stone-50 border-b border-stone-100 p-4 text-sm space-y-2">
                            <div className="flex gap-2">
                              <span className="text-stone-400 w-12 text-right font-bold">An:</span>
                              <span className="text-stone-800">
                                {sampleP.name} &lt;{sampleP.email}&gt;
                              </span>
                            </div>
                            <div className="flex gap-2">
                              <span className="text-stone-400 w-12 text-right font-bold">
                                Betreff:
                              </span>
                              <span className="text-stone-800 font-medium">{subject}</span>
                            </div>
                          </div>
                          <div className="p-6 text-stone-800 text-sm leading-relaxed whitespace-pre-wrap">
                            {body}
                          </div>
                        </div>
                      );
                    })()}
                    <p className="text-center text-xs text-stone-400 mt-4">
                      Vorschau basierend auf Daten von Teilnehmer 1.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-stone-300 bg-white rounded-2xl border border-dashed border-stone-200">
                Wähle eine Vorlage
              </div>
            )}
          </div>

          {/* RIGHT COLUMN (Actions & Logs) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Console */}
            <div className="bg-stone-900 text-white p-6 rounded-2xl shadow-xl shadow-stone-400/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-10">
                <Send size={100} />
              </div>

              <h3 className="font-bold text-lg mb-6 flex items-center gap-2 relative z-10">
                <Sparkles className="text-xmas-gold" /> Versand Konsole
              </h3>

              <div className="space-y-5 relative z-10">
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase mb-2">
                    Empfänger
                  </label>
                  <select
                    value={recipientFilter}
                    onChange={(e) => setRecipientFilter(e.target.value as RecipientFilter)}
                    className="w-full p-3 bg-stone-800 border border-stone-700 rounded-xl text-sm text-white outline-none focus:border-stone-500 focus:ring-1 focus:ring-stone-500 transition-all"
                  >
                    <option value="pending">
                      Offene Einladungen (
                      {participants.filter((p) => p.status === 'pending').length})
                    </option>
                    <option value="attending">
                      Nur Zusagen ({participants.filter((p) => p.status === 'attending').length})
                    </option>
                    <option value="declined">
                      Absagen ({participants.filter((p) => p.status === 'declined').length})
                    </option>
                    <option value="all">Alle Gäste ({participants.length})</option>
                    <option value="single">Einzelner Empfänger</option>
                  </select>
                </div>

                {recipientFilter === 'single' && (
                  <div>
                    <label className="block text-xs font-bold text-stone-500 uppercase mb-2">
                      Gast auswählen
                    </label>
                    <select
                      value={singleRecipientId}
                      onChange={(e) => setSingleRecipientId(e.target.value)}
                      className="w-full p-3 bg-stone-800 border border-stone-700 rounded-xl text-sm text-white outline-none focus:border-stone-500 focus:ring-1 focus:ring-stone-500 transition-all"
                    >
                      <option value="">Bitte wählen...</option>
                      {participants.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="bg-stone-800/50 p-3 rounded-xl text-xs text-stone-400 border border-stone-700/50">
                  Ziel: {getTargetRecipients().length} Personen
                  <br />
                  Vorlage: {editingTemplate?.name || 'Keine'}
                </div>

                <button
                  onClick={handleSendEmails}
                  disabled={isSending || getTargetRecipients().length === 0}
                  className="w-full bg-xmas-red text-white py-3.5 rounded-xl font-bold shadow-lg shadow-red-900/20 hover:bg-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSending ? <Sparkles className="animate-spin" size={18} /> : <Send size={18} />}
                  {isSending ? 'Sende...' : 'Jetzt Senden'}
                </button>

                {sendFeedback && (
                  <p className="text-center text-sm text-green-400">{sendFeedback}</p>
                )}
              </div>
            </div>

            {/* History Log */}
            <div className="bg-white p-6 rounded-2xl shadow-lg shadow-stone-200/40 border border-white h-[400px] flex flex-col">
              <h3 className="font-bold text-lg text-stone-800 mb-4 flex items-center gap-2">
                <History className="text-stone-400" /> Protokoll
              </h3>
              <div className="flex-grow overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                {emailLogs.length === 0 ? (
                  <p className="text-stone-400 text-sm italic text-center mt-10">
                    Noch keine E-Mails gesendet.
                  </p>
                ) : (
                  emailLogs.map((log) => (
                    <div key={log.id} className="text-sm border-l-2 border-green-500 pl-3 py-1">
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-stone-700">{log.templateName}</span>
                        <span className="text-[10px] text-stone-400 bg-stone-50 px-1.5 py-0.5 rounded">
                          {new Date(log.date).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-stone-500 text-xs mt-1">
                        An {log.recipientCount} Empfänger: {log.recipientsPreview}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedParticipant && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
          onClick={() => setSelectedParticipant(null)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-stone-50 p-6 border-b border-stone-100 flex justify-between items-start">
              <div className="flex items-center gap-4">
                <Avatar
                  style={selectedParticipant.avatarStyle || 'micah'}
                  seed={selectedParticipant.avatarSeed || selectedParticipant.name}
                  image={selectedParticipant.avatarImage}
                  size={64}
                />
                <div>
                  <h3 className="text-2xl font-serif font-bold text-stone-800">
                    {selectedParticipant.name}
                  </h3>
                  <p className="text-stone-500">{selectedParticipant.email}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedParticipant(null)}
                className="text-stone-400 hover:text-stone-800 p-2 hover:bg-stone-200 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-bold text-stone-400 text-xs uppercase mb-4 flex items-center gap-2">
                  <CalendarClock size={14} /> Status
                </h4>
                <div
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold ${
                    selectedParticipant.status === 'attending'
                      ? 'bg-green-100 text-green-800'
                      : selectedParticipant.status === 'declined'
                        ? 'bg-red-50 text-red-800'
                        : 'bg-yellow-50 text-yellow-800'
                  }`}
                >
                  {selectedParticipant.status === 'attending' ? <Check size={18} /> : null}
                  {selectedParticipant.status === 'attending'
                    ? 'Zusage'
                    : selectedParticipant.status === 'declined'
                      ? 'Absage'
                      : 'Offen / Unentschieden'}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-stone-400 text-xs uppercase mb-4 flex items-center gap-2">
                  <UserPlus size={14} /> Begleitung
                </h4>
                {selectedParticipant.plusOne ? (
                  <p className="font-medium text-stone-800 text-lg">
                    {selectedParticipant.plusOne}
                  </p>
                ) : (
                  <p className="text-stone-300 italic">Keine Begleitung</p>
                )}
              </div>

              <div className="md:col-span-2 bg-stone-50 p-5 rounded-2xl border border-stone-100">
                <h4 className="font-bold text-stone-400 text-xs uppercase mb-4 flex items-center gap-2">
                  <Leaf size={14} /> Essen & Beitrag
                </h4>
                {selectedParticipant.food ? (
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-stone-800 text-lg">
                        {selectedParticipant.food.name}
                      </span>
                      <span className="text-xs bg-white border border-stone-200 px-2 py-1 rounded text-stone-500">
                        {selectedParticipant.food.category}
                      </span>
                    </div>
                    {selectedParticipant.food.description && (
                      <p className="text-stone-600 italic">
                        &quot;{selectedParticipant.food.description}&quot;
                      </p>
                    )}
                    <div className="flex gap-2 mt-2">
                      {selectedParticipant.food.isVegan && (
                        <span title="Vegan" className="bg-green-100 text-green-700 p-1.5 rounded">
                          <Leaf size={14} />
                        </span>
                      )}
                      {selectedParticipant.food.isGlutenFree && (
                        <span
                          title="Glutenfrei"
                          className="bg-amber-100 text-amber-700 p-1.5 rounded"
                        >
                          <WheatOff size={14} />
                        </span>
                      )}
                      {selectedParticipant.food.isLactoseFree && (
                        <span
                          title="Laktosefrei"
                          className="bg-blue-100 text-blue-700 p-1.5 rounded"
                        >
                          <MilkOff size={14} />
                        </span>
                      )}
                      {selectedParticipant.food.containsAlcohol && (
                        <span
                          title="Alkohol"
                          className="bg-purple-100 text-purple-700 p-1.5 rounded"
                        >
                          <Wine size={14} />
                        </span>
                      )}
                      {selectedParticipant.food.containsNuts && (
                        <span title="Nüsse" className="bg-stone-200 text-stone-600 p-1.5 rounded">
                          <Nut size={14} />
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-stone-300 italic">Noch nichts eingetragen.</p>
                )}
              </div>

              <div>
                <h4 className="font-bold text-stone-400 text-xs uppercase mb-4 flex items-center gap-2">
                  <AlertCircle size={14} /> Ernährung & Allergien
                </h4>
                <div className="space-y-3">
                  {selectedParticipant.allergies ? (
                    <div>
                      <p className="text-xs text-stone-400 mb-1">Gast:</p>
                      <p className="text-stone-800 font-medium">{selectedParticipant.allergies}</p>
                    </div>
                  ) : (
                    <p className="text-stone-300 italic text-sm">Gast: Keine Angabe</p>
                  )}

                  {selectedParticipant.plusOneAllergies ? (
                    <div>
                      <p className="text-xs text-stone-400 mb-1">Begleitung:</p>
                      <p className="text-stone-800 font-medium">
                        {selectedParticipant.plusOneAllergies}
                      </p>
                    </div>
                  ) : selectedParticipant.plusOne ? (
                    <p className="text-stone-300 italic text-sm">Begleitung: Keine Angabe</p>
                  ) : null}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-stone-400 text-xs uppercase mb-4 flex items-center gap-2">
                  <StickyNote size={14} /> Notizen / Wünsche
                </h4>
                <div className="space-y-2">
                  {selectedParticipant.contribution ? (
                    <div>
                      <p className="text-xs text-stone-400 mb-1">Aktiver Beitrag:</p>
                      <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded text-sm font-bold border border-purple-100">
                        {selectedParticipant.contribution}
                      </span>
                    </div>
                  ) : (
                    <p className="text-stone-300 italic text-sm">Kein aktiver Beitrag</p>
                  )}

                  {selectedParticipant.notes && (
                    <p className="text-stone-700 bg-yellow-50 p-3 rounded-xl text-sm border border-yellow-100 leading-relaxed mt-2">
                      {selectedParticipant.notes}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-stone-400 text-xs uppercase mb-4 flex items-center gap-2">
                  <Wallet size={14} /> Zahlung
                </h4>
                <p className="text-stone-800 font-medium flex items-center gap-2">
                  {selectedParticipant.wantsInvoice ? 'Rechnung (Überweisung)' : 'Bar (Quittung)'}
                </p>
              </div>
            </div>

            <div className="bg-stone-50 p-4 text-center text-xs text-stone-400 border-t border-stone-100">
              Zuletzt aktualisiert: {new Date(selectedParticipant.lastUpdated).toLocaleString()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
