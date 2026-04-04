import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

/**
 * =====================================================
 * Admin Login Credentials
 * =====================================================
 * Email:    admin@birthday.com
 * Password: 06041996
 *
 * Admin abilities:
 *   • Delete any photo
 *   • Delete any wish
 *   • Clear all wishes
 *   • Clear all photos
 *
 * Normal users can:
 *   • Delete only their own photos
 *   • Delete only their own wishes
 * =====================================================
 */

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const isAdmin =
    !!user?.email && !!import.meta.env.VITE_ADMIN_EMAIL && user.email === import.meta.env.VITE_ADMIN_EMAIL;

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return { user, loading, isAdmin, signOut };
};
