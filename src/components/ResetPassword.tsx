import React, { useState } from "react";
import { Key, Eye, EyeOff } from "lucide-react";
import axios from "axios";

interface ResetPasswordProps {
  email: string;
  otp: string;
  onBack: () => void;
  onSuccess: () => void;
}

const ResetPassword: React.FC<ResetPasswordProps> = ({ email, otp, onBack, onSuccess }) => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const validatePassword = (pw: string): string | null => {
    if (pw.length < 6) return "كلمة المرور يجب أن تكون 6 أحرف على الأقل";
    if (!/[a-zA-Z]/.test(pw)) return "يجب أن تحتوي كلمة المرور على حرف واحد على الأقل";
    if (!/[0-9]/.test(pw)) return "يجب أن تحتوي كلمة المرور على رقم واحد على الأقل";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const validationError = validatePassword(newPassword);
    if (validationError) {
      setError(validationError);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("كلمتا المرور غير متطابقتين");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/auth/update-forgotten-password",
        { email, password: newPassword }
      );

      if (response.data.status === "success") {
        setSuccess(true);
      } else {
        setError(response.data.message || "فشل تحديث كلمة المرور");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || "حدث خطأ أثناء تحديث كلمة المرور"
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <div style={styles.iconContainer}>
            <Key size={64} color="#1D4C4F" />
          </div>

          <h2 style={styles.title}>تم التحديث بنجاح</h2>
          <p style={styles.desc}>
            تم تحديث كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول.
          </p>

          <a
            href="#"
            style={styles.homeLink}
            onClick={(e) => {
              e.preventDefault();
              onSuccess();
            }}
          >
            الذهاب لتسجيل الدخول
          </a>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.iconContainer}>
          <Key size={64} color="#1D4C4F" />
        </div>

        <h2 style={styles.title}>كلمة مرور جديدة</h2>
        <p style={styles.desc}>
          يرجى إدخال كلمة المرور الجديدة وتأكيدها لحماية حسابك.
        </p>

        {error && <div style={styles.alert}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label style={styles.label}>كلمة المرور الجديدة :</label>
            <div style={styles.inputWrapper}>
              <input
                type={showNew ? "text" : "password"}
                placeholder="********"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={styles.input}
                required
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                style={styles.eyeButton}
                tabIndex={-1}
              >
                {showNew ? <EyeOff size={20} color="#1D4C4F" /> : <Eye size={20} color="#1D4C4F" />}
              </button>
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>تأكيد كلمة المرور :</label>
            <div style={styles.inputWrapper}>
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="********"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={styles.input}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                style={styles.eyeButton}
                tabIndex={-1}
              >
                {showConfirm ? <EyeOff size={20} color="#1D4C4F" /> : <Eye size={20} color="#1D4C4F" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.button,
              ...(loading ? styles.buttonDisabled : {}),
            }}
            onMouseEnter={(e) => {
              if (!loading)
                e.currentTarget.style.backgroundColor = "#133638";
            }}
            onMouseLeave={(e) => {
              if (!loading)
                e.currentTarget.style.backgroundColor = "#1D4C4F";
            }}
          >
            {loading ? "جاري الحفظ..." : "حفظ وتسجيل الدخول"}
          </button>
        </form>

        <a
          href="#"
          style={styles.backLink}
          onClick={(e) => {
            e.preventDefault();
            onBack();
          }}
        >
          العودة لتسجيل الدخول
        </a>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f7f9fb",
  },
  card: {
    background: "#fff",
    width: "380px",
    padding: "40px 30px",
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
    textAlign: "center",
  },
  iconContainer: {
    textAlign: "center",
    marginBottom: "20px",
  },
  title: {
    color: "#1D4C4F",
    fontSize: "26px",
    fontWeight: 700,
    marginBottom: "5px",
  },
  desc: {
    color: "#6C757D",
    fontSize: "14px",
    marginBottom: "30px",
    lineHeight: 1.5,
  },
  alert: {
    padding: "10px",
    borderRadius: "5px",
    marginBottom: "20px",
    fontSize: "14px",
    backgroundColor: "#f8d7da",
    color: "#721c24",
    border: "1px solid #f5c6cb",
  },
  formGroup: {
    textAlign: "right",
    marginBottom: "22px",
  },
  label: {
    display: "block",
    fontSize: "14px",
    fontWeight: 600,
    color: "#133638",
    marginBottom: "8px",
  },
  inputWrapper: {
    position: "relative" as const,
    display: "flex",
    alignItems: "center",
  },
  input: {
    width: "100%",
    padding: "10px 42px 10px 15px",
    backgroundColor: "rgba(29, 76, 79, 0.08)",
    border: "1px solid transparent",
    borderRadius: "10px",
    fontSize: "14px",
    outline: "none",
    transition: "all 0.3s ease",
    textAlign: "left",
    direction: "ltr" as const,
    color: "#1D4C4F",
    fontWeight: 600,
    boxSizing: "border-box" as const,
  },
  eyeButton: {
    position: "absolute" as const,
    left: "12px",
    background: "none",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "4px",
  },
  button: {
    width: "100%",
    backgroundColor: "#1D4C4F",
    color: "#fff",
    border: "none",
    padding: "14px",
    borderRadius: "8px",
    fontSize: "17px",
    fontWeight: 700,
    cursor: "pointer",
    transition: "background-color 0.3s",
  },
  buttonDisabled: {
    opacity: 0.7,
    cursor: "not-allowed",
  },
  backLink: {
    display: "block",
    textAlign: "center",
    marginTop: "20px",
    color: "#1D4C4F",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: 700,
    cursor: "pointer",
  },
  homeLink: {
    display: "block",
    textAlign: "center",
    marginTop: "20px",
    color: "#1D4C4F",
    textDecoration: "none",
    fontWeight: "bold",
    fontSize: "14px",
    cursor: "pointer",
  },
};

export default ResetPassword;
