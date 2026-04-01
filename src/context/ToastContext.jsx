import { createContext, useContext, useState, useCallback, useMemo } from "react";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const show = useCallback((msg, type = "info") => {
    const id = Date.now();
    setToasts(p => [...p, { id, msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3500);
  }, []);

  // Memoized so consumers don't re-render on every toast state change
  const toast = useMemo(() => ({
    success: (m) => show(m, "success"),
    error:   (m) => show(m, "error"),
    info:    (m) => show(m, "info"),
    warning: (m) => show(m, "warning"),
  }), [show]);

  const icons = { success: <CheckCircle size={18}/>, error: <AlertCircle size={18}/>, info: <Info size={18}/>, warning: <AlertTriangle size={18}/> };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div style={{ position:"fixed", bottom:28, right:28, zIndex:9999, display:"flex", flexDirection:"column-reverse", gap:10 }}>
        {toasts.map(t => (
          <div key={t.id} style={{
            display:"flex", alignItems:"center", gap:12, minWidth:280, maxWidth:380,
            padding:"14px 18px", borderRadius:14, boxShadow:"0 10px 40px rgba(0,0,0,.18)",
            background:"#111827", color:"white", fontSize:14, fontWeight:500,
            animation:"toastIn .35s cubic-bezier(.4,0,.2,1) both",
            borderLeft:`4px solid ${t.type==="success"?"#10B981":t.type==="error"?"#EF4444":t.type==="warning"?"#F59E0B":"#3B82F6"}`
          }}>
            <span style={{ color: t.type==="success"?"#10B981":t.type==="error"?"#EF4444":t.type==="warning"?"#F59E0B":"#3B82F6" }}>
              {icons[t.type]}
            </span>
            <span style={{flex:1}}>{t.msg}</span>
            <X size={14} style={{ opacity:.5, cursor:"pointer" }} onClick={() => setToasts(p => p.filter(x => x.id !== t.id))} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);