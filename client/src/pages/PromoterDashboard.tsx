import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Plus, LogOut, Trash2, Settings, UserPlus, Users } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";

export default function PromoterDashboard() {
  const { user, logout } = useAuth();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isTeacherOpen, setIsTeacherOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    validationThreshold: 70,
  });
  const [teacherForm, setTeacherForm] = useState({
    email: "",
    name: "",
    password: "",
  });

  // Fetch promoter's modules
  const { data: modules = [], refetch: refetchModules } = trpc.promoter.modules.list.useQuery();
  
  // Fetch teachers
  const { data: teachers = [], refetch: refetchTeachers } = trpc.promoter.teachers.list.useQuery();

  // Create module mutation
  const createModuleMutation = trpc.promoter.modules.create.useMutation({
    onSuccess: () => {
      toast.success("Module created successfully");
      setFormData({ title: "", description: "", validationThreshold: 70 });
      setIsCreateOpen(false);
      refetchModules();
    },
    onError: (error) => {
      toast.error("Failed to create module");
    },
  });

  // Create teacher mutation
  const createTeacherMutation = trpc.promoter.teachers.create.useMutation({
    onSuccess: () => {
      toast.success("Teacher added successfully");
      setTeacherForm({ email: "", name: "", password: "" });
      setIsTeacherOpen(false);
      refetchTeachers();
    },
    onError: (error) => {
      toast.error("Failed to add teacher");
    },
  });

  const handleCreateModule = async () => {
    if (!formData.title.trim()) {
      toast.error("Please enter a module title");
      return;
    }
    await createModuleMutation.mutateAsync(formData);
  };

  const handleCreateTeacher = async () => {
    if (!teacherForm.email.trim() || !teacherForm.name.trim() || !teacherForm.password.trim()) {
      toast.error("Please fill in all teacher fields");
      return;
    }
    if (teacherForm.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    await createTeacherMutation.mutateAsync(teacherForm);
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur-xl border-b border-purple-500/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              EduHub
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-purple-200">{user?.name}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="gap-2 border-purple-500/50 text-purple-200 hover:bg-purple-500/20"
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
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-white mb-2">
            Welcome, {user?.name}!
          </h2>
          <p className="text-purple-200">
            Manage learning modules, teachers, and certifications
          </p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="modules" className="space-y-6">
          <TabsList className="bg-slate-800/50 border border-purple-500/20">
            <TabsTrigger value="modules" className="data-[state=active]:bg-purple-600">
              <BookOpen className="w-4 h-4 mr-2" />
              Modules
            </TabsTrigger>
            <TabsTrigger value="teachers" className="data-[state=active]:bg-purple-600">
              <Users className="w-4 h-4 mr-2" />
              Teachers
            </TabsTrigger>
          </TabsList>

          {/* Modules Tab */}
          <TabsContent value="modules" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-white">Learning Modules</h3>
              <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 gap-2">
                    <Plus className="w-5 h-5" />
                    Create Module
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-slate-900 border-purple-500/20">
                  <DialogHeader>
                    <DialogTitle className="text-white">Create New Module</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-purple-200 mb-1">
                        Module Title
                      </label>
                      <Input
                        placeholder="Enter module title"
                        value={formData.title}
                        onChange={(e) =>
                          setFormData({ ...formData, title: e.target.value })
                        }
                        className="bg-slate-800 border-purple-500/20 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-purple-200 mb-1">
                        Description
                      </label>
                      <Textarea
                        placeholder="Enter module description"
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({ ...formData, description: e.target.value })
                        }
                        rows={4}
                        className="bg-slate-800 border-purple-500/20 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-purple-200 mb-1">
                        Validation Threshold (%)
                      </label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={formData.validationThreshold}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            validationThreshold: parseInt(e.target.value) || 70,
                          })
                        }
                        className="bg-slate-800 border-purple-500/20 text-white"
                      />
                      <p className="text-xs text-purple-300 mt-1">
                        Students must score above this percentage to earn certification
                      </p>
                    </div>
                    <Button
                      onClick={handleCreateModule}
                      disabled={createModuleMutation.isPending}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
                    >
                      {createModuleMutation.isPending ? "Creating..." : "Create Module"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {modules.length === 0 ? (
              <Card className="p-8 text-center bg-slate-800/50 border-purple-500/20">
                <BookOpen className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                <p className="text-purple-200">You haven't created any modules yet.</p>
                <p className="text-sm text-purple-300 mt-2">
                  Click "Create Module" to get started
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {modules.map((module) => (
                  <Card
                    key={module.id}
                    className="overflow-hidden hover:shadow-2xl hover:shadow-purple-500/20 transition-all border-purple-500/20 bg-slate-800/50"
                  >
                    <div className="bg-gradient-to-r from-purple-600 to-pink-600 h-32" />
                    <div className="p-4">
                      <h3 className="font-semibold text-white mb-2">
                        {module.title}
                      </h3>
                      <p className="text-sm text-purple-200 mb-3">
                        {module.description}
                      </p>
                      <div className="bg-slate-900/50 p-2 rounded mb-4 text-sm border border-purple-500/20">
                        <span className="text-purple-300">Validation Threshold: </span>
                        <span className="font-semibold text-white">
                          {module.validationThreshold}%
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button className="flex-1 gap-1 bg-slate-700 hover:bg-slate-600" size="sm" variant="outline">
                          <Settings className="w-4 h-4" />
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
          </TabsContent>

          {/* Teachers Tab */}
          <TabsContent value="teachers" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-white">Teachers</h3>
              <Dialog open={isTeacherOpen} onOpenChange={setIsTeacherOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 gap-2">
                    <UserPlus className="w-5 h-5" />
                    Add Teacher
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-slate-900 border-purple-500/20">
                  <DialogHeader>
                    <DialogTitle className="text-white">Add New Teacher</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-purple-200 mb-1">
                        Full Name
                      </label>
                      <Input
                        placeholder="John Doe"
                        value={teacherForm.name}
                        onChange={(e) =>
                          setTeacherForm({ ...teacherForm, name: e.target.value })
                        }
                        className="bg-slate-800 border-purple-500/20 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-purple-200 mb-1">
                        Email
                      </label>
                      <Input
                        type="email"
                        placeholder="teacher@example.com"
                        value={teacherForm.email}
                        onChange={(e) =>
                          setTeacherForm({ ...teacherForm, email: e.target.value })
                        }
                        className="bg-slate-800 border-purple-500/20 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-purple-200 mb-1">
                        Password
                      </label>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        value={teacherForm.password}
                        onChange={(e) =>
                          setTeacherForm({ ...teacherForm, password: e.target.value })
                        }
                        className="bg-slate-800 border-purple-500/20 text-white"
                      />
                    </div>
                    <Button
                      onClick={handleCreateTeacher}
                      disabled={createTeacherMutation.isPending}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
                    >
                      {createTeacherMutation.isPending ? "Adding..." : "Add Teacher"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {teachers.length === 0 ? (
              <Card className="p-8 text-center bg-slate-800/50 border-purple-500/20">
                <Users className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                <p className="text-purple-200">No teachers added yet.</p>
                <p className="text-sm text-purple-300 mt-2">
                  Click "Add Teacher" to get started
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {teachers.map((teacher) => (
                  <Card
                    key={teacher.id}
                    className="hover:shadow-2xl hover:shadow-purple-500/20 transition-all border-purple-500/20 bg-slate-800/50"
                  >
                    <div className="p-6">
                      <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mb-4 mx-auto">
                        <span className="text-2xl font-bold text-white">
                          {teacher.name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <h3 className="font-semibold text-white text-center mb-1">
                        {teacher.name}
                      </h3>
                      <p className="text-sm text-purple-300 text-center mb-4">
                        {teacher.email}
                      </p>
                      <div className="flex gap-2">
                        <Button className="flex-1 bg-slate-700 hover:bg-slate-600" size="sm" variant="outline">
                          View Courses
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
