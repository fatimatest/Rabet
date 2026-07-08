import React, { useState } from "react";
import axios from "axios";

interface LoginFormProps {
  onLogin: (role: string, userData: any) => void;
  onForgotPassword: () => void;
  onDownloadApp: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin, onForgotPassword, onDownloadApp }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post("http://127.0.0.1:8000/api/login", {
        email,
        password,
      });

      if (response.data.status === "success" || response.data.success) {
        const user = response.data.user || response.data.data;

        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("auth_token", response.data.token || response.data.access_token || "temp_token");

        onLogin(user.role || "student", user);
      } else {
        setError(response.data.message || "فشل تسجيل الدخول");
      }
    } catch (err: any) {
      if (err.code === "ERR_NETWORK") {
        setError("لا يمكن الاتصال بالسيرفر. تحقق من اتصالك بالإنترنت");
      } else if (err.response?.status === 401) {
        setError("البريد الإلكتروني أو كلمة المرور غير صحيحة");
      } else if (err.response?.status === 422) {
        setError("البيانات المدخلة غير صالحة");
      } else {
        setError(err.response?.data?.message || "حدث خطأ غير متوقع");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <img src="/logo.jpg" alt="Rabet Logo" style={styles.logo} />

        <h2 style={styles.title}>تسجيل الدخول</h2>
        <p style={styles.subtitle}>مرحباً بكم</p>

        {error && <div style={styles.alert}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label style={styles.label}>البريد الإلكتروني</label>
            <input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              required
              dir="ltr"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>كلمة المرور</label>
            <input
              type="password"
              placeholder="*******"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          <a
            href="#"
            style={styles.forgotLink}
            onClick={(e) => {
              e.preventDefault();
              onForgotPassword();
            }}
          >
            هل نسيت كلمة المرور؟
          </a>

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
            {loading ? "جاري تسجيل الدخول..." : "دخول"}
          </button>

          <a
            href="#"
            style={styles.downloadLink}
            onClick={(e) => {
              e.preventDefault();
              onDownloadApp();
            }}
          >
            تنزيل تطبيق النظام
          </a>
        </form>
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
  logo: {
    width: "140px",
    marginBottom: "20px",
  },
  title: {
    color: "#1D4C4F",
    fontSize: "26px",
    fontWeight: 700,
    marginBottom: "5px",
  },
  subtitle: {
    color: "#6C757D",
    fontSize: "15px",
    marginBottom: "35px",
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
  forgotLink: {
    display: "block",
    textAlign: "center",
    marginBottom: "18px",
    color: "#1D4C4F",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
  },
  downloadLink: {
    display: "block",
    textAlign: "center",
    marginTop: "16px",
    color: "#1D4C4F",
    textDecoration: "none",
    fontSize: "13px",
    fontWeight: 500,
    cursor: "pointer",
    opacity: 0.75,
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
};

export default LoginForm;
