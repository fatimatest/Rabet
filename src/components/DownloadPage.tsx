import React, { useState, useEffect } from "react";
import axios from "axios";

interface AppInfo {
  app_name: string;
  version: string;
  size: string;
  last_updated: string;
  min_android_version: string;
  apk_url: string;
  description: string;
}

interface DownloadPageProps {
  onBack: () => void;
}

const DownloadPage: React.FC<DownloadPageProps> = ({ onBack }) => {
  const [appInfo, setAppInfo] = useState<AppInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    axios
      .get("https://academic-system-backend.onrender.com/api/app-info")
      .then((res) => {
        if (res.data.success && res.data.data) {
          setAppInfo(res.data.data);
        } else {
          setError("تعذر تحميل معلومات التطبيق");
        }
      })
      .catch(() => setError("تعذر الاتصال بالسيرفر"))
      .finally(() => setLoading(false));
  }, []);

  const handleDownload = () => {
    if (appInfo?.apk_url) {
      window.open(appInfo.apk_url, "_blank");
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <button onClick={onBack} style={styles.backBtn}>
          ← العودة لتسجيل الدخول
        </button>

        <img src="/logo.jpg" alt="Rabet Logo" style={styles.logo} />

        <h2 style={styles.title}>تنزيل التطبيق</h2>

        {loading && <p style={styles.loadingText}>جاري التحميل...</p>}

        {error && <div style={styles.alert}>{error}</div>}

        {appInfo && !loading && (
          <>
            <p style={styles.subtitle}>{appInfo.description}</p>

            <div style={styles.infoGrid}>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>رقم الإصدار</span>
                <span style={styles.infoValue}>{appInfo.version}</span>
              </div>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>حجم التطبيق</span>
                <span style={styles.infoValue}>{appInfo.size}</span>
              </div>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>آخر تحديث</span>
                <span style={styles.infoValue}>{appInfo.last_updated}</span>
              </div>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>الحد الأدنى لإصدار Android</span>
                <span style={styles.infoValue}>{appInfo.min_android_version}</span>
              </div>
            </div>

            <button onClick={handleDownload} style={styles.downloadBtn}>
              تنزيل التطبيق
            </button>

            <div style={styles.installBox}>
              <h3 style={styles.installTitle}>طريقة التثبيت</h3>
              <ol style={styles.installList}>
                <li>اضغط على زر تنزيل التطبيق</li>
                <li>انتظر حتى يكتمل التنزيل</li>
                <li>افتح ملف APK</li>
                <li>إذا ظهرت رسالة "السماح بالتثبيت من هذا المصدر"، قم بالموافقة مرة واحدة فقط</li>
                <li>بعد انتهاء التثبيت، افتح التطبيق وسجل الدخول باستخدام حسابك</li>
              </ol>
            </div>
          </>
        )}
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
    padding: "20px",
  },
  card: {
    background: "#fff",
    width: "420px",
    maxWidth: "100%",
    padding: "40px 30px",
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
    textAlign: "center",
    position: "relative" as const,
  },
  backBtn: {
    position: "absolute" as const,
    top: "15px",
    right: "15px",
    background: "none",
    border: "none",
    color: "#1D4C4F",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
    padding: "5px 10px",
    borderRadius: "6px",
  },
  logo: {
    width: "140px",
    marginBottom: "15px",
  },
  title: {
    color: "#1D4C4F",
    fontSize: "24px",
    fontWeight: 700,
    marginBottom: "10px",
  },
  subtitle: {
    color: "#6C757D",
    fontSize: "14px",
    marginBottom: "25px",
    lineHeight: 1.6,
  },
  loadingText: {
    color: "#6C757D",
    fontSize: "14px",
    padding: "30px 0",
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
  infoGrid: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "10px",
    marginBottom: "25px",
    textAlign: "right" as const,
  },
  infoItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 14px",
    backgroundColor: "rgba(29, 76, 79, 0.06)",
    borderRadius: "8px",
  },
  infoLabel: {
    fontSize: "13px",
    color: "#6C757D",
    fontWeight: 500,
  },
  infoValue: {
    fontSize: "14px",
    color: "#1D4C4F",
    fontWeight: 700,
  },
  downloadBtn: {
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
    marginBottom: "25px",
  },
  installBox: {
    backgroundColor: "rgba(29, 76, 79, 0.06)",
    borderRadius: "10px",
    padding: "18px 20px",
    textAlign: "right" as const,
  },
  installTitle: {
    color: "#1D4C4F",
    fontSize: "14px",
    fontWeight: 700,
    margin: "0 0 12px",
  },
  installList: {
    margin: 0,
    paddingRight: "20px",
    fontSize: "13px",
    color: "#41676D",
    lineHeight: 2,
  },
};

export default DownloadPage;
