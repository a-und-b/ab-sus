

import { Participant, INITIAL_PARTICIPANTS, RSVPStatus, FoodItem, EventConfig, DEFAULT_EVENT_CONFIG, AvatarStyle, EmailTemplate, EmailLog, DEFAULT_EMAIL_TEMPLATES } from '../types';

const STORAGE_KEY = 'selbst_selig_data_v1';
const CONFIG_KEY = 'selbst_selig_config_v1';
const TEMPLATES_KEY = 'selbst_selig_templates_v1';
const LOGS_KEY = 'selbst_selig_logs_v1';

export const CONFIG_UPDATED_EVENT = 'selbst_selig_config_updated';

class DataService {
  private participants: Participant[];
  private config: EventConfig;
  private emailTemplates: EmailTemplate[];
  private emailLogs: EmailLog[];

  constructor() {
    // Load Participants
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (storedData) {
      this.participants = JSON.parse(storedData);
      this.participants = this.participants.map(p => ({
        ...p,
        avatarStyle: p.avatarStyle || 'micah',
        avatarSeed: p.avatarSeed || p.name
      }));
    } else {
      this.participants = INITIAL_PARTICIPANTS;
      this.saveData();
    }

    // Load Config
    const storedConfig = localStorage.getItem(CONFIG_KEY);
    if (storedConfig) {
      const parsed = JSON.parse(storedConfig);
      this.config = { 
          ...DEFAULT_EVENT_CONFIG, 
          ...parsed,
          dietaryOptions: parsed.dietaryOptions || DEFAULT_EVENT_CONFIG.dietaryOptions,
          program: parsed.program || DEFAULT_EVENT_CONFIG.program,
          cost: parsed.cost || DEFAULT_EVENT_CONFIG.cost,
          hosts: parsed.hosts || DEFAULT_EVENT_CONFIG.hosts,
          contactEmail: parsed.contactEmail || DEFAULT_EVENT_CONFIG.contactEmail,
          rsvpDeadline: parsed.rsvpDeadline || DEFAULT_EVENT_CONFIG.rsvpDeadline,
          allowPlusOne: parsed.allowPlusOne !== undefined ? parsed.allowPlusOne : DEFAULT_EVENT_CONFIG.allowPlusOne
      };
    } else {
      this.config = DEFAULT_EVENT_CONFIG;
      this.saveConfig();
    }

    // Load Email Templates
    const storedTemplates = localStorage.getItem(TEMPLATES_KEY);
    if (storedTemplates) {
        this.emailTemplates = JSON.parse(storedTemplates);
    } else {
        this.emailTemplates = DEFAULT_EMAIL_TEMPLATES;
        this.saveTemplates();
    }

    // Load Logs
    const storedLogs = localStorage.getItem(LOGS_KEY);
    if (storedLogs) {
        this.emailLogs = JSON.parse(storedLogs);
    } else {
        this.emailLogs = [];
    }
  }

  private saveData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.participants));
  }

  private saveConfig() {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(this.config));
    window.dispatchEvent(new Event(CONFIG_UPDATED_EVENT));
  }

  private saveTemplates() {
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(this.emailTemplates));
  }

  private saveLogs() {
    localStorage.setItem(LOGS_KEY, JSON.stringify(this.emailLogs));
  }

  // --- Participant Methods ---

  getAll(): Participant[] {
    return [...this.participants];
  }

  getById(id: string): Participant | undefined {
    return this.participants.find(p => p.id === id);
  }

  create(name: string, email: string): Participant {
    const newParticipant = this.createParticipantObject(name, email);
    this.participants.push(newParticipant);
    this.saveData();
    return newParticipant;
  }

  private createParticipantObject(name: string, email: string): Participant {
    const newId = Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 6);
    const styles: AvatarStyle[] = ['adventurer', 'micah', 'notionists', 'bottts'];
    const randomStyle = styles[Math.floor(Math.random() * styles.length)];

    return {
      id: newId,
      name: name.trim(),
      email: email.trim(),
      status: 'pending',
      avatarStyle: randomStyle,
      avatarSeed: name.trim(),
      showNameInBuffet: true,
      isSecretSanta: false,
      wantsInvoice: false,
      contribution: '',
      lastUpdated: new Date().toISOString()
    };
  }

  importBatch(candidates: {name: string, email: string}[]): number {
    let count = 0;
    candidates.forEach(c => {
      if (c.name && c.email && !this.participants.some(p => p.email.toLowerCase() === c.email.toLowerCase())) {
        const newParticipant = this.createParticipantObject(c.name, c.email);
        this.participants.push(newParticipant);
        count++;
      }
    });
    if (count > 0) {
      this.saveData();
    }
    return count;
  }

  update(id: string, updates: Partial<Participant>): Participant | null {
    const index = this.participants.findIndex(p => p.id === id);
    if (index === -1) return null;

    this.participants[index] = {
      ...this.participants[index],
      ...updates,
      lastUpdated: new Date().toISOString()
    };
    this.saveData();
    return this.participants[index];
  }

  reset() {
    this.participants = INITIAL_PARTICIPANTS;
    this.saveData();
  }

  // --- Config Methods ---

  getConfig(): EventConfig {
    return { ...this.config };
  }

  updateConfig(updates: Partial<EventConfig>): EventConfig {
    this.config = { ...this.config, ...updates };
    this.saveConfig();
    return this.config;
  }

  // --- Email System Methods ---

  getEmailTemplates(): EmailTemplate[] {
    return [...this.emailTemplates];
  }

  updateEmailTemplate(id: string, updates: Partial<EmailTemplate>): void {
    const index = this.emailTemplates.findIndex(t => t.id === id);
    if (index !== -1) {
        this.emailTemplates[index] = { ...this.emailTemplates[index], ...updates };
        this.saveTemplates();
    }
  }

  getEmailLogs(): EmailLog[] {
      return [...this.emailLogs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  // Mock Sending Function - Replace this with actual Resend API call later
  sendEmailBatch(templateId: string, recipients: Participant[]): Promise<boolean> {
      return new Promise((resolve) => {
          const template = this.emailTemplates.find(t => t.id === templateId);
          if (!template || recipients.length === 0) {
              resolve(false);
              return;
          }

          const attendingCount = this.participants.filter(p => p.status === 'attending').length;

          console.group(`📧 Sending Email Batch: ${template.name}`);
          
          recipients.forEach(p => {
              let body = template.body;
              let subject = template.subject;
              
              // Replacements
              const link = `${window.location.origin}/#/p/${p.id}`;
              const replacements: Record<string, string> = {
                  '{{name}}': p.name.split(' ')[0],
                  '{{fullname}}': p.name,
                  '{{email}}': p.email,
                  '{{link}}': link,
                  '{{date}}': this.config.date,
                  '{{time}}': this.config.time,
                  '{{location}}': this.config.location,
                  '{{cost}}': this.config.cost,
                  '{{hosts}}': this.config.hosts,
                  '{{secretSantaLimit}}': this.config.secretSantaLimit.toString(),
                  '{{guestCount}}': attendingCount.toString(),
                  '{{food}}': p.food?.name || 'noch nichts eingetragen',
                  '{{plusOne}}': p.plusOne || 'keine'
              };

              Object.entries(replacements).forEach(([key, val]) => {
                  body = body.split(key).join(val);
                  subject = subject.split(key).join(val);
              });

              // Here you would call: await resend.emails.send({ to: p.email, subject, html: body ... })
              console.log(`To: ${p.email} | Subject: ${subject}`);
              // console.log(body); // Uncomment to see full body
          });
          console.groupEnd();

          // Log entry
          const newLog: EmailLog = {
              id: Date.now().toString(),
              date: new Date().toISOString(),
              templateName: template.name,
              recipientCount: recipients.length,
              recipientsPreview: recipients.slice(0, 3).map(p => p.name).join(', ') + (recipients.length > 3 ? '...' : ''),
              status: 'sent'
          };
          this.emailLogs.push(newLog);
          this.saveLogs();

          // Simulate network delay
          setTimeout(() => resolve(true), 800);
      });
  }
}

export const dataService = new DataService();