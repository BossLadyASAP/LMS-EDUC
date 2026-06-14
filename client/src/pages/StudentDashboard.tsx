import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Award, LogOut, Search } from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useState } from "react";

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch student's enrolled courses
  const { data: enrolledCourses = [] } = trpc.student.courses.getEnrolled.useQuery();

  // Fetch all available courses
  const { data: allCourses = [] } = trpc.student.courses.list.useQuery();

  // Fetch student's certificates
  const { data: certificates = [] } = trpc.student.certificates.list.useQuery();

  // Fetch course progress for each enrolled course
  const enrolledCourseIds = enrolledCourses.map((e) => e.courseId);
  const progressQueries = enrolledCourseIds.map((courseId) =>
    trpc.student.progress.getCourseProgress.useQuery({ courseId })
  );

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900">
      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur-xl border-b border-green-500/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              EduHub
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-green-200">{user?.name}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/student/certificates")}
              className="gap-2 border-green-500/50 text-green-200 hover:bg-green-500/20"
            >
              <Award className="w-4 h-4" />
              Certificates
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="gap-2 border-green-500/50 text-green-200 hover:bg-green-500/20"
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
            Welcome back, {user?.name}!
          </h2>
          <p className="text-green-200">
            Continue your learning journey with our courses
          </p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="enrolled" className="space-y-6">
          <TabsList className="bg-slate-800/50 border border-green-500/20 grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="enrolled" className="data-[state=active]:bg-green-600">My Courses</TabsTrigger>
            <TabsTrigger value="explore" className="data-[state=active]:bg-green-600">Explore</TabsTrigger>
            <TabsTrigger value="certificates" className="data-[state=active]:bg-green-600">Certificates</TabsTrigger>
          </TabsList>

          {/* My Courses Tab */}
          <TabsContent value="enrolled" className="space-y-6">
            {enrolledCourses.length === 0 ? (
              <Card className="p-8 text-center bg-slate-800/50 border-green-500/20">
                <BookOpen className="w-12 h-12 text-green-400 mx-auto mb-4" />
                <p className="text-green-200">
                  You haven't enrolled in any courses yet.
                </p>
                <p className="text-sm text-green-300 mt-2">
                  Explore available courses to get started
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {enrolledCourses.map((enrollment, idx) => {
                  const course = allCourses.find((c) => c.id === enrollment.courseId);
                  const progress = progressQueries[idx]?.data;

                  return (
                    <Card
                      key={enrollment.id}
                      className="overflow-hidden hover:shadow-2xl hover:shadow-green-500/20 transition-all cursor-pointer border-green-500/20 bg-slate-800/50"
                    >
                      <div className="bg-gradient-to-r from-green-600 to-emerald-600 h-32" />
                      <div className="p-4">
                        <h3 className="font-semibold text-white mb-2">
                          {course?.title}
                        </h3>
                        <p className="text-sm text-green-200 mb-4">
                          {course?.description}
                        </p>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-green-300">Progress</span>
                            <span className="font-semibold text-white">
                              {progress?.percentage || 0}%
                            </span>
                          </div>
                          <div className="w-full bg-slate-700 rounded-full h-2">
                            <div
                              className="bg-green-600 h-2 rounded-full transition-all"
                              style={{
                                width: `${progress?.percentage || 0}%`,
                              }}
                            />
                          </div>
                        </div>
                        <Button className="w-full mt-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">Continue Learning</Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Explore Tab */}
          <TabsContent value="explore" className="space-y-6">
            <div className="relative mb-6">
              <Search className="absolute left-3 top-3 w-5 h-5 text-green-400" />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-green-500/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-white placeholder:text-green-300/50"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allCourses
                .filter(
                  (course) =>
                    !enrolledCourses.some((e) => e.courseId === course.id) &&
                    (course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      course.description?.toLowerCase().includes(searchQuery.toLowerCase()))
                )
                .map((course) => (
                  <Card
                    key={course.id}
                    className="overflow-hidden hover:shadow-2xl hover:shadow-green-500/20 transition-all border-green-500/20 bg-slate-800/50"
                  >
                    <div className="bg-gradient-to-r from-green-600 to-emerald-600 h-32" />
                    <div className="p-4">
                      <h3 className="font-semibold text-white mb-2">
                        {course.title}
                      </h3>
                      <p className="text-sm text-green-200 mb-4">
                        {course.description}
                      </p>
                      <Button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">Enroll Now</Button>
                    </div>
                  </Card>
                ))}
            </div>
          </TabsContent>

          {/* Certificates Tab */}
          <TabsContent value="certificates" className="space-y-6">
            {certificates.length === 0 ? (
              <Card className="p-8 text-center bg-slate-800/50 border-green-500/20">
                <Award className="w-12 h-12 text-green-400 mx-auto mb-4" />
                <p className="text-green-200">
                  You haven't earned any certificates yet.
                </p>
                <p className="text-sm text-green-300 mt-2">
                  Complete all courses in a module to earn a certificate
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {certificates.map((cert) => (
                  <Card key={cert.id} className="p-6 hover:shadow-2xl hover:shadow-green-500/20 transition-all border-green-500/20 bg-slate-800/50">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-white mb-1">
                          Certificate
                        </h3>
                        <p className="text-sm text-green-200">
                          Issued on{" "}
                          {new Date(cert.issuedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Award className="w-8 h-8 text-yellow-400" />
                    </div>
                    <Button className="w-full mt-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">Download Certificate</Button>
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
