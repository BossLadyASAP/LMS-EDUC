import { storagePut } from "./storage";
import { getCourseById } from "./db";
import { courses } from "../drizzle/schema";

/**
 * Upload lesson content (PDF or video) to secure storage
 * Returns storage key and URL for database storage
 */
export async function uploadLessonContent(
  teacherId: number,
  courseId: number,
  fileName: string,
  fileBuffer: Buffer,
  contentType: "application/pdf" | "video/mp4"
): Promise<{ key: string; url: string }> {
  // Verify course ownership
  const course = await getCourseById(courseId);
  if (!course) {
    throw new Error("Course not found");
  }
  if (course.teacherId !== teacherId) {
    throw new Error("Not authorized to upload to this course");
  }

  // Generate storage key with course and lesson context
  const storageKey = `courses/${courseId}/lessons/${Date.now()}_${fileName}`;

  // Upload to storage
  const { key, url } = await storagePut(storageKey, fileBuffer, contentType);

  return { key, url };
}

/**
 * Upload course thumbnail image
 */
export async function uploadCourseThumbnail(
  teacherId: number,
  courseId: number,
  imageBuffer: Buffer
): Promise<{ key: string; url: string }> {
  // Verify course ownership
  const course = await getCourseById(courseId);
  if (!course) {
    throw new Error("Course not found");
  }
  if (course.teacherId !== teacherId) {
    throw new Error("Not authorized to upload to this course");
  }

  // Generate storage key
  const storageKey = `courses/${courseId}/thumbnail_${Date.now()}.jpg`;

  // Upload to storage
  const { key, url } = await storagePut(storageKey, imageBuffer, "image/jpeg");

  return { key, url };
}
