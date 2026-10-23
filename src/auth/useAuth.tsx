import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { supabase } from 'auth/supabaseClient';

/**
 * Drop-in replacement for @auth0/auth0-react's useAuth0().
 *
 * Keeps the same call sites working (`getAccessTokenSilently`, `loginWithRedirect`,
 * `logout`, `isAuthenticated`, `user`, `isLoading`) but backs them with Supabase Auth.
 * `user` is mapped to the Auth0 field names the existing UI already reads
 * (picture / name / nickname / given_name / family_name).
 */

interface AuthContextValue {
  user: any | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  getAccessTokenSilently: () => Promise<string>;
  loginWithRedirect: (options?: { screen_hint?: 'signup' | 'login' }) => Promise<any>;
  logout: (options?: { returnTo?: string }) => Promise<any>;
  signInWithPassword: (email: string, password: string) => Promise<any>;
  signUpWithPassword: (email: string, password: string) => Promise<any>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const mapUser = (sessionUser: any) => {
  if (!sessionUser) return null;
  const meta = sessionUser.user_metadata || {};
  const firstName = meta.firstName || meta.first_name || '';
  const lastName = meta.lastName || meta.last_name || '';
  return {
    sub: sessionUser.id,
    id: sessionUser.id,
    email: sessionUser.email,
    email_verified: Boolean(sessionUser.email_confirmed_at),
    picture: meta.avatar_url || meta.photo || '',
    name: `${firstName} ${lastName}`.trim() || meta.username || sessionUser.email,
    nickname: meta.username || '',
    given_name: firstName,
    family_name: lastName,
    user_metadata: meta,
  };
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const history = useHistory();

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session ?? null);
      setIsLoading(false);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((event, nextSession) => {
      setSession(nextSession ?? null);
      setIsLoading(false);
      // Returning from an email-confirmation link drops the tokens in the URL hash.
      if (event === 'SIGNED_IN' && nextSession && window.location.hash.includes('access_token')) {
        history.replace(window.location.pathname + window.location.search);
      }
    });

    return () => {
      mounted = false;
      subscription?.subscription?.unsubscribe?.();
    };
  }, [history]);

  const getAccessTokenSilently = useCallback(async () => {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    if (data.session?.access_token) return data.session.access_token;

    const { data: refreshed, error: refreshError } = await supabase.auth.refreshSession();
    if (refreshError) throw refreshError;
    if (!refreshed.session?.access_token) {
      throw new Error('Not authenticated');
    }
    return refreshed.session.access_token;
  }, []);

  /**
   * Auth0's loginWithRedirect sent users to a hosted page. With Supabase the
   * form is rendered in-app (components/auth/AuthForm.tsx), so these now just
   * route to it. Kept async to match the Auth0 signature.
   */
  const loginWithRedirect = useCallback(
    async (options?: { screen_hint?: 'signup' | 'login' }) => {
      history.push(options?.screen_hint === 'signup' ? '/login?mode=signup' : '/login');
    },
    [history]
  );

  const signInWithPassword = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }, []);

  const signUpWithPassword = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    return data;
  }, []);

  const logout = useCallback(
    async (options?: { returnTo?: string }) => {
      await supabase.auth.signOut();
      setSession(null);
      history.replace(options?.returnTo || '/');
      return undefined;
    },
    [history]
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user: mapUser(session?.user),
      isAuthenticated: Boolean(session?.user),
      isLoading,
      getAccessTokenSilently,
      loginWithRedirect,
      logout,
      signInWithPassword,
      signUpWithPassword,
    }),
    [session, isLoading, getAccessTokenSilently, loginWithRedirect, logout, signInWithPassword, signUpWithPassword]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};
