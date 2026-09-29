import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import PageLayout from "@/layouts/PageLayout";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";

/**
 * Root application component configuring router routes wrapped in PageLayout.
 *
 * @returns {JSX.Element}
 */
function App() {
    return (
        <BrowserRouter>
            <PageLayout>
                <Routes>
                    <Route path={ROUTES.LOGIN} element={<LoginPage />} />
                    <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
                    <Route
                        path="*"
                        element={<Navigate to={ROUTES.LOGIN} replace />}
                    />
                </Routes>
            </PageLayout>
        </BrowserRouter>
    );
}

export default App;
