import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, ArrowLeft, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { PageTransition } from "@/components/PageTransition";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { supabase } from "@/integrations/supabase/client";

const ADMIN_EMAIL = "krishnasathvikm@gmail.com";

export default function AdminLogin() {
  const navigate = useNavigate();
  const { signIn, signUp } = useAdminAuth();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [mode, setMode] = useState<"login" | "setup">("login");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await signIn(ADMIN_EMAIL, password);
      if (error) {
        if (error.message.includes("Invalid login")) {
          toast.error("Invalid password. Try again or set up admin account.");
        } else {
          toast.error(error.message);
        }
      } else {
        // Check admin role
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: roleData } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", user.id)
            .eq("role", "admin")
            .maybeSingle();
          if (roleData) {
            toast.success("Welcome, Admin!");
            navigate("/admin");
          } else {
            toast.error("You don't have admin access.");
            await supabase.auth.signOut();
          }
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }
    setLoading(true);
    try {
      // Try signing up
      const { data, error } = await signUp(ADMIN_EMAIL, password);
      if (error) {
        if (error.message.includes("already registered")) {
          toast.error("Admin account already exists. Please login.");
          setMode("login");
        } else {
          toast.error(error.message);
        }
        return;
      }
      
      if (data?.user) {
        // Assign admin role via edge function
        const { error: fnError } = await supabase.functions.invoke("assign-admin-role", {
          body: { user_id: data.user.id, email: ADMIN_EMAIL }
        });
        if (fnError) {
          toast.error("Account created but failed to assign admin role. Contact support.");
          return;
        }
        toast.success("Admin account created! You can now login.");
        setMode("login");
        setPassword("");
        setConfirmPassword("");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-sm p-6 space-y-6">
          <div className="text-center space-y-2">
            <ShieldCheck className="h-10 w-10 mx-auto text-primary" />
            <h1 className="font-display text-xl font-bold text-foreground">Admin Access</h1>
            <p className="text-sm text-muted-foreground">
              {mode === "login" ? "Enter your admin password" : "Set up your admin password"}
            </p>
          </div>

          <form onSubmit={mode === "login" ? handleLogin : handleSetup} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-muted-foreground text-xs">Email</Label>
              <Input value={ADMIN_EMAIL} disabled className="bg-muted text-sm" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
                minLength={6}
              />
            </div>
            {mode === "setup" && (
              <div className="space-y-2">
                <Label htmlFor="confirm">Confirm Password</Label>
                <Input
                  id="confirm"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  required
                />
              </div>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {mode === "login" ? "Login" : "Create Admin Account"}
            </Button>
          </form>

          <div className="text-center">
            <button
              onClick={() => setMode(mode === "login" ? "setup" : "login")}
              className="text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              {mode === "login" ? "First time? Set up admin account" : "Already set up? Login"}
            </button>
          </div>

          <div className="text-center">
            <Link to="/" className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
              <ArrowLeft className="h-3 w-3" /> Back to app
            </Link>
          </div>
        </Card>
      </div>
    </PageTransition>
  );
}
