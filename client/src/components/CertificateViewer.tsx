import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, Share2, Award } from "lucide-react";
import { toast } from "sonner";

interface CertificateViewerProps {
  studentName: string;
  moduleName: string;
  score: number;
  issuedDate: string;
  certificateUrl: string;
  certificateId: number;
}

export function CertificateViewer({
  studentName,
  moduleName,
  score,
  issuedDate,
  certificateUrl,
  certificateId,
}: CertificateViewerProps) {
  const handleDownload = () => {
    // Create a link to download the certificate
    const link = document.createElement("a");
    link.href = certificateUrl;
    link.download = `certificate-${certificateId}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Certificate downloaded");
  };

  const handleShare = () => {
    // Copy certificate URL to clipboard
    navigator.clipboard.writeText(certificateUrl);
    toast.success("Certificate URL copied to clipboard");
  };

  return (
    <div className="space-y-6">
      {/* Certificate Preview */}
      <Card className="overflow-hidden bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200">
        <div className="p-8">
          {/* Certificate Image Placeholder */}
          <div className="bg-white rounded-lg shadow-lg p-8 text-center aspect-video flex flex-col items-center justify-center border-4 border-amber-300">
            <Award className="w-16 h-16 text-amber-500 mb-4" />
            <h2 className="text-3xl font-bold text-amber-900 mb-2">
              Certificate of Achievement
            </h2>
            <p className="text-gray-700 mb-6">{moduleName}</p>
            <p className="text-lg text-gray-800 mb-2">
              This certifies that
            </p>
            <p className="text-2xl font-bold text-amber-900 mb-6">
              {studentName}
            </p>
            <p className="text-gray-700 mb-8">
              Has successfully completed this module with a score of {score}%
            </p>
            <p className="text-sm text-gray-600">
              Issued on {new Date(issuedDate).toLocaleDateString()}
            </p>
          </div>
        </div>
      </Card>

      {/* Certificate Details */}
      <Card className="p-6">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-sm text-gray-600">Module</p>
            <p className="text-lg font-semibold text-gray-900">{moduleName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Score</p>
            <p className="text-lg font-semibold text-green-600">{score}%</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Student</p>
            <p className="text-lg font-semibold text-gray-900">{studentName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Issued Date</p>
            <p className="text-lg font-semibold text-gray-900">
              {new Date(issuedDate).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            onClick={handleDownload}
            className="flex-1 gap-2"
          >
            <Download className="w-4 h-4" />
            Download Certificate
          </Button>
          <Button
            variant="outline"
            onClick={handleShare}
            className="flex-1 gap-2"
          >
            <Share2 className="w-4 h-4" />
            Share
          </Button>
        </div>
      </Card>

      {/* Info */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <p className="text-sm text-blue-900">
          ℹ️ This certificate verifies that you have successfully completed all courses in the {moduleName} module with a score of {score}% or higher.
        </p>
      </Card>
    </div>
  );
}
