import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LessonViewer } from "@/components/LessonViewer";
import { QuizInterface } from "@/components/QuizInterface";
import { ArrowLeft, BookOpen, LogOut } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function StudentLessonPage() {
  const [, navigate] = useLocation();
  const { user, logout } = useAuth();
  const [showQuiz, setShowQuiz] = useState(false);

  // Get lesson ID from URL (simplified - in real app use useParams)
  const lessonId = 1; // TODO: Get from URL params

  // Fetch lesson content
  const { data: lessonData } = trpc.student.lessons.getContent.useQuery({
    lessonId,
  });

  // Fetch quiz
  const { data: quizData } = trpc.student.quizzes.get.useQuery({
    lessonId,
  });

  // Submit quiz mutation
  const submitQuizMutation = trpc.student.quizzes.submit.useMutation({
    onSuccess: (result) => {
      if (result.passed) {
        toast.success("Quiz passed! Lesson marked as complete.");
        // Navigate back after a delay
        setTimeout(() => navigate("/student/dashboard"), 2000);
      } else {
        toast.error("Quiz failed. Please try again.");
      }
    },
    onError: () => {
      toast.error("Failed to submit quiz");
    },
  });

  const handleLogout = async () => {
    await logout();
  };

  const handleQuizSubmit = async (score: number, passed: boolean) => {
    if (!quizData?.quiz) return;

    await submitQuizMutation.mutateAsync({
      quizId: quizData.quiz.id,
      lessonId,
      answers: [], // TODO: Get from quiz interface
    });
  };

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
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Button
          variant="outline"
          onClick={() => navigate("/student/dashboard")}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Courses
        </Button>

        {/* Lesson Content */}
        {lessonData?.lesson && (
          <>
            {!showQuiz ? (
              <>
                <LessonViewer
                  lessonId={lessonId}
                  contentType={lessonData.lesson.contentType as "pdf" | "video"}
                  contentUrl={lessonData.presignedUrl || ""}
                  title={lessonData.lesson.title}
                  onComplete={() => setShowQuiz(true)}
                />
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Quiz: {lessonData.lesson.title}
                </h2>

                {quizData?.questions && quizData.questions.length > 0 ? (
                  <QuizInterface
                    quizId={quizData.quiz?.id || 1}
                    lessonId={lessonId}
                    questions={quizData.questions.map((q: any) => ({
                      id: q.id,
                      question: q.question,
                      options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
                      correctOptionIndex: q.correctOptionIndex,
                    }))}
                    onSubmit={handleQuizSubmit}
                  />
                ) : (
                  <Card className="p-8 text-center">
                    <p className="text-gray-600">No quiz available for this lesson</p>
                    <Button
                      onClick={() => navigate("/student/dashboard")}
                      className="mt-4"
                    >
                      Back to Dashboard
                    </Button>
                  </Card>
                )}
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}
