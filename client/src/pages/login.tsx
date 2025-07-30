import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import WelcomeBanner from "@/components/welcome-banner";
import { Zap, User, Lock } from "lucide-react";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginForm) => {
    if (isLoading) return; // Prevent double submission
    
    setIsLoading(true);
    try {
      const user = await login(data.username, data.password);
      
      // Show success message
      toast({
        title: "Login Successful ✅",
        description: `Welcome back, ${user.username}!`,
      });
      
      // Wait a moment to ensure auth state is properly set
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Navigate based on user role
      if (user.isAdmin) {
        setLocation("/admin");
      } else {
        setLocation("/dashboard");
      }
    } catch (error: any) {
      console.error("Login submit error:", error);
      
      let errorMessage = "Login failed";
      if (error.message) {
        if (error.message.includes("गलत username")) {
          errorMessage = error.message; // Keep the Hindi message from server
        } else if (error.message.includes("Server error")) {
          errorMessage = error.message; // Keep the server error message
        } else {
          errorMessage = "कुछ गलत हुआ है - फिर से try करें";
        }
      }
      
      toast({
        title: "Login Failed ❌",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-2xl space-y-6">
        {/* Jammu Kashmir Welcome Banner */}
        <WelcomeBanner showLoginMessage={false} />
        
        <div className="flex justify-center">
          <div className="w-full max-w-md">

        <Card className="glass-card border-border/20">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl gradient-text">Welcome Back</CardTitle>
            <CardDescription>Sign in to your account to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Username</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            {...field}
                            type="text"
                            placeholder="Enter your username"
                            className="neon-input bg-dark-card border-gray-600 text-white placeholder-gray-500 pl-10"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            {...field}
                            type="password"
                            placeholder="Enter your password"
                            className="neon-input bg-dark-card border-gray-600 text-white placeholder-gray-500 pl-10"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full neo-button py-3 rounded-2xl text-white font-semibold glow-on-hover"
                >
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </Form>



            <div className="mt-6 text-center">
              <p className="text-gray-400">
                Don't have an account?{" "}
                <Link href="/register" className="text-purple-400 hover:text-purple-300 font-medium">
                  Sign up
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
