import { createClient, SupabaseClient } from '@supabase/supabase-js';

const getSupabaseUrl = (): string => {
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SUPABASE_URL) {
      return import.meta.env.VITE_SUPABASE_URL.trim();
    }
  } catch {
    // fallback to process.env
  }
  try {
    if (typeof process !== 'undefined' && process.env && process.env.VITE_SUPABASE_URL) {
      return process.env.VITE_SUPABASE_URL.trim();
    }
  } catch {
    // fallback
  }
  return '';
};

const getSupabaseAnonKey = (): string => {
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SUPABASE_ANON_KEY) {
      return import.meta.env.VITE_SUPABASE_ANON_KEY.trim();
    }
  } catch {
    // fallback to process.env
  }
  try {
    if (typeof process !== 'undefined' && process.env && process.env.VITE_SUPABASE_ANON_KEY) {
      return process.env.VITE_SUPABASE_ANON_KEY.trim();
    }
  } catch {
    // fallback
  }
  return '';
};

const supabaseUrl = getSupabaseUrl();
const supabaseAnonKey = getSupabaseAnonKey();

export interface SupabaseConfigStatus {
  isConfigured: boolean;
  hasUrl: boolean;
  hasAnonKey: boolean;
  missingVariables: string[];
  issues: string[];
}

export const checkSupabaseConfiguration = (): SupabaseConfigStatus => {
  const missingVariables: string[] = [];
  const issues: string[] = [];

  if (!supabaseUrl) {
    missingVariables.push('VITE_SUPABASE_URL');
  } else if (!supabaseUrl.startsWith('https://')) {
    issues.push('VITE_SUPABASE_URL must start with https://');
  } else if (supabaseUrl.includes('YOUR-PROJECT')) {
    issues.push('VITE_SUPABASE_URL contains placeholder value');
  }

  if (!supabaseAnonKey) {
    missingVariables.push('VITE_SUPABASE_ANON_KEY');
  } else if (supabaseAnonKey === 'your-anon-public-key' || supabaseAnonKey.length < 20) {
    issues.push('VITE_SUPABASE_ANON_KEY is invalid or placeholder');
  }

  const isConfigured = missingVariables.length === 0 && issues.length === 0;

  return {
    isConfigured,
    hasUrl: Boolean(supabaseUrl),
    hasAnonKey: Boolean(supabaseAnonKey),
    missingVariables,
    issues,
  };
};

export const configStatus = checkSupabaseConfiguration();

if (!configStatus.isConfigured) {
  if (configStatus.missingVariables.length > 0) {
    console.warn(
      `[Supabase Client] Missing required environment variable(s): ${configStatus.missingVariables.join(', ')}. Please check your .env / .env.local file.`
    );
  }
  if (configStatus.issues.length > 0) {
    console.warn(
      `[Supabase Client] Configuration issue(s) detected: ${configStatus.issues.join('; ')}.`
    );
  }
} else {
  console.log('[Supabase Client] Configured successfully with endpoint:', supabaseUrl.replace(/^(https:\/\/[^.]+).*/, '$1.supabase.co'));
}

export const isSupabaseConfigured = configStatus.isConfigured;

let supabaseInstance: SupabaseClient | null = null;

if (isSupabaseConfigured) {
  try {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  } catch (error) {
    console.error('[Supabase Client] Initialization failed:', error);
    supabaseInstance = null;
  }
}

export const supabase = supabaseInstance;
