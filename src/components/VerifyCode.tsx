import React, { useState, useRef, useEffect } from "react";
import { MailCheck } from "lucide-react";
import axios from "axios";

interface VerifyCodeProps {
  email: string;
  onBack: () => void;
  onVerified: (otp: string) => void;
}

const VerifyCode: React.FC<VerifyCodeProps> = ({ email, onBack, onVerified }) => {
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...digits];
    newDigits[index] = value.slice(0, 1);
    setDigits(newDigits);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = digits.join("");
    if (code.length !== 6) {
      setError("يرجى إدخال رمز التحقق كاملاً");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/auth/reset-password-verify-otp",
        { email, otp: code }
      );

      if (response.data.status === "success") {
        onVerified(code);
      } else {
        setError(response.data.message || "رمز التحقق غير صحيح أو منتهي الصلاحية");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || "رمز التحقق غير صحيح أو منتهي الصلاحية"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.iconContainer}>
          <MailCheck size={64} color="#1D4C4F" />
        </div>

        <h2 style={styles.title}>أدخل رمز التحقق</h2>
        <p style={styles.desc}>
          يرجى إدخال الرمز المكون من 6 أرقام الذي تم إرساله إلى بريدك الإلكتروني.
          <br />
          <strong>{email}</strong>
        </p>

        {error && <div style={styles.alert}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={styles.otpContainer}>
            {digits.map((digit, index) => (
              <input
                key={index}
                ref={(el) => { inputRefs.current[index] = el; }}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                style={styles.otpInput}
              />
            ))}
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
            {loading ? "جاري التحقق..." : "التحقق من الرمز"}
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
          العودة
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
  otpContainer: {
    display: "flex",
    justifyContent: "space-between",
    direction: "ltr" as const,
    marginBottom: "30px",
  },
  otpInput: {
    width: "45px",
    height: "55px",
    textAlign: "center",
    fontSize: "20px",
    fontWeight: "bold",
    color: "#1D4C4F",
    border: "1.5px solid rgba(29, 76, 79, 0.3)",
    borderRadius: "12px",
    outline: "none",
    transition: "all 0.3s",
    backgroundColor: "#fff",
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

export default VerifyCode;
