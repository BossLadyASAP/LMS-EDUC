import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Download, ChevronDown } from "lucide-react";
import { toast } from "sonner";

interface LessonViewerProps {
  lessonId: number;
  contentType: "pdf" | "video";
  contentUrl: string;
  title: string;
  onComplete?: () => void;
}

export function LessonViewer({
  lessonId,
  contentType,
  contentUrl,
  title,
  onComplete,
}: LessonViewerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showQuizPrompt, setShowQuizPrompt] = useState(false);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [contentUrl]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6 bg-red-50 border-red-200">
        <p className="text-red-700">{error}</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Content Viewer */}
      <Card className="overflow-hidden bg-gray-900">
        {contentType === "pdf" ? (
          <div className="bg-gray-50 p-4 text-center">
            <p className="text-gray-600 mb-4">PDF Viewer</p>
            <div className="bg-white rounded h-96 flex items-center justify-center border border-gray-200">
              <div className="text-center">
                <p className="text-gray-600 mb-4">PDF content would be displayed here</p>
                <Button variant="outline" size="sm" className="gap-2">
                  <Download className="w-4 h-4" />
                  Download PDF
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-black aspect-video flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-400 mb-4">Video Player</p>
              <p className="text-sm text-gray-500">Video content would be displayed here</p>
            </div>
          </div>
        )}
      </Card>

      {/* Lesson Info */}
      <Card className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{title}</h2>
        <p className="text-gray-600 mb-6">
          {contentType === "pdf"
            ? "This lesson contains a PDF document. Read through the material carefully."
            : "This lesson contains a video. Watch the video to understand the concepts."}
        </p>

        {/* Quiz Prompt */}
        {!showQuizPrompt ? (
          <Button
            onClick={() => setShowQuizPrompt(true)}
            size="lg"
            className="w-full gap-2"
          >
            Take Quiz
            <ChevronDown className="w-5 h-5" />
          </Button>
        ) : (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900 mb-4">
              Ready to test your knowledge? Complete the quiz to mark this lesson as done.
            </p>
            <Button className="w-full">Start Quiz</Button>
          </div>
        )}
      </Card>

      {/* Completion Info */}
      <Card className="p-4 bg-amber-50 border-amber-200">
        <p className="text-sm text-amber-900">
          ℹ️ You must complete the quiz to mark this lesson as finished. Your progress will be tracked.
        </p>
      </Card>
    </div>
  );
}
