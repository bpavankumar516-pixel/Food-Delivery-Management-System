import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

// Pre-seeded demo credentials for instant testing
const DEFAULT_USERS = [
  {
    id: "usr_admin_001",
    name: "Pavan Kumar",
    email: "admin@foodix.com",
    password: "password123",
    role: "Admin",
    phone: "+91 98765 43210",
    useCustomAvatar: false, // Default name-based letter avatar
    avatarGradient: "orange",
    avatar: null,
    title: "Foodix Chief Administrator",
    department: "Platform Operations & Quality Assurance",
    location: "Bengaluru, Karnataka, India",
    bio: "Chief Platform Administrator responsible for restaurant onboarding, culinary catalog quality, merchant settlements, and operational delivery standards across Foodix.",
    joinDate: "January 2024",
    twoFactorEnabled: true,
    notifications: {
      emailAlerts: true,
      orderUpdates: true,
      restaurantApprovals: true,
      systemHealth: true,
    },
    createdAt: "2026-01-10T08:00:00Z",
  },
  {
    id: "usr_cust_004",
    name: "Emily Watson",
    email: "customer@foodix.com",
    password: "password123",
    role: "Customer",
    phone: "+91 98765 01234",
    location: "Indiranagar, Bengaluru",
    city: "Bengaluru",
    bio: "Food enthusiast exploring Bengaluru's best biryanis, artisanal pizzas, and quick comfort meals.",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200",
    title: "Foodie Club VIP",
    useCustomAvatar: true,
    notifications: {
      emailAlerts: true,
      orderUpdates: true,
      promoOffers: true,
    },
    createdAt: "2026-03-20T14:15:00Z",
  },
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load registered users and active session on mount
  useEffect(() => {
    try {
      // Sync Admin name to Pavan Kumar in localStorage
      const storedUsers = localStorage.getItem("foodix_registered_users");
      if (storedUsers) {
        try {
          const parsed = JSON.parse(storedUsers);
          const adminIdx = parsed.findIndex((u) => u.role === "Admin");
          if (adminIdx !== -1 && parsed[adminIdx].name !== "Pavan Kumar") {
            parsed[adminIdx].name = "Pavan Kumar";
            parsed[adminIdx].title = "Foodix Chief Administrator";
            localStorage.setItem(
              "foodix_registered_users",
              JSON.stringify(parsed),
            );
          }
        } catch {
          localStorage.setItem(
            "foodix_registered_users",
            JSON.stringify(DEFAULT_USERS),
          );
        }
      } else {
        localStorage.setItem(
          "foodix_registered_users",
          JSON.stringify(DEFAULT_USERS),
        );
      }

      // Check for existing active session
      const storedSessionUser = localStorage.getItem("foodix_auth_user");
      const storedToken = localStorage.getItem("foodix_token");

      if (storedSessionUser && storedToken) {
        try {
          const parsedSession = JSON.parse(storedSessionUser);
          if (parsedSession.role === "Admin") {
            parsedSession.name = "Pavan Kumar";
            parsedSession.title = "Foodix Chief Administrator";
            if (parsedSession.useCustomAvatar === undefined) {
              parsedSession.useCustomAvatar = false;
            }
            if (!parsedSession.avatarGradient) {
              parsedSession.avatarGradient = "orange";
            }
            localStorage.setItem(
              "foodix_auth_user",
              JSON.stringify(parsedSession),
            );
          }
          setUser(parsedSession);
          setToken(storedToken);
        } catch {
          setUser(JSON.parse(storedSessionUser));
          setToken(storedToken);
        }
      }
    } catch (error) {
      console.error("Failed to restore session:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Helper to fetch all registered users
  const getRegisteredUsers = () => {
    try {
      const stored = localStorage.getItem("foodix_registered_users");
      if (!stored) return DEFAULT_USERS;
      const parsed = JSON.parse(stored);
      const adminIdx = parsed.findIndex((u) => u.role === "Admin");
      if (adminIdx !== -1) {
        parsed[adminIdx].name = "Pavan Kumar";
        parsed[adminIdx].title = "Foodix Chief Administrator";
        parsed[adminIdx].avatar =
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200";
        localStorage.setItem("foodix_registered_users", JSON.stringify(parsed));
      }
      return parsed;
    } catch {
      return DEFAULT_USERS;
    }
  };

  // Login handler
  const login = async ({ email, password, role, rememberMe = false }) => {
    setIsLoading(true);

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const users = getRegisteredUsers();
        const normalizedEmail = email.trim().toLowerCase();

        // Find user by email (supports admin@foodix.com and pavan@foodix.com for Pavan Kumar)
        const foundUser = users.find((u) => {
          const userEmail = u.email.toLowerCase();
          if (
            (normalizedEmail === "admin@foodix.com" ||
              normalizedEmail === "pavan@foodix.com" ||
              normalizedEmail === "pavan") &&
            u.role === "Admin"
          ) {
            return true;
          }
          return userEmail === normalizedEmail;
        });

        if (!foundUser) {
          setIsLoading(false);
          reject(new Error("No account found with this email address."));
          return;
        }

        // Validate password
        if (foundUser.password !== password) {
          setIsLoading(false);
          reject(new Error("Incorrect password. Please verify and try again."));
          return;
        }

        // Enforce only Admin and Customer roles across platform
        const normalizedRole =
          (role || foundUser.role) === "Admin" ? "Admin" : "Customer";

        const authenticatedUser = {
          ...foundUser,
          role: normalizedRole,
          lastLogin: new Date().toISOString(),
        };

        const mockToken = `fdx_jwt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

        // Save session
        setUser(authenticatedUser);
        setToken(mockToken);
        localStorage.setItem(
          "foodix_auth_user",
          JSON.stringify(authenticatedUser),
        );
        localStorage.setItem("foodix_token", mockToken);

        // Handle remember me
        if (rememberMe) {
          localStorage.setItem("foodix_remember_email", normalizedEmail);
          localStorage.setItem("foodix_remember_role", authenticatedUser.role);
        } else {
          localStorage.removeItem("foodix_remember_email");
          localStorage.removeItem("foodix_remember_role");
        }

        setIsLoading(false);
        resolve(authenticatedUser);
      }, 500); // realistic slight network delay
    });
  };

  // Google Single Sign-on Simulation
  const loginWithGoogle = async (selectedRole = "Admin") => {
    setIsLoading(true);
    return new Promise((resolve) => {
      setTimeout(() => {
        const googleUser = {
          id: `usr_google_${Date.now()}`,
          name: selectedRole === "Admin" ? "Pavan Kumar" : "Google User",
          email:
            selectedRole === "Admin"
              ? "admin@foodix.com"
              : "user.google@gmail.com",
          role: selectedRole,
          avatar:
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
          title:
            selectedRole === "Admin"
              ? "Foodix Chief Administrator"
              : "Google Verified Member",
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
        };
        const mockToken = `fdx_google_jwt_${Date.now()}`;

        setUser(googleUser);
        setToken(mockToken);
        localStorage.setItem("foodix_auth_user", JSON.stringify(googleUser));
        localStorage.setItem("foodix_token", mockToken);

        setIsLoading(false);
        resolve(googleUser);
      }, 600);
    });
  };

  // Register handler
  const register = async (userData) => {
    setIsLoading(true);

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const users = getRegisteredUsers();
        const normalizedEmail = userData.email.trim().toLowerCase();

        // Check for duplicates
        if (users.some((u) => u.email.toLowerCase() === normalizedEmail)) {
          setIsLoading(false);
          reject(
            new Error("An account with this email address already exists."),
          );
          return;
        }

        const newUser = {
          id: `usr_${Date.now()}`,
          name: userData.name.trim(),
          email: normalizedEmail,
          password: userData.password,
          role: userData.role || "Admin",
          phone: userData.phone || "+1 (555) 000-0000",
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(userData.name)}`,
          title: `${userData.role || "Member"} at Foodix`,
          createdAt: new Date().toISOString(),
        };

        const updatedUsers = [...users, newUser];
        localStorage.setItem(
          "foodix_registered_users",
          JSON.stringify(updatedUsers),
        );

        // Auto login on register
        const mockToken = `fdx_jwt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        setUser(newUser);
        setToken(mockToken);
        localStorage.setItem("foodix_auth_user", JSON.stringify(newUser));
        localStorage.setItem("foodix_token", mockToken);

        setIsLoading(false);
        resolve(newUser);
      }, 600);
    });
  };

  // Reset password handler
  const resetPassword = async (email, newPassword) => {
    setIsLoading(true);

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const users = getRegisteredUsers();
        const normalizedEmail = email.trim().toLowerCase();
        const index = users.findIndex(
          (u) => u.email.toLowerCase() === normalizedEmail,
        );

        if (index === -1) {
          setIsLoading(false);
          reject(new Error("No account found with this email."));
          return;
        }

        users[index].password = newPassword;
        localStorage.setItem("foodix_registered_users", JSON.stringify(users));

        setIsLoading(false);
        resolve(true);
      }, 500);
    });
  };

  // Update Profile (Real-time dynamic profile updates across platform)
  const updateProfile = async (updatedData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const updatedUser = {
          ...user,
          ...updatedData,
        };
        setUser(updatedUser);
        localStorage.setItem("foodix_auth_user", JSON.stringify(updatedUser));

        // Update in registered users list
        try {
          const stored = localStorage.getItem("foodix_registered_users");
          if (stored) {
            const users = JSON.parse(stored);
            const idx = users.findIndex(
              (u) => u.id === updatedUser.id || u.email === updatedUser.email
            );
            if (idx !== -1) {
              users[idx] = { ...users[idx], ...updatedUser };
              localStorage.setItem("foodix_registered_users", JSON.stringify(users));
            }
          }
        } catch (e) {
          console.warn("Failed to update user in registered users list", e);
        }

        resolve(updatedUser);
      }, 300);
    });
  };

  // Change Password with current password verification
  const changePassword = async (currentPassword, newPassword) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const stored = localStorage.getItem("foodix_registered_users");
          const users = stored ? JSON.parse(stored) : DEFAULT_USERS;
          const idx = users.findIndex(
            (u) => u.id === user?.id || u.email === user?.email
          );

          if (idx !== -1 && users[idx].password !== currentPassword) {
            reject(new Error("Current password does not match."));
            return;
          }

          if (idx !== -1) {
            users[idx].password = newPassword;
            localStorage.setItem("foodix_registered_users", JSON.stringify(users));
          }

          const updatedUser = { ...user, password: newPassword };
          setUser(updatedUser);
          localStorage.setItem("foodix_auth_user", JSON.stringify(updatedUser));

          resolve(true);
        } catch (err) {
          reject(err);
        }
      }, 400);
    });
  };

  // Logout handler
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("foodix_auth_user");
    localStorage.removeItem("foodix_token");
  };

  // Quick helper to fill demo account
  const getDemoAccount = (role = "Admin") => {
    const users = getRegisteredUsers();
    return (
      users.find((u) => u.role.toLowerCase() === role.toLowerCase()) || users[0]
    );
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        loginWithGoogle,
        register,
        resetPassword,
        updateProfile,
        changePassword,
        logout,
        getDemoAccount,
        DEFAULT_USERS,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
