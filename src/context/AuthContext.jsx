import { createContext, useContext, useState, useCallback } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]   = useState(() => { try { return JSON.parse(localStorage.getItem("user")); } catch { return null; } });
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [role, setRole]   = useState(() => localStorage.getItem("role") || "USER");

  // data shape from backend AuthController:
  // ApiResponse<LoginResponse> → data = { token, role, user: UserResponseDTO }
  const login = useCallback((data) => {
    // Support both unwrapped { token, role, user } and wrapped { data: { token, role, user } }
    const payload = data?.token ? data : (data?.data || data);
    const tok  = payload.token;
    const r    = payload.role || "USER";
    const u    = payload.user || null;

    localStorage.setItem("token", tok);
    localStorage.setItem("role",  r);
    localStorage.setItem("user",  JSON.stringify(u));
    setToken(tok);
    setRole(r);
    setUser(u);
  }, []);

  const logout = useCallback(() => {
    localStorage.clear();
    setToken(null);
    setRole("USER");
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{
      user, token, role,
      isAdmin:   role === "ADMIN",
      isLoggedIn: !!token,
      login,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);