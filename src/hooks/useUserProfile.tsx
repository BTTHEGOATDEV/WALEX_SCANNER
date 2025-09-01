import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface UserProfile {
  name: string;
  role: string;
  company?: string;
  email?: string;
}

export const useUserProfile = () => {
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: "",
    role: ""
  });
  const [isLoading, setIsLoading] = useState(true);

  const loadUserProfile = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setUserProfile({ name: "", role: "" });
        setIsLoading(false);
        return;
      }

      // Set default values from user data immediately to prevent flash
      const defaultProfile = {
        name: user.user_metadata?.full_name || user.email?.split('@')[0] || "User",
        role: "Member",
        email: user.email,
        company: ""
      };
      
      setUserProfile(defaultProfile);

      // Try to get profile data from profiles table
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, role, company')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (profile) {
        setUserProfile({
          name: profile.full_name || defaultProfile.name,
          role: profile.role || "Member",
          company: profile.company || "",
          email: user.email
        });
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      // Set fallback data on error
      setUserProfile({
        name: "User",
        role: "Member"
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          full_name: updates.name,
          role: updates.role,
          company: updates.company,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('Error updating profile:', error);
        return false;
      }

      // Update local state immediately for smooth UX
      setUserProfile(prev => ({
        ...prev,
        ...updates
      }));

      return true;
    } catch (error) {
      console.error('Error updating profile:', error);
      return false;
    }
  }, []);

  useEffect(() => {
    loadUserProfile();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        loadUserProfile();
      } else if (event === 'SIGNED_OUT') {
        setUserProfile({ name: "", role: "" });
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [loadUserProfile]);

  return {
    userProfile,
    isLoading,
    loadUserProfile,
    updateProfile
  };
};