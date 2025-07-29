import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { Loader2 } from "lucide-react";

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

const AuthGuard = ({ children, requireAuth = true }: AuthGuardProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const isAuth = !!session?.user;
      
      setIsAuthenticated(isAuth);
      setIsLoading(false);

      if (requireAuth && !isAuth) {
        navigate("/");
      } else if (!requireAuth && isAuth) {
        // If user is authenticated and trying to access login/register, redirect to dashboard
        const currentPath = window.location.pathname;
        if (["/login", "/register", "/"].includes(currentPath)) {
          navigate("/dashboard");
        }
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const isAuth = !!session?.user;
      setIsAuthenticated(isAuth);
      
      if (requireAuth && !isAuth) {
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, requireAuth]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthGuard;