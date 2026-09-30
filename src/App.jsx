import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import PageLayout from "@/components/layout/PageLayout";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import { ROUTES } from "@/constants/routes";
import { AuthProvider } from "@/context/AuthProvider";
import CourseDetailPage from "@/pages/CourseDetailPage";
import CoursesPage from "@/pages/CoursesPage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import StudentsPage from "@/pages/StudentsPage";

/**
 * Root application component configuring public auth routes and protected app routes.
 *
 * @returns {JSX.Element}
 */
function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    {/* Public Auth Routes wrapped in PageLayout */}
                    <Route
                        path={ROUTES.LOGIN}
                        element={
                            <PageLayout>
                                <LoginPage />
                            </PageLayout>
                        }
                    />
                    <Route
                        path={ROUTES.REGISTER}
                        element={
                            <PageLayout>
                                <RegisterPage />
                            </PageLayout>
                        }
                    />

                    {/* Authenticated Dashboard Routes in AppLayout */}
                    <Route
                        element={
                            <ProtectedRoute>
                                <AppLayout />
                            </ProtectedRoute>
                        }
                    >
                        <Route
                            path={ROUTES.COURSES}
                            element={<CoursesPage />}
                        />
                        <Route
                            path="/courses/:id"
                            element={<CourseDetailPage />}
                        />
                        <Route
                            path={ROUTES.STUDENTS}
                            element={<StudentsPage />}
                        />
                        <Route
                            path={ROUTES.HOME}
                            element={<Navigate to={ROUTES.COURSES} replace />}
                        />
                        <Route
                            path="*"
                            element={<Navigate to={ROUTES.COURSES} replace />}
                        />
                    </Route>
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
