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
  const [isAdmin, setIsAdmin] = useState(false);

  const syncAdminStatus = async (nextUser: User | null) => {
    if (!nextUser) {
      setIsAdmin(false);
      return;
    }

    const backend = supabase as unknown as {
      from: (table: string) => {
        select: (columns: string) => {
          eq: (column: string, value: string) => {
            eq: (column: string, value: string) => {
              maybeSingle: () => Promise<{ data: { role: string } | null; error: unknown }>;
            };
          };
        };
      };
    };

    const { data, error } = await backend
      .from("user_roles")
      .select("role")
      .eq("user_id", nextUser.id)
      .eq("role", "admin")
      .maybeSingle();

    if (error) {
      setIsAdmin(Boolean(nextUser.email && import.meta.env.VITE_ADMIN_EMAIL && nextUser.email === import.meta.env.VITE_ADMIN_EMAIL));
      return;
    }

    setIsAdmin(Boolean(data));
  };

  useEffect(() => {
    const syncSession = async (nextUser: User | null) => {
      setLoading(true);
      setUser(nextUser);
      await syncAdminStatus(nextUser);
      setLoading(false);
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      void syncSession(session?.user ?? null);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      void syncSession(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return { user, loading, isAdmin, signOut };
};
