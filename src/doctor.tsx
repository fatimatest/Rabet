import React, { useState, useEffect, useCallback, useRef } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useParams, useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import { default as autoTable } from "jspdf-autotable";
import { QRCodeCanvas } from 'qrcode.react';
import SystemLogo from "./components/SystemLogo";
import LogoutConfirmDialog from "./components/LogoutConfirmDialog";
import {
  LayoutDashboard, BookOpen, ClipboardCheck, FileQuestion, FileText,
  Award, UserCircle, LogOut, Bell, Search, Users, BarChart3,
  Layers, CheckCircle, XCircle, GraduationCap, School,
  Building2, FolderOpen, CalendarCheck, CalendarPlus, QrCode,
  Lock, Unlock, PlusCircle, Eye, Pencil, Trash2,
  BadgeCheck, Star, Save, FileSpreadsheet, Scale,
  ChartPie, Filter, Mail, Phone, LockKeyhole,
  EyeOff, Key, BellRing, ShieldCheck, X, Wifi,
  CheckCheck, Home, ArrowRightFromLine, UserMinus,
  Upload, Download, ClipboardList, ClipboardCopy, ChevronDown, ChevronUp, Clock,
} from "lucide-react";

// ================= إعدادات الـ API =================
const API = "http://127.0.0.1:8000/api";
const primary: string = "#1D4C4F";

// ================= Helper Functions =================
const BASE_URL = API.replace('/api', '');
const getFileUrl = (filePath: string | null | undefined): string => {
  if (!filePath) return '';
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) return filePath;
  const cleanPath = filePath.replace(/^\/?(?:storage\/)?/, '');
  return `${BASE_URL}/api/file/${cleanPath}`;
};
const getDoctorId = (): number | null => {
  try {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      if (user.id && (user.role === 'doctor' || user.user_type === 'doctor' || user.role === 'ta')) {
        return user.id;
      }
    }
  } catch (e) {
    console.error('Error parsing user from localStorage:', e);
  }

  try {
    const sessionUser = sessionStorage.getItem('user');
    if (sessionUser) {
      const user = JSON.parse(sessionUser);
      if (user.id && (user.role === 'doctor' || user.user_type === 'doctor' || user.role === 'ta')) {
        return user.id;
      }
    }
  } catch (e) {
    console.error('Error parsing user from sessionStorage:', e);
  }

  return null;
};

// ================= تعريف الأنواع (Types) =================
interface User {
  id: number;
  name: string;
  email: string;
  role?: 'student' | 'doctor' | 'admin' | 'ta';
  user_type?: 'student' | 'doctor' | 'admin' | 'ta';
  academic_number?: string;
  department_id?: number;
  title?: string;
  department_name?: string;
}

interface Subject {
  id: number;
  name: string;
  code: string;
  department_id: number;
}

interface CourseOffering {
  id: number;
  subject_id: number;
  doctor_id: number;
  term_id: number;
  level: number;
  department_id: number;
  subject_name?: string;
  subject_code?: string;
  doctor_name?: string;
  department_name?: string;
  term_name?: string;
  study_type?: string;
}

interface Assignment {
  id: number;
  offering_id: number;
  creator_id: number;
  title: string;
  type: 'assignment' | 'quiz';
  description?: string;
  max_grade: number;
  due_date: string;
  file_path?: string;
  created_at: string;
  category?: 'theoretical' | 'practical';
  offering_name?: string;
  offering_ids?: number[];
  department_names?: string[];
  submission_count?: number;
}

interface Submission {
  id: number;
  assignment_id: number;
  student_id: number;
  file_path?: string;
  submission_text?: string;
  submitted_at: string;
  grade?: number;
  doctor_notes?: string;
  status: 'pending' | 'graded' | 'rejected';
  student_name?: string;
  assignment_title?: string;
  assignment_max_grade?: number;
}

interface AttendanceSession {
  id: number;
  course_offering_id: number;
  doctor_id: number;
  session_token: string;
  qr_code_value: string;
  start_time: string;
  end_time?: string;
  is_active: boolean;
  offering_name?: string;
  session_number?: number;
}

interface AttendanceRecord {
  id: number;
  attendance_session_id: number;
  student_id: number;
  status: 'present' | 'absent' | 'late';
  scanned_at?: string;
  student_name?: string;
}

interface Grade {
  id: number;
  student_id: number;
  offering_id: number;
  attendance_grade: number;
  assignments_grade: number;
  quizzes_grade: number;
  midterm_grade: number;
  final_exam_grade: number;
  total_grade: number;
  updated_at: string;
  student_name?: string;
  subject_name?: string;
  major_name?: string;
}

interface JoinRequest {
  id: number;
  student_id: number;
  offering_id: number;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
  student_name?: string;
  subject_name?: string;
  student_major?: string;
}

interface Department {
  id: number;
  name: string;
  college_id: number;
  levels_count: number;
}

interface Notification {
  id: number;
  user_id: number;
  type: string;
  title: string;
  body?: string;
  message: string;
  notification_type: string;
  reference_type?: string;
  reference_id?: number;
  offering_id?: number;
  is_read: boolean;
  created_at: string;
}

// ================= قائمة الأقسام =================
const majorsList = ["الكل", "علوم الحاسب", "نظم المعلومات", "تكنولوجيا المعلومات", "تقنية المعلومات", "هندسة البرمجيات", "الأمن المعلوماتي", "الشبكات والاتصالات"];

const menuIcons: Record<string, React.ReactNode> = {
  "/": <LayoutDashboard size={20} />,
  "/subjects": <BookOpen size={20} />,
  "/attendance": <ClipboardCheck size={20} />,
  "/quizzes": <FileQuestion size={20} />,
  "/assignments": <FileText size={20} />,
  "/grades": <Award size={20} />,
  "/reports": <BarChart3 size={20} />,
  "/profile": <UserCircle size={20} />,
};

const DoctorSidebar: React.FC<{ doctorInfo: User | null, onLogout: () => void }> = ({ doctorInfo, onLogout }) => {
  const location = useLocation();
  const menu = [
    { name: "الرئيسية", path: "/" },
    { name: "المواد", path: "/subjects" },
    { name: "الحضور", path: "/attendance" },
    { name: "الكويزات", path: "/quizzes" },
    { name: "التكاليف", path: "/assignments" },
    { name: "الدرجات", path: "/grades" },
    { name: "التقارير", path: "/reports" },
    { name: "الملف الشخصي", path: "/profile" },
  ];

  return (
    <div style={{ 
      width: "260px", 
      background: "#1D4C4F",
      color: "#fff", 
      minHeight: "100vh", 
      position: "fixed", 
      right: 0, 
      top: 0, 
      bottom: 0, 
      overflowY: "auto", 
      zIndex: 100 
    }}>
      <div style={{ textAlign: "center", marginBottom: "15px", padding: "20px 12px 12px" }}>
        <SystemLogo />
        
        <h3 style={{ margin: 0, fontSize: "15px" }}>{doctorInfo?.name || "جاري التحميل..."}</h3>
        <p style={{ fontSize: "12px", opacity: 0.7 }}>{doctorInfo?.title || ""}</p>
      </div>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {menu.map((item) => {
          const active = location.pathname === item.path;
          return (
            <li key={item.path}>
              <Link to={item.path} style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: "12px", 
                padding: "12px 20px", 
                textDecoration: "none", 
                color: "#fff",
                background: active ? "rgba(255,255,255,0.15)" : "transparent", 
                borderRight: active ? "4px solid #fff" : "none",
                fontSize: "14px",
                fontWeight: active ? 700 : 500,
              }}>
                <span style={{ display: "flex", color: "#fff" }}>{menuIcons[item.path]}</span>
                <span>{item.name}</span>
              </Link>
            </li>
          );
        })}
        <li style={{ marginTop: "20px" }}>
          <button 
            onClick={onLogout}
            style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "12px", 
              padding: "12px 20px", 
              width: "100%", 
              border: "none", 
              background: "transparent", 
              color: "#fff", 
              textAlign: "right", 
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: 500,
            }}
          >
            <span style={{ display: "flex", color: "#fff" }}><LogOut size={20} /></span>
            <span>تسجيل الخروج</span>
          </button>
        </li>
      </ul>
    </div>
  );
};

const TopBar: React.FC<{ doctorInfo: User | null }> = ({ doctorInfo }) => {
  const location = useLocation();
  const isDashboard = location.pathname === '/';
  const [notificationsCount, setNotificationsCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationsList, setNotificationsList] = useState<any[]>([]);
  
  const navigate = useNavigate();

  const fetchUnreadCount = useCallback(() => {
    if (!doctorInfo?.id) return;
    fetch(`${API}/users/${doctorInfo.id}/notifications/unread-count`)
      .then(res => res.json())
      .then(data => setNotificationsCount(data.count || 0))
      .catch(() => {});
  }, [doctorInfo]);

  const fetchNotifications = useCallback(() => {
    if (!doctorInfo?.id) return;
    fetch(`${API}/users/${doctorInfo.id}/notifications`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setNotificationsList(data.data || []);
        }
      })
      .catch(() => {});
  }, [doctorInfo]);

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 8000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  const markAllRead = async () => {
    if (!doctorInfo?.id) return;
    try {
      await fetch(`${API}/notifications/read-all`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: doctorInfo.id }),
      });
      setNotificationsCount(0);
      setNotificationsList(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleBellClick = () => {
    const opening = !showNotifications;
    setShowNotifications(opening);
    if (opening) {
      fetchNotifications();
      markAllRead().then(() => fetchUnreadCount());
    }
  };

  return (
    <div
      style={{
        background: "#fff",
        padding: "12px 25px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
        position: "sticky",
        top: 0,
        zIndex: 99,
        marginRight: "260px",
        width: "calc(100% - 260px)"
      }}
    >
      <div style={{ position: "relative" }}>
        <div
          style={{ position: "relative", cursor: "pointer", display: "inline-block" }}
          onClick={handleBellClick}
        >
          <Bell size={22} color="#1D4C4F" />
          {notificationsCount > 0 && (
            <span
              style={{
                position: "absolute",
                top: "-6px",
                right: "-8px",
                background: "#e74c3c",
                color: "#fff",
                fontSize: "10px",
                fontWeight: 700,
                padding: "2px 6px",
                borderRadius: "50%",
                minWidth: "16px",
                textAlign: "center",
                lineHeight: "12px",
              }}
            >
              {notificationsCount}
            </span>
          )}
        </div>

        {/* Notifications Panel */}
        {showNotifications && (
          <>
            <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 998 }} onClick={() => setShowNotifications(false)} />
            <div style={{ position: "absolute", top: "100%", right: 0, marginTop: 8, width: 360, background: "#fff", borderRadius: 12, boxShadow: "0 8px 30px rgba(0,0,0,0.15)", zIndex: 999, maxHeight: 400, overflow: "auto", border: "1px solid #eee" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", borderBottom: "1px solid #f0f0f0" }}>
                <span style={{ fontWeight: 700, fontSize: 14, color: primary }}>الإشعارات</span>
                <button onClick={() => setShowNotifications(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "#999" }}>✕</button>
              </div>
              {notificationsList.length === 0 ? (
                <div style={{ padding: 30, textAlign: "center", color: "#999", fontSize: 13 }}>لا توجد إشعارات</div>
              ) : (
                notificationsList.map((n: any) => (
                  <div key={n.id} style={{ padding: "12px 16px", borderBottom: "1px solid #f5f5f5", background: n.is_read ? "#fff" : "#f0f7f7", cursor: "pointer" }}
                    onClick={() => {
                      setShowNotifications(false);
                      if (!n.is_read) {
                        fetch(`${API}/notifications/${n.id}/read`, { method: 'PUT' })
                          .catch(() => {});
                        setNotificationsList(prev => prev.map(x => x.id === n.id ? { ...x, is_read: true } : x));
                      }
                      if (n.reference_type === 'join_requests') navigate('/join-requests');
                      else if (n.reference_type === 'assignment' || n.reference_type === 'quiz') navigate('/submissions-status', { state: { type: n.reference_type, id: n.reference_id } });
                    }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: "#333", marginBottom: 2 }}>{n.title || n.type}</div>
                    <div style={{ fontSize: 12, color: "#888" }}>{n.message || n.body}</div>
                    <div style={{ fontSize: 10, color: "#aaa", marginTop: 4 }}>{n.created_at ? new Date(n.created_at).toLocaleString("ar-SA") : ''}</div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <span style={{ fontSize: "14px", fontWeight: 600, color: "#1D4C4F" }}>{doctorInfo?.name || "دكتور"}</span>
        <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "#1D4C4F", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "18px" }}>
          {doctorInfo?.name?.charAt(0) || "د"}
        </div>
      </div>
    </div>
  );
};

const statCards = [
  { key: "departments", label: "الأقسام", icon: <Layers size={22} /> },
  { key: "levels", label: "المستويات", icon: <BarChart3 size={22} /> },
  { key: "subjects", label: "المواد", icon: <BookOpen size={22} /> },
  { key: "students", label: "الطلاب", icon: <Users size={22} /> },
  { key: "quizzes", label: "الكويزات", icon: <FileQuestion size={22} /> },
  { key: "assignments", label: "التكاليف", icon: <FileText size={22} /> },
  { key: "materials", label: "المقررات", icon: <FolderOpen size={22} /> },
  { key: "sessions", label: "جلسات الحضور", icon: <CalendarCheck size={22} /> },
  { key: "pending_requests", label: "طلبات معلقة", icon: <Bell size={22} /> },
  { key: "submissions", label: "التسليمات", icon: <Upload size={22} /> },
];

const Dashboard: React.FC = () => {
  const [activeSubjects, setActiveSubjects] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({ subjects: 0, levels: 0, departments: 0, students: 0, quizzes: 0, assignments: 0, materials: 0, sessions: 0, pending_requests: 0, submissions: 0 });
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [approvedRequests, setApprovedRequests] = useState<any[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null);
  const [statusTab, setStatusTab] = useState<"pending" | "approved">("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const doctorId = getDoctorId();
    if (!doctorId) {
      setLoading(false);
      return;
    }

    const fetchAll = async () => {
      try {
        const [subjectsRes, statsRes, pendingRes, approvedRes] = await Promise.all([
          fetch(`${API}/doctor/active-subjects/${doctorId}`),
          fetch(`${API}/doctor/stats/${doctorId}`),
          fetch(`${API}/doctor/join-requests/${doctorId}?status=pending`),
          fetch(`${API}/doctor/join-requests/${doctorId}?status=approved`),
        ]);

        const subjectsData = await subjectsRes.json();
        if (subjectsData.success) {
          setActiveSubjects(subjectsData.data);
        }

        const statsData = await statsRes.json();
        if (statsData.success && statsData.data) {
          setStats(statsData.data);
        }

        const pendingData = await pendingRes.json();
        if (pendingData.success) {
          setPendingRequests(pendingData.data);
        }

        const approvedData = await approvedRes.json();
        if (approvedData.success) {
          setApprovedRequests(approvedData.data);
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      }
      setLoading(false);
    };

    fetchAll();
  }, []);

  const processJoinRequest = async (requestId: number, action: 'approve' | 'reject', verifyFirst: boolean = false): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await fetch(`${API}/join-requests/${requestId}/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          verify_first: verifyFirst,
          rejection_reason: action === 'reject' ? 'تم رفض الطلب من قبل الدكتور' : undefined,
        }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        const req = pendingRequests.find(r => r.id === requestId);
        setPendingRequests(prev => prev.filter(r => r.id !== requestId));
        if (action === 'approve' && req) {
          setApprovedRequests(prev => [...prev, { ...req, status: 'approved' }]);
        }
        return { success: true, message: data.message || '' };
      }
      return { success: false, message: data.message || 'فشل الإجراء' };
    } catch (err) {
      console.error(err);
      return { success: false, message: 'حدث خطأ أثناء معالجة الطلب' };
    }
  };

  const handleBulkAction = async (verifyFirst: boolean) => {
    if (filteredPending.length === 0) return;
    let successCount = 0;
    let failCount = 0;
    const targets = [...filteredPending];
    for (const req of targets) {
      const result = await processJoinRequest(req.id, 'approve', verifyFirst);
      if (result.success) {
        successCount++;
      } else {
        failCount++;
      }
    }
    if (failCount === 0 && successCount > 0) {
      alert(`تم قبول ${successCount} طلب بنجاح`);
    } else if (successCount > 0 && failCount > 0) {
      alert(`تم قبول ${successCount} طلب، وتعذر قبول ${failCount} طلب (غير مسجلين)`);
    } else if (successCount === 0 && failCount > 0) {
      alert('تعذر قبول أي طلب (الطلاب غير مسجلين في الكلية)');
    }
  };

  const selectedOfferingIds = selectedSubjectId
    ? activeSubjects.find(s => s.subject_id === selectedSubjectId)?.offering_ids || []
    : [];

  const matchesSearch = (req: any) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.trim().toLowerCase();
    return (req.student_name && req.student_name.toLowerCase().includes(q)) ||
           (req.academic_number && req.academic_number.toLowerCase().includes(q)) ||
           (req.email && req.email.toLowerCase().includes(q));
  };

  const filteredPending = (selectedSubjectId
    ? pendingRequests.filter(r => selectedOfferingIds.includes(Number(r.offering_id)))
    : pendingRequests
  ).filter(matchesSearch);

  const filteredApproved = (selectedSubjectId
    ? approvedRequests.filter(r => selectedOfferingIds.includes(Number(r.offering_id)))
    : approvedRequests
  ).filter(matchesSearch);

  if (loading) {
    return <div style={{ padding: "20px", marginRight: "260px", width: "calc(100% - 260px)" }}>جاري التحميل...</div>;
  }

  return (
    <div style={{ padding: "25px", marginRight: "260px", width: "calc(100% - 260px)" }}>
      <h2 style={{ marginBottom: "25px", color: "#1D4C4F", fontSize: "24px", fontWeight: 700 }}>لوحة التحكم</h2>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(155px, 1fr))", gap: "16px", marginBottom: "30px" }}>
        {statCards.map((card) => (
          <div key={card.key} style={{ background: "#fff", padding: "18px", borderRadius: "12px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", textAlign: "center" }}>
            <div style={{ width: "44px", height: "44px", borderRadius: "10px", background: "rgba(29, 76, 79, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px" }}>
              <span style={{ color: "#1D4C4F", display: "flex" }}>{card.icon}</span>
            </div>
            <h3 style={{ margin: 0, fontSize: "22px", fontWeight: 700, color: "#1D4C4F" }}>{stats[card.key] ?? 0}</h3>
            <p style={{ margin: "3px 0 0", fontSize: "12px", color: "#6C757D" }}>{card.label}</p>
          </div>
        ))}
      </div>

      <div style={{ background: "#fff", borderRadius: "12px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", padding: "20px" }}>
        <h3 style={{ margin: "0 0 15px", color: "#1D4C4F", fontSize: "16px", fontWeight: 700 }}>طلبات الانضمام</h3>

        <div style={{ display: "flex", gap: "6px", marginBottom: "16px", flexWrap: "wrap", borderBottom: "1px solid #eee", paddingBottom: "12px" }}>
          <button
            onClick={() => setSelectedSubjectId(null)}
            style={{
              padding: "6px 16px", borderRadius: "20px", border: "none", cursor: "pointer", fontSize: "13px", fontWeight: 600,
              background: selectedSubjectId === null ? "#1D4C4F" : "rgba(29, 76, 79, 0.08)",
              color: selectedSubjectId === null ? "#fff" : "#1D4C4F",
            }}
          >
            الكل
          </button>
          {activeSubjects.map((subj) => (
            <button
              key={subj.subject_id}
              onClick={() => setSelectedSubjectId(subj.subject_id)}
              style={{
                padding: "6px 16px", borderRadius: "20px", border: "none", cursor: "pointer", fontSize: "13px", fontWeight: 600,
                background: selectedSubjectId === subj.subject_id ? "#1D4C4F" : "rgba(29, 76, 79, 0.08)",
                color: selectedSubjectId === subj.subject_id ? "#fff" : "#1D4C4F",
              }}
            >
              {subj.subject_name}
            </button>
          ))}
        </div>

        <div style={{ position: "relative", marginBottom: "16px" }}>
          <Search size={16} color="#1D4C4F" style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)" }} />
          <input
            type="text"
            placeholder="بحث باسم الطالب أو الرقم الأكاديمي أو البريد..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%", padding: "10px 36px 10px 12px", border: "1px solid #e0e0e0",
              borderRadius: "8px", fontSize: "13px", outline: "none", background: "#fff",
              boxSizing: "border-box", color: "#333",
            }}
          />
          {searchQuery && (
            <span
              onClick={() => setSearchQuery("")}
              style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", cursor: "pointer", color: "#999", fontSize: "16px", lineHeight: 1 }}
            >
              &times;
            </span>
          )}
        </div>

        <div style={{ display: "flex", gap: "0", marginBottom: "18px", borderBottom: "2px solid #eee" }}>
          <button
            onClick={() => setStatusTab("pending")}
            style={{
              padding: "8px 20px", border: "none", cursor: "pointer", fontSize: "14px", fontWeight: 600,
              background: "none", color: statusTab === "pending" ? "#1D4C4F" : "#6C757D",
              borderBottom: statusTab === "pending" ? "2px solid #1D4C4F" : "2px solid transparent",
              marginBottom: "-2px",
            }}
          >
            قيد الانتظار ({filteredPending.length})
          </button>
          <button
            onClick={() => setStatusTab("approved")}
            style={{
              padding: "8px 20px", border: "none", cursor: "pointer", fontSize: "14px", fontWeight: 600,
              background: "none", color: statusTab === "approved" ? "#1D4C4F" : "#6C757D",
              borderBottom: statusTab === "approved" ? "2px solid #1D4C4F" : "2px solid transparent",
              marginBottom: "-2px",
            }}
          >
            تمت الموافقة ({filteredApproved.length})
          </button>
        </div>

        {statusTab === "pending" && (
          <div>
            <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
              <button
                onClick={() => handleBulkAction(false)}
                disabled={filteredPending.length === 0}
                style={{
                  padding: "8px 18px", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: 600,
                  background: "rgba(29, 76, 79, 0.08)", color: "#1D4C4F", border: "1px solid #1D4C4F",
                  opacity: filteredPending.length === 0 ? 0.5 : 1,
                }}
              >
                <CheckCircle size={15} style={{ marginLeft: 4 }} /> قبول الكل المباشر
              </button>
              <button
                onClick={() => handleBulkAction(true)}
                disabled={filteredPending.length === 0}
                style={{
                  padding: "8px 18px", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: 600,
                  background: "#1D4C4F", color: "#fff", border: "none",
                  opacity: filteredPending.length === 0 ? 0.5 : 1,
                }}
              >
                <CheckCircle size={15} style={{ marginLeft: 4 }} /> قبول الكل الموثق
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {filteredPending.map(req => (
                <div key={req.id} style={{ border: "1px solid #f0f0f0", borderRadius: "10px", padding: "14px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "8px", marginBottom: "12px" }}>
                    <div><span style={{ fontSize: "11px", color: "#6C757D" }}>الطالب</span><p style={{ margin: 0, fontWeight: 600, color: "#1D4C4F", fontSize: "13px" }}>{req.student_name}</p></div>
                    <div><span style={{ fontSize: "11px", color: "#6C757D" }}>الرقم الأكاديمي</span><p style={{ margin: 0, color: "#333", fontSize: "13px" }}>{req.academic_number || "-"}</p></div>
                    <div><span style={{ fontSize: "11px", color: "#6C757D" }}>الكلية</span><p style={{ margin: 0, color: "#333", fontSize: "13px" }}>{req.college_name || "-"}</p></div>
                    <div><span style={{ fontSize: "11px", color: "#6C757D" }}>القسم</span><p style={{ margin: 0, color: "#333", fontSize: "13px" }}>{req.department_name || "-"}</p></div>
                    <div><span style={{ fontSize: "11px", color: "#6C757D" }}>المستوى</span><p style={{ margin: 0, color: "#333", fontSize: "13px" }}>{req.level || "-"}</p></div>
                    <div><span style={{ fontSize: "11px", color: "#6C757D" }}>نوع الدراسة</span><p style={{ margin: 0, color: "#333", fontSize: "13px" }}>{req.study_type === "paid" ? "نفقة" : "عام"}</p></div>
                    <div style={{ gridColumn: "1 / -1" }}><span style={{ fontSize: "11px", color: "#6C757D" }}>المادة</span><p style={{ margin: 0, color: "#333", fontSize: "13px" }}>{req.subject_name}</p></div>
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      onClick={async () => { const r = await processJoinRequest(req.id, 'reject', false); if (!r.success) alert(r.message); }}
                      style={{
                        flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "4px",
                        background: "rgba(220, 53, 69, 0.08)", color: "#dc3545", border: "1px solid #dc3545",
                        padding: "8px", borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: 600,
                      }}
                    >
                      <XCircle size={15} /> رفض
                    </button>
                    <button
                      onClick={async () => { const r = await processJoinRequest(req.id, 'approve', false); if (!r.success) alert(r.message); }}
                      style={{
                        flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "4px",
                        background: "rgba(29, 76, 79, 0.08)", color: "#1D4C4F", border: "1px solid #1D4C4F",
                        padding: "8px", borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: 600,
                      }}
                    >
                      <CheckCircle size={15} /> قبول مباشر
                    </button>
                    <button
                      onClick={async () => { const r = await processJoinRequest(req.id, 'approve', true); if (!r.success) alert(r.message); }}
                      style={{
                        flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "4px",
                        background: "#1D4C4F", color: "#fff", border: "none",
                        padding: "8px", borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: 600,
                      }}
                    >
                      <CheckCircle size={15} /> قبول موثق
                    </button>
                  </div>
                </div>
              ))}
              {filteredPending.length === 0 && <p style={{ fontSize: "13px", color: "#999", textAlign: "center", padding: "20px" }}>لا توجد طلبات معلقة</p>}
            </div>
          </div>
        )}

        {statusTab === "approved" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {filteredApproved.map(req => (
              <div key={req.id} style={{ border: "1px solid #f0f0f0", borderRadius: "10px", padding: "14px", background: "rgba(29, 76, 79, 0.03)" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "8px", marginBottom: "8px" }}>
                  <div><span style={{ fontSize: "11px", color: "#6C757D" }}>الطالب</span><p style={{ margin: 0, fontWeight: 600, color: "#1D4C4F", fontSize: "13px" }}>{req.student_name}</p></div>
                  <div><span style={{ fontSize: "11px", color: "#6C757D" }}>الرقم الأكاديمي</span><p style={{ margin: 0, color: "#333", fontSize: "13px" }}>{req.academic_number || "-"}</p></div>
                  <div><span style={{ fontSize: "11px", color: "#6C757D" }}>المادة</span><p style={{ margin: 0, color: "#333", fontSize: "13px" }}>{req.subject_name}</p></div>
                  <div><span style={{ fontSize: "11px", color: "#6C757D" }}>القسم</span><p style={{ margin: 0, color: "#333", fontSize: "13px" }}>{req.department_name || "-"}</p></div>
                  <div><span style={{ fontSize: "11px", color: "#6C757D" }}>المستوى</span><p style={{ margin: 0, color: "#333", fontSize: "13px" }}>{req.level || "-"}</p></div>
                  <div><span style={{ fontSize: "11px", color: "#6C757D" }}>نوع الدراسة</span><p style={{ margin: 0, color: "#333", fontSize: "13px" }}>{req.study_type === "paid" ? "نفقة" : "عام"}</p></div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <CheckCircle size={14} color="#1D4C4F" />
                  <span style={{ fontSize: "13px", color: "#1D4C4F", fontWeight: 600 }}>تمت الموافقة</span>
                </div>
              </div>
            ))}
            {filteredApproved.length === 0 && <p style={{ fontSize: "13px", color: "#999", textAlign: "center", padding: "20px" }}>لا توجد طلبات موافق عليها</p>}
          </div>
        )}
      </div>
    </div>
  );
};

// ================= Attendance Page =================
const AttendancePage: React.FC = (): JSX.Element => {
  const primary = "#1D4C4F";
  const primaryDark = "#0D2E30";
  const successColor = "#2e7d32";
  const errorColor = "#c62828";

  const doctorId = getDoctorId();

  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSubjectId, setFilterSubjectId] = useState<number | null>(null);

  const [departments, setDepartments] = useState<any[]>([]);
  const [selectedDeptIds, setSelectedDeptIds] = useState<number[]>([]);
  const [historyFilterDeptIds, setHistoryFilterDeptIds] = useState<number[]>([]);
  const [deptLoading, setDeptLoading] = useState(false);

  const [lectureChoice, setLectureChoice] = useState<number>(1); // 1=محاضرة جديدة, 2=استكمال جلسة سابقة

  const [activeSession, setActiveSession] = useState<any | null>(null);
  const [creating, setCreating] = useState(false);
  const [timer, setTimer] = useState(30);
  const [attendanceCounts, setAttendanceCounts] = useState({ present: 0, absent: 0 });

  const [sessionHistory, setSessionHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [expandedSessionId, setExpandedSessionId] = useState<number | null>(null);
  const [expandedDetails, setExpandedDetails] = useState<any>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [expandedTab, setExpandedTab] = useState<'present' | 'absent'>('present');

  const [activeDetails, setActiveDetails] = useState<any>(null);
  const [activeDetailsLoading, setActiveDetailsLoading] = useState(false);
  const [activeDetailsTab, setActiveDetailsTab] = useState<'present' | 'absent'>('present');

  const timerRef = useRef<number>(30);
  const activeDetailsRef = useRef<any>(null);

  useEffect(() => {
    if (!doctorId) { setLoading(false); return; }
    fetch(`${API}/doctor/unique-subjects/${doctorId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setSubjects(data.data || []);
        setLoading(false);
      })
      .catch(err => { console.error(err); setLoading(false); });
  }, [doctorId]);

  useEffect(() => {
    if (!filterSubjectId) {
      setDepartments([]);
      setSelectedDeptIds([]);
      setActiveSession(null);
      setSessionHistory([]);
      return;
    }
    // Derive departments from the subjects data (offerings array) using real department_id
    const subject = subjects.find((s: any) => s.subject_id === filterSubjectId);
    if (subject && subject.offerings && subject.offerings.length > 0) {
      const uniqueDepts: any[] = [];
      const seen = new Set();
      (subject.offerings as any[]).forEach((o: any) => {
        if (o.department_name && !seen.has(o.department_id)) {
          seen.add(o.department_id);
          uniqueDepts.push({ id: o.department_id, name: o.department_name, offering_id: o.id });
        }
      });
      setDepartments(uniqueDepts);
    } else {
      // Fallback: fetch departments
      setDeptLoading(true);
      fetch(`${API}/subjects/${filterSubjectId}/departments`)
        .then(res => res.json())
        .then(data => { if (data.success) setDepartments(data.data || []); setDeptLoading(false); })
        .catch(() => setDeptLoading(false));
    }
    setSelectedDeptIds([]);
    setActiveSession(null);
    setSessionHistory([]);
  }, [filterSubjectId, subjects]);

  const getSelectedOfferingIds = useCallback((): number[] => {
    const subject = subjects.find((s: any) => s.subject_id === filterSubjectId);
    if (!subject || selectedDeptIds.length === 0) return [];
    // selectedDeptIds are now real department_ids
    // Find all offerings matching the selected department_ids
    if (subject.offerings && subject.offerings.length > 0) {
      return subject.offerings
        .filter((o: any) => selectedDeptIds.includes(o.department_id))
        .map((o: any) => o.id);
    }
    return subject.offering_ids || [];
  }, [subjects, filterSubjectId, selectedDeptIds]);

  const checkActiveSession = useCallback(async () => {
    if (!filterSubjectId || selectedDeptIds.length === 0) return;
    const offeringIds = getSelectedOfferingIds();
    if (offeringIds.length === 0) return;
    try {
      const res = await fetch(`${API}/attendance-sessions/active`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ offering_ids: offeringIds, department_ids: selectedDeptIds, subject_id: filterSubjectId }),
      });
      const data = await res.json();
      if (data.success) {
        if (data.has_active && data.data) {
          setActiveSession(data.data);
          setAttendanceCounts({ present: data.data.present_count || 0, absent: data.data.absent_count || 0 });
        } else {
          setActiveSession(null);
        }
      }
    } catch (err) { console.error(err); }
  }, [filterSubjectId, selectedDeptIds, getSelectedOfferingIds]);

  useEffect(() => { checkActiveSession(); }, [checkActiveSession]);

  useEffect(() => {
    if (!activeSession) return;
    const sid = activeSession.id;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API}/attendance-sessions/attendees`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session_id: sid }),
        });
        const data = await res.json();
        if (data.success) {
          setAttendanceCounts({ present: data.data.present_count || 0, absent: data.data.absent_count || 0 });
          if (activeDetailsRef.current) setActiveDetails(data.data);
        }
      } catch (err) { console.error(err); }
    }, 10000);
    return () => clearInterval(interval);
  }, [activeSession?.id]);

  const regenerateQR = async (sessionId: number) => {
    try {
      const res = await fetch(`${API}/attendance-sessions/regenerate-qr`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setActiveSession((prev: any) => prev && prev.id === sessionId ? { ...prev, session_token: data.data.session_token } : prev);
      }
    } catch (err) { console.error(err); }
  };

  useEffect(() => { activeDetailsRef.current = activeDetails; }, [activeDetails]);

  useEffect(() => {
    if (!activeSession) { setTimer(30); timerRef.current = 30; return; }
    setTimer(30);
    timerRef.current = 30;
    const sid = activeSession.id;
    const interval = setInterval(() => {
      timerRef.current -= 1;
      setTimer(timerRef.current);
      if (timerRef.current <= 0) {
        regenerateQR(sid);
        timerRef.current = 30;
        setTimer(30);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [activeSession?.id]);

  const handleCreateSession = async () => {
    if (!filterSubjectId || selectedDeptIds.length === 0) return;
    const offeringIds = getSelectedOfferingIds();
    if (offeringIds.length === 0) { alert('لم يتم العثور على مادة مناسبة. تأكد من اختيار التخصص.'); return; }
    setCreating(true);
    try {
      const res = await fetch(`${API}/attendance-sessions/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          offering_id: offeringIds[0],
          doctor_id: doctorId,
          lecture_choice: lectureChoice,
          department_ids: selectedDeptIds,
        }),
      });
      const data = await res.json();
      if (data.success) {
        if (data.is_continue && data.sessions) {
          // Continue existing session - pick first one or show choice
          if (data.sessions.length > 0) {
            setActiveSession(data.sessions[0]);
            setAttendanceCounts({ present: 0, absent: 0 });
            setActiveDetails(null);
          } else {
            alert('لا توجد جلسات مفتوحة اليوم');
          }
        } else {
          setActiveSession(data.data);
          setAttendanceCounts({ present: 0, absent: 0 });
          setActiveDetails(null);
        }
      } else {
        alert(data.message || 'فشل إنشاء الجلسة');
      }
    } catch (err) { console.error(err); alert('فشل إنشاء الجلسة'); }
    setCreating(false);
  };

  const handleCloseSession = async () => {
    if (!activeSession) return;
    try {
      const res = await fetch(`${API}/attendance-sessions/close`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: activeSession.id }),
      });
      const data = await res.json();
      if (data.success) {
        setActiveSession(null);
        if (filterSubjectId) loadSessionHistory();
      } else {
        alert(data.message || 'فشل إغلاق الجلسة');
      }
    } catch (err) { console.error(err); alert('فشل إغلاق الجلسة'); }
  };

  const loadSessionHistory = useCallback(async (deptId?: number) => {
    if (!filterSubjectId) return;
    setHistoryLoading(true);
    try {
      let url = `${API}/subjects/${filterSubjectId}/sessions`;
      if (deptId) url += `?department_id=${deptId}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) setSessionHistory(data.data || []);
    } catch (err) { console.error(err); }
    setHistoryLoading(false);
  }, [filterSubjectId]);

  useEffect(() => {
    if (filterSubjectId) { loadSessionHistory(); } else { setSessionHistory([]); }
  }, [filterSubjectId, loadSessionHistory]);

  const filteredHistory = sessionHistory
    .filter(s => !s.is_active)
    .filter(s => {
      if (historyFilterDeptIds.length > 0 && historyFilterDeptIds.length < departments.length) {
        const deptIds = s.department_ids || (s.department_id ? [s.department_id] : []);
        return deptIds.some((did: number) => historyFilterDeptIds.includes(did));
      }
      return true;
    })
    .filter(s => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return String(s.id).includes(q) || (s.subject_name || '').toLowerCase().includes(q) || (s.department_name || '').toLowerCase().includes(q);
    })
    .sort((a, b) => new Date(b.start_time || b.session_date || 0).getTime() - new Date(a.start_time || a.session_date || 0).getTime());

  const handleExpandSession = async (sessionId: number) => {
    if (expandedSessionId === sessionId) {
      setExpandedSessionId(null);
      setExpandedDetails(null);
      return;
    }
    setExpandedSessionId(sessionId);
    setExpandedTab('present');
    setDetailsLoading(true);
    setExpandedDetails(null);
    try {
      const res = await fetch(`${API}/attendance-sessions/${sessionId}/details`);
      const data = await res.json();
      if (data.success) setExpandedDetails(data.data);
    } catch (err) { console.error(err); }
    setDetailsLoading(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => { alert('تم نسخ الرمز'); }).catch(() => {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      alert('تم نسخ الرمز');
    });
  };

  if (loading) {
    return <div style={{ padding: 20, marginRight: 260, color: "#000", width: "calc(100% - 260px)" }}>جاري التحميل...</div>;
  }

  const currentSubject = subjects.find(s => s.subject_id === filterSubjectId);

  return (
    <div style={{ padding: 20, marginRight: 260, color: "#000", direction: "rtl", width: "calc(100% - 260px)" }}>
      <h2 style={{ marginBottom: 16, fontSize: 22, fontWeight: 700, color: "#000" }}>جلسات الحضور</h2>

      {/* Subject Tabs */}
      <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, marginBottom: 12 }}>
        {subjects.map(subj => (
          <button key={subj.subject_id}
            onClick={() => { setFilterSubjectId(subj.subject_id); setSelectedDeptIds([]); }}
            style={{
              padding: "8px 18px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, whiteSpace: "nowrap",
              background: filterSubjectId === subj.subject_id ? primary : "#f0f0f0",
              color: filterSubjectId === subj.subject_id ? "#fff" : "#555",
            }}>
            {subj.subject_name}
          </button>
        ))}
        {subjects.length === 0 && <span style={{ color: "#999", fontSize: 13 }}>لا توجد مواد</span>}
      </div>

      {/* Department Selection — Multi Select Checkboxes */}
      {filterSubjectId && (
        <div style={{ marginBottom: 16 }}>
          {deptLoading ? (
            <span style={{ color: "#999", fontSize: 13 }}>جاري التحميل...</span>
          ) : departments.length > 0 ? (
            <div style={{
              background: "#f7fafa", borderRadius: 12, padding: "10px 14px",
              border: "1px solid #e0e8e8",
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: primary, marginBottom: 10 }}>
                اختر التخصصات:
                {selectedDeptIds.length > 0 && (
                  <span style={{ fontSize: 11, fontWeight: 400, color: "#888", marginRight: 6 }}>
                    (تم اختيار {selectedDeptIds.length} من {departments.length})
                  </span>
                )}
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <label style={{
                  display: "inline-flex", alignItems: "center", gap: 5,
                  padding: "6px 14px", borderRadius: 14, cursor: "pointer", fontSize: 12, fontWeight: 600,
                  background: selectedDeptIds.length === departments.length ? primary : "#f0f0f0",
                  color: selectedDeptIds.length === departments.length ? "#fff" : "#555",
                  transition: "all 0.15s", userSelect: "none",
                }}>
                  <input type="checkbox" checked={selectedDeptIds.length === departments.length}
                    onChange={() => setSelectedDeptIds(prev => prev.length === departments.length ? [] : departments.map(d => d.id))}
                    style={{ margin: 0, cursor: "pointer", accentColor: primary }} />
                  الكل
                </label>
                {departments.map(dept => (
                  <label key={dept.id} style={{
                    display: "inline-flex", alignItems: "center", gap: 5,
                    padding: "6px 14px", borderRadius: 14, cursor: "pointer", fontSize: 12,
                    background: selectedDeptIds.includes(dept.id) ? primary : "#f0f0f0",
                    color: selectedDeptIds.includes(dept.id) ? "#fff" : "#555",
                    transition: "all 0.15s", userSelect: "none",
                  }}>
                    <input type="checkbox" checked={selectedDeptIds.includes(dept.id)}
                      onChange={() => setSelectedDeptIds(prev => prev.includes(dept.id) ? prev.filter(id => id !== dept.id) : [...prev, dept.id])}
                      style={{ margin: 0, cursor: "pointer", accentColor: primary }} />
                    {dept.name}
                  </label>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* Active Session / Create Area */}
      {filterSubjectId && selectedDeptIds.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          {activeSession ? (
            <div style={{
              background: "#fff", border: `1px solid ${primary}40`, borderRadius: 16,
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)", padding: 20, marginBottom: 16
            }}>
              <div style={{ textAlign: "center", marginBottom: 16 }}>
                <div style={{ display: "inline-block", padding: 16, borderRadius: 16, border: `3px solid ${primary}`, background: "#fff" }}>
                  {activeSession.session_token && (
                    <QRCodeCanvas value={activeSession.session_token} size={200} level="H" includeMargin={true} />
                  )}
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", background: "#f0f7f7", padding: "8px 12px", borderRadius: 10, marginBottom: 12, border: `1px solid ${primary}40` }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: primary, fontFamily: "monospace", flex: 1, overflow: "hidden", textOverflow: "ellipsis", direction: "ltr", textAlign: "left" }}>
                  {activeSession.session_token}
                </span>
                <button onClick={() => copyToClipboard(activeSession.session_token)}
                  style={{ background: primary, border: "none", borderRadius: 8, color: "#fff", padding: "5px 10px", cursor: "pointer", fontSize: 11, display: "flex", alignItems: "center", gap: 4 }}>
                  <ClipboardCopy size={14} /> نسخ
                </button>
              </div>

              <div style={{ fontSize: 13, color: "#555", marginBottom: 12, lineHeight: 1.8 }}>
                <div><strong>المادة:</strong> {currentSubject?.subject_name || ''}</div>
                {activeSession.department_name && (
                  <div><strong>التخصص:</strong> {activeSession.department_name}</div>
                )}
                {activeSession.start_time && (
                  <div><strong>وقت البدء:</strong> {new Date(activeSession.start_time).toLocaleTimeString("ar-SA", { hour: '2-digit', minute: '2-digit' })}</div>
                )}
                {activeSession.session_date && (
                  <div><strong>التاريخ:</strong> {new Date(activeSession.session_date).toLocaleDateString("ar-SA")}</div>
                )}
              </div>

              <div style={{ textAlign: "center", fontSize: 13, color: errorColor, fontWeight: 700, marginBottom: 12 }}>
                يتم تحديث الرمز تلقائياً خلال {timer} ثانية
              </div>

              <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                <div style={{ flex: 1, textAlign: "center", background: "#e8f5e9", borderRadius: 12, padding: "12px 8px" }}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: successColor }}>{attendanceCounts.present || 0}</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: successColor }}>حاضر</div>
                </div>
                <div style={{ flex: 1, textAlign: "center", background: "#ffebee", borderRadius: 12, padding: "12px 8px" }}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: errorColor }}>{attendanceCounts.absent || 0}</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: errorColor }}>غائب</div>
                </div>
              </div>

              <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                <button onClick={handleCloseSession}
                  style={{
                    flex: 1, padding: "10px", background: errorColor, color: "#fff", border: "none", borderRadius: 10,
                    cursor: "pointer", fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 4
                  }}>
                  <XCircle size={16} /> إنهاء الجلسة
                </button>
                <button onClick={async () => {
                  if (!activeSession) return;
                  try {
                    const res = await fetch(`${API}/attendance-sessions/attendees`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ session_id: activeSession.id }),
                    });
                    const data = await res.json();
                    if (data.success) {
                      setAttendanceCounts({ present: data.data.present_count || 0, absent: data.data.absent_count || 0 });
                      setActiveDetails(data.data);
                    }
                  } catch (err) { console.error(err); }
                }}
                  style={{
                    flex: 1, padding: "10px", background: "#fff", color: primary, border: `1px solid ${primary}`, borderRadius: 10,
                    cursor: "pointer", fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 4
                  }}>
                  <CheckCircle size={16} /> تحديث الحضور
                </button>
              </div>

              {/* عرض حضور الجلسة button */}
              <button onClick={async () => {
                if (activeDetails) { setActiveDetails(null); return; }
                if (!activeSession) return;
                setActiveDetailsLoading(true);
                try {
                  const res = await fetch(`${API}/attendance-sessions/attendees`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ session_id: activeSession.id }),
                  });
                  const data = await res.json();
                  if (data.success) setActiveDetails(data.data);
                } catch (err) { console.error(err); }
                setActiveDetailsLoading(false);
              }}
                style={{
                  width: "100%", padding: "8px", background: "none", color: primary, border: `1px solid ${primary}30`,
                  borderRadius: 10, cursor: "pointer", fontWeight: 600, fontSize: 12,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
                }}>
                {activeDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                {activeDetails ? 'إخفاء الحضور' : 'عرض حضور الجلسة'}
              </button>

              {activeDetails && (
                <div style={{ marginTop: 12, borderTop: `1px solid #eee`, paddingTop: 12 }}>
                  <div style={{ display: "flex", borderBottom: "2px solid #eee", marginBottom: 12 }}>
                    <button onClick={() => setActiveDetailsTab('present')}
                      style={{
                        flex: 1, padding: "8px 0", border: "none", background: "none", cursor: "pointer",
                        fontWeight: 700, fontSize: 13, color: activeDetailsTab === 'present' ? primary : "#999",
                        borderBottom: activeDetailsTab === 'present' ? `3px solid ${primary}` : "3px solid transparent",
                      }}>
                      الحاضرون ({activeDetails.present_count || activeDetails.present?.length || 0})
                    </button>
                    <button onClick={() => setActiveDetailsTab('absent')}
                      style={{
                        flex: 1, padding: "8px 0", border: "none", background: "none", cursor: "pointer",
                        fontWeight: 700, fontSize: 13, color: activeDetailsTab === 'absent' ? primary : "#999",
                        borderBottom: activeDetailsTab === 'absent' ? `3px solid ${primary}` : "3px solid transparent",
                      }}>
                      الغائبون ({activeDetails.absent_count || activeDetails.absent?.length || 0})
                    </button>
                  </div>
                  <div>
                    {(activeDetailsTab === 'present' ? (activeDetails.present || []) : (activeDetails.absent || [])).map((student: any) => (
                      <div key={student.student_id} style={{ display: "flex", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #f0f0f0" }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: "50%",
                          background: activeDetailsTab === 'present' ? "#e8f5e9" : "#ffebee",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontWeight: 700, fontSize: 14,
                          color: activeDetailsTab === 'present' ? successColor : errorColor,
                          marginLeft: 12, flexShrink: 0,
                        }}>
                          {(student.student_name || student.name)?.[0] || '?'}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 700, fontSize: 14, color: "#000" }}>
                            {student.student_name || student.name}
                          </div>
                          <div style={{ fontSize: 12, color: "#888", display: "flex", gap: 8, flexWrap: "wrap" }}>
                            {student.academic_number && <span>{student.academic_number}</span>}
                            {student.department_name && <span>· {student.department_name}</span>}
                          </div>
                        </div>
                        {activeDetailsTab === 'present' && student.attended_at && (
                          <span style={{
                            background: "#e8f5e9", padding: "3px 10px", borderRadius: 8,
                            fontSize: 11, fontWeight: 700, color: successColor, whiteSpace: "nowrap",
                          }}>
                            {new Date(student.attended_at).toLocaleTimeString("ar-SA", { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                    ))}
                    {(activeDetailsTab === 'present' ? (activeDetails.present || []) : (activeDetails.absent || [])).length === 0 && (
                      <p style={{ textAlign: "center", color: "#999", padding: 20 }}>
                        {activeDetailsTab === 'present' ? 'لا يوجد حاضرون' : 'لا يوجد غائبون'}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div>
              {/* Lecture session choice */}
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: primary, marginBottom: 8 }}>نوع الجلسة:</div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => setLectureChoice(1)}
                    style={{
                      flex: 1, padding: "10px", borderRadius: 10, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 13,
                      background: lectureChoice === 1 ? primary : "#f0f0f0",
                      color: lectureChoice === 1 ? "#fff" : "#555",
                      transition: "all 0.2s",
                    }}>
                    <CalendarPlus size={16} style={{ marginLeft: 6 }} />
                    محاضرة جديدة
                  </button>
                  <button onClick={() => setLectureChoice(2)}
                    style={{
                      flex: 1, padding: "10px", borderRadius: 10, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 13,
                      background: lectureChoice === 2 ? primary : "#f0f0f0",
                      color: lectureChoice === 2 ? "#fff" : "#555",
                      transition: "all 0.2s",
                    }}>
                    <CalendarCheck size={16} style={{ marginLeft: 6 }} />
                    استكمال جلسة سابقة
                  </button>
                </div>
              </div>
              <button onClick={handleCreateSession} disabled={creating}
                style={{
                  width: "100%", padding: "14px", background: primary, color: "#fff", border: "none", borderRadius: 12,
                  cursor: "pointer", fontWeight: 700, fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  boxShadow: "0 4px 12px rgba(29,76,79,0.3)", opacity: creating ? 0.7 : 1,
                }}>
                {creating ? 'جاري الإنشاء...' : <><PlusCircle size={22} /> إنشاء جلسة حضور</>}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Session History */}
      {filterSubjectId && (
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "#000", marginBottom: 12 }}>سجل الجلسات السابقة</h3>

          {/* History department filters */}
          {departments.length > 0 && (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
              {departments.map(dept => (
                <button key={dept.id} onClick={() => {
                  const newIds = historyFilterDeptIds.length === 1 && historyFilterDeptIds[0] === dept.id
                    ? departments.map(d => d.id)
                    : [dept.id];
                  setHistoryFilterDeptIds(newIds);
                  // Load sessions filtered by department when a specific tab is selected
                  if (newIds.length === 1) {
                    loadSessionHistory(newIds[0]);
                  } else {
                    loadSessionHistory();
                  }
                }}
                  style={{
                    padding: "4px 12px", borderRadius: 14, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600,
                    background: historyFilterDeptIds.length === 1 && historyFilterDeptIds[0] === dept.id ? primary : "#f0f0f0",
                    color: historyFilterDeptIds.length === 1 && historyFilterDeptIds[0] === dept.id ? "#fff" : "#555",
                  }}>
                  {dept.name}
                </button>
              ))}
              <button onClick={() => {
                setHistoryFilterDeptIds(departments.map(d => d.id));
                loadSessionHistory();
              }}
                style={{
                  padding: "4px 12px", borderRadius: 14, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600,
                  background: historyFilterDeptIds.length === departments.length ? primary : "#f0f0f0",
                  color: historyFilterDeptIds.length === departments.length ? "#fff" : "#555",
                }}>
                الكل
              </button>
            </div>
          )}

          <div style={{ display: "flex", alignItems: "center", background: "#f5f5f5", borderRadius: 8, padding: "8px 14px", border: "1px solid #eee", marginBottom: 12 }}>
            <Search size={16} color="#999" />
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="ابحث عن جلسة..."
              style={{ border: "none", background: "transparent", marginRight: 8, outline: "none", flex: 1, color: "#000", fontSize: 13 }} />
          </div>

          {historyLoading ? (
            <p style={{ textAlign: "center", color: "#999", padding: 20 }}>جاري التحميل...</p>
          ) : filteredHistory.length === 0 ? (
            <p style={{ textAlign: "center", color: "#999", padding: 40 }}>لا توجد جلسات حضور</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {filteredHistory.map((session, idx) => {
                const isExpanded = expandedSessionId === session.id;
                return (
                  <div key={session.id} style={{
                    background: "#fff", borderRadius: 16, padding: 16,
                    border: session.is_active ? `1px solid ${primary}40` : "1px solid #eee",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontWeight: 700, fontSize: 14, color: "#000" }}>جلسة #{idx + 1}</span>
                        <span style={{ fontSize: 12, color: "#888" }}>
                          {session.session_date ? new Date(session.session_date).toLocaleDateString("ar-SA") : ''}
                        </span>
                      </div>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <span style={{
                          padding: "2px 10px", borderRadius: 8, fontSize: 11, fontWeight: 700,
                          background: session.is_active ? "#e8f5e9" : "#f0f0f0",
                          color: session.is_active ? successColor : "#999",
                        }}>
                          {session.is_active ? 'نشطة' : 'منتهية'}
                        </span>
                        <button onClick={async () => {
                          if (!window.confirm('هل أنت متأكد من حذف هذه الجلسة وجميع سجلات الحضور المرتبطة بها؟ لا يمكن التراجع عن العملية.')) return;
                          try {
                            const res = await fetch(`${API}/doctor/attendance-sessions/${session.id}`, { method: 'DELETE' });
                            const data = await res.json();
                            if (data.success) {
                              setSessionHistory(sessionHistory.filter((s: any) => s.id !== session.id));
                            } else alert(data.message || 'فشل الحذف');
                          } catch (err) { alert('فشل الحذف'); }
                        }} style={{ background: "none", border: "none", cursor: "pointer", color: "#dc2626", padding: 4 }} title="حذف الجلسة">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    {session.department_name && (
                      <div style={{ fontSize: 12, color: "#666", marginBottom: 6 }}>
                        <Building2 size={12} style={{ marginLeft: 4 }} /> {session.department_name}
                      </div>
                    )}

                    <div style={{ fontSize: 12, color: "#666", marginBottom: 8, display: "flex", alignItems: "center", gap: 4 }}>
                      <Clock size={12} />
                      <span>
                        {session.start_time ? new Date(session.start_time).toLocaleTimeString("ar-SA", { hour: '2-digit', minute: '2-digit' }) : ''}
                        {' → '}
                        {session.is_active ? 'مستمرة' : (session.end_time ? new Date(session.end_time).toLocaleTimeString("ar-SA", { hour: '2-digit', minute: '2-digit' }) : '')}
                      </span>
                    </div>

                    <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                      <span style={{ fontSize: 12, color: successColor, fontWeight: 600 }}>
                        <CheckCircle size={12} style={{ marginLeft: 4 }} /> حاضر: {session.present_count || 0}
                      </span>
                      <span style={{ fontSize: 12, color: errorColor, fontWeight: 600 }}>
                        <XCircle size={12} style={{ marginLeft: 4 }} /> غائب: {session.absent_count || 0}
                      </span>
                    </div>

                    <button onClick={() => handleExpandSession(session.id)}
                      style={{
                        width: "100%", padding: "8px", background: "none", color: primary, border: `1px solid ${primary}30`,
                        borderRadius: 10, cursor: "pointer", fontWeight: 600, fontSize: 12,
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
                      }}>
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      {isExpanded ? 'إخفاء الحضور' : 'عرض الحضور'}
                    </button>

                    {isExpanded && (
                      <div style={{ marginTop: 12, borderTop: `1px solid #eee`, paddingTop: 12 }}>
                        {detailsLoading ? (
                          <p style={{ textAlign: "center", color: "#999", padding: 20 }}>جاري التحميل...</p>
                        ) : expandedDetails ? (
                          <>
                            <div style={{ display: "flex", borderBottom: "2px solid #eee", marginBottom: 12 }}>
                              <button onClick={() => setExpandedTab('present')}
                                style={{
                                  flex: 1, padding: "8px 0", border: "none", background: "none", cursor: "pointer",
                                  fontWeight: 700, fontSize: 13, color: expandedTab === 'present' ? primary : "#999",
                                  borderBottom: expandedTab === 'present' ? `3px solid ${primary}` : "3px solid transparent",
                                }}>
                                الحاضرون ({expandedDetails.present_count || expandedDetails.present?.length || 0})
                              </button>
                              <button onClick={() => setExpandedTab('absent')}
                                style={{
                                  flex: 1, padding: "8px 0", border: "none", background: "none", cursor: "pointer",
                                  fontWeight: 700, fontSize: 13, color: expandedTab === 'absent' ? primary : "#999",
                                  borderBottom: expandedTab === 'absent' ? `3px solid ${primary}` : "3px solid transparent",
                                }}>
                                الغائبون ({expandedDetails.absent_count || expandedDetails.absent?.length || 0})
                              </button>
                            </div>

                            <div>
                              {(expandedTab === 'present' ? (expandedDetails.present || []) : (expandedDetails.absent || [])).map((student: any) => (
                                <div key={student.student_id} style={{ display: "flex", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #f0f0f0" }}>
                                  <div style={{
                                    width: 36, height: 36, borderRadius: "50%",
                                    background: expandedTab === 'present' ? "#e8f5e9" : "#ffebee",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontWeight: 700, fontSize: 14,
                                    color: expandedTab === 'present' ? successColor : errorColor,
                                    marginLeft: 12, flexShrink: 0,
                                  }}>
                                    {(student.student_name || student.name)?.[0] || '?'}
                                  </div>
                                  <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontWeight: 700, fontSize: 14, color: "#000" }}>
                                      {student.student_name || student.name}
                                    </div>
                                    <div style={{ fontSize: 12, color: "#888", display: "flex", gap: 8, flexWrap: "wrap" }}>
                                      {student.academic_number && <span>{student.academic_number}</span>}
                                      {student.department_name && <span>· {student.department_name}</span>}
                                    </div>
                                  </div>
                                  {student.level && (
                                    <span style={{ fontSize: 12, color: "#666", marginLeft: 8, whiteSpace: "nowrap" }}>مستوى {student.level}</span>
                                  )}
                                  {expandedTab === 'present' && student.attended_at && (
                                    <span style={{
                                      background: "#e8f5e9", padding: "3px 10px", borderRadius: 8,
                                      fontSize: 11, fontWeight: 700, color: successColor, whiteSpace: "nowrap",
                                    }}>
                                      {new Date(student.attended_at).toLocaleTimeString("ar-SA", { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                  )}
                                </div>
                              ))}
                              {(expandedTab === 'present' ? (expandedDetails.present || []) : (expandedDetails.absent || [])).length === 0 && (
                                <p style={{ textAlign: "center", color: "#999", padding: 20 }}>
                                  {expandedTab === 'present' ? 'لا يوجد حاضرون' : 'لا يوجد غائبون'}
                                </p>
                              )}
                            </div>
                          </>
                        ) : null}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {!filterSubjectId && (
        <div style={{ textAlign: "center", padding: 60, color: "#999", background: "#f9f9f9", borderRadius: 12, border: "2px dashed #ddd" }}>
          <QrCode size={48} style={{ marginBottom: 12, opacity: 0.3 }} />
          <p>اختر مادة من الأعلى لإدارة جلسات الحضور</p>
        </div>
      )}
    </div>
  );
};

// Session Card Component
const SessionCard: React.FC<{
  session: any; index: number; isOpen: boolean;
  onClose: () => void; onRefresh: () => void;
  onViewAttendees: () => void; copyToClipboard: (t: string) => void;
}> = ({ session, index, isOpen, onClose, onRefresh, onViewAttendees, copyToClipboard }) => {
  const [timeLeft, setTimeLeft] = useState(30);

  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          onRefresh();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, onRefresh]);

  return (
    <div style={{ marginBottom: 14, padding: 16, background: "#fff", borderRadius: 16, border: isOpen ? `1px solid ${primary}33` : "1px solid #eee", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
        <div style={{ padding: 10, borderRadius: 12, background: isOpen ? "#e8f5e9" : "#f5f5f5", marginLeft: 12, display: "flex" }}>
          {isOpen ? <Wifi size={20} color="#2e7d32" /> : <Lock size={20} color="#999" />}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span style={{ padding: "2px 10px", borderRadius: 8, fontSize: 10, fontWeight: 700, background: isOpen ? "#e8f5e9" : "#f0f0f0", color: isOpen ? "#2e7d32" : "#999" }}>
              {isOpen ? 'مفتوحة' : 'مغلقة'}
            </span>
            <span style={{ fontSize: 11, color: "#999", fontWeight: 700 }}>#{index + 1}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#666" }}>
            <CalendarCheck size={12} />
            <span>{session.session_date || (session.start_time ? new Date(session.start_time).toLocaleDateString("ar-SA") : '')}</span>
            <span>·</span>
            <span>{session.start_time ? new Date(session.start_time).toLocaleTimeString("ar-SA", { hour: '2-digit', minute: '2-digit' }) : ''}</span>
          </div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: isOpen ? "#2e7d32" : primary }}>{session.attendee_count || 0}</div>
          <div style={{ fontSize: 10, color: "#999", fontWeight: 700 }}>حاضر</div>
        </div>
      </div>

      {/* Offering / Department name */}
      {session.offering_name && (
        <div style={{ fontSize: 12, color: "#666", marginBottom: 8, padding: "4px 10px", background: "#f9f9f9", borderRadius: 8 }}>
          <BookOpen size={12} style={{ marginLeft: 4 }} />{session.offering_name}
        </div>
      )}

      {isOpen && (
        <>
          {/* Token display */}
          {session.session_token && (
            <div style={{ display: "flex", alignItems: "center", background: "#f0f7f7", padding: "8px 12px", borderRadius: 10, marginBottom: 10, border: "1px solid #d0e4e4" }}>
              <Key size={14} color={primary} style={{ marginLeft: 8 }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: primary, fontFamily: "monospace", flex: 1, overflow: "hidden", textOverflow: "ellipsis" }}>{session.session_token}</span>
              <button onClick={() => copyToClipboard(session.session_token)} style={{ background: primary, border: "none", borderRadius: 8, color: "#fff", padding: "5px 10px", cursor: "pointer", fontSize: 11 }}>
                نسخ
              </button>
            </div>
          )}

          {/* QR Code - Flutter-style with larger size */}
          {session.qr_code_value && (
            <div style={{ textAlign: "center", marginBottom: 16, background: "#fff", borderRadius: 16, padding: 20, border: `2px solid ${primary}40`, boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
              <div style={{ display: "inline-block", padding: 16, borderRadius: 16, border: `3px solid ${primary}`, background: "#fff" }}>
                <QRCodeCanvas value={session.qr_code_value} size={260} level="H" includeMargin={true} />
              </div>
              <p style={{ fontSize: 15, fontWeight: 700, color: primary, marginTop: 12, marginBottom: 4 }}>
                امسح لتسجيل الحضور
              </p>
              <p style={{ fontSize: 13, color: "#c62828", fontWeight: 700 }}>
                يتجدد الرمز تلقائياً خلال: {timeLeft} ثانية
              </p>
            </div>
          )}

          {/* Close Button */}
          <button onClick={onClose} style={{ width: "100%", padding: "10px", background: "#ffebee", color: "#c62828", border: "none", borderRadius: 10, cursor: "pointer", fontWeight: 700, fontSize: 13, marginBottom: 8 }}>
            <Lock size={14} style={{ marginLeft: 6 }} /> إغلاق الجلسة
          </button>
        </>
      )}

      {/* View Attendees */}
      <button onClick={onViewAttendees} style={{ width: "100%", padding: "8px", background: "none", color: primary, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 12 }}>
        <Users size={14} style={{ marginLeft: 6 }} /> عرض الحضور
      </button>
    </div>
  );
};

// ================= Subjects Page =================
const SubjectsPage: React.FC = () => {
  const [activeSubjects, setActiveSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const doctorId = getDoctorId();

    if (!doctorId) {
      setLoading(false);
      return;
    }

    fetch(`${API}/doctor/active-subjects/${doctorId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setActiveSubjects(data.data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching subjects:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div style={{ padding: "20px", marginRight: "260px", width: "calc(100% - 260px)" }}>جاري التحميل...</div>;
  }

  return (
    <div style={{ padding: "20px", marginRight: "260px", width: "calc(100% - 260px)" }}>
      <h2 style={{ marginBottom: "20px", color: "#1D4C4F", fontSize: "24px", fontWeight: 700 }}>المواد الدراسية</h2>
      {activeSubjects.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", background: "#f5f5f5", borderRadius: 8, padding: "8px 14px", border: "1px solid #eee" }}>
            <Search size={16} color="#999" />
            <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="ابحث عن مادة..." style={{ border: "none", background: "transparent", marginRight: 8, outline: "none", flex: 1, color: "#333", fontSize: 13 }} />
          </div>
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" }}>
        {activeSubjects.filter(subj => !searchQuery || subj.subject_name.toLowerCase().includes(searchQuery.toLowerCase())).map(subj => (
          <div key={subj.subject_id} style={{ background: "#fff", padding: "20px", borderRadius: "12px", boxShadow: "0 4px 10px rgba(0,0,0,0.05)", border: "1px solid #eee" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "10px", background: "rgba(29, 76, 79, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "12px" }}>
              <BookOpen size={22} color="#1D4C4F" />
            </div>
            <h3 style={{ margin: "0 0 10px 0", color: "#1D4C4F", fontSize: "16px", fontWeight: 700 }}>{subj.subject_name}</h3>
            <p style={{ margin: "4px 0", fontSize: "13px", color: "#6C757D" }}><strong>المستوى:</strong> {subj.levels?.join(' - ') || ''}</p>
            <p style={{ margin: "4px 0", fontSize: "13px", color: "#6C757D" }}><strong>الأقسام:</strong> {subj.departments?.join(' - ') || ''}</p>
            <button 
              onClick={() => navigate(`/course-management/${subj.offering_ids?.[0]}`)}
              style={{ width: "100%", background: "#1D4C4F", color: "#fff", border: "none", padding: "10px", borderRadius: "8px", cursor: "pointer", marginTop: "10px", fontWeight: 600, fontSize: "14px" }}
            >
              إدارة المادة
            </button>
          </div>
        ))}
        {activeSubjects.length === 0 && <p style={{ color: "#6C757D", fontSize: "13px" }}>لا توجد مواد حالياً</p>}
      </div>
    </div>
  );
};

// ================= Course Management =================
const CourseManagementPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [offering, setOffering] = useState<any>(null);
  const [subjectOfferings, setSubjectOfferings] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'details' | 'materials' | 'grades' | 'settings' | 'announcements'>('details');
  const [loading, setLoading] = useState(true);

  // ---- Materials ----
  const [materials, setMaterials] = useState<any[]>([]);
  const [materialsLoading, setMaterialsLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // ---- Students / Grades ----
  const [students, setStudents] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [selectedDept, setSelectedDept] = useState<number | null>(null);
  const [studentsLoading, setStudentsLoading] = useState(false);

  // ---- Grade modal ----
  const [gradeModal, setGradeModal] = useState<{ open: boolean; student: any }>({ open: false, student: null });
  const [editGrade, setEditGrade] = useState({
    attendance_grade: 0, assignments_grade: 0, quizzes_grade: 0,
    midterm_grade: 0, final_exam_grade: 0
  });

  // ---- Student submissions modal ----
  const [submissionsModal, setSubmissionsModal] = useState<{ open: boolean; student: any; items: any[]; loading: boolean }>({ open: false, student: null, items: [], loading: false });
  const [submissionGradeEdit, setSubmissionGradeEdit] = useState<{ [key: number]: { grade: string; notes: string } }>({});
  const [submissionsTab, setSubmissionsTab] = useState<'assignments' | 'quizzes'>('assignments');

  const doctorId = getDoctorId();
  const isPracticalDoctor = doctorId && offering ? offering.ta_id === doctorId : false;

  const handleViewSubmissions = async (student: any) => {
    setSubmissionsModal({ open: true, student, items: [], loading: true });
    try {
      const res = await fetch(`${API}/student/submissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id: student.student_id, offering_id: Number(id) })
      });
      const data = await res.json();
      if (data.success) {
        setSubmissionsModal(prev => ({ ...prev, items: data.data || [], loading: false }));
      } else {
        setSubmissionsModal(prev => ({ ...prev, loading: false }));
      }
    } catch {
      setSubmissionsModal(prev => ({ ...prev, loading: false }));
    }
  };

  const handleSaveSubmissionGrade = async (submissionId: number) => {
    const edit = submissionGradeEdit[submissionId];
    if (!edit) return;
    try {
      const res = await fetch(`${API}/submissions/grade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submission_id: submissionId, grade: Number(edit.grade), notes: edit.notes, doctor_id: doctorId })
      });
      const data = await res.json();
      if (data.success) {
        alert('تم حفظ التعديلات');
        setSubmissionsModal(prev => ({
          ...prev,
          items: prev.items.map((item: any) =>
            item.submission_id === submissionId ? { ...item, grade: Number(edit.grade), notes: edit.notes, status: 'graded' } : item
          )
        }));
      } else {
        alert(data.message || 'فشل الحفظ');
      }
    } catch {
      alert('حدث خطأ');
    }
  };

  // ---- Course Settings ----
  const [settings, setSettings] = useState<any>(null);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [editSettings, setEditSettings] = useState({
    lecture_count: 0, attendance_session_count: 0,
    assignment_count: 0, quiz_count: 0,
  });
  const [gradeWeights, setGradeWeights] = useState({
    attendance_weight: 10, assignments_weight: 10,
    quizzes_weight: 20, midterm_weight: 20, final_weight: 40,
  });

  // ---- Announcements ----
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [announcementsLoading, setAnnouncementsLoading] = useState(false);
  const [showAnnouncementDialog, setShowAnnouncementDialog] = useState(false);
  const [announcementForm, setAnnouncementForm] = useState({ title: '', body: '', target_department: '' });
  const [announcementDept, setAnnouncementDept] = useState<number | null>(null);

  const loadAnnouncements = useCallback(() => {
    if (!id) return;
    const doctorId = getDoctorId();
    if (!doctorId) return;
    setAnnouncementsLoading(true);
    let url = `${API}/doctor/announcements/${id}/${doctorId}`;
    if (announcementDept === null) {
      url += '?all=true';
    } else {
      const dept = departments.find((d: any) => d.id === announcementDept);
      if (dept) {
        url += `?department_name=${encodeURIComponent(dept.name)}`;
      }
    }
    fetch(url)
      .then(res => res.json())
      .then(data => { if (data.success) setAnnouncements(data.data); })
      .catch(console.error)
      .finally(() => setAnnouncementsLoading(false));
  }, [id, announcementDept, departments]);

  const handleCreateAnnouncement = async () => {
    const doctorId = getDoctorId();
    if (!doctorId || !id || !announcementForm.title.trim()) { alert('العنوان مطلوب'); return; }
    try {
      const res = await fetch(`${API}/announcements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          offering_id: Number(id),
          doctor_id: doctorId,
          title: announcementForm.title,
          body: announcementForm.body,
          status: 'published',
          target_department: announcementForm.target_department || null,
        })
      });
      const data = await res.json();
      if (data.success) {
        alert('تم إنشاء الإعلان');
        setShowAnnouncementDialog(false);
        setAnnouncementForm({ title: '', body: '', target_department: '' });
        loadAnnouncements();
      } else {
        alert(data.message || 'فشل إنشاء الإعلان');
      }
    } catch (err) {
      alert('حدث خطأ');
    }
  };

  useEffect(() => {
    if (id) {
      setLoading(true);
      fetch(`${API}/course-offerings/${id}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setOffering(data.data);
            const depts = data.data.departments || [];
            setDepartments(depts);
            // Load sibling offerings for tab switching
            fetch(`${API}/subject-offerings/${data.data.subject_id}`)
              .then(r => r.json())
              .then(sd => { if (sd.success) setSubjectOfferings(sd.data); })
              .catch(() => {});
          }
          setLoading(false);
        })
        .catch(err => { console.error(err); setLoading(false); });
    }
  }, [id]);

  const loadMaterials = useCallback(() => {
    if (!id) return;
    setMaterialsLoading(true);
    fetch(`${API}/course-offerings/${id}/materials`)
      .then(res => res.json())
      .then(data => { if (data.success) setMaterials(data.data); })
      .catch(console.error)
      .finally(() => setMaterialsLoading(false));
  }, [id]);

  const loadStudents = useCallback(() => {
    if (!id) return;
    setStudentsLoading(true);
    fetch(`${API}/course-offerings/${id}/students`)
      .then(res => res.json())
      .then(data => { if (data.success) setStudents(data.data); })
      .catch(console.error)
      .finally(() => setStudentsLoading(false));
  }, [id]);

  useEffect(() => { if (activeTab === 'materials') loadMaterials(); }, [activeTab, loadMaterials]);
  useEffect(() => { if (activeTab === 'grades') loadStudents(); }, [activeTab, loadStudents]);
  useEffect(() => { if (activeTab === 'settings') loadSettings(); }, [activeTab]);
  useEffect(() => { if (activeTab === 'announcements') loadAnnouncements(); }, [activeTab, loadAnnouncements]);

  const loadSettings = useCallback(async () => {
    if (!id) return;
    setSettingsLoading(true);
    try {
      const res = await fetch(`${API}/course-settings/${id}`);
      const data = await res.json();
      if (data.success) {
        setSettings(data.data);
        setEditSettings({
          lecture_count: data.data.lecture_count ?? 0,
          attendance_session_count: data.data.attendance_session_count ?? 0,
          assignment_count: data.data.assignment_count ?? 0,
          quiz_count: data.data.quiz_count ?? 0,
        });
        const gw = data.grade_weights || {};
        setGradeWeights({
          attendance_weight: gw.attendance_weight ?? 10,
          assignments_weight: gw.assignments_weight ?? 10,
          quizzes_weight: gw.quizzes_weight ?? 20,
          midterm_weight: gw.midterm_weight ?? 20,
          final_weight: gw.final_weight ?? 40,
        });
      }
    } catch { }
    setSettingsLoading(false);
  }, [id]);

  const handleSaveSettings = async () => {
    if (!id) return;
    try {
      const res = await fetch(`${API}/course-settings/${id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...editSettings, ...gradeWeights }),
      });
      const data = await res.json();
      if (data.success) {
        setSettings(data.data);
        const gw = data.grade_weights || {};
        setGradeWeights({
          attendance_weight: gw.attendance_weight ?? gradeWeights.attendance_weight,
          assignments_weight: gw.assignments_weight ?? gradeWeights.assignments_weight,
          quizzes_weight: gw.quizzes_weight ?? gradeWeights.quizzes_weight,
          midterm_weight: gw.midterm_weight ?? gradeWeights.midterm_weight,
          final_weight: gw.final_weight ?? gradeWeights.final_weight,
        });
        alert('تم حفظ الإعدادات');
      } else alert(data.message || 'فشل');
    } catch { alert('حدث خطأ'); }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !id) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    fd.append('doctor_id', String(getDoctorId() || ''));
    try {
      const res = await fetch(`${API}/course-offerings/${id}/materials`, { method: 'POST', body: fd });
      const data = await res.json();
      if (data.success) { loadMaterials(); alert("تم رفع الملف"); } else alert(data.message || "فشل الرفع");
    } catch { alert("حدث خطأ"); }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDeleteMaterial = async (matId: number) => {
    if (!confirm("تأكيد حذف الملف؟")) return;
    try {
      const res = await fetch(`${API}/materials/${matId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) { setMaterials(materials.filter(m => m.id !== matId)); alert("تم الحذف"); } else alert(data.message);
    } catch { alert("حدث خطأ"); }
  };

  const handleRemoveStudent = async (enrollmentId: number) => {
    if (!confirm("تأكيد إزالة الطالب من المادة؟")) return;
    try {
      const res = await fetch(`${API}/student-enrollments/${enrollmentId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) { setStudents(students.filter(s => s.enrollment_id !== enrollmentId)); alert("تمت الإزالة"); } else alert(data.message);
    } catch { alert("حدث خطأ"); }
  };

  const openGradeModal = (student: any) => {
    setEditGrade({
      attendance_grade: student.attendance_grade ?? 0,
      assignments_grade: student.assignments_grade ?? 0,
      quizzes_grade: student.quizzes_grade ?? 0,
      midterm_grade: student.midterm_grade ?? 0,
      final_exam_grade: student.final_exam_grade ?? 0,
    });
    setGradeModal({ open: true, student });
  };

  const handleSaveGrade = async () => {
    const student = gradeModal.student;
    if (!student?.grade_id) { alert("لم يتم إنشاء سجل الدرجات بعد"); return; }
    try {
      const res = await fetch(`${API}/grades/${student.grade_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...editGrade, doctor_id: doctorId }),
      });
      const data = await res.json();
      if (data.success) {
        setGradeModal({ open: false, student: null });
        loadStudents();
      } else alert(data.message || "فشل الحفظ");
    } catch { alert("حدث خطأ"); }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };
  const getFileType = (name: string) => name.split('.').pop()?.toUpperCase() || 'ملف';

  const filteredStudents = selectedDept
    ? students.filter(s => s.department_id === selectedDept)
    : students;

  if (loading) return <div style={{ marginRight: 260, padding: 20, width: "calc(100% - 260px)" }}>جاري التحميل...</div>;
  if (!offering) return <div style={{ marginRight: 260, padding: 20, width: "calc(100% - 260px)" }}>المادة غير موجودة</div>;

  const container = { padding: "20px", marginRight: "260px", color: "#000", width: "calc(100% - 260px)" };
  const card = { background: "#fff", padding: "20px", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" };
  const btn = (bg: string, txt: string) => ({ background: bg, color: txt, border: "none", padding: "10px 24px", borderRadius: "8px", cursor: "pointer", fontWeight: 600, fontSize: "14px" });

  return (
    <div style={container}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2 style={{ margin: 0 }}>إدارة مقرر: {offering.subject_name}</h2>
        <Link to="/subjects" style={{ color: primary, fontSize: "14px" }}><ArrowRightFromLine size={16} style={{ marginLeft: '6px' }} /> العودة للمواد</Link>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "20px", borderBottom: "2px solid #eee", paddingBottom: "10px", flexWrap: "wrap" }}>
        {(isPracticalDoctor ? (['details', 'materials', 'grades', 'announcements'] as const) : (['details', 'materials', 'grades', 'announcements', 'settings'] as const)).map(t => (
          <button key={t} onClick={() => setActiveTab(t)} style={{
            background: activeTab === t ? primary : "transparent", color: activeTab === t ? "#fff" : "#333",
            border: activeTab === t ? "none" : "1px solid #ddd", padding: "8px 20px", borderRadius: "8px",
            cursor: "pointer", fontWeight: 600, fontSize: "14px"
          }}>
            {t === 'details' ? 'تفاصيل المقرر' : t === 'materials' ? 'رفع مقرر دراسي' : t === 'grades' ? 'إدارة الدرجات' : t === 'announcements' ? 'الإعلانات' : 'إعدادات المادة'}
          </button>
        ))}
      </div>

      {/* Offering switching tabs */}
      {subjectOfferings.length > 1 && (
        <div style={{ display: "flex", gap: "6px", marginBottom: "16px", flexWrap: "wrap", padding: "8px 0", borderBottom: "1px solid #eee" }}>
          <span style={{ fontSize: "12px", color: "#888", padding: "4px 0", marginLeft: "8px" }}>الشعب:</span>
          {subjectOfferings.map((o: any) => (
            <button key={o.id} onClick={() => { if (Number(id) !== o.id) navigate(`/course-management/${o.id}`); }} style={{
              background: Number(id) === o.id ? primary : "transparent",
              color: Number(id) === o.id ? "#fff" : "#333",
              border: Number(id) === o.id ? "none" : "1px solid #ddd",
              padding: "4px 14px", borderRadius: "6px",
              cursor: "pointer", fontWeight: 600, fontSize: "12px"
            }}>{o.department_name} (مستوى {o.level}) <span style={{ fontSize: "10px", opacity: 0.7 }}>{o.enrolled_count}</span></button>
          ))}
        </div>
      )}

      {/* ===== TAB: تفاصيل المقرر ===== */}
      {activeTab === 'details' && (
        <div style={card}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 40px", fontSize: "14px" }}>
            {[
              ['اسم المادة', offering.subject_name],
              ['التخصصات', (offering.departments || []).map((d: any) => d.name).join('، ')],
              ['المستوى', offering.level],
              ['نوع الدراسة', offering.study_type === 'general' ? 'عام' : offering.study_type === 'paid' ? 'موازي' : 'عام وموازي'],
              ['الدكتور النظري', offering.doctor_name],
              ['المعيد العملي', offering.ta_name || 'لا يوجد'],
              ['الفصل الدراسي', offering.term_name],
            ].map(([label, val]) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #f0f0f0" }}>
                <span style={{ color: "#6C757D" }}>{label}</span>
                <span style={{ fontWeight: 600, textAlign: "left" }}>{val || '-'}</span>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: "16px", marginTop: "24px" }}>
            <button onClick={() => setActiveTab('materials')} style={{ ...btn(primary, "#fff"), flex: 1, textAlign: "center" }}>
              رفع مقرر دراسي
            </button>
            <button onClick={() => setActiveTab('grades')} style={{ ...btn(primary, "#fff"), flex: 1, textAlign: "center" }}>
              إدارة الدرجات
            </button>
          </div>
        </div>
      )}

      {/* ===== TAB: رفع مقرر دراسي ===== */}
      {activeTab === 'materials' && (
        <div>
          <div style={{ ...card, marginBottom: "20px" }}>
            <input ref={fileInputRef} type="file" hidden onChange={handleUpload} />
            <button onClick={() => fileInputRef.current?.click()} disabled={uploading} style={{
              width: "100%", padding: "40px 20px", border: "2px dashed #ccc", borderRadius: "12px",
              background: uploading ? "#f5f5f5" : "#fafafa", cursor: "pointer", fontSize: "16px", fontWeight: 700,
              color: uploading ? "#999" : primary, transition: "all 0.2s", textAlign: "center"
            }}>
              {uploading ? 'جاري رفع الملف...' : <><PlusCircle size={18} style={{ marginLeft: '6px' }} /> إضافة مقرر دراسي جديد</>}
            </button>
          </div>

          {materialsLoading ? <p style={{ textAlign: "center", color: "#999" }}>جاري التحميل...</p> : materials.length === 0 ? (
            <p style={{ textAlign: "center", color: "#999", fontSize: "14px" }}>لا توجد مقررات مرفوعة بعد</p>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
              {materials.map(mat => (
                <div key={mat.id} style={{ ...card, display: "flex", flexDirection: "column", gap: "8px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: "14px", color: "#333" }}>{mat.file_name}</p>
                      <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#999" }}>
                        {getFileType(mat.file_name)} • {formatSize(mat.file_size)}
                      </p>
                    </div>
                    <span style={{ background: "#f0f3f6", padding: "2px 8px", borderRadius: "4px", fontSize: "11px", color: "#666" }}>{getFileType(mat.file_name)}</span>
                  </div>
                  <div style={{ fontSize: "12px", color: "#888" }}>
                    <span>{new Date(mat.created_at).toLocaleDateString('ar-SA')}</span>
                    <span style={{ marginRight: "12px" }}><UserCircle size={14} style={{ marginLeft: '6px' }} /> {mat.doctor_name}</span>
                  </div>
                  <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                    <div style={{ display: "flex", gap: "4px", flex: 2 }}>
                      <a href={getFileUrl(mat.file_path)} target="_blank" rel="noopener noreferrer" style={{ flex: 1, textAlign: "center", background: "#f0f3f6", border: "1px solid #ddd", padding: "8px", borderRadius: "6px", textDecoration: "none", color: "#333", fontSize: "13px", cursor: "pointer" }}>عرض</a>
                      <a href={getFileUrl(mat.file_path)} download target="_blank" rel="noopener noreferrer" style={{ flex: 1, textAlign: "center", background: primary, border: `1px solid ${primary}`, padding: "8px", borderRadius: "6px", textDecoration: "none", color: "#fff", fontSize: "13px", cursor: "pointer" }}>تنزيل</a>
                    </div>
                    <button onClick={() => handleDeleteMaterial(mat.id)} style={{ flex: 1, background: "#fff", border: "1px solid #dc3545", color: "#dc3545", padding: "8px", borderRadius: "6px", cursor: "pointer", fontSize: "13px" }}>حذف</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ===== TAB: إدارة الدرجات ===== */}
      {activeTab === 'grades' && (
        <div>
          {/* Department tabs */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
            <button onClick={() => setSelectedDept(null)} style={{
              background: selectedDept === null ? primary : "transparent", color: selectedDept === null ? "#fff" : "#333",
              border: selectedDept === null ? "none" : "1px solid #ddd", padding: "6px 16px", borderRadius: "6px",
              cursor: "pointer", fontWeight: 600, fontSize: "13px"
            }}>الكل</button>
            {departments.map((d: any) => (
              <button key={d.id} onClick={() => setSelectedDept(d.id)} style={{
                background: selectedDept === d.id ? primary : "transparent", color: selectedDept === d.id ? "#fff" : "#333",
                border: selectedDept === d.id ? "none" : "1px solid #ddd", padding: "6px 16px", borderRadius: "6px",
                cursor: "pointer", fontWeight: 600, fontSize: "13px"
              }}>{d.name}</button>
            ))}
          </div>

          {studentsLoading ? <p style={{ textAlign: "center", color: "#999" }}>جاري التحميل...</p> : filteredStudents.length === 0 ? (
            <p style={{ textAlign: "center", color: "#999", fontSize: "14px" }}>لا يوجد طلاب في هذا التخصص</p>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "16px" }}>
              {filteredStudents.map(s => {
                const total = s.total_grade ?? 0;
                const passed = total >= 60;
                return (
                  <div key={s.enrollment_id} style={{ background: "#fff", borderRadius: "14px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)", padding: "20px" }}>
                    {/* Header */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                      <div>
                        <h4 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#1D4C4F" }}>{s.name}</h4>
                        <span style={{ fontSize: "11px", color: "#888" }}>{s.academic_number}</span>
                      </div>
                      <span style={{ background: passed ? "#d4edda" : "#f8d7da", color: passed ? "#155724" : "#721c24", padding: "3px 14px", borderRadius: "20px", fontSize: "11px", fontWeight: 700 }}>
                        {passed ? 'ناجح' : 'راسب'}
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "14px" }}>
                      <span style={{ background: "#f0f3f6", padding: "4px 12px", borderRadius: "6px", fontSize: "11px", color: "#555" }}>{s.department_name}</span>
                      <span style={{ background: "#f0f3f6", padding: "4px 12px", borderRadius: "6px", fontSize: "11px", color: "#555" }}>مستوى {s.level}</span>
                    </div>

                    {/* Stats grid */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px", marginBottom: "14px" }}>
                      {/* Attendance */}
                      <div style={{ background: "#f8fafb", borderRadius: "10px", padding: "10px", textAlign: "center" }}>
                        <div style={{ fontSize: "10px", color: "#1D4C4F", fontWeight: 700, marginBottom: "6px" }}>الحضور</div>
                        <div style={{ fontSize: "12px", fontWeight: 600, color: "#333", marginBottom: "2px" }}>{s.attended_sessions ?? 0} / {s.total_sessions ?? 0}</div>
                        <div style={{ fontSize: "12px", fontWeight: 700, color: "#1D4C4F" }}>{s.attendance_grade ?? 0} / {s.attendance_weight ?? 10}</div>
                      </div>
                      {/* Assignments */}
                      <div style={{ background: "#f8fafb", borderRadius: "10px", padding: "10px", textAlign: "center" }}>
                        <div style={{ fontSize: "10px", color: "#28a745", fontWeight: 700, marginBottom: "6px" }}>التكاليف</div>
                        <div style={{ fontSize: "12px", fontWeight: 600, color: "#333", marginBottom: "2px" }}>{s.submitted_assignments_count ?? 0} / {s.total_assignments_count ?? 0}</div>
                        <div style={{ fontSize: "12px", fontWeight: 700, color: "#28a745" }}>{s.assignments_grade ?? 0} / {s.assignments_weight ?? 10}</div>
                      </div>
                      {/* Quizzes */}
                      <div style={{ background: "#f8fafb", borderRadius: "10px", padding: "10px", textAlign: "center" }}>
                        <div style={{ fontSize: "10px", color: "#17a2b8", fontWeight: 700, marginBottom: "6px" }}>الكويزات</div>
                        <div style={{ fontSize: "12px", fontWeight: 600, color: "#333", marginBottom: "2px" }}>{s.submitted_quizzes_count ?? 0} / {s.total_quizzes_count ?? 0}</div>
                        <div style={{ fontSize: "12px", fontWeight: 700, color: "#17a2b8" }}>{s.quizzes_grade ?? 0} / {s.quizzes_weight ?? 20}</div>
                      </div>
                      {/* Midterm */}
                      <div style={{ background: "#f8fafb", borderRadius: "10px", padding: "10px", textAlign: "center" }}>
                        <div style={{ fontSize: "10px", color: "#ffc107", fontWeight: 700, marginBottom: "6px" }}>النصفي</div>
                        <div style={{ fontSize: "12px", fontWeight: 700, color: "#ffc107" }}>{s.midterm_grade ?? 0} / {s.midterm_weight ?? 20}</div>
                      </div>
                      {/* Final */}
                      <div style={{ background: "#f8fafb", borderRadius: "10px", padding: "10px", textAlign: "center" }}>
                        <div style={{ fontSize: "10px", color: "#dc3545", fontWeight: 700, marginBottom: "6px" }}>النهائي</div>
                        <div style={{ fontSize: "12px", fontWeight: 700, color: "#dc3545" }}>{s.final_exam_grade ?? 0} / {s.final_weight ?? 40}</div>
                      </div>
                      {/* Total */}
                      <div style={{ background: "rgba(29,76,79,0.08)", borderRadius: "10px", padding: "10px", textAlign: "center" }}>
                        <div style={{ fontSize: "10px", color: "#1D4C4F", fontWeight: 700, marginBottom: "6px" }}>المجموع</div>
                        <div style={{ fontSize: "14px", fontWeight: 800, color: passed ? "#28a745" : "#dc3545" }}>{total}</div>
                        <div style={{ fontSize: "10px", color: "#888" }}>/ 100</div>
                      </div>
                    </div>

                    {/* Buttons */}
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button onClick={() => openGradeModal(s)} style={{ flex: 1, background: primary, color: "#fff", border: "none", padding: "10px", borderRadius: "10px", cursor: "pointer", fontSize: "13px", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                        <Pencil size={14} /> تعديل
                      </button>
                      <button onClick={() => handleViewSubmissions(s)} style={{ flex: 1, background: "#28a745", color: "#fff", border: "none", padding: "10px", borderRadius: "10px", cursor: "pointer", fontSize: "13px", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                        <Eye size={14} /> عرض المسلمات
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ===== TAB: الإعلانات ===== */}
      {activeTab === 'announcements' && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h3 style={{ margin: 0, fontSize: "16px", color: "#333" }}>الإعلانات</h3>
            <button onClick={() => setShowAnnouncementDialog(true)} style={{ background: primary, color: "#fff", border: "none", padding: "8px 20px", borderRadius: "8px", cursor: "pointer", fontWeight: 600, fontSize: "13px" }}>
              + إنشاء إعلان
            </button>
          </div>
          {departments.length > 1 && (
            <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
              <button onClick={() => setAnnouncementDept(null)} style={{
                background: announcementDept === null ? primary : "transparent", color: announcementDept === null ? "#fff" : "#333",
                border: announcementDept === null ? "none" : "1px solid #ddd", padding: "6px 16px", borderRadius: "6px",
                cursor: "pointer", fontWeight: 600, fontSize: "13px"
              }}>الكل</button>
              {departments.map((d: any) => (
                <button key={d.id} onClick={() => setAnnouncementDept(d.id)} style={{
                  background: announcementDept === d.id ? primary : "transparent", color: announcementDept === d.id ? "#fff" : "#333",
                  border: announcementDept === d.id ? "none" : "1px solid #ddd", padding: "6px 16px", borderRadius: "6px",
                  cursor: "pointer", fontWeight: 600, fontSize: "13px"
                }}>{d.name}</button>
              ))}
            </div>
          )}
          {announcementsLoading ? <p style={{ color: "#999" }}>جاري التحميل...</p> : announcements.length === 0 ? (
            <p style={{ color: "#999", fontSize: "14px" }}>لا توجد إعلانات بعد</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {announcements.map(a => (
                <div key={a.id} style={card}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <h4 style={{ margin: 0, fontSize: "15px", color: "#333" }}>{a.title}</h4>
                    <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                      {a.target_department && (
                        <span style={{ background: "#e7f3ff", color: "#0066cc", padding: "2px 10px", borderRadius: "4px", fontSize: "11px", fontWeight: 600 }}>
                          {a.target_department}
                        </span>
                      )}
                      <span style={{ background: a.status === 'published' ? '#d4edda' : '#fff3cd', color: a.status === 'published' ? '#155724' : '#856404', padding: "2px 10px", borderRadius: "4px", fontSize: "11px", fontWeight: 700 }}>
                        {a.status === 'published' ? 'منشور' : 'مسودة'}
                      </span>
                      <button onClick={async () => {
                        if (!window.confirm('هل أنت متأكد من حذف هذا الإعلان؟ لا يمكن التراجع عن العملية.')) return;
                        try {
                          const res = await fetch(`${API}/announcements/${a.id}`, { method: 'DELETE' });
                          const data = await res.json();
                          if (data.success) {
                            setAnnouncements(announcements.filter((x: any) => x.id !== a.id));
                          } else alert(data.message || 'فشل الحذف');
                        } catch (err) { alert('فشل الحذف'); }
                      }} style={{ background: "none", border: "none", cursor: "pointer", color: "#dc2626", padding: 4 }} title="حذف الإعلان">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <p style={{ margin: "0 0 4px 0", fontSize: "13px", color: "#555", lineHeight: 1.6 }}>{a.body}</p>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#999" }}>
                    <span>{a.doctor_name}</span>
                    <span>{a.created_at ? new Date(a.created_at).toLocaleString("ar-SA") : ''}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ===== TAB: إعدادات المادة ===== */}
      {activeTab === 'settings' && (
        <div>
          {settingsLoading ? <p style={{ color: "#999" }}>جاري التحميل...</p> : (
            <div style={{ maxWidth: "500px" }}>
              <div style={{ ...card, marginBottom: "20px" }}>
                <h4 style={{ margin: "0 0 16px 0", fontSize: "15px" }}>تهيئة المادة</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {[
                    ['عدد المحاضرات', 'lecture_count'],
                    ['عدد جلسات الحضور', 'attendance_session_count'],
                    ['عدد التكاليف', 'assignment_count'],
                    ['عدد الكويزات', 'quiz_count'],
                  ].map(([label, field]) => (
                    <div key={field}>
                      <label style={{ display: "block", fontSize: "12px", marginBottom: "4px", color: "#555" }}>{label}</label>
                      <input type="number" min="0" value={(editSettings as any)[field]}
                        onChange={e => setEditSettings({ ...editSettings, [field]: Number(e.target.value) })}
                        style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #ddd", color: "#000", fontSize: "13px", boxSizing: "border-box" }} />
                    </div>
                  ))}
                </div>
                <button onClick={handleSaveSettings}
                  style={{ marginTop: "16px", background: primary, color: "#fff", border: "none", padding: "10px 24px", borderRadius: "8px", cursor: "pointer", fontWeight: 600, fontSize: "14px" }}>حفظ الإعدادات</button>
              </div>

              {/* Grade balancing form */}
              <div style={{ ...card, marginBottom: "20px" }}>
                <h4 style={{ margin: "0 0 12px 0", fontSize: "15px" }}>موازنة الدرجات</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {[
                    ['الحضور', 'attendance_weight'],
                    ['التكاليف', 'assignments_weight'],
                    ['الكويزات', 'quizzes_weight'],
                    ['الامتحان النصفي', 'midterm_weight'],
                    ['الامتحان النهائي', 'final_weight'],
                  ].map(([label, field]) => (
                    <div key={field}>
                      <label style={{ display: "block", fontSize: "12px", marginBottom: "4px", color: "#555" }}>{label}</label>
                      <input type="number" min="0" max="100" value={(gradeWeights as any)[field]}
                        onChange={e => setGradeWeights({ ...gradeWeights, [field]: Number(e.target.value) })}
                        style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #ddd", color: "#000", fontSize: "13px", boxSizing: "border-box" }} />
                    </div>
                  ))}
                </div>
                <div style={{ padding: "10px", background: "#f5f7fa", borderRadius: "6px", textAlign: "center", fontSize: "13px", marginTop: "10px" }}>
                  المجموع: <strong>{gradeWeights.attendance_weight + gradeWeights.assignments_weight + gradeWeights.quizzes_weight + gradeWeights.midterm_weight + gradeWeights.final_weight}</strong> / 100
                </div>
                {/* Per-item distribution preview */}
                {editSettings.attendance_session_count > 0 || editSettings.assignment_count > 0 || editSettings.quiz_count > 0 ? (
                  <div style={{ marginTop: "16px", padding: "12px", background: "#fafafa", borderRadius: "8px", fontSize: "12px", color: "#666" }}>
                    <div style={{ fontWeight: 700, marginBottom: "8px", color: primary, fontSize: "13px" }}>توزيع الدرجات لكل عنصر</div>
                    {editSettings.attendance_session_count > 0 && (
                      <div>الحضور: كل جلسة = {(gradeWeights.attendance_weight / editSettings.attendance_session_count).toFixed(2)} درجة</div>
                    )}
                    {editSettings.assignment_count > 0 && (
                      <div>التكاليف: كل تكليف = {(gradeWeights.assignments_weight / editSettings.assignment_count).toFixed(2)} درجة</div>
                    )}
                    {editSettings.quiz_count > 0 && (
                      <div>الكويزات: كل كويز = {(gradeWeights.quizzes_weight / editSettings.quiz_count).toFixed(2)} درجة</div>
                    )}
                  </div>
                ) : null}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Student Submissions Modal - Using existing card design from SubmissionsStatusPage */}
      {submissionsModal.open && submissionsModal.student && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }} onClick={() => setSubmissionsModal({ open: false, student: null, items: [], loading: false })}>
          <div style={{ background: "#fff", borderRadius: "16px", width: "700px", maxWidth: "95%", maxHeight: "88vh", display: "flex", flexDirection: "column", direction: "rtl", boxShadow: "0 12px 40px rgba(0,0,0,0.18)" }} onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div style={{ padding: "18px 24px", borderBottom: "1px solid #eee", display: "flex", justifyContent: "space-between", alignItems: "center", background: primary, borderRadius: "16px 16px 0 0" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <ClipboardList size={20} color="#fff" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: "16px", color: "#fff" }}>مسلمات الطالب</h3>
                  <p style={{ margin: "2px 0 0", fontSize: "12px", color: "rgba(255,255,255,0.8)" }}>{submissionsModal.student.name} | {submissionsModal.student.academic_number}</p>
                </div>
              </div>
              <button onClick={() => setSubmissionsModal({ open: false, student: null, items: [], loading: false })} style={{ width: "32px", height: "32px", borderRadius: "8px", background: "rgba(255,255,255,0.15)", border: "none", cursor: "pointer", color: "#fff", fontSize: "16px", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
            </div>

            {/* Tabs */}
            <div style={{ padding: "14px 24px 0", borderBottom: "2px solid #eee", display: "flex", gap: "8px" }}>
              {(['assignments', 'quizzes'] as const).map(t => (
                <button key={t} onClick={() => setSubmissionsTab(t)} style={{
                  background: submissionsTab === t ? primary : "transparent", color: submissionsTab === t ? "#fff" : "#555",
                  border: "none", padding: "10px 24px", borderRadius: "10px 10px 0 0", cursor: "pointer", fontWeight: 700, fontSize: "13px",
                  borderBottom: submissionsTab === t ? `2px solid ${primary}` : "2px solid transparent", marginBottom: "-2px",
                  transition: "all 0.2s"
                }}>
                  {t === 'assignments' ? `التكاليف (${submissionsModal.items.filter(i => i.submitted && i.type === 'assignment').length})` : `الكويزات (${submissionsModal.items.filter(i => i.submitted && i.type === 'quiz').length})`}
                </button>
              ))}
            </div>

            {/* Content */}
            <div style={{ padding: "20px 24px", overflowY: "auto", flex: 1 }}>
              {submissionsModal.loading ? (
                <p style={{ textAlign: "center", color: "#999", padding: "30px" }}>جاري التحميل...</p>
              ) : (
                (() => {
                  const filtered = submissionsModal.items.filter((i: any) => i.submitted && i.type === (submissionsTab === 'assignments' ? 'assignment' : 'quiz'));
                  if (filtered.length === 0) return (
                    <div style={{ textAlign: "center", padding: "40px 20px", color: "#999" }}>
                      <ClipboardList size={40} style={{ opacity: 0.3, marginBottom: "10px" }} />
                      <p style={{ fontSize: "14px", margin: 0 }}>لا توجد {submissionsTab === 'assignments' ? 'تسليمات' : 'إجابات'} لهذا الطالب</p>
                    </div>
                  );
                  return <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {filtered.map((item: any) => {
                      const isGraded = item.grade !== null && item.grade !== undefined;
                      const editKey = item.submission_id;
                      const initEdit = submissionGradeEdit[editKey] || { grade: item.grade ?? '', notes: item.notes ?? '' };
                      if (!submissionGradeEdit[editKey]) {
                        setTimeout(() => setSubmissionGradeEdit(prev => ({ ...prev, [editKey]: initEdit })), 0);
                      }
                      const edit = submissionGradeEdit[editKey] || initEdit;
                      return (
                        <div key={item.assignment_id} style={{ background: "#fff", padding: "16px", borderRadius: "12px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", border: "1px solid #f0f0f0" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 700, fontSize: "15px", color: "#333", marginBottom: "4px" }}>
                                {item.title}
                                {isGraded ? (
                                  <span style={{ background: "#e8f5e9", color: "#2e7d32", padding: "2px 10px", borderRadius: "4px", fontWeight: 700, fontSize: "11px" }}>مصحح</span>
                                ) : (
                                  <span style={{ background: "#fff3e0", color: "#e65100", padding: "2px 10px", borderRadius: "4px", fontWeight: 700, fontSize: "11px" }}>بانتظار التصحيح</span>
                                )}
                              </div>
                              <div style={{ display: "flex", gap: "12px", fontSize: "12px", color: "#888", marginTop: "4px" }}>
                                <span>{submissionsModal.student.academic_number}</span>
                                <span>{submissionsModal.student.department_name}</span>
                              </div>
                              <div style={{ fontSize: "12px", color: "#888", marginTop: "2px" }}>
                                تاريخ التسليم: {item.submitted_at ? new Date(item.submitted_at).toLocaleString("ar-SA") : "غير معروف"}
                              </div>
                            </div>
                            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                              {isGraded ? (
                                <span style={{ background: "#e8f5e9", color: "#2e7d32", padding: "6px 14px", borderRadius: "8px", fontWeight: 700, fontSize: "14px" }}>
                                  {item.grade}/{item.max_grade}
                                </span>
                              ) : (
                                <span style={{ background: "#fff3e0", color: "#e65100", padding: "6px 14px", borderRadius: "8px", fontWeight: 700, fontSize: "13px" }}>
                                  لم يصحح بعد
                                </span>
                              )}
                            </div>
                          </div>
                          {item.file_path && (
                            <div style={{ marginTop: "10px", display: "flex", gap: "8px" }}>
                              <a href={getFileUrl(item.file_path)} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 6, background: "#f0f3f6", color: "#333", border: "1px solid #ddd", padding: "8px 16px", borderRadius: "8px", cursor: "pointer", fontSize: "12px", fontWeight: 600, textDecoration: "none" }}>
                                <FileText size={14} /> عرض الملف
                              </a>
                              <a href={getFileUrl(item.file_path)} download style={{ display: "flex", alignItems: "center", gap: 6, background: "#f0f3f6", color: "#333", border: "1px solid #ddd", padding: "8px 16px", borderRadius: "8px", cursor: "pointer", fontSize: "12px", fontWeight: 600, textDecoration: "none" }}>
                                <Download size={14} /> تحميل
                              </a>
                            </div>
                          )}
                          {item.type === 'quiz' && item.notes && (
                            <div style={{ background: "#f8fafb", padding: "12px", borderRadius: "10px", fontSize: "12px", marginTop: "10px" }}>
                              <div style={{ fontWeight: 600, fontSize: "11px", color: "#888", marginBottom: "4px" }}>إجابات الطالب:</div>
                              <div style={{ color: "#333", whiteSpace: "pre-wrap" }}>{item.notes}</div>
                            </div>
                          )}
                          {/* Grade and notes inputs */}
                          {(item as any).creator_id === doctorId ? (
                          <div style={{ display: "flex", gap: "10px", marginTop: "14px", alignItems: "flex-end" }}>
                            <div style={{ flex: 1 }}>
                              <label style={{ display: "block", fontSize: "11px", color: "#888", marginBottom: "4px" }}>الدرجة (من {item.max_grade})</label>
                              <input type="number" value={edit.grade} onChange={e => {
                                const val = e.target.value;
                                setSubmissionGradeEdit(prev => ({ ...prev, [editKey]: { ...prev[editKey] || initEdit, grade: val } }));
                              }} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "13px", boxSizing: "border-box", color: "#000" }} />
                            </div>
                            <div style={{ flex: 2 }}>
                              <label style={{ display: "block", fontSize: "11px", color: "#888", marginBottom: "4px" }}>ملاحظات</label>
                              <input type="text" value={edit.notes} onChange={e => {
                                const val = e.target.value;
                                setSubmissionGradeEdit(prev => ({ ...prev, [editKey]: { ...prev[editKey] || initEdit, notes: val } }));
                              }} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "13px", boxSizing: "border-box", color: "#000" }} />
                            </div>
                            <button onClick={() => handleSaveSubmissionGrade(editKey)} style={{ background: primary, color: "#fff", border: "none", padding: "10px 24px", borderRadius: "8px", cursor: "pointer", fontWeight: 700, fontSize: "13px", height: "38px", whiteSpace: "nowrap" }}>
                              <Save size={14} style={{ marginLeft: '6px' }} /> حفظ
                            </button>
                          </div>
                          ) : (
                            <p style={{ fontSize: "12px", color: "#999", marginTop: "14px" }}>ليس لديك صلاحية تصحيح هذا النشاط لأنه تم إنشاؤه بواسطة دكتور آخر</p>
                          )}
                        </div>
                      );
                    })}
                  </div>;
                })()
              )}
            </div>
          </div>
        </div>
      )}

      {/* Announcement Dialog */}
      {showAnnouncementDialog && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#fff", padding: "24px", borderRadius: "12px", width: "480px", maxWidth: "90%", direction: "rtl" }}>
            <h3 style={{ margin: "0 0 16px 0", fontSize: "16px" }}>إنشاء إعلان جديد</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", marginBottom: "4px", color: "#555" }}>العنوان</label>
                <input type="text" value={announcementForm.title} onChange={e => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #ddd", color: "#000", fontSize: "13px", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "12px", marginBottom: "4px", color: "#555" }}>المحتوى</label>
                <textarea value={announcementForm.body} onChange={e => setAnnouncementForm({ ...announcementForm, body: e.target.value })}
                  style={{ width: "100%", minHeight: "100px", padding: "10px 12px", borderRadius: "8px", border: "1px solid #ddd", color: "#000", fontSize: "13px", boxSizing: "border-box", resize: "vertical" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "12px", marginBottom: "4px", color: "#555" }}>الفئة المستهدفة</label>
                <select value={announcementForm.target_department} onChange={e => setAnnouncementForm({ ...announcementForm, target_department: e.target.value })}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #ddd", color: "#000", fontSize: "13px", boxSizing: "border-box" }}>
                  <option value="">جميع الطلاب</option>
                  {departments.map(d => (
                    <option key={d.id || d.name} value={d.name}>{d.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
              <button onClick={handleCreateAnnouncement} style={{ flex: 1, background: primary, color: "#fff", border: "none", padding: "10px", borderRadius: "8px", cursor: "pointer", fontWeight: 600, fontSize: "14px" }}>نشر الإعلان</button>
              <button onClick={() => { setShowAnnouncementDialog(false); setAnnouncementForm({ title: '', body: '', target_department: '' }); }} style={{ flex: 1, background: "#eee", color: "#333", border: "none", padding: "10px", borderRadius: "8px", cursor: "pointer", fontSize: "14px" }}>إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {/* Grade Edit Modal */}
      {gradeModal.open && gradeModal.student && (() => {
        const s = gradeModal.student;
        const total = editGrade.attendance_grade + editGrade.assignments_grade + editGrade.quizzes_grade + editGrade.midterm_grade + editGrade.final_exam_grade;
        const pct = total;
        const passed = total >= 60;
        return (
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
            <div style={{ background: "#fff", padding: "25px", borderRadius: "12px", width: "440px", maxWidth: "90%", direction: "rtl" }}>
              <h3 style={{ margin: "0 0 4px 0", fontSize: "16px" }}>{s.name}</h3>
              <p style={{ margin: "0 0 16px 0", fontSize: "12px", color: "#999" }}>{s.academic_number} • {s.department_name}</p>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                {([
                  ['الحضور', 'attendance_grade'],
                  ['درجات الكويزات', 'quizzes_grade'],
                  ['درجات التكاليف', 'assignments_grade'],
                  ['النصفي', 'midterm_grade'],
                  ['النهائي', 'final_exam_grade'],
                ] as [string, string][]).filter(([_, f]) => !isPracticalDoctor || f === 'quizzes_grade' || f === 'assignments_grade').map(([label, field]) => (
                  <div key={field}>
                    <label style={{ display: "block", fontSize: "12px", marginBottom: "2px", color: "#555" }}>{label}</label>
                    <input type="number" value={(editGrade as any)[field]} onChange={e => setEditGrade({ ...editGrade, [field]: Number(e.target.value) })}
                      style={{ width: "100%", padding: "6px 8px", borderRadius: "6px", border: "1px solid #ddd", color: "#000", fontSize: "13px" }} />
                  </div>
                ))}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px", marginTop: "14px", padding: "12px", background: "#f5f7fa", borderRadius: "8px", textAlign: "center", fontSize: "13px" }}>
                <div><span style={{ color: "#888", display: "block", fontSize: "11px" }}>المجموع</span><strong style={{ fontSize: "15px" }}>{total}</strong></div>
                <div><span style={{ color: "#888", display: "block", fontSize: "11px" }}>النسبة</span><strong style={{ fontSize: "15px" }}>{pct}%</strong></div>
                <div><span style={{ color: "#888", display: "block", fontSize: "11px" }}>الحالة</span><strong style={{ fontSize: "15px", color: passed ? "#28a745" : "#dc3545" }}>{passed ? 'ناجح' : 'راسب'}</strong></div>
                <div><span style={{ color: "#888", display: "block", fontSize: "11px" }}>التقدير</span><strong style={{ fontSize: "15px" }}>{total >= 90 ? 'A' : total >= 80 ? 'B' : total >= 70 ? 'C' : total >= 60 ? 'D' : 'F'}</strong></div>
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
                <button onClick={handleSaveGrade} style={{ flex: 1, background: primary, color: "#fff", border: "none", padding: "10px", borderRadius: "8px", cursor: "pointer", fontWeight: 600 }}>تعديل</button>
                <button onClick={() => setGradeModal({ open: false, student: null })} style={{ flex: 1, background: "#eee", color: "#333", border: "none", padding: "10px", borderRadius: "8px", cursor: "pointer" }}>إغلاق</button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

// ================= Quizzes Page =================
const QuizzesPage: React.FC = () => {
  const [quizzes, setQuizzes] = useState<Assignment[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newQuiz, setNewQuiz] = useState({
    title: "", offering_id: "", max_grade: 10, due_date: "",
    description: "", category: "theoretical", target_all: true
  });
  const [courseOfferings, setCourseOfferings] = useState<any[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null);
  const [selectedDepts, setSelectedDepts] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<Assignment | null>(null);
  const [editForm, setEditForm] = useState({ title: "", max_grade: 10, description: "", due_date: "" });
  const [saving, setSaving] = useState(false);
  const [filterSubjectId, setFilterSubjectId] = useState<number | null>(null);
  const [filterOfferingId, setFilterOfferingId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const currentDoctorId = getDoctorId();
  const [qrModal, setQrModal] = useState<{ show: true; quizId: number; title: string; maxGrade: number } | null>(null);
  const [qrCodeInput, setQrCodeInput] = useState('');
  const [qrStudent, setQrStudent] = useState<any>(null);
  const [qrGrade, setQrGrade] = useState('');
  const [qrNotes, setQrNotes] = useState('');
  const [qrSaving, setQrSaving] = useState(false);
  const [qrLookupLoading, setQrLookupLoading] = useState(false);

  const fetchQuizzes = useCallback(() => {
    const doctorId = getDoctorId();
    if (!doctorId) { setLoading(false); return; }
    fetch(`${API}/doctor/quizzes/${doctorId}`)
      .then(res => res.json())
      .then(data => { if (data.success) setQuizzes(data.data); })
      .catch(err => console.error("Error fetching quizzes:", err));
    fetch(`${API}/doctor/unique-subjects/${doctorId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setCourseOfferings(data.data);
        setLoading(false);
      })
      .catch(err => { console.error(err); setLoading(false); });
  }, []);

  useEffect(() => { fetchQuizzes(); }, [fetchQuizzes]);

  const handleQrLookup = useCallback(async () => {
    if (!qrCodeInput.trim()) return;
    setQrLookupLoading(true);
    setQrStudent(null);
    try {
      const parts = qrCodeInput.includes(':') ? qrCodeInput.split(':') : ['', qrCodeInput];
      const studentId = parseInt(parts[parts.length - 1], 10);
      if (!studentId) { alert('رمز QR غير صالح'); setQrLookupLoading(false); return; }
      const res = await fetch(`${API}/users/${studentId}`);
      const data = await res.json();
      if (data.success && data.data) {
        setQrStudent(data.data);
      } else {
        alert('الطالب غير موجود');
      }
    } catch (err) { alert('فشل البحث عن الطالب'); }
    setQrLookupLoading(false);
  }, [qrCodeInput]);

  const handleQrGrade = useCallback(async () => {
    if (!qrModal || !qrStudent || !qrGrade) return;
    setQrSaving(true);
    try {
      const res = await fetch(`${API}/grade/qr`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          qr_code: qrCodeInput,
          assignment_id: qrModal.quizId,
          grade: Number(qrGrade),
          notes: qrNotes,
        }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        alert(`تم تصحيح ${qrModal.title} للطالب ${data.student_name || qrStudent.name}`);
        setQrModal(null);
        setQrCodeInput('');
        setQrStudent(null);
        setQrGrade('');
        setQrNotes('');
        fetchQuizzes();
      } else {
        alert(data.message || 'فشل التصحيح');
      }
    } catch (err) { alert('فشل التصحيح'); }
    setQrSaving(false);
  }, [qrModal, qrStudent, qrCodeInput, qrGrade, qrNotes, fetchQuizzes]);

  const selectedSubject = courseOfferings.find(s => s.subject_id === selectedSubjectId);
  const filteredOfferings = selectedSubject?.offerings || [];
  const uniqueDepts = [...new Set(filteredOfferings.map((o: any) => o.department_name as string))] as string[];
  const selectedOfferings = selectedDepts.includes("all")
    ? filteredOfferings
    : filteredOfferings.filter((o: any) => selectedDepts.includes(o.department_name));
  const allDeptsSelected = selectedDepts.includes("all");

  const filterSelectedSubject = courseOfferings.find(s => s.subject_id === filterSubjectId);
  const filterOfferings = filterSelectedSubject?.offerings || [];
  const filteredQuizzes = quizzes.filter(q => {
    if (!filterSubjectId) return true;
    if (!filterOfferingId) return q.subject_id == filterSubjectId;
    return q.offering_id == filterOfferingId;
  }).filter(q => !searchQuery || q.title.toLowerCase().includes(searchQuery.toLowerCase()) || (q.offering_name && q.offering_name.toLowerCase().includes(searchQuery.toLowerCase())));

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedOfferings.length === 0) { alert("يرجى اختيار قسم واحد على الأقل"); return; }
    setCreating(true);
    try {
      const doctorId = getDoctorId();
      const formData = new FormData();
      formData.append('title', newQuiz.title);
      formData.append('max_grade', String(newQuiz.max_grade));
      formData.append('due_date', newQuiz.due_date);
      formData.append('type', 'quiz');
      formData.append('category', newQuiz.category);
      formData.append('description', newQuiz.description || '');
      formData.append('creator_id', String(doctorId));
      for (const offering of selectedOfferings) {
        formData.append('offering_ids[]', String(offering.id));
      }
      if (fileInputRef.current?.files?.[0]) {
        formData.append('file', fileInputRef.current.files[0]);
      }
      const res = await fetch(`${API}/assignments`, { method: 'POST', body: formData });
      const created = await res.json();
      if (created.success || created.id) {
        setQuizzes([...quizzes, created.data || created]);
        setShowCreate(false);
        setSelectedSubjectId(null);
        setSelectedDepts([]);
        setNewQuiz({ title: "", offering_id: "", max_grade: 10, due_date: "", description: "", category: "theoretical", target_all: true });
      } else {
        alert(created.message || "فشل إنشاء الكويز");
      }
    } catch (err) {
      console.error(err);
      alert("فشل إنشاء الكويز");
    }
    setCreating(false);
  };

  const inputStyle = { width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #ddd", color: "#000", fontSize: "13px", boxSizing: "border-box" as const };

  if (loading) {
    return <div style={{ padding: "20px", marginRight: "260px", width: "calc(100% - 260px)" }}>جاري التحميل...</div>;
  }

  return (
    <div style={{ padding: "20px", marginRight: "260px", color: "#000", width: "calc(100% - 260px)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
        <h2 style={{ margin: 0 }}><FileQuestion size={20} style={{ marginLeft: '8px' }} /> الكويزات</h2>
        <button onClick={() => setShowCreate(!showCreate)} style={{ background: primary, color: "#fff", border: "none", padding: "10px 20px", borderRadius: "10px", fontWeight: 600, cursor: "pointer" }}><PlusCircle size={18} /> كويز جديد</button>
      </div>

      {showCreate && (
        <form onSubmit={handleCreate} style={{ background: "#fff", padding: "24px", borderRadius: "12px", marginBottom: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", color: "#888", marginBottom: "4px" }}>رقم الكويز</label>
              <input type="text" value={`#${quizzes.length + 1}`} disabled style={{ ...inputStyle, background: "#f5f5f5", color: "#999" }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "12px", color: "#888", marginBottom: "4px" }}>عنوان الكويز</label>
              <input type="text" placeholder="أدخل عنوان الكويز" value={newQuiz.title} onChange={e => setNewQuiz({...newQuiz, title: e.target.value})} style={inputStyle} required />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "12px", color: "#888", marginBottom: "4px" }}>اختيار المادة</label>
              <select value={selectedSubjectId ?? ''} onChange={e => { setSelectedSubjectId(e.target.value ? Number(e.target.value) : null); setSelectedDepts([]); }} style={inputStyle} required>
                <option value="">-- اختر مادة --</option>
                {courseOfferings.map((s: any) => (
                  <option key={s.subject_id} value={s.subject_id}>{s.subject_name}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: "12px", color: "#888", marginBottom: "4px" }}>اختيار القسم</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", padding: "8px 0" }}>
                {filteredOfferings.length > 0 && (
                  <label style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "13px", cursor: "pointer" }}>
                    <input type="checkbox" checked={allDeptsSelected} onChange={e => setSelectedDepts(e.target.checked ? ["all"] : [])} />
                    الكل
                  </label>
                )}
                {!allDeptsSelected && uniqueDepts.map(d => (
                  <label key={d} style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "13px", cursor: "pointer" }}>
                    <input type="checkbox" checked={selectedDepts.includes(d)} onChange={e => setSelectedDepts(e.target.checked ? [...selectedDepts, d] : selectedDepts.filter(x => x !== d))} />
                    {d}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label style={{ display: "block", fontSize: "12px", color: "#888", marginBottom: "4px" }}>نوع الكويز</label>
              <select value={newQuiz.category} onChange={e => setNewQuiz({...newQuiz, category: e.target.value})} style={inputStyle}>
                <option value="theoretical">نظري</option>
                <option value="practical">عملي</option>
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: "12px", color: "#888", marginBottom: "4px" }}>الدرجة القصوى</label>
              <input type="number" placeholder="مثال: 10" value={newQuiz.max_grade} onChange={e => setNewQuiz({...newQuiz, max_grade: Number(e.target.value)})} style={inputStyle} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "12px", color: "#888", marginBottom: "4px" }}>تاريخ التسليم</label>
              <input type="datetime-local" value={newQuiz.due_date} onChange={e => setNewQuiz({...newQuiz, due_date: e.target.value})} style={inputStyle} required />
            </div>
          </div>
          <div style={{ marginTop: "14px" }}>
            <label style={{ display: "block", fontSize: "12px", color: "#888", marginBottom: "4px" }}>وصف الكويز (اختياري)</label>
            <textarea placeholder="أدخل وصف الكويز" value={newQuiz.description} onChange={e => setNewQuiz({...newQuiz, description: e.target.value})} style={{ ...inputStyle, minHeight: "80px", resize: "vertical" }} />
          </div>
          <div style={{ marginTop: "14px" }}>
            <label style={{ display: "block", fontSize: "12px", color: "#888", marginBottom: "4px" }}>إرفاق ملف (اختياري)</label>
            <input ref={fileInputRef} type="file" style={{ fontSize: "13px" }} />
          </div>
          <button type="submit" disabled={creating} style={{ width: "100%", marginTop: "16px", background: creating ? "#999" : primary, color: "#fff", border: "none", padding: "12px", borderRadius: "8px", fontWeight: 700, fontSize: "15px", cursor: creating ? "not-allowed" : "pointer" }}>
            {creating ? 'جاري الحفظ...' : <><Save size={18} style={{ marginLeft: '6px' }} /> حفظ الكويز</>}
          </button>
        </form>
      )}

      {/* Edit Modal */}
      {editingQuiz && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.4)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setEditingQuiz(null)}>
          <div style={{ background: "#fff", borderRadius: "12px", padding: "28px", width: "450px", maxWidth: "90vw" }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: "0 0 18px 0", color: primary }}>تعديل الكويز</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ fontSize: "12px", color: "#888", display: "block", marginBottom: "4px" }}>العنوان</label>
                <input type="text" value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "13px", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ fontSize: "12px", color: "#888", display: "block", marginBottom: "4px" }}>الدرجة القصوى</label>
                <input type="number" value={editForm.max_grade} onChange={e => setEditForm({...editForm, max_grade: Number(e.target.value)})} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "13px", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ fontSize: "12px", color: "#888", display: "block", marginBottom: "4px" }}>تاريخ الإغلاق</label>
                <input type="datetime-local" value={editForm.due_date} onChange={e => setEditForm({...editForm, due_date: e.target.value})} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "13px", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ fontSize: "12px", color: "#888", display: "block", marginBottom: "4px" }}>الوصف</label>
                <textarea value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "13px", minHeight: "60px", resize: "vertical", boxSizing: "border-box" }} />
              </div>
            </div>
            <div style={{ display: "flex", gap: "10px", marginTop: "18px" }}>
              <button onClick={async () => {
                setSaving(true);
                try {
                  const res = await fetch(`${API}/assignments/${editingQuiz.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(editForm),
                  });
                  const data = await res.json();
                  if (data.success || data.data) {
                    setQuizzes(quizzes.map(q => q.id === editingQuiz.id ? { ...q, ...data.data } : q));
                    setEditingQuiz(null);
                  } else alert(data.message || "فشل التحديث");
                } catch (err) { alert("فشل التحديث"); }
                setSaving(false);
              }} disabled={saving} style={{ flex: 1, background: primary, color: "#fff", border: "none", padding: "10px", borderRadius: "8px", cursor: "pointer", fontWeight: 700 }}>
                {saving ? "جاري الحفظ..." : "حفظ التعديلات"}
              </button>
              <button onClick={async () => {
                if (!window.confirm('هل أنت متأكد من حذف هذا الكويز؟ لا يمكن التراجع عن العملية.')) return;
                setSaving(true);
                try {
                  const res = await fetch(`${API}/assignments/${editingQuiz.id}`, { method: 'DELETE' });
                  const data = await res.json();
                  if (data.success) {
                    setQuizzes(quizzes.filter(q => q.id !== editingQuiz.id));
                    setEditingQuiz(null);
                  } else alert(data.message || "فشل الحذف");
                } catch (err) { alert("فشل الحذف"); }
                setSaving(false);
              }} disabled={saving} style={{ background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", padding: "10px 16px", borderRadius: "8px", cursor: "pointer", fontWeight: 700, display: "flex", alignItems: "center", gap: "6px" }}>
                <Trash2 size={16} /> حذف
              </button>
              <button onClick={() => setEditingQuiz(null)} style={{ flex: 1, background: "#eee", color: "#333", border: "none", padding: "10px", borderRadius: "8px", cursor: "pointer" }}>إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {courseOfferings.length > 0 && (
        <>
          <div style={{ display: "flex", gap: "8px", marginBottom: "12px", flexWrap: "wrap" }}>
            <button onClick={() => { setFilterSubjectId(null); setFilterOfferingId(null); }} style={{
              background: filterSubjectId === null ? primary : "transparent",
              color: filterSubjectId === null ? "#fff" : "#333",
              border: filterSubjectId === null ? "none" : "1px solid #ddd",
              padding: "6px 16px", borderRadius: "6px",
              cursor: "pointer", fontWeight: 600, fontSize: "13px"
            }}>الكل</button>
            {courseOfferings.map(s => (
              <button key={s.subject_id} onClick={() => { setFilterSubjectId(s.subject_id); setFilterOfferingId(null); }} style={{
                background: filterSubjectId === s.subject_id ? primary : "transparent",
                color: filterSubjectId === s.subject_id ? "#fff" : "#333",
                border: filterSubjectId === s.subject_id ? "none" : "1px solid #ddd",
                padding: "6px 16px", borderRadius: "6px",
                cursor: "pointer", fontWeight: 600, fontSize: "13px"
              }}>{s.subject_name}</button>
            ))}
          </div>
          {filterSubjectId && filterOfferings.length > 1 && (
            <div style={{ display: "flex", gap: "6px", marginBottom: "12px", flexWrap: "wrap" }}>
              <button onClick={() => setFilterOfferingId(null)} style={{
                background: filterOfferingId === null ? primary : "transparent",
                color: filterOfferingId === null ? "#fff" : "#333",
                border: filterOfferingId === null ? "none" : "1px solid #ddd",
                padding: "4px 12px", borderRadius: "6px",
                cursor: "pointer", fontWeight: 600, fontSize: "12px"
              }}>كل التخصصات</button>
              {filterOfferings.map(o => (
                <button key={o.id} onClick={() => setFilterOfferingId(o.id)} style={{
                  background: filterOfferingId === o.id ? primary : "transparent",
                  color: filterOfferingId === o.id ? "#fff" : "#333",
                  border: filterOfferingId === o.id ? "none" : "1px solid #ddd",
                  padding: "4px 12px", borderRadius: "6px",
                  cursor: "pointer", fontWeight: 600, fontSize: "12px"
                }}>{o.department_name}</button>
              ))}
            </div>
          )}
        </>
      )}

      {/* Search Bar */}
      {filteredQuizzes.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", background: "#f5f5f5", borderRadius: 8, padding: "8px 14px", border: "1px solid #eee" }}>
            <Search size={16} color="#999" />
            <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="ابحث عن كويز..." style={{ border: "none", background: "transparent", marginRight: 8, outline: "none", flex: 1, color: "#333", fontSize: 13 }} />
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" }}>
        {filteredQuizzes.map(q => (
          <div key={q.id} style={{ background: "#fff", padding: "20px", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <h3 style={{ margin: 0, fontSize: "16px" }}>{q.title}</h3>
              <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                {q.creator_id === currentDoctorId && (
                  <button onClick={() => { setEditingQuiz(q); setEditForm({ title: q.title, max_grade: q.max_grade, description: q.description || '', due_date: q.due_date ? q.due_date.replace('Z', '').slice(0, 16) : '' }); }} style={{ background: "none", border: "none", cursor: "pointer", padding: "4px", color: primary }} title="تعديل">
                    <Pencil size={16} />
                  </button>
                )}
                <span style={{ background: q.category === 'practical' ? '#e3f2fd' : '#fff3e0', color: q.category === 'practical' ? '#1565c0' : '#e65100', padding: "2px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: 700 }}>
                  {q.category === 'practical' ? 'عملي' : 'نظري'}
                </span>
              </div>
            </div>
            <p style={{ margin: "4px 0", fontSize: "13px", color: "#666" }}><BookOpen size={14} style={{ marginLeft: '6px' }} /> {q.offering_name}</p>
            {q.department_names && q.department_names.length > 0 && (
              <p style={{ margin: "4px 0", fontSize: "12px", color: "#888" }}>
                الأقسام: {q.department_names.join(' - ')}
              </p>
            )}
            <p style={{ margin: "4px 0", fontSize: "13px", color: "#666" }}><CalendarCheck size={14} style={{ marginLeft: '6px' }} /> {new Date(q.due_date).toLocaleString("ar-SA")}</p>
            <p style={{ margin: "4px 0", fontSize: "13px", color: "#666" }}><Star size={14} style={{ marginLeft: '6px' }} /> الدرجة: {q.max_grade}</p>
            <p style={{ margin: "4px 0", fontSize: "13px", color: "#666" }}><ClipboardList size={14} style={{ marginLeft: '6px' }} /> عدد المسلمات: {q.submission_count ?? 0}</p>
            <button onClick={() => navigate("/submissions-status", { state: { type: "quiz", id: q.id, title: q.title, maxGrade: q.max_grade, creator_id: q.creator_id } })} style={{ width: "100%", background: primary, color: "#fff", border: "none", padding: "8px", borderRadius: "6px", cursor: "pointer", fontSize: "13px", marginTop: "8px" }}>
              عرض حالة التسليم
            </button>
            {q.creator_id === currentDoctorId && (
            <button onClick={() => { setQrModal({ show: true, quizId: q.id, title: q.title, maxGrade: q.max_grade }); setQrCodeInput(''); setQrStudent(null); setQrGrade(''); setQrNotes(''); }} style={{ width: "100%", background: "#1565c0", color: "#fff", border: "none", padding: "8px", borderRadius: "6px", cursor: "pointer", fontSize: "13px", marginTop: "6px" }}>
              <QrCode size={14} style={{ marginLeft: '6px' }} /> تصحيح بالباركود
            </button>
            )}
          </div>
        ))}
        {filteredQuizzes.length === 0 && <p style={{ color: "#999", fontSize: "14px", textAlign: "center", gridColumn: "1 / -1" }}>لا توجد كويزات بعد</p>}
      </div>

      {/* QR Grading Modal */}
      {qrModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.4)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => { if (!qrSaving) setQrModal(null); }}>
          <div style={{ background: "#fff", borderRadius: "12px", padding: "28px", width: "450px", maxWidth: "90vw" }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: "0 0 6px 0", color: primary }}>تصحيح بالباركود: {qrModal.title}</h3>
            <p style={{ fontSize: "12px", color: "#888", margin: "0 0 16px 0" }}>أدخل رمز الباركود (أو رقم الطالب)</p>
            <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
              <input
                type="text" value={qrCodeInput} onChange={e => setQrCodeInput(e.target.value)}
                placeholder="مثال: 12345"
                style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "13px", direction: "ltr" }}
                onKeyDown={e => { if (e.key === 'Enter') handleQrLookup(); }}
              />
              <button onClick={handleQrLookup} disabled={qrLookupLoading || !qrCodeInput.trim()} style={{ background: primary, color: "#fff", border: "none", padding: "10px 20px", borderRadius: "8px", cursor: "pointer", fontWeight: 700, fontSize: "13px", whiteSpace: "nowrap" }}>
                {qrLookupLoading ? '...' : 'بحث'}
              </button>
            </div>
            {qrStudent && (
              <div style={{ background: "#f5f5f5", padding: "12px", borderRadius: "8px", marginBottom: "16px" }}>
                <div style={{ fontWeight: 700, fontSize: "15px", marginBottom: "4px" }}>{qrStudent.name}</div>
                <div style={{ display: "flex", gap: "12px", fontSize: "12px", color: "#888" }}>
                  <span>📚 {qrStudent.department || '-'}</span>
                  <span>🆔 {qrStudent.academic_number || qrStudent.id}</span>
                </div>
              </div>
            )}
            {qrStudent && (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "12px", color: "#888", display: "block", marginBottom: "4px" }}>الدرجة (من {qrModal.maxGrade})</label>
                  <input type="number" max={qrModal.maxGrade} min={0} value={qrGrade} onChange={e => setQrGrade(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "13px", boxSizing: "border-box" }} />
                </div>
                <div>
                  <label style={{ fontSize: "12px", color: "#888", display: "block", marginBottom: "4px" }}>ملاحظات (اختياري)</label>
                  <textarea value={qrNotes} onChange={e => setQrNotes(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "13px", minHeight: "60px", resize: "vertical", boxSizing: "border-box" }} />
                </div>
                <button onClick={handleQrGrade} disabled={qrSaving || !qrGrade} style={{ width: "100%", background: primary, color: "#fff", border: "none", padding: "10px", borderRadius: "8px", cursor: "pointer", fontWeight: 700, fontSize: "14px" }}>
                  {qrSaving ? "جاري الحفظ..." : "حفظ التصحيح"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ================= Assignments Page =================
const AssignmentsPage: React.FC = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newAsg, setNewAsg] = useState({
    title: "", offering_id: "", max_grade: 10, due_date: "",
    description: "", category: "theoretical", target_all: true
  });
  const [courseOfferings, setCourseOfferings] = useState<any[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null);
  const [selectedDepts, setSelectedDepts] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [editForm, setEditForm] = useState({ title: "", max_grade: 10, description: "", due_date: "" });
  const [saving, setSaving] = useState(false);
  const [filterSubjectId, setFilterSubjectId] = useState<number | null>(null);
  const [filterOfferingId, setFilterOfferingId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const currentDoctorId = getDoctorId();
  const [qrModal, setQrModal] = useState<{ show: true; assignmentId: number; title: string; maxGrade: number } | null>(null);
  const [qrCodeInput, setQrCodeInput] = useState('');
  const [qrStudent, setQrStudent] = useState<any>(null);
  const [qrGrade, setQrGrade] = useState('');
  const [qrNotes, setQrNotes] = useState('');
  const [qrSaving, setQrSaving] = useState(false);
  const [qrLookupLoading, setQrLookupLoading] = useState(false);

  const fetchAssignments = useCallback(() => {
    const doctorId = getDoctorId();
    if (!doctorId) { setLoading(false); return; }
    fetch(`${API}/doctor/assignments/${doctorId}`)
      .then(res => res.json())
      .then(data => { if (data.success) setAssignments(data.data); })
      .catch(err => console.error("Error fetching assignments:", err));
    fetch(`${API}/doctor/unique-subjects/${doctorId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setCourseOfferings(data.data);
        setLoading(false);
      })
      .catch(err => { console.error(err); setLoading(false); });
  }, []);

  useEffect(() => { fetchAssignments(); }, [fetchAssignments]);

  const handleQrLookup = useCallback(async () => {
    if (!qrCodeInput.trim()) return;
    setQrLookupLoading(true);
    setQrStudent(null);
    try {
      const parts = qrCodeInput.includes(':') ? qrCodeInput.split(':') : ['', qrCodeInput];
      const studentId = parseInt(parts[parts.length - 1], 10);
      if (!studentId) { alert('رمز QR غير صالح'); setQrLookupLoading(false); return; }
      const res = await fetch(`${API}/users/${studentId}`);
      const data = await res.json();
      if (data.success && data.data) {
        setQrStudent(data.data);
      } else {
        alert('الطالب غير موجود');
      }
    } catch (err) { alert('فشل البحث عن الطالب'); }
    setQrLookupLoading(false);
  }, [qrCodeInput]);

  const handleQrGrade = useCallback(async () => {
    if (!qrModal || !qrStudent || !qrGrade) return;
    setQrSaving(true);
    try {
      const res = await fetch(`${API}/grade/qr`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          qr_code: qrCodeInput,
          assignment_id: qrModal.assignmentId,
          grade: Number(qrGrade),
          notes: qrNotes,
        }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        alert(`تم تصحيح ${qrModal.title} للطالب ${data.student_name || qrStudent.name}`);
        setQrModal(null);
        setQrCodeInput('');
        setQrStudent(null);
        setQrGrade('');
        setQrNotes('');
        fetchAssignments();
      } else {
        alert(data.message || 'فشل التصحيح');
      }
    } catch (err) { alert('فشل التصحيح'); }
    setQrSaving(false);
  }, [qrModal, qrStudent, qrCodeInput, qrGrade, qrNotes, fetchAssignments]);

  const selectedSubject = courseOfferings.find(s => s.subject_id === selectedSubjectId);
  const filteredOfferings = selectedSubject?.offerings || [];
  const uniqueDepts = [...new Set(filteredOfferings.map((o: any) => o.department_name as string))] as string[];
  const selectedOfferings = selectedDepts.includes("all")
    ? filteredOfferings
    : filteredOfferings.filter((o: any) => selectedDepts.includes(o.department_name));
  const allDeptsSelected = selectedDepts.includes("all");

  const filterSelectedSubject = courseOfferings.find(s => s.subject_id === filterSubjectId);
  const filterOfferings = filterSelectedSubject?.offerings || [];
  const filteredAssignments = assignments.filter(a => {
    if (!filterSubjectId) return true;
    if (!filterOfferingId) return a.subject_id == filterSubjectId;
    return a.offering_id == filterOfferingId;
  }).filter(a => !searchQuery || a.title.toLowerCase().includes(searchQuery.toLowerCase()) || (a.offering_name && a.offering_name.toLowerCase().includes(searchQuery.toLowerCase())));

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedOfferings.length === 0) { alert("يرجى اختيار قسم واحد على الأقل"); return; }
    setCreating(true);
    try {
      const doctorId = getDoctorId();
      const formData = new FormData();
      formData.append('title', newAsg.title);
      formData.append('max_grade', String(newAsg.max_grade));
      formData.append('due_date', newAsg.due_date);
      formData.append('type', 'assignment');
      formData.append('category', newAsg.category);
      formData.append('description', newAsg.description || '');
      formData.append('creator_id', String(doctorId));
      for (const offering of selectedOfferings) {
        formData.append('offering_ids[]', String(offering.id));
      }
      if (fileInputRef.current?.files?.[0]) {
        formData.append('file', fileInputRef.current.files[0]);
      }
      const res = await fetch(`${API}/assignments`, { method: 'POST', body: formData });
      const created = await res.json();
      if (created.success || created.id) {
        setAssignments([...assignments, created.data || created]);
        setShowCreate(false);
        setSelectedSubjectId(null);
        setSelectedDepts([]);
        setNewAsg({ title: "", offering_id: "", max_grade: 10, due_date: "", description: "", category: "theoretical", target_all: true });
      } else {
        alert(created.message || "فشل إنشاء التكليف");
      }
    } catch (err) {
      console.error(err);
      alert("فشل إنشاء التكليف");
    }
    setCreating(false);
  };

  const inputStyle = { width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #ddd", color: "#000", fontSize: "13px", boxSizing: "border-box" as const };

  if (loading) {
    return <div style={{ padding: "20px", marginRight: "260px", width: "calc(100% - 260px)" }}>جاري التحميل...</div>;
  }

  return (
    <div style={{ padding: "20px", marginRight: "260px", color: "#000", width: "calc(100% - 260px)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
        <h2 style={{ margin: 0 }}><ClipboardCheck size={20} style={{ marginLeft: '8px' }} /> التكاليف</h2>
        <button onClick={() => setShowCreate(!showCreate)} style={{ background: primary, color: "#fff", border: "none", padding: "10px 20px", borderRadius: "10px", fontWeight: 600, cursor: "pointer" }}><PlusCircle size={18} /> تكليف جديد</button>
      </div>

      {showCreate && (
        <form onSubmit={handleCreate} style={{ background: "#fff", padding: "24px", borderRadius: "12px", marginBottom: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", color: "#888", marginBottom: "4px" }}>رقم التكليف</label>
              <input type="text" value={`#${assignments.length + 1}`} disabled style={{ ...inputStyle, background: "#f5f5f5", color: "#999" }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "12px", color: "#888", marginBottom: "4px" }}>عنوان التكليف</label>
              <input type="text" placeholder="أدخل عنوان التكليف" value={newAsg.title} onChange={e => setNewAsg({...newAsg, title: e.target.value})} style={inputStyle} required />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "12px", color: "#888", marginBottom: "4px" }}>اختيار المادة</label>
              <select value={selectedSubjectId ?? ""} onChange={e => { setSelectedSubjectId(Number(e.target.value) || null); setSelectedDepts([]); }} style={inputStyle} required>
                <option value="">-- اختر مادة --</option>
                {courseOfferings.map(s => (
                  <option key={s.subject_id} value={s.subject_id}>{s.subject_name}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: "12px", color: "#888", marginBottom: "4px" }}>اختيار القسم</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", padding: "8px 0" }}>
                {filteredOfferings.length > 0 && (
                  <label style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "13px", cursor: "pointer" }}>
                    <input type="checkbox" checked={allDeptsSelected} onChange={e => setSelectedDepts(e.target.checked ? ["all"] : [])} />
                    الكل
                  </label>
                )}
                {!allDeptsSelected && uniqueDepts.map(d => (
                  <label key={d} style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "13px", cursor: "pointer" }}>
                    <input type="checkbox" checked={selectedDepts.includes(d)} onChange={e => setSelectedDepts(e.target.checked ? [...selectedDepts, d] : selectedDepts.filter(x => x !== d))} />
                    {d}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label style={{ display: "block", fontSize: "12px", color: "#888", marginBottom: "4px" }}>نوع التكليف</label>
              <select value={newAsg.category} onChange={e => setNewAsg({...newAsg, category: e.target.value})} style={inputStyle}>
                <option value="theoretical">نظري</option>
                <option value="practical">عملي</option>
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: "12px", color: "#888", marginBottom: "4px" }}>الدرجة القصوى</label>
              <input type="number" placeholder="مثال: 10" value={newAsg.max_grade} onChange={e => setNewAsg({...newAsg, max_grade: Number(e.target.value)})} style={inputStyle} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "12px", color: "#888", marginBottom: "4px" }}>تاريخ التسليم</label>
              <input type="datetime-local" value={newAsg.due_date} onChange={e => setNewAsg({...newAsg, due_date: e.target.value})} style={inputStyle} required />
            </div>
          </div>
          <div style={{ marginTop: "14px" }}>
            <label style={{ display: "block", fontSize: "12px", color: "#888", marginBottom: "4px" }}>وصف التكليف</label>
            <textarea placeholder="أدخل وصف التكليف (اختياري)" value={newAsg.description} onChange={e => setNewAsg({...newAsg, description: e.target.value})} style={{ ...inputStyle, minHeight: "80px", resize: "vertical" }} />
          </div>
          <div style={{ marginTop: "14px" }}>
            <label style={{ display: "block", fontSize: "12px", color: "#888", marginBottom: "4px" }}>إرفاق ملف (اختياري)</label>
            <input ref={fileInputRef} type="file" style={{ fontSize: "13px" }} />
          </div>
          <button type="submit" disabled={creating} style={{ width: "100%", marginTop: "16px", background: creating ? "#999" : primary, color: "#fff", border: "none", padding: "12px", borderRadius: "8px", fontWeight: 700, fontSize: "15px", cursor: creating ? "not-allowed" : "pointer" }}>
            {creating ? 'جاري الحفظ...' : <><Save size={18} style={{ marginLeft: '6px' }} /> حفظ التكليف</>}
          </button>
        </form>
      )}

      {/* Edit Modal */}
      {editingAssignment && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.4)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setEditingAssignment(null)}>
          <div style={{ background: "#fff", borderRadius: "12px", padding: "28px", width: "450px", maxWidth: "90vw" }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: "0 0 18px 0", color: primary }}>تعديل التكليف</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ fontSize: "12px", color: "#888", display: "block", marginBottom: "4px" }}>العنوان</label>
                <input type="text" value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "13px", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ fontSize: "12px", color: "#888", display: "block", marginBottom: "4px" }}>الدرجة القصوى</label>
                <input type="number" value={editForm.max_grade} onChange={e => setEditForm({...editForm, max_grade: Number(e.target.value)})} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "13px", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ fontSize: "12px", color: "#888", display: "block", marginBottom: "4px" }}>تاريخ الإغلاق</label>
                <input type="datetime-local" value={editForm.due_date} onChange={e => setEditForm({...editForm, due_date: e.target.value})} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "13px", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ fontSize: "12px", color: "#888", display: "block", marginBottom: "4px" }}>الوصف</label>
                <textarea value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "13px", minHeight: "60px", resize: "vertical", boxSizing: "border-box" }} />
              </div>
            </div>
            <div style={{ display: "flex", gap: "10px", marginTop: "18px" }}>
              <button onClick={async () => {
                setSaving(true);
                try {
                  const res = await fetch(`${API}/assignments/${editingAssignment.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(editForm),
                  });
                  const data = await res.json();
                  if (data.success || data.data) {
                    setAssignments(assignments.map(a => a.id === editingAssignment.id ? { ...a, ...data.data } : a));
                    setEditingAssignment(null);
                  } else alert(data.message || "فشل التحديث");
                } catch (err) { alert("فشل التحديث"); }
                setSaving(false);
              }} disabled={saving} style={{ flex: 1, background: primary, color: "#fff", border: "none", padding: "10px", borderRadius: "8px", cursor: "pointer", fontWeight: 700 }}>
                {saving ? "جاري الحفظ..." : "حفظ التعديلات"}
              </button>
              <button onClick={async () => {
                if (!window.confirm('هل أنت متأكد من حذف هذا التكليف؟ لا يمكن التراجع عن العملية.')) return;
                setSaving(true);
                try {
                  const res = await fetch(`${API}/assignments/${editingAssignment.id}`, { method: 'DELETE' });
                  const data = await res.json();
                  if (data.success) {
                    setAssignments(assignments.filter(a => a.id !== editingAssignment.id));
                    setEditingAssignment(null);
                  } else alert(data.message || "فشل الحذف");
                } catch (err) { alert("فشل الحذف"); }
                setSaving(false);
              }} disabled={saving} style={{ background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", padding: "10px 16px", borderRadius: "8px", cursor: "pointer", fontWeight: 700, display: "flex", alignItems: "center", gap: "6px" }}>
                <Trash2 size={16} /> حذف
              </button>
              <button onClick={() => setEditingAssignment(null)} style={{ flex: 1, background: "#eee", color: "#333", border: "none", padding: "10px", borderRadius: "8px", cursor: "pointer" }}>إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {courseOfferings.length > 0 && (
        <>
          <div style={{ display: "flex", gap: "8px", marginBottom: "12px", flexWrap: "wrap" }}>
            <button onClick={() => { setFilterSubjectId(null); setFilterOfferingId(null); }} style={{
              background: filterSubjectId === null ? primary : "transparent",
              color: filterSubjectId === null ? "#fff" : "#333",
              border: filterSubjectId === null ? "none" : "1px solid #ddd",
              padding: "6px 16px", borderRadius: "6px",
              cursor: "pointer", fontWeight: 600, fontSize: "13px"
            }}>الكل</button>
            {courseOfferings.map(s => (
              <button key={s.subject_id} onClick={() => { setFilterSubjectId(s.subject_id); setFilterOfferingId(null); }} style={{
                background: filterSubjectId === s.subject_id ? primary : "transparent",
                color: filterSubjectId === s.subject_id ? "#fff" : "#333",
                border: filterSubjectId === s.subject_id ? "none" : "1px solid #ddd",
                padding: "6px 16px", borderRadius: "6px",
                cursor: "pointer", fontWeight: 600, fontSize: "13px"
              }}>{s.subject_name}</button>
            ))}
          </div>
          {filterSubjectId && filterOfferings.length > 1 && (
            <div style={{ display: "flex", gap: "6px", marginBottom: "12px", flexWrap: "wrap" }}>
              <button onClick={() => setFilterOfferingId(null)} style={{
                background: filterOfferingId === null ? primary : "transparent",
                color: filterOfferingId === null ? "#fff" : "#333",
                border: filterOfferingId === null ? "none" : "1px solid #ddd",
                padding: "4px 12px", borderRadius: "6px",
                cursor: "pointer", fontWeight: 600, fontSize: "12px"
              }}>كل التخصصات</button>
              {filterOfferings.map(o => (
                <button key={o.id} onClick={() => setFilterOfferingId(o.id)} style={{
                  background: filterOfferingId === o.id ? primary : "transparent",
                  color: filterOfferingId === o.id ? "#fff" : "#333",
                  border: filterOfferingId === o.id ? "none" : "1px solid #ddd",
                  padding: "4px 12px", borderRadius: "6px",
                  cursor: "pointer", fontWeight: 600, fontSize: "12px"
                }}>{o.department_name}</button>
              ))}
            </div>
          )}
        </>
      )}

      {/* Search Bar */}
      {filteredAssignments.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", background: "#f5f5f5", borderRadius: 8, padding: "8px 14px", border: "1px solid #eee" }}>
            <Search size={16} color="#999" />
            <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="ابحث عن واجب..." style={{ border: "none", background: "transparent", marginRight: 8, outline: "none", flex: 1, color: "#333", fontSize: 13 }} />
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" }}>
        {filteredAssignments.map(a => (
          <div key={a.id} style={{ background: "#fff", padding: "20px", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <h3 style={{ margin: 0, fontSize: "16px" }}>{a.title}</h3>
              <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                {a.creator_id === currentDoctorId && (
                  <button onClick={() => { setEditingAssignment(a); setEditForm({ title: a.title, max_grade: a.max_grade, description: a.description || '', due_date: a.due_date ? a.due_date.replace('Z', '').slice(0, 16) : '' }); }} style={{ background: "none", border: "none", cursor: "pointer", padding: "4px", color: primary }} title="تعديل">
                    <Pencil size={16} />
                  </button>
                )}
                <span style={{ background: a.category === 'practical' ? '#e3f2fd' : '#fff3e0', color: a.category === 'practical' ? '#1565c0' : '#e65100', padding: "2px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: 700 }}>
                  {a.category === 'practical' ? 'عملي' : 'نظري'}
                </span>
              </div>
            </div>
            <p style={{ margin: "4px 0", fontSize: "13px", color: "#666" }}><BookOpen size={14} style={{ marginLeft: '6px' }} /> {a.offering_name}</p>
            {a.department_names && a.department_names.length > 0 && (
              <p style={{ margin: "4px 0", fontSize: "12px", color: "#888" }}>
                الأقسام: {a.department_names.join(' - ')}
              </p>
            )}
            <p style={{ margin: "4px 0", fontSize: "13px", color: "#666" }}><CalendarCheck size={14} style={{ marginLeft: '6px' }} /> {new Date(a.due_date).toLocaleString("ar-SA")}</p>
            <p style={{ margin: "4px 0", fontSize: "13px", color: "#666" }}><Star size={14} style={{ marginLeft: '6px' }} /> الدرجة: {a.max_grade}</p>
            <p style={{ margin: "4px 0", fontSize: "13px", color: "#666" }}><ClipboardList size={14} style={{ marginLeft: '6px' }} /> عدد المسلمات: {a.submission_count ?? 0}</p>
            <button onClick={() => navigate("/submissions-status", { state: { type: "assignment", id: a.id, title: a.title, maxGrade: a.max_grade, creator_id: a.creator_id } })} style={{ width: "100%", background: primary, color: "#fff", border: "none", padding: "8px", borderRadius: "6px", cursor: "pointer", fontSize: "13px", marginTop: "8px" }}>
              عرض حالة التسليم
            </button>
            {a.creator_id === currentDoctorId && (
            <button onClick={() => { setQrModal({ show: true, assignmentId: a.id, title: a.title, maxGrade: a.max_grade }); setQrCodeInput(''); setQrStudent(null); setQrGrade(''); setQrNotes(''); }} style={{ width: "100%", background: "#1565c0", color: "#fff", border: "none", padding: "8px", borderRadius: "6px", cursor: "pointer", fontSize: "13px", marginTop: "6px" }}>
              <QrCode size={14} style={{ marginLeft: '6px' }} /> تصحيح بالباركود
            </button>
            )}
          </div>
        ))}
        {filteredAssignments.length === 0 && <p style={{ color: "#999", fontSize: "14px", textAlign: "center", gridColumn: "1 / -1" }}>لا توجد تكاليف بعد</p>}
      </div>

      {/* QR Grading Modal */}
      {qrModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.4)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => { if (!qrSaving) setQrModal(null); }}>
          <div style={{ background: "#fff", borderRadius: "12px", padding: "28px", width: "450px", maxWidth: "90vw" }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: "0 0 6px 0", color: primary }}>تصحيح بالباركود: {qrModal.title}</h3>
            <p style={{ fontSize: "12px", color: "#888", margin: "0 0 16px 0" }}>أدخل رمز الباركود (أو رقم الطالب)</p>
            <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
              <input
                type="text" value={qrCodeInput} onChange={e => setQrCodeInput(e.target.value)}
                placeholder="مثال: 12345"
                style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "13px", direction: "ltr" }}
                onKeyDown={e => { if (e.key === 'Enter') handleQrLookup(); }}
              />
              <button onClick={handleQrLookup} disabled={qrLookupLoading || !qrCodeInput.trim()} style={{ background: primary, color: "#fff", border: "none", padding: "10px 20px", borderRadius: "8px", cursor: "pointer", fontWeight: 700, fontSize: "13px", whiteSpace: "nowrap" }}>
                {qrLookupLoading ? '...' : 'بحث'}
              </button>
            </div>
            {qrStudent && (
              <div style={{ background: "#f5f5f5", padding: "12px", borderRadius: "8px", marginBottom: "16px" }}>
                <div style={{ fontWeight: 700, fontSize: "15px", marginBottom: "4px" }}>{qrStudent.name}</div>
                <div style={{ display: "flex", gap: "12px", fontSize: "12px", color: "#888" }}>
                  <span>📚 {qrStudent.department || '-'}</span>
                  <span>🆔 {qrStudent.academic_number || qrStudent.id}</span>
                </div>
              </div>
            )}
            {qrStudent && (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "12px", color: "#888", display: "block", marginBottom: "4px" }}>الدرجة (من {qrModal.maxGrade})</label>
                  <input type="number" max={qrModal.maxGrade} min={0} value={qrGrade} onChange={e => setQrGrade(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "13px", boxSizing: "border-box" }} />
                </div>
                <div>
                  <label style={{ fontSize: "12px", color: "#888", display: "block", marginBottom: "4px" }}>ملاحظات (اختياري)</label>
                  <textarea value={qrNotes} onChange={e => setQrNotes(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "13px", minHeight: "60px", resize: "vertical", boxSizing: "border-box" }} />
                </div>
                <button onClick={handleQrGrade} disabled={qrSaving || !qrGrade} style={{ width: "100%", background: primary, color: "#fff", border: "none", padding: "10px", borderRadius: "8px", cursor: "pointer", fontWeight: 700, fontSize: "14px" }}>
                  {qrSaving ? "جاري الحفظ..." : "حفظ التصحيح"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ================= Review Submissions =================
const ReviewSubmissionsPage: React.FC = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedSub, setSelectedSub] = useState<Submission | null>(null);
  const [grade, setGrade] = useState(0);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'graded'>('all');

  useEffect(() => {
    const doctorId = getDoctorId();
    if (!doctorId) { setLoading(false); return; }

    fetch(`${API}/submissions/doctor/${doctorId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setSubmissions(data.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching submissions:", err);
        setLoading(false);
      });
  }, []);

  const handleReview = async () => {
    if (!selectedSub) return;
    try {
      const res = await fetch(`${API}/submissions/${selectedSub.id}/grade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ grade, doctor_notes: notes })
      });
      if (res.ok) {
        setSubmissions(prev => prev.map(s => s.id === selectedSub.id ? { ...s, grade, status: 'graded' } : s));
        setSelectedSub(null);
        alert("تم تقييم التسليم بنجاح");
      } else {
        alert("فشل تقييم التسليم");
      }
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء التقييم");
    }
  };

  const filtered = submissions.filter(s => filter === 'all' ? true : s.status === filter);

  if (loading) {
    return <div style={{ padding: "20px", marginRight: "260px", width: "calc(100% - 260px)" }}>جاري التحميل...</div>;
  }

  return (
    <div style={{ padding: "20px", marginRight: "260px", color: "#000", width: "calc(100% - 260px)" }}>
      <h2 style={{ margin: "0 0 16px 0" }}><Download size={20} style={{ marginLeft: '8px' }} /> مراجعة التسليمات</h2>

      <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
        {(['all', 'pending', 'graded'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            background: filter === f ? primary : "transparent", color: filter === f ? "#fff" : "#333",
            border: filter === f ? "none" : "1px solid #ddd", padding: "6px 16px", borderRadius: "6px",
            cursor: "pointer", fontWeight: 600, fontSize: "13px"
          }}>{f === 'all' ? 'الكل' : f === 'pending' ? 'معلق' : 'تم التصحيح'}</button>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {filtered.map(s => (
          <div key={s.id} style={{
            background: "#fff", padding: "16px", borderRadius: "10px",
            display: "flex", justifyContent: "space-between", alignItems: "center",
            border: s.status === 'graded' ? '1px solid #d4edda' : '1px solid #fff3cd'
          }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                <span style={{ fontWeight: 700, fontSize: "14px" }}>{s.student_name}</span>
                <span style={{
                  background: s.status === 'graded' ? '#d4edda' : '#fff3cd',
                  color: s.status === 'graded' ? '#155724' : '#856404',
                  padding: "2px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: 700
                }}>{s.status === 'graded' ? 'تم التصحيح' : 'معلق'}</span>
              </div>
              <p style={{ margin: 0, fontSize: "12px", color: "#888" }}>{s.assignment_title}</p>
              <p style={{ margin: "2px 0 0 0", fontSize: "11px", color: "#aaa" }}>{new Date(s.submitted_at).toLocaleString("ar-SA")}</p>
              {s.status === 'graded' && <p style={{ margin: "2px 0 0 0", fontSize: "12px", color: primary }}><Star size={12} style={{ marginLeft: '4px' }} /> الدرجة: {s.grade}</p>}
            </div>
            <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
              {s.file_path && <a href={getFileUrl(s.file_path)} target="_blank" rel="noreferrer" style={{ background: "#f0f3f6", border: "1px solid #ddd", padding: "6px 12px", borderRadius: "6px", textDecoration: "none", color: "#333", fontSize: "12px", cursor: "pointer" }}>الملف</a>}
              <button onClick={() => { setSelectedSub(s); setGrade(s.grade || 0); setNotes(s.doctor_notes || ""); }} style={{ background: primary, color: "#fff", border: "none", padding: "6px 14px", borderRadius: "6px", cursor: "pointer", fontSize: "12px" }}>
                {s.status === 'graded' ? 'مراجعة' : 'تقييم'}
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p style={{ color: "#999", fontSize: "14px" }}>لا توجد تسليمات</p>}
      </div>

      {selectedSub && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#fff", padding: 25, borderRadius: 15, width: 400, maxWidth: "90%" }}>
            <h3 style={{ margin: "0 0 4px 0" }}>{selectedSub.student_name}</h3>
            <p style={{ margin: "0 0 12px 0", fontSize: "12px", color: "#888" }}>{selectedSub.assignment_title} - {new Date(selectedSub.submitted_at).toLocaleString("ar-SA")}</p>
            {selectedSub.file_path && <a href={getFileUrl(selectedSub.file_path)} target="_blank" rel="noreferrer" style={{ display: "block", marginBottom: "10px", color: primary }}><FileText size={16} style={{ marginLeft: '6px' }} /> عرض الملف المرفوع</a>}
            {selectedSub.submission_text && <p style={{ background: "#f5f7fa", padding: "10px", borderRadius: "8px", fontSize: "13px" }}>{selectedSub.submission_text}</p>}
            <div style={{ marginTop: 15 }}>
              <label style={{ display: "block", fontSize: "13px", marginBottom: "4px" }}>الدرجة:</label>
              <input type="number" value={grade} onChange={e => setGrade(Number(e.target.value))} style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #ddd", marginBottom: "10px", color: "#000" }} />
              <label style={{ display: "block", fontSize: "13px", marginBottom: "4px" }}>ملاحظات:</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} style={{ width: "100%", height: "80px", padding: "8px", borderRadius: "6px", border: "1px solid #ddd", color: "#000" }} />
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 15 }}>
              <button onClick={handleReview} style={{ flex: 1, background: primary, color: "#fff", border: "none", padding: "10px", borderRadius: "8px", cursor: "pointer", fontWeight: 600, fontSize: "14px" }}>حفظ</button>
              <button onClick={() => setSelectedSub(null)} style={{ flex: 1, background: "#eee", color: "#333", border: "none", padding: "10px", borderRadius: "8px", cursor: "pointer", fontSize: "14px" }}>إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ================= Grades Page =================
const GradesPage: React.FC = () => {
  const navigate = useNavigate();
  const [uniqueSubjects, setUniqueSubjects] = useState<any[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null);
  const [selectedOfferingId, setSelectedOfferingId] = useState<number | null>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [selectedDept, setSelectedDept] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [showBalancing, setShowBalancing] = useState(false);
  const [weights, setWeights] = useState({ attendance: 10, assignments: 20, quizzes: 20, midterm: 20, final: 30 });
  const [weightsLoading, setWeightsLoading] = useState(false);
  const [gradeModal, setGradeModal] = useState<{ open: boolean; student: any }>({ open: false, student: null });
  const [editGrade, setEditGrade] = useState({
    attendance_grade: 0, assignments_grade: 0, quizzes_grade: 0,
    midterm_grade: 0, final_exam_grade: 0
  });
  const [isPracticalDoctor, setIsPracticalDoctor] = useState(false);
  const doctorId = getDoctorId();

  const openGradeModal = (s: any) => {
    setEditGrade({
      attendance_grade: s.attendance_grade ?? 0,
      assignments_grade: s.assignments_grade ?? 0,
      quizzes_grade: s.quizzes_grade ?? 0,
      midterm_grade: s.midterm_grade ?? 0,
      final_exam_grade: s.final_exam_grade ?? 0,
    });
    setGradeModal({ open: true, student: s });
  };

  const handleSaveGrade = async () => {
    const student = gradeModal.student;
    if (!student?.grade_id) { alert('لا يوجد سجل درجة لهذا الطالب'); return; }
    const total = editGrade.attendance_grade + editGrade.assignments_grade + editGrade.quizzes_grade + editGrade.midterm_grade + editGrade.final_exam_grade;
    try {
      const res = await fetch(`${API}/grades/${student.grade_id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...editGrade, total_grade: total, doctor_id: doctorId })
      });
      const data = await res.json();
      if (data.success) {
        setGradeModal({ open: false, student: null });
        if (selectedOfferingId) {
          fetch(`${API}/course-offerings/${selectedOfferingId}/students`)
            .then(r => r.json())
            .then(d => { if (d.success) setStudents(d.data); });
        }
      } else alert(data.message || 'فشل التحديث');
    } catch { alert('خطأ في تحديث الدرجة'); }
  };

  const loadWeights = useCallback(async (offeringId: number) => {
    setWeightsLoading(true);
    try {
      const res = await fetch(`${API}/course-settings/${offeringId}`);
      const data = await res.json();
      if (data.success && data.grade_weights) {
        const gw = data.grade_weights;
        setWeights({
          attendance: gw.attendance_weight ?? 10,
          assignments: gw.assignments_weight ?? 10,
          quizzes: gw.quizzes_weight ?? 20,
          midterm: gw.midterm_weight ?? 20,
          final: gw.final_weight ?? 40,
        });
      }
    } catch {}
    setWeightsLoading(false);
  }, []);

  const selectedSubject = uniqueSubjects.find(s => s.subject_id === selectedSubjectId);
  const subjectOfferings = selectedSubject?.offerings || [];

  useEffect(() => {
    const doctorId = getDoctorId();
    if (!doctorId) { setLoading(false); return; }
    fetch(`${API}/doctor/unique-subjects/${doctorId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setUniqueSubjects(data.data);
          if (data.data.length > 0) {
            setSelectedSubjectId(data.data[0].subject_id);
            const firstOffering = data.data[0].offerings?.[0];
            if (firstOffering) setSelectedOfferingId(firstOffering.id);
          }
        }
        setLoading(false);
      })
      .catch(err => { console.error(err); setLoading(false); });
  }, []);

  useEffect(() => {
    if (!selectedOfferingId) return;
    setStudentsLoading(true);
    fetch(`${API}/course-offerings/${selectedOfferingId}/students`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setStudents(data.data);
        setIsPracticalDoctor(doctorId ? data.ta_id === doctorId : false);
        setStudentsLoading(false);
      })
      .catch(() => setStudentsLoading(false));

    fetch(`${API}/course-offerings/${selectedOfferingId}/departments`)
      .then(res => res.json())
      .then(data => { if (data.success) setDepartments(data.data); })
      .catch(() => {});
  }, [selectedOfferingId]);

  const filteredStudents = selectedDept ? students.filter(s => s.department_id === selectedDept) : students;

  const exportExcel = () => {
    const headers = ['اسم الطالب', 'الرقم الجامعي', 'التخصص', 'الحضور', 'التكاليف', 'الكويزات', 'النصفي', 'النهائي', 'المجموع', 'النسبة', 'الحالة'];
    const rows = filteredStudents.map(s => {
      const total = s.total_grade ?? 0;
      return [s.name, s.academic_number, s.department_name, s.attendance_grade, s.assignments_grade, s.quizzes_grade, s.midterm_grade, s.final_exam_grade, total, total + '%', total >= 60 ? 'ناجح' : 'راسب'];
    });
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `grades_${selectedOfferingId}.csv`;
    link.click();
  };

  const applyBalancing = async () => {
    const totalWeight = weights.attendance + weights.assignments + weights.quizzes + weights.midterm + weights.final;
    if (totalWeight !== 100) { alert("مجموع الأوزان يجب أن يساوي 100"); return; }
    if (!selectedOfferingId) return;
    if (!confirm("تأكيد تطبيق الموازنة على جميع الطلاب؟")) return;
    await fetch(`${API}/grades/weights`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        offering_id: selectedOfferingId,
        attendance_weight: weights.attendance,
        assignments_weight: weights.assignments,
        quizzes_weight: weights.quizzes,
        midterm_weight: weights.midterm,
        final_weight: weights.final,
      })
    });
    await loadWeights(selectedOfferingId);
    alert("تم تطبيق الموازنة");
    setShowBalancing(false);
    fetch(`${API}/course-offerings/${selectedOfferingId}/students`)
      .then(res => res.json())
      .then(data => { if (data.success) setStudents(data.data); });
  };

  const passed = filteredStudents.filter(s => (s.total_grade ?? 0) >= 60).length;
  const failed = filteredStudents.length - passed;
  const grades = filteredStudents.map(s => s.total_grade ?? 0);
  const maxGrade = grades.length > 0 ? Math.max(...grades) : 0;
  const minGrade = grades.length > 0 ? Math.min(...grades) : 0;
  const avgGrade = grades.length > 0 ? (grades.reduce((a, b) => a + b, 0) / grades.length).toFixed(1) : 0;

  const inputStyle = { width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #ddd", color: "#000", fontSize: "13px", boxSizing: "border-box" as const };
  const container = { padding: "20px", marginRight: "260px", color: "#000", width: "calc(100% - 260px)" };
  const card = { background: "#fff", padding: "20px", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" };

  if (loading) {
    return <div style={container}>جاري التحميل...</div>;
  }

  return (
    <div style={container}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2 style={{ margin: 0 }}><GraduationCap size={20} style={{ marginLeft: '8px' }} /> كشف الدرجات</h2>
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={exportExcel} style={{ background: "#28a745", color: "#fff", border: "none", padding: "8px 16px", borderRadius: "8px", cursor: "pointer", fontWeight: 600, fontSize: "13px" }}>
            <Download size={16} style={{ marginLeft: '6px' }} /> تصدير إلى Excel
          </button>
           {!isPracticalDoctor && <button onClick={async () => { if (selectedOfferingId) await loadWeights(selectedOfferingId); setShowBalancing(true); }} style={{ background: primary, color: "#fff", border: "none", padding: "8px 16px", borderRadius: "8px", cursor: "pointer", fontWeight: 600, fontSize: "13px" }}>
             <Scale size={16} style={{ marginLeft: '6px' }} /> موازنة الدرجات
             </button>}
        </div>
      </div>

      {/* Subject tabs (unique) */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
        {uniqueSubjects.map(s => (
          <button key={s.subject_id} onClick={() => {
            setSelectedSubjectId(s.subject_id);
            setSelectedOfferingId(s.offerings?.[0]?.id ?? null);
            setSelectedDept(null);
          }} style={{
            background: selectedSubjectId === s.subject_id ? primary : "transparent",
            color: selectedSubjectId === s.subject_id ? "#fff" : "#333",
            border: selectedSubjectId === s.subject_id ? "none" : "1px solid #ddd",
            padding: "6px 14px", borderRadius: "6px",
            cursor: "pointer", fontWeight: 600, fontSize: "12px"
          }}>{s.subject_name}</button>
        ))}
      </div>

      {/* Offering/department tabs within selected subject */}
      {selectedSubject && subjectOfferings.length > 1 && (
        <div style={{ display: "flex", gap: "6px", marginBottom: "16px", flexWrap: "wrap" }}>
          {subjectOfferings.map((o: any) => (
            <button key={o.id} onClick={() => { setSelectedOfferingId(o.id); setSelectedDept(null); }} style={{
              background: selectedOfferingId === o.id ? primary : "transparent",
              color: selectedOfferingId === o.id ? "#fff" : "#333",
              border: selectedOfferingId === o.id ? "none" : "1px solid #ddd",
              padding: "4px 12px", borderRadius: "6px",
              cursor: "pointer", fontWeight: 600, fontSize: "12px"
            }}>{o.department_name} (مستوى {o.level})</button>
          ))}
        </div>
      )}

      {/* Department sub-tabs */}
      {selectedOfferingId && (
        <div style={{ display: "flex", gap: "6px", marginBottom: "16px", flexWrap: "wrap" }}>
          <button onClick={() => setSelectedDept(null)} style={{
            background: selectedDept === null ? primary : "transparent", color: selectedDept === null ? "#fff" : "#333",
            border: selectedDept === null ? "none" : "1px solid #ddd", padding: "4px 12px", borderRadius: "6px",
            cursor: "pointer", fontWeight: 600, fontSize: "12px"
          }}>كل التخصصات</button>
          {departments.map(d => (
            <button key={d.id} onClick={() => setSelectedDept(d.id)} style={{
              background: selectedDept === d.id ? primary : "transparent", color: selectedDept === d.id ? "#fff" : "#333",
              border: selectedDept === d.id ? "none" : "1px solid #ddd", padding: "4px 12px", borderRadius: "6px",
              cursor: "pointer", fontWeight: 600, fontSize: "12px"
            }}>{d.name}</button>
          ))}
        </div>
      )}

      {/* Statistics */}
      {!studentsLoading && filteredStudents.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "10px", marginBottom: "16px" }}>
          <div style={{ ...card, padding: "12px", textAlign: "center" }}>
            <p style={{ margin: 0, fontSize: "11px", color: "#888" }}>عدد الطلاب</p>
            <p style={{ margin: "4px 0 0 0", fontSize: "18px", fontWeight: 700, color: primary }}>{filteredStudents.length}</p>
          </div>
          <div style={{ ...card, padding: "12px", textAlign: "center" }}>
            <p style={{ margin: 0, fontSize: "11px", color: "#888" }}>ناجح</p>
            <p style={{ margin: "4px 0 0 0", fontSize: "18px", fontWeight: 700, color: "#28a745" }}>{passed}</p>
          </div>
          <div style={{ ...card, padding: "12px", textAlign: "center" }}>
            <p style={{ margin: 0, fontSize: "11px", color: "#888" }}>راسب</p>
            <p style={{ margin: "4px 0 0 0", fontSize: "18px", fontWeight: 700, color: "#dc3545" }}>{failed}</p>
          </div>
          <div style={{ ...card, padding: "12px", textAlign: "center" }}>
            <p style={{ margin: 0, fontSize: "11px", color: "#888" }}>أعلى درجة</p>
            <p style={{ margin: "4px 0 0 0", fontSize: "18px", fontWeight: 700, color: primary }}>{maxGrade}</p>
          </div>
          <div style={{ ...card, padding: "12px", textAlign: "center" }}>
            <p style={{ margin: 0, fontSize: "11px", color: "#888" }}>أقل درجة</p>
            <p style={{ margin: "4px 0 0 0", fontSize: "18px", fontWeight: 700, color: primary }}>{minGrade}</p>
          </div>
          <div style={{ ...card, padding: "12px", textAlign: "center" }}>
            <p style={{ margin: 0, fontSize: "11px", color: "#888" }}>المتوسط</p>
            <p style={{ margin: "4px 0 0 0", fontSize: "18px", fontWeight: 700, color: primary }}>{avgGrade}</p>
          </div>
        </div>
      )}

      {/* Student cards */}
      {studentsLoading ? <p style={{ color: "#999" }}>جاري التحميل...</p> : filteredStudents.length === 0 ? (
        <p style={{ color: "#999", fontSize: "14px" }}>لا يوجد طلاب</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "16px" }}>
          {filteredStudents.map(s => {
            const total = s.total_grade ?? 0;
            const passed = total >= 60;
            return (
              <div key={s.enrollment_id} style={{ background: "#fff", borderRadius: "14px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)", padding: "20px" }}>
                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#1D4C4F" }}>{s.name}</h4>
                    <span style={{ fontSize: "11px", color: "#888" }}>{s.academic_number}</span>
                  </div>
                  <span style={{ background: passed ? "#d4edda" : "#f8d7da", color: passed ? "#155724" : "#721c24", padding: "3px 14px", borderRadius: "20px", fontSize: "11px", fontWeight: 700 }}>
                    {passed ? 'ناجح' : 'راسب'}
                  </span>
                </div>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "14px" }}>
                  <span style={{ background: "#f0f3f6", padding: "4px 12px", borderRadius: "6px", fontSize: "11px", color: "#555" }}>{s.department_name}</span>
                  <span style={{ background: "#f0f3f6", padding: "4px 12px", borderRadius: "6px", fontSize: "11px", color: "#555" }}>مستوى {s.level}</span>
                </div>

                {/* Stats grid */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px", marginBottom: "14px" }}>
                  <div style={{ background: "#f8fafb", borderRadius: "10px", padding: "10px", textAlign: "center" }}>
                    <div style={{ fontSize: "10px", color: "#1D4C4F", fontWeight: 700, marginBottom: "6px" }}>الحضور</div>
                    <div style={{ fontSize: "12px", fontWeight: 600, color: "#333", marginBottom: "2px" }}>{s.attended_sessions ?? 0} / {s.total_sessions ?? 0}</div>
                    <div style={{ fontSize: "12px", fontWeight: 700, color: "#1D4C4F" }}>{s.attendance_grade ?? 0} / {s.attendance_weight ?? 10}</div>
                  </div>
                  <div style={{ background: "#f8fafb", borderRadius: "10px", padding: "10px", textAlign: "center" }}>
                    <div style={{ fontSize: "10px", color: "#28a745", fontWeight: 700, marginBottom: "6px" }}>التكاليف</div>
                    <div style={{ fontSize: "12px", fontWeight: 600, color: "#333", marginBottom: "2px" }}>{s.submitted_assignments_count ?? 0} / {s.total_assignments_count ?? 0}</div>
                    <div style={{ fontSize: "12px", fontWeight: 700, color: "#28a745" }}>{s.assignments_grade ?? 0} / {s.assignments_weight ?? 10}</div>
                  </div>
                  <div style={{ background: "#f8fafb", borderRadius: "10px", padding: "10px", textAlign: "center" }}>
                    <div style={{ fontSize: "10px", color: "#17a2b8", fontWeight: 700, marginBottom: "6px" }}>الكويزات</div>
                    <div style={{ fontSize: "12px", fontWeight: 600, color: "#333", marginBottom: "2px" }}>{s.submitted_quizzes_count ?? 0} / {s.total_quizzes_count ?? 0}</div>
                    <div style={{ fontSize: "12px", fontWeight: 700, color: "#17a2b8" }}>{s.quizzes_grade ?? 0} / {s.quizzes_weight ?? 20}</div>
                  </div>
                  <div style={{ background: "#f8fafb", borderRadius: "10px", padding: "10px", textAlign: "center" }}>
                    <div style={{ fontSize: "10px", color: "#ffc107", fontWeight: 700, marginBottom: "6px" }}>النصفي</div>
                    <div style={{ fontSize: "12px", fontWeight: 700, color: "#ffc107" }}>{s.midterm_grade ?? 0} / {s.midterm_weight ?? 20}</div>
                  </div>
                  <div style={{ background: "#f8fafb", borderRadius: "10px", padding: "10px", textAlign: "center" }}>
                    <div style={{ fontSize: "10px", color: "#dc3545", fontWeight: 700, marginBottom: "6px" }}>النهائي</div>
                    <div style={{ fontSize: "12px", fontWeight: 700, color: "#dc3545" }}>{s.final_exam_grade ?? 0} / {s.final_weight ?? 40}</div>
                  </div>
                  <div style={{ background: "rgba(29,76,79,0.08)", borderRadius: "10px", padding: "10px", textAlign: "center" }}>
                    <div style={{ fontSize: "10px", color: "#1D4C4F", fontWeight: 700, marginBottom: "6px" }}>المجموع</div>
                    <div style={{ fontSize: "14px", fontWeight: 800, color: passed ? "#28a745" : "#dc3545" }}>{total}</div>
                    <div style={{ fontSize: "10px", color: "#888" }}>/ 100</div>
                  </div>
                </div>

                {/* Buttons */}
                <div style={{ display: "flex", gap: "8px" }}>
                  <button onClick={() => openGradeModal(s)} style={{ flex: 1, background: primary, color: "#fff", border: "none", padding: "10px", borderRadius: "10px", cursor: "pointer", fontSize: "13px", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                    <Pencil size={14} /> تعديل
                  </button>
                  <button onClick={() => {
                    const docId = getDoctorId();
                    navigate('/student-submissions', { state: { studentId: s.student_id, offeringId: selectedOfferingId, studentName: s.name, doctorId: docId } });
                  }} style={{ flex: 1, background: "#28a745", color: "#fff", border: "none", padding: "10px", borderRadius: "10px", cursor: "pointer", fontSize: "13px", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                    <Eye size={14} /> عرض المسلمات
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Grade Edit Modal */}
      {gradeModal.open && gradeModal.student && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#fff", padding: "24px", borderRadius: "14px", width: "420px", maxWidth: "90%" }}>
            <h3 style={{ margin: "0 0 16px 0", fontSize: "16px", color: "#1D4C4F" }}><Pencil size={16} style={{ marginLeft: '8px' }} /> تعديل درجة - {gradeModal.student.name}</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
              {([
                { label: 'الحضور', key: 'attendance_grade', color: '#1D4C4F' },
                { label: 'التكاليف', key: 'assignments_grade', color: '#28a745' },
                { label: 'الكويزات', key: 'quizzes_grade', color: '#17a2b8' },
                { label: 'النصفي', key: 'midterm_grade', color: '#ffc107' },
                { label: 'النهائي', key: 'final_exam_grade', color: '#dc3545' },
              ] as const).filter(f => !isPracticalDoctor || f.key === 'assignments_grade' || f.key === 'quizzes_grade').map(f => (
                <div key={f.key}>
                  <label style={{ display: "block", fontSize: "12px", color: "#888", marginBottom: "4px" }}>{f.label}</label>
                  <input type="number" value={(editGrade as any)[f.key]} onChange={e => setEditGrade({ ...editGrade, [f.key]: Number(e.target.value) })} style={{ width: "100%", padding: "8px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "13px" }} />
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={handleSaveGrade} style={{ flex: 1, background: primary, color: "#fff", border: "none", padding: "12px", borderRadius: "10px", cursor: "pointer", fontWeight: 700, fontSize: "14px" }}>حفظ التعديلات</button>
              <button onClick={() => setGradeModal({ open: false, student: null })} style={{ flex: 1, background: "#eee", color: "#333", border: "none", padding: "12px", borderRadius: "10px", cursor: "pointer", fontSize: "14px" }}>إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {/* Grade Balancing Modal */}
      {showBalancing && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#fff", padding: "24px", borderRadius: "12px", width: "380px", maxWidth: "90%" }}>
            <h3 style={{ margin: "0 0 16px 0", fontSize: "16px" }}><Scale size={16} style={{ marginLeft: '6px' }} /> موازنة الدرجات</h3>
            <p style={{ fontSize: "12px", color: "#888", marginBottom: "12px" }}>حدد الأوزان النسبية لكل مكون (المجموع يجب أن يساوي 100)</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {[
                ['الحضور', 'attendance'],
                ['التكاليف', 'assignments'],
                ['الكويزات', 'quizzes'],
                ['الامتحان النصفي', 'midterm'],
                ['الامتحان النهائي', 'final'],
              ].map(([label, field]) => (
                <div key={field}>
                  <label style={{ display: "block", fontSize: "12px", marginBottom: "2px", color: "#555" }}>{label}</label>
                  <input type="number" value={(weights as any)[field]} onChange={e => setWeights({...weights, [field]: Number(e.target.value)})} style={inputStyle} />
                </div>
              ))}
            </div>
            <div style={{ padding: "10px", background: "#f5f7fa", borderRadius: "6px", textAlign: "center", fontSize: "13px", marginTop: "10px" }}>
              المجموع: <strong>{weights.attendance + weights.assignments + weights.quizzes + weights.midterm + weights.final}</strong> / 100
            </div>
            <div style={{ display: "flex", gap: "10px", marginTop: "14px" }}>
              <button onClick={applyBalancing} style={{ flex: 1, background: primary, color: "#fff", border: "none", padding: "10px", borderRadius: "8px", cursor: "pointer", fontWeight: 600, fontSize: "14px" }}>تطبيق</button>
              <button onClick={() => setShowBalancing(false)} style={{ flex: 1, background: "#eee", color: "#333", border: "none", padding: "10px", borderRadius: "8px", cursor: "pointer", fontSize: "14px" }}>إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ================= Profile Page =================
const ProfilePage: React.FC = () => {
  const [doctorInfo, setDoctorInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [pwdForm, setPwdForm] = useState({ current: "", newPwd: "", confirm: "" });
  const [pwdMsg, setPwdMsg] = useState("");
  const [qrExpanded, setQrExpanded] = useState(false);

  useEffect(() => {
    const doctorId = getDoctorId();
    if (!doctorId) { setLoading(false); return; }
    fetch(`${API}/users/${doctorId}`)
      .then(res => res.json())
      .then(data => {
        setDoctorInfo(data);
        setEmail(data.email || '');
        setPhone(data.phone || '');
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleUpdate = async () => {
    const doctorId = getDoctorId();
    if (!doctorId) return;
    try {
      const res = await fetch(`${API}/users/${doctorId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, phone })
      });
      const data = await res.json();
      if (data.success) { alert("تم تحديث البيانات"); setEditing(false); } else alert(data.message || "فشل التحديث");
    } catch { alert("حدث خطأ"); }
  };

  const handlePwdChange = async () => {
    const doctorId = getDoctorId();
    if (!doctorId) return;
    if (pwdForm.newPwd !== pwdForm.confirm) { setPwdMsg("كلمة المرور الجديدة غير متطابقة"); return; }
    if (pwdForm.newPwd.length < 6) { setPwdMsg("كلمة المرور يجب أن تكون 6 أحرف على الأقل"); return; }
    try {
      const res = await fetch(`${API}/users/${doctorId}/password`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ current_password: pwdForm.current, new_password: pwdForm.newPwd })
      });
      const data = await res.json();
      if (data.success) { alert("تم تغيير كلمة المرور"); setPwdForm({ current: "", newPwd: "", confirm: "" }); setPwdMsg(""); } else setPwdMsg(data.message || "فشل تغيير كلمة المرور");
    } catch { setPwdMsg("حدث خطأ"); }
  };

  const inputStyle = { width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #ddd", color: "#000", fontSize: "13px", boxSizing: "border-box" as const };
  const container = { padding: "20px", marginRight: "260px", color: "#000", width: "calc(100% - 260px)" };
  const card = { background: "#fff", padding: "20px", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" };

  if (loading) return <div style={container}>جاري التحميل...</div>;
  if (!doctorInfo) return <div style={container}>لم يتم العثور على الملف الشخصي</div>;

  return (
    <div style={container}>
      <h2 style={{ margin: "0 0 20px 0" }}><UserCircle size={20} style={{ marginLeft: '8px' }} /> الملف الشخصي</h2>

      <div style={{ ...card, marginBottom: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "20px" }}>
          <img src="/logo.jpg" alt="Rabet" style={{ width: "70px", height: "70px", borderRadius: "12px", objectFit: "cover" }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          <div>
            <h3 style={{ margin: 0, fontSize: "18px" }}>{doctorInfo.name}</h3>
            <p style={{ margin: "4px 0 0 0", color: "#888", fontSize: "13px" }}>{doctorInfo.title || 'دكتور'}</p>
          </div>
        </div>

        <table style={{ width: "100%", fontSize: "13px" }}>
          <tbody>
            <tr><td style={{ padding: "6px 0", color: "#888", width: "120px" }}>البريد الإلكتروني</td><td style={{ padding: "6px 0", fontWeight: 600 }}>{doctorInfo.email}</td></tr>
            <tr><td style={{ padding: "6px 0", color: "#888" }}>رقم الهاتف</td><td style={{ padding: "6px 0", fontWeight: 600 }}>{doctorInfo.phone || 'غير محدد'}</td></tr>
            <tr><td style={{ padding: "6px 0", color: "#888" }}>القسم</td><td style={{ padding: "6px 0", fontWeight: 600 }}>{doctorInfo.department_name}</td></tr>
          </tbody>
        </table>
      </div>

      {/* تحديث البيانات */}
      <div style={{ ...card, marginBottom: "20px" }}>
        <h3 style={{ margin: "0 0 12px 0", fontSize: "15px" }}><Pencil size={16} style={{ marginLeft: '6px' }} /> تحديث البيانات</h3>
        {editing ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <input type="email" placeholder="البريد الإلكتروني" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} />
            <input type="text" placeholder="رقم الهاتف" value={phone} onChange={e => setPhone(e.target.value)} style={inputStyle} />
            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={handleUpdate} style={{ flex: 1, background: primary, color: "#fff", border: "none", padding: "10px", borderRadius: "8px", cursor: "pointer", fontWeight: 600 }}>حفظ</button>
              <button onClick={() => setEditing(false)} style={{ flex: 1, background: "#eee", color: "#333", border: "none", padding: "10px", borderRadius: "8px", cursor: "pointer" }}>إلغاء</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setEditing(true)} style={{ width: "100%", background: "#f0f3f6", border: "1px solid #ddd", padding: "10px", borderRadius: "8px", textAlign: "center", cursor: "pointer", color: "#333", fontSize: "13px" }}>
            تعديل البيانات
          </button>
        )}
      </div>

      {/* تغيير كلمة المرور */}
      <div style={{ ...card, marginBottom: "20px" }}>
        <h3 style={{ margin: "0 0 12px 0", fontSize: "15px" }}><Lock size={16} style={{ marginLeft: '6px' }} /> تغيير كلمة المرور</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ position: "relative" }}>
            <input type={showPwd ? "text" : "password"} placeholder="كلمة المرور الحالية" value={pwdForm.current} onChange={e => setPwdForm({...pwdForm, current: e.target.value})} style={inputStyle} />
          </div>
          <div style={{ position: "relative" }}>
            <input type={showPwd ? "text" : "password"} placeholder="كلمة المرور الجديدة" value={pwdForm.newPwd} onChange={e => setPwdForm({...pwdForm, newPwd: e.target.value})} style={inputStyle} />
          </div>
          <div style={{ position: "relative" }}>
            <input type={showPwd ? "text" : "password"} placeholder="تأكيد كلمة المرور" value={pwdForm.confirm} onChange={e => setPwdForm({...pwdForm, confirm: e.target.value})} style={inputStyle} />
          </div>
          <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#888", cursor: "pointer" }}>
            <input type="checkbox" checked={showPwd} onChange={() => setShowPwd(!showPwd)} /> إظهار كلمة المرور
          </label>
          {pwdMsg && <p style={{ margin: 0, fontSize: "12px", color: "#dc3545" }}>{pwdMsg}</p>}
          <button onClick={handlePwdChange} style={{ width: "100%", background: primary, color: "#fff", border: "none", padding: "10px", borderRadius: "8px", cursor: "pointer", fontWeight: 600 }}>
            تغيير كلمة المرور
          </button>
        </div>
      </div>

      {/* QR Code */}
      <div style={{ ...card, marginBottom: "20px" }}>
        <h3 style={{ margin: "0 0 12px 0", fontSize: "15px" }}><QrCode size={16} style={{ marginLeft: '6px' }} /> QR Code الشخصي</h3>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
          <div onClick={() => setQrExpanded(!qrExpanded)} style={{ cursor: "pointer" }}>
            <QRCodeCanvas value={String(doctorInfo.id)} size={qrExpanded ? 250 : 150} style={{ borderRadius: "8px" }} />
          </div>
          <p style={{ margin: 0, fontSize: "12px", color: "#888" }}>Personal Token: <strong>{doctorInfo.id}</strong></p>
          <p style={{ margin: 0, fontSize: "11px", color: "#aaa" }}>اضغط على QR للتكبير</p>
        </div>
      </div>
    </div>
  );
};

// ================= Submissions Status Page =================
const SubmissionsStatusPage: React.FC = () => {
  const location = useLocation();
  const { type, id, title, maxGrade, creator_id: routeCreatorId } = location.state || {};
  const [submitted, setSubmitted] = useState<any[]>([]);
  const [notSubmitted, setNotSubmitted] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'submitted' | 'not_submitted'>('submitted');
  const [gradeModal, setGradeModal] = useState<any>(null);
  const [gradeValue, setGradeValue] = useState('');
  const [notesValue, setNotesValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [creatorId, setCreatorId] = useState<number | null>(routeCreatorId || null);
  const doctorId = getDoctorId();
  const isOwner = doctorId && creatorId ? doctorId === creatorId : false;

  const fetchData = useCallback(() => {
    if (!id) return;
    setLoading(true);
    fetch(`${API}/assignments/${id}/submissions`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setSubmitted(data.data.submitted || []);
          setNotSubmitted(data.data.not_submitted || []);
          if (data.data.creator_id) setCreatorId(data.data.creator_id);
        }
        setLoading(false);
      })
      .catch(err => { console.error(err); setLoading(false); });
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleGrade = async () => {
    if (!gradeModal || !gradeValue) return;
    setSaving(true);
    try {
      const res = await fetch(`${API}/submissions/${gradeModal.id}/grade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ grade: Number(gradeValue), doctor_notes: notesValue, doctor_id: doctorId }),
      });
      const data = await res.json();
      if (data.success) {
        setGradeModal(null);
        setGradeValue('');
        setNotesValue('');
        fetchData();
      } else alert(data.message || 'فشل التصحيح');
    } catch (err) { alert('فشل التصحيح'); }
    setSaving(false);
  };

  const maxG = maxGrade || 10;
  const containerStyle = { padding: "20px", marginRight: "260px", color: "#000", width: "calc(100% - 260px)", boxSizing: "border-box" as const };

  if (loading) return <div style={containerStyle}>جاري التحميل...</div>;

  return (
    <div style={containerStyle}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ margin: 0 }}><ClipboardCheck size={20} style={{ marginLeft: '8px' }} /> حالة التسليم: {title}</h2>
        <Link to={type === "assignment" ? "/assignments" : "/quizzes"} style={{ color: primary, textDecoration: "none", fontSize: "14px", fontWeight: 600 }}>
          <ArrowRightFromLine size={16} style={{ marginLeft: '6px' }} /> العودة
        </Link>
      </div>

      <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
        <button onClick={() => setActiveTab('submitted')} style={{ background: activeTab === 'submitted' ? primary : "transparent", color: activeTab === 'submitted' ? "#fff" : "#333", border: activeTab === 'submitted' ? "none" : "1px solid #ddd", padding: "8px 20px", borderRadius: "8px", cursor: "pointer", fontWeight: 700, fontSize: "13px" }}>
          <CheckCircle size={16} style={{ marginLeft: '6px' }} /> سلموا ({submitted.length})
        </button>
        <button onClick={() => setActiveTab('not_submitted')} style={{ background: activeTab === 'not_submitted' ? primary : "transparent", color: activeTab === 'not_submitted' ? "#fff" : "#333", border: activeTab === 'not_submitted' ? "none" : "1px solid #ddd", padding: "8px 20px", borderRadius: "8px", cursor: "pointer", fontWeight: 700, fontSize: "13px" }}>
          <XCircle size={16} style={{ marginLeft: '6px' }} /> لم يسلموا ({notSubmitted.length})
        </button>
      </div>

      {/* Grade Modal */}
      {gradeModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.4)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setGradeModal(null)}>
          <div style={{ background: "#fff", borderRadius: "12px", padding: "28px", width: "400px", maxWidth: "90vw" }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: "0 0 6px 0", color: primary }}>تصحيح: {gradeModal.student_name}</h3>
            <p style={{ fontSize: "13px", color: "#888", margin: "0 0 18px 0" }}>{gradeModal.department} | {gradeModal.academic_number}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ fontSize: "12px", color: "#888", display: "block", marginBottom: "4px" }}>الدرجة (من {maxG})</label>
                <input type="number" max={maxG} min={0} value={gradeValue} onChange={e => setGradeValue(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "13px", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ fontSize: "12px", color: "#888", display: "block", marginBottom: "4px" }}>ملاحظات (اختياري)</label>
                <textarea value={notesValue} onChange={e => setNotesValue(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "13px", minHeight: "60px", resize: "vertical", boxSizing: "border-box" }} />
              </div>
            </div>
            <div style={{ display: "flex", gap: "10px", marginTop: "18px" }}>
              <button onClick={handleGrade} disabled={saving} style={{ flex: 1, background: primary, color: "#fff", border: "none", padding: "10px", borderRadius: "8px", cursor: "pointer", fontWeight: 700 }}>
                {saving ? "جاري الحفظ..." : "حفظ الدرجة"}
              </button>
              <button onClick={() => setGradeModal(null)} style={{ flex: 1, background: "#eee", color: "#333", border: "none", padding: "10px", borderRadius: "8px", cursor: "pointer" }}>إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'submitted' && (
        <div>
          {submitted.length === 0 ? (
            <p style={{ color: "#999", textAlign: "center", padding: "40px" }}>لا يوجد طلاب سلموا بعد</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {submitted.map((s: any) => (
                <div key={s.id} style={{ background: "#fff", padding: "16px", borderRadius: "12px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "15px" }}>{s.student_name}</div>
                      <div style={{ display: "flex", gap: "12px", fontSize: "12px", color: "#888", marginTop: "4px" }}>
                        <span>{s.academic_number}</span>
                        <span>{s.department}</span>
                      </div>
                      <div style={{ fontSize: "12px", color: "#888", marginTop: "2px" }}>
                        تاريخ التسليم: {s.submitted_at ? new Date(s.submitted_at).toLocaleString("ar-SA") : "غير معروف"}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      {s.grade !== null && s.grade !== undefined ? (
                        <span style={{ background: "#e8f5e9", color: "#2e7d32", padding: "6px 14px", borderRadius: "8px", fontWeight: 700, fontSize: "14px" }}>
                          {s.grade}/{maxG}
                        </span>
                      ) : (
                        <span style={{ background: "#fff3e0", color: "#e65100", padding: "6px 14px", borderRadius: "8px", fontWeight: 700, fontSize: "13px" }}>
                          لم يصحح بعد
                        </span>
                      )}
                      {s.file_path && (
                        <a href={getFileUrl(s.file_path)} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 4, background: "#f0f3f6", color: "#333", border: "1px solid #ddd", padding: "6px 12px", borderRadius: "8px", cursor: "pointer", fontSize: "12px", fontWeight: 600, textDecoration: "none" }}>
                          <FileText size={14} /> عرض
                        </a>
                      )}
                      {isOwner && (
                        <button onClick={() => { setGradeModal(s); setGradeValue(s.grade?.toString() || ''); setNotesValue(''); }} style={{ background: primary, color: "#fff", border: "none", padding: "6px 14px", borderRadius: "8px", cursor: "pointer", fontSize: "12px", fontWeight: 600 }}>
                          {s.grade !== null && s.grade !== undefined ? <Pencil size={14} style={{ marginLeft: '4px' }} /> : <CheckCircle size={14} style={{ marginLeft: '4px' }} />}
                          {s.grade !== null && s.grade !== undefined ? 'تعديل' : 'تصحيح'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'not_submitted' && (
        <div>
          {notSubmitted.length === 0 ? (
            <p style={{ color: "#999", textAlign: "center", padding: "40px" }}>جميع الطلاب قاموا بالتسليم</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {notSubmitted.map((s: any) => (
                <div key={s.student_id} style={{ background: "#fff", padding: "16px", borderRadius: "12px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "15px" }}>{s.student_name}</div>
                      <div style={{ display: "flex", gap: "12px", fontSize: "12px", color: "#888", marginTop: "4px" }}>
                        <span>{s.academic_number}</span>
                        <span>{s.department}</span>
                      </div>
                    </div>
                    <span style={{ background: "#ffebee", color: "#c62828", padding: "6px 14px", borderRadius: "8px", fontWeight: 700, fontSize: "13px" }}>
                      <XCircle size={14} style={{ marginLeft: '4px' }} /> لم يقم بالتسليم
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ================= Student Submissions Page =================
const StudentSubmissionsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { studentId, offeringId, studentName, doctorId: stateDocId } = location.state || {};
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editData, setEditData] = useState<{ [key: number]: { grade: string; notes: string } }>({});
  const [saving, setSaving] = useState<number | null>(null);
  const doctorId = getDoctorId();

  const loadData = useCallback(async () => {
    if (!studentId || !offeringId) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/student/submissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id: studentId, offering_id: offeringId })
      });
      const data = await res.json();
      if (data.success) setItems(data.data || []);
    } catch {}
    setLoading(false);
  }, [studentId, offeringId]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSave = async (submissionId: number) => {
    const edit = editData[submissionId];
    if (!edit) return;
    setSaving(submissionId);
    try {
      const res = await fetch(`${API}/submissions/grade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submission_id: submissionId, grade: Number(edit.grade), notes: edit.notes, doctor_id: doctorId })
      });
      const data = await res.json();
      if (data.success) {
        setItems(prev => prev.map((i: any) => i.submission_id === submissionId ? { ...i, grade: Number(edit.grade), notes: edit.notes, status: 'graded' } : i));
        alert('تم حفظ التعديلات');
      } else alert(data.message || 'فشل الحفظ');
    } catch { alert('حدث خطأ'); }
    setSaving(null);
  };

  const submitted = items.filter((i: any) => i.submitted);
  const containerStyle = { padding: "20px", marginRight: "260px", color: "#000", width: "calc(100% - 260px)", boxSizing: "border-box" as const };

  return (
    <div style={containerStyle}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ margin: 0 }}>مسلمات: {studentName || ''}</h2>
        <button onClick={() => navigate(-1)} style={{ background: "transparent", border: "none", color: primary, cursor: "pointer", fontWeight: 600, fontSize: "14px" }}>العودة</button>
      </div>
      {loading ? <p style={{ color: "#999" }}>جاري التحميل...</p> : submitted.length === 0 ? (
        <p style={{ color: "#999", fontSize: "14px" }}>لا توجد تسليمات</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {submitted.map((item: any) => {
            const isQuiz = item.type === 'quiz';
            const isGraded = item.status === 'graded';
            const eid = item.submission_id;
            const initEdit = editData[eid] || { grade: item.grade ?? '', notes: item.notes ?? '' };
            if (!editData[eid]) setTimeout(() => setEditData(prev => ({ ...prev, [eid]: initEdit })), 0);
            const edit = editData[eid] || initEdit;
            return (
              <div key={item.assignment_id} style={{ background: "#fff", borderRadius: "12px", padding: "18px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontWeight: 700, fontSize: "15px" }}>{item.title}</span>
                    <span style={{ background: isGraded ? '#d4edda' : '#fff3cd', color: isGraded ? '#155724' : '#856404', padding: "2px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: 700 }}>
                      {isGraded ? 'مصحح' : 'بانتظار التصحيح'}
                    </span>
                  </div>
                  <span style={{ fontSize: "11px", color: "#999" }}>{item.submitted_at || ''}</span>
                </div>
                {item.file_path && (
                  <div style={{ marginBottom: "8px" }}>
                    <a href={`${API}/file/${item.file_path.replace(/\\/g, '/')}`} target="_blank" rel="noreferrer" style={{ color: "#0066cc", fontSize: "13px", textDecoration: "none" }}>
                      <span style={{ textDecoration: "underline" }}>📎 عرض الملف المرفوع</span>
                    </a>
                  </div>
                )}
                {isQuiz && item.notes && (
                  <div style={{ background: "#f5f7fa", padding: "12px", borderRadius: "8px", fontSize: "13px", marginBottom: "10px" }}>
                    <div style={{ fontWeight: 600, fontSize: "11px", color: "#888", marginBottom: "4px" }}>إجابات الطالب:</div>
                    <div style={{ color: "#333", whiteSpace: "pre-wrap" }}>{item.notes}</div>
                  </div>
                )}
                {item.creator_id === doctorId ? (
                <div style={{ display: "flex", gap: "10px", alignItems: "flex-end", marginTop: "8px" }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: "block", fontSize: "11px", color: "#555", marginBottom: "2px" }}>الدرجة (من {item.max_grade})</label>
                    <input type="number" value={edit.grade} onChange={e => setEditData(prev => ({ ...prev, [eid]: { ...prev[eid] || initEdit, grade: e.target.value } }))}
                      style={{ width: "100%", padding: "6px 8px", borderRadius: "6px", border: "1px solid #ddd", color: "#000", fontSize: "13px", boxSizing: "border-box" }} />
                  </div>
                  <div style={{ flex: 2 }}>
                    <label style={{ display: "block", fontSize: "11px", color: "#555", marginBottom: "2px" }}>ملاحظات</label>
                    <input type="text" value={edit.notes} onChange={e => setEditData(prev => ({ ...prev, [eid]: { ...prev[eid] || initEdit, notes: e.target.value } }))}
                      style={{ width: "100%", padding: "6px 8px", borderRadius: "6px", border: "1px solid #ddd", color: "#000", fontSize: "13px", boxSizing: "border-box" }} />
                  </div>
                  <button onClick={() => handleSave(eid)} disabled={saving === eid}
                    style={{ background: saving === eid ? "#ccc" : "#28a745", color: "#fff", border: "none", padding: "6px 16px", borderRadius: "6px", cursor: "pointer", fontWeight: 600, fontSize: "12px" }}>
                    {saving === eid ? '...' : 'حفظ'}
                  </button>
                </div>
                ) : (
                  <p style={{ fontSize: "12px", color: "#999", marginTop: "8px" }}>ليس لديك صلاحية تصحيح هذا النشاط لأنه تم إنشاؤه بواسطة دكتور آخر</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ================= Reports Page =================
const ReportsPage: React.FC = () => {
  const [reportType, setReportType] = useState<string | null>(null);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<number | null>(null);
  const [selectedDept, setSelectedDept] = useState<number | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<string>('الكل');
  const [selectedStudyType, setSelectedStudyType] = useState<string>('');
  const [offerings, setOfferings] = useState<any[]>([]);
  const [selectedOffering, setSelectedOffering] = useState<number | null>(null);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [reportData, setReportData] = useState<any[] | null>(null);
  const [reportStats, setReportStats] = useState<any>(null);
  const [generating, setGenerating] = useState(false);
  const [depts, setDepts] = useState<{id: number, name: string}[]>([]);
  const [levels, setLevels] = useState<string[]>([]);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [exportingCsv, setExportingCsv] = useState(false);
  const [subReportType, setSubReportType] = useState<'assignment' | 'quiz'>('assignment');

  const containerStyle = { padding: "20px", marginRight: "260px", color: "#000", width: "calc(100% - 260px)", boxSizing: "border-box" as const };
  const inputStyle = { width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "13px", color: "#000", boxSizing: "border-box" as const, background: "#fff" };

  useEffect(() => {
    const docId = getDoctorId();
    if (!docId) return;
    fetch(`${API}/doctor/active-subjects/${docId}`)
      .then(r => r.json())
      .then(data => { if (data.success) setSubjects(data.data || []); })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!selectedSubject) { setOfferings([]); return; }
    fetch(`${API}/subject-offerings/${selectedSubject}`)
      .then(r => r.json())
      .then(data => { if (data.success) setOfferings(data.data || []); })
      .catch(console.error);
  }, [selectedSubject]);

  useEffect(() => {
    if (!selectedSubject || !offerings.length) { setDepts([]); setLevels([]); return; }
    const uniqueDepts: {id: number, name: string}[] = [];
    const seen = new Set<number>();
    offerings.forEach((o: any) => {
      if (o.department_id && !seen.has(o.department_id)) {
        seen.add(o.department_id);
        uniqueDepts.push({id: o.department_id, name: o.department_name});
      }
    });
    setDepts(uniqueDepts);
    const uniqueLevels = [...new Set(offerings.map((o: any) => String(o.level)).filter(Boolean))];
    setLevels(uniqueLevels);
  }, [selectedSubject, offerings]);

  const reportTypes = [
    { key: 'grades', label: 'تقرير الدرجات', icon: <Award size={32} />, desc: 'درجات الطلاب مع الإحصائيات' },
    { key: 'attendance', label: 'تقرير الحضور', icon: <ClipboardCheck size={32} />, desc: 'نسب الحضور والغياب' },
    { key: 'submissions', label: 'تقرير التسليمات', icon: <Upload size={32} />, desc: 'حالة تسليم التكاليف والكويزات' },
  ];

  const handleGenerate = async () => {
    if (!selectedSubject) { alert('الرجاء اختيار المادة'); return; }
    setGenerating(true);
    setReportData(null);
    setReportStats(null);
    try {
      const body: any = { };
      if (reportType === 'grades') {
        body.subject_id = selectedSubject;
      } else {
        if (!selectedOffering) { alert('الرجاء اختيار الشعبة'); setGenerating(false); return; }
        body.offering_id = selectedOffering;
      }
      if (selectedDept) body.department_id = selectedDept;
      if (selectedLevel && selectedLevel !== 'الكل') body.level = selectedLevel;
      if (selectedStudyType) body.study_type = selectedStudyType;
      if (dateFrom) body.date_from = dateFrom;
      if (dateTo) body.date_to = dateTo;
      if (reportType === 'submissions') body.type = subReportType;

      const res = await fetch(`${API}/reports/${reportType}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
      });
      const result = await res.json();
      if (result.success) { setReportData(result.data || []); setReportStats(result.stats || null); }
      else alert(result.message || 'فشل إنشاء التقرير');
    } catch { alert('حدث خطأ أثناء إنشاء التقرير'); }
    setGenerating(false);
  };

  const exportPDF = () => {
    if (!reportData || reportData.length === 0) return;
    setExportingPdf(true);
    setTimeout(() => {
      try {
        const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
        const docTitle = `تقرير ${reportTypes.find(r => r.key === reportType)?.label || ''}`;
        doc.setFontSize(18);
        doc.text(docTitle, doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });
        doc.setFontSize(10);
        doc.text(`تاريخ التقرير: ${new Date().toLocaleDateString('ar-SA')}`, 10, 30);
        if (reportStats) {
          doc.text(`إجمالي الطلاب: ${reportStats.total} | ناجح: ${reportStats.passed} | راسب: ${reportStats.failed} | المتوسط: ${reportStats.avg}`, 10, 38);
        }

        const columns = Object.keys(reportData[0]).map(k => {
          const names: Record<string, string> = {
            name: 'الاسم', academic_number: 'الرقم الجامعي', department_name: 'التخصص',
            department: 'التخصص', level: 'المستوى', student_name: 'اسم الطالب',
            study_type: 'نوع الدراسة',
            attended_sessions: 'حضر', total_sessions: 'جلسات',
            attendance_grade: 'درجة الحضور', attendance_weight: 'وزن الحضور',
            submitted_assignments: 'سلم تكاليف', total_assignments: 'إجمالي التكاليف',
            assignments_grade: 'درجة التكاليف', assignments_weight: 'وزن التكاليف',
            submitted_quizzes: 'سلم كويزات', total_quizzes: 'إجمالي الكويزات',
            quizzes_grade: 'درجة الكويزات', quizzes_weight: 'وزن الكويزات',
            midterm_grade: 'النصفي', midterm_weight: 'وزن النصفي',
            final_exam_grade: 'النهائي', final_weight: 'وزن النهائي',
            total_grade: 'المجموع', passed: 'النتيجة',
            attended: 'حضر', total: 'الإجمالي', percentage: 'النسبة%',
            assignment_title: 'العنوان', submitted: 'سلم', submitted_at: 'تاريخ التسليم',
            grade: 'الدرجة', max_grade: 'الدرجة القصوى', status: 'الحالة',
          };
          return { header: names[k] || k, dataKey: k };
        });

          autoTable(doc, {
            columns,
            body: reportData,
            startY: reportStats ? 45 : 35,
            styles: { fontSize: 8, font: 'helvetica', cellPadding: 2 },
            headStyles: { fillColor: [29, 76, 79], textColor: 255, fontSize: 8 },
            alternateRowStyles: { fillColor: [245, 247, 250] },
            tableWidth: 'auto',
          });

        doc.save(`تقرير_${reportType}_${Date.now()}.pdf`);
      } catch (e) { console.error(e); alert('فشل تصدير PDF'); }
      setExportingPdf(false);
    }, 100);
  };

  const exportCSV = () => {
    if (!reportData || reportData.length === 0) return;
    setExportingCsv(true);
    try {
      const names: Record<string, string> = {
        name: 'الاسم', academic_number: 'الرقم الجامعي', department_name: 'التخصص',
        department: 'التخصص', level: 'المستوى', student_name: 'اسم الطالب',
        attendance_grade: 'الحضور', assignments_grade: 'التكاليف', quizzes_grade: 'الكويزات',
        midterm_grade: 'النصفي', final_exam_grade: 'النهائي', total_grade: 'المجموع',
        attended: 'حضر', total: 'الإجمالي', percentage: 'النسبة',
        assignment_title: 'العنوان', submitted: 'سلم', submitted_at: 'تاريخ التسليم',
        grade: 'الدرجة', max_grade: 'الدرجة القصوى', status: 'الحالة',
      };
      const headers = Object.keys(reportData[0]).map(k => names[k] || k);
      const rows = reportData.map((row: any) => Object.keys(row).map(k => row[k] ?? ''));
      const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `تقرير_${reportType}_${Date.now()}.csv`;
      link.click();
    } catch (e) { console.error(e); alert('فشل التصدير'); }
    setExportingCsv(false);
  };

  const resetReport = () => {
    setReportType(null);
    setReportData(null);
    setReportStats(null);
    setSelectedSubject(null);
    setSelectedOffering(null);
    setDateFrom('');
    setDateTo('');
    setSelectedDept(null);
    setSelectedLevel('الكل');
    setSelectedStudyType('');
  };

  if (!reportType) {
    return (
      <div style={containerStyle}>
        <div style={{ marginBottom: "24px" }}>
          <h2 style={{ margin: "0 0 6px 0", fontSize: "22px", color: "#333", display: "flex", alignItems: "center", gap: "10px" }}>
            <BarChart3 size={24} color={primary} /> التقارير
          </h2>
          <p style={{ margin: 0, fontSize: "13px", color: "#888" }}>اختر نوع التقرير الذي تريد إنشاءه</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "16px" }}>
          {reportTypes.map(rt => (
            <div key={rt.key} onClick={() => setReportType(rt.key)} style={{ background: "#fff", borderRadius: "16px", padding: "28px 20px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", cursor: "pointer", textAlign: "center", transition: "all 0.2s", border: "2px solid transparent" }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = primary)} onMouseLeave={e => (e.currentTarget.style.borderColor = "transparent")}>
              <div style={{ width: "60px", height: "60px", borderRadius: "14px", background: "rgba(29,76,79,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", color: primary }}>
                {rt.icon}
              </div>
              <h3 style={{ margin: "0 0 6px", fontSize: "16px", color: "#333" }}>{rt.label}</h3>
              <p style={{ margin: 0, fontSize: "12px", color: "#888" }}>{rt.desc}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button onClick={resetReport} style={{ background: "transparent", border: "1px solid #ddd", borderRadius: "8px", padding: "8px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#555" }}>
            <ArrowRightFromLine size={16} /> رجوع
          </button>
          <h2 style={{ margin: 0, fontSize: "18px", color: "#333" }}>{reportTypes.find(r => r.key === reportType)?.label}</h2>
        </div>
      </div>

      {/* Filters */}
      <div style={{ background: "#fff", borderRadius: "14px", padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", marginBottom: "20px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "14px" }}>
          <div>
            <label style={{ display: "block", fontSize: "12px", color: "#888", marginBottom: "4px" }}>المادة</label>
            <select value={selectedSubject ?? ''} onChange={e => { setSelectedSubject(Number(e.target.value) || null); setSelectedOffering(null); setSelectedDept(null); }} style={inputStyle}>
              <option value="">اختر المادة</option>
              {subjects.map((s: any) => <option key={s.subject_id} value={s.subject_id}>{s.subject_name}</option>)}
            </select>
          </div>
          {reportType !== 'grades' && (
            <div>
              <label style={{ display: "block", fontSize: "12px", color: "#888", marginBottom: "4px" }}>الشعبة</label>
              <select value={selectedOffering ?? ''} onChange={e => setSelectedOffering(Number(e.target.value) || null)} style={inputStyle}>
                <option value="">اختر الشعبة</option>
                {offerings.map((o: any) => <option key={o.id} value={o.id}>{o.department_name} - مستوى {o.level}{o.enrolled_count ? ` (${o.enrolled_count} طالب)` : ''}</option>)}
              </select>
            </div>
          )}
          <div>
            <label style={{ display: "block", fontSize: "12px", color: "#888", marginBottom: "4px" }}>التخصص</label>
            <select value={selectedDept ?? ''} onChange={e => setSelectedDept(Number(e.target.value) || null)} style={inputStyle}>
              <option value="">الكل</option>
              {depts.map((d: {id: number, name: string}) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: "block", fontSize: "12px", color: "#888", marginBottom: "4px" }}>المستوى</label>
            <select value={selectedLevel} onChange={e => setSelectedLevel(e.target.value)} style={inputStyle}>
              <option value="الكل">الكل</option>
              {levels.map((l: string) => <option key={l} value={l}>مستوى {l}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: "block", fontSize: "12px", color: "#888", marginBottom: "4px" }}>نوع الدراسة</label>
            <select value={selectedStudyType} onChange={e => setSelectedStudyType(e.target.value)} style={inputStyle}>
              <option value="">الكل</option>
              <option value="انتظام">انتظام</option>
              <option value="انتساب">انتساب</option>
            </select>
          </div>
          {reportType === 'submissions' && (
            <div>
              <label style={{ display: "block", fontSize: "12px", color: "#888", marginBottom: "4px" }}>النوع</label>
              <select value={subReportType} onChange={e => setSubReportType(e.target.value as any)} style={inputStyle}>
                <option value="assignment">التكاليف</option>
                <option value="quiz">الكويزات</option>
              </select>
            </div>
          )}
          <div>
            <label style={{ display: "block", fontSize: "12px", color: "#888", marginBottom: "4px" }}>من تاريخ</label>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "12px", color: "#888", marginBottom: "4px" }}>إلى تاريخ</label>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={inputStyle} />
          </div>
        </div>
        <button onClick={handleGenerate} disabled={generating} style={{ marginTop: "16px", background: primary, color: "#fff", border: "none", padding: "12px 32px", borderRadius: "10px", cursor: "pointer", fontWeight: 700, fontSize: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
          {generating ? <><Clock size={16} /> جاري إنشاء التقرير...</> : <><BarChart3 size={16} /> إنشاء التقرير</>}
        </button>
      </div>

      {/* Report Results */}
      {reportData && (
        <div style={{ background: "#fff", borderRadius: "14px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", overflow: "hidden" }}>
          {/* Stats bar */}
          {reportStats && (
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #eee", display: "flex", gap: "20px", flexWrap: "wrap" }}>
              <div style={{ textAlign: "center", padding: "8px 16px", background: "#f8fafb", borderRadius: "8px" }}><span style={{ display: "block", fontSize: "11px", color: "#888" }}>إجمالي الطلاب</span><strong style={{ fontSize: "18px", color: primary }}>{reportStats.total}</strong></div>
              <div style={{ textAlign: "center", padding: "8px 16px", background: "#e8f5e9", borderRadius: "8px" }}><span style={{ display: "block", fontSize: "11px", color: "#888" }}>ناجح</span><strong style={{ fontSize: "18px", color: "#28a745" }}>{reportStats.passed}</strong></div>
              <div style={{ textAlign: "center", padding: "8px 16px", background: "#ffebee", borderRadius: "8px" }}><span style={{ display: "block", fontSize: "11px", color: "#888" }}>راسب</span><strong style={{ fontSize: "18px", color: "#dc3545" }}>{reportStats.failed}</strong></div>
              <div style={{ textAlign: "center", padding: "8px 16px", background: "#f8fafb", borderRadius: "8px" }}><span style={{ display: "block", fontSize: "11px", color: "#888" }}>المتوسط</span><strong style={{ fontSize: "18px", color: primary }}>{reportStats.avg}</strong></div>
            </div>
          )}

          {/* Export buttons */}
          <div style={{ padding: "12px 20px", borderBottom: "1px solid #eee", display: "flex", gap: "10px" }}>
            <button onClick={exportPDF} disabled={exportingPdf} style={{ background: "#dc3545", color: "#fff", border: "none", padding: "8px 20px", borderRadius: "8px", cursor: "pointer", fontWeight: 600, fontSize: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
              <FileText size={14} /> {exportingPdf ? 'جاري...' : 'PDF تصدير'}
            </button>
            <button onClick={exportCSV} disabled={exportingCsv} style={{ background: "#28a745", color: "#fff", border: "none", padding: "8px 20px", borderRadius: "8px", cursor: "pointer", fontWeight: 600, fontSize: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
              <Download size={14} /> {exportingCsv ? 'جاري...' : 'Excel تصدير'}
            </button>
            <span style={{ fontSize: "12px", color: "#888", alignSelf: "center" }}>{reportData.length} سجل</span>
          </div>

          {/* Table */}
          <div style={{ padding: "16px 20px", overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
              <thead>
                <tr style={{ background: primary, color: "#fff" }}>
                  {Object.keys(reportData[0]).map(k => {
                    const names: Record<string, string> = {
                      name: 'الاسم', academic_number: 'الرقم الجامعي', department_name: 'التخصص',
                      department: 'التخصص', level: 'المستوى', student_name: 'اسم الطالب',
                      study_type: 'نوع الدراسة',
                      attended_sessions: 'حضر', total_sessions: 'جلسات',
                      attendance_grade: 'درجة الحضور', attendance_weight: 'وزن الحضور',
                      submitted_assignments: 'سلم تكاليف', total_assignments: 'إجمالي التكاليف',
                      assignments_grade: 'درجة التكاليف', assignments_weight: 'وزن التكاليف',
                      submitted_quizzes: 'سلم كويزات', total_quizzes: 'إجمالي الكويزات',
                      quizzes_grade: 'درجة الكويزات', quizzes_weight: 'وزن الكويزات',
                      midterm_grade: 'النصفي', midterm_weight: 'وزن النصفي',
                      final_exam_grade: 'النهائي', final_weight: 'وزن النهائي',
                      total_grade: 'المجموع', passed: 'النتيجة',
                      attended: 'حضر', total: 'الإجمالي', percentage: 'النسبة%',
                      assignment_title: 'العنوان', submitted: 'سلم', submitted_at: 'تاريخ التسليم',
                      grade: 'الدرجة', max_grade: 'القصوى', status: 'الحالة',
                    };
                    return <th key={k} style={{ padding: "10px 12px", textAlign: "right", fontWeight: 600, fontSize: "11px" }}>{names[k] || k}</th>;
                  })}
                </tr>
              </thead>
              <tbody>
                {reportData.map((row: any, i: number) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#f8fafb", borderBottom: "1px solid #f0f0f0" }}>
                    {Object.keys(reportData[0]).map(k => {
                      let val = row[k] ?? '-';
                      if (k === 'total_grade' || k === 'grade') {
                        const num = Number(val);
                        return <td key={k} style={{ padding: "10px 12px", fontWeight: num >= 60 ? 700 : 600, color: num >= 60 ? '#28a745' : '#dc3545' }}>{isNaN(num) ? val : num}</td>;
                      }
                      if (k === 'submitted') {
                        return <td key={k} style={{ padding: "10px 12px", color: val === 'نعم' ? '#28a745' : '#dc3545', fontWeight: 600 }}>{val}</td>;
                      }
                      if (k === 'passed') {
                        return <td key={k} style={{ padding: "10px 12px", color: val ? '#28a745' : '#dc3545', fontWeight: 700 }}>{val ? 'ناجح' : 'راسب'}</td>;
                      }
                      return <td key={k} style={{ padding: "10px 12px", color: "#333" }}>{val}</td>;
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

// ================= App Component =================
const App: React.FC<{ onLogout?: () => void }> = ({ onLogout: parentOnLogout }) => {
  const [doctorInfo, setDoctorInfo] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    const doctorId = getDoctorId();
    if (!doctorId) {
      setLoading(false);
      return;
    }

    fetch(`${API}/users/${doctorId}`)
      .then(res => res.json())
      .then(data => {
        setDoctorInfo(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching doctor info:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>جاري التحميل...</div>;
  }

  if (!doctorInfo) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <div style={{ textAlign: 'center' }}>
        <h2>يرجى تسجيل الدخول</h2>
        <button onClick={() => window.location.href = '/'} style={{ background: primary, color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 8, cursor: 'pointer' }}>تسجيل الدخول</button>
      </div>
    </div>;
  }

  return (
    <Router>
      <div style={{ direction: "rtl", fontFamily: "'Cairo', sans-serif", minHeight: "100vh", background: "#f7f9fb" }}>
        <DoctorSidebar doctorInfo={doctorInfo} onLogout={() => setShowLogoutConfirm(true)} />
        <TopBar doctorInfo={doctorInfo} />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/subjects" element={<SubjectsPage />} />
          <Route path="/attendance" element={<AttendancePage />} />
          <Route path="/quizzes" element={<QuizzesPage />} />
          <Route path="/assignments" element={<AssignmentsPage />} />
          <Route path="/grades" element={<GradesPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/course-management/:id" element={<CourseManagementPage />} />
          <Route path="/review-submissions" element={<ReviewSubmissionsPage />} />
          <Route path="/submissions-status" element={<SubmissionsStatusPage />} />
          <Route path="/student-submissions" element={<StudentSubmissionsPage />} />
        </Routes>
      </div>
      <LogoutConfirmDialog isOpen={showLogoutConfirm} onClose={() => setShowLogoutConfirm(false)} onLogout={parentOnLogout || (() => window.location.href = '/')} />
    </Router>
  );
};

export default App;