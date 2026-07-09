import React, { useState, useEffect, useCallback } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { QRCodeCanvas } from 'qrcode.react';
import {
  LayoutDashboard, Building2, Users, Shield, Calendar, Settings,
  BarChart3, FileText, UserCircle, LogOut, Bell, Search,
  Download, Save, Lock, Pencil, PlusCircle, Trash2, Eye, X,
  CheckCircle, ClipboardList, BookOpen, Award,
  GraduationCap, Layers, QrCode,
} from "lucide-react";
import axios from "axios";
import SystemLogo from "./components/SystemLogo";
import LogoutConfirmDialog from "./components/LogoutConfirmDialog";

const LARAVEL_API = "https://academic-system-backend.onrender.com/api";
const primary = "#1D4C4F";
// cardWhite removed (unused)
const textDark = "#2C3E3F";
const textGray = "#6B7B6E";
// accent removed (unused)
const bgLight = "#f7f9fb";

// ========== Shared Design System ==========
const cardStyle = { background: "#fff", padding: "20px", borderRadius: "12px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" };
const formCardStyle = { background: "#fff", padding: "20px", borderRadius: "12px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", marginBottom: "20px" };
const inputStyle = { width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #ddd", color: "#000", fontSize: "13px", boxSizing: "border-box" as const };
const pageTitleStyle = { marginBottom: "25px", color: primary, fontSize: "24px", fontWeight: 700 };
const sectionTitleStyle = { margin: "0 0 15px", color: primary, fontSize: "16px", fontWeight: 700 };
const btnPrimary = { background: primary, color: "#fff", border: "none", padding: "10px 20px", borderRadius: "8px", cursor: "pointer", fontSize: "14px", fontWeight: 600 };
const btnOutline = { background: "rgba(29, 76, 79, 0.08)", color: primary, border: "1px solid " + primary, padding: "10px 20px", borderRadius: "8px", cursor: "pointer", fontSize: "14px", fontWeight: 600 };
const btnOutlineSmall = { background: "transparent", color: primary, border: "1px solid #ddd", padding: "6px 14px", borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: 500 };
const btnDangerSmall = { background: "transparent", color: "#dc3545", border: "1px solid #dc3545", padding: "6px 14px", borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: 500 };
const pageContainer = { padding: "20px", width: "100%", boxSizing: "border-box" as const };
const headerRow = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap" as const, gap: "12px" };
const flexRow = { display: "flex", gap: "10px" };
const itemCard = { background: "#fff", padding: "16px 20px", borderRadius: "12px", display: "flex" as const, justifyContent: "space-between" as const, alignItems: "center" as const, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" };

// ================= Sidebar لمدير النظام =================
const systemMenuIcons: Record<string, React.ReactNode> = {
  "/": <LayoutDashboard size={20} />,
  "/colleges": <Building2 size={20} />,
  "/users": <Users size={20} />,
  "/roles": <Shield size={20} />,
  "/semesters": <Calendar size={20} />,
  "/settings": <Settings size={20} />,
  "/announcements": <Bell size={20} />,
  "/reports": <BarChart3 size={20} />,
  "/audit-log": <FileText size={20} />,
  "/profile": <UserCircle size={20} />,
};

const SystemAdminSidebar: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const location = useLocation();
  const menu = [
    { name: "الرئيسية", path: "/" },
    { name: "الكليات", path: "/colleges" },
    { name: "المستخدمين", path: "/users" },
    { name: "الأدوار", path: "/roles" },
    { name: "الأترام", path: "/semesters" },
    { name: "إعدادات النظام", path: "/settings" },
    { name: "الإعلانات", path: "/announcements" },
    { name: "التقارير", path: "/reports" },
    { name: "سجل العمليات", path: "/audit-log" },
    { name: "الملف الشخصي", path: "/profile" },
  ];

  return (
    <div style={{ 
      width: "260px", 
      background: primary,
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
        <h3 style={{ margin: 0, fontSize: "15px" }}>مدير النظام</h3>
        <p style={{ fontSize: "12px", opacity: 0.7 }}>صلاحية كاملة</p>
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
                <span style={{ display: "flex", color: "#fff" }}>{systemMenuIcons[item.path]}</span>
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

// ================= TopBar =================
const TopBar: React.FC = () => {
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
      <div style={{ position: "relative", cursor: "pointer" }}>
        <Bell size={22} color={primary} />
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <span style={{ fontSize: "14px", fontWeight: 600, color: primary }}>مدير النظام</span>
        <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: primary, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "18px" }}>
          م
        </div>
      </div>
    </div>
  );
};

// ================= Dashboard =================
const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>({});
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sRes, aRes] = await Promise.all([
          fetch(`${LARAVEL_API}/admin/stats`),
          fetch(`${LARAVEL_API}/admin/audit-logs`),
        ]);
        const sData = await sRes.json();
        if (sData.success) setStats(sData.data);
        const aData = await aRes.json();
        if (aData.success) setActivities(aData.data.slice(0, 8));
      } catch {} finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const statCards = [
    { key: "users", label: "إجمالي المستخدمين", icon: <Users size={22} />, path: "/users" },
    { key: "students", label: "الطلاب", icon: <GraduationCap size={22} />, path: "/users?role=student" },
    { key: "doctors", label: "الدكاترة", icon: <Award size={22} />, path: "/users?role=doctor" },
    { key: "managers", label: "مدراء الكليات", icon: <Shield size={22} />, path: "/users?role=college_manager" },
    { key: "colleges", label: "الكليات", icon: <Building2 size={22} />, path: "/colleges" },
    { key: "departments", label: "الأقسام", icon: <Layers size={22} />, path: "" },
    { key: "subjects", label: "المواد", icon: <BookOpen size={22} />, path: "" },
    { key: "course_offerings", label: "المقررات", icon: <ClipboardList size={22} />, path: "" },
    { key: "terms", label: "الأترام", icon: <Calendar size={22} />, path: "/semesters" },
    { key: "assignments", label: "التكاليف", icon: <FileText size={22} />, path: "" },
    { key: "quizzes", label: "الكويزات", icon: <CheckCircle size={22} />, path: "" },
    { key: "attendance_sessions", label: "جلسات الحضور", icon: <BarChart3 size={22} />, path: "" },
    { key: "materials", label: "ملفات المقررات", icon: <Save size={22} />, path: "" },
    { key: "pending_requests", label: "الطلبات المعلقة", icon: <Bell size={22} />, path: "" },
  ];

  if (loading) return <div style={pageContainer}><p style={{ textAlign: "center", color: "#888" }}>جاري التحميل...</p></div>;

  return (
    <div style={pageContainer}>
      <h2 style={pageTitleStyle}>لوحة التحكم</h2>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(155px, 1fr))", gap: "16px", marginBottom: "30px" }}>
        {statCards.map((card) => (
          <div key={card.key} onClick={() => card.path && navigate(card.path)} style={{ background: "#fff", padding: "18px", borderRadius: "12px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", textAlign: "center", cursor: card.path ? "pointer" : "default" }}>
            <div style={{ width: "44px", height: "44px", borderRadius: "10px", background: "rgba(29, 76, 79, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px" }}>
              <span style={{ color: "#1D4C4F", display: "flex" }}>{card.icon}</span>
            </div>
            <h3 style={{ margin: 0, fontSize: "22px", fontWeight: 700, color: "#1D4C4F" }}>{stats[card.key] ?? 0}</h3>
            <p style={{ margin: "3px 0 0", fontSize: "12px", color: "#6C757D" }}>{card.label}</p>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        <div style={cardStyle}>
          <h3 style={sectionTitleStyle}><ClipboardList size={16} style={{ marginLeft: 6 }} /> آخر النشاطات</h3>
          {activities.slice(0, 6).map((act: any) => (
            <div key={act.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #f0f0f0" }}>
              <div>
                <p style={{ margin: 0, fontWeight: 600, color: "#333", fontSize: "13px" }}>{act.action}</p>
                <p style={{ margin: "2px 0 0 0", fontSize: "12px", color: "#888" }}>{act.user_name} • {act.created_at}</p>
              </div>
            </div>
          ))}
          {activities.length === 0 && <p style={{ color: "#888", fontSize: "13px" }}>لا توجد نشاطات حديثة</p>}
        </div>
        <div style={cardStyle}>
          <h3 style={sectionTitleStyle}><Settings size={16} style={{ marginLeft: 6 }} /> إعدادات سريعة</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <button onClick={() => navigate("/settings")} style={{ ...btnOutline, justifyContent: "flex-start", display: "flex", alignItems: "center", gap: "8px" }}><Settings size={16} /> إعدادات النظام</button>
            <button onClick={() => navigate("/reports")} style={{ ...btnOutline, justifyContent: "flex-start", display: "flex", alignItems: "center", gap: "8px" }}><BarChart3 size={16} /> التقارير</button>
            <button onClick={() => navigate("/audit-log")} style={{ ...btnOutline, justifyContent: "flex-start", display: "flex", alignItems: "center", gap: "8px" }}><FileText size={16} /> سجل العمليات</button>
            <button onClick={() => navigate("/profile")} style={{ ...btnOutline, justifyContent: "flex-start", display: "flex", alignItems: "center", gap: "8px" }}><UserCircle size={16} /> الملف الشخصي</button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ================= إدارة الكليات =================
const CollegesPage: React.FC = () => {
  const [colleges, setColleges] = useState<any[]>([]);
  const [managers, setManagers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingCollege, setEditingCollege] = useState<any>(null);
  const [form, setForm] = useState({ name: "", manager_id: "" });
  const [saving, setSaving] = useState(false);
  const [viewDepts, setViewDepts] = useState<any[] | null>(null);
  const [viewCollegeName, setViewCollegeName] = useState("");

  const fetchColleges = useCallback(async () => {
    try {
      const res = await fetch(`${LARAVEL_API}/admin/colleges`);
      const data = await res.json();
      if (data.success) setColleges(data.data);
    } catch { setError("خطأ في تحميل الكليات"); }
    finally { setLoading(false); }
  }, []);

  const fetchManagers = async () => {
    try {
      const res = await fetch(`${LARAVEL_API}/admin/college-managers`);
      const data = await res.json();
      if (data.success) setManagers(data.data);
    } catch {}
  };

  useEffect(() => { fetchColleges(); fetchManagers(); }, [fetchColleges]);

  const openAdd = () => {
    setEditingCollege(null);
    setForm({ name: "", manager_id: "" });
    setShowModal(true);
  };

  const openEdit = (college: any) => {
    setEditingCollege(college);
    setForm({ name: college.name, manager_id: college.manager_id ?? "" });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name) { alert("يرجى إدخال اسم الكلية"); return; }
    setSaving(true);
    setError("");
    try {
      const body: any = { name: form.name };
      if (form.manager_id) body.manager_id = parseInt(form.manager_id);

      let res;
      if (editingCollege) {
        res = await fetch(`${LARAVEL_API}/admin/colleges/${editingCollege.id}`, {
          method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
        });
      } else {
        res = await fetch(`${LARAVEL_API}/admin/colleges`, {
          method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
        });
      }
      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        fetchColleges();
        fetchManagers();
        alert(editingCollege ? "تم تعديل الكلية بنجاح" : "تم إنشاء الكلية بنجاح");
      } else {
        setError(data.message || "فشل العملية");
      }
    } catch { setError("خطأ في الاتصال بالسيرفر"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`هل أنت متأكد من حذف ${name}؟`)) return;
    try {
      const res = await fetch(`${LARAVEL_API}/admin/colleges/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) { fetchColleges(); alert("تم حذف الكلية بنجاح"); }
      else { alert(data.message || "فشل الحذف"); }
    } catch { alert("خطأ في الاتصال بالسيرفر"); }
  };

  const toggleStatus = async (id: number, name: string, current: boolean) => {
    const action = current ? "تعطيل" : "تفعيل";
    if (!window.confirm(`هل أنت متأكد من ${action} ${name}؟`)) return;
    try {
      const res = await fetch(`${LARAVEL_API}/admin/colleges/${id}/toggle-status`, { method: "PUT" });
      const data = await res.json();
      if (data.success) { fetchColleges(); alert(data.message); }
    } catch { alert("خطأ في الاتصال بالسيرفر"); }
  };

  const viewDepartments = async (collegeId: number, collegeName: string) => {
    setViewCollegeName(collegeName);
    setViewDepts(null);
    try {
      const res = await fetch(`${LARAVEL_API}/admin/departments/${collegeId}`);
      const data = await res.json();
      setViewDepts(data.success ? data.data : []);
    } catch { setViewDepts([]); }
  };

  const exportToCSV = () => {
    const headers = ["الاسم", "مدير الكلية", "عدد الطلاب", "الحالة"];
    const rows = colleges.map((c: any) => [c.name, c.manager_name, c.students_count, c.is_active ? "نشط" : "غير نشط"]);
    const csvContent = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob); link.href = url;
    link.setAttribute("download", "colleges.csv");
    document.body.appendChild(link); link.click();
    document.body.removeChild(link); URL.revokeObjectURL(url);
    alert("تم تصدير الكليات بنجاح");
  };

  if (loading) return <div style={pageContainer}><p style={{ textAlign: "center", color: "#888" }}>جاري التحميل...</p></div>;

  return (
    <div style={pageContainer}>
      <div style={headerRow}>
        <h2 style={{ color: primary, margin: 0, fontSize: "24px", fontWeight: 700 }}><Building2 size={24} style={{ marginLeft: 8 }} /> إدارة الكليات</h2>
        <div style={flexRow}>
          <button onClick={openAdd} style={btnPrimary}><PlusCircle size={16} style={{ marginLeft: 6 }} /> إضافة كلية</button>
          <button onClick={exportToCSV} style={btnOutline}><Download size={16} style={{ marginLeft: 6 }} /> تصدير CSV</button>
        </div>
      </div>

      {error && <div style={{ background: "#f8d7da", color: "#721c24", padding: "10px", borderRadius: "8px", marginBottom: "15px", fontSize: "13px" }}>{error}</div>}

      <div style={{ display: "grid", gap: "12px" }}>
        {colleges.map((college: any) => (
          <div key={college.id} style={{ ...itemCard, opacity: college.is_active ? 1 : 0.5 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <h3 style={{ margin: 0, color: "#333", fontSize: "15px" }}>{college.name}</h3>
                <span style={{ background: college.is_active ? "#e8f5e9" : "#ffebee", color: college.is_active ? "#4caf50" : "#f44336", padding: "2px 10px", borderRadius: "12px", fontSize: "11px" }}>
                  {college.is_active ? "نشط" : "غير نشط"}
                </span>
              </div>
              <p style={{ margin: "4px 0 0 0", color: "#888", fontSize: "13px" }}>المدير: {college.manager_name}</p>
              <p style={{ margin: "2px 0 0 0", color: "#888", fontSize: "12px" }}>عدد الطلاب: {college.students_count}</p>
            </div>
            <div style={flexRow}>
              <button onClick={() => viewDepartments(college.id, college.name)} style={btnOutlineSmall}><Eye size={14} style={{ marginLeft: 4 }} /> الأقسام</button>
              <button onClick={() => openEdit(college)} style={btnOutlineSmall}><Pencil size={14} style={{ marginLeft: 4 }} /> تعديل</button>
              <button onClick={() => toggleStatus(college.id, college.name, college.is_active)} style={{ ...btnOutlineSmall, color: college.is_active ? "#ff9800" : "#4caf50", borderColor: college.is_active ? "#ff9800" : "#4caf50" }}>
                {college.is_active ? "تعطيل" : "تفعيل"}
              </button>
              <button onClick={() => handleDelete(college.id, college.name)} style={btnDangerSmall}><Trash2 size={14} style={{ marginLeft: 4 }} /> حذف</button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#fff", padding: "24px", borderRadius: "12px", width: "450px", boxShadow: "0 8px 30px rgba(0,0,0,0.15)" }}>
            <h3 style={{ color: "#333", marginTop: 0, fontSize: "16px" }}>{editingCollege ? "تعديل كلية" : "إضافة كلية جديدة"}</h3>
            <input type="text" placeholder="اسم الكلية" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={{ ...inputStyle, marginBottom: "12px" }} />
            <select value={form.manager_id} onChange={(e) => setForm({ ...form, manager_id: e.target.value })} style={{ ...inputStyle, marginBottom: "16px" }}>
              <option value="">— اختر مدير الكلية —</option>
              {managers.map((m: any) => (
                <option key={m.id} value={m.id}>{m.name} ({m.email})</option>
              ))}
            </select>
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={handleSave} disabled={saving} style={{ flex: 1, ...btnPrimary, opacity: saving ? 0.7 : 1 }}>{saving ? "جاري الحفظ..." : "حفظ"}</button>
              <button onClick={() => setShowModal(false)} style={{ flex: 1, background: "#eee", color: "#333", border: "none", padding: "10px", borderRadius: "8px", cursor: "pointer" }}>إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {viewDepts !== null && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#fff", borderRadius: "12px", width: "500px", maxHeight: "70vh", overflowY: "auto", boxShadow: "0 8px 30px rgba(0,0,0,0.15)" }}>
            <div style={{ background: primary, padding: "14px 20px", color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, fontSize: "15px" }}>أقسام {viewCollegeName}</h3>
              <button onClick={() => setViewDepts(null)} style={{ background: "rgba(255,255,255,0.15)", color: "#fff", border: "none", padding: "4px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "12px" }}>✕ إغلاق</button>
            </div>
            <div style={{ padding: "16px" }}>
              {viewDepts.length === 0 ? (
                <p style={{ textAlign: "center", color: "#888", fontSize: "13px" }}>لا توجد أقسام مسجلة</p>
              ) : (
                viewDepts.map((d: any, i: number) => (
                  <div key={i} style={{ padding: "10px 14px", borderBottom: "1px solid #f0f0f0", fontSize: "14px", color: "#333" }}>{d.name}</div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ================= إدارة المستخدمين =================
const roleNames2: Record<string, string> = {
  system_admin: "مدير النظام", college_manager: "مدير كلية",
  doctor: "دكتور", student: "طالب",
};

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [colleges, setColleges] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [roleFilter, setRoleFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [addStep, setAddStep] = useState<"role" | "form">("role");
  const [selectedRole, setSelectedRole] = useState("");
  const [form, setForm] = useState<any>({ name: "", email: "", password: "", phone: "", college_id: "", department_id: "", level: "1", academic_number: "", study_type: "general" });
  const [saving, setSaving] = useState(false);
  const [viewUser, setViewUser] = useState<any>(null);
  const [roleSummary, setRoleSummary] = useState<any>(null);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [showEditUser, setShowEditUser] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "", email: "", password: "", password_confirmation: "",
    phone: "", college_id: "", department_id: "", level: "1",
    academic_number: "", study_type: "general", is_active: true,
    role: "", qr_token: ""
  });
  const [regeneratingQr, setRegeneratingQr] = useState(false);
  // qrToken removed (unused)
  const [editUserData, setEditUserData] = useState<any>(null);

  const fetchUsers = useCallback(async () => {
    try {
      let url = `${LARAVEL_API}/admin/users`;
      if (roleFilter) url += `?role=${roleFilter}`;
      if (searchTerm) url += (roleFilter ? "&" : "?") + `search=${searchTerm}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setUsers(data.data);
        if (data.role_summary) setRoleSummary(data.role_summary);
      }
    } catch { setError("خطأ في تحميل المستخدمين"); }
    finally { setLoading(false); }
  }, [roleFilter, searchTerm]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const fetchCollegesAndDepts = async () => {
    try {
      const [cRes, dRes] = await Promise.all([
        fetch(`${LARAVEL_API}/admin/colleges-for-select`),
        fetch(`${LARAVEL_API}/admin/departments`),
      ]);
      const cData = await cRes.json();
      const dData = await dRes.json();
      if (cData.success) setColleges(cData.data);
      if (dData.success) setDepartments(dData.data);
    } catch {}
  };

  const openAdd = () => {
    setEditingUser(null);
    setAddStep("role");
    setSelectedRole("");
    setForm({ name: "", email: "", password: "", phone: "", college_id: "", department_id: "", level: "1", academic_number: "", study_type: "general" });
    setShowAdd(true);
    fetchCollegesAndDepts();
  };

  const openEditUser = async (user: any) => {
    setEditingUser(user);
    setSelectedRole(user.role);
    setShowEditUser(true);
    setError("");
    try {
      const res = await fetch(`${LARAVEL_API}/admin/users/${user.id}`);
      const data = await res.json();
      if (data.success) {
        const u = data.data;
        setEditUserData(u);
        setEditForm({
          name: u.name, email: u.email, password: "", password_confirmation: "",
          phone: u.phone || "", college_id: u.college?.id ? String(u.college.id) : "",
          department_id: u.department?.id ? String(u.department.id) : "",
          level: String(u.level || "1"), academic_number: u.academic_number || "",
          study_type: u.study_type || "general", is_active: u.is_active !== false,
          role: u.role, qr_token: u.qr_token || "",
        });
      }
    } catch { setError("فشل تحميل بيانات المستخدم"); }
    fetchCollegesAndDepts();
  };

  const handleSave = async () => {
    if (!form.name || !form.email) { alert("يرجى إدخال الاسم والبريد" + (editingUser ? "" : " وكلمة المرور")); return; }
    if (!editingUser && !form.password) { alert("يرجى إدخال كلمة المرور"); return; }
    if (selectedRole === "student" || selectedRole === "doctor") {
      if (!form.department_id) { alert("يرجى اختيار القسم"); return; }
    }
    if (selectedRole === "student") {
      if (!form.academic_number) { alert("يرجى إدخال الرقم الأكاديمي"); return; }
      if (!form.study_type) { alert("يرجى اختيار نوع الدراسة"); return; }
    }
    if (selectedRole === "college_manager" && !form.college_id) { alert("يرجى اختيار الكلية"); return; }
    setSaving(true);
    setError("");
    try {
      const body: any = {
        name: form.name, email: form.email,
        role: selectedRole, phone: form.phone || null,
      };
      if (!editingUser) body.password = form.password;
      if (selectedRole === "student" || selectedRole === "doctor") {
        body.department_id = parseInt(form.department_id);
        body.level = parseInt(form.level) || 1;
      }
      if (selectedRole === "student") {
        body.academic_number = form.academic_number;
        body.study_type = form.study_type;
      }
      if (selectedRole === "college_manager") {
        if (form.college_id) body.college_id = parseInt(form.college_id);
      }

      const url = editingUser ? `${LARAVEL_API}/admin/users/${editingUser.id}` : `${LARAVEL_API}/admin/users`;
      const method = editingUser ? "PUT" : "POST";
      const res = await fetch(url, {
        method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        setShowAdd(false);
        setEditingUser(null);
        fetchUsers();
        alert(editingUser ? "تم تعديل المستخدم بنجاح" : "تم إنشاء المستخدم بنجاح");
      } else {
        setError(data.message || "فشل " + (editingUser ? "تعديل" : "إنشاء") + " المستخدم");
      }
    } catch { setError("خطأ في الاتصال بالسيرفر"); }
    finally { setSaving(false); }
  };

  const handleEditSave = async () => {
    if (!editForm.name || !editForm.email) { alert("يرجى إدخال الاسم والبريد"); return; }
    if (editForm.password && editForm.password.length < 6) { alert("كلمة المرور يجب أن تكون 6 أحرف على الأقل"); return; }
    if (editForm.password && editForm.password !== editForm.password_confirmation) { alert("تأكيد كلمة المرور غير متطابق"); return; }
    if ((editForm.role === "student" || editForm.role === "doctor") && !editForm.department_id) { alert("يرجى اختيار القسم"); return; }
    if (editForm.role === "student" && !editForm.academic_number) { alert("يرجى إدخال الرقم الأكاديمي"); return; }
    setSaving(true); setError("");
    try {
      const body: any = {
        name: editForm.name, email: editForm.email, role: editForm.role,
        phone: editForm.phone || null, is_active: editForm.is_active ? 1 : 0,
      };
      if (editForm.password) {
        body.password = editForm.password;
      }
      if (editForm.role === "student" || editForm.role === "doctor") {
        body.department_id = parseInt(editForm.department_id);
      }
      if (editForm.role === "student") {
        body.level = parseInt(editForm.level) || 1;
        body.academic_number = editForm.academic_number;
        body.study_type = editForm.study_type;
      }
      if (editForm.role === "college_manager" && editForm.college_id) {
        body.college_id = parseInt(editForm.college_id);
      }
      const res = await fetch(`${LARAVEL_API}/admin/users/${editingUser.id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        setShowEditUser(false); setEditingUser(null);
        fetchUsers();
        alert("تم تعديل المستخدم بنجاح");
      } else {
        setError(data.message || "فشل تعديل المستخدم");
      }
    } catch { setError("خطأ في الاتصال بالسيرفر"); }
    finally { setSaving(false); }
  };

  const handleRegenerateQr = async () => {
    if (!editingUser?.id) return;
    setRegeneratingQr(true);
    try {
      const res = await fetch(`${LARAVEL_API}/admin/users/${editingUser.id}/regenerate-qr`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setEditForm(prev => ({ ...prev, qr_token: data.qr_token }));
        alert("تم إعادة إنشاء QR Token");
      } else { alert(data.message || "فشل"); }
    } catch { alert("خطأ"); }
    finally { setRegeneratingQr(false); }
  };

  const toggleUserStatus = async (id: number, current: boolean) => {
    const action = current ? "تعطيل" : "تفعيل";
    if (!window.confirm(`هل أنت متأكد من ${action} هذا المستخدم؟`)) return;
    try {
      const res = await fetch(`${LARAVEL_API}/admin/users/${id}/toggle-status`, { method: "PUT" });
      const data = await res.json();
      if (data.success) { fetchUsers(); alert(data.message); }
      else { alert(data.message); }
    } catch { alert("خطأ في الاتصال بالسيرفر"); }
  };

  const deleteUser = async (id: number, name: string) => {
    if (!window.confirm(`هل أنت متأكد من حذف المستخدم ${name}؟`)) return;
    try {
      const res = await fetch(`${LARAVEL_API}/admin/users/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) { fetchUsers(); alert("تم حذف المستخدم"); }
      else { alert(data.message); }
    } catch { alert("خطأ في الاتصال بالسيرفر"); }
  };

  const viewUserDetails = async (id: number) => {
    try {
      const res = await fetch(`${LARAVEL_API}/admin/users/${id}`);
      const data = await res.json();
      if (data.success) setViewUser(data.data);
      else alert("المستخدم غير موجود");
    } catch { alert("خطأ في الاتصال بالسيرفر"); }
  };

  const exportToCSV = () => {
    const headers = ["الاسم", "البريد", "الدور", "الكلية", "الحالة", "تاريخ الإنشاء"];
    const rows = users.map((u: any) => [u.name, u.email, roleNames2[u.role] || u.role, u.college_name, u.is_active ? "نشط" : "غير نشط", u.created_at]);
    const csvContent = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob); link.href = url;
    link.setAttribute("download", "users.csv");
    document.body.appendChild(link); link.click();
    document.body.removeChild(link); URL.revokeObjectURL(url);
    alert("تم تصدير المستخدمين بنجاح");
  };

  const deptsForSelectedCollege = departments.filter((d: any) => d.college_id === parseInt(form.college_id));

  if (loading) return <div style={pageContainer}><p style={{ textAlign: "center", color: "#888" }}>جاري التحميل...</p></div>;

  return (
    <div style={pageContainer}>
      <div style={headerRow}>
        <h2 style={{ color: primary, margin: 0, fontSize: "24px", fontWeight: 700 }}><Users size={24} style={{ marginLeft: 8 }} /> إدارة المستخدمين</h2>
        <div style={flexRow}>
          <button onClick={openAdd} style={btnPrimary}><PlusCircle size={16} style={{ marginLeft: 6 }} /> إضافة مستخدم</button>
          <button onClick={exportToCSV} style={btnOutline}><Download size={16} style={{ marginLeft: 6 }} /> تصدير CSV</button>
        </div>
      </div>

      {roleSummary && (
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "15px", padding: "12px 16px", background: "#f8f9fa", borderRadius: "10px", border: "1px solid #e9ecef" }}>
          {[
            { label: "إجمالي المستخدمين", value: roleSummary.total, color: primary },
            { label: "مدراء النظام", value: roleSummary.system_admin, color: "#6c757d" },
            { label: "مدراء الكليات", value: roleSummary.college_manager, color: "#17a2b8" },
            { label: "الدكاترة", value: roleSummary.doctor, color: "#6610f2" },
            { label: "الطلاب", value: roleSummary.student, color: "#28a745" },
            { label: "نشط", value: roleSummary.active, color: "#28a745" },
            { label: "غير نشط", value: roleSummary.inactive, color: "#dc3545" },
          ].map((s) => (
            <div key={s.label} style={{ display: "flex", alignItems: "center", gap: "6px", background: "#fff", padding: "6px 14px", borderRadius: "8px", border: "1px solid #dee2e6" }}>
              <span style={{ fontSize: "18px", fontWeight: 700, color: s.color }}>{s.value}</span>
              <span style={{ fontSize: "12px", color: "#888" }}>{s.label}</span>
            </div>
          ))}
        </div>
      )}
      <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
        <div style={{ position: "relative", flex: 1 }}>
          <Search size={16} style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", color: "#aaa" }} />
          <input type="text" placeholder="بحث عن مستخدم..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ ...inputStyle, paddingRight: "32px" }} />
        </div>
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} style={{ ...inputStyle, width: "180px" }}>
          <option value="">جميع الأدوار</option>
          <option value="system_admin">مدير نظام</option>
          <option value="college_manager">مدير كلية</option>
          <option value="doctor">دكتور</option>
          <option value="student">طالب</option>
        </select>
      </div>

      {error && <div style={{ background: "#f8d7da", color: "#721c24", padding: "10px", borderRadius: "8px", marginBottom: "15px", fontSize: "13px" }}>{error}</div>}

      <div style={{ display: "grid", gap: "12px" }}>
        {users.map((user: any) => (
          <div key={user.id} style={{ ...itemCard, opacity: user.is_active ? 1 : 0.5 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <h3 style={{ margin: 0, color: "#333", fontSize: "15px" }}>{user.name}</h3>
                <span style={{ background: user.is_active ? "#e8f5e9" : "#ffebee", color: user.is_active ? "#4caf50" : "#f44336", padding: "2px 10px", borderRadius: "12px", fontSize: "11px" }}>
                  {user.is_active ? "نشط" : "غير نشط"}
                </span>
              </div>
              <p style={{ margin: "4px 0 0 0", color: "#888", fontSize: "13px" }}>{user.email} | {roleNames2[user.role] || user.role} | {user.college_name}</p>
              <p style={{ margin: "2px 0 0 0", fontSize: "12px", color: "#888" }}>تاريخ الإنشاء: {user.created_at}</p>
            </div>
            <div style={{ ...flexRow, alignItems: "center" }}>
              <button onClick={() => { openEditUser(user); }} style={btnOutlineSmall}><Pencil size={14} style={{ marginLeft: 4 }} /> تعديل</button>
              <button onClick={() => viewUserDetails(user.id)} style={btnOutlineSmall}><Eye size={14} style={{ marginLeft: 4 }} /> عرض</button>
              <button onClick={() => toggleUserStatus(user.id, user.is_active)} style={{ ...btnOutlineSmall, color: user.is_active ? "#ff9800" : "#4caf50", borderColor: user.is_active ? "#ff9800" : "#4caf50" }}>
                {user.is_active ? "تعطيل" : "تفعيل"}
              </button>
              <button onClick={() => deleteUser(user.id, user.name)} style={btnDangerSmall}><Trash2 size={14} style={{ marginLeft: 4 }} /> حذف</button>
            </div>
          </div>
        ))}
      </div>

      {showAdd && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, overflowY: "auto" }}>
          <div style={{ background: "#fff", padding: "24px", borderRadius: "12px", width: "520px", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 8px 30px rgba(0,0,0,0.15)" }}>
            {addStep === "role" ? (
              <>
                <h3 style={{ color: "#333", marginTop: 0, fontSize: "16px" }}>اختر نوع الحساب</h3>
                <div style={{ display: "grid", gap: "10px", marginBottom: "16px" }}>
                  {[
                    { id: "system_admin", name: "مدير النظام", icon: <Shield size={20} /> },
                    { id: "college_manager", name: "مدير كلية", icon: <Building2 size={20} /> },
                    { id: "doctor", name: "دكتور", icon: <Award size={20} /> },
                    { id: "student", name: "طالب", icon: <Users size={20} /> },
                  ].map((r) => (
                    <div key={r.id} onClick={() => { setSelectedRole(r.id); setAddStep("form"); }}
                      style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", borderRadius: "10px", border: selectedRole === r.id ? `2px solid ${primary}` : "1px solid #ddd", cursor: "pointer", background: selectedRole === r.id ? "rgba(29,76,79,0.05)" : "#fff" }}>
                      <span style={{ color: primary }}>{r.icon}</span>
                      <span style={{ fontWeight: 600, color: "#333", fontSize: "14px" }}>{r.name}</span>
                    </div>
                  ))}
                </div>
                <button onClick={() => setShowAdd(false)} style={{ width: "100%", background: "#eee", color: "#333", border: "none", padding: "10px", borderRadius: "8px", cursor: "pointer" }}>إلغاء</button>
              </>
            ) : (
              <>
                <h3 style={{ color: "#333", marginTop: 0, fontSize: "16px" }}>{editingUser ? "تعديل" : "إضافة"} {roleNames2[selectedRole]}</h3>
                <input type="text" placeholder="الاسم الكامل" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={{ ...inputStyle, marginBottom: "10px" }} />
                <input type="email" placeholder="البريد الإلكتروني" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} style={{ ...inputStyle, marginBottom: "10px" }} />
                {!editingUser && <input type="password" placeholder="كلمة المرور" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} style={{ ...inputStyle, marginBottom: "10px" }} />}
                <input type="text" placeholder="رقم الهاتف" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} style={{ ...inputStyle, marginBottom: "10px" }} />

                {selectedRole === "system_admin" && (
                  <p style={{ fontSize: "12px", color: "#888", marginBottom: "10px" }}>سيتم إنشاء الحساب بصلاحيات مدير نظام</p>
                )}

                {selectedRole === "college_manager" && (
                  <select value={form.college_id} onChange={(e) => setForm({ ...form, college_id: e.target.value })} style={{ ...inputStyle, marginBottom: "10px" }}>
                    <option value="">اختر الكلية التي سيديرها</option>
                    {colleges.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                )}

                {(selectedRole === "student" || selectedRole === "doctor") && (
                  <>
                    <select value={form.college_id} onChange={(e) => { setForm({ ...form, college_id: e.target.value, department_id: "" }); }} style={{ ...inputStyle, marginBottom: "10px" }}>
                      <option value="">اختر الكلية</option>
                      {colleges.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    {form.college_id && (
                      <select value={form.department_id} onChange={(e) => setForm({ ...form, department_id: e.target.value })} style={{ ...inputStyle, marginBottom: "10px" }}>
                        <option value="">اختر القسم</option>
                        {deptsForSelectedCollege.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
                      </select>
                    )}
                    {selectedRole === "student" && (
                      <>
                        <select value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} style={{ ...inputStyle, marginBottom: "10px" }}>
                          <option value="">اختر المستوى</option>
                          {[1,2,3,4,5,6,7,8].map(l => <option key={l} value={l}>المستوى {l}</option>)}
                        </select>
                        <input type="text" placeholder="الرقم الأكاديمي" value={form.academic_number} onChange={(e) => setForm({ ...form, academic_number: e.target.value })} style={{ ...inputStyle, marginBottom: "10px" }} />
                        <select value={form.study_type} onChange={(e) => setForm({ ...form, study_type: e.target.value })} style={{ ...inputStyle, marginBottom: "10px" }}>
                          <option value="">اختر نوع الدراسة</option>
                          <option value="general">عام</option>
                          <option value="paid">نفقة (خاص)</option>
                        </select>
                      </>
                    )}
                  </>
                )}
                <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                  <button onClick={handleSave} disabled={saving} style={{ flex: 1, ...btnPrimary, opacity: saving ? 0.7 : 1 }}>{saving ? "جاري الحفظ..." : (editingUser ? "تعديل" : "حفظ")}</button>
                  <button onClick={() => { if (editingUser) { setShowAdd(false); setEditingUser(null); } else setAddStep("role"); }} style={{ flex: 1, ...btnOutline }}>رجوع</button>
                  <button onClick={() => setShowAdd(false)} style={{ flex: 1, background: "#eee", color: "#333", border: "none", padding: "10px", borderRadius: "8px", cursor: "pointer" }}>إلغاء</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {showEditUser && editingUser && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, overflowY: "auto" }}>
          <div style={{ background: "#fff", padding: "24px", borderRadius: "12px", width: "600px", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 8px 30px rgba(0,0,0,0.15)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ margin: 0, fontSize: "16px", color: "#333" }}>
                <Pencil size={18} style={{ marginLeft: 6 }} /> تعديل المستخدم: {editingUser.name}
              </h3>
              <button onClick={() => { setShowEditUser(false); setEditingUser(null); }} style={{ background: "none", border: "none", fontSize: "18px", cursor: "pointer", color: "#888" }}>✕</button>
            </div>
            <div>
              {error && <div style={{ background: "#f8d7da", color: "#721c24", padding: "10px", borderRadius: "8px", marginBottom: "15px", fontSize: "13px" }}>{error}</div>}

              {/* الصف الأول: الاسم والبريد */}
              <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
                <input type="text" placeholder="الاسم الكامل" value={editForm.name}
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                  style={{ ...inputStyle, flex: 1 }} />
                <input type="email" placeholder="البريد الإلكتروني" value={editForm.email}
                  onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                  style={{ ...inputStyle, flex: 1 }} />
              </div>

              {/* الصف الثاني: الهاتف والدور */}
              <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
                <input type="text" placeholder="رقم الهاتف" value={editForm.phone}
                  onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                  style={{ ...inputStyle, flex: 1 }} />
                <select value={editForm.role}
                  onChange={(e) => setEditForm({...editForm, role: e.target.value})}
                  style={{ ...inputStyle, flex: 1 }}>
                  <option value="system_admin">مدير نظام</option>
                  <option value="college_manager">مدير كلية</option>
                  <option value="doctor">دكتور</option>
                  <option value="student">طالب</option>
                </select>
              </div>

              {/* حالة الحساب */}
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "10px", padding: "8px 12px", background: "#f8f9fa", borderRadius: "8px" }}>
                <span style={{ fontSize: "13px", fontWeight: 600, color: "#555" }}>حالة الحساب:</span>
                <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", fontSize: "13px" }}>
                  <input type="radio" name="is_active" checked={editForm.is_active === true}
                    onChange={() => setEditForm({...editForm, is_active: true})} />
                  <span style={{ color: "#4caf50", fontWeight: 600 }}>✔ الحساب نشط</span>
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", fontSize: "13px" }}>
                  <input type="radio" name="is_active" checked={editForm.is_active === false}
                    onChange={() => setEditForm({...editForm, is_active: false})} />
                  <span style={{ color: "#f44336", fontWeight: 600 }}>✘ الحساب معطل</span>
                </label>
              </div>

              {/* كلمة المرور (قابلة للطي) */}
              <details style={{ marginBottom: "10px" }}>
                <summary style={{ cursor: "pointer", fontSize: "13px", fontWeight: 600, color: "#555", marginBottom: "8px" }}>
                  تغيير كلمة المرور
                </summary>
                <div style={{ display: "flex", gap: "10px" }}>
                  <input type="password" placeholder="كلمة المرور الجديدة" value={editForm.password}
                    onChange={(e) => setEditForm({...editForm, password: e.target.value})}
                    style={{ ...inputStyle, flex: 1 }} />
                  <input type="password" placeholder="تأكيد كلمة المرور" value={editForm.password_confirmation}
                    onChange={(e) => setEditForm({...editForm, password_confirmation: e.target.value})}
                    style={{ ...inputStyle, flex: 1 }} />
                </div>
              </details>

              {/* QR Token */}
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px", padding: "8px 12px", background: "#f8f9fa", borderRadius: "8px" }}>
                <span style={{ fontSize: "12px", color: "#888", fontWeight: 600 }}>QR Token:</span>
                <code style={{ fontSize: "11px", color: "#333", direction: "ltr", unicodeBidi: "plaintext", flex: 1, wordBreak: "break-all" }}>{editForm.qr_token || "—"}</code>
                <button onClick={handleRegenerateQr} disabled={regeneratingQr}
                  style={{ background: "#ff9800", color: "#fff", border: "none", padding: "6px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "12px", whiteSpace: "nowrap" }}>
                  {regeneratingQr ? "..." : "إعادة إنشاء QR"}
                </button>
              </div>

              {/* الرقم الأكاديمي (للمستخدم الحالي أو عند اختيار طالب) */}
              {(editForm.role === "student" || editUserData?.role === "student") && (
                <input type="text" placeholder="الرقم الأكاديمي" value={editForm.academic_number}
                  onChange={(e) => setEditForm({...editForm, academic_number: e.target.value})}
                  style={{ ...inputStyle, marginBottom: "10px" }} />
              )}

              {/* الكلية (لـ college_manager, student, doctor) */}
              {(editForm.role === "college_manager" || editForm.role === "student" || editForm.role === "doctor") && (
                <select value={editForm.college_id}
                  onChange={(e) => { setEditForm({...editForm, college_id: e.target.value, department_id: "" }); }}
                  style={{ ...inputStyle, marginBottom: "10px" }}>
                  <option value="">اختر الكلية</option>
                  {colleges.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              )}

              {/* القسم (لـ student, doctor) */}
              {(editForm.role === "student" || editForm.role === "doctor") && editForm.college_id && (
                <select value={editForm.department_id}
                  onChange={(e) => setEditForm({...editForm, department_id: e.target.value})}
                  style={{ ...inputStyle, marginBottom: "10px" }}>
                  <option value="">اختر القسم</option>
                  {departments.filter((d: any) => d.college_id === parseInt(editForm.college_id)).map((d: any) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              )}

              {/* بيانات الطالب: المستوى + نوع الدراسة */}
              {editForm.role === "student" && (
                <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
                  <select value={editForm.level}
                    onChange={(e) => setEditForm({...editForm, level: e.target.value})}
                    style={{ ...inputStyle, flex: 1 }}>
                    <option value="">المستوى</option>
                    {[1,2,3,4,5,6,7,8].map(l => <option key={l} value={l}>المستوى {l}</option>)}
                  </select>
                  <select value={editForm.study_type}
                    onChange={(e) => setEditForm({...editForm, study_type: e.target.value})}
                    style={{ ...inputStyle, flex: 1 }}>
                    <option value="general">عام</option>
                    <option value="paid">نفقة</option>
                  </select>
                </div>
              )}

              {/* أزرار الحفظ والإلغاء */}
              <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
                <button onClick={handleEditSave} disabled={saving}
                  style={{ flex: 1, ...btnPrimary, opacity: saving ? 0.7 : 1 }}>
                  {saving ? "جاري الحفظ..." : "حفظ التعديلات"}
                </button>
                <button onClick={() => { setShowEditUser(false); setEditingUser(null); }}
                  style={{ flex: 1, background: "#eee", color: "#333", border: "none", padding: "10px", borderRadius: "8px", cursor: "pointer" }}>
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {viewUser && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#fff", borderRadius: "12px", width: "450px", boxShadow: "0 8px 30px rgba(0,0,0,0.15)" }}>
            <div style={{ background: primary, padding: "14px 20px", color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, fontSize: "15px" }}><Eye size={16} style={{ marginLeft: 6 }} /> بيانات المستخدم</h3>
              <button onClick={() => setViewUser(null)} style={{ background: "rgba(255,255,255,0.15)", color: "#fff", border: "none", padding: "4px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "12px" }}>✕ إغلاق</button>
            </div>
            <div style={{ padding: "20px" }}>
              <table style={{ width: "100%", fontSize: "13px" }}>
                <tbody>
                  <tr><td style={{ padding: "8px 0", color: "#888", width: "120px" }}>الاسم</td><td style={{ padding: "8px 0", fontWeight: 600 }}>{viewUser.name}</td></tr>
                  <tr><td style={{ padding: "8px 0", color: "#888" }}>البريد</td><td style={{ padding: "8px 0" }}>{viewUser.email}</td></tr>
                  <tr><td style={{ padding: "8px 0", color: "#888" }}>الدور</td><td style={{ padding: "8px 0" }}>{roleNames2[viewUser.role] || viewUser.role}</td></tr>
                  <tr><td style={{ padding: "8px 0", color: "#888" }}>الهاتف</td><td style={{ padding: "8px 0" }}>{viewUser.phone || "—"}</td></tr>
                  {viewUser.department_name && <tr><td style={{ padding: "8px 0", color: "#888" }}>القسم</td><td style={{ padding: "8px 0" }}>{viewUser.department_name}</td></tr>}
                  {viewUser.college_name && <tr><td style={{ padding: "8px 0", color: "#888" }}>الكلية</td><td style={{ padding: "8px 0" }}>{viewUser.college_name}</td></tr>}
                  {viewUser.academic_number && <tr><td style={{ padding: "8px 0", color: "#888" }}>الرقم الأكاديمي</td><td style={{ padding: "8px 0" }}>{viewUser.academic_number}</td></tr>}
                  <tr><td style={{ padding: "8px 0", color: "#888" }}>الحالة</td><td style={{ padding: "8px 0" }}>{viewUser.is_active ? "نشط" : "غير نشط"}</td></tr>
                  <tr><td style={{ padding: "8px 0", color: "#888" }}>تاريخ الإنشاء</td><td style={{ padding: "8px 0" }}>{viewUser.created_at || "—"}</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ================= إدارة الأدوار =================
// permissionNames removed (unused)

const RolesPage: React.FC = () => {
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchRoles = useCallback(async () => {
    try {
      const res = await fetch(`${LARAVEL_API}/admin/roles`);
      const data = await res.json();
      if (data.success) setRoles(data.data);
      else setError(data.message);
    } catch { setError("خطأ في تحميل الأدوار"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchRoles(); }, [fetchRoles]);

  const exportToCSV = () => {
    const headers = ["الدور", "الصلاحيات", "عدد المستخدمين"];
    const rows = roles.map((r: any) => [r.name, (r.permissions || []).join(" | "), r.users_count || 0]);
    const csvContent = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a"); const url = URL.createObjectURL(blob);
    link.href = url; link.setAttribute("download", "roles.csv");
    document.body.appendChild(link); link.click();
    document.body.removeChild(link); URL.revokeObjectURL(url);
    alert("تم تصدير الأدوار بنجاح");
  };

  if (loading) return <div style={pageContainer}><p style={{ textAlign: "center", color: "#888" }}>جاري التحميل...</p></div>;

  return (
    <div style={pageContainer}>
      <div style={headerRow}>
        <h2 style={{ color: primary, margin: 0, fontSize: "24px", fontWeight: 700 }}><Shield size={24} style={{ marginLeft: 8 }} /> إدارة الأدوار والصلاحيات</h2>
        <button onClick={exportToCSV} style={btnOutline}><Download size={16} style={{ marginLeft: 6 }} /> تصدير CSV</button>
      </div>
      {error && <div style={{ background: "#f8d7da", color: "#721c24", padding: "10px", borderRadius: "8px", marginBottom: "15px", fontSize: "13px" }}>{error}</div>}

      <div style={{ display: "grid", gap: "12px" }}>
        {roles.map((role: any) => (
          <div key={role.id} style={itemCard}>
            <div>
              <h3 style={{ margin: 0, color: "#333", fontSize: "15px" }}>{role.name}</h3>
              <p style={{ margin: "4px 0 0 0", color: "#888", fontSize: "13px" }}>عدد المستخدمين: {role.users_count || 0}</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginTop: "6px" }}>
                {(role.permissions || []).map((p: string, i: number) => (
                  <span key={i} style={{ background: "rgba(29, 76, 79, 0.08)", color: primary, padding: "2px 10px", borderRadius: "12px", fontSize: "11px" }}>{p}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ================= إدارة الأترام =================
const SemestersPage: React.FC = () => {
  const [semesters, setSemesters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [editingSem, setEditingSem] = useState<any>(null);
  const [form, setForm] = useState({ name: "", year: "", term: "1", start_date: "", end_date: "", description: "" });
  const [saving, setSaving] = useState(false);

  const fetchSemesters = useCallback(async () => {
    try {
      const res = await fetch(`${LARAVEL_API}/admin/terms`);
      const data = await res.json();
      if (data.success) setSemesters(data.data);
      else setError(data.message);
    } catch { setError("خطأ في تحميل الأترام"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchSemesters(); }, [fetchSemesters]);

  const openAdd = () => {
    setEditingSem(null);
    setForm({ name: "", year: "", term: "1", start_date: "", end_date: "", description: "" });
    setShowAdd(true);
  };

  const openEdit = (sem: any) => {
    setEditingSem(sem);
    const parts = (sem.name || "").split(" - ");
    setForm({
      name: sem.name || "",
      year: parts[0] || "",
      term: sem.term?.toString() || "1",
      start_date: sem.start_date || "",
      end_date: sem.end_date || "",
      description: sem.description || "",
    });
    setShowAdd(true);
  };

  const handleSave = async () => {
    if (!form.start_date || !form.end_date) { alert("يرجى إدخال تاريخ البدء وتاريخ الانتهاء"); return; }
    setSaving(true);
    try {
      const body: any = { start_date: form.start_date, end_date: form.end_date, description: form.description };
      if (form.name) body.name = form.name;
      if (form.year) body.year = parseInt(form.year);
      if (form.term) body.term = parseInt(form.term);

      const isEdit = editingSem !== null;
      const url = isEdit ? `${LARAVEL_API}/admin/terms/${editingSem.id}` : `${LARAVEL_API}/admin/terms`;
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      if (data.success) {
        setShowAdd(false); setEditingSem(null);
        setForm({ name: "", year: "", term: "1", start_date: "", end_date: "", description: "" });
        fetchSemesters();
        alert(isEdit ? "تم تعديل الترم بنجاح" : "تم إضافة الترم بنجاح");
      } else { alert(data.message); }
    } catch { alert("خطأ في الاتصال"); }
    finally { setSaving(false); }
  };

  const setActiveSemester = async (id: number) => {
    try {
      const res = await fetch(`${LARAVEL_API}/admin/terms/${id}/set-active`, { method: "PUT" });
      const data = await res.json();
      if (data.success) { fetchSemesters(); alert("تم تعيين الترم النشط بنجاح"); }
      else { alert(data.message); }
    } catch { alert("خطأ في الاتصال"); }
  };

  const toggleActive = async (id: number, current: boolean) => {
    if (current) {
      if (!window.confirm("هل أنت متأكد من إلغاء تفعيل هذا الترم؟")) return;
      try {
        const res = await fetch(`${LARAVEL_API}/admin/terms/${id}/set-active?active=0`, { method: "PUT" });
        const data = await res.json();
        if (data.success) { fetchSemesters(); alert("تم إلغاء تفعيل الترم"); }
        else { alert(data.message); }
      } catch { alert("خطأ في الاتصال"); }
    } else {
      setActiveSemester(id);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`هل أنت متأكد من حذف الترم ${name}؟`)) return;
    try {
      const res = await fetch(`${LARAVEL_API}/admin/terms/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) { fetchSemesters(); alert("تم حذف الترم بنجاح"); }
      else { alert(data.message); }
    } catch { alert("خطأ في الاتصال"); }
  };

  const exportToCSV = () => {
    const headers = ["الاسم", "السنة", "الترم", "تاريخ البداية", "تاريخ النهاية", "الحالة", "الوصف"];
    const rows = semesters.map((s: any) => [s.name, s.year, s.term === 1 ? "الأول" : "الثاني", s.start_date, s.end_date, s.is_active ? "نشط" : "غير نشط", s.description || ""]);
    const csvContent = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a"); const url = URL.createObjectURL(blob);
    link.href = url; link.setAttribute("download", "semesters.csv");
    document.body.appendChild(link); link.click();
    document.body.removeChild(link); URL.revokeObjectURL(url);
    alert("تم تصدير الأترام بنجاح");
  };

  if (loading) return <div style={pageContainer}><p style={{ textAlign: "center", color: "#888" }}>جاري التحميل...</p></div>;

  return (
    <div style={pageContainer}>
      <div style={headerRow}>
        <h2 style={{ color: primary, margin: 0, fontSize: "24px", fontWeight: 700 }}><Calendar size={24} style={{ marginLeft: 8 }} /> إدارة الأترام</h2>
        <div style={flexRow}>
          <button onClick={openAdd} style={btnPrimary}><PlusCircle size={16} style={{ marginLeft: 6 }} /> إضافة ترم</button>
          <button onClick={exportToCSV} style={btnOutline}><Download size={16} style={{ marginLeft: 6 }} /> تصدير CSV</button>
        </div>
      </div>
      {error && <div style={{ background: "#f8d7da", color: "#721c24", padding: "10px", borderRadius: "8px", marginBottom: "15px", fontSize: "13px" }}>{error}</div>}
      {showAdd && (
        <div style={formCardStyle}>
          <h3 style={{ margin: "0 0 15px 0", color: primary, fontSize: "15px", fontWeight: 700 }}>{editingSem ? "تعديل الترم" : "إضافة ترم جديد"}</h3>
          <div style={{ display: "flex", gap: "10px", marginBottom: "12px" }}>
            <select value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} style={{ ...inputStyle, flex: 1 }}>
              <option value="">اختر السنة</option><option>2026</option><option>2027</option><option>2028</option><option>2029</option><option>2030</option>
            </select>
            <select value={form.term} onChange={(e) => setForm({ ...form, term: e.target.value })} style={{ ...inputStyle, flex: 1 }}>
              <option value="1">الترم الأول</option><option value="2">الترم الثاني</option>
            </select>
          </div>
          <div style={{ display: "flex", gap: "10px", marginBottom: "12px" }}>
            <input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} style={{ ...inputStyle, flex: 1 }} />
            <input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} style={{ ...inputStyle, flex: 1 }} />
          </div>
          <textarea placeholder="وصف الترم" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={{ ...inputStyle, marginBottom: "12px", minHeight: "60px" }} />
          <div style={flexRow}>
            <button onClick={handleSave} disabled={saving} style={{ ...btnPrimary, opacity: saving ? 0.7 : 1 }}>{saving ? "جاري الحفظ..." : (editingSem ? "تحديث" : "حفظ")}</button>
            <button onClick={() => { setShowAdd(false); setEditingSem(null); }} style={{ ...btnOutline, background: "#eee", color: "#333", border: "none" }}>إلغاء</button>
          </div>
        </div>
      )}
      <div style={{ display: "grid", gap: "12px" }}>
        {semesters.map((sem: any) => (
          <div key={sem.id} style={{ ...itemCard, background: sem.is_active ? "rgba(29, 76, 79, 0.03)" : "#fff", borderRight: sem.is_active ? `3px solid ${primary}` : "none" }}>
            <div>
              <h3 style={{ margin: 0, color: primary, fontSize: "15px" }}>{sem.name} {sem.is_active && <span style={{ fontSize: "11px", color: primary }}> (النشط)</span>}</h3>
              <p style={{ margin: "4px 0 0 0", color: "#888", fontSize: "13px" }}>{sem.start_date} → {sem.end_date}</p>
              <p style={{ margin: "2px 0 0 0", color: "#888", fontSize: "12px" }}>{sem.description}</p>
            </div>
            <div style={flexRow}>
              <button onClick={() => openEdit(sem)} style={{ ...btnOutlineSmall, color: "#2196F3", borderColor: "#2196F3" }}><Pencil size={14} style={{ marginLeft: 4 }} /> تعديل</button>
              {sem.is_active ? (
                <button onClick={() => toggleActive(sem.id, true)} style={{ ...btnOutlineSmall, color: "#ff9800", borderColor: "#ff9800" }}>إلغاء تفعيل</button>
              ) : (
                <button onClick={() => toggleActive(sem.id, false)} style={btnOutlineSmall}>تعيين نشط</button>
              )}
              <button onClick={() => handleDelete(sem.id, sem.name)} style={btnDangerSmall}><Trash2 size={14} style={{ marginLeft: 4 }} /> حذف</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ================= إعدادات النظام =================
const SettingsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState<"success" | "error">("success");
  const [activeSection, setActiveSection] = useState("general");

  const [form, setForm] = useState({
    university_name: "", system_logo: "", official_email: "", phone: "",
    phone_2: "", website_url: "", address: "",
    notifications_enabled: true, notification_email: "", smtp_host: "", smtp_port: "", smtp_user: "", smtp_pass: "",
    attendance_weight: 10, assignments_weight: 30, quizzes_weight: 10, midterm_weight: 20, final_weight: 30,
    current_year: "", current_term: "", term_start: "", term_end: "",
    max_file_size: 10, allowed_file_types: "pdf,doc,docx,jpg,png,zip",
  });

  const fetchSettings = async () => {
    try {
      const res = await fetch(`${LARAVEL_API}/admin/settings`);
      const data = await res.json();
      if (data.success && data.data) {
        setForm((prev: any) => {
          const merged = { ...prev };
          Object.keys(data.data).forEach((key) => {
            if (key in merged) {
              const val = data.data[key];
              if (val === "true" || val === "false") merged[key] = val === "true";
              else if (!isNaN(Number(val)) && typeof merged[key] === "number") merged[key] = Number(val);
              else merged[key] = val;
            }
          });
          return merged;
        });
      }
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchSettings(); }, []);

  const handleSave = async () => {
    setSaving(true);
    setMsg("");
    try {
      const res = await fetch(`${LARAVEL_API}/admin/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: form }),
      });
      const data = await res.json();
      if (data.success) { setMsgType("success"); setMsg("تم حفظ الإعدادات بنجاح"); }
      else { setMsgType("error"); setMsg(data.message); }
    } catch { setMsgType("error"); setMsg("خطأ في الاتصال"); }
    finally { setSaving(false); setTimeout(() => setMsg(""), 3000); }
  };

  const sectionBtn = (id: string, label: string) => (
    <button onClick={() => setActiveSection(id)} style={{ background: activeSection === id ? primary : "#f0f3f6", color: activeSection === id ? "#fff" : "#333", border: "none", padding: "8px 16px", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: 600, whiteSpace: "nowrap" }}>
      {label}
    </button>
  );

  const renderSection = () => {
    const input = { ...inputStyle, marginBottom: "12px" };
    const label = { display: "block", fontWeight: 600, marginBottom: "6px", color: "#333", fontSize: "13px" };

    switch (activeSection) {
      case "general":
        return (
          <div>
            <h3 style={{ margin: "0 0 16px 0", color: primary, fontSize: "15px", fontWeight: 700 }}>الإعدادات العامة</h3>
            <label style={label}>اسم الجامعة</label>
            <input type="text" value={form.university_name} onChange={(e) => setForm({...form, university_name: e.target.value})} style={input} />
            <label style={label}>شعار النظام (رابط URL)</label>
            <input type="text" value={form.system_logo} onChange={(e) => setForm({...form, system_logo: e.target.value})} style={input} placeholder="https://example.com/logo.png" />
            <label style={label}>البريد الإلكتروني الرسمي</label>
            <input type="email" value={form.official_email} onChange={(e) => setForm({...form, official_email: e.target.value})} style={input} />
            <label style={label}>الموقع الإلكتروني للجامعة</label>
            <input type="url" value={form.website_url} onChange={(e) => setForm({...form, website_url: e.target.value})} style={input} placeholder="https://www.university.edu.ye" />
            <label style={label}>رقم الهاتف الأول</label>
            <input type="text" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} style={input} placeholder="05XXXXXXXX" />
            <label style={label}>رقم الهاتف الثاني</label>
            <input type="text" value={form.phone_2} onChange={(e) => setForm({...form, phone_2: e.target.value})} style={input} placeholder="05XXXXXXXX" />
            <label style={label}>العنوان الكامل للجامعة</label>
            <textarea value={form.address} onChange={(e) => setForm({...form, address: e.target.value})} style={{ ...input, minHeight: "80px" }} placeholder="اليمن - صنعاء - شارع الجامعة" />
          </div>
        );

      case "notifications":
        return (
          <div>
            <h3 style={{ margin: "0 0 16px 0", color: primary, fontSize: "15px", fontWeight: 700 }}>إعدادات الإشعارات</h3>
            <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "13px", marginBottom: "16px" }}>
              <input type="checkbox" checked={form.notifications_enabled} onChange={(e) => setForm({...form, notifications_enabled: e.target.checked})} />
              <span style={{ color: "#333" }}>تفعيل الإشعارات</span>
            </label>
            <label style={label}>بريد الإشعارات</label>
            <input type="email" value={form.notification_email} onChange={(e) => setForm({...form, notification_email: e.target.value})} style={input} />
            <label style={label}>SMTP الخادم</label>
            <input type="text" value={form.smtp_host} onChange={(e) => setForm({...form, smtp_host: e.target.value})} style={input} />
            <div style={{ display: "flex", gap: "10px" }}>
              <div style={{ flex: 1 }}><label style={label}>المنفذ</label><input type="number" value={form.smtp_port} onChange={(e) => setForm({...form, smtp_port: e.target.value})} style={input} /></div>
              <div style={{ flex: 1 }}><label style={label}>اسم المستخدم</label><input type="text" value={form.smtp_user} onChange={(e) => setForm({...form, smtp_user: e.target.value})} style={input} /></div>
            </div>
            <label style={label}>كلمة مرور SMTP</label>
            <input type="password" value={form.smtp_pass} onChange={(e) => setForm({...form, smtp_pass: e.target.value})} style={input} />
          </div>
        );

      case "grades":
        return (
          <div>
            <h3 style={{ margin: "0 0 16px 0", color: primary, fontSize: "15px", fontWeight: 700 }}>إعدادات توزيع الدرجات (%)</h3>
            <p style={{ fontSize: "12px", color: "#888", marginBottom: "12px" }}>النسبة الافتراضية لكل مكون من مكونات التقييم</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              {[
                { key: "attendance_weight", label: "الحضور" },
                { key: "assignments_weight", label: "التكاليف" },
                { key: "quizzes_weight", label: "الكويزات" },
                { key: "midterm_weight", label: "الامتحان النصفي" },
                { key: "final_weight", label: "الامتحان النهائي" },
              ].map((item) => (
                <div key={item.key}>
                  <label style={label}>{item.label}</label>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <input type="range" min="0" max="100" value={(form as any)[item.key]} onChange={(e) => setForm({...form, [item.key]: parseInt(e.target.value)})} style={{ flex: 1 }} />
                    <span style={{ fontSize: "14px", fontWeight: 700, color: primary, minWidth: "30px" }}>{(form as any)[item.key]}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "term":
        return (
          <div>
            <h3 style={{ margin: "0 0 16px 0", color: primary, fontSize: "15px", fontWeight: 700 }}>إعدادات السنة والترم</h3>
            <label style={label}>السنة الدراسية الحالية</label>
            <input type="text" value={form.current_year} onChange={(e) => setForm({...form, current_year: e.target.value})} style={input} placeholder="مثال: 2025-2026" />
            <label style={label}>الترم الحالي</label>
            <input type="text" value={form.current_term} onChange={(e) => setForm({...form, current_term: e.target.value})} style={input} placeholder="الترم الأول / الثاني" />
            <label style={label}>تاريخ بداية الترم</label>
            <input type="date" value={form.term_start} onChange={(e) => setForm({...form, term_start: e.target.value})} style={input} />
            <label style={label}>تاريخ نهاية الترم</label>
            <input type="date" value={form.term_end} onChange={(e) => setForm({...form, term_end: e.target.value})} style={input} />
          </div>
        );

      case "files":
        return (
          <div>
            <h3 style={{ margin: "0 0 16px 0", color: primary, fontSize: "15px", fontWeight: 700 }}>إعدادات رفع الملفات</h3>
            <label style={label}>الحد الأقصى لحجم الملف (ميغابايت)</label>
            <input type="number" value={form.max_file_size} onChange={(e) => setForm({...form, max_file_size: parseInt(e.target.value)})} style={input} min="1" max="100" />
            <label style={label}>أنواع الملفات المسموح بها</label>
            <input type="text" value={form.allowed_file_types} onChange={(e) => setForm({...form, allowed_file_types: e.target.value})} style={input} placeholder="pdf,doc,docx,jpg,png,zip" />
            <p style={{ fontSize: "12px", color: "#888" }}>افصل بين الامتدادات بفاصلة</p>
          </div>
        );

      default: return null;
    }
  };

  if (loading) return <div style={pageContainer}><p style={{ textAlign: "center", color: "#888" }}>جاري التحميل...</p></div>;

  return (
    <div style={pageContainer}>
      <div style={headerRow}>
        <h2 style={{ color: primary, margin: 0, fontSize: "24px", fontWeight: 700 }}><Settings size={24} style={{ marginLeft: 8 }} /> إعدادات النظام</h2>
      </div>

      {msg && <div style={{ background: msgType === "success" ? "#d4edda" : "#f8d7da", color: msgType === "success" ? "#155724" : "#721c24", padding: "10px", borderRadius: "8px", marginBottom: "15px", fontSize: "13px" }}>{msg}</div>}

      <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
        {sectionBtn("general", "عامة")}
        {sectionBtn("notifications", "الإشعارات")}
        {sectionBtn("grades", "الدرجات")}
        {sectionBtn("term", "السنة والترم")}
        {sectionBtn("files", "الملفات")}
      </div>

      <div style={{ ...cardStyle, maxWidth: "700px" }}>
        {renderSection()}
        <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
          <button onClick={handleSave} disabled={saving} style={{ ...btnPrimary, opacity: saving ? 0.7 : 1 }}>{saving ? "جاري الحفظ..." : <><Save size={16} style={{ marginLeft: 6 }} /> حفظ الإعدادات</>}</button>
        </div>
      </div>
    </div>
  );
};

// ================= التقارير =================
const reportTypes = [
  { id: "users", title: "تقرير المستخدمين", description: "جميع المستخدمين", icon: <Users size={22} /> },
  { id: "students", title: "تقرير الطلاب", description: "إحصائيات الطلاب", icon: <Users size={22} /> },
  { id: "doctors", title: "تقرير الدكاترة", description: "إحصائيات الدكاترة", icon: <Award size={22} /> },
  { id: "college_managers", title: "تقرير مدراء الكليات", description: "إحصائيات المدراء", icon: <Shield size={22} /> },
  { id: "system_admins", title: "تقرير مدراء النظام", description: "إحصائيات المدراء", icon: <Shield size={22} /> },
  { id: "colleges", title: "تقرير الكليات", description: "إحصائيات الكليات", icon: <Building2 size={22} /> },
  { id: "subjects", title: "تقرير المواد", description: "المواد الدراسية", icon: <BookOpen size={22} /> },
  { id: "course_offerings", title: "تقرير المقررات", description: "المقررات المطروحة", icon: <ClipboardList size={22} /> },
  { id: "roles", title: "تقرير الأدوار", description: "الأدوار والصلاحيات", icon: <Shield size={22} /> },
  { id: "terms", title: "تقرير الأترام", description: "الأترام الدراسية", icon: <Calendar size={22} /> },
];

const ReportsPage: React.FC = () => {
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [currentTitle, setCurrentTitle] = useState("");
  const [currentType, setCurrentType] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [colleges, setColleges] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [, setTerms] = useState<any[]>([]);
  const [filters, setFilters] = useState<any>({});
  const [availableLevels, setAvailableLevels] = useState<number[]>([]);

  const loadLevels = async (deptId?: string, collegeId?: string) => {
    try {
      const params = new URLSearchParams();
      if (deptId) params.append('department_id', deptId);
      if (collegeId && !deptId) params.append('college_id', collegeId);
      const res = await fetch(`${LARAVEL_API}/admin/department-levels?${params}`);
      const data = await res.json();
      if (data.success) setAvailableLevels(data.data);
    } catch { setAvailableLevels([]); }
  };

  const reportFilterConfig: Record<string, any[]> = {
    users: [
      { key: "status", label: "الحالة", type: "select", options: [{ value: "", label: "الجميع" }, { value: "active", label: "نشط فقط" }, { value: "inactive", label: "غير نشط فقط" }] },
      { key: "role", label: "الدور", type: "select", options: [{ value: "", label: "الجميع" }, { value: "system_admin", label: "مدير نظام" }, { value: "college_manager", label: "مدير كلية" }, { value: "doctor", label: "دكتور" }, { value: "student", label: "طالب" }] },
      { key: "from", label: "من تاريخ", type: "date" },
      { key: "to", label: "إلى تاريخ", type: "date" },
    ],
    students: [
      { key: "college_id", label: "الكلية", type: "college_select" },
      { key: "department_id", label: "القسم", type: "department_select" },
      { key: "level", label: "المستوى", type: "level_select" },
      { key: "study_type", label: "نوع الدراسة", type: "select", options: [{ value: "", label: "الجميع" }, { value: "General", label: "عام" }, { value: "Paid", label: "نفقة خاصة" }] },
      { key: "from", label: "من تاريخ", type: "date" },
      { key: "to", label: "إلى تاريخ", type: "date" },
    ],
    doctors: [
      { key: "college_id", label: "الكلية", type: "college_select" },
      { key: "department_id", label: "القسم", type: "department_select" },
      { key: "search", label: "اسم الدكتور", type: "text", placeholder: "البحث باسم الدكتور" },
      { key: "from", label: "من تاريخ", type: "date" },
      { key: "to", label: "إلى تاريخ", type: "date" },
    ],
    subjects: [
      { key: "college_id", label: "الكلية", type: "college_select" },
      { key: "department_id", label: "القسم", type: "department_select" },
      { key: "level", label: "المستوى الدراسي", type: "level_select" },
      { key: "study_type", label: "نوع الدراسة", type: "select", options: [{ value: "", label: "الجميع" }, { value: "general", label: "عام" }, { value: "paid", label: "نفقة (خاص)" }] },
    ],
    activities: [
      { key: "user_id", label: "المستخدم", type: "text", placeholder: "اسم المستخدم" },
      { key: "from", label: "من تاريخ", type: "date" },
      { key: "to", label: "إلى تاريخ", type: "date" },
    ],
  };

  const fetchLookups = async () => {
    try {
      const [cRes, tRes] = await Promise.all([
        fetch(`${LARAVEL_API}/admin/colleges-for-select`),
        fetch(`${LARAVEL_API}/admin/terms`),
      ]);
      const cData = await cRes.json();
      const tData = await tRes.json();
      if (cData.success) setColleges(cData.data);
      if (tData.success) setTerms(tData.data);
      if (cData.success) {
        const dPromises = cData.data.map((c: any) =>
          fetch(`${LARAVEL_API}/admin/departments?college_id=${c.id}`).then(r => r.json())
        );
        const dResults = await Promise.all(dPromises);
        const allDepts = dResults.flatMap((d: any) => d.success ? d.data : []);
        setDepartments(allDepts);
      }
    } catch {}
  };

  useEffect(() => { fetchLookups(); }, []);

  const openFilter = (type: string, title: string) => {
    setCurrentType(type);
    setCurrentTitle(title);
    setFilters({});
    setShowFilter(true);
  };

  const fetchReport = async (type: string, title: string, filterParams: any) => {
    setLoading(true);
    setCurrentTitle(title);
    setCurrentType(type);
    setSearchTerm("");
    setShowReport(true);
    setShowFilter(false);
    try {
      const params = new URLSearchParams();
      Object.entries(filterParams).forEach(([k, v]) => { if (v) params.append(k, String(v)); });
      const url = `${LARAVEL_API}/admin/reports/${type}?${params}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) setReportData(data);
      else { setReportData(null); alert(data.message); }
    } catch { setReportData(null); alert("خطأ في تحميل التقرير"); }
    finally { setLoading(false); }
  };

  const deptsForFilterCollege = departments.filter((d: any) => d.college_id === parseInt(filters.college_id));

  const renderFilterField = (field: any) => {
    const common = { ...inputStyle, marginBottom: "10px" };
    if (field.type === "select") {
      return (
        <select value={filters[field.key] || ""} onChange={(e) => setFilters({...filters, [field.key]: e.target.value})} style={common}>
          {field.options.map((o: any) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      );
    }
    if (field.type === "college_select") {
      return (
        <select value={filters.college_id || ""} onChange={(e) => { setFilters({...filters, college_id: e.target.value, department_id: "", level: "" }); setAvailableLevels([]); if (e.target.value) loadLevels(undefined, e.target.value); }} style={common}>
          <option value="">جميع الكليات</option>
          {colleges.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      );
    }
    if (field.type === "department_select") {
      return (
        <select value={filters.department_id || ""} onChange={(e) => { setFilters({...filters, department_id: e.target.value, level: "" }); if (e.target.value) loadLevels(e.target.value); }} style={common}>
          <option value="">جميع الأقسام</option>
          {deptsForFilterCollege.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
      );
    }
    if (field.type === "level_select") {
      return (
        <select value={filters.level || ""} onChange={(e) => setFilters({...filters, level: e.target.value})} style={common}>
          <option value="">جميع المستويات</option>
          {(availableLevels.length > 0 ? availableLevels : [1,2,3,4,5,6,7,8]).map(l => <option key={l} value={l}>المستوى {l}</option>)}
        </select>
      );
    }
    if (field.type === "date") {
      return <input type="date" value={filters[field.key] || ""} onChange={(e) => setFilters({...filters, [field.key]: e.target.value})} style={common} />;
    }
    return <input type="text" placeholder={field.placeholder || ""} value={filters[field.key] || ""} onChange={(e) => setFilters({...filters, [field.key]: e.target.value})} style={common} />;
  };

  const exportCSV = async (type: string, title: string) => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => { if (v) params.append(k, String(v)); });
      const qs = params.toString();
      const url = `${LARAVEL_API}/admin/reports/${type}/csv${qs ? '?' + qs : ''}`;
      const res = await fetch(url);
      if (!res.ok) { const err = await res.json(); alert(err.message || "فشل التصدير"); return; }
      const blob = await res.blob();
      const link = document.createElement("a");
      const urlObj = URL.createObjectURL(blob);
      link.href = urlObj;
      link.setAttribute("download", `${type}_report_${new Date().toISOString().slice(0,10)}.csv`);
      document.body.appendChild(link); link.click();
      document.body.removeChild(link); URL.revokeObjectURL(urlObj);
      alert(`تم تصدير ${title} بنجاح`);
    } catch { alert("خطأ في تصدير التقرير"); }
  };

  const printReport = () => { window.print(); };

  const filteredData = reportData?.data?.filter((row: any) => {
    if (!searchTerm) return true;
    return Object.values(row).some((val: any) =>
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    );
  }) || [];

  return (
    <div style={pageContainer}>
      <h2 style={pageTitleStyle}><BarChart3 size={24} style={{ marginLeft: 8 }} /> التقارير والإحصائيات</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "16px" }}>
        {reportTypes.map((r) => (
          <div key={r.id} style={cardStyle}>
            <div style={{ width: "44px", height: "44px", borderRadius: "10px", background: "rgba(29, 76, 79, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "12px" }}>
              <span style={{ color: primary, display: "flex" }}>{r.icon}</span>
            </div>
            <h3 style={{ margin: "0 0 6px 0", color: "#333", fontSize: "15px" }}>{r.title}</h3>
            <p style={{ color: "#888", fontSize: "13px", marginBottom: "16px" }}>{r.description}</p>
            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={() => openFilter(r.id, r.title)} style={btnPrimary}><Eye size={14} style={{ marginLeft: 4 }} /> عرض</button>
              <button onClick={() => exportCSV(r.id, r.title)} style={btnOutline}><Download size={14} style={{ marginLeft: 4 }} /> CSV</button>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Modal */}
      {showFilter && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#fff", padding: "24px", borderRadius: "12px", width: "460px", boxShadow: "0 8px 30px rgba(0,0,0,0.15)" }}>
            <h3 style={{ color: "#333", marginTop: 0, fontSize: "16px", marginBottom: "16px" }}><BarChart3 size={18} style={{ marginLeft: 6 }} /> إعدادات {currentTitle}</h3>
            {(reportFilterConfig[currentType] || []).map((field: any) => (
              <div key={field.key}>
                <label style={{ display: "block", fontWeight: 600, marginBottom: "4px", color: "#333", fontSize: "13px" }}>{field.label}</label>
                {renderFilterField(field)}
              </div>
            ))}
            <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
              <button onClick={() => fetchReport(currentType, currentTitle, filters)} style={{ flex: 1, ...btnPrimary }}><Eye size={14} style={{ marginLeft: 4 }} /> عرض التقرير</button>
              <button onClick={() => setShowFilter(false)} style={{ flex: 1, background: "#eee", color: "#333", border: "none", padding: "10px", borderRadius: "8px", cursor: "pointer" }}>إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReport && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, overflowY: "auto" }}>
          <div style={{ background: "#fff", borderRadius: "12px", width: "80%", maxWidth: "900px", maxHeight: "85vh", display: "flex", flexDirection: "column", boxShadow: "0 8px 30px rgba(0,0,0,0.15)" }}>
            <div style={{ background: primary, padding: "16px 20px", color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, fontSize: "16px" }}><BarChart3 size={18} style={{ marginLeft: 6 }} /> {currentTitle} {Object.keys(filters).length > 0 && <span style={{ fontSize: "12px", opacity: 0.8 }}>(مع فلتر)</span>}</h3>
              <div style={{ display: "flex", gap: "8px" }}>
                <button onClick={() => { setShowReport(false); setShowFilter(true); }} style={{ background: "rgba(255,255,255,0.15)", color: "#fff", border: "none", padding: "6px 14px", borderRadius: "6px", cursor: "pointer", fontSize: "13px" }}>تغيير الفلتر</button>
                <button onClick={() => setShowReport(false)} style={{ background: "rgba(255,255,255,0.15)", color: "#fff", border: "none", padding: "6px 14px", borderRadius: "6px", cursor: "pointer", fontSize: "13px" }}>✕ إغلاق</button>
              </div>
            </div>
            {loading ? (
              <div style={{ padding: "40px", textAlign: "center", color: "#888" }}>جاري تحميل التقرير...</div>
            ) : reportData && reportData.data ? (
              <>
                {reportData.summary && (
                  <div style={{ padding: "16px 20px", background: "#f7f9fb", borderBottom: "1px solid #f0f0f0" }}>
                    <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                      {Object.entries(reportData.summary).map(([key, value]) => (
                        <div key={key} style={{ background: "#fff", padding: "10px 18px", borderRadius: "8px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                          <p style={{ margin: 0, fontSize: "11px", color: "#888" }}>{key}</p>
                          <h4 style={{ margin: "4px 0 0 0", color: primary, fontSize: "16px" }}>{String(value)}</h4>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div style={{ padding: "12px 20px", borderBottom: "1px solid #f0f0f0", display: "flex", gap: "8px", alignItems: "center" }}>
                  <div style={{ position: "relative", flex: 1 }}>
                    <Search size={14} style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", color: "#aaa" }} />
                    <input type="text" placeholder="بحث في التقرير..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                      style={{ width: "100%", padding: "8px 30px 8px 12px", borderRadius: "6px", border: "1px solid #ddd", fontSize: "13px", boxSizing: "border-box" }} />
                  </div>
                  <button onClick={() => exportCSV(currentType, currentTitle)} style={btnOutline}><Download size={14} style={{ marginLeft: 4 }} /> CSV</button>
                  <button onClick={printReport} style={btnOutline}><FileText size={14} style={{ marginLeft: 4 }} /> طباعة</button>
                </div>
                <div style={{ padding: "20px", overflowX: "auto", flex: 1 }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "right", fontSize: "13px" }}>
                    <thead>
                      <tr style={{ background: "#f7f9fb", borderBottom: "2px solid #e0e0e0" }}>
                        {filteredData.length > 0 && Object.keys(filteredData[0]).map((col: string, i: number) => (
                          <th key={i} style={{ padding: "10px 12px", color: "#333", fontWeight: 600 }}>{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.map((row: any, i: number) => (
                        <tr key={i} style={{ borderBottom: "1px solid #f0f0f0" }}>
                          {Object.keys(filteredData[0] || {}).map((col: string, j: number) => (
                            <td key={j} style={{ padding: "10px 12px", color: "#555" }}>{row[col] ?? "—"}</td>
                          ))}
                        </tr>
                      ))}
                      {filteredData.length === 0 && (
                        <tr><td colSpan={100} style={{ padding: "30px", textAlign: "center", color: "#888" }}>لا توجد نتائج للبحث</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div style={{ padding: "40px", textAlign: "center", color: "#888" }}>لا توجد بيانات</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ================= سجل العمليات =================
const ACTION_LIST = [
  "جميع الإجراءات",
  // إدارة المستخدمين
  "إنشاء حساب", "تعديل حساب", "حذف حساب", "تفعيل حساب", "تعطيل حساب", "إعادة تعيين كلمة المرور",
  // الارتباطات
  "قبول طلب ارتباط", "رفض طلب ارتباط", "إلغاء ارتباط طالب", "ربط مادة", "فك ارتباط مادة",
  // الأقسام والكليات
  "إنشاء كلية", "تعديل كلية", "حذف كلية", "إنشاء قسم", "تعديل قسم", "حذف قسم",
  // المواد
  "إنشاء مادة", "تعديل مادة", "حذف مادة",
  // الإعلانات والإشعارات
  "إرسال إعلان", "حذف إعلان", "إرسال إشعار عام",
  // النظام
  "تسجيل دخول", "تسجيل خروج", "تعديل إعدادات النظام", "تعديل إعدادات المادة", "تفعيل ترم", "إلغاء تفعيل ترم",
];

const AuditLogPage: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({ action: "", from_date: "", to_date: "" });
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [showExport, setShowExport] = useState(false);

  const fetchLogs = useCallback(async (p: number = 1) => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (filters.action && filters.action !== "جميع الإجراءات") params.append("action", filters.action);
      if (filters.from_date) params.append("from_date", filters.from_date);
      if (filters.to_date) params.append("to_date", filters.to_date);
      params.append("page", String(p));
      params.append("per_page", "100");
      const res = await fetch(`${LARAVEL_API}/admin/audit-logs?${params}`);
      const data = await res.json();
      if (data.success) { setLogs(data.data); setTotal(data.total); setPage(data.page); }
      else setError(data.message);
    } catch { setError("خطأ في تحميل السجل"); }
    finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { fetchLogs(1); }, [fetchLogs]);

  const handleShowReport = () => fetchLogs(1);

  const doExport = async (format: string) => {
    setShowExport(false);
    try {
      const params = new URLSearchParams();
      if (filters.action && filters.action !== "جميع الإجراءات") params.append("action", filters.action);
      if (filters.from_date) params.append("from_date", filters.from_date);
      if (filters.to_date) params.append("to_date", filters.to_date);
      const res = await fetch(`${LARAVEL_API}/admin/audit-logs/${format}?${params}`);
      if (!res.ok) { alert("خطأ في التصدير"); return; }
      const blob = await res.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.setAttribute("download", `audit_logs.${format}`);
      document.body.appendChild(link); link.click();
      document.body.removeChild(link); URL.revokeObjectURL(link.href);
    } catch { alert("خطأ في التصدير"); }
  };

  const totalPages = Math.ceil(total / 100);

  return (
    <div style={pageContainer}>
      <div style={headerRow}>
        <h2 style={{ color: primary, margin: 0, fontSize: "24px", fontWeight: 700 }}><FileText size={24} style={{ marginLeft: 8 }} /> سجل العمليات</h2>
        <div style={{ display: "flex", gap: "8px", position: "relative" as const }}>
          <button onClick={handleShowReport} style={btnPrimary}><Eye size={16} style={{ marginLeft: 6 }} /> عرض التقرير</button>
          <button onClick={() => setShowExport(!showExport)} style={btnOutline}><Download size={16} style={{ marginLeft: 6 }} /> تصدير</button>
          {showExport && (
            <div style={{ position: "absolute", top: "100%", left: 0, marginTop: 4, background: "#fff", borderRadius: 8, boxShadow: "0 4px 16px rgba(0,0,0,0.15)", zIndex: 100, overflow: "hidden", minWidth: 120 }}>
              <div onClick={() => doExport("pdf")} style={{ padding: "10px 16px", cursor: "pointer", fontSize: 13, borderBottom: "1px solid #f0f0f0" }}>PDF</div>
              <div onClick={() => doExport("xlsx")} style={{ padding: "10px 16px", cursor: "pointer", fontSize: 13, borderBottom: "1px solid #f0f0f0" }}>Excel</div>
              <div onClick={() => doExport("csv")} style={{ padding: "10px 16px", cursor: "pointer", fontSize: 13 }}>CSV</div>
            </div>
          )}
        </div>
      </div>

      <div style={{ display: "flex", gap: "10px", marginBottom: "15px", flexWrap: "wrap", alignItems: "end" }}>
        <div>
          <label style={{ display: "block", fontSize: 11, color: textGray, marginBottom: 4 }}>نوع العملية</label>
          <select value={filters.action} onChange={(e) => setFilters({ ...filters, action: e.target.value })} style={{ ...inputStyle, width: "200px" }}>
            {ACTION_LIST.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
        <div>
          <label style={{ display: "block", fontSize: 11, color: textGray, marginBottom: 4 }}>من تاريخ</label>
          <input type="date" value={filters.from_date} onChange={(e) => setFilters({ ...filters, from_date: e.target.value })} style={{ ...inputStyle, width: "150px" }} />
        </div>
        <div>
          <label style={{ display: "block", fontSize: 11, color: textGray, marginBottom: 4 }}>إلى تاريخ</label>
          <input type="date" value={filters.to_date} onChange={(e) => setFilters({ ...filters, to_date: e.target.value })} style={{ ...inputStyle, width: "150px" }} />
        </div>
      </div>

      {total > 0 && <p style={{ fontSize: 12, color: textGray, marginBottom: 10 }}>إجمالي السجلات: {total}</p>}

      {error && <div style={{ background: "#f8d7da", color: "#721c24", padding: "10px", borderRadius: "8px", marginBottom: "15px", fontSize: "13px" }}>{error}</div>}

      {loading ? (
        <p style={{ textAlign: "center", color: "#888" }}>جاري التحميل...</p>
      ) : (
        <div style={{ ...cardStyle, padding: 0, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "right", fontSize: "13px" }}>
            <thead>
              <tr style={{ background: "#f7f9fb", borderBottom: "2px solid #e0e0e0" }}>
                <th style={{ padding: "12px 15px", color: "#333", fontWeight: 600, whiteSpace: "nowrap" }}>اسم المستخدم</th>
                <th style={{ padding: "12px 15px", color: "#333", fontWeight: 600, whiteSpace: "nowrap" }}>نوع العملية</th>
                <th style={{ padding: "12px 15px", color: "#333", fontWeight: 600, whiteSpace: "nowrap" }}>الوصف</th>
                <th style={{ padding: "12px 15px", color: "#333", fontWeight: 600, whiteSpace: "nowrap" }}>التاريخ</th>
                <th style={{ padding: "12px 15px", color: "#333", fontWeight: 600, whiteSpace: "nowrap" }}>الوقت</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: "30px", textAlign: "center", color: "#888" }}>لا توجد سجلات — اختر الفلاتر واضغط "عرض التقرير"</td></tr>
              ) : (
                logs.map((log: any) => {
                  const d = new Date(log.created_at);
                  const dateStr = d.toLocaleDateString("en-CA");
                  const timeStr = d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
                  return (
                    <tr key={log.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                      <td style={{ padding: "10px 15px", color: "#333", whiteSpace: "nowrap" }}>{log.user_name}</td>
                      <td style={{ padding: "10px 15px", color: "#333", whiteSpace: "nowrap" }}>{log.action}</td>
                      <td style={{ padding: "10px 15px", color: "#888", fontSize: "12px", maxWidth: 250, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={log.details}>{log.details}</td>
                      <td style={{ padding: "10px 15px", color: "#888", fontSize: "12px", whiteSpace: "nowrap" }}>{dateStr}</td>
                      <td style={{ padding: "10px 15px", color: "#888", fontSize: "12px", whiteSpace: "nowrap" }}>{timeStr}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 15 }}>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => fetchLogs(p)} style={{
              ...(p === page ? btnPrimary : btnOutlineSmall),
              minWidth: 36, textAlign: "center", padding: "6px 12px",
            }}>{p}</button>
          ))}
        </div>
      )}
    </div>
  );
};

// ================= الملف الشخصي =================
const ProfilePage: React.FC = () => {
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState({ 
    name: "مدير النظام", 
    email: "", 
    phone: "", 
    role: "مدير النظام", 
    department: "تقنية المعلومات", 
    bio: "" 
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [saving, setSaving] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [pwdForm, setPwdForm] = useState({ current: "", newPwd: "", confirm: "" });
  const [pwdMsg, setPwdMsg] = useState("");
  const [pwdSaving, setPwdSaving] = useState(false);
  const [qrExpanded, setQrExpanded] = useState(false);

  const userData = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = userData.id;

  const roleNames: Record<string, string> = {
    system_admin: "مدير النظام",
    college_manager: "مدير كلية",
    doctor: "دكتور",
    student: "طالب",
    admin: "مدير النظام",
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${LARAVEL_API}/users/${userId}`);
        const data = await res.json();
        if (data.id) {
          setProfile({
            name: data.name || userData.name || "",
            email: data.email || "",
            phone: userData.phone || "",
            role: roleNames[data.role] || data.role || roleNames[userData.role] || "",
            department: data.department_name || "",
            bio: "",
          });
        }
      } catch {
        if (userData.name) {
          setProfile(prev => ({
            ...prev,
            name: userData.name,
            email: userData.email || "",
            role: roleNames[userData.role] || userData.role || prev.role,
          }));
        }
      } finally {
        setLoading(false);
      }
    };
    if (userId) fetchProfile();
    else setLoading(false);
  }, [userId]);

  const handleUpdate = async () => {
    setSaving(true);
    setError("");
    setSuccessMsg("");
    try {
      const res = await fetch(`${LARAVEL_API}/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: profile.email, phone: profile.phone }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg("تم تحديث البيانات بنجاح");
        setEditing(false);
      } else {
        setError(data.message || "فشل التحديث");
      }
    } catch {
      setError("خطأ في الاتصال بالسيرفر");
    } finally {
      setSaving(false);
    }
  };

  const handlePwdChange = async () => {
    if (pwdForm.newPwd !== pwdForm.confirm) { setPwdMsg("كلمة المرور الجديدة غير متطابقة"); return; }
    if (pwdForm.newPwd.length < 6) { setPwdMsg("كلمة المرور يجب أن تكون 6 أحرف على الأقل"); return; }
    setPwdSaving(true);
    setPwdMsg("");
    setSuccessMsg("");
    try {
      const res = await fetch(`${LARAVEL_API}/users/${userId}/password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ current_password: pwdForm.current, new_password: pwdForm.newPwd }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg("تم تغيير كلمة المرور بنجاح");
        setPwdForm({ current: "", newPwd: "", confirm: "" });
      } else {
        setPwdMsg(data.message || "فشل تغيير كلمة المرور");
      }
    } catch {
      setPwdMsg("خطأ في الاتصال بالسيرفر");
    } finally {
      setPwdSaving(false);
    }
  };

  const inputStyle2 = { width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #ddd", color: "#000", fontSize: "13px", boxSizing: "border-box" as const };
  const card2 = { background: "#fff", padding: "20px", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" };

  if (loading) {
    return <div style={{ padding: "20px", textAlign: "center", color: "#888", fontSize: "14px" }}>جاري تحميل البيانات...</div>;
  }

  return (
    <div style={{ padding: "20px", width: "100%", boxSizing: "border-box" as const }}>
      <h2 style={{ margin: "0 0 20px 0", color: primary, fontSize: "24px", fontWeight: 700 }}><UserCircle size={20} style={{ marginLeft: 8 }} /> الملف الشخصي</h2>

      {error && <div style={{ background: "#f8d7da", color: "#721c24", padding: "10px", borderRadius: "8px", marginBottom: "15px", fontSize: "13px" }}>{error}</div>}
      {successMsg && <div style={{ background: "#d4edda", color: "#155724", padding: "10px", borderRadius: "8px", marginBottom: "15px", fontSize: "13px" }}>{successMsg}</div>}

      <div style={{ ...card2, marginBottom: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "20px" }}>
          <div style={{ width: "70px", height: "70px", borderRadius: "12px", background: primary, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "28px", fontWeight: "bold" }}>
            {profile.name.charAt(0)}
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: "18px" }}>{profile.name}</h3>
            <p style={{ margin: "4px 0 0 0", color: "#888", fontSize: "13px" }}>{profile.role}</p>
          </div>
        </div>
        <table style={{ width: "100%", fontSize: "13px" }}>
          <tbody>
            <tr><td style={{ padding: "6px 0", color: "#888", width: "120px" }}>رقم المستخدم</td><td style={{ padding: "6px 0", fontWeight: 600 }}>{userId || "—"}</td></tr>
            <tr><td style={{ padding: "6px 0", color: "#888" }}>البريد الإلكتروني</td><td style={{ padding: "6px 0", fontWeight: 600 }}>{profile.email || "—"}</td></tr>
            <tr><td style={{ padding: "6px 0", color: "#888" }}>رقم الهاتف</td><td style={{ padding: "6px 0", fontWeight: 600 }}>{profile.phone || "—"}</td></tr>
            <tr><td style={{ padding: "6px 0", color: "#888" }}>القسم</td><td style={{ padding: "6px 0", fontWeight: 600 }}>{profile.department || "—"}</td></tr>
          </tbody>
        </table>
      </div>

      <div style={{ ...card2, marginBottom: "20px" }}>
        <h3 style={{ margin: "0 0 12px 0", fontSize: "15px", color: "#333" }}><Pencil size={16} style={{ marginLeft: 6 }} /> تحديث البيانات</h3>
        {editing ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <input type="email" placeholder="البريد الإلكتروني" value={profile.email} onChange={e => setProfile({...profile, email: e.target.value})} style={inputStyle2} />
            <input type="text" placeholder="رقم الهاتف" value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})} style={inputStyle2} />
            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={handleUpdate} disabled={saving} style={{ flex: 1, background: primary, color: "#fff", border: "none", padding: "10px", borderRadius: "8px", cursor: "pointer", fontWeight: 600, opacity: saving ? 0.7 : 1 }}>
                {saving ? "جاري الحفظ..." : "حفظ"}
              </button>
              <button onClick={() => setEditing(false)} style={{ flex: 1, background: "#eee", color: "#333", border: "none", padding: "10px", borderRadius: "8px", cursor: "pointer" }}>إلغاء</button>
            </div>
          </div>
        ) : (
          <button onClick={() => { setEditing(true); setError(""); setSuccessMsg(""); }} style={{ width: "100%", background: "#f0f3f6", border: "1px solid #ddd", padding: "10px", borderRadius: "8px", textAlign: "center", cursor: "pointer", color: "#333", fontSize: "13px" }}>
            تعديل البيانات
          </button>
        )}
      </div>

      <div style={{ ...card2, marginBottom: "20px" }}>
        <h3 style={{ margin: "0 0 12px 0", fontSize: "15px", color: "#333" }}><Lock size={16} style={{ marginLeft: 6 }} /> تغيير كلمة المرور</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <input type={showPwd ? "text" : "password"} placeholder="كلمة المرور الحالية" value={pwdForm.current} onChange={e => setPwdForm({...pwdForm, current: e.target.value})} style={inputStyle2} />
          <input type={showPwd ? "text" : "password"} placeholder="كلمة المرور الجديدة" value={pwdForm.newPwd} onChange={e => setPwdForm({...pwdForm, newPwd: e.target.value})} style={inputStyle2} />
          <input type={showPwd ? "text" : "password"} placeholder="تأكيد كلمة المرور" value={pwdForm.confirm} onChange={e => setPwdForm({...pwdForm, confirm: e.target.value})} style={inputStyle2} />
          <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#888", cursor: "pointer" }}>
            <input type="checkbox" checked={showPwd} onChange={() => setShowPwd(!showPwd)} /> إظهار كلمة المرور
          </label>
          {pwdMsg && <p style={{ margin: 0, fontSize: "12px", color: "#dc3545" }}>{pwdMsg}</p>}
          <button onClick={handlePwdChange} disabled={pwdSaving} style={{ width: "100%", background: primary, color: "#fff", border: "none", padding: "10px", borderRadius: "8px", cursor: "pointer", fontWeight: 600, opacity: pwdSaving ? 0.7 : 1 }}>
            {pwdSaving ? "جاري التغيير..." : "تغيير كلمة المرور"}
          </button>
        </div>
      </div>

      {/* QR Code */}
      <div style={{ ...card2, marginBottom: "20px" }}>
        <h3 style={{ margin: "0 0 12px 0", fontSize: "15px", color: "#333" }}><QrCode size={16} style={{ marginLeft: 6 }} /> QR Code الشخصي</h3>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
          <div onClick={() => setQrExpanded(!qrExpanded)} style={{ cursor: "pointer" }}>
            <QRCodeCanvas value={String(userId)} size={qrExpanded ? 250 : 150} style={{ borderRadius: "8px" }} />
          </div>
          <p style={{ margin: 0, fontSize: "12px", color: "#888" }}>Personal Token: <strong>{userId}</strong></p>
          <p style={{ margin: 0, fontSize: "11px", color: "#aaa" }}>اضغط على QR للتكبير</p>
        </div>
      </div>
    </div>
  );
};

// ================= Announcements Page =================
const AnnouncementsPage: React.FC = () => {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", body: "", target_role: "all", target_college_id: "", target_user_ids: "" });
  const [colleges, setColleges] = useState<any[]>([]);
  const [collegeManagers, setCollegeManagers] = useState<any[]>([]);
  const [selectedManagerIds, setSelectedManagerIds] = useState<Set<number>>(new Set());

  const user = (() => { try { return JSON.parse(localStorage.getItem("user") || "{}"); } catch { return {}; } })();
  const senderId = user.id;

  const fetchAnnouncements = useCallback(async () => {
    try {
      const res = await axios.get(`${LARAVEL_API}/admin/announcements`, { params: { scope: "system" } });
      if (res.data.success) setAnnouncements(res.data.data);
    } catch (e) {
      console.error("Failed to load announcements", e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchColleges = async () => {
    try {
      const res = await axios.get(`${LARAVEL_API}/admin/colleges-for-select`);
      if (res.data.success) setColleges(res.data.data);
    } catch (e) { console.error(e); }
  };

  const fetchCollegeManagers = async () => {
    try {
      const res = await axios.get(`${LARAVEL_API}/admin/college-managers`, { params: { role: "college_manager" } });
      if (res.data.success) setCollegeManagers(res.data.data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchAnnouncements(); fetchColleges(); fetchCollegeManagers(); }, [fetchAnnouncements]);

  const resetForm = () => { setForm({ title: "", body: "", target_role: "all", target_college_id: "", target_user_ids: "" }); setEditingId(null); setSelectedManagerIds(new Set()); };

  const openCreate = () => { resetForm(); setShowForm(true); };

  const openEdit = (a: any) => {
    setForm({ title: a.title, body: a.body, target_role: a.target_role, target_college_id: String(a.target_college_id || ""), target_user_ids: a.target_user_ids || "" });
    setEditingId(a.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.body.trim()) {
      alert("يرجى إدخال عنوان ونص الإعلان");
      return;
    }
    setCreating(true);
    try {
      const targetUserIds = selectedManagerIds.size > 0 ? Array.from(selectedManagerIds).join(",") : null;
      if (editingId) {
        const res = await axios.put(`${LARAVEL_API}/admin/announcements/${editingId}`, {
          title: form.title, body: form.body, target_role: form.target_role, target_college_id: form.target_college_id || null,
        });
        if (res.data.success) { fetchAnnouncements(); setShowForm(false); resetForm(); }
        else alert(res.data.message || "فشل التحديث");
      } else {
        const res = await axios.post(`${LARAVEL_API}/admin/announcements`, {
          sender_id: senderId, sender_role: "system_admin", title: form.title, body: form.body,
          target_role: form.target_role, target_college_id: form.target_college_id || null,
          target_user_ids: targetUserIds,
        });
        if (res.data.success) { fetchAnnouncements(); setShowForm(false); resetForm(); alert(res.data.message || "تم إنشاء الإعلان"); }
        else alert(res.data.message || "فشل الإنشاء");
      }
    } catch (e: any) { alert(e.response?.data?.message || "حدث خطأ"); }
    finally { setCreating(false); }
  };

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`هل أنت متأكد من حذف الإعلان "${title}"؟`)) return;
    try {
      const res = await axios.delete(`${LARAVEL_API}/admin/announcements/${id}`);
      if (res.data.success) fetchAnnouncements();
      else alert(res.data.message || "فشل الحذف");
    } catch (e: any) { alert(e.response?.data?.message || "حدث خطأ"); }
  };

  const targetLabel = (t: string) => {
    const map: Record<string, string> = { college_manager: "مدراء الكليات", doctor: "الدكاترة", student: "الطلاب", all: "الجميع" };
    return map[t] || t;
  };

  return (
    <div style={pageContainer}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2 style={pageTitleStyle}><Bell size={24} style={{ marginLeft: 8 }} /> الإعلانات</h2>
        <button onClick={openCreate} style={btnPrimary}><PlusCircle size={16} style={{ marginLeft: 6 }} /> إعلان جديد</button>
      </div>

      {showForm && (
        <div style={formCardStyle}>
          <h3 style={{ margin: "0 0 15px", color: primary, fontSize: "15px" }}>{editingId ? "تعديل الإعلان" : "إعلان جديد"}</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" }}>
            <input type="text" placeholder="عنوان الإعلان" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} style={inputStyle} />
            <select value={form.target_role} onChange={(e) => setForm({ ...form, target_role: e.target.value })} style={inputStyle}>
              <option value="all">الجميع</option>
              <option value="college_manager">مدراء الكليات</option>
              <option value="doctor">الدكاترة</option>
              <option value="student">الطلاب</option>
            </select>
          </div>
          <textarea placeholder="نص الإعلان" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} style={{ ...inputStyle, minHeight: "120px", marginBottom: "10px" }} />
          {form.target_role === "college_manager" ? (
            <div style={{ marginBottom: "10px" }}>
              <label style={{ fontSize: "13px", color: textGray, display: "block", marginBottom: "6px" }}>مدراء الكليات المستهدفون (اختياري - اضغط Ctrl للتحديد المتعدد):</label>
              <select
                multiple
                value={Array.from(selectedManagerIds).map(String)}
                onChange={(e) => {
                  const next = new Set(Array.from(e.target.selectedOptions).map(o => parseInt(o.value)));
                  setSelectedManagerIds(next);
                }}
                style={{ ...inputStyle, height: "120px", width: "100%" }}
              >
                {collegeManagers.length === 0 ? (
                  <option disabled>لا يوجد مدراء كليات</option>
                ) : (
                  collegeManagers.map((m: any) => (
                    <option key={m.id} value={m.id}>{m.name} ({m.email})</option>
                  ))
                )}
              </select>
            </div>
          ) : (
            <div style={{ display: "flex", gap: "10px", marginBottom: "10px", alignItems: "center" }}>
              <label style={{ fontSize: "13px", color: textGray, whiteSpace: "nowrap" }}>كلية محددة (اختياري):</label>
              <select value={form.target_college_id} onChange={(e) => setForm({ ...form, target_college_id: e.target.value })} style={{ ...inputStyle, width: "250px" }}>
                <option value="">جميع الكليات</option>
                {colleges.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          )}
          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={handleSave} disabled={creating} style={creating ? { ...btnPrimary, opacity: 0.6 } : btnPrimary}>
              <Save size={16} style={{ marginLeft: 6 }} /> {creating ? "جاري الحفظ..." : (editingId ? "تحديث" : "إرسال")}
            </button>
            <button onClick={() => { setShowForm(false); resetForm(); }} style={{ background: bgLight, color: textGray, border: "none", padding: "10px 20px", borderRadius: "8px", cursor: "pointer", fontSize: "13px", display: "flex", alignItems: "center", gap: "6px" }}>
              <X size={16} /> إلغاء
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <p style={{ color: textGray, fontSize: "13px", textAlign: "center", padding: "20px" }}>جاري التحميل...</p>
      ) : announcements.length === 0 ? (
        <p style={{ color: textGray, fontSize: "13px", textAlign: "center", padding: "20px" }}>لا توجد إعلانات</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff", borderRadius: "10px", overflow: "hidden", boxShadow: "0 2px 10px rgba(0,0,0,0.06)" }}>
            <thead>
              <tr style={{ background: primary, color: "#fff" }}>
                <th style={{ padding: "12px 15px", textAlign: "right", fontWeight: 600 }}>#</th>
                <th style={{ padding: "12px 15px", textAlign: "right", fontWeight: 600 }}>العنوان</th>
                <th style={{ padding: "12px 15px", textAlign: "right", fontWeight: 600 }}>تاريخ الإرسال</th>
                <th style={{ padding: "12px 15px", textAlign: "right", fontWeight: 600 }}>الفئة المستهدفة</th>
                <th style={{ padding: "12px 15px", textAlign: "right", fontWeight: 600 }}>الكلية</th>
                <th style={{ padding: "12px 15px", textAlign: "center", fontWeight: 600 }}>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {announcements.map((a: any, idx: number) => (
                <tr key={a.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                  <td style={{ padding: "10px 15px", color: textGray, fontSize: "12px" }}>{idx + 1}</td>
                  <td style={{ padding: "10px 15px", color: textDark, fontWeight: 600 }}>{a.title}</td>
                  <td style={{ padding: "10px 15px", color: textGray, fontSize: "12px" }}>{a.created_at ? new Date(a.created_at).toLocaleDateString('ar-SA') : "—"}</td>
                  <td style={{ padding: "10px 15px" }}>
                    <span style={{ background: "rgba(29,76,79,0.1)", color: primary, padding: "2px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: 600 }}>
                      {targetLabel(a.target_role)}
                    </span>
                  </td>
                  <td style={{ padding: "10px 15px", color: textGray, fontSize: "12px" }}>{a.target_college_name || "الجميع"}</td>
                  <td style={{ padding: "10px 15px", textAlign: "center" }}>
                    <button onClick={() => openEdit(a)} style={{ background: "#f0f4f4", color: primary, border: "none", padding: "6px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "12px", marginLeft: "6px", display: "inline-flex", alignItems: "center", gap: "4px" }}><Pencil size={14} /> تعديل</button>
                    <button onClick={() => handleDelete(a.id, a.title)} style={{ background: "#fef5f5", color: "#dc3545", border: "none", padding: "6px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "12px", display: "inline-flex", alignItems: "center", gap: "4px" }}><Trash2 size={14} /> حذف</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ marginTop: "30px", display: "grid", gridTemplateColumns: "1fr", gap: "12px" }}>
        {announcements.map((a: any) => (
          <div key={`detail-${a.id}`} style={cardStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
              <h4 style={{ margin: 0, color: textDark, fontSize: "15px", fontWeight: 700 }}>{a.title}</h4>
              <div style={{ display: "flex", gap: "6px" }}>
                <span style={{ background: targetLabel(a.target_role) === "الجميع" ? "#e8f5e9" : "rgba(29,76,79,0.1)", color: targetLabel(a.target_role) === "الجميع" ? "#2e7d32" : primary, padding: "2px 10px", borderRadius: "12px", fontSize: "11px", fontWeight: 600 }}>{targetLabel(a.target_role)}</span>
                {a.target_college_name && <span style={{ background: "#fff3e0", color: "#e65100", padding: "2px 10px", borderRadius: "12px", fontSize: "11px", fontWeight: 600 }}>{a.target_college_name}</span>}
              </div>
            </div>
            <p style={{ margin: "0 0 8px", color: textGray, fontSize: "13px", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{a.body}</p>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "11px", color: textGray }}>
              <span>{a.sender_name}</span>
              <span>{a.created_at ? new Date(a.created_at).toLocaleDateString('ar-SA') : ""}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ================= Main App =================
const MainApp: React.FC<{ parentOnLogout?: () => void }> = ({ parentOnLogout }) => {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  return (
    <div style={{ direction: "rtl", fontFamily: "'Cairo', sans-serif", minHeight: "100vh", background: bgLight }}>
      <SystemAdminSidebar onLogout={() => setShowLogoutConfirm(true)} />
      <TopBar />
      <div style={{ marginRight: "260px", padding: "20px" }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/colleges" element={<CollegesPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/roles" element={<RolesPage />} />
          <Route path="/semesters" element={<SemestersPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/announcements" element={<AnnouncementsPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/audit-log" element={<AuditLogPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </div>
      <LogoutConfirmDialog isOpen={showLogoutConfirm} onClose={() => setShowLogoutConfirm(false)} onLogout={parentOnLogout || (() => window.location.href = '/')} />
    </div>
  );
};

// ================= App =================
const App: React.FC<{ onLogout?: () => void }> = ({ onLogout: parentOnLogout }) => {
  return (
    <Router>
      <MainApp parentOnLogout={parentOnLogout} />
    </Router>
  );
};

export default App;