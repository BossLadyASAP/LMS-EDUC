import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { BookOpen, Plus, LogOut, Trash2, BarChart3 } from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";

export default function TeacherDashboard() {
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState({ title: "", description: "" });

  // Fetch teacher's courses
  const { data: courses = [], refetch: refetchCourses } = trpc.teacher.courses.list.useQuery();

  // Create course mutation
  const createCourseMutation = trpc.teacher.courses.create.useMutation({
    onSuccess: () => {
      toast.success("Course created successfully");
      setFormData({ title: "", description: "" });
      setIsCreateOpen(false);
      refetchCourses();
    },
    onError: (error) => {
      toast.error("Failed to create course");
    },
  });

  const handleCreateCourse = async () => {
    if (!formData.title.trim()) {
      toast.error("Please enter a course title");
      return;
    }
    await createCourseMutation.mutateAsync(formData);
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur-xl border-b border-blue-500/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              EduHub
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-blue-200">{user?.name}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/teacher/analytics")}
              className="gap-2 border-blue-500/50 text-blue-200 hover:bg-blue-500/20"
            >
              <BarChart3 className="w-4 h-4" />
              Analytics
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="gap-2 border-blue-500/50 text-blue-200 hover:bg-blue-500/20"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h2 className="text-4xl font-bold text-white mb-2">
              Welcome, {user?.name}!
            </h2>
            <p className="text-blue-200">Manage your courses and track student progress</p>
          </div>

          {/* Create Course Button */}
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 gap-2">
                <Plus className="w-5 h-5" />
                Create Course
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-900 border-blue-500/20">
              <DialogHeader>
                <DialogTitle className="text-white">Create New Course</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-blue-200 mb-1">
                    Course Title
                  </label>
                  <Input
                    placeholder="Enter course title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="bg-slate-800 border-blue-500/20 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-200 mb-1">
                    Description
                  </label>
                  <Textarea
                    placeholder="Enter course description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={4}
                    className="bg-slate-800 border-blue-500/20 text-white"
                  />
                </div>
                <Button
                  onClick={handleCreateCourse}
                  disabled={createCourseMutation.isPending}
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600"
                >
                  {createCourseMutation.isPending ? "Creating..." : "Create Course"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Courses Grid */}
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-white">Your Courses</h3>

          {courses.length === 0 ? (
            <Card className="p-8 text-center bg-slate-800/50 border-blue-500/20">
              <BookOpen className="w-12 h-12 text-blue-400 mx-auto mb-4" />
              <p className="text-blue-200">You haven't created any courses yet.</p>
              <p className="text-sm text-blue-300 mt-2">
                Click "Create Course" to get started
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <Card
                  key={course.id}
                  className="overflow-hidden hover:shadow-2xl hover:shadow-blue-500/20 transition-all border-blue-500/20 bg-slate-800/50"
                >
                  <div className="bg-gradient-to-r from-blue-600 to-cyan-600 h-32" />
                  <div className="p-4">
                    <h3 className="font-semibold text-white mb-2">
                      {course.title}
                    </h3>
                    <p className="text-sm text-blue-200 mb-4">
                      {course.description}
                    </p>
                    <div className="flex gap-2">
                      <Button className="flex-1 bg-slate-700 hover:bg-slate-600" size="sm">
                        Manage
                      </Button>
                      <Button variant="outline" size="sm" className="gap-1 border-red-500/50 text-red-400 hover:bg-red-500/20">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
