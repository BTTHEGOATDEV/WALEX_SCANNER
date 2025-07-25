import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const VerificationSuccess = () => {
  const [searchParams] = useSearchParams();
  const [isVerifying, setIsVerifying] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleEmailVerification = async () => {
      try {
        // Get the token from URL parameters
        const token = searchParams.get('token');
        const type = searchParams.get('type');

        if (type === 'email_confirmation' && token) {
          // Verify the email with the token
          const { data, error } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: 'email'
          });

          if (error) {
            setError(error.message);
            toast({
              title: "Verification failed",
              description: error.message,
              variant: "destructive",
            });
          } else if (data.user) {
            setIsVerified(true);
            toast({
              title: "Email verified successfully!",
              description: "Your account is now active.",
            });
            
            // Redirect to dashboard after a short delay
            setTimeout(() => {
              navigate("/");
            }, 3000);
          }
        } else {
          // Check if user is already verified
          const { data: { user } } = await supabase.auth.getUser();
          if (user?.email_confirmed_at) {
            setIsVerified(true);
            setTimeout(() => navigate("/"), 2000);
          } else {
            setError("Invalid verification link");
          }
        }
      } catch (err) {
        setError("An unexpected error occurred");
        console.error("Verification error:", err);
      } finally {
        setIsVerifying(false);
      }
    };

    handleEmailVerification();
  }, [searchParams, navigate, toast]);

  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Loader2 className="h-6 w-6 text-primary animate-spin" />
            </div>
            <CardTitle>Verifying Your Email</CardTitle>
            <CardDescription>
              Please wait while we verify your email address...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-red-600">Verification Failed</CardTitle>
            <CardDescription>
              {error}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={() => navigate("/login")}
              className="w-full"
            >
              Back to Login
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate("/verify-email")}
              className="w-full"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="text-green-600">Email Verified Successfully!</CardTitle>
          <CardDescription>
            Your email has been verified and your account is now active. 
            You will be redirected to your dashboard shortly.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={() => navigate("/")}
            className="w-full"
          >
            Go to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default VerificationSuccess;