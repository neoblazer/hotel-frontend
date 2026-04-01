import { createContext, useContext, useState, useCallback } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [role, setRole] = useState(() => localStorage.getItem("role") || "USER");

  const login = useCallback((data) => {
    const payload = data?.token ? data : (data?.data || data);

    const tok = payload?.token || null;
    const r = payload?.role || "USER";

    // Backend LoginResponse = { token, role, name, email }
    // payload.user is set when a future endpoint returns a full UserResponseDTO
    const u = payload?.user || {
      name:  payload?.name  || (payload?.email ? payload.email.split("@")[0] : null),
      email: payload?.email || null,
      role:  r,
    };

    if (tok) {
      localStorage.setItem("token", tok);
      localStorage.setItem("role", r);
      localStorage.setItem("user", JSON.stringify(u));
    }

    setToken(tok);
    setRole(r);
    setUser(u);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    localStorage.removeItem("favorites");
    setToken(null);
    setRole("USER");
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role,
        isAdmin: role === "ADMIN",
        isLoggedIn: !!token,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);