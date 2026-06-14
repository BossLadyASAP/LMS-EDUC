import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { BookOpen, Plus, LogOut, Trash2, Settings } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";

export default function PromoterDashboard() {
  const { user, logout } = useAuth();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    validationThreshold: 70,
  });

  // Fetch promoter's modules
  const { data: modules = [], refetch: refetchModules } = trpc.promoter.modules.list.useQuery();

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

  const handleCreateModule = async () => {
    if (!formData.title.trim()) {
      toast.error("Please enter a module title");
      return;
    }
    await createModuleMutation.mutateAsync(formData);
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-purple-600" />
            <h1 className="text-2xl font-bold text-gray-900">EduHub</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user?.name}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="gap-2"
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
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome, {user?.name}!
            </h2>
            <p className="text-gray-600">
              Manage learning modules and certifications
            </p>
          </div>

          {/* Create Module Button */}
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-5 h-5" />
                Create Module
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Module</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Module Title
                  </label>
                  <Input
                    placeholder="Enter module title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <Textarea
                    placeholder="Enter module description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={4}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
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
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Students must score above this percentage to earn certification
                  </p>
                </div>
                <Button
                  onClick={handleCreateModule}
                  disabled={createModuleMutation.isPending}
                  className="w-full"
                >
                  {createModuleMutation.isPending ? "Creating..." : "Create Module"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Modules Grid */}
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-900">Learning Modules</h3>

          {modules.length === 0 ? (
            <Card className="p-8 text-center">
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">You haven't created any modules yet.</p>
              <p className="text-sm text-gray-500 mt-2">
                Click "Create Module" to get started
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {modules.map((module) => (
                <Card
                  key={module.id}
                  className="overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 h-32" />
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {module.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      {module.description}
                    </p>
                    <div className="bg-gray-50 p-2 rounded mb-4 text-sm">
                      <span className="text-gray-600">Validation Threshold: </span>
                      <span className="font-semibold text-gray-900">
                        {module.validationThreshold}%
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button className="flex-1 gap-1" size="sm" variant="outline">
                        <Settings className="w-4 h-4" />
                        Manage
                      </Button>
                      <Button variant="outline" size="sm" className="gap-1">
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
