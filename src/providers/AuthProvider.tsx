"use client";

import type { Session, User } from "@supabase/supabase-js";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { getSafeRedirectUrl } from "@/lib/security";
import type { SignInInput, SignUpInput, UserProfile } from "@/types/auth";

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (input: SignInInput) => Promise<UserProfile | null>;
  signUp: (input: SignUpInput) => Promise<void>;
  signOut: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  refreshProfile: () => Promise<UserProfile | null>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function parseLocation(location?: string) {
  if (!location) return { city: null, district: null, province: null };
  const parts = location.split(",").map((part) => part.trim()).filter(Boolean);
  return {
    city: parts[0] ?? null,
    district: parts[1] ?? null,
    province: parts[2] ?? null,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [supabase] = useState(() => createSupabaseBrowserClient());
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(
    async (userId: string) => {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
      if (error) throw error;
      setProfile((data as UserProfile | null) ?? null);
      return (data as UserProfile | null) ?? null;
    },
    [supabase],
  );

  const refreshProfile = useCallback(async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      setProfile(null);
      return null;
    }
    return fetchProfile(data.user.id);
  }, [fetchProfile, supabase]);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(async ({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      if (data.session?.user) {
        await fetchProfile(data.session.user.id).catch(() => setProfile(null));
      }
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      if (nextSession?.user) {
        fetchProfile(nextSession.user.id).catch(() => setProfile(null));
      } else {
        setProfile(null);
      }
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [fetchProfile, supabase]);

  const signIn = useCallback(
    async ({ email, password }: SignInInput) => {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (!data.user) return null;
      return fetchProfile(data.user.id);
    },
    [fetchProfile, supabase],
  );

  const signUp = useCallback(
    async ({ fullName, email, phone, location, password }: SignUpInput) => {
      const parsedLocation = parseLocation(location);
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone,
            role: "registered_user",
            ...parsedLocation,
          },
        },
      });
      if (error) throw error;
    },
    [supabase],
  );

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setSession(null);
    setProfile(null);
  }, [supabase]);

  const sendPasswordReset = useCallback(
    async (email: string) => {
      const redirectTo = getSafeRedirectUrl("/?page=reset_password");
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
      if (error) throw error;
    },
    [supabase],
  );

  const updatePassword = useCallback(
    async (password: string) => {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
    },
    [supabase],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      profile,
      loading,
      signIn,
      signUp,
      signOut,
      sendPasswordReset,
      updatePassword,
      refreshProfile,
    }),
    [loading, profile, refreshProfile, sendPasswordReset, session, signIn, signOut, signUp, updatePassword],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    return {
      session: null,
      user: null,
      profile: null,
      loading: true,
      signIn: async () => null,
      signUp: async () => {},
      signOut: async () => {},
      sendPasswordReset: async () => {},
      updatePassword: async () => {},
      refreshProfile: async () => null,
    };
  }
  return context;
}
