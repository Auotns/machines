/**
 * Environment Configuration Example
 * 
 * Copy this file to environment.ts and fill in your Supabase credentials
 * 
 * Steps:
 * 1. Create a Supabase project at https://supabase.com
 * 2. Go to Project Settings > API
 * 3. Copy your Project URL and anon/public key
 * 4. Replace the placeholders below
 * 5. Run SQL migrations from /database folder
 */

export const environment = {
  production: false,
  
  /**
   * Enable mock data mode (for development without Supabase)
   * - true: Uses local mock data (no backend required)
   * - false: Connects to Supabase backend
   */
  enableMockData: false,
  
  /**
   * Supabase Configuration
   * Get these values from: https://supabase.com/dashboard/project/_/settings/api
   */
  supabase: {
    /**
     * Project URL
     * Format: https://xxxxxxxxxxxxx.supabase.co
     */
    url: 'YOUR_SUPABASE_PROJECT_URL',
    
    /**
     * Anon/Public Key
     * This is safe to use in client-side code
     */
    anonKey: 'YOUR_SUPABASE_ANON_KEY',
  },
};

/**
 * Example configuration:
 * 
 * export const environment = {
 *   production: false,
 *   enableMockData: false,
 *   supabase: {
 *     url: 'https://qqkcnogssccsekhemyua.supabase.co',
 *     anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
 *   },
 * };
 */
