import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CertificateViewer } from "@/components/CertificateViewer";
import { ArrowLeft, Award, BookOpen, LogOut } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useState } from "react";

export default function StudentCertificatesPage() {
  const [, navigate] = useLocation();
  const { user, logout } = useAuth();
  const [selectedCertificate, setSelectedCertificate] = useState<number | null>(null);

  // Fetch student certificates
  const { data: certificates = [] } = trpc.student.certificates.list.useQuery();

  const handleLogout = async () => {
    await logout();
  };

  const selectedCert = certificates.find((c: any) => c.id === selectedCertificate);

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
          onClick={() => navigate("/student/dashboard")}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Button>

        {/* Page Title */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Award className="w-8 h-8 text-amber-500" />
            My Certificates
          </h2>
          <p className="text-gray-600 mt-2">
            View and download your earned certificates
          </p>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Certificates List */}
          <div className="lg:col-span-1">
            <Card className="p-0 overflow-hidden">
              <div className="bg-blue-50 border-b p-4">
                <h3 className="font-semibold text-gray-900">
                  Certificates ({certificates.length})
                </h3>
              </div>
              {certificates.length === 0 ? (
                <div className="p-6 text-center">
                  <Award className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600">No certificates yet</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Complete all courses in a module to earn a certificate
                  </p>
                </div>
              ) : (
                <div className="divide-y">
                  {certificates.map((cert: any) => {
                    // Fetch module details for display
                    const moduleName = cert.moduleId ? `Module ${cert.moduleId}` : "Unknown Module";
                    return (
                      <button
                        key={cert.id}
                        onClick={() => setSelectedCertificate(cert.id)}
                        className={`w-full text-left p-4 hover:bg-gray-50 transition-colors border-l-4 ${
                          selectedCertificate === cert.id
                            ? "border-blue-600 bg-blue-50"
                            : "border-transparent"
                        }`}
                      >
                        <p className="font-semibold text-gray-900 text-sm">
                          {moduleName}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          Earned
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(cert.issuedAt).toLocaleDateString()}
                        </p>
                      </button>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>

          {/* Certificate Preview */}
          <div className="lg:col-span-2">
            {selectedCert ? (
              <CertificateViewer
                studentName={user?.name || "Student"}
                moduleName={`Module ${selectedCert.moduleId}`}
                score={85} // TODO: Calculate from module courses
                issuedDate={selectedCert.issuedAt.toString()}
                certificateUrl={selectedCert.certificateImageUrl}
                certificateId={selectedCert.id}
              />
            ) : (
              <Card className="p-8 text-center h-full flex items-center justify-center">
                <div>
                  <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">
                    {certificates.length === 0
                      ? "No certificates to display"
                      : "Select a certificate to view"}
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
