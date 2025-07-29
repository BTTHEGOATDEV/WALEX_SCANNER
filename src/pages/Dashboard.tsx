import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import Dashboard from "@/components/Dashboard";
import OnboardingGuide from "@/components/OnboardingGuide";

const DashboardPage = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    // Check if user has seen onboarding before
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }
  }, []);

  const handleOnboardingComplete = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    setShowOnboarding(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-20">
        <Dashboard />
      </div>
      {showOnboarding && (
        <OnboardingGuide onComplete={handleOnboardingComplete} />
      )}
    </div>
  );
};

export default DashboardPage;