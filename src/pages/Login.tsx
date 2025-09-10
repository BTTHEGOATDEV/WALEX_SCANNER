import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Eye, EyeOff, Bot, Lock, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [showPasswordPeek, setShowPasswordPeek] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
        duration: 2000,
      });
    } else {
      toast({
        title: "Welcome back!",
        description: "Redirecting to your dashboard...",
        duration: 2000,
      });
      navigate("/dashboard");
    }
    setIsLoading(false);
  };

  const handlePasswordToggle = () => {
    setShowPassword(!showPassword);
    setShowPasswordPeek(true);
    setTimeout(() => setShowPasswordPeek(false), 500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4 yeti-container">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Enhanced Header with Mascot */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className={`relative p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl transition-all duration-300 yeti-mascot ${showPasswordPeek ? 'password-peek' : ''}`}>
              <div className="relative">
                <Shield className="h-12 w-12 text-primary" />
                <Bot className={`absolute -top-1 -right-1 h-6 w-6 text-primary/70 yeti-eyes transition-all duration-200 ${focusedField === 'email' ? 'translate-x-1' : focusedField === 'password' ? 'translate-x-2' : ''}`} />
              </div>
              {/* Subtle glow effect */}
              <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl opacity-30 animate-pulse"></div>
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            Welcome back to BTScan
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">Sign in to your security dashboard</p>
        </div>

        <Card className={`login-card backdrop-blur-sm bg-background/95 border-primary/10 shadow-xl ${focusedField ? 'input-focused' : ''}`}>
          <CardHeader className="space-y-2">
            <CardTitle className="text-xl">Sign In</CardTitle>
            <CardDescription>
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </Label>
                <div className="input-magic">
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    className="transition-all duration-200 focus:shadow-lg focus:shadow-primary/10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Password
                </Label>
                <div className="relative input-magic">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    className="transition-all duration-200 focus:shadow-lg focus:shadow-primary/10 pr-12"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    aria-label="Toggle password visibility"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-auto p-2 hover:bg-primary/10 transition-all duration-200"
                    onClick={handlePasswordToggle}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 text-lg font-medium bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary hover:shadow-lg hover:shadow-primary/20 transition-all duration-300" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Signing in...
                  </div>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            <div className="mt-8 text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link 
                  to="/register" 
                  className="text-primary hover:underline font-medium transition-all duration-200 hover:text-primary/80"
                >
                  Sign up
                </Link>
              </p>

              <Link 
                to="/" 
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-all duration-200"
              >
                ← Back to home
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Subtle footer animation */}
        <div className="mt-8 text-center">
          <p className="text-xs text-muted-foreground/60">
            Secured by WALEXSCAN • Your security is our priority
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;