import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    // ── 1. Synchronous auth state listener (no async work here) ──────────
    // Supabase does NOT await async onAuthStateChange handlers, so doing
    // await fetchProfile() inside it causes race conditions on sign-out.
    // We keep this handler synchronous and handle profile in a separate effect.
    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setUser(session?.user ?? null);
                if (!session?.user) setProfile(null); // clear immediately on logout
                setLoading(false);
            }
        );
        return () => subscription.unsubscribe();
    }, []);

    // ── 2. Fetch profile reactively whenever user changes ─────────────────
    useEffect(() => {
        if (!user?.id) return;
        supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()
            .then(({ data, error }) => {
                if (!error && data) setProfile(data);
            });
    }, [user?.id]);

    const signUp = async (email, password, fullName) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { full_name: fullName } },
        });
        return { data, error };
    };

    const signIn = async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        return { data, error };
    };

    // signOut just calls supabase — the synchronous onAuthStateChange handler
    // above immediately sets user=null, which clears the profile and loading.
    const signOut = async () => {
        await supabase.auth.signOut();
    };

    const refreshProfile = () => {
        if (!user?.id) return;
        supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()
            .then(({ data, error }) => {
                if (!error && data) setProfile(data);
            });
    };

    return (
        <AuthContext.Provider value={{ user, profile, loading, signIn, signUp, signOut, refreshProfile }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
