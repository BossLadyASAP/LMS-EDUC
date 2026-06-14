import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import StudentDashboard from "./pages/StudentDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import PromoterDashboard from "./pages/PromoterDashboard";
import TeacherCourseDetail from "./pages/TeacherCourseDetail";
import StudentLessonPage from "./pages/StudentLessonPage";
import StudentCertificatesPage from "./pages/StudentCertificatesPage";
import PromoterCertificatesPage from "./pages/PromoterCertificatesPage";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/student/dashboard"} component={StudentDashboard} />
      <Route path={"/student/lesson/:id"} component={StudentLessonPage} />
      <Route path={"/student/certificates"} component={StudentCertificatesPage} />
      <Route path={"/teacher/dashboard"} component={TeacherDashboard} />
      <Route path={"/teacher/course/:id"} component={TeacherCourseDetail} />
      <Route path={"/promoter/dashboard"} component={PromoterDashboard} />
      <Route path={"/promoter/module/:id/certificates"} component={PromoterCertificatesPage} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
