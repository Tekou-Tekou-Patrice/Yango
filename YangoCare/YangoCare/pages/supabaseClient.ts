// supabaseClient.ts
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

const supabaseUrl = 'https://TON_PROJET_SUPABASE.supabase.co';
const supabaseAnonKey = 'TA_CLE_ANON_SUPABASE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);