import { eq, and, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, courses, lessons, quizzes, quizQuestions, enrollments, lessonProgress, modules, moduleCourses, certificates } from "../drizzle/schema";

type LessonProgress = typeof lessonProgress.$inferSelect;
type Enrollment = typeof enrollments.$inferSelect;

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createUserWithPassword(data: {
  email: string;
  name: string;
  passwordHash: string;
  role: "student" | "teacher" | "promoter";
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const openId = `local_${crypto.randomUUID()}`;
  const [result] = await db.insert(users).values({
    openId,
    email: data.email,
    name: data.name,
    passwordHash: data.passwordHash,
    role: data.role,
    loginMethod: "email",
    lastSignedIn: new Date(),
  });
  return { id: result.insertId, openId };
}

// Course queries
export async function getCoursesByTeacher(teacherId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(courses).where(eq(courses.teacherId, teacherId));
}

export async function getCourseById(courseId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(courses).where(eq(courses.id, courseId)).limit(1);
  return result[0];
}

export async function getAllCourses() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(courses);
}

// Lesson queries
export async function getLessonsByCourse(courseId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(lessons).where(eq(lessons.courseId, courseId));
}

export async function getLessonById(lessonId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(lessons).where(eq(lessons.id, lessonId)).limit(1);
  return result[0];
}

// Quiz queries
export async function getQuizByLessonId(lessonId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(quizzes).where(eq(quizzes.lessonId, lessonId)).limit(1);
  return result[0];
}

export async function getQuizQuestions(quizId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(quizQuestions).where(eq(quizQuestions.quizId, quizId));
}

export async function createQuiz(lessonId: number, questions: any[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const [quizResult] = await db.insert(quizzes).values({ lessonId });
  const quizId = quizResult.insertId;
  
  for (let i = 0; i < questions.length; i++) {
    await db.insert(quizQuestions).values({
      quizId,
      question: questions[i].question,
      options: JSON.stringify(questions[i].options),
      correctOptionIndex: questions[i].correctOptionIndex,
      order: i,
    });
  }
  return { id: quizId };
}

export async function updateQuiz(quizId: number, questions: any[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Clear existing questions and re-insert
  await db.delete(quizQuestions).where(eq(quizQuestions.quizId, quizId));
  
  for (let i = 0; i < questions.length; i++) {
    await db.insert(quizQuestions).values({
      quizId,
      question: questions[i].question,
      options: JSON.stringify(questions[i].options),
      correctOptionIndex: questions[i].correctOptionIndex,
      order: i,
    });
  }
  return { success: true };
}

// Enrollment queries
export async function isStudentEnrolled(studentId: number, courseId: number) {
  const db = await getDb();
  if (!db) return false;
  const result = await db.select().from(enrollments)
    .where(eq(enrollments.studentId, studentId) && eq(enrollments.courseId, courseId))
    .limit(1);
  return result.length > 0;
}

export async function getStudentEnrolledCourses(studentId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(enrollments).where(eq(enrollments.studentId, studentId));
}

export async function enrollStudent(studentId: number, courseId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Check if already enrolled
  const existing = await db.select().from(enrollments)
    .where(and(eq(enrollments.studentId, studentId), eq(enrollments.courseId, courseId)))
    .limit(1);
    
  if (existing.length > 0) return { success: true };
  
  await db.insert(enrollments).values({ studentId, courseId });
  return { success: true };
}

export async function createCourse(course: InsertCourse) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(courses).values(course);
  return { id: result.insertId };
}

export async function updateCourse(id: number, teacherId: number, data: Partial<Course>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(courses).set(data).where(and(eq(courses.id, id), eq(courses.teacherId, teacherId)));
  return { success: true };
}

export async function deleteCourse(id: number, teacherId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(courses).where(and(eq(courses.id, id), eq(courses.teacherId, teacherId)));
  return { success: true };
}

export async function createLesson(lesson: InsertLesson) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(lessons).values(lesson);
  return { id: result.insertId };
}

export async function updateLesson(id: number, data: Partial<Lesson>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(lessons).set(data).where(eq(lessons.id, id));
  return { success: true };
}

export async function deleteLesson(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(lessons).where(eq(lessons.id, id));
  return { success: true };
}

// Progress queries
export async function getLessonProgress(studentId: number, lessonId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(lessonProgress)
    .where(eq(lessonProgress.studentId, studentId) && eq(lessonProgress.lessonId, lessonId))
    .limit(1);
  return result[0];
}

export async function getCourseProgress(studentId: number, courseId: number) {
  const db = await getDb();
  if (!db) return { completed: 0, total: 0, percentage: 0 };
  
  const courseLessons = await db.select().from(lessons).where(eq(lessons.courseId, courseId));
  if (courseLessons.length === 0) return { completed: 0, total: 0, percentage: 0 };
  
  const lessonIds = courseLessons.map(l => l.id);
  const progress = await db.select().from(lessonProgress)
    .where(and(eq(lessonProgress.studentId, studentId), inArray(lessonProgress.lessonId, lessonIds)));
  
  const completedCount = progress.filter(p => p.isCompleted === 1).length;
  const percentage = Math.round((completedCount / courseLessons.length) * 100);
  
  return { completed: completedCount, total: courseLessons.length, percentage };
}

export async function updateLessonProgress(studentId: number, lessonId: number, score: number, isCompleted: boolean) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const existing = await db.select().from(lessonProgress)
    .where(and(eq(lessonProgress.studentId, studentId), eq(lessonProgress.lessonId, lessonId)))
    .limit(1);
    
  if (existing.length > 0) {
    await db.update(lessonProgress)
      .set({ 
        quizScore: score, 
        isCompleted: isCompleted ? 1 : existing[0].isCompleted,
        completedAt: isCompleted ? new Date() : existing[0].completedAt
      })
      .where(eq(lessonProgress.id, existing[0].id));
  } else {
    await db.insert(lessonProgress).values({
      studentId,
      lessonId,
      quizScore: score,
      isCompleted: isCompleted ? 1 : 0,
      completedAt: isCompleted ? new Date() : null
    });
  }
  return { success: true };
}

// Module queries
export async function getModulesByPromoter(promoterId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(modules).where(eq(modules.promoterId, promoterId));
}

export async function createModule(module: InsertModule) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(modules).values(module);
  return { id: result.insertId };
}

export async function updateModule(id: number, data: Partial<Module>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(modules).set(data).where(eq(modules.id, id));
  return { success: true };
}

export async function addCourseToModule(moduleId: number, courseId: number, order: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(moduleCourses).values({ moduleId, courseId, order });
  return { success: true };
}

export async function removeCourseFromModule(moduleId: number, courseId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(moduleCourses).where(and(eq(moduleCourses.moduleId, moduleId), eq(moduleCourses.courseId, courseId)));
  return { success: true };
}

export async function getModuleById(moduleId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(modules).where(eq(modules.id, moduleId)).limit(1);
  return result[0];
}

export async function getModuleCourses(moduleId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(moduleCourses).where(eq(moduleCourses.moduleId, moduleId));
}

// Certificate queries
export async function getCertificateByStudentAndModule(studentId: number, moduleId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(certificates)
    .where(eq(certificates.studentId, studentId) && eq(certificates.moduleId, moduleId))
    .limit(1);
  return result[0];
}

export async function getStudentCertificates(studentId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(certificates).where(eq(certificates.studentId, studentId));
}

export async function getCourseStats(courseId: number) {
  const db = await getDb();
  if (!db) return { totalStudents: 0, completedStudents: 0, averageScore: 0 };
  
  const studentEnrollments = await db.select().from(enrollments).where(eq(enrollments.courseId, courseId));
  const courseLessons = await db.select().from(lessons).where(eq(lessons.courseId, courseId));
  
  if (studentEnrollments.length === 0 || courseLessons.length === 0) {
    return { totalStudents: studentEnrollments.length, completedStudents: 0, averageScore: 0 };
  }
  
  let completedCount = 0;
  let totalScore = 0;
  let scoreCount = 0;
  
  for (const enrollment of studentEnrollments) {
    const progress = await getCourseProgress(enrollment.studentId, courseId);
    if (progress.percentage === 100) {
      completedCount++;
    }
    
    const lessonIds = courseLessons.map(l => l.id);
    const quizResults = await db.select().from(lessonProgress)
      .where(and(eq(lessonProgress.studentId, enrollment.studentId), inArray(lessonProgress.lessonId, lessonIds)));
      
    quizResults.forEach(r => {
      if (r.quizScore !== null) {
        totalScore += r.quizScore;
        scoreCount++;
      }
    });
  }
  
  return {
    totalStudents: studentEnrollments.length,
    completedStudents: completedCount,
    averageScore: scoreCount > 0 ? Math.round(totalScore / scoreCount) : 0
  };
}

export async function getModuleStats(moduleId: number) {
  const db = await getDb();
  if (!db) return { totalStudents: 0, completedStudents: 0 };
  
  const module_courses = await getModuleCourses(moduleId);
  if (module_courses.length === 0) return { totalStudents: 0, completedStudents: 0 };
  
  // For simplicity, we define "module students" as those enrolled in at least one course of the module
  const courseIds = module_courses.map(mc => mc.courseId);
  const studentEnrollments = await db.select().from(enrollments).where(inArray(enrollments.courseId, courseIds));
  const uniqueStudentIds = [...new Set(studentEnrollments.map(e => e.studentId))];
  
  let completedCount = 0;
  for (const studentId of uniqueStudentIds) {
    const eligibility = await checkModuleCompletion(studentId, moduleId);
    if (eligibility.completed) {
      completedCount++;
    }
  }
  
  return {
    totalStudents: uniqueStudentIds.length,
    completedStudents: completedCount
  };
}

async function checkModuleCompletion(studentId: number, moduleId: number) {
  const module_courses = await getModuleCourses(moduleId);
  let completedCourses = 0;
  for (const mc of module_courses) {
    const progress = await getCourseProgress(studentId, mc.courseId);
    if (progress.percentage === 100) {
      completedCourses++;
    }
  }
  return { completed: completedCourses === module_courses.length };
}
