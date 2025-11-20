import React, { useState, useEffect, useCallback } from 'react';
import {
  Participant,
  FoodCategory,
  FoodItem,
  AvatarStyle,
  AVATAR_STYLES,
  BUFFET_INSPIRATIONS,
  DEFAULT_EVENT_CONFIG,
} from '../types';
import { dataService } from '../services/dataService';
import { FoodDisplay } from '../components/FoodDisplay';
import { Avatar } from '../components/Avatar';
import { LocationSlider } from '../components/LocationSlider';
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  Gift,
  AlertCircle,
  Utensils,
  HeartHandshake,
  Sparkles,
  Eye,
  RefreshCw,
  Wand2,
  Loader2,
  User,
  Calendar,
  Download,
  Euro,
  PartyPopper,
  Mail,
  ArrowRight,
  Info,
  ClipboardList,
  Users,
  Lightbulb,
  Flame,
  Music,
  Wine,
  Snowflake,
  Mic2,
  Wallet,
  Save,
  Lock,
  ChevronRight,
  MapPin,
} from 'lucide-react';
import { supabase as supabaseClient } from '../services/supabase';

interface GuestPageProps {
  id: string;
}

type GuestTab = 'info' | 'list' | 'action';

// Helper for rich program display
const PROGRAM_ENRICHMENT: Record<string, { desc: string; icon: React.ElementType; color: string }> =
  {
    'Glühwein-Empfang': {
      desc: 'Wir starten gemütlich am Feuer mit heißen Getränken.',
      icon: Wine,
      color: 'text-red-500 bg-red-50',
    },
    'Gemeinsames Buffet': {
      desc: 'Jeder steuert etwas bei – von Herzhaft bis Süß.',
      icon: Utensils,
      color: 'text-amber-500 bg-amber-50',
    },
    Fackelwanderung: {
      desc: 'Ein stimmungsvoller Spaziergang durch die Winternacht.',
      icon: Flame,
      color: 'text-orange-500 bg-orange-50',
    },
    'Ugly Christmas Sweater Wettbewerb': {
      desc: 'Zieh dein schrägstes Teil an und gewinne Ruhm & Ehre!',
      icon: Snowflake,
      color: 'text-blue-500 bg-blue-50',
    },
    'Musik & Feuerschale': {
      desc: 'Ausklang mit guten Gesprächen und Knistern.',
      icon: Music,
      color: 'text-purple-500 bg-purple-50',
    },
  };

export const GuestPage: React.FC<GuestPageProps> = ({ id }) => {
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [allParticipants, setAllParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [eventConfig, setEventConfig] = useState(DEFAULT_EVENT_CONFIG);
  const [activeTab, setActiveTab] = useState<GuestTab>('info');

  // Onboarding State
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(1); // 1: Avatar/PlusOne, 2: Buffet, 3: Details

  // Form States
  const [status, setStatus] = useState<Participant['status']>('pending');

  // Avatar States
  const [avatarStyle, setAvatarStyle] = useState<AvatarStyle>('micah');
  const [avatarSeed, setAvatarSeed] = useState('');
  const [avatarImage, setAvatarImage] = useState<string>(''); // Base64
  const [avatarTab, setAvatarTab] = useState<'manual' | 'ai'>('manual');

  // Avatar Generation
  const [avatarPrompt, setAvatarPrompt] = useState('');
  const [isGeneratingAvatar, setIsGeneratingAvatar] = useState(false);

  // Plus One States
  const [hasPlusOne, setHasPlusOne] = useState(false);
  const [plusOne, setPlusOne] = useState('');

  // Food States
  const [foodName, setFoodName] = useState('');
  const [foodCategory, setFoodCategory] = useState<FoodCategory>(FoodCategory.APPETIZER);
  const [foodDesc, setFoodDesc] = useState('');
  const [showNameInBuffet, setShowNameInBuffet] = useState(true);
  const [tags, setTags] = useState({
    isVegan: false,
    isGlutenFree: false,
    isLactoseFree: false,
    containsAlcohol: false,
    containsNuts: false,
  });

  // Allergy States
  const [userAllergySelection, setUserAllergySelection] = useState<string[]>([]);
  const [userAllergyCustom, setUserAllergyCustom] = useState('');

  const [plusOneAllergySelection, setPlusOneAllergySelection] = useState<string[]>([]);
  const [plusOneAllergyCustom, setPlusOneAllergyCustom] = useState('');

  const [isSecretSanta, setIsSecretSanta] = useState(false);

  // Payment & Contributions
  const [wantsInvoice, setWantsInvoice] = useState(false);
  const [contribution, setContribution] = useState('');

  const [notes, setNotes] = useState('');

  const buildAllergyString = useCallback((selection: string[], custom: string) => {
    const customParts = custom
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const cleanCustom = customParts.filter((p) => !selection.includes(p));
    return [...selection, ...cleanCustom].join(', ');
  }, []);

  useEffect(() => {
    const loadData = async () => {
      const p = await dataService.getById(id);
      const all = await dataService.getAll();
      const config = await dataService.getConfig();
      setAllParticipants(all);
      setEventConfig(config);

      if (p) {
        setParticipant(p);
        setStatus(p.status);

        // Initial Tab Logic
        if (p.status === 'pending') {
          setActiveTab('info');
        } else {
          setActiveTab('info');
        }

        setAvatarStyle(p.avatarStyle || 'micah');
        setAvatarSeed(p.avatarSeed || p.name);
        setAvatarImage(p.avatarImage || '');
        if (p.avatarImage) {
          setAvatarTab('ai');
        }

        setPlusOne(p.plusOne || '');
        setHasPlusOne(!!p.plusOne);

        // Use the helper directly or assume it's stable enough here,
        // but since we are inside useEffect, we can just use the logic or call the memoized callback if available.
        // Note: We can't call the callback if it depends on state not yet available, but here it depends on eventConfig which is set inside the timeout?
        // Actually eventConfig is state.
        // So we need to be careful.
        // Let's just duplicate the logic here slightly or rely on the fact that eventConfig has initial value.

        // Initial parse logic using the fetched config directly to avoid dependency issues
        const currentConfig = config;

        const parseLocal = (str: string) => {
          if (!str) return { selection: [], custom: '' };
          const parts = str
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean);
          const selection = parts.filter((p) => currentConfig.dietaryOptions.includes(p));
          const custom = parts.filter((p) => !currentConfig.dietaryOptions.includes(p)).join(', ');
          return { selection, custom };
        };

        const userAllergiesParsed = parseLocal(p.allergies || '');
        setUserAllergySelection(userAllergiesParsed.selection);
        setUserAllergyCustom(userAllergiesParsed.custom);

        const plusOneAllergiesParsed = parseLocal(p.plusOneAllergies || '');
        setPlusOneAllergySelection(plusOneAllergiesParsed.selection);
        setPlusOneAllergyCustom(plusOneAllergiesParsed.custom);

        setIsSecretSanta(p.isSecretSanta);
        setWantsInvoice(p.wantsInvoice || false);
        setContribution(p.contribution || '');
        setNotes(p.notes || '');

        if (p.food) {
          setFoodName(p.food.name);
          setFoodCategory(p.food.category);
          setFoodDesc(p.food.description || '');
          setShowNameInBuffet(p.showNameInBuffet !== false);
          setTags({
            isVegan: p.food.isVegan,
            isGlutenFree: p.food.isGlutenFree,
            isLactoseFree: p.food.isLactoseFree,
            containsAlcohol: p.food.containsAlcohol,
            containsNuts: p.food.containsNuts,
          });
        }
      }
      setLoading(false);
    };
    loadData();
  }, [id]); // Removed parseAllergyString dependency as we moved logic inside to avoid circular dep with eventConfig update

  // Validation Logic
  const isBuffetValid = useCallback(() => {
    return foodName && foodName.trim().length > 0;
  }, [foodName]);

  const isFormValid = useCallback(() => {
    if (status === 'attending') {
      return isBuffetValid();
    }
    return true;
  }, [status, isBuffetValid]);

  const performSave = useCallback(
    async (targetStatus: Participant['status']) => {
      if (!participant) return;

      // If attending, validate food
      if (targetStatus === 'attending' && !isBuffetValid()) return;

      const currentAllergies = buildAllergyString(userAllergySelection, userAllergyCustom);
      const currentPlusOneAllergies = buildAllergyString(
        plusOneAllergySelection,
        plusOneAllergyCustom
      );

      const foodItem: FoodItem | undefined =
        targetStatus === 'attending'
          ? {
              name: foodName,
              category: foodCategory,
              description: foodDesc,
              ...tags,
            }
          : undefined;

      const updated = await dataService.update(participant.id, {
        status: targetStatus,
        avatarStyle,
        avatarSeed,
        avatarImage,
        plusOne: targetStatus === 'attending' && hasPlusOne ? plusOne : '',
        plusOneAllergies: targetStatus === 'attending' && hasPlusOne ? currentPlusOneAllergies : '',
        food: foodItem,
        showNameInBuffet: targetStatus === 'attending' ? showNameInBuffet : true,
        allergies: currentAllergies,
        isSecretSanta: targetStatus === 'attending' ? isSecretSanta : false,
        wantsInvoice: targetStatus === 'attending' ? wantsInvoice : false,
        contribution: targetStatus === 'attending' ? contribution : '',
        notes,
      });

      if (updated) {
        setParticipant(updated);
        const all = await dataService.getAll();
        setAllParticipants(all);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    },
    [
      participant,
      isBuffetValid,
      buildAllergyString,
      userAllergySelection,
      userAllergyCustom,
      plusOneAllergySelection,
      plusOneAllergyCustom,
      foodName,
      foodCategory,
      foodDesc,
      tags,
      avatarStyle,
      avatarSeed,
      avatarImage,
      hasPlusOne,
      plusOne,
      showNameInBuffet,
      isSecretSanta,
      wantsInvoice,
      contribution,
      notes,
    ]
  );

  // Auto-save (Disabled during Onboarding)
  useEffect(() => {
    if (!participant || loading || isOnboarding) return;

    const currentAllergies = buildAllergyString(userAllergySelection, userAllergyCustom);
    const currentPlusOneAllergies = buildAllergyString(
      plusOneAllergySelection,
      plusOneAllergyCustom
    );

    const timer = setTimeout(async () => {
      const hasChanges =
        status !== participant.status ||
        avatarStyle !== participant.avatarStyle ||
        avatarSeed !== participant.avatarSeed ||
        avatarImage !== (participant.avatarImage || '') ||
        (status === 'attending' && hasPlusOne !== !!participant.plusOne) ||
        (status === 'attending' && hasPlusOne && plusOne !== (participant.plusOne || '')) ||
        (status === 'attending' &&
          hasPlusOne &&
          currentPlusOneAllergies !== (participant.plusOneAllergies || '')) ||
        isSecretSanta !== participant.isSecretSanta ||
        wantsInvoice !== (participant.wantsInvoice || false) ||
        contribution !== (participant.contribution || '') ||
        currentAllergies !== (participant.allergies || '') ||
        foodName !== (participant.food?.name || '') ||
        foodCategory !== (participant.food?.category || FoodCategory.APPETIZER) ||
        foodDesc !== (participant.food?.description || '') ||
        showNameInBuffet !== (participant.showNameInBuffet !== false) ||
        tags.isVegan !== (participant.food?.isVegan || false) ||
        tags.isGlutenFree !== (participant.food?.isGlutenFree || false);

      if (hasChanges) {
        if (isFormValid()) {
          await performSave(status); // Auto-save keeps current status
        }
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [
    status,
    participant,
    loading,
    isOnboarding,
    avatarStyle,
    avatarSeed,
    avatarImage,
    hasPlusOne,
    plusOne,
    plusOneAllergySelection,
    plusOneAllergyCustom,
    foodName,
    foodCategory,
    foodDesc,
    showNameInBuffet,
    tags,
    userAllergySelection,
    userAllergyCustom,
    isSecretSanta,
    wantsInvoice,
    contribution,
    notes,
    isFormValid,
    performSave,
    buildAllergyString,
  ]);

  const handleStartOnboarding = () => {
    setIsOnboarding(true);
    setOnboardingStep(1);
    // Reset scroll
    window.scrollTo(0, 0);
  };

  const handleNextStep = () => {
    if (onboardingStep === 2 && !isBuffetValid()) {
      alert('Bitte trage ein Gericht ein.');
      return;
    }
    setOnboardingStep((prev) => prev + 1);
    window.scrollTo(0, 0);
  };

  const handleFinishOnboarding = async () => {
    await performSave('attending');
    setStatus('attending');
    setIsOnboarding(false);
    setActiveTab('list'); // Go to list tab after onboarding
    window.scrollTo(0, 0);
  };

  const handleQuickDecline = async () => {
    setStatus('declined');
    await performSave('declined');
    // Tabs will appear because status is no longer pending
  };

  const handleQuickMaybe = async () => {
    setStatus('maybe');
    await performSave('maybe');
  };

  const handleChangeStatus = () => {
    setStatus('pending');
    // No longer need to switch tabs, as buttons are now on 'action' tab
    window.scrollTo(0, 0);
  };

  const toggleUserAllergy = (item: string) => {
    setUserAllergySelection((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const togglePlusOneAllergy = (item: string) => {
    setPlusOneAllergySelection((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const generateAiAvatar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!avatarPrompt.trim()) return;

    setIsGeneratingAvatar(true);
    try {
      const { data, error } = await supabaseClient.functions.invoke('gemini-ai', {
        body: {
          action: 'generate-avatar',
          payload: {
            prompt: avatarPrompt,
          },
        },
      });

      if (error) throw error;

      if (data.success && data.image) {
        setAvatarImage(data.image);
        setAvatarPrompt('');
      } else {
        throw new Error('No image returned');
      }
    } catch (error) {
      console.error('Avatar generation failed', error);
      alert('Ups, das hat leider nicht geklappt. Versuch es später nochmal.');
    } finally {
      setIsGeneratingAvatar(false);
    }
  };

  const downloadIcs = () => {
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
SUMMARY:${eventConfig.title}
DESCRIPTION:${eventConfig.subtitle}
DTSTART:${eventConfig.date.replace(/[^0-9]/g, '')}T${eventConfig.time.replace(/[^0-9]/g, '')}00
LOCATION:${eventConfig.location}
END:VEVENT
END:VCALENDAR`;
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', 'weihnachtsfeier.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getAvailableInspirations = () => {
    const rawSuggestions = BUFFET_INSPIRATIONS[foodCategory] || [];
    const existingDishes = allParticipants
      .filter((p) => p.status === 'attending' && p.food?.name)
      .map((p) => p.food!.name.trim().toLowerCase());
    return rawSuggestions.filter(
      (suggestion) => !existingDishes.includes(suggestion.trim().toLowerCase())
    );
  };

  // Reusable Styles
  const inputStyle =
    'w-full p-3.5 bg-white border border-stone-200 text-stone-900 placeholder-stone-400 rounded-xl focus:ring-2 focus:ring-xmas-gold/50 focus:border-xmas-gold outline-none transition-all shadow-sm hover:border-stone-300';
  const labelStyle = 'text-sm text-stone-900 font-semibold tracking-tight ml-1';
  const sectionCardStyle =
    'bg-white p-6 md:p-8 rounded-3xl shadow-xl shadow-stone-900/10 border border-white transition-all hover:shadow-2xl hover:shadow-stone-900/20';

  // --- RENDER SECTIONS ---

  const renderAvatarSection = () => (
    <div className={sectionCardStyle}>
      <div className="flex justify-between items-start mb-6">
        <h3 className="font-serif text-2xl text-xmas-dark flex items-center gap-3">
          <div className="bg-xmas-pink/20 p-2 rounded-xl text-xmas-pink">
            <User size={24} />
          </div>
          Dein Profilbild
        </h3>
      </div>
      <div className="flex flex-col sm:flex-row gap-8 items-center">
        <div className="shrink-0">
          <Avatar
            style={avatarStyle}
            seed={avatarSeed}
            image={avatarImage}
            size={100}
            className="shadow-lg ring-4 ring-stone-50"
          />
        </div>
        <div className="flex-grow w-full">
          <div className="flex bg-stone-100 p-1 rounded-xl mb-4">
            <button
              onClick={() => setAvatarTab('manual')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${avatarTab === 'manual' ? 'bg-white shadow-sm text-stone-800' : 'text-stone-500 hover:text-stone-700'}`}
            >
              🎨 Designen
            </button>
            <button
              onClick={() => setAvatarTab('ai')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${avatarTab === 'ai' ? 'bg-white shadow-sm text-stone-800' : 'text-stone-500 hover:text-stone-700'}`}
            >
              ✨ AI Magic
            </button>
          </div>
          {avatarTab === 'manual' ? (
            <div className="flex gap-2">
              <select
                value={avatarStyle}
                onChange={(e) => {
                  setAvatarStyle(e.target.value as AvatarStyle);
                  setAvatarImage('');
                }}
                className="p-2.5 bg-white border border-stone-200 rounded-xl text-sm font-medium outline-none w-full"
              >
                {Object.entries(AVATAR_STYLES).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => {
                  setAvatarSeed(Math.random().toString(36));
                  setAvatarImage('');
                }}
                className="p-2.5 bg-stone-100 text-stone-600 rounded-xl hover:bg-stone-200 transition-colors"
              >
                <RefreshCw size={20} />
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <form onSubmit={generateAiAvatar} className="flex gap-2">
                <input
                  type="text"
                  value={avatarPrompt}
                  onChange={(e) => setAvatarPrompt(e.target.value)}
                  placeholder="z.B. Schneemann..."
                  className="flex-grow p-2.5 bg-white border border-stone-200 rounded-xl text-sm outline-none focus:border-xmas-gold"
                />
                <button
                  type="submit"
                  disabled={isGeneratingAvatar || !avatarPrompt}
                  className="bg-xmas-gold text-white p-2.5 rounded-xl hover:bg-yellow-600 disabled:opacity-50"
                >
                  {isGeneratingAvatar ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <Wand2 size={20} />
                  )}
                </button>
              </form>
              <p className="text-[10px] text-stone-400 pl-1">Generiert ein Bild im 3D-Knet-Look.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderPlusOneSection = () => {
    if (!eventConfig.allowPlusOne) return null;

    return (
      <div className={sectionCardStyle}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-serif text-2xl text-xmas-dark flex items-center gap-3">
            <div className="bg-xmas-red/10 p-2 rounded-xl text-xmas-red">
              <HeartHandshake size={24} />
            </div>
            Begleitung
          </h3>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={hasPlusOne}
              onChange={(e) => setHasPlusOne(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-12 h-7 bg-stone-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-xmas-green"></div>
          </label>
        </div>
        {hasPlusOne && (
          <div className="animate-fade-in pt-2">
            <label className={`${labelStyle} block mb-2`}>Name der Begleitung</label>
            <input
              type="text"
              value={plusOne}
              onChange={(e) => setPlusOne(e.target.value)}
              placeholder="Vorname Nachname"
              className={inputStyle}
            />
          </div>
        )}
      </div>
    );
  };

  const renderBuffetSection = () => (
    <div
      className={`${sectionCardStyle} ${!foodName || foodName.trim().length === 0 ? 'ring-2 ring-red-200' : ''}`}
    >
      <h3 className="font-serif text-2xl text-xmas-dark mb-6 flex items-center gap-3">
        <div className="bg-xmas-gold/20 p-2 rounded-xl text-xmas-gold">
          <Utensils size={24} />
        </div>
        Dein Beitrag zum Buffet *
      </h3>
      <p className="text-sm text-stone-500 mb-6 bg-stone-50 p-4 rounded-xl border border-stone-100">
        Jeder bringt eine Kleinigkeit für ca. 6-8 Personen mit. So entsteht ein buntes Buffet!
      </p>
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className={`${labelStyle} block mb-2`}>Kategorie</label>
            <select
              value={foodCategory}
              onChange={(e) => setFoodCategory(e.target.value as FoodCategory)}
              className={inputStyle}
            >
              {Object.values(FoodCategory).map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={`${labelStyle} block mb-2`}>Notiz</label>
            <input
              type="text"
              value={foodDesc}
              onChange={(e) => setFoodDesc(e.target.value)}
              placeholder="z.B. Kühlkette nötig"
              className={inputStyle}
            />
          </div>
        </div>
        {getAvailableInspirations().length > 0 && (
          <div className="animate-fade-in">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb size={14} className="text-xmas-gold" />
              <span className="text-xs font-bold text-stone-400 uppercase tracking-wide">
                Inspiration für {foodCategory}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {getAvailableInspirations().map((item) => (
                <button
                  key={item}
                  onClick={() => setFoodName(item)}
                  className="text-xs bg-stone-50 hover:bg-white hover:shadow-sm border border-stone-200 text-stone-600 px-3 py-1.5 rounded-lg transition-all active:scale-95"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        )}
        <div>
          <label className={`${labelStyle} block mb-2`}>
            Gericht <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={foodName}
            onChange={(e) => setFoodName(e.target.value)}
            placeholder="z.B. Nudelsalat, Tiramisu..."
            className={`${inputStyle} ${!foodName && 'border-red-300 bg-red-50/20'}`}
            required
          />
          {!foodName && (
            <p className="text-xs text-red-500 mt-1 font-medium flex items-center gap-1">
              <AlertCircle size={12} /> Pflichtfeld: Bitte Gericht eintragen.
            </p>
          )}
        </div>
        <div>
          <span className={`${labelStyle} block mb-3`}>Eigenschaften</span>
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'isVegan', label: 'Vegan', icon: '🌱' },
              { key: 'isGlutenFree', label: 'Glutenfrei', icon: '🌾' },
              { key: 'isLactoseFree', label: 'Laktosefrei', icon: '🥛' },
              { key: 'containsAlcohol', label: 'Alkohol', icon: '🍷' },
              { key: 'containsNuts', label: 'Nüsse', icon: '🥜' },
            ].map((tag) => (
              <label
                key={tag.key}
                className={`cursor-pointer px-3 py-2 rounded-lg border transition-all flex items-center gap-2 text-xs font-bold select-none ${tags[tag.key as keyof typeof tags] ? 'bg-stone-800 text-white border-stone-800' : 'bg-white border-stone-200 text-stone-500 hover:bg-stone-50'}`}
              >
                <input
                  type="checkbox"
                  className="hidden"
                  checked={tags[tag.key as keyof typeof tags]}
                  onChange={(e) => setTags((prev) => ({ ...prev, [tag.key]: e.target.checked }))}
                />
                <span>{tag.icon}</span> {tag.label}
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderDetailsSection = () => (
    <div className={sectionCardStyle}>
      <h3 className="font-serif text-2xl text-xmas-dark mb-6 flex items-center gap-3">
        <div className="bg-emerald-50 p-2 rounded-xl text-emerald-600">
          <Sparkles size={24} />
        </div>
        Details & Wünsche
      </h3>
      <div className="space-y-8">
        <div>
          <label className={`${labelStyle} mb-2 flex items-center gap-2`}>
            <AlertCircle size={16} className="text-xmas-red" /> Ernährungsweise &
            Unverträglichkeiten
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            {eventConfig.dietaryOptions.map((item) => (
              <button
                key={item}
                onClick={() => toggleUserAllergy(item)}
                className={`px-3 py-1.5 text-xs rounded-lg border transition-colors font-bold ${userAllergySelection.includes(item) ? 'bg-stone-800 text-white border-stone-800' : 'bg-white text-stone-500 border-stone-200 hover:bg-stone-50'}`}
              >
                {item}
              </button>
            ))}
          </div>
          <input
            type="text"
            value={userAllergyCustom}
            onChange={(e) => setUserAllergyCustom(e.target.value)}
            placeholder="Sonstiges..."
            className={inputStyle}
          />
        </div>
        {hasPlusOne && eventConfig.allowPlusOne && (
          <div className="bg-stone-50 p-4 rounded-xl border border-stone-100">
            <label className={`${labelStyle} mb-2 flex items-center gap-2 text-stone-600`}>
              Für Begleitung ({plusOne || 'Gast'})
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {eventConfig.dietaryOptions.map((item) => (
                <button
                  key={item}
                  onClick={() => togglePlusOneAllergy(item)}
                  className={`px-3 py-1.5 text-xs rounded-lg border transition-colors font-bold ${plusOneAllergySelection.includes(item) ? 'bg-stone-800 text-white border-stone-800' : 'bg-white text-stone-500 border-stone-200 hover:bg-stone-50'}`}
                >
                  {item}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={plusOneAllergyCustom}
              onChange={(e) => setPlusOneAllergyCustom(e.target.value)}
              placeholder="Sonstiges..."
              className={inputStyle}
            />
          </div>
        )}
        <div
          className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${isSecretSanta ? 'bg-amber-50 border-xmas-gold shadow-sm' : 'bg-stone-50 border-stone-100'}`}
        >
          <div
            className={`p-2 rounded-full ${isSecretSanta ? 'bg-xmas-gold text-white' : 'bg-white text-stone-300'}`}
          >
            <Gift size={20} />
          </div>
          <div className="flex-grow">
            <p className="font-bold text-stone-800 text-sm">
              Wichteln (max {eventConfig.secretSantaLimit}€)
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isSecretSanta}
              onChange={(e) => setIsSecretSanta(e.target.checked)}
              className="sr-only peer"
            />
            <div
              className={`w-10 h-6 rounded-full peer peer-focus:outline-none transition-all ${isSecretSanta ? 'bg-xmas-gold' : 'bg-stone-200'} peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all`}
            ></div>
          </label>
        </div>
        <div>
          <label className={`${labelStyle} mb-3 flex items-center gap-2`}>
            <Eye size={16} className="text-stone-500" /> Sichtbarkeit
          </label>
          <div className="bg-stone-50 p-4 rounded-xl border border-stone-100">
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                className={`w-10 h-6 rounded-full relative transition-colors shrink-0 ${showNameInBuffet ? 'bg-stone-800' : 'bg-stone-300'}`}
              >
                <input
                  type="checkbox"
                  className="hidden"
                  checked={showNameInBuffet}
                  onChange={(e) => setShowNameInBuffet(e.target.checked)}
                />
                <div
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${showNameInBuffet ? 'left-5' : 'left-1'}`}
                ></div>
              </div>
              <div className="flex-grow">
                <span className="text-sm font-bold text-stone-700 block">Öffentliche Anzeige</span>
                <span className="text-xs text-stone-500 block">
                  Meinen Namen auf der Event-Seite anzeigen (Gästeliste & Buffet).
                </span>
              </div>
            </label>
          </div>
        </div>
        <div>
          <label className={`${labelStyle} mb-3 flex items-center gap-2`}>
            <Wallet size={16} className="text-stone-500" /> Unkostenbeitrag ({eventConfig.cost}):
          </label>
          <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl hover:bg-stone-50 border border-transparent hover:border-stone-100 transition-all">
            <div
              className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${wantsInvoice ? 'bg-stone-800 border-stone-800' : 'bg-white border-stone-300'}`}
            >
              {wantsInvoice && <CheckCircle2 size={14} className="text-white" />}
            </div>
            <input
              type="checkbox"
              className="hidden"
              checked={wantsInvoice}
              onChange={(e) => setWantsInvoice(e.target.checked)}
            />
            <span className="text-sm text-stone-700">
              Ich benötige eine Rechnung (für Überweisung)
            </span>
          </label>
        </div>
        <div>
          <label className={`${labelStyle} mb-2 flex items-center gap-2`}>
            <Mic2 size={16} className="text-stone-500" /> Ich möchte mich aktiv einbringen:
          </label>
          <p className="text-xs text-stone-400 mb-3 italic">
            z.B. Gedicht vortragen, Fotografieren, Snacks mitbringen, Musik machen...
          </p>
          <textarea
            value={contribution}
            onChange={(e) => setContribution(e.target.value)}
            placeholder="Dein Beitrag..."
            rows={2}
            className={inputStyle}
          />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin text-stone-800 text-4xl">❄️</div>
      </div>
    );
  }

  if (!participant) {
    return <div className="text-center p-20 text-stone-400">Einladung nicht gefunden.</div>;
  }

  const attendingGuests = allParticipants.filter((p) => p.status === 'attending');
  const totalAttending =
    attendingGuests.length + attendingGuests.reduce((acc, curr) => acc + (curr.plusOne ? 1 : 0), 0);
  const percentageFull = Math.min(100, (totalAttending / eventConfig.maxGuests) * 100);
  const isAttending = status === 'attending';
  const deadlinePassed = new Date() > new Date(eventConfig.rsvpDeadline);
  const deadlineDateStr = new Date(eventConfig.rsvpDeadline).toLocaleDateString();
  const isLocked = deadlinePassed && status !== 'attending';
  const formValid = isFormValid();

  // --- ONBOARDING WIZARD RENDER ---
  if (isOnboarding) {
    return (
      <div className="fixed inset-0 z-50 bg-xmas-cream flex flex-col items-center justify-center p-4 overflow-y-auto">
        <div className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl border border-white p-8">
          {/* Progress Bar */}
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-serif text-2xl font-bold text-stone-800">
              {onboardingStep === 1 && 'Dein Profil'}
              {onboardingStep === 2 && 'Dein Buffet-Beitrag'}
              {onboardingStep === 3 && 'Details & Abschluss'}
            </h2>
            <div className="flex gap-2">
              {[1, 2, 3].map((step) => (
                <div
                  key={step}
                  className={`h-2 w-8 rounded-full transition-all ${step <= onboardingStep ? 'bg-xmas-gold' : 'bg-stone-200'}`}
                ></div>
              ))}
            </div>
          </div>

          <div className="animate-fade-in space-y-6">
            {onboardingStep === 1 && (
              <>
                <p className="text-stone-500">Lass uns kurz dein Profil einrichten.</p>
                {renderAvatarSection()}
                {renderPlusOneSection()}
                <div className="flex justify-end pt-4">
                  <button
                    onClick={handleNextStep}
                    className="bg-stone-800 text-white px-8 py-3 rounded-full font-bold hover:bg-stone-900 flex items-center gap-2"
                  >
                    Weiter <ChevronRight />
                  </button>
                </div>
              </>
            )}

            {onboardingStep === 2 && (
              <>
                <p className="text-stone-500">
                  Das Wichtigste zuerst: Was steuerst du zum Buffet bei?
                </p>
                {renderBuffetSection()}
                <div className="flex justify-between pt-4">
                  <button
                    onClick={() => setOnboardingStep(1)}
                    className="text-stone-500 font-bold px-4 hover:text-stone-800"
                  >
                    Zurück
                  </button>
                  <button
                    onClick={handleNextStep}
                    disabled={!isBuffetValid()}
                    className="bg-stone-800 text-white px-8 py-3 rounded-full font-bold hover:bg-stone-900 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Weiter <ChevronRight />
                  </button>
                </div>
              </>
            )}

            {onboardingStep === 3 && (
              <>
                <p className="text-stone-500">Fast fertig! Nur noch ein paar Details.</p>
                {renderDetailsSection()}
                <div className="flex justify-between pt-4 items-center">
                  <button
                    onClick={() => setOnboardingStep(2)}
                    className="text-stone-500 font-bold px-4 hover:text-stone-800"
                  >
                    Zurück
                  </button>
                  <button
                    onClick={handleFinishOnboarding}
                    className="bg-xmas-green text-white px-10 py-4 rounded-full font-bold shadow-xl hover:scale-105 transition-all flex items-center gap-2"
                  >
                    <CheckCircle2 /> Jetzt anmelden
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-20">
      {/* Navigation Tabs (Hidden if pending or onboarding) */}
      {!isOnboarding && status !== 'pending' && (
        <div className="flex justify-center mb-8 sticky top-4 z-40">
          <div className="bg-white/80 backdrop-blur-md p-1.5 rounded-full inline-flex shadow-xl shadow-stone-200/50 border border-white/50">
            <button
              onClick={() => setActiveTab('info')}
              className={`px-6 py-3 rounded-full font-medium text-sm flex items-center gap-2 transition-all ${activeTab === 'info' ? 'bg-xmas-gold text-stone-900 shadow-sm transform scale-105' : 'text-stone-500 hover:text-stone-900 hover:bg-stone-50'}`}
            >
              <Info size={18} /> Das Event
            </button>
            <button
              onClick={() => setActiveTab('action')}
              className={`px-6 py-3 rounded-full font-medium text-sm flex items-center gap-2 transition-all ${activeTab === 'action' ? 'bg-xmas-gold text-stone-900 shadow-sm transform scale-105' : 'text-stone-500 hover:text-stone-900 hover:bg-stone-50'}`}
            >
              <ClipboardList size={18} /> Deine Teilnahme
            </button>
            <button
              onClick={() => setActiveTab('list')}
              className={`px-6 py-3 rounded-full font-medium text-sm flex items-center gap-2 transition-all ${activeTab === 'list' ? 'bg-xmas-gold text-stone-900 shadow-sm transform scale-105' : 'text-stone-500 hover:text-stone-900 hover:bg-stone-50'}`}
            >
              <Users size={18} /> Gäste & Buffet
            </button>
          </div>
        </div>
      )}

      {/* ======================= TAB 1: INFO / EVENT ======================= */}
      {activeTab === 'info' && (
        <div className="animate-fade-in space-y-8">
          {/* Welcome Text */}
          <div className="text-center space-y-4 py-4">
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-stone-800">
              Hallo {participant.name.split(' ')[0]}!
            </h2>
            <p className="text-stone-800 text-lg max-w-2xl mx-auto leading-relaxed">
              Happy (almost) Holidays! Mit Vergnügen schauen wir den festlichen Tagen entgegen.
              Weihnachtsfeiern sind eigentlich eine reine Office-Sache, aber das wollen wir ändern!
            </p>
            <p className="text-stone-600 text-lg max-w-2xl mx-auto leading-relaxed">
              Wir freuen uns auf eine entspannte, festliche Runde unter Selbstständigen-Kollegen.
            </p>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* LEFT COLUMN */}
            <div className="space-y-8">
              {/* Program */}
              {eventConfig.program && (
                <div className={sectionCardStyle}>
                  <h3 className="font-serif text-2xl text-xmas-dark mb-6 flex items-center gap-3">
                    <div className="bg-purple-50 p-2 rounded-xl text-purple-600">
                      <PartyPopper size={24} />
                    </div>{' '}
                    Was erwartet dich?
                  </h3>
                  <ul className="space-y-4">
                    {eventConfig.program.split(',').map((item, idx) => {
                      const trimmed = item.trim();
                      const enrichment = Object.keys(PROGRAM_ENRICHMENT).find((k) =>
                        trimmed.includes(k)
                      )
                        ? PROGRAM_ENRICHMENT[
                            Object.keys(PROGRAM_ENRICHMENT).find((k) =>
                              trimmed.includes(k)
                            ) as string
                          ]
                        : { desc: '', icon: Sparkles, color: 'text-stone-400 bg-stone-50' };
                      const Icon = enrichment.icon;
                      return (
                        <li
                          key={idx}
                          className="flex items-start gap-4 p-3 rounded-xl hover:bg-stone-50 transition-colors"
                        >
                          <div className={`shrink-0 p-2.5 rounded-xl ${enrichment.color}`}>
                            <Icon size={20} />
                          </div>
                          <div>
                            <span className="text-stone-800 font-bold block text-lg">
                              {trimmed}
                            </span>
                            {enrichment.desc && (
                              <span className="text-stone-500 text-sm leading-snug">
                                {enrichment.desc}
                              </span>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
              {/* Slider */}
              <LocationSlider />
            </div>

            {/* RIGHT COLUMN */}
            <div className="space-y-8">
              {/* Time & Place */}
              <div className={sectionCardStyle + ' relative overflow-hidden flex flex-col'}>
                <h3 className="font-serif text-2xl text-xmas-dark mb-6 flex items-center gap-3">
                  <div className="bg-blue-50 p-2 rounded-xl text-blue-600">
                    <Calendar size={24} />
                  </div>{' '}
                  Wann & Wo?
                </h3>
                <div className="space-y-4 flex-grow">
                  <div className="bg-stone-100 text-stone-800 p-4 rounded-2xl border border-stone-200 flex items-center gap-4 shadow-inner">
                    <div className="bg-white shadow-sm p-2 rounded-xl">
                      <Users size={24} className="text-xmas-gold" />
                    </div>
                    <div className="flex-grow">
                      <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">
                        <span>Gästeliste</span>
                        <span>
                          {totalAttending} / {eventConfig.maxGuests}
                        </span>
                      </div>
                      <div className="h-2 bg-stone-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-xmas-gold transition-all duration-1000"
                          style={{ width: `${percentageFull}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100 flex items-start gap-3">
                    <Calendar className="text-stone-600 shrink-0 mt-1" size={20} />
                    <div>
                      <p className="font-bold text-stone-800">{eventConfig.date}</p>
                      <p className="text-stone-500 text-sm">ab {eventConfig.time}</p>
                    </div>
                  </div>
                  <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100 flex items-start gap-3">
                    <MapPin className="text-stone-600 shrink-0 mt-1" size={20} />
                    <div>
                      <p className="font-bold text-stone-800">{eventConfig.location}</p>
                    </div>
                  </div>
                  {eventConfig.cost && (
                    <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 flex items-start gap-3">
                      <Euro className="text-amber-600 shrink-0 mt-1" size={20} />
                      <div>
                        <p className="font-bold text-amber-900">Unkostenbeitrag</p>
                        <p className="text-amber-800/80 text-sm">{eventConfig.cost}</p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="mt-4">
                  <button
                    onClick={downloadIcs}
                    className="w-full flex items-center justify-center gap-2 bg-stone-100 hover:bg-stone-200 text-stone-700 p-3 rounded-xl font-medium transition-colors text-sm"
                  >
                    <Download size={16} /> Kalendereintrag speichern
                  </button>
                </div>
              </div>

              {/* Map Panel */}
              <div className="h-64 sm:h-80 rounded-3xl shadow-xl shadow-stone-200/50 border border-white overflow-hidden relative">
                <iframe
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(eventConfig.location)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                  className="grayscale-[20%] contrast-[1.1]"
                ></iframe>
              </div>
            </div>
          </div>

          {/* Footer Signoff */}
          <div className="text-center pt-6 pb-6 text-stone-400/80">
            <p className="font-serif text-xl text-stone-600 mb-2">Bis dahin,</p>
            <p className="font-bold mb-4 text-xmas-gold">{eventConfig.hosts}</p>
            {eventConfig.contactEmail && (
              <p className="text-sm flex justify-center items-center gap-2 text-stone-600">
                <Mail size={14} /> {eventConfig.contactEmail}
              </p>
            )}
          </div>

          {/* CTA to Action Tab (Replaces old button logic) */}
          <div className="flex justify-center pb-12 pt-4">
            <button
              onClick={() => setActiveTab('action')}
              className="bg-xmas-gold text-stone-900 px-8 py-4 rounded-full font-bold shadow-xl hover:scale-105 transition-transform flex items-center gap-2"
            >
              Zur Anmeldung / Teilnahme <ArrowRight size={20} />
            </button>
          </div>
        </div>
      )}

      {/* ======================= TAB 3: LIST / GUESTS ======================= */}
      {activeTab === 'list' && (
        <div className="animate-fade-in space-y-8">
          <div className={sectionCardStyle}>
            <h3 className="font-serif text-2xl text-xmas-dark mb-6 flex items-center gap-3">
              <div className="bg-pink-50 p-2 rounded-xl text-pink-600">
                <HeartHandshake size={24} />
              </div>{' '}
              Wer ist dabei?
            </h3>
            <div className="flex flex-wrap justify-center gap-6">
              {attendingGuests.map((p) => {
                const show = p.showNameInBuffet !== false;
                return (
                  <div key={p.id} className="flex flex-col items-center gap-2">
                    <Avatar
                      style={p.avatarStyle || 'micah'}
                      seed={p.avatarSeed || p.name}
                      image={p.avatarImage}
                      size={56}
                      className="shadow-md bg-stone-50"
                    />
                    <span className="text-xs font-medium text-stone-600 bg-stone-50 px-2 py-1 rounded-lg">
                      {show ? p.name.split(' ')[0] : 'Gast'}
                      {p.plusOne && <span className="text-stone-400"> +1</span>}
                    </span>
                  </div>
                );
              })}
              {Array.from({
                length: Math.max(0, Math.min(5, eventConfig.maxGuests - totalAttending)),
              }).map((_, i) => (
                <div key={`empty-${i}`} className="flex flex-col items-center gap-2 opacity-60">
                  <div className="w-14 h-14 rounded-full border-2 border-dashed border-xmas-gold/30 bg-xmas-gold/5 flex items-center justify-center">
                    <User size={20} className="text-xmas-gold/50" />
                  </div>
                  <span className="text-[10px] font-bold text-xmas-gold/70 uppercase tracking-wide">
                    Frei
                  </span>
                </div>
              ))}
            </div>
          </div>
          <FoodDisplay participants={allParticipants} />
        </div>
      )}

      {/* ======================= TAB 2: ACTION / EDIT ======================= */}
      {activeTab === 'action' && (
        <div className="animate-fade-in space-y-8 max-w-2xl mx-auto">
          {/* If pending, show the RSVP Buttons */}
          {status === 'pending' ? (
            <div className="flex flex-col items-center gap-6 pb-12 pt-4">
              <h3 className="font-serif text-3xl text-stone-800 mb-4">Bist du dabei?</h3>
              {isLocked ? (
                <div className="bg-stone-100 px-8 py-4 rounded-2xl text-stone-500 flex items-center gap-2">
                  <Lock size={18} /> Anmeldung geschlossen
                </div>
              ) : (
                <div className="flex flex-col md:flex-row gap-4 w-full px-4">
                  {/* YES */}
                  <button
                    onClick={handleStartOnboarding}
                    className="flex-1 bg-xmas-green text-white py-5 px-8 rounded-3xl font-bold shadow-xl shadow-green-900/20 hover:bg-green-800 hover:scale-105 transition-all flex flex-col items-center gap-2 group"
                  >
                    <CheckCircle2 size={32} className="group-hover:animate-bounce" />
                    <span className="text-xl">Ich komme!</span>
                  </button>

                  {/* NO */}
                  <button
                    onClick={handleQuickDecline}
                    className="flex-1 bg-rose-400 text-white py-5 px-8 rounded-3xl font-bold shadow-xl shadow-rose-900/20 hover:bg-rose-500 hover:scale-105 transition-all flex flex-col items-center gap-2"
                  >
                    <XCircle size={24} className="opacity-80" />
                    <span className="text-lg">Kann leider nicht</span>
                    <span className="text-xs opacity-80 font-normal">
                      Änderung möglich bis {deadlineDateStr}
                    </span>
                  </button>

                  {/* MAYBE */}
                  <button
                    onClick={handleQuickMaybe}
                    className="flex-1 bg-stone-200 text-stone-600 py-5 px-8 rounded-3xl font-bold shadow-lg hover:bg-stone-300 hover:scale-105 transition-all flex flex-col items-center gap-2"
                  >
                    <HelpCircle size={24} className="opacity-60" />
                    <span className="text-lg">Weiß noch nicht</span>
                    <span className="text-xs opacity-60 font-normal">
                      Änderung möglich bis {deadlineDateStr}
                    </span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Status Card for responded users */
            <div
              className={`p-6 rounded-3xl shadow-lg flex items-center justify-between transition-all ${status === 'attending' ? 'bg-xmas-green text-white' : status === 'declined' ? 'bg-rose-400 text-white' : 'bg-xmas-gold text-white'}`}
            >
              <div className="flex items-center gap-4">
                <div className="bg-white/20 p-3 rounded-full">
                  {status === 'attending' && <CheckCircle2 size={24} />}
                  {status === 'declined' && <XCircle size={24} />}
                  {status === 'maybe' && <HelpCircle size={24} />}
                </div>
                <div>
                  <p className="font-serif font-bold text-xl">
                    {status === 'attending'
                      ? 'Du bist angemeldet!'
                      : status === 'declined'
                        ? 'Schade, dass du nicht kannst.'
                        : 'Du bist noch unentschlossen.'}
                  </p>
                  <p className="text-white/80 text-sm">
                    {status === 'attending'
                      ? formValid
                        ? 'Wir freuen uns auf dich!'
                        : 'Bitte vervollständige deine Anmeldung unten.'
                      : `Du kannst deine Entscheidung bis zum ${deadlineDateStr} noch ändern.`}
                  </p>
                </div>
              </div>
              {!isLocked && (
                <button
                  onClick={handleChangeStatus}
                  className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                >
                  Ändern
                </button>
              )}
            </div>
          )}

          {/* FULL FORM FOR ATTENDEES (Edit Mode) */}
          {isAttending && (
            <div className="space-y-8">
              {renderAvatarSection()}
              {renderPlusOneSection()}
              {renderBuffetSection()}
              {renderDetailsSection()}

              {/* Manual Save Button */}
              <div className="sticky bottom-4 z-30">
                <button
                  onClick={() => performSave('attending')}
                  disabled={!formValid}
                  className={`w-full py-4 rounded-2xl font-bold shadow-xl flex items-center justify-center gap-2 transition-transform active:scale-95 ${formValid ? 'bg-xmas-dark hover:bg-black text-white shadow-stone-900/20' : 'bg-stone-300 text-stone-500 cursor-not-allowed'}`}
                >
                  <Save size={20} />{' '}
                  {saved
                    ? 'Gespeichert!'
                    : !formValid
                      ? 'Bitte Pflichtfelder ausfüllen'
                      : 'Angaben speichern'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Toast Notification */}
      <div
        className={`fixed bottom-24 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-500 pointer-events-none ${saved ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
      >
        <div className="bg-xmas-dark text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3">
          <CheckCircle2 size={20} className="text-xmas-green" />{' '}
          <span className="font-medium">Änderungen gespeichert</span>
        </div>
      </div>
    </div>
  );
};
