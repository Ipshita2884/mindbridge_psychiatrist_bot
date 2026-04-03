const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

let supabase;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('⚠️ Supabase configuration missing! Authentication will use fallback mock system.');
    // Create a dummy client that returns errors for all calls
    const dummyClient = {
        from: () => ({
            select: () => ({ eq: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }), insert: () => ({ select: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }) }) }),
            insert: () => ({ select: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }) })
        })
    };
    supabase = dummyClient;
} else {
    try {
        supabase = createClient(supabaseUrl, supabaseAnonKey);
    } catch (err) {
        console.error('❌ Failed to initialize Supabase client:', err.message);
        supabase = { from: () => ({ select: () => ({ eq: () => Promise.resolve({ data: null, error: err }) }) }) };
    }
}

module.exports = supabase;
