import { generateImage } from "./_core/imageGeneration";
import { storagePut } from "./storage";
import * as db from "./db";
import { certificates } from "../drizzle/schema";

/**
 * Generate a personalized certificate image for a student
 * Uses AI image generation to create a beautiful, unique certificate
 */
export async function generateCertificateImage(
  studentId: number,
  studentName: string,
  moduleName: string,
  score: number
): Promise<{ imageUrl: string; storageKey: string }> {
  // Create a detailed prompt for the certificate
  const prompt = `Create a professional and elegant certificate of achievement. 
  
  The certificate should include:
  - A decorative border with gold/blue accents
  - The text "Certificate of Achievement" at the top in elegant serif font
  - The module name: "${moduleName}"
  - "This certifies that" in the middle
  - The student name: "${studentName}" in large, elegant calligraphy-style text
  - "Has successfully completed this module with a score of ${score}%"
  - A decorative seal or badge in the bottom right corner
  - A signature line at the bottom left
  - The current date
  - A subtle background pattern or watermark
  
  Style: Professional, elegant, premium-looking certificate suitable for framing.
  Colors: Gold, deep blue, and white with subtle gradients.
  Format: Landscape orientation, suitable for printing.
  Quality: High resolution, suitable for professional use.`;

  try {
    // Generate the certificate image
    const { url: imageUrl } = await generateImage({
      prompt,
    });

    if (!imageUrl) {
      throw new Error("Image generation returned no URL");
    }

    // Upload to storage
    const storageKey = `certificates/${studentId}_${moduleName}_${Date.now()}.jpg`;
    // In production, fetch the image from imageUrl and convert to buffer
    // For now, we'll store a placeholder
    const { key, url } = await storagePut(
      storageKey,
      "certificate-image-data", // Placeholder - in production fetch actual image
      "image/jpeg"
    );

    return {
      imageUrl: url,
      storageKey: key,
    };
  } catch (error) {
    console.error("Certificate generation failed:", error);
    throw new Error("Failed to generate certificate image");
  }
}

/**
 * Check if a student is eligible for a module certificate
 */
export async function checkCertificateEligibility(
  studentId: number,
  moduleId: number
): Promise<{ eligible: boolean; averageScore: number; threshold: number }> {
  const module = await db.getModuleById(moduleId);
  if (!module) {
    throw new Error("Module not found");
  }

  // Get all courses in the module
  const moduleCourses = await db.getModuleCourses(moduleId);
  if (moduleCourses.length === 0) {
    return { eligible: false, averageScore: 0, threshold: module.validationThreshold };
  }

  // Calculate average score across all courses
  let totalScore = 0;
  let completedCourses = 0;

  for (const mc of moduleCourses) {
    const progress = await db.getCourseProgress(studentId, mc.courseId);
    if (progress && progress.percentage > 0) {
      totalScore += progress.percentage;
      completedCourses++;
    }
  }

  const averageScore = completedCourses > 0 ? totalScore / moduleCourses.length : 0;
  const eligible = averageScore >= module.validationThreshold && completedCourses === moduleCourses.length;

  return {
    eligible,
    averageScore: Math.round(averageScore),
    threshold: module.validationThreshold,
  };
}

/**
 * Create a certificate record for a student
 */
export async function createCertificate(
  studentId: number,
  moduleId: number,
  score: number,
  imageUrl: string,
  storageKey: string
): Promise<{ certificateId: number }> {
  const db_instance = await db.getDb();
  if (!db_instance) throw new Error("Database not available");
  
  const [result] = await db_instance.insert(certificates).values({
    studentId,
    moduleId,
    certificateImageUrl: imageUrl,
  });
  
  return { certificateId: result.insertId };
}
