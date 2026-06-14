import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Upload, FileText, Video, X } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

interface LessonUploadFormProps {
  courseId: number;
  onUploadSuccess?: (lesson: any) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LessonUploadForm({
  courseId,
  onUploadSuccess,
  isOpen,
  onOpenChange,
}: LessonUploadFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    contentType: "pdf" as "pdf" | "video",
    order: 1,
  });
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const getUploadUrl = trpc.teacher.lessons.getUploadUrl.useMutation();
  const createLesson = trpc.teacher.lessons.create.useMutation();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    const isPdf = selectedFile.type === "application/pdf";
    const isVideo = selectedFile.type.startsWith("video/");

    if (!isPdf && !isVideo) {
      toast.error("Please select a PDF or video file");
      return;
    }

    setFile(selectedFile);
    setFormData({
      ...formData,
      contentType: isPdf ? "pdf" : "video",
    });
  };

  const handleUpload = async () => {
    if (!formData.title.trim()) {
      toast.error("Please enter a lesson title");
      return;
    }

    if (!file) {
      toast.error("Please select a file");
      return;
    }

    setIsUploading(true);

    try {
      // Step 1: Get presigned S3 upload URL from server
      const contentType = formData.contentType === "pdf" ? "application/pdf" : "video/mp4";
      const { uploadUrl, storageKey } = await getUploadUrl.mutateAsync({
        courseId,
        fileName: file.name,
        contentType,
      });

      // Step 2: PUT file directly to S3 via presigned URL
      const uploadResp = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": contentType },
        body: file,
      });

      if (!uploadResp.ok) {
        throw new Error(`S3 upload failed: ${uploadResp.status}`);
      }

      // Step 3: Save lesson record to DB with the storage key
      const lesson = await createLesson.mutateAsync({
        courseId,
        title: formData.title,
        contentType: formData.contentType,
        contentPath: storageKey,
        order: formData.order,
      });

      toast.success("Lesson created successfully");
      setFormData({ title: "", contentType: "pdf", order: 1 });
      setFile(null);
      onOpenChange(false);
      onUploadSuccess?.(lesson);
    } catch (error) {
      toast.error("Failed to upload lesson");
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Lesson</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Lesson Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lesson Title
            </label>
            <Input
              placeholder="Enter lesson title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
            />
          </div>

          {/* Lesson Order */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lesson Order
            </label>
            <Input
              type="number"
              min="1"
              value={formData.order}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  order: parseInt(e.target.value) || 1,
                })
              }
            />
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Content (PDF or Video)
            </label>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
              {file ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2">
                    {formData.contentType === "pdf" ? (
                      <FileText className="w-6 h-6 text-red-500" />
                    ) : (
                      <Video className="w-6 h-6 text-blue-500" />
                    )}
                    <span className="text-sm font-medium text-gray-900">
                      {file.name}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setFile(null)}
                    className="gap-1"
                  >
                    <X className="w-4 h-4" />
                    Change File
                  </Button>
                </div>
              ) : (
                <label className="cursor-pointer space-y-2">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto" />
                  <p className="text-sm font-medium text-gray-700">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">
                    PDF or MP4 (Max 500MB)
                  </p>
                  <Input
                    type="file"
                    accept=".pdf,video/mp4"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Upload Button */}
          <Button
            onClick={handleUpload}
            disabled={isUploading || !file || !formData.title.trim()}
            className="w-full"
          >
            {isUploading ? "Uploading..." : "Create Lesson"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
