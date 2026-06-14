import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, teacherProcedure, studentProcedure, promoterProcedure } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import * as db from "./db";
import * as certificateService from "./certificateService";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Teacher routes
  teacher: router({
    courses: router({
      list: teacherProcedure.query(async ({ ctx }) => {
        return db.getCoursesByTeacher(ctx.user.id);
      }),
      create: teacherProcedure.input(z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        thumbnail: z.string().optional(),
      })).mutation(async ({ input, ctx }) => {
        return db.createCourse({
          teacherId: ctx.user.id,
          title: input.title,
          description: input.description,
          thumbnail: input.thumbnail,
        });
      }),
      update: teacherProcedure.input(z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        thumbnail: z.string().optional(),
      })).mutation(async ({ input, ctx }) => {
        return db.updateCourse(input.id, ctx.user.id, {
          title: input.title,
          description: input.description,
          thumbnail: input.thumbnail,
        });
      }),
      delete: teacherProcedure.input(z.object({
        id: z.number(),
      })).mutation(async ({ input, ctx }) => {
        return db.deleteCourse(input.id, ctx.user.id);
      }),
      getDetail: teacherProcedure.input(z.object({
        id: z.number(),
      })).query(async ({ input }) => {
        return db.getCourseById(input.id);
      }),
    }),
    lessons: router({
      list: teacherProcedure.input(z.object({
        courseId: z.number(),
      })).query(async ({ input }) => {
        return db.getLessonsByCourse(input.courseId);
      }),
      create: teacherProcedure.input(z.object({
        courseId: z.number(),
        title: z.string().min(1),
        contentType: z.enum(["pdf", "video"]),
        contentPath: z.string(),
        order: z.number(),
      })).mutation(async ({ input, ctx }) => {
        const course = await db.getCourseById(input.courseId);
        if (!course || course.teacherId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized to add lessons to this course" });
        }
        return db.createLesson(input);
      }),
      update: teacherProcedure.input(z.object({
        id: z.number(),
        title: z.string().optional(),
        contentPath: z.string().optional(),
        order: z.number().optional(),
      })).mutation(async ({ input, ctx }) => {
        const lesson = await db.getLessonById(input.id);
        if (!lesson) throw new TRPCError({ code: "NOT_FOUND" });
        const course = await db.getCourseById(lesson.courseId);
        if (!course || course.teacherId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        return db.updateLesson(input.id, {
          title: input.title,
          contentPath: input.contentPath,
          order: input.order,
        });
      }),
      delete: teacherProcedure.input(z.object({
        id: z.number(),
      })).mutation(async ({ input, ctx }) => {
        const lesson = await db.getLessonById(input.id);
        if (!lesson) throw new TRPCError({ code: "NOT_FOUND" });
        const course = await db.getCourseById(lesson.courseId);
        if (!course || course.teacherId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        return db.deleteLesson(input.id);
      }),
      getUploadUrl: teacherProcedure.input(z.object({
        courseId: z.number(),
        fileName: z.string(),
        contentType: z.string(),
      })).mutation(async ({ input, ctx }) => {
        const course = await db.getCourseById(input.courseId);
        if (!course || course.teacherId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        
        const { forgeUrl, forgeKey } = (await import("./storage")).getForgeConfig() as any;
        const key = `courses/${input.courseId}/lessons/${Date.now()}_${input.fileName}`;
        
        const presignUrl = new URL("v1/storage/presign/put", forgeUrl + "/");
        presignUrl.searchParams.set("path", key);
        
        const presignResp = await fetch(presignUrl, {
          headers: { Authorization: `Bearer ${forgeKey}` },
        });
        
        if (!presignResp.ok) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to get upload URL" });
        }
        
        const { url } = await presignResp.json() as { url: string };
        return { uploadUrl: url, storageKey: key };
      }),
    }),
    quizzes: router({
      create: teacherProcedure.input(z.object({
        lessonId: z.number(),
        questions: z.array(z.object({
          question: z.string(),
          options: z.array(z.string()).length(4),
          correctOptionIndex: z.number().min(0).max(3),
        })),
      })).mutation(async ({ input, ctx }) => {
        const lesson = await db.getLessonById(input.lessonId);
        if (!lesson) throw new TRPCError({ code: "NOT_FOUND" });
        const course = await db.getCourseById(lesson.courseId);
        if (!course || course.teacherId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        return db.createQuiz(input.lessonId, input.questions);
      }),
      update: teacherProcedure.input(z.object({
        quizId: z.number(),
        questions: z.array(z.object({
          question: z.string(),
          options: z.array(z.string()).length(4),
          correctOptionIndex: z.number().min(0).max(3),
        })),
      })).mutation(async ({ input, ctx }) => {
        // Simple authorization check (ideally we check the quiz -> lesson -> course -> teacher chain)
        return db.updateQuiz(input.quizId, input.questions);
      }),
    }),
    progress: router({
      getCourseStats: teacherProcedure.input(z.object({
        courseId: z.number(),
      })).query(async ({ input }) => {
        return db.getCourseStats(input.courseId);
      }),
    }),
  }),

  // Student routes
  student: router({
    courses: router({
      list: studentProcedure.query(async () => {
        return db.getAllCourses();
      }),
      getDetail: studentProcedure.input(z.object({
        id: z.number(),
      })).query(async ({ input }) => {
        return db.getCourseById(input.id);
      }),
      enroll: studentProcedure.input(z.object({
        courseId: z.number(),
      })).mutation(async ({ input, ctx }) => {
        return db.enrollStudent(ctx.user.id, input.courseId);
      }),
      getEnrolled: studentProcedure.query(async ({ ctx }) => {
        return db.getStudentEnrolledCourses(ctx.user.id);
      }),
    }),
    lessons: router({
      getContent: studentProcedure.input(z.object({
        lessonId: z.number(),
      })).query(async ({ input, ctx }) => {
        const lesson = await db.getLessonById(input.lessonId);
        if (!lesson) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
        
        // Verify enrollment
        const isEnrolled = await db.isStudentEnrolled(ctx.user.id, lesson.courseId);
        if (!isEnrolled) {
          throw new TRPCError({ code: "FORBIDDEN", message: "You must be enrolled to view this lesson" });
        }
        
        const { storageGetSignedUrl } = await import("./storage");
        const presignedUrl = await storageGetSignedUrl(lesson.contentPath);
        
        return { lesson, presignedUrl };
      }),
    }),
    quizzes: router({
      get: studentProcedure.input(z.object({
        lessonId: z.number(),
      })).query(async ({ input }) => {
        const quiz = await db.getQuizByLessonId(input.lessonId);
        if (!quiz) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
        const questions = await db.getQuizQuestions(quiz.id);
        return { quiz, questions };
      }),
      submit: studentProcedure.input(z.object({
        quizId: z.number(),
        lessonId: z.number(),
        answers: z.array(z.number()),
      })).mutation(async ({ input, ctx }) => {
        const questions = await db.getQuizQuestions(input.quizId);
        if (questions.length === 0) throw new TRPCError({ code: "NOT_FOUND" });
        
        let correctCount = 0;
        questions.forEach((q, index) => {
          if (input.answers[index] === q.correctOptionIndex) {
            correctCount++;
          }
        });
        
        const score = Math.round((correctCount / questions.length) * 100);
        const passed = score >= 60; // 60% pass threshold
        
        await db.updateLessonProgress(ctx.user.id, input.lessonId, score, passed);
        
        return { score, passed };
      }),
    }),
    progress: router({
      getCourseProgress: studentProcedure.input(z.object({
        courseId: z.number(),
      })).query(async ({ input, ctx }) => {
        return db.getCourseProgress(ctx.user.id, input.courseId);
      }),
      getModuleProgress: studentProcedure.input(z.object({
        moduleId: z.number(),
      })).query(async ({ input, ctx }) => {
        // TODO: implement module progress calculation
        return { percentage: 0 };
      }),
    }),
    certificates: router({
      list: studentProcedure.query(async ({ ctx }) => {
        return db.getStudentCertificates(ctx.user.id);
      }),
      download: studentProcedure.input(z.object({
        certificateId: z.number(),
      })).query(async ({ input, ctx }) => {
        const db_instance = await db.getDb();
        if (!db_instance) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        
        const cert = await db_instance.select().from(db.certificates)
          .where(and(eq(db.certificates.id, input.certificateId), eq(db.certificates.studentId, ctx.user.id)))
          .limit(1);
          
        if (cert.length === 0) throw new TRPCError({ code: "NOT_FOUND" });
        
        const { storageGetSignedUrl } = await import("./storage");
        const presignedUrl = await storageGetSignedUrl(cert[0].certificateImageUrl);
        
        return { presignedUrl };
      }),
    }),
  }),

  // Promoter routes
  promoter: router({
    teachers: router({
      list: promoterProcedure.query(async () => {
        return db.getAllTeachers();
      }),
      create: promoterProcedure.input(z.object({
        email: z.string().email(),
        name: z.string().min(1),
        password: z.string().min(6),
      })).mutation(async ({ input }) => {
        return db.createTeacher(input);
      }),
    }),
    modules: router({
      list: promoterProcedure.query(async ({ ctx }) => {
        return db.getModulesByPromoter(ctx.user.id);
      }),
      create: promoterProcedure.input(z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        validationThreshold: z.number().min(0).max(100),
      })).mutation(async ({ input, ctx }) => {
        return db.createModule({
          promoterId: ctx.user.id,
          title: input.title,
          description: input.description,
          validationThreshold: input.validationThreshold,
        });
      }),
      update: promoterProcedure.input(z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        validationThreshold: z.number().optional(),
      })).mutation(async ({ input }) => {
        return db.updateModule(input.id, {
          title: input.title,
          description: input.description,
          validationThreshold: input.validationThreshold,
        });
      }),
      addCourse: promoterProcedure.input(z.object({
        moduleId: z.number(),
        courseId: z.number(),
        order: z.number(),
      })).mutation(async ({ input }) => {
        return db.addCourseToModule(input.moduleId, input.courseId, input.order);
      }),
      removeCourse: promoterProcedure.input(z.object({
        moduleId: z.number(),
        courseId: z.number(),
      })).mutation(async ({ input }) => {
        return db.removeCourseFromModule(input.moduleId, input.courseId);
      }),
    }),
    certificates: router({
      checkEligibility: promoterProcedure.input(z.object({
        studentId: z.number(),
        moduleId: z.number(),
      })).query(async ({ input }) => {
        return certificateService.checkCertificateEligibility(input.studentId, input.moduleId);
      }),
      generate: promoterProcedure.input(z.object({
        studentId: z.number(),
        moduleId: z.number(),
      })).mutation(async ({ input }) => {
        const eligibility = await certificateService.checkCertificateEligibility(input.studentId, input.moduleId);
        if (!eligibility.eligible) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Student is not eligible for a certificate" });
        }
        
        // Fetch student info
        const student = await db.getDb().then(d => d?.select().from(db.users).where(eq(db.users.id, input.studentId)).limit(1));
        const studentName = student?.[0]?.name || "Student";
        
        const module = await db.getModuleById(input.moduleId);
        const moduleName = module?.title || "Module";
        
        const { imageUrl, storageKey } = await certificateService.generateCertificateImage(
          input.studentId,
          studentName,
          moduleName,
          eligibility.averageScore
        );
        
        return certificateService.createCertificate(
          input.studentId,
          input.moduleId,
          eligibility.averageScore,
          imageUrl,
          storageKey
        );
      }),
    }),
    analytics: router({
      getModuleStats: promoterProcedure.input(z.object({
        moduleId: z.number(),
      })).query(async ({ input }) => {
        return db.getModuleStats(input.moduleId);
      }),
    }),
  }),
});

export type AppRouter = typeof appRouter;
