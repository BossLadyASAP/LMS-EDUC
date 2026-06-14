import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Award, BookOpen, LogOut, Download, Send } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function PromoterCertificatesPage() {
  const [, navigate] = useLocation();
  const { user, logout } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");

  // Get module ID from URL (simplified - in real app use useParams)
  const moduleId = 1; // TODO: Get from URL params

  // Fetch module details
  const { data: module } = trpc.promoter.modules.list.useQuery();
  const currentModule = module?.find((m: any) => m.id === moduleId);

  // Fetch eligible students (placeholder - TODO: implement in routers)
  const eligibleStudents: any[] = [];

  // Fetch issued certificates (placeholder - TODO: implement in routers)
  const issuedCertificates: any[] = [];

  // Generate certificate mutation
  const generateCertMutation = trpc.promoter.certificates.generate.useMutation({
    onSuccess: () => {
      toast.success("Certificate generated successfully");
    },
    onError: () => {
      toast.error("Failed to generate certificate");
    },
  });

  const handleGenerateCertificate = async (studentId: number) => {
    await generateCertMutation.mutateAsync({
      studentId,
      moduleId,
    });
  };

  const handleLogout = async () => {
    await logout();
  };

  const filteredStudents = eligibleStudents.filter((student: any) =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-blue-600" />
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
        {/* Back Button */}
        <Button
          variant="outline"
          onClick={() => navigate("/promoter/dashboard")}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Modules
        </Button>

        {/* Page Title */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Award className="w-8 h-8 text-amber-500" />
            {currentModule?.title || "Module"} - Certificates
          </h2>
          <p className="text-gray-600 mt-2">
            Manage and issue certificates for this module
          </p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="eligible" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="eligible">Eligible Students</TabsTrigger>
            <TabsTrigger value="issued">Issued Certificates</TabsTrigger>
          </TabsList>

          {/* Eligible Students Tab */}
          <TabsContent value="eligible" className="space-y-6">
            <div className="space-y-4">
              <Input
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              {filteredStudents.length === 0 ? (
                <Card className="p-8 text-center">
                  <Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    {searchTerm ? "No students found" : "No eligible students yet"}
                  </p>
                </Card>
              ) : (
                <div className="space-y-3">
                  {filteredStudents.map((student: any) => (
                    <Card key={student.id} className="p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">
                            {student.name}
                          </p>
                          <p className="text-sm text-gray-600">{student.email}</p>
                          <p className="text-sm text-green-600 mt-1">
                            ✓ Score: {student.averageScore}% (Threshold: {currentModule?.validationThreshold}%)
                          </p>
                        </div>
                        <Button
                          onClick={() => handleGenerateCertificate(student.id)}
                          disabled={generateCertMutation.isPending}
                          className="gap-2"
                        >
                          <Send className="w-4 h-4" />
                          {generateCertMutation.isPending ? "Generating..." : "Issue"}
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Issued Certificates Tab */}
          <TabsContent value="issued" className="space-y-6">
            {issuedCertificates.length === 0 ? (
              <Card className="p-8 text-center">
                <Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No certificates issued yet</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {issuedCertificates.map((cert: any) => (
                  <Card key={cert.id} className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">
                          {cert.studentName}
                        </p>
                        <p className="text-sm text-gray-600">{cert.studentEmail}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          Issued: {new Date(cert.issuedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </Button>
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
