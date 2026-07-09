import React, { useState } from "react";
import { KeyRound } from "lucide-react";
import axios from "axios";

interface ForgotPasswordProps {
  onBack: () => void;
  onVerified: (email: string) => void;
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onBack, onVerified }) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        "https://academic-system-backend.onrender.com/api/auth/send-password-reset-otp",
        { email }
      );

      if (response.data.status === "success") {
        onVerified(email);
      } else {
        setError(response.data.message || "فشل إرسال رمز التحقق");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || "حدث خطأ. يرجى المحاولة لاحقاً."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.iconContainer}>
          <KeyRound size={64} color="#1D4C4F" />
        </div>

        <h2 style={styles.title}>نسيت كلمة المرور؟</h2>
        <p style={styles.desc}>
          أدخل بريدك الإلكتروني الجامعي المسجل لدينا وسنقوم بإرسال رمز للتحقق
          لاستعادة حسابك.
        </p>

        {error && <div style={styles.alert}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label style={styles.label}>الإيميل الجامعي :</label>
            <input
              type="email"
              placeholder="name@univ.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              required
              dir="ltr"
            />
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
            {loading ? "جاري الإرسال..." : "إرسال رمز التحقق"}
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
  input: {
    width: "100%",
    padding: "10px 15px",
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
};

export default ForgotPassword;
