import { useCallback, useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { AuthContext } from "@/context/AuthContext";
import { setOnAuthError } from "@/services/api";
import { authService } from "@/services/authService";
import { tokenStorage } from "@/services/tokenStorage";
import {
    canApproveCourse,
    canCreateCourse,
    canEnroll,
    isAdmin as checkAdmin,
    isInstructor as checkInstructor,
    isStudent as checkStudent,
} from "@/utils/permissions";

/**
 * Provides authenticated user session, role helpers, and auth methods.
 */
export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const storedToken = tokenStorage.getToken();
        const storedUser = tokenStorage.getUser();
        return storedToken && storedUser ? storedUser : null;
    });

    const [token, setToken] = useState(() => {
        const storedToken = tokenStorage.getToken();
        const storedUser = tokenStorage.getUser();
        return storedToken && storedUser ? storedToken : null;
    });

    const logout = useCallback(() => {
        authService.logout();
        setUser(null);
        setToken(null);
    }, []);

    useEffect(() => {
        // Register 401 interceptor hook to clear context state
        setOnAuthError(() => {
            setUser(null);
            setToken(null);
        });

        return () => {
            setOnAuthError(null);
        };
    }, []);

    const login = useCallback(async (credentials) => {
        const data = await authService.login(credentials);
        setUser(data.user);
        setToken(data.token);
        return data;
    }, []);

    const register = useCallback(async (userData) => {
        const data = await authService.register(userData);
        setUser(data.user);
        setToken(data.token);
        return data;
    }, []);

    const updateUser = useCallback((updatedUser) => {
        setUser((prev) => ({ ...prev, ...updatedUser }));
    }, []);

    const switchRole = useCallback(async (targetRole) => {
        const data = await authService.switchRole(targetRole);
        setUser(data.user);
        setToken(data.token);
        return data;
    }, []);

    const value = useMemo(
        () => ({
            user,
            token,
            role: user?.role || null,
            isAuthenticated: Boolean(token && user),
            isAdmin: checkAdmin(user),
            isInstructor: checkInstructor(user),
            isStudent: checkStudent(user),
            canCreateCourse: canCreateCourse(user),
            canApproveCourse: canApproveCourse(user),
            canEnroll: canEnroll(user),
            login,
            register,
            updateUser,
            switchRole,
            logout,
        }),
        [user, token, login, register, updateUser, switchRole, logout]
    );

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
}

AuthProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

export default AuthProvider;
