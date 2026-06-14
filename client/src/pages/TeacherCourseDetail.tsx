import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LessonUploadForm } from "@/components/LessonUploadForm";
import { ArrowLeft, Plus, Trash2, Edit2, BookOpen, LogOut } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function TeacherCourseDetail() {
  const [, navigate] = useLocation();
  const { user, logout } = useAuth();
  const [isLessonFormOpen, setIsLessonFormOpen] = useState(false);

  // Get course ID from URL (simplified - in real app use useParams)
  const courseId = 1; // TODO: Get from URL params

  // Fetch course details
  const { data: course } = trpc.teacher.courses.getDetail.useQuery({ id: courseId });

  // Fetch lessons
  const { data: lessons = [], refetch: refetchLessons } = trpc.teacher.lessons.list.useQuery({
    courseId,
  });

  // Fetch student progress
  const { data: stats } = trpc.teacher.progress.getCourseStats.useQuery({ courseId });

  const handleLogout = async () => {
    await logout();
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Button
          variant="outline"
          onClick={() => navigate("/teacher/dashboard")}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Courses
        </Button>

        {/* Course Header */}
        {course && (
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{course.title}</h2>
            <p className="text-gray-600">{course.description}</p>
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="lessons" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="lessons">Lessons</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
          </TabsList>

          {/* Lessons Tab */}
          <TabsContent value="lessons" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-900">
                Course Lessons ({lessons.length})
              </h3>
              <Button
                onClick={() => setIsLessonFormOpen(true)}
                className="gap-2"
              >
                <Plus className="w-5 h-5" />
                Add Lesson
              </Button>
            </div>

            {lessons.length === 0 ? (
              <Card className="p-8 text-center">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No lessons yet</p>
                <p className="text-sm text-gray-500 mt-2">
                  Click "Add Lesson" to create your first lesson
                </p>
              </Card>
            ) : (
              <div className="space-y-3">
                {lessons.map((lesson, idx) => (
                  <Card key={lesson.id} className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-sm font-semibold">
                            {idx + 1}
                          </span>
                          <h4 className="font-semibold text-gray-900">
                            {lesson.title}
                          </h4>
                        </div>
                        <p className="text-sm text-gray-600 ml-9">
                          {lesson.contentType === "pdf" ? "📄 PDF" : "🎥 Video"}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="gap-1">
                          <Edit2 className="w-4 h-4" />
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
          </TabsContent>

          {/* Students Tab */}
          <TabsContent value="students" className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900">
              Student Progress ({stats?.students?.length || 0})
            </h3>

            {!stats?.students || stats.students.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-gray-600">No students enrolled yet</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {stats.students.map((student: any) => (
                  <Card key={student.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {student.name}
                        </p>
                        <p className="text-sm text-gray-600">{student.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-blue-600">
                          {student.progress}%
                        </p>
                        <p className="text-xs text-gray-500">Progress</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Lesson Upload Form */}
      <LessonUploadForm
        courseId={courseId}
        isOpen={isLessonFormOpen}
        onOpenChange={setIsLessonFormOpen}
        onUploadSuccess={() => refetchLessons()}
      />
    </div>
  );
}
