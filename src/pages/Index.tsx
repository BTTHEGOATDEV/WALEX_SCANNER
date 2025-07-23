import Navigation from "@/components/Navigation";
import Dashboard from "@/components/Dashboard";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-20">
        <Dashboard />
      </div>
    </div>
  );
};

export default Index;
