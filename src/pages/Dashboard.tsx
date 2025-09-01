import { useState, useEffect } from "react";
import EnhancedDashboard from "@/components/EnhancedDashboard";
import OnboardingGuide from "@/components/OnboardingGuide";
import { supabase } from "@/integrations/supabase/client";

const DashboardPage = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check if user has completed onboarding
      const { data: preferences } = await supabase
        .from('user_preferences')
        .select('has_completed_onboarding')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!preferences) {
        // Create initial preferences for new user
        await supabase
          .from('user_preferences')
          .insert({
            user_id: user.id,
            has_completed_onboarding: false
          });
        setShowOnboarding(true);
      } else if (!preferences.has_completed_onboarding) {
        setShowOnboarding(true);
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
    }
  };

  const handleOnboardingComplete = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('user_preferences')
        .update({ has_completed_onboarding: true })
        .eq('user_id', user.id);

      setShowOnboarding(false);
    } catch (error) {
      console.error('Error updating onboarding status:', error);
    }
  };

  return (
    <>
      <EnhancedDashboard />
      {showOnboarding && (
        <OnboardingGuide onComplete={handleOnboardingComplete} />
      )}
    </>
  );
};

export default DashboardPage;