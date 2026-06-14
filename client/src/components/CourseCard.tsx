import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Users, Clock } from "lucide-react";
import { ProgressRing } from "./ProgressRing";

interface CourseCardProps {
  id: number;
  title: string;
  description: string;
  thumbnail?: string;
  lessonCount: number;
  studentCount: number;
  progress?: number;
  isEnrolled?: boolean;
  onEnroll?: () => void;
  onOpen?: () => void;
}

export function CourseCard({
  id,
  title,
  description,
  thumbnail,
  lessonCount,
  studentCount,
  progress = 0,
  isEnrolled = false,
  onEnroll,
  onOpen,
}: CourseCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col">
      {/* Thumbnail */}
      {thumbnail ? (
        <img
          src={thumbnail}
          alt={title}
          className="w-full h-48 object-cover"
        />
      ) : (
        <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center">
          <BookOpen className="w-12 h-12 text-blue-300" />
        </div>
      )}

      {/* Content */}
      <div className="p-6 flex-1 flex flex-col">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {title}
        </h3>
        <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-1">
          {description}
        </p>

        {/* Stats */}
        <div className="flex gap-4 mb-4 text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <BookOpen className="w-4 h-4" />
            {lessonCount} lessons
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            {studentCount} students
          </div>
        </div>

        {/* Progress or Enrollment */}
        {isEnrolled ? (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-700">Progress</span>
              <span className="text-xs font-bold text-blue-600">{progress}%</span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : null}

        {/* Action Button */}
        {isEnrolled ? (
          <Button onClick={onOpen} className="w-full">
            Continue Learning
          </Button>
        ) : (
          <Button onClick={onEnroll} variant="outline" className="w-full">
            Enroll Now
          </Button>
        )}
      </div>
    </Card>
  );
}
