import {
  Participant,
  EventConfig,
  DEFAULT_EVENT_CONFIG,
  AvatarStyle,
  EmailTemplate,
  EmailLog,
  DEFAULT_EMAIL_TEMPLATES,
  FoodItem,
  FoodCategory,
  ProgramItem,
  BuffetCategoryConfig,
  ActivityItem,
} from '../types';
import { supabase } from './supabase';

export const CONFIG_UPDATED_EVENT = 'selbst_selig_config_updated';

// Helper functions to convert between app types and database format
function participantToDb(p: Participant) {
  return {
    id: p.id,
    name: p.name,
    email: p.email,
    status: p.status,
    avatar_style: p.avatarStyle,
    avatar_seed: p.avatarSeed,
    avatar_image: p.avatarImage || null,
    plus_one: p.plusOne || null,
    plus_one_allergies: p.plusOneAllergies || null,
    food_name: p.food?.name || null,
    food_category: p.food?.category || null,
    food_description: p.food?.description || null,
    food_is_vegan: p.food?.isVegan || false,
    food_is_gluten_free: p.food?.isGlutenFree || false,
    food_is_lactose_free: p.food?.isLactoseFree || false,
    food_contains_alcohol: p.food?.containsAlcohol || false,
    food_contains_nuts: p.food?.containsNuts || false,
    show_name_in_buffet: p.showNameInBuffet !== false,
    allergies: p.allergies || null,
    contribution: p.contribution || null,
    activity_votes: p.activityVotes || [],
    notes: p.notes || null,
    last_updated: p.lastUpdated,
  };
}

function participantFromDb(row: Record<string, unknown>): Participant {
  const food: FoodItem | undefined =
    row.food_name && row.food_category
      ? {
          name: row.food_name as string,
          category: row.food_category as string,
          description: (row.food_description as string) || undefined,
          isVegan: (row.food_is_vegan as boolean) || false,
          isGlutenFree: (row.food_is_gluten_free as boolean) || false,
          isLactoseFree: (row.food_is_lactose_free as boolean) || false,
          containsAlcohol: (row.food_contains_alcohol as boolean) || false,
          containsNuts: (row.food_contains_nuts as boolean) || false,
        }
      : undefined;

  return {
    id: row.id as string,
    name: row.name as string,
    email: row.email as string,
    status: row.status as Participant['status'],
    avatarStyle: (row.avatar_style || 'micah') as AvatarStyle,
    avatarSeed: (row.avatar_seed || row.name) as string,
    avatarImage: (row.avatar_image as string) || undefined,
    plusOne: (row.plus_one as string) || undefined,
    plusOneAllergies: (row.plus_one_allergies as string) || undefined,
    food,
    showNameInBuffet: row.show_name_in_buffet !== false,
    allergies: (row.allergies as string) || undefined,
    contribution: (row.contribution as string) || undefined,
    activityVotes: (row.activity_votes as string[]) || [],
    notes: (row.notes as string) || undefined,
    lastUpdated: (row.last_updated as string) || new Date().toISOString(),
  };
}

function configToDb(c: EventConfig) {
  return {
    id: 1,
    title: c.title,
    subtitle: c.subtitle,
    date: c.date,
    time: c.time,
    location: c.location,
    max_guests: c.maxGuests,
    allow_plus_one: c.allowPlusOne,
    dietary_options: c.dietaryOptions,
    cost: c.cost,
    hosts: c.hosts,
    program: JSON.stringify(c.program), // Serialize program to JSON
    buffet_config: c.buffetConfig,
    activities: c.activities || [],
    contribution_suggestions: c.contributionSuggestions || [],
    contact_email: c.contactEmail,
    contact_phone: c.contactPhone || null,
    rsvp_deadline: c.rsvpDeadline,
  };
}

function configFromDb(row: Record<string, unknown>): EventConfig {
  // Parse program from JSON, with backward compatibility for comma-separated strings
  let program: ProgramItem[] = [];
  if (row.program) {
    try {
      const parsed = typeof row.program === 'string' ? JSON.parse(row.program) : row.program;
      if (Array.isArray(parsed)) {
        program = parsed;
      } else {
        throw new Error('Not an array');
      }
    } catch {
      // Backward compatibility: convert comma-separated string to basic ProgramItem objects
      if (typeof row.program === 'string') {
        program = row.program
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean)
          .map((title, index) => ({
            id: `item-${index}`,
            title,
            description: '',
            icon: 'Sparkles',
            color: 'text-stone-400 bg-stone-50',
          }));
      }
    }
  }

  let buffetConfig: BuffetCategoryConfig[] = DEFAULT_EVENT_CONFIG.buffetConfig;
  if (row.buffet_config) {
    // Ensure it's treated as the correct type. Supabase returns JSONB as object/array.
    buffetConfig = row.buffet_config as BuffetCategoryConfig[];
  }

  let activities: ActivityItem[] = DEFAULT_EVENT_CONFIG.activities;
  if (row.activities) {
    // Supabase returns JSONB as object/array
    activities = row.activities as ActivityItem[];
  }

  return {
    title: row.title as string,
    subtitle: (row.subtitle as string) || '',
    date: (row.date as string) || '',
    time: (row.time as string) || '',
    location: (row.location as string) || '',
    maxGuests: (row.max_guests as number) || 30,
    allowPlusOne: (row.allow_plus_one as boolean) || false,
    dietaryOptions: (row.dietary_options as string[]) || [],
    cost: (row.cost as string) || '',
    hosts: (row.hosts as string) || '',
    program,
    buffetConfig,
    activities,
    contributionSuggestions: (row.contribution_suggestions as string[]) || DEFAULT_EVENT_CONFIG.contributionSuggestions,
    contactEmail: (row.contact_email as string) || '',
    contactPhone: (row.contact_phone as string) || '',
    rsvpDeadline: (row.rsvp_deadline as string) || '',
  };
}

function templateToDb(t: EmailTemplate) {
  return {
    id: t.id,
    name: t.name,
    subject: t.subject,
    body: t.body,
    trigger: t.trigger,
    description: t.description || null,
  };
}

function templateFromDb(row: Record<string, unknown>): EmailTemplate {
  return {
    id: row.id as string,
    name: row.name as string,
    subject: row.subject as string,
    body: row.body as string,
    trigger: row.trigger as EmailTemplate['trigger'],
    description: (row.description as string) || '',
  };
}

function logFromDb(row: Record<string, unknown>): EmailLog {
  return {
    id: row.id as string,
    date: row.date as string,
    templateName: row.template_name as string,
    recipientCount: row.recipient_count as number,
    recipientsPreview: (row.recipients_preview as string) || '',
    status: row.status as 'sent' | 'failed',
  };
}

class DataService {
  // --- Participant Methods ---

  async getAll(): Promise<Participant[]> {
    const { data, error } = await supabase.from('participants').select('*').order('name');
    if (error) {
      console.error('Error fetching participants:', error);
      return [];
    }
    return (data || []).map(participantFromDb);
  }

  async getById(id: string): Promise<Participant | undefined> {
    const { data, error } = await supabase.from('participants').select('*').eq('id', id).single();
    if (error || !data) {
      return undefined;
    }
    return participantFromDb(data);
  }

  async create(name: string, email: string): Promise<Participant> {
    const newParticipant = this.createParticipantObject(name, email);
    const dbData = participantToDb(newParticipant);
    const { data, error } = await supabase.from('participants').insert(dbData).select().single();
    if (error) {
      console.error('Error creating participant:', error);
      throw error;
    }
    return participantFromDb(data);
  }

  private createParticipantObject(name: string, email: string): Participant {
    const newId =
      Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 6);
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
      contribution: '',
      lastUpdated: new Date().toISOString(),
    };
  }

  async importBatch(candidates: { name: string; email: string }[]): Promise<number> {
    const existing = await this.getAll();
    const existingEmails = new Set(existing.map((p) => p.email.toLowerCase()));

    const toInsert = candidates
      .filter((c) => c.name && c.email && !existingEmails.has(c.email.toLowerCase()))
      .map((c) => participantToDb(this.createParticipantObject(c.name, c.email)));

    if (toInsert.length === 0) return 0;

    const { error } = await supabase.from('participants').insert(toInsert);
    if (error) {
      console.error('Error importing batch:', error);
      return 0;
    }
    return toInsert.length;
  }

  async update(id: string, updates: Partial<Participant>): Promise<Participant | null> {
    const current = await this.getById(id);
    if (!current) return null;

    const updated: Participant = {
      ...current,
      ...updates,
      lastUpdated: new Date().toISOString(),
    };

    const dbData = participantToDb(updated);
    const { data, error } = await supabase
      .from('participants')
      .update(dbData)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      console.error('Error updating participant:', error);
      return null;
    }
    return participantFromDb(data);
  }

  async delete(id: string): Promise<boolean> {
    console.log('Attempting to delete participant with ID:', id);
    
    // Check authentication status
    const { data: { session } } = await supabase.auth.getSession();
    console.log('Current auth session:', session ? 'Authenticated' : 'Not authenticated');
    if (session) {
      console.log('User ID:', session.user.id);
    }
    
    // First, verify the participant exists
    const existing = await this.getById(id);
    if (!existing) {
      console.error('Participant not found with ID:', id);
      // Try to find all participants to see what IDs exist
      const all = await this.getAll();
      console.log('Available participant IDs:', all.map(p => p.id));
      return false;
    }
    
    console.log('Found participant to delete:', existing.name, existing.email);
    
    // Try to delete - Supabase will use the current session automatically
    const { data, error } = await supabase
      .from('participants')
      .delete()
      .eq('id', id)
      .select();
    
    if (error) {
      console.error('Error deleting participant:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      console.error('Error details:', JSON.stringify(error, null, 2));
      
      // Check if it's an RLS policy error
      if (error.code === '42501' || error.message?.includes('policy') || error.message?.includes('permission')) {
        console.error('RLS Policy Error: The Row Level Security policy is blocking deletion.');
        console.error('Please check your Supabase RLS policies for the participants table.');
        console.error('The policy should allow DELETE operations for authenticated users.');
      }
      return false;
    }
    
    // Check if anything was deleted
    if (data && data.length > 0) {
      console.log('Successfully deleted participant:', data[0]);
      return true;
    }
    
    // Verify deletion by checking if it still exists
    const stillExists = await this.getById(id);
    if (stillExists) {
      console.warn('Participant still exists after delete attempt.');
      console.warn('This usually means RLS policy is blocking deletion.');
      console.warn('Please check your Supabase RLS policies for the participants table.');
      console.warn('You may need to add a policy like:');
      console.warn("CREATE POLICY \"Allow authenticated delete\" ON participants FOR DELETE USING (auth.role() = 'authenticated');");
      return false;
    }
    
    console.log('Successfully deleted participant:', existing.name);
    return true;
  }

  async reset(): Promise<void> {
    const { error } = await supabase.from('participants').delete().neq('id', '');
    if (error) {
      console.error('Error resetting participants:', error);
    }
  }

  // --- Config Methods ---

  async getConfig(): Promise<EventConfig> {
    const { data, error } = await supabase.from('event_config').select('*').eq('id', 1).single();
    if (error || !data) {
      return DEFAULT_EVENT_CONFIG;
    }
    return configFromDb(data);
  }

  async updateConfig(updates: Partial<EventConfig>): Promise<EventConfig> {
    const current = await this.getConfig();
    const updated = { ...current, ...updates };
    const dbData = configToDb(updated);

    const { data, error } = await supabase.from('event_config').upsert(dbData).select().single();

    if (error || !data) {
      console.error('Error updating config:', error);
      throw error || new Error('Failed to update config');
    }

    window.dispatchEvent(new Event(CONFIG_UPDATED_EVENT));
    return configFromDb(data);
  }

  // --- Email System Methods ---

  async getEmailTemplates(): Promise<EmailTemplate[]> {
    const { data, error } = await supabase.from('email_templates').select('*').order('id');
    if (error) {
      console.error('Error fetching templates:', error);
      return DEFAULT_EMAIL_TEMPLATES;
    }
    if (!data || data.length === 0) {
      // Initialize templates if empty
      await this.initializeTemplates();
      return DEFAULT_EMAIL_TEMPLATES;
    }
    return data.map(templateFromDb);
  }

  private async initializeTemplates(): Promise<void> {
    const templates = DEFAULT_EMAIL_TEMPLATES.map(templateToDb);
    await supabase.from('email_templates').insert(templates);
  }

  async updateEmailTemplate(id: string, updates: Partial<EmailTemplate>): Promise<void> {
    const templates = await this.getEmailTemplates();
    const current = templates.find((t) => t.id === id);
    if (!current) return;

    const updated = { ...current, ...updates };
    const dbData = templateToDb(updated);

    const { error } = await supabase.from('email_templates').upsert(dbData).eq('id', id);
    if (error) {
      console.error('Error updating template:', error);
    }
  }

  async getEmailLogs(): Promise<EmailLog[]> {
    const { data, error } = await supabase
      .from('email_logs')
      .select('*')
      .order('date', { ascending: false });
    if (error) {
      console.error('Error fetching logs:', error);
      return [];
    }
    return (data || []).map(logFromDb);
  }

  async sendEmailBatch(templateId: string, recipients: Participant[]): Promise<boolean> {
    const templates = await this.getEmailTemplates();
    const template = templates.find((t) => t.id === templateId);
    if (!template || recipients.length === 0) {
      return false;
    }

    const config = await this.getConfig();
    const allParticipants = await this.getAll();
    const attendingCount = allParticipants.filter((p) => p.status === 'attending').length;

    // Prepare emails with personalized content
    const emails = recipients.map((p) => {
      let body = template.body;
      let subject = template.subject;

      const link = `${window.location.origin}/#/p/${p.id}`;
      const replacements: Record<string, string> = {
        '{{name}}': p.name.split(' ')[0],
        '{{fullname}}': p.name,
        '{{email}}': p.email,
        '{{link}}': link,
        '{{date}}': config.date,
        '{{time}}': config.time,
        '{{location}}': config.location,
        '{{cost}}': config.cost,
        '{{hosts}}': config.hosts,
        '{{guestCount}}': attendingCount.toString(),
        '{{food}}': p.food?.name || 'noch nichts eingetragen',
        '{{plusOne}}': p.plusOne || 'keine',
      };

      Object.entries(replacements).forEach(([key, val]) => {
        body = body.split(key).join(val);
        subject = subject.split(key).join(val);
      });

      return {
        to: p.email,
        subject,
        html: body.replace(/\n/g, '<br>'),
      };
    });

    try {
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: { emails },
      });

      if (error) {
        console.error('Email sending error:', error);
        throw error;
      }

      // Log entry
      const newLog = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        template_name: template.name,
        recipient_count: recipients.length,
        recipients_preview:
          recipients
            .slice(0, 3)
            .map((p) => p.name)
            .join(', ') + (recipients.length > 3 ? '...' : ''),
        status: 'sent' as const,
      };

      await supabase.from('email_logs').insert(newLog);

      return data.success;
    } catch (error) {
      console.error('Failed to send emails:', error);
      return false;
    }
  }
}

export const dataService = new DataService();
