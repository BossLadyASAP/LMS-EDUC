import { teacherProcedure } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router } from "./_core/trpc";
import * as db from "./db";
import { uploadLessonContent, uploadCourseThumbnail } from "./lessonUpload";

export const lessonRoutes = router({
  // Get lessons for a course
  list: teacherProcedure
    .input(z.object({ courseId: z.number() }))
    .query(async ({ input, ctx }) => {
      const course = await db.getCourseById(input.courseId);
      if (!course) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Course not found" });
      }
      if (course.teacherId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized" });
      }
      return db.getLessonsByCourse(input.courseId);
    }),

  // Get a specific lesson
  getDetail: teacherProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      const lesson = await db.getLessonById(input.id);
      if (!lesson) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Lesson not found" });
      }
      const course = await db.getCourseById(lesson.courseId);
      if (!course || course.teacherId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized" });
      }
      return lesson;
    }),

  // Create a lesson
  create: teacherProcedure
    .input(
      z.object({
        courseId: z.number(),
        title: z.string().min(1),
        contentType: z.enum(["pdf", "video"]),
        contentPath: z.string(),
        order: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const course = await db.getCourseById(input.courseId);
      if (!course) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Course not found" });
      }
      if (course.teacherId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized" });
      }

      return db.createLesson(input);
    }),

  // Update a lesson
  update: teacherProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().optional(),
        contentPath: z.string().optional(),
        order: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const lesson = await db.getLessonById(input.id);
      if (!lesson) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Lesson not found" });
      }
      const course = await db.getCourseById(lesson.courseId);
      if (!course || course.teacherId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized" });
      }

      return db.updateLesson(input.id, {
        title: input.title,
        contentPath: input.contentPath,
        order: input.order,
      });
    }),

  // Delete a lesson
  delete: teacherProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const lesson = await db.getLessonById(input.id);
      if (!lesson) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Lesson not found" });
      }
      const course = await db.getCourseById(lesson.courseId);
      if (!course || course.teacherId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized" });
      }

      return db.deleteLesson(input.id);
    }),

  // Get presigned upload URL for lesson content
  getUploadUrl: teacherProcedure
    .input(
      z.object({
        courseId: z.number(),
        fileName: z.string(),
        contentType: z.enum(["application/pdf", "video/mp4"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const course = await db.getCourseById(input.courseId);
      if (!course) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Course not found" });
      }
      if (course.teacherId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized" });
      }

      const { getForgeConfig } = await import("./storage");
      const { forgeUrl, forgeKey } = getForgeConfig();
      const hash = crypto.randomUUID().replace(/-/g, "").slice(0, 8);
      const storageKey = `courses/${input.courseId}/lessons/${Date.now()}_${hash}_${input.fileName}`;

      const presignUrl = new URL("v1/storage/presign/put", forgeUrl + "/");
      presignUrl.searchParams.set("path", storageKey);

      const presignResp = await fetch(presignUrl.toString(), {
        headers: { Authorization: `Bearer ${forgeKey}` },
      });

      if (!presignResp.ok) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to get upload URL" });
      }

      const { url: uploadUrl } = await presignResp.json() as { url: string };
      return { uploadUrl, storageKey };
    }),
});
