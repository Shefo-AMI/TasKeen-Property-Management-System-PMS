import React, { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { AuthForm } from "./components/auth-form";
import { MainDashboard } from "./components/main-dashboard";
import { DynamicBackground } from "./components/dynamic-background";
import { ErrorBoundary } from "./components/error-boundary";
import { SimpleAdminSetup } from "./components/simple-admin-setup";
import { AlzahiSetupWizard } from "./components/alzahi-setup-wizard";
import { supabase } from "./utils/supabase";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner";
import { startRulesEngine } from "./utils/rules-engine";
import { deploymentTestSuite } from "./utils/deployment-test-suite";
import { displaySystemStatus } from "./utils/system-status-report";

interface User {
  id: string;
  email: string;
  fullName: string;
  companyId: string;
  companyName: string;
  role: "platform_admin" | "company_admin" | "employee";
  employeeCount?: number;
  status: string;
}

// Protected Route Component
function ProtectedRoute({
  children,
  isAuthenticated,
  isLoading,
}: {
  children: React.ReactNode;
  isAuthenticated: boolean;
  isLoading: boolean;
}) {
  const location = useLocation();

  if (isLoading) {
    return (
      <DynamicBackground currentPage="loading">
        <div className="min-h-screen flex items-center justify-center">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white text-center">
              Loading PropertyFlow...
            </p>
          </div>
        </div>
      </DynamicBackground>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    );
  }

  return <>{children}</>;
}

// Auth Route Component
function AuthRoute({
  children,
  isAuthenticated,
  isLoading,
}: {
  children: React.ReactNode;
  isAuthenticated: boolean;
  isLoading: boolean;
}) {
  const location = useLocation();
  const from =
    (location.state as any)?.from?.pathname || "/dashboard";

  if (isLoading) {
    return (
      <DynamicBackground currentPage="loading">
        <div className="min-h-screen flex items-center justify-center">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white text-center">
              Loading PropertyFlow...
            </p>
          </div>
        </div>
      </DynamicBackground>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  return <>{children}</>;
}

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(
    null,
  );
  const [showAdminSetup, setShowAdminSetup] = useState(false);

  const checkSession = async () => {
    try {
      console.log("🔍 Checking session...");

      // Simple session check without aggressive timeout
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.log("⚠️ Session check error:", error.message);
        // Don't throw, just set as unauthenticated
        setIsAuthenticated(false);
        setUser(null);
        setAccessToken(null);
        setIsLoading(false);
        return;
      }

      console.log("📱 Session check result:", {
        hasSession: !!session,
        hasToken: !!session?.access_token,
      });

      if (session?.access_token) {
        setAccessToken(session.access_token);

        // Fetch profile in background, don't block on it
        fetchUserProfile(session.access_token)
          .then(() => {
            setIsAuthenticated(true);
            console.log(
              "✅ Session and profile loaded successfully",
            );
          })
          .catch((profileError) => {
            // Even if profile fails, session is valid so authenticate
            console.log(
              "⚠️ Profile fetch failed but session is valid, authenticating anyway",
            );
            setIsAuthenticated(true);
          })
          .finally(() => {
            setIsLoading(false);
          });
      } else {
        setIsAuthenticated(false);
        setUser(null);
        setAccessToken(null);
        setIsLoading(false);
      }
    } catch (error) {
      console.log("⚠️ Session check failed:", error);
      // Don't show error toast on initial load, just mark as unauthenticated
      setIsAuthenticated(false);
      setUser(null);
      setAccessToken(null);
      setIsLoading(false);
    }
  };

  const fetchUserProfile = async (token: string) => {
    try {
      console.log("👤 Fetching user profile...");

      // Get the current authenticated user from Supabase
      const {
        data: { user: authUser },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !authUser) {
        console.log(
          "⚠️ Could not get authenticated user:",
          userError?.message,
        );
        throw new Error("Unable to retrieve user information");
      }

      console.log("✅ Authenticated user found:", {
        id: authUser.id,
        email: authUser.email,
        role: authUser.user_metadata?.role || "company_admin",
      });

      // Create user profile from authentication data
      const userProfile: User = {
        id: authUser.id,
        email: authUser.email || "",
        fullName:
          authUser.user_metadata?.full_name ||
          authUser.user_metadata?.name ||
          authUser.email?.split("@")[0] ||
          "User",
        companyId:
          authUser.user_metadata?.company_id ||
          "default-company",
        companyName:
          authUser.user_metadata?.company_name ||
          "TasKeen P.M.S Company",
        role:
          authUser.user_metadata?.role ||
          (authUser.email === "shefo171@gmail.com"
            ? "platform_admin"
            : "company_admin"),
        employeeCount:
          authUser.user_metadata?.employee_count || 1,
        status: "active",
      };

      // Check if this is the platform admin account
      if (authUser.email === "shefo171@gmail.com") {
        userProfile.role = "platform_admin";
        userProfile.companyName = "TasKeen P.M.S Platform";
        userProfile.fullName = "Platform Administrator";
      }

      console.log("✅ User profile created:", {
        email: userProfile.email,
        role: userProfile.role,
        companyName: userProfile.companyName,
      });

      setUser(userProfile);
    } catch (error: any) {
      console.log(
        "⚠️ Error creating user profile, using fallback:",
        error.message,
      );

      // Fallback to basic user info if profile creation fails
      try {
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();
        if (authUser?.email) {
          const fallbackUser: User = {
            id: authUser.id,
            email: authUser.email,
            fullName: authUser.email.split("@")[0],
            companyId: "default-company",
            companyName: "TasKeen P.M.S Company",
            role:
              authUser.email === "shefo171@gmail.com"
                ? "platform_admin"
                : "company_admin",
            status: "active",
          };
          setUser(fallbackUser);
          console.log("✅ Using fallback user profile");
        } else {
          throw new Error("No user email available");
        }
      } catch (fallbackError) {
        console.log("⚠️ Fallback profile creation also failed");
        // Don't show error toast, just log it
        throw fallbackError;
      }
    }
  };

  const handleLogin = async (
    email: string,
    password: string,
  ) => {
    try {
      console.log("🔐 Attempting login...", { email });

      // Validate inputs
      if (!email || !password) {
        toast.error("Please enter both email and password");
        throw new Error("Missing credentials");
      }

      // Trim email and convert to lowercase
      const normalizedEmail = email.trim().toLowerCase();

      const { data, error } =
        await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        });

      if (error) {
        console.error("❌ Authentication error:", {
          message: error.message,
          status: error.status,
        });

        // Provide more specific error messages
        if (
          error.message.includes("Invalid login credentials") ||
          error.message.includes("invalid") ||
          error.status === 400
        ) {
          toast.error(
            "Invalid email or password. Please check your credentials and try again.",
            {
              duration: 5000,
            }
          );
        } else if (
          error.message.includes("Email not confirmed") ||
          error.message.includes("email_not_confirmed")
        ) {
          toast.error(
            "Please verify your email address before logging in. Check your inbox for a confirmation email.",
            {
              duration: 7000,
              action: {
                label: "Resend Email",
                onClick: async () => {
                  // Option to resend confirmation email
                  await supabase.auth.resend({
                    type: 'signup',
                    email: normalizedEmail,
                  });
                  toast.info("Confirmation email resent. Please check your inbox.");
                },
              },
            }
          );
        } else if (error.message.includes("too many")) {
          toast.error(
            "Too many login attempts. Please wait a few minutes and try again.",
          );
        } else {
          toast.error(error.message || "Login failed. Please try again.", {
            duration: 5000,
          });
        }
        throw error;
      }

      if (data.session?.access_token) {
        console.log("✅ Login successful", {
          userId: data.user?.id,
          email: data.user?.email,
        });
        setAccessToken(data.session.access_token);

        // Fetch user profile in background
        try {
          await fetchUserProfile(data.session.access_token);
          setIsAuthenticated(true);
          toast.success("Welcome back to TasKeen P.M.S!");
        } catch (profileError) {
          console.log(
            "⚠️ Profile creation failed, but authentication succeeded",
            profileError
          );
          // Still set as authenticated since auth worked
          setIsAuthenticated(true);
          toast.success("Welcome back!");
        }
      } else {
        console.error("❌ No session token received", { data });
        toast.error("Login failed - no session created. Please try again.");
        throw new Error("No session token received");
      }
    } catch (error: any) {
      console.error("💥 Login failed:", error);
      // Error already shown via toast above
      throw error;
    }
  };

  const handleRegister = async (formData: any) => {
    try {
      console.log("📝 Attempting registration...", { email: formData.email });
      
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            company_name: formData.companyName,
            role: formData.role || "company_admin",
            employee_count: formData.employeeCount || 1,
            status: "pending_approval",
          },
          emailRedirectTo: window.location.origin,
        },
      });

      if (error) {
        console.error("❌ Registration error:", error);
        
        // Provide specific error messages
        if (error.message.includes("already registered")) {
          toast.error("This email is already registered. Please try logging in instead.");
        } else if (error.message.includes("password")) {
          toast.error("Password is too weak. Please use a stronger password.");
        } else if (error.message.includes("email")) {
          toast.error("Invalid email address. Please check and try again.");
        } else {
          toast.error(error.message || "Registration failed. Please try again.");
        }
        throw error;
      }

      if (data.user) {
        console.log("✅ Registration successful:", data.user.id);
        
        // Check if email confirmation is required
        if (data.session) {
          // User is automatically logged in (email confirmation disabled)
          setAccessToken(data.session.access_token);
          await fetchUserProfile(data.session.access_token);
          setIsAuthenticated(true);
          toast.success("Registration successful! Welcome to TasKeen P.M.S.");
        } else {
          // Email confirmation required
          toast.success(
            "Registration successful! Please check your email to confirm your account.",
            {
              duration: 5000,
            }
          );
        }
        return { success: true, user: data.user };
      } else {
        throw new Error("No user data received from registration");
      }
    } catch (error: any) {
      console.error("💥 Registration failed:", error);
      // Error already shown via toast above
      throw error;
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setIsAuthenticated(false);
      setUser(null);
      setAccessToken(null);
      navigate("/login");
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Logout failed");
    }
  };

  useEffect(() => {
    let isMounted = true;

    const safeCheckSession = async () => {
      if (isMounted) {
        await checkSession();
      }
    };

    safeCheckSession();

    // Start automated rules engine for lease alerts & payment reminders
    if (isMounted) {
      console.log("🚀 Starting TasKeen P.M.S. Rules Engine...");
      startRulesEngine();

      // Display system status and make test suite available
      displaySystemStatus();
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;

        console.log("🔄 Auth state change:", event);

        if (event === "SIGNED_IN" && session?.access_token) {
          setAccessToken(session.access_token);
          fetchUserProfile(session.access_token)
            .then(() => {
              if (isMounted) {
                setIsAuthenticated(true);
              }
            })
            .catch((profileError) => {
              console.log(
                "⚠️ Profile fetch failed in auth state change, but user is authenticated",
              );
              if (isMounted) {
                setIsAuthenticated(true);
              }
            });
        } else if (event === "SIGNED_OUT") {
          if (isMounted) {
            setIsAuthenticated(false);
            setUser(null);
            setAccessToken(null);
          }
        } else if (
          event === "TOKEN_REFRESHED" &&
          session?.access_token
        ) {
          console.log("🔄 Token refreshed");
          if (isMounted) {
            setAccessToken(session.access_token);
          }
        }
      },
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <ErrorBoundary>
      <Routes>
        {/* Auth Routes */}
        <Route
          path="/login"
          element={
            <AuthRoute
              isAuthenticated={isAuthenticated}
              isLoading={isLoading}
            >
              <DynamicBackground currentPage="auth">
                <AuthForm
                  onLogin={handleLogin}
                  onRegister={handleRegister}
                  onShowAdminSetup={() =>
                    setShowAdminSetup(true)
                  }
                />
                <Toaster />
              </DynamicBackground>
            </AuthRoute>
          }
        />

        <Route
          path="/admin-setup"
          element={
            <AuthRoute
              isAuthenticated={isAuthenticated}
              isLoading={isLoading}
            >
              <DynamicBackground currentPage="auth">
                <SimpleAdminSetup
                  onComplete={() => {
                    setShowAdminSetup(false);
                    navigate("/login");
                  }}
                  onBack={() => {
                    setShowAdminSetup(false);
                    navigate("/login");
                  }}
                />
                <Toaster />
              </DynamicBackground>
            </AuthRoute>
          }
        />

        <Route
          path="/alzahi-setup"
          element={
            <AuthRoute
              isAuthenticated={isAuthenticated}
              isLoading={isLoading}
            >
              <DynamicBackground currentPage="auth">
                <AlzahiSetupWizard
                  onComplete={() => {
                    toast.success("ALZAHI setup complete!");
                    navigate("/login");
                  }}
                  onSkip={() => {
                    navigate("/login");
                  }}
                />
                <Toaster />
              </DynamicBackground>
            </AuthRoute>
          }
        />

        {/* Protected Routes - All dashboard routes */}
        <Route
          path="/dashboard/*"
          element={
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              isLoading={isLoading}
            >
              {user ? (
                <>
                  <MainDashboard
                    user={user}
                    accessToken={accessToken}
                    onLogout={handleLogout}
                  />
                  <Toaster />
                </>
              ) : (
                <div className="min-h-screen flex items-center justify-center bg-background">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground font-semibold">
                      Loading your profile...
                    </p>
                  </div>
                </div>
              )}
            </ProtectedRoute>
          }
        />

        {/* Redirect root to dashboard or login */}
        <Route
          path="/"
          element={
            isLoading ? (
              <DynamicBackground currentPage="loading">
                <div className="min-h-screen flex items-center justify-center">
                  <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                    <p className="text-white text-center">
                      Loading PropertyFlow...
                    </p>
                  </div>
                </div>
              </DynamicBackground>
            ) : (
              <Navigate
                to={isAuthenticated ? "/dashboard" : "/login"}
                replace
              />
            )
          }
        />

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ErrorBoundary>
  );
}

// Main App Component with Router
export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
