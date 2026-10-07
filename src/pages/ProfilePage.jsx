import { useEffect, useState } from "react";
import Alert from "@/components/common/Alert";
import Badge from "@/components/common/Badge";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import { AUTH_MESSAGES } from "@/constants/messages";
import PasswordRequirements from "@/features/auth/PasswordRequirements";
import { passwordSchema } from "@/features/auth/registerSchema";
import { useAuth } from "@/hooks/useAuth";
import { authService } from "@/services/authService";
import "./ProfilePage.css";

const phoneRegex = /^[+]?[0-9\s\-().]{7,20}$/;

/**
 * User Profile Page displaying name, email, phone, role, and allowing profile editing and password change.
 */
function ProfilePage() {
    const { user: authUser, updateUser } = useAuth();
    const [profile, setProfile] = useState(authUser || {});
    const [loading, setLoading] = useState(true);
    const [serverError, setServerError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    // Edit profile state
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        name: authUser?.name || "",
        phone: authUser?.phone || "",
    });
    const [editErrors, setEditErrors] = useState({});
    const [isSavingProfile, setIsSavingProfile] = useState(false);

    // Change password state
    const [showChangePassword, setShowChangePassword] = useState(false);
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [passwordErrors, setPasswordErrors] = useState({});
    const [passwordError, setPasswordError] = useState("");
    const [passwordSuccess, setPasswordSuccess] = useState("");
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    useEffect(() => {
        let isMounted = true;
        authService
            .getProfile()
            .then((data) => {
                if (isMounted && data) {
                    setProfile(data);
                    setEditForm({
                        name: data.name || "",
                        phone: data.phone || "",
                    });
                    if (updateUser) {
                        updateUser(data);
                    }
                }
            })
            .catch((err) => {
                if (isMounted) {
                    setServerError(err.message || "Failed to load latest profile details");
                }
            })
            .finally(() => {
                if (isMounted) setLoading(false);
            });

        return () => {
            isMounted = false;
        };
    }, [updateUser]);

    function getRoleBadgeVariant(role) {
        switch ((role || "").toLowerCase()) {
            case "admin":
                return "danger";
            case "instructor":
                return "info";
            default:
                return "default";
        }
    }

    // Profile Edit handlers
    function handleEditChange(e) {
        const { name, value } = e.target;
        setEditForm((prev) => ({ ...prev, [name]: value }));
        setServerError("");
        setSuccessMessage("");

        if (name === "name") {
            if (!value || value.trim().length < 2) {
                setEditErrors((prev) => ({
                    ...prev,
                    name: AUTH_MESSAGES.NAME_REQUIRED,
                }));
            } else {
                setEditErrors((prev) => ({ ...prev, name: "" }));
            }
        }

        if (name === "phone") {
            if (!value || !value.trim()) {
                setEditErrors((prev) => ({
                    ...prev,
                    phone: AUTH_MESSAGES.PHONE_REQUIRED,
                }));
            } else if (!phoneRegex.test(value.trim())) {
                setEditErrors((prev) => ({
                    ...prev,
                    phone: AUTH_MESSAGES.PHONE_INVALID,
                }));
            } else {
                setEditErrors((prev) => ({ ...prev, phone: "" }));
            }
        }
    }

    async function handleSaveProfile(e) {
        e.preventDefault();
        setServerError("");
        setSuccessMessage("");

        const nameValid = editForm.name && editForm.name.trim().length >= 2;
        const phoneValid = editForm.phone && phoneRegex.test(editForm.phone.trim());

        if (!nameValid || !phoneValid) {
            setEditErrors({
                name: !nameValid ? AUTH_MESSAGES.NAME_REQUIRED : "",
                phone: !phoneValid ? AUTH_MESSAGES.PHONE_INVALID : "",
            });
            return;
        }

        setIsSavingProfile(true);
        try {
            const updated = await authService.updateProfile({
                name: editForm.name.trim(),
                phone: editForm.phone.trim(),
            });
            setProfile(updated);
            if (updateUser) {
                updateUser(updated);
            }
            setIsEditing(false);
            setSuccessMessage(AUTH_MESSAGES.PROFILE_UPDATE_SUCCESS);
        } catch (err) {
            setServerError(err.message || "Failed to update profile");
        } finally {
            setIsSavingProfile(false);
        }
    }

    function handleCancelEdit() {
        setEditForm({
            name: profile.name || "",
            phone: profile.phone || "",
        });
        setEditErrors({});
        setIsEditing(false);
    }

    // Password Change handlers
    function handlePasswordChange(e) {
        const { name, value } = e.target;
        const nextForm = { ...passwordForm, [name]: value };
        setPasswordForm(nextForm);
        setPasswordError("");
        setPasswordSuccess("");

        if (name === "currentPassword") {
            setPasswordErrors((prev) => ({
                ...prev,
                currentPassword: !value ? "Current password is required" : "",
            }));
        }

        if (name === "newPassword") {
            const check = passwordSchema.safeParse(value);
            setPasswordErrors((prev) => ({
                ...prev,
                newPassword: check.success ? "" : check.error.issues[0]?.message || "",
                confirmPassword:
                    nextForm.confirmPassword && value !== nextForm.confirmPassword
                        ? AUTH_MESSAGES.PASSWORDS_DO_NOT_MATCH
                        : "",
            }));
        }

        if (name === "confirmPassword") {
            if (!value) {
                setPasswordErrors((prev) => ({
                    ...prev,
                    confirmPassword: AUTH_MESSAGES.CONFIRM_PASSWORD_REQUIRED,
                }));
            } else if (value !== nextForm.newPassword) {
                setPasswordErrors((prev) => ({
                    ...prev,
                    confirmPassword: AUTH_MESSAGES.PASSWORDS_DO_NOT_MATCH,
                }));
            } else {
                setPasswordErrors((prev) => ({ ...prev, confirmPassword: "" }));
            }
        }
    }

    async function handleSubmitPassword(e) {
        e.preventDefault();
        setPasswordError("");
        setPasswordSuccess("");

        if (!passwordForm.currentPassword) {
            setPasswordErrors((prev) => ({
                ...prev,
                currentPassword: "Current password is required",
            }));
            return;
        }

        const pwdCheck = passwordSchema.safeParse(passwordForm.newPassword);
        if (!pwdCheck.success) {
            setPasswordErrors((prev) => ({
                ...prev,
                newPassword: pwdCheck.error.issues[0]?.message,
            }));
            return;
        }

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setPasswordErrors((prev) => ({
                ...prev,
                confirmPassword: AUTH_MESSAGES.PASSWORDS_DO_NOT_MATCH,
            }));
            return;
        }

        setIsChangingPassword(true);
        try {
            await authService.changePassword({
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword,
            });
            setPasswordSuccess(AUTH_MESSAGES.PASSWORD_CHANGE_SUCCESS);
            setPasswordForm({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });
            setShowChangePassword(false);
        } catch (err) {
            setPasswordError(err.message || "Failed to change password");
        } finally {
            setIsChangingPassword(false);
        }
    }

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">User Profile</h1>
                    <p className="card-subtitle">
                        Manage your account information and security credentials
                    </p>
                </div>
            </div>

            <div className="profile-grid">
                <div className="profile-card">
                    <div className="profile-header-row">
                        <h2 className="section-title">Account Details</h2>
                        {!isEditing && (
                            <Button
                                size="small"
                                variant="secondary"
                                onClick={() => {
                                    setIsEditing(true);
                                    setSuccessMessage("");
                                }}
                            >
                                Edit Profile
                            </Button>
                        )}
                    </div>

                    <Alert type="success">{successMessage}</Alert>
                    <Alert>{serverError}</Alert>

                    {loading ? (
                        <p className="card-subtitle">Loading profile details...</p>
                    ) : isEditing ? (
                        <form onSubmit={handleSaveProfile} noValidate className="profile-form">
                            <Input
                                id="profile-name"
                                name="name"
                                label="Full Name *"
                                value={editForm.name}
                                onChange={handleEditChange}
                                error={editErrors.name}
                                disabled={isSavingProfile}
                                required
                            />
                            <Input
                                id="profile-email"
                                name="email"
                                label="Email (Cannot be modified)"
                                value={profile.email || ""}
                                disabled
                            />
                            <Input
                                id="profile-phone"
                                name="phone"
                                label="Mobile Number *"
                                type="tel"
                                placeholder="e.g. 9876543210"
                                value={editForm.phone}
                                onChange={handleEditChange}
                                error={editErrors.phone}
                                disabled={isSavingProfile}
                                required
                            />
                            <div className="profile-form-actions">
                                <Button type="submit" disabled={isSavingProfile}>
                                    {isSavingProfile ? "Saving..." : "Save Changes"}
                                </Button>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={handleCancelEdit}
                                    disabled={isSavingProfile}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    ) : (
                        <div className="profile-details-list">
                            <div className="profile-detail-item">
                                <span className="profile-detail-label">Full Name</span>
                                <span className="profile-detail-value">
                                    {profile.name || "—"}
                                </span>
                            </div>

                            <div className="profile-detail-item">
                                <span className="profile-detail-label">Email Address</span>
                                <span className="profile-detail-value">
                                    {profile.email || "—"}
                                </span>
                            </div>

                            <div className="profile-detail-item">
                                <span className="profile-detail-label">Mobile Number</span>
                                <span className="profile-detail-value">
                                    {profile.phone || "Not provided"}
                                </span>
                            </div>

                            <div className="profile-detail-item">
                                <span className="profile-detail-label">Role</span>
                                <span className="profile-detail-value">
                                    <Badge variant={getRoleBadgeVariant(profile.role)}>
                                        {(profile.role || "student").toUpperCase()}
                                    </Badge>
                                </span>
                            </div>

                            <div className="profile-detail-item">
                                <span className="profile-detail-label">Account Status</span>
                                <span className="profile-detail-value">
                                    <Badge
                                        variant={
                                            (profile.status || "active").toLowerCase() ===
                                            "active"
                                                ? "success"
                                                : "danger"
                                        }
                                    >
                                        {(profile.status || "active").toUpperCase()}
                                    </Badge>
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Password Management Card */}
                <div className="profile-card">
                    <div className="profile-header-row">
                        <div>
                            <h2 className="section-title">Security & Password</h2>
                            <p className="card-subtitle">
                                Change your current password to keep your account safe
                            </p>
                        </div>
                        <Button
                            size="small"
                            variant="secondary"
                            onClick={() => {
                                setShowChangePassword((prev) => !prev);
                                setPasswordError("");
                                setPasswordSuccess("");
                            }}
                        >
                            {showChangePassword ? "Cancel" : "Change Password"}
                        </Button>
                    </div>

                    <Alert type="success">{passwordSuccess}</Alert>
                    <Alert>{passwordError}</Alert>

                    {showChangePassword && (
                        <form onSubmit={handleSubmitPassword} noValidate className="profile-form">
                            <Input
                                id="currentPassword"
                                name="currentPassword"
                                label="Current Password *"
                                type="password"
                                value={passwordForm.currentPassword}
                                onChange={handlePasswordChange}
                                error={passwordErrors.currentPassword}
                                disabled={isChangingPassword}
                                required
                            />
                            <Input
                                id="newPassword"
                                name="newPassword"
                                label="New Password *"
                                type="password"
                                value={passwordForm.newPassword}
                                onChange={handlePasswordChange}
                                error={passwordErrors.newPassword}
                                disabled={isChangingPassword}
                                required
                            />
                            <PasswordRequirements password={passwordForm.newPassword} />
                            <Input
                                id="confirmNewPassword"
                                name="confirmPassword"
                                label="Confirm New Password *"
                                type="password"
                                value={passwordForm.confirmPassword}
                                onChange={handlePasswordChange}
                                error={passwordErrors.confirmPassword}
                                disabled={isChangingPassword}
                                required
                            />
                            <div className="profile-form-actions">
                                <Button type="submit" disabled={isChangingPassword}>
                                    {isChangingPassword ? "Updating..." : "Update Password"}
                                </Button>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => setShowChangePassword(false)}
                                    disabled={isChangingPassword}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ProfilePage;
