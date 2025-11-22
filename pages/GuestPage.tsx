import React, { useState, useEffect, useCallback } from 'react';
import {
  Participant,
  FoodItem,
  AvatarStyle,
  AVATAR_STYLES,
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
  Phone,
} from 'lucide-react';
import { supabase as supabaseClient } from '../services/supabase';

interface GuestPageProps {
  id: string;
}

type GuestTab = 'info' | 'list' | 'action';

// Helper to get icon component by name
const getIconComponent = (iconName: string): React.ElementType => {
  const iconMap: Record<string, React.ElementType> = {
    Wine,
    Utensils,
    Flame,
    Snowflake,
    Music,
    PartyPopper,
    Sparkles,
    Gift,
  };
  return iconMap[iconName] || Sparkles;
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
  const [hasTriedNextStep, setHasTriedNextStep] = useState(false);

  // Form States
  const [status, setStatus] = useState<Participant['status']>('pending');

  // Avatar States
  const [avatarStyle, setAvatarStyle] = useState<AvatarStyle>('blank');
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
  const [foodCategory, setFoodCategory] = useState<string>(
    DEFAULT_EVENT_CONFIG.buffetConfig.find((c) => c.isActive)?.label || ''
  );
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

  // Scroll to top when tab changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeTab]);

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

        setAvatarStyle(p.avatarStyle || 'blank');
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
        } else {
          // Default to first active category
          const firstActive = config.buffetConfig?.find((c) => c.isActive);
          if (firstActive) {
            setFoodCategory(firstActive.label);
          }
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
        foodCategory !== (participant.food?.category || '') ||
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

  // Scroll to top when tab changes
  useEffect(() => {
    if (!isOnboarding && status !== 'pending') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [activeTab, isOnboarding, status]);

  const handleStartOnboarding = () => {
    setIsOnboarding(true);
    setOnboardingStep(1);
    setHasTriedNextStep(false);
    // Set default avatar style to "Leer" (blank) for first-time onboarding guests
    if (participant?.status === 'pending') {
      setAvatarStyle('blank');
      setAvatarImage(''); // Also clear any AI-generated image
    }
    // Reset scroll
    window.scrollTo(0, 0);
  };

  const handleNextStep = () => {
    if (onboardingStep === 2 && !isBuffetValid()) {
      setHasTriedNextStep(true);
      return;
    }
    setHasTriedNextStep(false);
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
    // Parse German date format: "18. Dezember 2025" -> YYYYMMDD
    const monthMap: Record<string, string> = {
      januar: '01',
      februar: '02',
      märz: '03',
      maerz: '03', // Alternative spelling
      april: '04',
      mai: '05',
      juni: '06',
      juli: '07',
      august: '08',
      september: '09',
      oktober: '10',
      november: '11',
      dezember: '12',
    };

    // Improved regex to handle umlauts and various formats
    // Matches: "18. Dezember 2025" or "18.Dezember 2025" or "18. Dezember2025"
    const dateMatch = eventConfig.date.match(/(\d{1,2})\.\s*([a-zäöü]+)\s+(\d{4})/i);
    let dateStr = '';
    if (dateMatch) {
      const day = dateMatch[1].padStart(2, '0');
      const monthName = dateMatch[2].toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); // Normalize umlauts
      const year = dateMatch[3];
      // Try direct match first, then normalized match
      const month = monthMap[dateMatch[2].toLowerCase()] || monthMap[monthName] || '01';
      dateStr = `${year}${month}${day}`;
    } else {
      // Fallback: try to extract numbers
      const numbers = eventConfig.date.replace(/[^0-9]/g, '');
      if (numbers.length >= 8) {
        dateStr = numbers.slice(-8); // Take last 8 digits
      } else {
        dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      }
    }

    // Parse time format: "17:00 Uhr" -> HHMMSS
    const timeMatch = eventConfig.time.match(/(\d{1,2}):(\d{2})/);
    let timeStr = '170000'; // Default
    if (timeMatch) {
      const hours = timeMatch[1].padStart(2, '0');
      const minutes = timeMatch[2].padStart(2, '0');
      timeStr = `${hours}${minutes}00`;
    } else {
      const numbers = eventConfig.time.replace(/[^0-9]/g, '');
      if (numbers.length >= 4) {
        timeStr = `${numbers.slice(0, 2)}${numbers.slice(2, 4)}00`;
      }
    }

    // Ensure DTSTART is in UTC format (add Z) or use local timezone
    // For simplicity, we'll use local time without timezone (floating time)
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Selbst & Selig//Weihnachtsfeier//DE
BEGIN:VEVENT
SUMMARY:${eventConfig.title}
DESCRIPTION:${eventConfig.subtitle}
DTSTART:${dateStr}T${timeStr}
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
    const categoryConfig = eventConfig.buffetConfig?.find((c) => c.label === foodCategory);
    const rawSuggestions = categoryConfig?.inspirations || [];
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
    'bg-white rounded-3xl shadow-xl shadow-stone-900/10 border border-white transition-all hover:shadow-2xl hover:shadow-stone-900/20 overflow-hidden';
  const cardHeaderStyle = 'p-6 border-b border-stone-100 bg-stone-50/50';
  const cardContentStyle = 'p-6 md:p-8';

  // --- RENDER SECTIONS ---

  const renderAvatarSection = () => (
    <div className={isOnboarding ? '' : sectionCardStyle}>
      {!isOnboarding && (
        <div className={cardHeaderStyle}>
          <h3 className="font-serif text-2xl text-xmas-dark flex items-center gap-3">
            <div className="bg-xmas-pink/20 p-2 rounded-xl text-xmas-pink">
              <User size={24} />
            </div>
            Dein Profilbild
          </h3>
        </div>
      )}
      <div className={isOnboarding ? '' : cardContentStyle}>
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
                🎨 Vorlage
              </button>
              <button
                onClick={() => setAvatarTab('ai')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${avatarTab === 'ai' ? 'bg-white shadow-sm text-stone-800' : 'text-stone-500 hover:text-stone-700'}`}
              >
                ✨ KI-Generierung
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
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderPlusOneSection = () => {
    if (!eventConfig.allowPlusOne) return null;

    return (
      <div className={isOnboarding ? 'mt-8' : sectionCardStyle}>
        {!isOnboarding && (
          <div className={`${cardHeaderStyle} flex items-center justify-between`}>
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
        )}
        <div className={isOnboarding ? '' : cardContentStyle}>
          {hasPlusOne && (
            <div className="animate-fade-in">
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
      </div>
    );
  };

  const renderBuffetSection = () => (
    <div
      className={`${isOnboarding ? '' : sectionCardStyle} ${hasTriedNextStep && (!foodName || foodName.trim().length === 0) ? 'ring-2 ring-red-200' : ''}`}
    >
      {!isOnboarding && (
        <div className={cardHeaderStyle}>
          <h3 className="font-serif text-2xl text-xmas-dark flex items-center gap-3">
            <div className="bg-green-50 p-2 rounded-xl text-green-600">
              <Utensils size={24} />
            </div>
            Dein Beitrag zum Buffet
          </h3>
        </div>
      )}
      <div className={`${isOnboarding ? '' : cardContentStyle} space-y-6`}>
        {/* 1. Kategorie (Category) */}
        <div>
          <label className={`${labelStyle} block mb-2`}>Kategorie</label>
          <select
            value={foodCategory}
            onChange={(e) => setFoodCategory(e.target.value)}
            className={inputStyle}
          >
            {(eventConfig.buffetConfig || [])
              .filter((c) => c.isActive)
              .map((c) => (
                <option key={c.id} value={c.label}>
                  {c.label}
                </option>
              ))}
          </select>
        </div>
        {/* 1. Inspiration */}
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
        {/* 2. Gericht (Dish Name) */}
        <div>
          <label className={`${labelStyle} block mb-2`}>
            Gericht <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={foodName}
            onChange={(e) => setFoodName(e.target.value)}
            placeholder="z.B. Nudelsalat, Tiramisu..."
            className={`${inputStyle} ${hasTriedNextStep && !foodName && 'border-red-300 bg-red-50/20'}`}
            required
          />
          {hasTriedNextStep && !foodName && (
            <p className="text-xs text-red-500 mt-1 font-medium flex items-center gap-1">
              <AlertCircle size={12} /> Pflichtfeld: Bitte Gericht eintragen.
            </p>
          )}
        </div>
        {/* 3. Eigenschaften (Properties) */}
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
        {/* 5. Notiz (Note) */}
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
    </div>
  );

  const renderDetailsSection = () => (
    <div className={isOnboarding ? '' : sectionCardStyle}>
      {!isOnboarding && (
        <div className={cardHeaderStyle}>
          <h3 className="font-serif text-2xl text-xmas-dark flex items-center gap-3">
            <div className="bg-emerald-50 p-2 rounded-xl text-emerald-600">
              <Sparkles size={24} />
            </div>
            Details & Wünsche
          </h3>
        </div>
      )}
      <div className={`${isOnboarding ? '' : cardContentStyle} space-y-8`}>
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
              Wichteln?
            </p>
            <p className="text-xs text-stone-500 mt-1">
            Machst du beim Wichteln mit? Dann wird dir ein anderer Gast zugelost und du beschenkst 
            ihn oder sie mit einem kleinen Geschenk <strong>im Wert von maximal {eventConfig.secretSantaLimit}€</strong>. 
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
        {/* Aktiv einbringen - moved to be right after Wichteln */}
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
        {/* Unkostenbeitrag - improved styling to match Wichteln card */}
        <div
          className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${wantsInvoice ? 'bg-amber-50 border-xmas-gold shadow-sm' : 'bg-stone-50 border-stone-100'}`}
        >
          <div
            className={`p-2 rounded-full ${wantsInvoice ? 'bg-xmas-gold text-white' : 'bg-white text-stone-300'}`}
          >
            <Wallet size={20} />
          </div>
          <div className="flex-grow">
            <p className="font-bold text-stone-800 text-sm">
              Rechnung benötigt? 
            </p>
            <p className="text-xs text-stone-500 mt-1">
            Den Unkostenbeitrag von {eventConfig.cost} bitte passend mitbringen.
            </p>
          </div>
          <div className="flex flex-col items-end">
             <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={wantsInvoice}
                onChange={(e) => setWantsInvoice(e.target.checked)}
                className="sr-only peer"
              />
              <div
                className={`w-10 h-6 rounded-full peer peer-focus:outline-none transition-all ${wantsInvoice ? 'bg-xmas-gold' : 'bg-stone-200'} peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all`}
              ></div>
            </label>
          </div>
        </div>

        {/* Sichtbarkeit - styled like Wichteln and Rechnung */}
        <div
          className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${!showNameInBuffet ? 'bg-amber-50 border-xmas-gold shadow-sm' : 'bg-stone-50 border-stone-100'}`}
        >
          <div
            className={`p-2 rounded-full ${!showNameInBuffet ? 'bg-xmas-gold text-white' : 'bg-white text-stone-300'}`}
          >
            <Eye size={20} />
          </div>
          <div className="flex-grow">
            <p className="font-bold text-stone-800 text-sm">
              Name ausblenden?
            </p>
            <p className="text-xs text-stone-500 mt-1">
              Aktivieren, um deinen Namen auf der Event-Seite zu verbergen (Gästeliste & Buffet).
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={!showNameInBuffet}
              onChange={(e) => setShowNameInBuffet(!e.target.checked)}
              className="sr-only peer"
            />
            <div
              className={`w-10 h-6 rounded-full peer peer-focus:outline-none transition-all ${!showNameInBuffet ? 'bg-xmas-gold' : 'bg-stone-200'} peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all`}
            ></div>
          </label>
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
  const isAttending = status === 'attending';
  const deadlinePassed = new Date() > new Date(eventConfig.rsvpDeadline);
  const deadlineDateStr = new Date(eventConfig.rsvpDeadline).toLocaleDateString();
  const isLocked = deadlinePassed && status !== 'attending';
  const formValid = isFormValid();

  // --- ONBOARDING WIZARD RENDER ---
  if (isOnboarding) {
    return (
      <div className="fixed inset-0 z-50 bg-xmas-cream flex flex-col items-center justify-start pt-12 md:pt-24 p-4 overflow-y-auto">
        <div className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl border border-white overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-stone-100 bg-stone-50/50">
            {onboardingStep === 1 && (
              <>
                <h3 className="font-serif font-bold text-xmas-dark text-xl flex items-center gap-2">
                  <User className="text-xmas-pink" size={24} /> Hallo {participant.name.split(' ')[0]}!
                </h3>
                <p className="text-sm text-stone-500 mt-1">Lass uns kurz dein Profil einrichten.</p>
              </>
            )}
            {onboardingStep === 2 && (
              <>
                <h3 className="font-serif font-bold text-xmas-dark text-xl flex items-center gap-2">
                  <Utensils className="text-xmas-gold" size={24} /> Dein Beitrag zum Buffet
                </h3>
                <p className="text-sm text-stone-500 mt-1">
                Jeder bringt eine Kleinigkeit für ca. 6 Personen mit. So entsteht ein buntes Buffet!
                </p>
              </>
            )}
            {onboardingStep === 3 && (
              <>
                <h3 className="font-serif font-bold text-xmas-dark text-xl flex items-center gap-2">
                  <Sparkles className="text-emerald-600" size={24} /> Details & Abschluss, {participant.name.split(' ')[0]}
                </h3>
                <p className="text-sm text-stone-500 mt-1">Fast fertig! Nur noch ein paar Details.</p>
              </>
            )}
          </div>

          <div className="p-8 animate-fade-in space-y-6">
            {onboardingStep === 1 && (
              <>
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
        
        {/* Progress Indicator - Centered at bottom */}
        <div className="flex justify-center gap-2 mt-8">
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              className={`h-2 w-8 rounded-full transition-all ${step <= onboardingStep ? 'bg-xmas-gold' : 'bg-white/50'}`}
            ></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-20">
      {/* Navigation Tabs (Hidden if pending or onboarding) */}
      {!isOnboarding && status !== 'pending' && (
        <div className="flex justify-center mb-8 sticky top-4 z-40">
          <div className="bg-white/80 backdrop-blur-md p-1.5 px-2 py-1 rounded-full inline-flex shadow-xl shadow-stone-200/50 border border-white/50">
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
          <div className="text-center space-y-8 py-12">
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-stone-800">
            Happy (almost) Holidays, {participant.name.split(' ')[0]}!
            </h2>
            <p className="text-stone-800 text-lg max-w-2xl mx-auto leading-relaxed">
            <br />
            Das einzige, was wir als Solo-Selbstständige am Angestellten-Dasein vermissen, sind die Weihnachtsfeiern. Ab diesem Jahr wollen wir das ändern. Die Grundidee ist einfach: Wir laden interessante Menschen ein, jeder bringt eine Kleinigkeit zum Essen mit, und wir kümmern uns um den Rest.<br />
            Wir freuen uns auf eine entspannte, festliche Runde!
            </p>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* LEFT COLUMN */}
            <div className="flex flex-col space-y-8">
              {/* Program */}
              {eventConfig.program && eventConfig.program.length > 0 && (
                <div className={sectionCardStyle}>
                  <div className={cardHeaderStyle}>
                    <h3 className="font-serif text-2xl text-xmas-dark flex items-center gap-3">
                      Was erwartet dich?
                    </h3>
                  </div>
                  <div className={cardContentStyle}>
                    <ul className="space-y-6">
                      {eventConfig.program.map((item) => {
                        const Icon = getIconComponent(item.icon);
                        return (
                          <li
                            key={item.id}
                            className="flex items-start gap-5 rounded-xl hover:bg-stone-50 transition-colors"
                          >
                            <div className={`shrink-0 p-2.5 rounded-xl ${item.color}`}>
                              <Icon size={20} />
                            </div>
                            <div>
                              <span className="text-stone-800 font-bold block text-base md:text-lg" style={{ lineHeight: '1.25', marginBottom: '0.33em' }}>
                                {item.title}
                              </span>
                              {item.description && (
                                <span className="text-stone-500 text-sm leading-snug">
                                  {item.description}
                                </span>
                              )}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              )}
              {/* Slider */}
              <LocationSlider />
            </div>

            {/* RIGHT COLUMN */}
            <div className="flex flex-col space-y-8">
              {/* Time & Place */}
              <div className={sectionCardStyle + ' relative flex flex-col'}>
                <div className={cardHeaderStyle}>
                  <h3 className="font-serif text-2xl text-xmas-dark flex items-center gap-3">
                    Wann & Wo?
                  </h3>
                </div>
                <div className={`${cardContentStyle} flex-grow`}>
                  <div className="space-y-6">
                    <div className="text-md md:text-lg flex items-start gap-3">
                      <div className={`shrink-0 p-2.5 rounded-xl text-blue-600 bg-blue-50`}>
                        <Calendar size={24} />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-stone-800">{eventConfig.date}</p>
                        <p className="text-stone-500 text-sm">ab {eventConfig.time}</p>
                      </div>
                      <div className="relative group shrink-0">
                        <Info className="text-stone-600 cursor-help" size={16} />
                        <div className="absolute right-0 bottom-full mb-2 w-48 p-2 bg-stone-800 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none z-10 shadow-lg">
                          <p className="text-center">Datum und Uhrzeit der Veranstaltung. Bitte pünktlich erscheinen.</p>
                          <div className="absolute right-4 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-stone-800"></div>
                        </div>
                      </div>
                    </div>
                    <div className="text-md md:text-lg flex items-start gap-3">
                      <div className={`shrink-0 p-2.5 rounded-xl text-blue-600 bg-blue-50`}>
                        <MapPin size={24} />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-stone-800">{eventConfig.location}</p>
                        <p className="text-stone-500 text-sm">Alter Peller-Hof</p>
                      </div>
                      <div className="relative group shrink-0">
                        <Info className="text-stone-600 cursor-help" size={16} />
                        <div className="absolute right-0 bottom-full mb-2 w-48 p-2 bg-stone-800 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none z-10 shadow-lg">
                          <p className="text-center">Die vollständige Adresse der Veranstaltungslocation. Siehe auch Karte unten.</p>
                          <div className="absolute right-4 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-stone-800"></div>
                        </div>
                      </div>
                    </div>
                    <div className="text-md md:text-lg flex items-start gap-3">
                      <div className={`shrink-0 p-2.5 rounded-xl text-blue-600 bg-blue-50`}>
                        <Users size={24} />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-stone-800">
                          {eventConfig.maxGuests - totalAttending} / {eventConfig.maxGuests}
                        </p>
                        <p className="text-stone-500 text-sm">Plätzen verfügbar</p>
                      </div>
                      <div className="relative group shrink-0">
                        <Info className="text-stone-600 cursor-help" size={16} />
                        <div className="absolute right-0 bottom-full mb-2 w-48 p-2 bg-stone-800 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none z-10 shadow-lg">
                          <p className="text-center">Anzahl der noch verfügbaren Plätze. Die Zahl berücksichtigt bereits angemeldete Gäste inklusive Begleitungen.</p>
                          <div className="absolute right-4 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-stone-800"></div>
                        </div>
                      </div>
                    </div>
                    {eventConfig.cost && (
                    <div className="text-md md:text-lg flex items-start gap-3">
                      <div className={`shrink-0 p-2.5 rounded-xl text-stone-600 bg-stone-50`}>
                        <Euro size={24} />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-stone-800">Unkostenbeitrag</p>
                        <p className="text-stone-500 text-sm">{eventConfig.cost}</p>
                      </div>
                      <div className="relative group shrink-0">
                        <Info className="text-stone-600 cursor-help" size={16} />
                        <div className="absolute right-0 bottom-full mb-2 w-48 p-2 bg-stone-800 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none z-10 shadow-lg">
                          <p className="text-center">Bitte passend zur Veranstaltung mitbringen. Dieser Betrag deckt die Kosten für Getränke, Location und Organisation.</p>
                          <div className="absolute right-4 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-stone-800"></div>
                        </div>
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
              </div>

              {/* Map Panel */}
              <div className="flex-1 min-h-64 rounded-3xl shadow-xl shadow-stone-200/50 border border-white overflow-hidden relative">
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
          <div className="text-center pt-10 pb-4 text-stone-400/80">
            <p className="font-serif text-2xl text-stone-600 mb-1">Bis dahin,</p>
            <p className="mb-4 text-xl text-xmas-gold">{eventConfig.hosts}</p>

          </div>

          {/* CTA to Action Tab (Replaces old button logic) */}
          <div className="flex justify-center pb-3">
            <button
              onClick={() => setActiveTab('action')}
              className="font-serif text-xl bg-xmas-gold text-stone-900 px-8 py-4 rounded-full font-bold shadow-xl hover:scale-105 transition-transform flex items-center gap-2"
            >
              Zur Anmeldung / Teilnahme <ArrowRight size={32} />
            </button>
          </div>
          <div className="flex flex-col gap-2 items-center">
              {eventConfig.contactEmail && (
                <a href={`mailto:${eventConfig.contactEmail}`} className="text-sm flex justify-center items-center gap-2 text-stone-600 hover:text-stone-800 transition-colors">
                  <Mail size={14} /> {eventConfig.contactEmail}
                </a>
              )}
              {eventConfig.contactPhone && (
                <a href={`tel:${eventConfig.contactPhone}`} className="text-sm flex justify-center items-center gap-2 text-stone-600 hover:text-stone-800 transition-colors">
                  <Phone size={14} /> {eventConfig.contactPhone}
                </a>
              )}
            </div>
        </div>
      )}

      {/* ======================= TAB 3: LIST / GUESTS ======================= */}
      {activeTab === 'list' && (
        <div className="animate-fade-in space-y-8">
          <div className={sectionCardStyle}>
            <div className={cardHeaderStyle}>
              <h3 className="font-serif text-2xl text-xmas-dark flex items-center gap-3">
                <div className="bg-pink-50 p-2 rounded-xl text-pink-600">
                  <HeartHandshake size={24} />
                </div>
                Wer ist dabei?
              </h3>
            </div>
            <div className={cardContentStyle}>
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
          </div>
          <FoodDisplay participants={allParticipants} config={eventConfig} />
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
                  </button>

                  {/* MAYBE */}
                  <button
                    onClick={handleQuickMaybe}
                    className="flex-1 bg-stone-200 text-stone-600 py-5 px-8 rounded-3xl font-bold shadow-lg hover:bg-stone-300 hover:scale-105 transition-all flex flex-col items-center gap-2"
                  >
                    <HelpCircle size={24} className="opacity-60" />
                    <span className="text-lg">Weiß noch nicht</span>

                  </button>
                </div>
              )}
                                  <span className="text-xs opacity-80 font-normal">
                      Änderung möglich bis {deadlineDateStr}
                    </span>
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
                      ? `Hallo ${participant.name.split(' ')[0]}, du bist angemeldet!`
                      : status === 'declined'
                        ? `Danke für die Rückmeldung, ${participant.name.split(' ')[0]}!`
                        : `Danke für die Rückmeldung, ${participant.name.split(' ')[0]}!`}
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
