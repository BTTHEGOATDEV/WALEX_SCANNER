import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Shield, CheckCircle, Loader2 } from "lucide-react";

const RLSSetup = () => {
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const { toast } = useToast();

  const setupRLS = async () => {
    setIsSettingUp(true);
    try {
      console.log('Setting up RLS policies...');
      
      const { data, error } = await supabase.functions.invoke('setup-rls-policies');

      if (error) {
        console.error('RLS setup error:', error);
        throw error;
      }

      console.log('RLS setup completed:', data);
      
      toast({
        title: "RLS Policies Setup Complete",
        description: "Row Level Security policies have been configured successfully.",
      });
      
      setIsComplete(true);
    } catch (error: any) {
      console.error('Error setting up RLS:', error);
      toast({
        title: "RLS Setup Failed",
        description: error.message || "Failed to setup RLS policies",
        variant: "destructive",
      });
    } finally {
      setIsSettingUp(false);
    }
  };

  if (isComplete) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="text-center">
            <CheckCircle className="h-12 w-12 text-success mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">RLS policies are now active</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Setup Row Level Security
        </CardTitle>
        <CardDescription>
          Configure security policies to ensure users can only access their own data
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={setupRLS} 
          disabled={isSettingUp}
          className="w-full"
        >
          {isSettingUp ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Setting up policies...
            </>
          ) : (
            <>
              <Shield className="h-4 w-4 mr-2" />
              Setup RLS Policies
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default RLSSetup;