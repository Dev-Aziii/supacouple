import { supabase } from '../supabase/client';
import { normalizeError } from '../errors';
import type { User, Session, SignUpWithPasswordCredentials, SignInWithPasswordCredentials } from '@supabase/supabase-js';

export interface AuthResponse<T = unknown> {
  data: T | null;
  error: Error | null;
}

export class AuthService {
  /**
   * Sign in user with email and password credentials.
   */
  async signIn(credentials: SignInWithPasswordCredentials): Promise<AuthResponse<{ user: User | null; session: Session | null }>> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword(credentials);
      if (error) throw normalizeError(error);
      return { data, error: null };
    } catch (err) {
      return { data: null, error: normalizeError(err) };
    }
  }

  /**
   * Sign up a new user with email, password, and optional user metadata.
   */
  async signUp(credentials: SignUpWithPasswordCredentials): Promise<AuthResponse<{ user: User | null; session: Session | null }>> {
    try {
      const { data, error } = await supabase.auth.signUp(credentials);
      if (error) throw normalizeError(error);
      return { data, error: null };
    } catch (err) {
      return { data: null, error: normalizeError(err) };
    }
  }

  /**
   * Sign out the currently authenticated user.
   */
  async signOut(): Promise<AuthResponse<null>> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw normalizeError(error);
      return { data: null, error: null };
    } catch (err) {
      return { data: null, error: normalizeError(err) };
    }
  }

  /**
   * Retrieve the current authenticated user from local state or server validation.
   */
  async getCurrentUser(): Promise<AuthResponse<User | null>> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw normalizeError(error);
      return { data: user, error: null };
    } catch (err) {
      return { data: null, error: normalizeError(err) };
    }
  }

  /**
   * Fetch the current session.
   */
  async getSession(): Promise<AuthResponse<Session | null>> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw normalizeError(error);
      return { data: session, error: null };
    } catch (err) {
      return { data: null, error: normalizeError(err) };
    }
  }

  /**
   * Force-refresh the active session.
   */
  async refreshSession(): Promise<AuthResponse<Session | null>> {
    try {
      const { data: { session }, error } = await supabase.auth.refreshSession();
      if (error) throw normalizeError(error);
      return { data: session, error: null };
    } catch (err) {
      return { data: null, error: normalizeError(err) };
    }
  }

  /**
   * Send a password reset link to specified email address.
   */
  async resetPassword(email: string, redirectTo?: string): Promise<AuthResponse<null>> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      });
      if (error) throw normalizeError(error);
      return { data: null, error: null };
    } catch (err) {
      return { data: null, error: normalizeError(err) };
    }
  }
}

export const authService = new AuthService();
