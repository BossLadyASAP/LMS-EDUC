import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, BookOpen, Users, Award, ArrowRight } from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";
import { toast } from "sonner";

type Mode = "login" | "register";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [mode, setMode] = useState<Mode>("login");
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
    role: "student" as "student" | "teacher" | "promoter",
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Loader2 className="animate-spin w-8 h-8 text-blue-600" />
      </div>
    );
  }

  // Already logged in — redirect to correct dashboard
  if (isAuthenticated && user) {
    const roleRoutes: Record<string, string> = {
      student: "/student/dashboard",
      teacher: "/teacher/dashboard",
      promoter: "/promoter/dashboard",
    };
    navigate(roleRoutes[user.role] || "/student/dashboard");
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <Loader2 className="animate-spin w-8 h-8 text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (!form.email || !form.password) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (mode === "register" && !form.name) {
      toast.error("Please enter your name");
      return;
    }

    setSubmitting(true);
    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const body =
        mode === "login"
          ? { email: form.email, password: form.password }
          : { email: form.email, password: form.password, name: form.name, role: form.role };

      const resp = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await resp.json();

      if (!resp.ok) {
        toast.error(data.error || "Something went wrong");
        return;
      }

      // Cookie is set by server — reload to trigger useAuth re-fetch
      window.location.href = "/";
    } catch {
      toast.error("Network error, please try again");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Nav */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <BookOpen className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">EduHub</span>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex flex-col lg:flex-row gap-16 items-center">
        {/* Hero */}
        <div className="flex-1">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">Welcome to EduHub</h1>
          <p className="text-xl text-gray-600 mb-10">
            A modern learning platform for teachers, students, and educators
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <BookOpen className="w-10 h-10 text-blue-600 mb-3" />
              <h3 className="font-semibold text-gray-900 mb-1">Rich Content</h3>
              <p className="text-sm text-gray-600">PDFs, videos, and interactive quizzes</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <Users className="w-10 h-10 text-green-600 mb-3" />
              <h3 className="font-semibold text-gray-900 mb-1">Collaboration</h3>
              <p className="text-sm text-gray-600">Teachers and students working together</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <Award className="w-10 h-10 text-purple-600 mb-3" />
              <h3 className="font-semibold text-gray-900 mb-1">Certification</h3>
              <p className="text-sm text-gray-600">Earn and share digital certificates</p>
            </div>
          </div>
        </div>

        {/* Auth form */}
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-8">
          <div className="flex rounded-lg overflow-hidden border border-gray-200 mb-6">
            <button
              className={`flex-1 py-2 text-sm font-medium transition-colors ${mode === "login" ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-50"}`}
              onClick={() => setMode("login")}
            >
              Sign In
            </button>
            <button
              className={`flex-1 py-2 text-sm font-medium transition-colors ${mode === "register" ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-50"}`}
              onClick={() => setMode("register")}
            >
              Register
            </button>
          </div>

          <div className="space-y-4">
            {mode === "register" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <Input
                  placeholder="Jane Smith"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              />
            </div>

            {mode === "register" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">I am a...</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value as any })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  <option value="promoter">Promoter / Admin</option>
                </select>
              </div>
            )}

            <Button onClick={handleSubmit} disabled={submitting} className="w-full gap-2">
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ArrowRight className="w-4 h-4" />
              )}
              {mode === "login" ? "Sign In" : "Create Account"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
