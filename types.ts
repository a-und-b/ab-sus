import { LucideIcon } from 'lucide-react';

export type RSVPStatus = 'attending' | 'declined' | 'maybe' | 'pending';

export enum FoodCategory {
  APPETIZER = 'Vorspeise & Salat',
  MAIN = 'Hauptgericht',
  SIDE = 'Beilage',
  DESSERT = 'Dessert',
  DRINK = 'Getränk',
}

export const BUFFET_INSPIRATIONS: Record<FoodCategory, string[]> = {
  [FoodCategory.APPETIZER]: [
    'Tomate-Mozzarella Spieße',
    'Gemüsesticks mit Dip',
    'Blätterteigschnecken',
    'Bruschetta',
    'Gefüllte Eier',
    'Antipasti-Platte',
    'Käsewürfel & Trauben',
  ],
  [FoodCategory.MAIN]: [
    'Chili con Carne',
    'Linseneintopf',
    'Party-Frikadellen',
    'Gemüselasagne',
    'Herzhafte Quiche',
    'Currywurst-Topf',
    'Falafel-Bällchen',
  ],
  [FoodCategory.SIDE]: [
    'Kartoffelsalat',
    'Nudelsalat',
    'Frisches Baguette & Kräuterbutter',
    'Couscous-Salat',
    'Rosmarinkartoffeln',
    'Focaccia',
    'Krautsalat',
  ],
  [FoodCategory.DESSERT]: [
    'Tiramisu',
    'Mousse au Chocolat',
    'Obstsalat',
    'Brownies',
    'Weihnachtsplätzchen',
    'Panna Cotta',
    'Zimt-Schnecken',
    'Lebkuchen',
  ],
  [FoodCategory.DRINK]: [
    'Kiste Bier',
    'Flasche Rotwein',
    'Flasche Weißwein',
    'Alkoholfreier Punsch',
    'Cola/Limo Kasten',
    'Sekt zum Anstoßen',
    'Selbstgemachter Eistee',
  ],
};

export const AVATAR_STYLES = {
  adventurer: 'Abenteurer',
  micah: 'Künstlerisch',
  notionists: 'Skizze',
  avataaars: 'Comic',
  bottts: 'Roboter',
  shapes: 'Abstrakt',
  blank: 'Leer',
};

export type AvatarStyle = keyof typeof AVATAR_STYLES;

export interface FoodItem {
  name: string;
  category: string;
  description?: string;
  isVegan: boolean;
  isGlutenFree: boolean;
  isLactoseFree: boolean;
  containsAlcohol: boolean;
  containsNuts: boolean;
}

export interface Participant {
  id: string;
  name: string;
  email: string;
  status: RSVPStatus;
  avatarStyle: AvatarStyle;
  avatarSeed: string;
  avatarImage?: string; // Base64 string of generated image
  plusOne?: string; // Name of plus one, empty if none
  plusOneAllergies?: string; // Allergies of plus one
  food?: FoodItem;
  showNameInBuffet?: boolean; // Toggle visibility in public list
  allergies?: string; // User allergies
  contribution?: string; // New: Free text for active participation
  activityVotes?: string[]; // Array of activity IDs this participant voted for
  notes?: string; // Kept for legacy or internal use
  lastUpdated: string; // ISO Date
}

export interface ProgramItem {
  id: string;
  title: string;
  description: string;
  icon: string; // Name of the icon (e.g., 'Wine', 'Music')
  color: string; // Tailwind color classes (e.g., 'text-red-500 bg-red-50')
}

export interface ActivityItem {
  id: string;
  title: string;
  description?: string;
  isActive: boolean; // Whether this activity is visible for voting
}

export interface BuffetCategoryConfig {
  id: string;
  label: string;
  isActive: boolean;
  inspirations: string[];
}

export interface EventConfig {
  title: string;
  subtitle: string;
  date: string; // Text representation, e.g. "18. Dezember 2025"
  time: string; // Text representation, e.g. "18:00 Uhr"
  location: string;
  maxGuests: number;
  allowPlusOne: boolean; // Toggle for plus one option
  dietaryOptions: string[];
  cost: string; // e.g. "25 € pro Person"
  hosts: string; // e.g. "Holger, Daniela..."
  program: ProgramItem[]; // Structured program highlights
  buffetConfig: BuffetCategoryConfig[]; // New: Dynamic buffet configuration
  activities: ActivityItem[]; // Interactive program activities for voting
  contributionSuggestions: string[]; // Suggestions for active participation contributions
  contactEmail: string;
  contactPhone?: string; // Optional contact phone number
  rsvpDeadline: string; // ISO Date String YYYY-MM-DD
}

export const DEFAULT_EVENT_CONFIG: EventConfig = {
  title: 'Selbst & Selig',
  subtitle: 'Die Weihnachtsfeier 2025',
  date: '18. Dezember 2025',
  time: '17:00 Uhr',
  location: 'Judiths Gasthof, Weissenstadt',
  maxGuests: 30,
  allowPlusOne: false, // Default to false as requested
  dietaryOptions: [
    'Vegetarisch',
    'Vegan',
    'Glutenfrei',
    'Laktosefrei',
    'Nussallergie',
    'Alkoholfrei',
  ],
  cost: '25 € pro Person',
  hosts: 'Holger, Daniela, Finn und Judith',
  program: [
    {
      id: 'gluehwein',
      title: 'Glühwein-Empfang',
      description: 'Wir starten gemütlich am Feuer mit heißen Getränken.',
      icon: 'Wine',
      color: 'text-red-500 bg-red-50',
    },
    {
      id: 'buffet',
      title: 'Gemeinsames Buffet',
      description: 'Jeder steuert etwas bei – von Herzhaft bis Süß.',
      icon: 'Utensils',
      color: 'text-amber-500 bg-amber-50',
    },
    {
      id: 'fackelwanderung',
      title: 'Fackelwanderung',
      description: 'Ein stimmungsvoller Spaziergang durch die Winternacht.',
      icon: 'Flame',
      color: 'text-orange-500 bg-orange-50',
    },
    {
      id: 'sweater',
      title: 'Ugly Christmas Sweater Wettbewerb',
      description: 'Zieh dein schrägstes Teil an und gewinne Ruhm & Ehre!',
      icon: 'Snowflake',
      color: 'text-blue-500 bg-blue-50',
    },
    {
      id: 'music',
      title: 'Musik & Feuerschale',
      description: 'Ausklang mit guten Gesprächen und Knistern.',
      icon: 'Music',
      color: 'text-purple-500 bg-purple-50',
    },
  ],
  buffetConfig: [
    {
      id: 'appetizer',
      label: FoodCategory.APPETIZER,
      isActive: true,
      inspirations: BUFFET_INSPIRATIONS[FoodCategory.APPETIZER],
    },
    {
      id: 'main',
      label: FoodCategory.MAIN,
      isActive: true,
      inspirations: BUFFET_INSPIRATIONS[FoodCategory.MAIN],
    },
    {
      id: 'side',
      label: FoodCategory.SIDE,
      isActive: true,
      inspirations: BUFFET_INSPIRATIONS[FoodCategory.SIDE],
    },
    {
      id: 'dessert',
      label: FoodCategory.DESSERT,
      isActive: true,
      inspirations: BUFFET_INSPIRATIONS[FoodCategory.DESSERT],
    },
    {
      id: 'drink',
      label: FoodCategory.DRINK,
      isActive: true,
      inspirations: BUFFET_INSPIRATIONS[FoodCategory.DRINK],
    },
  ],
  activities: [], // Empty by default, hosts can add activities
  contributionSuggestions: [
    'Gedicht vortragen',
    'Fotografieren',
    'Snacks mitbringen',
    'Musik machen',
  ],
  contactEmail: 'info@selbst-und-selig.de',
  contactPhone: '',
  rsvpDeadline: '2025-12-10',
};

// --- Email System Types ---

export type EmailTrigger = 'manual' | 'auto_registration' | 'scheduled';

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string; // Supports placeholders like {{name}}, {{link}}
  trigger: EmailTrigger;
  description: string;
}

export interface EmailLog {
  id: string;
  date: string;
  templateName: string;
  recipientCount: number;
  recipientsPreview: string; // Comma separated first few names
  status: 'sent' | 'failed';
}

export const DEFAULT_EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: 't1_invite',
    name: '1. Invitation Email',
    subject: 'Einladung: Selbst & Selig Weihnachtsfeier 🎄',
    trigger: 'manual',
    description: 'Initiale Einladung mit dem persönlichen Link.',
    body: `Hallo {{name}},

Happy (almost) Holidays!
Mit Vergnügen schauen wir den festlichen Tagen entgegen. Weihnachtsfeiern sind eigentlich eine reine Office-Sache, aber das wollen wir ändern!

Du bist herzlich zu unserer Weihnachtsfeier für Solo-Selbstständige eingeladen.

📅 Wann: {{date}}, ab {{time}}
📍 Wo: {{location}}

Hier ist dein persönlicher Link zum Zu-/Absagen und Buffet planen:
{{link}}

Wir freuen uns auf eine entspannte Runde!
{{hosts}}`,
  },
  {
    id: 't2_confirm',
    name: '2. Registration Confirmation',
    subject: 'Bestätigung: Schön, dass du dabei bist! ✨',
    trigger: 'auto_registration',
    description: 'Bestätigung nach Klick auf "Ich komme".',
    body: `Hallo {{name}},

Juhu! Wir freuen uns riesig, dass du am {{date}} dabei bist.

Du hast eingetragen:
Mitbringsel: {{food}}
Begleitung: {{plusOne}}

Falls du noch etwas ändern möchtest, nutze einfach deinen Link:
{{link}}

Bis bald,
{{hosts}}`,
  },
  {
    id: 't3_followup',
    name: '3. Follow-up (2 Weeks Before)',
    subject: 'Bald ist es soweit! 🎅',
    trigger: 'manual',
    description: 'Erinnerung für Unentschlossene oder allgemeines Update.',
    body: `Hallo {{name}},

In zwei Wochen ist es soweit! Unsere Selbst & Selig Weihnachtsfeier steht vor der Tür.

Aktueller Status:
{{guestCount}} tolle Menschen sind schon dabei!

Falls du noch nicht fest zugesagt hast oder dein Mitbringsel eintragen möchtest, hier nochmal dein Link:
{{link}}

Vorfreudige Grüße,
{{hosts}}`,
  },
  {
    id: 't4_reminder',
    name: '4. Reminder (1 Week Before)',
    subject: 'Nächste Woche: Weihnachtsfeier! 🎁',
    trigger: 'manual',
    description: 'Letzte Infos und Erinnerung an Wichtelgeschenk.',
    body: `Hallo {{name}},

Nur noch eine Woche! Wir treffen uns am {{date}} um {{time}} in {{location}}.

Wichtige Reminder:
1. Unkostenbeitrag: {{cost}} (bitte passend mitbringen)
2. Buffet: Du bringst "{{food}}" mit. Danke!

Wir freuen uns auf dich!
{{hosts}}`,
  },
  {
    id: 't5_thankyou',
    name: '5. Thank You Email',
    subject: 'Danke für den schönen Abend! 🌟',
    trigger: 'manual',
    description: 'Nach der Veranstaltung.',
    body: `Hallo {{name}},

vielen Dank, dass du gestern dabei warst und den Abend so besonders gemacht hast!
Es war wunderschön, mit euch allen zu feiern.

Wir hoffen, du bist gut nach Hause gekommen und hast die Feiertage nun entspannt im Blick.

Frohe Weihnachten!
{{hosts}}`,
  },
];
