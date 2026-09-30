import { useContext } from "react";
import { AuthContext } from "@/context/AuthContext";

/**
 * Custom hook to access authentication state and session methods.
 *
 * @returns {Object} AuthContext value
 */
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}

export default useAuth;
