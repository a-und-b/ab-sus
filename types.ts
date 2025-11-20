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
};

export type AvatarStyle = keyof typeof AVATAR_STYLES;

export interface FoodItem {
  name: string;
  category: FoodCategory;
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
  isSecretSanta: boolean;
  wantsInvoice?: boolean; // New: Simple checkbox for invoice
  contribution?: string; // New: Free text for active participation
  notes?: string; // Kept for legacy or internal use
  lastUpdated: string; // ISO Date
}

export interface EventConfig {
  title: string;
  subtitle: string;
  date: string; // Text representation, e.g. "18. Dezember 2025"
  time: string; // Text representation, e.g. "18:00 Uhr"
  location: string;
  maxGuests: number;
  allowPlusOne: boolean; // Toggle for plus one option
  secretSantaLimit: number;
  dietaryOptions: string[];
  cost: string; // e.g. "25 € pro Person"
  hosts: string; // e.g. "Holger, Daniela..."
  program: string; // Comma separated list of highlights
  contactEmail: string;
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
  secretSantaLimit: 15,
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
  program:
    'Glühwein-Empfang, Gemeinsames Buffet, Fackelwanderung, Ugly Christmas Sweater Wettbewerb, Musik & Feuerschale',
  contactEmail: 'info@selbst-und-selig.de',
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
2. Wichteln: Falls du mitmachst, denk an dein Geschenk (max {{secretSantaLimit}}€).
3. Buffet: Du bringst "{{food}}" mit. Danke!

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

export const INITIAL_PARTICIPANTS: Participant[] = [
  {
    id: 'a3f7k9m2',
    name: 'Anna Musterfrau',
    email: 'anna@example.com',
    status: 'attending',
    avatarStyle: 'adventurer',
    avatarSeed: 'Anna',
    food: {
      name: 'Kartoffelsalat',
      category: FoodCategory.SIDE,
      isVegan: true,
      isGlutenFree: true,
      isLactoseFree: true,
      containsAlcohol: false,
      containsNuts: false,
    },
    showNameInBuffet: true,
    isSecretSanta: true,
    wantsInvoice: false,
    contribution: 'Ich bringe Knabberzeug mit',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'b8x2l1p9',
    name: 'Markus Beispiel',
    email: 'markus@example.com',
    status: 'pending',
    avatarStyle: 'micah',
    avatarSeed: 'Markus',
    isSecretSanta: false,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'c4m5q8r3',
    name: 'Julia Design',
    email: 'julia@example.com',
    status: 'attending',
    avatarStyle: 'notionists',
    avatarSeed: 'Julia',
    plusOne: 'Thomas',
    plusOneAllergies: 'Erdnüsse',
    food: {
      name: 'Tiramisu',
      category: FoodCategory.DESSERT,
      isVegan: false,
      isGlutenFree: false,
      isLactoseFree: false,
      containsAlcohol: true,
      containsNuts: false,
    },
    allergies: 'Haselnüsse',
    showNameInBuffet: true,
    isSecretSanta: true,
    wantsInvoice: true,
    contribution: 'Fotografieren',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'd5n6t9u1',
    name: 'Sabine Müller',
    email: 'sabine@example.com',
    status: 'attending',
    avatarStyle: 'bottts',
    avatarSeed: 'Sabine',
    food: {
      name: 'Gemüsesticks mit Hummus',
      category: FoodCategory.APPETIZER,
      isVegan: true,
      isGlutenFree: true,
      isLactoseFree: true,
      containsAlcohol: false,
      containsNuts: false,
    },
    allergies: 'Glutenfrei',
    showNameInBuffet: true,
    isSecretSanta: false,
    wantsInvoice: true,
    contribution: 'Ein Weihnachtsgedicht vortragen',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'e7r8v2w4',
    name: 'Stefan Schmidt',
    email: 'stefan@example.com',
    status: 'declined',
    avatarStyle: 'avataaars',
    avatarSeed: 'Stefan',
    isSecretSanta: false,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'f9s1x3y5',
    name: 'Lisa Weber',
    email: 'lisa@example.com',
    status: 'maybe',
    avatarStyle: 'shapes',
    avatarSeed: 'Lisa',
    isSecretSanta: false,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'g2h4j6k8',
    name: 'Jan Becker',
    email: 'jan@example.com',
    status: 'attending',
    avatarStyle: 'adventurer',
    avatarSeed: 'Jan',
    isSecretSanta: true,
    showNameInBuffet: true,
    food: {
      name: 'Hausgemachte Bowle',
      category: FoodCategory.DRINK,
      isVegan: true,
      isGlutenFree: true,
      isLactoseFree: true,
      containsAlcohol: true,
      containsNuts: false,
    },
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'h3j5l7n9',
    name: 'Katrin Hoffmann',
    email: 'katrin@example.com',
    status: 'maybe',
    avatarStyle: 'micah',
    avatarSeed: 'Katrin',
    isSecretSanta: false,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'i4k6m8o1',
    name: 'Tom Wagner',
    email: 'tom@example.com',
    status: 'pending',
    avatarStyle: 'bottts',
    avatarSeed: 'Tom',
    isSecretSanta: false,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'j5l7n9p2',
    name: 'Felix Graf',
    email: 'felix@example.com',
    status: 'attending',
    avatarStyle: 'micah',
    avatarSeed: 'Felix',
    isSecretSanta: true,
    showNameInBuffet: true,
    food: {
      name: 'Chili con Carne',
      category: FoodCategory.MAIN,
      isVegan: false,
      isGlutenFree: true,
      isLactoseFree: false, // Schmand etc.
      containsAlcohol: false,
      containsNuts: false,
    },
    contribution: 'Musikbox',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'k6m8o1q3',
    name: 'Monika Sommer',
    email: 'monika@example.com',
    status: 'attending',
    avatarStyle: 'bottts',
    avatarSeed: 'Monika',
    plusOne: 'Peter',
    isSecretSanta: false,
    showNameInBuffet: true,
    food: {
      name: 'Baguette & Dips',
      category: FoodCategory.SIDE,
      isVegan: false,
      isGlutenFree: false,
      isLactoseFree: false,
      containsAlcohol: false,
      containsNuts: false,
    },
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'l7n9p2r4',
    name: 'David Winter',
    email: 'david@example.com',
    status: 'attending',
    avatarStyle: 'adventurer',
    avatarSeed: 'David',
    isSecretSanta: true,
    showNameInBuffet: false, // Anonymous
    food: {
      name: 'Nürnberger Lebkuchen',
      category: FoodCategory.DESSERT,
      isVegan: false,
      isGlutenFree: false,
      isLactoseFree: false,
      containsAlcohol: false,
      containsNuts: true,
    },
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'm8o1q3s5',
    name: 'Sarah Herbst',
    email: 'sarah@example.com',
    status: 'attending',
    avatarStyle: 'avataaars',
    avatarSeed: 'Sarah',
    plusOne: 'Jonas',
    isSecretSanta: true,
    showNameInBuffet: true,
    food: {
      name: 'Große Käseplatte',
      category: FoodCategory.APPETIZER,
      isVegan: false,
      isGlutenFree: true,
      isLactoseFree: false,
      containsAlcohol: false,
      containsNuts: true, // Walnüsse Deko
    },
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'judith-demo',
    name: 'Judith',
    email: 'judith@example.com',
    status: 'pending',
    avatarStyle: 'micah',
    avatarSeed: 'Judith',
    isSecretSanta: false,
    lastUpdated: new Date().toISOString(),
  },
];
