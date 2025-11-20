export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      email_logs: {
        Row: {
          date: string
          id: string
          recipient_count: number
          recipients_preview: string | null
          status: string
          template_name: string
        }
        Insert: {
          date?: string
          id: string
          recipient_count: number
          recipients_preview?: string | null
          status: string
          template_name: string
        }
        Update: {
          date?: string
          id?: string
          recipient_count?: number
          recipients_preview?: string | null
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_templates: {
        Row: {
          body: string
          description: string | null
          id: string
          name: string
          subject: string
          trigger: string
        }
        Insert: {
          body: string
          description?: string | null
          id: string
          name: string
          subject: string
          trigger: string
        }
        Update: {
          body?: string
          description?: string | null
          id?: string
          name?: string
          subject?: string
          trigger?: string
        }
        Relationships: []
      }
      event_config: {
        Row: {
          allow_plus_one: boolean | null
          contact_email: string | null
          cost: string | null
          date: string | null
          dietary_options: string[] | null
          hosts: string | null
          id: number
          location: string | null
          max_guests: number | null
          program: string | null
          rsvp_deadline: string | null
          secret_santa_limit: number | null
          subtitle: string | null
          time: string | null
          title: string
        }
        Insert: {
          allow_plus_one?: boolean | null
          contact_email?: string | null
          cost?: string | null
          date?: string | null
          dietary_options?: string[] | null
          hosts?: string | null
          id: number
          location?: string | null
          max_guests?: number | null
          program?: string | null
          rsvp_deadline?: string | null
          secret_santa_limit?: number | null
          subtitle?: string | null
          time?: string | null
          title: string
        }
        Update: {
          allow_plus_one?: boolean | null
          contact_email?: string | null
          cost?: string | null
          date?: string | null
          dietary_options?: string[] | null
          hosts?: string | null
          id?: number
          location?: string | null
          max_guests?: number | null
          program?: string | null
          rsvp_deadline?: string | null
          secret_santa_limit?: number | null
          subtitle?: string | null
          time?: string | null
          title?: string
        }
        Relationships: []
      }
      participants: {
        Row: {
          allergies: string | null
          avatar_image: string | null
          avatar_seed: string | null
          avatar_style: string | null
          contribution: string | null
          email: string
          food_category: string | null
          food_contains_alcohol: boolean | null
          food_contains_nuts: boolean | null
          food_description: string | null
          food_is_gluten_free: boolean | null
          food_is_lactose_free: boolean | null
          food_is_vegan: boolean | null
          food_name: string | null
          id: string
          is_secret_santa: boolean | null
          last_updated: string | null
          name: string
          notes: string | null
          plus_one: string | null
          plus_one_allergies: string | null
          show_name_in_buffet: boolean | null
          status: string
          wants_invoice: boolean | null
        }
        Insert: {
          allergies?: string | null
          avatar_image?: string | null
          avatar_seed?: string | null
          avatar_style?: string | null
          contribution?: string | null
          email: string
          food_category?: string | null
          food_contains_alcohol?: boolean | null
          food_contains_nuts?: boolean | null
          food_description?: string | null
          food_is_gluten_free?: boolean | null
          food_is_lactose_free?: boolean | null
          food_is_vegan?: boolean | null
          food_name?: string | null
          id: string
          is_secret_santa?: boolean | null
          last_updated?: string | null
          name: string
          notes?: string | null
          plus_one?: string | null
          plus_one_allergies?: string | null
          show_name_in_buffet?: boolean | null
          status?: string
          wants_invoice?: boolean | null
        }
        Update: {
          allergies?: string | null
          avatar_image?: string | null
          avatar_seed?: string | null
          avatar_style?: string | null
          contribution?: string | null
          email?: string
          food_category?: string | null
          food_contains_alcohol?: boolean | null
          food_contains_nuts?: boolean | null
          food_description?: string | null
          food_is_gluten_free?: boolean | null
          food_is_lactose_free?: boolean | null
          food_is_vegan?: boolean | null
          food_name?: string | null
          id?: string
          is_secret_santa?: boolean | null
          last_updated?: string | null
          name?: string
          notes?: string | null
          plus_one?: string | null
          plus_one_allergies?: string | null
          show_name_in_buffet?: boolean | null
          status?: string
          wants_invoice?: boolean | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}


