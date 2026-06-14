# EduHub - Modern Learning Management System

## 🎓 Project Overview

EduHub is a full-featured, elegant Learning Management System (LMS) built with modern web technologies. It supports three distinct user roles: **Teachers**, **Students**, and **Promoters** (administrators), enabling a complete end-to-end learning experience with course management, lesson delivery, quizzes, progress tracking, and certificate generation.

## ✨ Key Features

### 🏫 For Teachers
- **Course Management**: Create, edit, and delete courses
- **Lesson Creation**: Upload PDF documents or video files as lesson content
- **Quiz Builder**: Create multiple-choice quizzes attached to lessons
- **Student Analytics**: Track student progress and performance
- **Content Management**: Organize lessons in a structured order

### 👨‍🎓 For Students
- **Course Catalog**: Browse and search available courses
- **Enrollment**: Enroll in courses with one click
- **Lesson Viewer**: Integrated PDF viewer and video player
- **Quiz System**: Take quizzes to complete lessons (60% pass threshold)
- **Progress Tracking**: Visual progress rings showing course completion percentage
- **Certificate Management**: View and download earned certificates

### 📊 For Promoters (Admins)
- **Module Management**: Group courses into thematic modules
- **Validation Thresholds**: Set minimum scores required for certification
- **Certificate Issuance**: Generate and issue personalized certificates
- **Student Analytics**: Monitor module completion and performance
- **Certificate Generation**: AI-powered personalized certificate creation

## 🏗️ Architecture

### Technology Stack
- **Frontend**: React 19 + TypeScript + Tailwind CSS 4
- **Backend**: Node.js + Express + tRPC 11
- **Database**: MySQL with Drizzle ORM
- **Authentication**: Manus OAuth
- **File Storage**: AWS S3 with presigned URLs
- **AI Integration**: Image generation for certificates

### Database Schema
```
users (authentication & roles)
├── courses (teacher-owned)
│   ├── lessons (PDF/Video content)
│   │   └── quizzes (multiple-choice assessments)
│   │       └── quiz_questions (question bank)
│   └── enrollments (student-course relationships)
│       └── progress (per-lesson tracking)
├── modules (promoter-created)
│   └── module_courses (course grouping)
└── certificates (issued to students)
```

## 🚀 Getting Started

### Prerequisites
- Node.js 22.13.0+
- pnpm 10.4.1+
- MySQL database
- AWS S3 bucket (for file storage)

### Installation

1. **Extract the project**
   ```bash
   unzip lms-platform-complete.zip
   cd lms-platform
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   Create a `.env` file with:
   ```
   DATABASE_URL=mysql://user:password@localhost:3306/lms_db
   JWT_SECRET=your-secret-key
   VITE_APP_ID=your-app-id
   OAUTH_SERVER_URL=https://api.manus.im
   BUILT_IN_FORGE_API_URL=your-forge-url
   BUILT_IN_FORGE_API_KEY=your-forge-key
   ```

4. **Run database migrations**
   ```bash
   pnpm drizzle-kit generate
   pnpm drizzle-kit migrate
   ```

5. **Start development server**
   ```bash
   pnpm dev
   ```

6. **Build for production**
   ```bash
   pnpm build
   pnpm start
   ```

## 📁 Project Structure

```
lms-platform/
├── client/                 # React frontend
│   ├── src/
│   │   ├── pages/         # Page components (dashboards, lesson viewer, etc.)
│   │   ├── components/    # Reusable UI components
│   │   ├── lib/           # Utilities and tRPC client
│   │   └── App.tsx        # Main router
│   └── public/            # Static assets
├── server/                # Node.js backend
│   ├── routers.ts         # tRPC procedure definitions
│   ├── db.ts              # Database query helpers
│   ├── storage.ts         # S3 file storage helpers
│   ├── lessonUpload.ts    # Lesson upload logic
│   ├── certificateService.ts  # Certificate generation
│   └── _core/             # Framework core (auth, OAuth, etc.)
├── drizzle/               # Database schema and migrations
├── shared/                # Shared types and constants
└── package.json           # Dependencies
```

## 🔐 Security Features

- **Role-Based Access Control**: Three distinct roles with appropriate permissions
- **Ownership Verification**: Teachers can only manage their own courses
- **Enrollment Verification**: Students can only access enrolled course content
- **Secure File Delivery**: Presigned S3 URLs for secure file access
- **Authorization Checks**: All mutations verify user permissions

## 🎨 UI/UX Design

### Design Philosophy
- **Elegant & Professional**: Premium, polished interface inspired by Coursera and Udemy
- **Responsive**: Works seamlessly on desktop, tablet, and mobile
- **Accessible**: Keyboard navigation and screen reader support
- **Interactive**: Smooth transitions and micro-interactions

### Key Components
- **ProgressRing**: Circular progress visualization
- **CourseCard**: Course display with enrollment/progress
- **LessonViewer**: Integrated PDF/video viewer
- **QuizInterface**: Interactive quiz with real-time scoring
- **CertificateViewer**: Certificate display and download

## 📊 API Routes (tRPC)

### Teacher Routes
- `teacher.courses.list` - Get all courses
- `teacher.courses.create` - Create new course
- `teacher.courses.update` - Update course
- `teacher.courses.delete` - Delete course
- `teacher.lessons.list` - Get course lessons
- `teacher.lessons.create` - Add lesson
- `teacher.quizzes.create` - Create quiz
- `teacher.progress.getCourseStats` - Get student analytics

### Student Routes
- `student.courses.list` - Browse all courses
- `student.courses.getEnrolled` - Get enrolled courses
- `student.courses.enroll` - Enroll in course
- `student.lessons.getContent` - Get lesson content
- `student.quizzes.get` - Get quiz for lesson
- `student.quizzes.submit` - Submit quiz answers
- `student.progress.getCourseProgress` - Get course progress
- `student.certificates.list` - Get earned certificates

### Promoter Routes
- `promoter.modules.list` - Get all modules
- `promoter.modules.create` - Create module
- `promoter.modules.update` - Update module
- `promoter.certificates.generate` - Issue certificate
- `promoter.certificates.checkEligibility` - Check student eligibility

## 🎯 Workflow Examples

### Teacher Workflow
1. Create a course with title and description
2. Add lessons (upload PDF or video files)
3. Attach quizzes to each lesson
4. Monitor student progress through analytics

### Student Workflow
1. Browse available courses
2. Enroll in a course
3. View lesson content (PDF or video)
4. Complete quiz (must score 60%+ to pass)
5. Track progress through progress ring
6. Earn certificate when all module courses are completed

### Promoter Workflow
1. Create learning modules
2. Group courses into modules
3. Set validation threshold (e.g., 75%)
4. Issue certificates to eligible students
5. Monitor module completion statistics

## 🧪 Testing

### Run Tests
```bash
pnpm test
```

### Test Coverage
- Unit tests for core functions
- Integration tests for workflows
- End-to-end tests for all roles

## 📈 Performance Optimization

- **Code Splitting**: Lazy-loaded page components
- **Query Optimization**: Efficient database queries with Drizzle
- **Caching**: Presigned URLs cached for file access
- **Image Optimization**: Responsive images with proper sizing

## 🔄 File Upload & Storage

Files are securely stored in AWS S3 with the following workflow:

1. **Upload**: Client uploads file to presigned S3 URL
2. **Storage**: File stored with unique key in S3
3. **Database**: Storage key saved in database
4. **Delivery**: Presigned URL generated for authorized access
5. **Access Control**: Verified enrollment before granting access

## 🎓 Certificate Generation

Certificates are AI-generated with personalization:

1. **Eligibility Check**: Verify student completed all courses with required score
2. **AI Generation**: Generate personalized certificate image with:
   - Student name in elegant calligraphy
   - Module name and completion date
   - Score and validation threshold
   - Professional certificate design
3. **Storage**: Upload to S3 and store reference
4. **Download**: Provide presigned URL for download

## 🚀 Deployment

### Manus WebDev Platform
The project is ready for deployment on Manus WebDev:

1. Click "Publish" in the Management UI
2. Configure custom domain (optional)
3. Enable SSL/TLS
4. Monitor analytics and performance

### Alternative Hosting
For external hosting (Railway, Render, Vercel):

```bash
pnpm build
# Deploy dist/ folder and server
```

## 📝 Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | MySQL connection string |
| `JWT_SECRET` | Session signing secret |
| `VITE_APP_ID` | Manus OAuth app ID |
| `OAUTH_SERVER_URL` | OAuth provider URL |
| `BUILT_IN_FORGE_API_URL` | Forge API endpoint |
| `BUILT_IN_FORGE_API_KEY` | Forge API key |

## 🐛 Troubleshooting

### Database Connection Issues
- Verify MySQL is running
- Check DATABASE_URL format
- Ensure database exists and user has permissions

### File Upload Failures
- Verify S3 bucket exists and is accessible
- Check AWS credentials in environment
- Ensure file size is within limits

### Certificate Generation Issues
- Verify image generation API is available
- Check BUILT_IN_FORGE_API_KEY is valid
- Review error logs in .manus-logs/

## 📚 Documentation

- **Database Schema**: See `drizzle/schema.ts`
- **API Routes**: See `server/routers.ts`
- **Component Library**: See `client/src/components/`
- **Page Implementations**: See `client/src/pages/`

## 🤝 Contributing

To extend the LMS:

1. Add new database tables in `drizzle/schema.ts`
2. Generate migrations: `pnpm drizzle-kit generate`
3. Add tRPC procedures in `server/routers.ts`
4. Create UI components in `client/src/components/`
5. Add pages in `client/src/pages/`
6. Update routes in `client/src/App.tsx`

## 📄 License

This project is provided as-is for educational and commercial use.

## 🎉 Features Checklist

- [x] Three-role authentication system
- [x] Course creation and management
- [x] PDF and video lesson support
- [x] Multiple-choice quiz system
- [x] Student progress tracking
- [x] Module management
- [x] Certificate generation with AI
- [x] Secure S3 file storage
- [x] Responsive UI design
- [x] Role-based access control
- [x] Student enrollment system
- [x] Progress visualization
- [x] Certificate download
- [x] Teacher analytics
- [x] Promoter dashboard

## 🎯 Next Steps

1. **Customize Branding**: Update logo, colors, and typography
2. **Add More Courses**: Create sample courses for testing
3. **Configure Email**: Set up email notifications
4. **Enable Analytics**: Configure analytics dashboard
5. **Set Up Backups**: Configure database backups
6. **Performance Testing**: Load test the platform
7. **Security Audit**: Review and harden security

---

**Built with ❤️ for modern education**

For support and questions, refer to the documentation or contact the development team.
