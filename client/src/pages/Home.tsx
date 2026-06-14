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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Nav */}
      <nav className="bg-slate-900/80 backdrop-blur-xl border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              EduHub
            </span>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex flex-col lg:flex-row gap-16 items-center">
        {/* Hero */}
        <div className="flex-1">
          <h1 className="text-5xl font-bold text-white mb-6">
            Welcome to <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">EduHub</span>
          </h1>
          <p className="text-xl text-purple-200 mb-10">
            A modern learning platform for teachers, students, and educators
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-slate-800/50 backdrop-blur-xl border border-purple-500/20 p-6 rounded-2xl hover:shadow-2xl hover:shadow-purple-500/20 transition-all">
              <BookOpen className="w-10 h-10 text-purple-400 mb-3" />
              <h3 className="font-semibold text-white mb-1">Rich Content</h3>
              <p className="text-sm text-purple-200">PDFs, videos, and interactive quizzes</p>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-xl border border-purple-500/20 p-6 rounded-2xl hover:shadow-2xl hover:shadow-purple-500/20 transition-all">
              <Users className="w-10 h-10 text-green-400 mb-3" />
              <h3 className="font-semibold text-white mb-1">Collaboration</h3>
              <p className="text-sm text-purple-200">Teachers and students working together</p>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-xl border border-purple-500/20 p-6 rounded-2xl hover:shadow-2xl hover:shadow-purple-500/20 transition-all">
              <Award className="w-10 h-10 text-pink-400 mb-3" />
              <h3 className="font-semibold text-white mb-1">Certification</h3>
              <p className="text-sm text-purple-200">Earn and share digital certificates</p>
            </div>
          </div>
        </div>

        {/* Auth form */}
        <div className="w-full max-w-sm bg-slate-800/50 backdrop-blur-xl border border-purple-500/20 rounded-2xl shadow-2xl shadow-purple-500/20 p-8">
          <div className="flex rounded-lg overflow-hidden border border-purple-500/20 mb-6">
            <button
              className={`flex-1 py-2 text-sm font-medium transition-colors ${mode === "login" ? "bg-purple-600 text-white" : "text-purple-200 hover:bg-slate-700"}`}
              onClick={() => setMode("login")}
            >
              Sign In
            </button>
            <button
              className={`flex-1 py-2 text-sm font-medium transition-colors ${mode === "register" ? "bg-purple-600 text-white" : "text-purple-200 hover:bg-slate-700"}`}
              onClick={() => setMode("register")}
            >
              Register
            </button>
          </div>

          <div className="space-y-4">
            {mode === "register" && (
              <div>
                <label className="block text-sm font-medium text-purple-200 mb-1">Full Name</label>
                <Input
                  placeholder="Jane Smith"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="bg-slate-900/50 border-purple-500/20 text-white placeholder:text-purple-300/50"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-purple-200 mb-1">Email</label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="bg-slate-900/50 border-purple-500/20 text-white placeholder:text-purple-300/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-purple-200 mb-1">Password</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                className="bg-slate-900/50 border-purple-500/20 text-white placeholder:text-purple-300/50"
              />
            </div>

            {mode === "register" && (
              <div>
                <label className="block text-sm font-medium text-purple-200 mb-1">I am a...</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value as any })}
                  className="w-full bg-slate-900/50 border border-purple-500/20 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  <option value="promoter">Promoter / Admin</option>
                </select>
              </div>
            )}

            <Button onClick={handleSubmit} disabled={submitting} className="w-full gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
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
