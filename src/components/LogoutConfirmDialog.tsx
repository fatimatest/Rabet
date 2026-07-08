import React from "react";
import { LogOut, X } from "lucide-react";

const primary = "#1D4C4F";

const LogoutConfirmDialog: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}> = ({ isOpen, onClose, onLogout }) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
        background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center",
        justifyContent: "center", zIndex: 9999,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#fff", padding: "30px", borderRadius: "12px",
          width: "380px", textAlign: "center", boxShadow: "0 4px 24px rgba(0,0,0,0.15)",
          animation: "fadeIn 0.2s ease",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            width: "56px", height: "56px", borderRadius: "50%", background: primary,
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px",
          }}
        >
          <LogOut size={26} color="#fff" />
        </div>

        <h3 style={{ margin: "0 0 8px", color: "#2C3E3F", fontSize: "17px", fontWeight: 700 }}>
          تأكيد تسجيل الخروج
        </h3>

        <p style={{ margin: "0 0 20px", color: "#6B7B6E", fontSize: "13px", lineHeight: 1.6 }}>
          هل أنت متأكد أنك تريد تسجيل الخروج من النظام؟
        </p>

        <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
          <button
            onClick={onClose}
            style={{
              flex: 1, background: "#fff", color: primary, border: `1.5px solid ${primary}`,
              padding: "10px", borderRadius: "8px", cursor: "pointer", fontSize: "13px",
              fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = `${primary}08`; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "#fff"; }}
          >
            <X size={16} /> إلغاء
          </button>
          <button
            onClick={onLogout}
            style={{
              flex: 1, background: primary, color: "#fff", border: "none",
              padding: "10px", borderRadius: "8px", cursor: "pointer", fontSize: "13px",
              fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.9"; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
          >
            <LogOut size={16} /> تسجيل الخروج
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutConfirmDialog;
