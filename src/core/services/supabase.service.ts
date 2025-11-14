import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

export interface Database {
  public: {
    Tables: {
      devices: {
        Row: {
          id: string;
          name: string;
          type: string;
          location: string;
          status: 'operational' | 'maintenance' | 'offline';
          manual_url: string | null;
          last_maintenance: string | null;
          next_maintenance: string;
          downtime: number;
          last_status_change: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['devices']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['devices']['Insert']>;
      };
      spare_parts: {
        Row: {
          id: string;
          name: string;
          sku: string;
          quantity: number;
          min_quantity: number;
          location: string;
          device_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['spare_parts']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['spare_parts']['Insert']>;
      };
      spare_parts_history: {
        Row: {
          id: string;
          part_id: string;
          part_name: string;
          quantity_before: number;
          quantity_after: number;
          change_type: 'increase' | 'decrease' | 'set';
          notes: string | null;
          changed_by: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['spare_parts_history']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['spare_parts_history']['Insert']>;
      };
      maintenance_logs: {
        Row: {
          id: string;
          device_id: string;
          device_name: string;
          date: string;
          technician: string;
          notes: string;
          type: 'scheduled' | 'emergency';
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['maintenance_logs']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['maintenance_logs']['Insert']>;
      };
      users: {
        Row: {
          id: string;
          email: string;
          role: 'admin' | 'technician';
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
      };
    };
  };
}

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private supabase: SupabaseClient<Database>;

  constructor() {
    this.supabase = createClient<Database>(
      environment.supabase.url,
      environment.supabase.anonKey,
      {
        auth: {
          storage: typeof window !== 'undefined' ? window.localStorage : undefined,
          storageKey: 'supabase.auth.token',
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      }
    );
  }

  /**
   * Získať Supabase klienta
   */
  getClient(): SupabaseClient<Database> {
    return this.supabase;
  }

  /**
   * Získať auth klienta
   */
  get auth() {
    return this.supabase.auth;
  }

  /**
   * Získať database klienta
   */
  get db() {
    return this.supabase;
  }

  /**
   * Získať storage klienta (pre upload súborov - manuály, fotky)
   */
  get storage() {
    return this.supabase.storage;
  }

  /**
   * Real-time subscriptions (pre live updates)
   */
  subscribeToTable<T extends keyof Database['public']['Tables']>(
    table: T,
    callback: (payload: any) => void
  ) {
    return this.supabase
      .channel(`public:${table}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: table },
        callback
      )
      .subscribe();
  }

  /**
   * Odpojenie od real-time канала
   */
  unsubscribe(subscription: any) {
    this.supabase.removeChannel(subscription);
  }
}
