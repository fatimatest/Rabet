import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  LayoutDashboard, Building2, BookOpen, Calendar,
  BarChart3, UserCircle, LogOut, Bell,
  Download, Save, Lock, Pencil, PlusCircle, Trash2, Eye, X,
  ClipboardList, Award, Link2, Layers, GraduationCap,
  Mail, CheckCircle,
  Settings, Search, FileText,
} from "lucide-react";
import SystemLogo from "./components/SystemLogo";
import LogoutConfirmDialog from "./components/LogoutConfirmDialog";
import * as XLSX from "xlsx";

const primary = "#1D4C4F";
const green = "#28a745";
const red = "#dc3545";
const blue = "#0d6efd";
const orange = "#fd7e14";
const cardWhite = "#FFFFFF";
const textDark = "#2C3E3F";
const textGray = "#6B7B6E";
const bgLight = "#f7f9fb";
const cardBg = "#fff";

const cardStyle = { background: cardBg, padding: "20px", borderRadius: "10px", boxShadow: "0 2px 10px rgba(0,0,0,0.06)" };
const formCardStyle = { background: cardBg, padding: "20px", borderRadius: "10px", boxShadow: "0 2px 10px rgba(0,0,0,0.06)", marginBottom: "20px" };
const inputStyle = { width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #e0e0e0", color: "#000", fontSize: "13px", boxSizing: "border-box" as const, background: "#fafafa" };
const pageTitleStyle = { marginBottom: "25px", color: primary, fontSize: "24px", fontWeight: 700 };
const pageContainer = { padding: "24px", marginRight: "260px", color: "#000", width: "calc(100% - 260px)" };
const btnPrimary = { background: primary, color: "#fff", border: "none", padding: "10px 22px", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px", transition: "all 0.2s" };
const btnOutline = { background: "transparent", color: primary, border: `1px solid ${primary}`, padding: "10px 22px", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px" };
const btnDanger = { background: red, color: "#fff", border: "none", padding: "10px 22px", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px" };

const iconBox = (bg: string) => ({ width: "46px", height: "46px", borderRadius: "10px", background: bg, display: "flex", alignItems: "center", justifyContent: "center" });

const sidebarMenuIcons: Record<string, React.ReactNode> = {
  "/": <LayoutDashboard size={20} />,
  "/departments": <Building2 size={20} />,
  "/subjects": <BookOpen size={20} />,
  "/instructors": <Award size={20} />,
  "/semesters": <Calendar size={20} />,
  "/course-offering": <Link2 size={20} />,
  "/official-students": <GraduationCap size={20} />,
  "/announcements": <Bell size={20} />,
  "/reports": <BarChart3 size={20} />,
  "/audit-log": <FileText size={20} />,
  "/profile": <UserCircle size={20} />,
};

// ================= Sidebar =================
const CollegeManagerSidebar: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const location = useLocation();
  const menu = [
    { name: "الرئيسية", path: "/" },
    { name: "الأقسام", path: "/departments" },
    { name: "المواد", path: "/subjects" },
    { name: "الدكاترة", path: "/instructors" },
    { name: "الأترام", path: "/semesters" },
    { name: "ربط المواد", path: "/course-offering" },
    { name: "سجل الطلاب", path: "/official-students" },
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
        <h3 style={{ margin: "10px 0 0", fontSize: "15px" }}>مدير الكلية</h3>
        <p style={{ fontSize: "12px", opacity: 0.7, margin: "4px 0 0" }}>جامعة إقليم سبأ</p>
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
                <span style={{ display: "flex", color: "#fff" }}>{sidebarMenuIcons[item.path]}</span>
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
const API = "http://127.0.0.1:8000/api";

const TopBar: React.FC = () => {
  const [notifCount, setNotifCount] = useState(0);
  const [showNotif, setShowNotif] = useState(false);
  const [notifList, setNotifList] = useState<any[]>([]);

  const managerId = (() => {
    try {
      const u = localStorage.getItem('user');
      if (u) { const p = JSON.parse(u); if (p.role === 'college_manager') return p.id; }
    } catch {}
    return null;
  })();

  useEffect(() => {
    if (!managerId) return;
    const fetchCount = () => {
      fetch(`${API}/users/${managerId}/notifications/unread-count`)
        .then(r => r.json())
        .then(d => setNotifCount(d.count || 0))
        .catch(() => {});
    };
    fetchCount();
    const interval = setInterval(fetchCount, 10000);
    return () => clearInterval(interval);
  }, [managerId]);

  const openPanel = () => {
    if (!managerId) return;
    setShowNotif(true);
    fetch(`${API}/users/${managerId}/notifications`).then(r => r.json()).then(d => {
      if (d.success) setNotifList(d.data || []);
    });
    fetch(`${API}/notifications/read-all`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: managerId })
    }).then(() => { setNotifCount(0); });
  };

  return (
    <div style={{ 
      background: cardWhite, 
      padding: "12px 25px", 
      display: "flex", 
      justifyContent: "space-between", 
      alignItems: "center", 
      boxShadow: "0 2px 10px rgba(0,0,0,0.05)", 
      position: "sticky", 
      top: 0, 
      zIndex: 99, 
      marginRight: "260px"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
        <div style={{ position: "relative", cursor: "pointer" }} onClick={openPanel}>
          <Bell size={20} color={primary} />
          {notifCount > 0 && (
            <span style={{ position: "absolute", top: "-6px", right: "-8px", background: "#e74c3c", color: "#fff", fontSize: "10px", fontWeight: 700, padding: "2px 6px", borderRadius: "50%", minWidth: "16px", textAlign: "center", lineHeight: "12px" }}>
              {notifCount}
            </span>
          )}
        </div>
        {showNotif && (
          <>
            <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 998 }} onClick={() => setShowNotif(false)} />
            <div style={{ position: "absolute", top: "50px", left: "20px", width: "360px", maxHeight: "400px", overflowY: "auto", background: "#fff", borderRadius: "12px", boxShadow: "0 4px 20px rgba(0,0,0,0.15)", zIndex: 999, padding: "10px" }}>
              <h4 style={{ margin: "0 0 10px 0", fontSize: "13px", color: "#333", borderBottom: "1px solid #eee", paddingBottom: "8px" }}>الإشعارات</h4>
              {notifList.length === 0 ? (
                <p style={{ fontSize: "12px", color: "#888", textAlign: "center", padding: "20px" }}>لا توجد إشعارات</p>
              ) : (
                notifList.map(n => (
                  <div key={n.id} style={{ padding: "10px", borderRadius: "8px", marginBottom: "6px", background: n.is_read ? "#fff" : "#f0f7f7", cursor: "pointer" }} onClick={() => {
                    fetch(`${API}/notifications/${n.id}/read`, { method: 'PUT' }).catch(() => {});
                    setNotifList(prev => prev.map(x => x.id === n.id ? { ...x, is_read: true } : x));
                  }}>
                    <div style={{ fontSize: "12px", fontWeight: 700, color: "#1D4C4F" }}>{n.title}</div>
                    <div style={{ fontSize: "11px", color: "#666", marginTop: "2px" }}>{n.message}</div>
                    <div style={{ fontSize: "10px", color: "#aaa", marginTop: "4px" }}>{n.created_at ? new Date(n.created_at + 'Z').toLocaleString('ar-SA') : ''}</div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "13px", color: textDark, fontWeight: 600 }}>مدير الكلية</span>
          <div style={{ width: "38px", height: "38px", borderRadius: "50%", background: primary, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: "bold" }}>م</div>
        </div>
      </div>
    </div>
  );
};

// ================= Dashboard =================
const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const API = "http://127.0.0.1:8000/api/admin";

  const collegeId = (() => { try { const u = JSON.parse(localStorage.getItem("user") || "{}"); return u.college_id; } catch { return null; } })();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const params = collegeId ? { college_id: collegeId } : {};
        const [statsRes, actRes] = await Promise.all([
          axios.get(`${API}/stats`, { params }),
          axios.get(`${API}/activities`, { params }),
        ]);
        if (statsRes.data.success) setStats(statsRes.data.data);
        if (actRes.data.success) setActivities(actRes.data.data);
      } catch (e) {
        console.error("Failed to load dashboard data", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const statCards = [
    { key: "students", label: "الطلاب", icon: <GraduationCap size={22} />, value: loading ? "..." : (stats?.students ?? "0") },
    { key: "doctors", label: "الدكاترة", icon: <Award size={22} />, value: loading ? "..." : (stats?.doctors ?? "0") },
    { key: "departments", label: "الأقسام", icon: <Building2 size={22} />, value: loading ? "..." : (stats?.departments ?? "0") },
    { key: "subjects", label: "المواد", icon: <BookOpen size={22} />, value: loading ? "..." : (stats?.subjects ?? "0") },
    { key: "levels", label: "المستويات", icon: <Layers size={22} />, value: loading ? "..." : (stats?.levels ?? "0") },
    { key: "course_offerings", label: "المقررات", icon: <Link2 size={22} />, value: loading ? "..." : (stats?.course_offerings ?? "0") },
    { key: "connections", label: "ارتباطات", icon: <ClipboardList size={22} />, value: loading ? "..." : (stats?.connections ?? "0") },
    { key: "announcements", label: "الإعلانات", icon: <Bell size={22} />, value: loading ? "..." : (stats?.announcements ?? "0") },
  ];

  const activityIcons: Record<string, React.ReactNode> = {
    plus: <PlusCircle size={16} />,
    edit: <Pencil size={16} />,
    trash: <Trash2 size={16} />,
    check: <CheckCircle size={16} />,
    x: <X size={16} />,
    link: <Link2 size={16} />,
    'help-circle': <ClipboardList size={16} />,
    'file-text': <ClipboardList size={16} />,
    upload: <Download size={16} />,
    bell: <Bell size={16} />,
    clipboard: <ClipboardList size={16} />,
  };

  const formatTime = (t: string) => {
    if (!t) return '';
    const d = new Date(t);
    const now = new Date();
    const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
    if (diff < 60) return 'منذ لحظات';
    if (diff < 3600) return `منذ ${Math.floor(diff / 60)} دقيقة`;
    if (diff < 86400) return `منذ ${Math.floor(diff / 3600)} ساعة`;
    if (diff < 2592000) return `منذ ${Math.floor(diff / 86400)} يوم`;
    return d.toLocaleDateString('ar-SA');
  };

  return (
    <div style={pageContainer}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px" }}>
        <h2 style={{ margin: 0, color: primary, fontSize: "22px", fontWeight: 700, display: "flex", alignItems: "center", gap: "8px" }}>
          <LayoutDashboard size={20} /> لوحة التحكم
        </h2>
        {stats?.active_term && (
          <div style={{ background: "#e8f5e9", padding: "8px 16px", borderRadius: "10px", display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#2e7d32" }}>
            <CheckCircle size={16} /> الترم النشط: {stats.active_term.name}
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(175px, 1fr))", gap: "16px", marginBottom: "30px" }}>
        {statCards.map((card) => (
          <div key={card.key} style={{ background: cardBg, padding: "18px", borderRadius: "10px", boxShadow: "0 2px 10px rgba(0,0,0,0.06)", textAlign: "center", border: "1px solid #f0f0f0" }}>
            <div style={{ width: "46px", height: "46px", borderRadius: "10px", background: `rgba(29,76,79,0.1)`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
              <span style={{ color: primary, display: "flex" }}>{card.icon}</span>
            </div>
            <h3 style={{ margin: 0, fontSize: "24px", fontWeight: 700, color: primary }}>{card.value}</h3>
            <p style={{ margin: "4px 0 0", fontSize: "12px", color: textGray }}>{card.label}</p>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "20px" }}>
        {/* Recent Activities */}
        <div style={cardStyle}>
          <h3 style={{ margin: "0 0 15px", color: primary, fontSize: "15px", fontWeight: 700, display: "flex", alignItems: "center", gap: "6px" }}>
            <ClipboardList size={16} /> آخر النشاطات
            {activities.length > 0 && <span style={{ fontSize: "11px", color: textGray, fontWeight: 400 }}>({activities.length})</span>}
          </h3>
          {loading ? (
            <p style={{ color: textGray, fontSize: "13px" }}>جاري التحميل...</p>
          ) : activities.length === 0 ? (
            <p style={{ color: textGray, fontSize: "13px", textAlign: "center", padding: "20px" }}>لا توجد نشاطات حديثة</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {activities.map((act: any, idx: number) => (
                <div key={idx} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 0", borderBottom: idx < activities.length - 1 ? "1px solid #f0f0f0" : "none" }}>
                  <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: primary, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: "13px", color: textDark }}>{act.description}</p>
                    <p style={{ margin: "2px 0 0", fontSize: "11px", color: textGray }}>{act.actor_name} · {formatTime(act.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Info Panel */}
        <div>
          <div style={cardStyle}>
            <h3 style={{ margin: "0 0 15px", color: primary, fontSize: "15px", fontWeight: 700, display: "flex", alignItems: "center", gap: "6px" }}>
              <Settings size={16} /> إعدادات سريعة
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <button onClick={() => navigate("/reports")} style={{ width: "100%", background: bgLight, border: "1px solid #e0e0e0", padding: "10px", borderRadius: "10px", textAlign: "center", cursor: "pointer", color: textDark, fontSize: "13px", display: "flex", alignItems: "center", gap: "8px" }}>
                <BarChart3 size={16} /> التقارير
              </button>
              <button onClick={() => navigate("/profile")} style={{ width: "100%", background: bgLight, border: "1px solid #e0e0e0", padding: "10px", borderRadius: "10px", textAlign: "center", cursor: "pointer", color: textDark, fontSize: "13px", display: "flex", alignItems: "center", gap: "8px" }}>
                <UserCircle size={16} /> الملف الشخصي
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ================= إدارة الأقسام =================
const DepartmentsPage: React.FC = () => {
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ id: null as number | null, name: "", study_type: "", code: "", description: "", levels_count: "" });
  const [selectedDept, setSelectedDept] = useState<any>(null);
  const API = "http://127.0.0.1:8000/api/admin";
  const collegeId = (() => { try { const u = JSON.parse(localStorage.getItem("user") || "{}"); return u.college_id; } catch { return null; } })();

  useEffect(() => { fetchDepartments(); }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/departments`, { params: collegeId ? { college_id: collegeId } : {} });
      if (res.data.success) setDepartments(res.data.data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const saveDepartment = async () => {
    if (!form.name) { alert("يرجى إدخال اسم القسم"); return; }
    try {
      const payload: any = { name: form.name, study_type: form.study_type || null, code: form.code, description: form.description, college_id: collegeId };
      if (form.levels_count) payload.levels_count = Number(form.levels_count);
      if (form.id) {
        const res = await axios.put(`${API}/departments/${form.id}`, payload);
        if (!res.data.success) { alert(res.data.message || "فشل تعديل القسم"); return; }
      } else {
        const res = await axios.post(`${API}/departments`, payload);
        if (!res.data.success) { alert(res.data.message || "فشل إضافة القسم"); return; }
      }
      setForm({ id: null, name: "", study_type: "", code: "", description: "", levels_count: "" });
      setShowForm(false);
      fetchDepartments();
    } catch (e: any) { alert(e.response?.data?.message || "فشل حفظ القسم"); }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`هل أنت متأكد من حذف قسم ${name}؟`)) return;
    try {
      const res = await axios.delete(`${API}/departments/${id}`);
      if (res.data.success) fetchDepartments();
      else alert(res.data.message || "فشل حذف القسم");
    } catch (e: any) { alert(e.response?.data?.message || "فشل حذف القسم"); }
  };

  const filteredDepts = departments.filter((d: any) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return d.name.toLowerCase().includes(q) || (d.code || '').toLowerCase().includes(q);
  });

  const startEdit = (dept: any) => {
    setForm({ id: dept.id, name: dept.name, study_type: dept.study_type || "", code: dept.code || "", description: dept.description || "", levels_count: dept.levels_count?.toString() || "" });
    setShowForm(true);
  };

  return (
    <div style={pageContainer}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "10px" }}>
        <h2 style={{ margin: 0, color: primary, fontSize: "22px", fontWeight: 700, display: "flex", alignItems: "center", gap: "8px" }}>
          <Building2 size={20} /> إدارة الأقسام
          {!loading && <span style={{ fontSize: "13px", color: textGray, fontWeight: 400 }}>({filteredDepts.length})</span>}
        </h2>
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={() => { setForm({ id: null, name: "", study_type: "", code: "", description: "", levels_count: "" }); setShowForm(true); }} style={btnPrimary}><PlusCircle size={16} /> إضافة قسم</button>
        </div>
      </div>
      <input type="text" placeholder="بحث عن قسم..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ ...inputStyle, marginBottom: "16px" }} />
      {showForm && (
        <div style={formCardStyle}>
          <h3 style={{ margin: "0 0 15px", color: primary, fontSize: "15px" }}>{form.id ? "تعديل القسم" : "إضافة قسم جديد"}</h3>
          <input type="text" placeholder="اسم القسم" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={{ ...inputStyle, marginBottom: "10px" }} />
          <select value={form.study_type} onChange={(e) => setForm({ ...form, study_type: e.target.value })} style={{ ...inputStyle, marginBottom: "10px" }}>
            <option value="">عام + نفقة (الكل)</option>
            <option value="general">عام</option>
            <option value="paid">نفقة (خاص)</option>
          </select>
          <input type="text" placeholder="كود القسم" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} style={{ ...inputStyle, marginBottom: "10px" }} />
          <input type="number" placeholder="عدد المستويات" value={form.levels_count} onChange={(e) => setForm({ ...form, levels_count: e.target.value })} style={{ ...inputStyle, marginBottom: "10px" }} />
          <textarea placeholder="وصف القسم" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={{ ...inputStyle, minHeight: "80px", marginBottom: "10px" }} />
          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={saveDepartment} style={btnPrimary}><Save size={16} /> حفظ</button>
            <button onClick={() => setShowForm(false)} style={{ background: bgLight, color: textGray, border: "none", padding: "10px 20px", borderRadius: "8px", cursor: "pointer", fontSize: "13px", display: "flex", alignItems: "center", gap: "6px" }}><X size={16} /> إلغاء</button>
          </div>
        </div>
      )}
      {loading ? (
        <p style={{ color: textGray, fontSize: "13px", textAlign: "center", padding: "20px" }}>جاري التحميل...</p>
      ) : filteredDepts.length === 0 ? (
        <p style={{ color: textGray, fontSize: "13px", textAlign: "center", padding: "20px" }}>لا توجد أقسام</p>
      ) : (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(310px, 1fr))", gap: "16px" }}>
        {filteredDepts.map((dept: any) => (
          <div key={dept.id} style={{ background: cardBg, borderRadius: "8px", boxShadow: "0 1px 6px rgba(0,0,0,0.06)", border: "1px solid #f0f0f0", borderTop: `3px solid ${primary}`, padding: "20px", textAlign: "center" }}>
            <h3 style={{ margin: "0 0 6px", fontSize: "17px", fontWeight: 700, color: primary }}>{dept.name}</h3>
            {dept.study_type && <span style={{ display: "inline-block", background: dept.study_type === 'general' ? '#e3f2fd' : '#fff3e0', color: dept.study_type === 'general' ? '#1565c0' : '#e65100', fontSize: "11px", padding: "2px 10px", borderRadius: "10px", marginBottom: "12px" }}>{dept.study_type === 'general' ? 'عام' : 'نفقة (خاص)'}</span>}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "14px" }}>
              {[
                { label: "الطلاب", value: dept.students_count ?? 0 },
                { label: "الدكاترة", value: dept.doctors_count ?? 0 },
                { label: "المواد", value: dept.subjects_count ?? 0 },
                { label: "المستويات", value: dept.levels_count ?? 0 },
              ].map((s: any) => (
                <div key={s.label} style={{ background: bgLight, padding: "10px 4px", borderRadius: "6px" }}>
                  <p style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: primary }}>{s.value}</p>
                  <p style={{ margin: "3px 0 0", fontSize: "11px", color: textGray }}>{s.label}</p>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: "6px" }}>
              <button onClick={() => setSelectedDept(dept)} style={{ flex: 1, background: primary, color: "#fff", border: "none", padding: "8px", borderRadius: "6px", cursor: "pointer", fontSize: "12px", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}><Eye size={13} /> عرض</button>
              <button onClick={() => startEdit(dept)} style={{ flex: 1, background: "transparent", color: primary, border: `1px solid ${primary}`, padding: "8px", borderRadius: "6px", cursor: "pointer", fontSize: "12px", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}><Pencil size={13} /> تعديل</button>
              <button onClick={() => handleDelete(dept.id, dept.name)} style={{ flex: 1, background: "transparent", color: red, border: "1px solid #f5c6cb", padding: "8px", borderRadius: "6px", cursor: "pointer", fontSize: "12px", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}><Trash2 size={13} /> حذف</button>
            </div>
          </div>
        ))}
      </div>
      )}
      {selectedDept && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }} onClick={() => setSelectedDept(null)}>
          <div style={{ background: cardBg, padding: "25px", borderRadius: "10px", width: "420px", boxShadow: "0 4px 20px rgba(0,0,0,0.15)" }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: "0 0 15px", color: primary, fontSize: "16px" }}>تفاصيل القسم</h3>
            <table style={{ width: "100%", fontSize: "13px" }}>
              <tbody>
                <tr><td style={{ padding: "6px 0", color: textGray, width: "100px" }}>الاسم:</td><td style={{ padding: "6px 0", fontWeight: 600 }}>{selectedDept.name}</td></tr>
                <tr><td style={{ padding: "6px 0", color: textGray }}>الكود:</td><td style={{ padding: "6px 0", fontWeight: 600 }}>{selectedDept.code || "—"}</td></tr>
                <tr><td style={{ padding: "6px 0", color: textGray }}>نوع الدراسة:</td><td style={{ padding: "6px 0", fontWeight: 600 }}>{selectedDept.study_type === 'general' ? 'عام' : selectedDept.study_type === 'paid' ? 'نفقة (خاص)' : 'عام + نفقة'}</td></tr>
                <tr><td style={{ padding: "6px 0", color: textGray }}>الكلية:</td><td style={{ padding: "6px 0", fontWeight: 600 }}>{selectedDept.college_name || "—"}</td></tr>
                <tr><td style={{ padding: "6px 0", color: textGray }}>عدد الطلاب:</td><td style={{ padding: "6px 0", fontWeight: 600 }}>{selectedDept.students_count ?? 0}</td></tr>
                <tr><td style={{ padding: "6px 0", color: textGray }}>عدد الدكاترة:</td><td style={{ padding: "6px 0", fontWeight: 600 }}>{selectedDept.doctors_count ?? 0}</td></tr>
                <tr><td style={{ padding: "6px 0", color: textGray }}>عدد المواد:</td><td style={{ padding: "6px 0", fontWeight: 600 }}>{selectedDept.subjects_count ?? 0}</td></tr>
                <tr><td style={{ padding: "6px 0", color: textGray }}>عدد المستويات:</td><td style={{ padding: "6px 0", fontWeight: 600 }}>{selectedDept.levels_count ?? 0}</td></tr>
                <tr><td style={{ padding: "6px 0", color: textGray }}>الوصف:</td><td style={{ padding: "6px 0", fontWeight: 600 }}>{selectedDept.description || "—"}</td></tr>
              </tbody>
            </table>
            <button onClick={() => setSelectedDept(null)} style={{ width: "100%", background: primary, color: "#fff", border: "none", padding: "10px", borderRadius: "10px", cursor: "pointer", marginTop: "15px", fontWeight: 600, fontSize: "13px" }}>إغلاق</button>
          </div>
        </div>
      )}
    </div>
  );
};

// ================= إدارة المواد =================
const SubjectsPage: React.FC = () => {
  const API = "http://127.0.0.1:8000/api/admin";
  const collegeId = (() => { try { const u = JSON.parse(localStorage.getItem("user") || "{}"); return u.college_id; } catch { return null; } })();
  const [subjects, setSubjects] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [activeDeptId, setActiveDeptId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<any>(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [newSubject, setNewSubject] = useState({ name: "", code: "", department_ids: [] as number[], level: "", doctor_id: "" });
  const [editingSubject, setEditingSubject] = useState<any>(null);

  useEffect(() => {
    Promise.all([fetchDepartments(), fetchSubjects()]);
  }, []);

  useEffect(() => {
    if (showAdd) fetchDoctors();
  }, [showAdd]);

  useEffect(() => {
    const timer = setTimeout(() => fetchSubjects(), 300);
    return () => clearTimeout(timer);
  }, [activeDeptId, search]);

  const fetchDepartments = async () => {
    try {
      const res = await axios.get(`${API}/departments`, { params: collegeId ? { college_id: collegeId } : {} });
      if (res.data.success) setDepartments(res.data.data);
    } catch (e) { console.error(e); }
  };

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (collegeId) params.college_id = collegeId;
      if (activeDeptId) params.department_id = activeDeptId;
      if (search) params.search = search;
      const res = await axios.get(`${API}/subjects`, { params });
      if (res.data.success) setSubjects(res.data.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchDoctors = async () => {
    try {
      const res = await axios.get(`${API}/users`, { params: { role: 'doctor', college_id: collegeId } });
      if (res.data.success) setDoctors(res.data.data);
    } catch (e) { console.error(e); }
  };

  const startEdit = async (sub: any) => {
    try {
      const res = await axios.get(`${API}/subjects/${sub.id}`);
      if (res.data.success) {
        const data = res.data.data;
        setNewSubject({ name: data.name, code: data.code, department_ids: data.departments_ids || [], level: String(data.levels?.[0] || ""), doctor_id: data.doctor_id ? String(data.doctor_id) : "" });
        setEditingSubject(sub);
        setShowAdd(true);
      }
    } catch (e) { console.error(e); }
  };

  const toggleDept = (id: number) => {
    setNewSubject(prev => ({
      ...prev,
      department_ids: prev.department_ids.includes(id)
        ? prev.department_ids.filter(d => d !== id)
        : [...prev.department_ids, id]
    }));
  };

  const saveSubject = async () => {
    if (!newSubject.name || !newSubject.code || newSubject.department_ids.length === 0 || !newSubject.level) {
      alert("يرجى إدخال اسم المادة وكودها واختيار الأقسام والمستوى"); return;
    }
    if (!newSubject.doctor_id) { alert("يرجى اختيار الدكتور المسؤول"); return; }
    try {
      if (editingSubject) {
        const res = await axios.put(`${API}/subjects/${editingSubject.id}`, {
          name: newSubject.name, code: newSubject.code,
          department_ids: newSubject.department_ids,
          level: Number(newSubject.level),
          doctor_id: Number(newSubject.doctor_id),
        });
        if (!res.data.success) { alert(res.data.message || "فشل تعديل المادة"); return; }
      } else {
        const res = await axios.post(`${API}/subjects`, {
          name: newSubject.name, code: newSubject.code,
          department_ids: newSubject.department_ids,
          level: Number(newSubject.level),
          doctor_id: Number(newSubject.doctor_id),
        });
        if (!res.data.success) { alert(res.data.message || "فشل إضافة المادة"); return; }
      }
      setNewSubject({ name: "", code: "", department_ids: [], level: "", doctor_id: "" });
      setEditingSubject(null);
      setShowAdd(false);
      fetchSubjects();
    } catch (e: any) { alert(e.response?.data?.message || "فشل حفظ المادة"); }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`هل أنت متأكد من حذف مادة ${name}؟`)) return;
    try {
      const res = await axios.delete(`${API}/subjects/${id}`);
      if (res.data.success) fetchSubjects();
      else alert(res.data.message || "فشل حذف المادة");
    } catch (e: any) { alert(e.response?.data?.message || "فشل حذف المادة"); }
  };

  const viewSubjectDetails = async (sub: any) => {
    try {
      setViewLoading(true);
      const res = await axios.get(`${API}/subjects/${sub.id}`);
      if (res.data.success) setSelectedSubject(res.data.data);
    } catch (e) { console.error(e); }
    finally { setViewLoading(false); }
  };

  const levelLabels: Record<number, string> = { 1: "الأول", 2: "الثاني", 3: "الثالث", 4: "الرابع", 5: "الخامس", 6: "السادس" };

  return (
    <div style={pageContainer}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px", flexWrap: "wrap", gap: "10px" }}>
        <h2 style={{ margin: 0, color: primary, fontSize: "22px", fontWeight: 700, display: "flex", alignItems: "center", gap: "8px" }}>
          <BookOpen size={20} /> إدارة المواد
          {!loading && <span style={{ fontSize: "13px", color: textGray, fontWeight: 400 }}>({subjects.length})</span>}
        </h2>
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={() => { setNewSubject({ name: "", code: "", department_ids: [], level: "", doctor_id: "" }); setShowAdd(!showAdd); }} style={btnPrimary}><PlusCircle size={16} /> إضافة مادة</button>
        </div>
      </div>
      <input type="text" placeholder="بحث باسم المادة أو الكود..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ ...inputStyle, marginBottom: "12px" }} />
      {/* Department filter: الكل tab + dropdown */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap", alignItems: "center" }}>
        <button onClick={() => setActiveDeptId(null)} style={{ padding: "6px 18px", borderRadius: "20px", border: "none", cursor: "pointer", fontSize: "13px", fontWeight: 600, background: !activeDeptId ? primary : "#e8ecec", color: !activeDeptId ? "#fff" : textDark }}>الكل</button>
        <select
          value={activeDeptId ?? ""}
          onChange={(e) => setActiveDeptId(e.target.value ? Number(e.target.value) : null)}
          style={{
            padding: "6px 32px 6px 14px",
            borderRadius: "20px",
            border: activeDeptId ? "none" : "1px solid #e0e0e0",
            cursor: "pointer",
            fontSize: "13px",
            fontWeight: 600,
            background: activeDeptId ? primary : "#e8ecec",
            color: activeDeptId ? "#fff" : textDark,
            appearance: "none",
            WebkitAppearance: "none",
            MozAppearance: "none",
            outline: "none",
            minWidth: "140px",
          }}
        >
          <option value="">اختر التخصص</option>
          {departments.map((d: any) => (
            <option key={d.id} value={d.id} style={{ background: "#fff", color: textDark }}>{d.name}</option>
          ))}
        </select>
      </div>
      {showAdd && (
        <div style={formCardStyle}>
          <h3 style={{ margin: "0 0 15px", color: primary, fontSize: "15px" }}>{editingSubject ? "تعديل مادة" : "إضافة مادة جديدة"}</h3>
          <input type="text" placeholder="اسم المادة" value={newSubject.name} onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })} style={{ ...inputStyle, marginBottom: "10px" }} />
          <input type="text" placeholder="كود المادة" value={newSubject.code} onChange={(e) => setNewSubject({ ...newSubject, code: e.target.value })} style={{ ...inputStyle, marginBottom: "10px" }} />

          {/* Multi-department select */}
          <p style={{ margin: "0 0 6px", fontSize: "12px", color: textGray, fontWeight: 500 }}>الأقسام (اختيار متعدد):</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "12px" }}>
            {departments.map((d: any) => {
              const selected = newSubject.department_ids.includes(d.id);
              return (
                <div key={d.id} onClick={() => toggleDept(d.id)} style={{ padding: "6px 14px", borderRadius: "20px", border: selected ? `2px solid ${primary}` : "1px solid #ddd", background: selected ? "rgba(29,76,79,0.08)" : "#fff", cursor: "pointer", fontSize: "12px", color: selected ? primary : textDark, fontWeight: selected ? 600 : 400 }}>
                  {d.name}
                </div>
              );
            })}
          </div>

          <input type="number" placeholder="المستوى (1-12)" min="1" max="12" value={newSubject.level} onChange={(e) => setNewSubject({ ...newSubject, level: e.target.value })} style={{ ...inputStyle, marginBottom: "10px" }} />

          {/* Compulsory doctor select */}
          <p style={{ margin: "0 0 6px", fontSize: "12px", color: textGray, fontWeight: 500 }}>الدكتور المسؤول:</p>
          <select value={newSubject.doctor_id} onChange={(e) => setNewSubject({ ...newSubject, doctor_id: e.target.value })} style={{ ...inputStyle, marginBottom: "10px" }}>
            <option value="">-- اختر الدكتور --</option>
            {doctors.map((d: any) => (<option key={d.id} value={d.id}>{d.name}{d.department_name ? ` - ${d.department_name}` : ''}{d.study_type ? ` (${d.study_type === 'general' ? 'عام' : d.study_type === 'paid' ? 'نفقة' : d.study_type})` : ''}</option>))}
          </select>

          <p style={{ margin: "0 0 10px", fontSize: "11px", color: textGray }}>سيتم إنشاء المادة وربطها تلقائياً مع الأقسام المحددة والدكتور</p>
          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={saveSubject} style={btnPrimary}><Save size={16} /> حفظ</button>
            <button onClick={() => { setShowAdd(false); setEditingSubject(null); }} style={{ background: bgLight, color: textGray, border: "none", padding: "10px 20px", borderRadius: "10px", cursor: "pointer", fontSize: "13px", display: "flex", alignItems: "center", gap: "6px" }}><X size={16} /> إلغاء</button>
          </div>
        </div>
      )}
      {loading ? (
        <p style={{ color: textGray, fontSize: "13px", textAlign: "center", padding: "20px" }}>جاري التحميل...</p>
      ) : subjects.length === 0 ? (
        <p style={{ color: textGray, fontSize: "13px", textAlign: "center", padding: "20px" }}>لا توجد مواد</p>
      ) : (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" }}>
        {subjects.map((sub: any) => (
          <div key={sub.id} style={{ background: cardBg, borderRadius: "8px", boxShadow: "0 1px 6px rgba(0,0,0,0.06)", border: "1px solid #f0f0f0", borderTop: `3px solid ${primary}`, padding: "18px", textAlign: "center" }}>
            <h3 style={{ margin: "0 0 8px", fontSize: "16px", fontWeight: 700, color: primary }}>{sub.name}</h3>
            <p style={{ margin: "0 0 12px", fontSize: "12px", color: textGray, fontFamily: "monospace", direction: "ltr", display: "inline-block" }}>{sub.code || "—"}</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginBottom: "12px", justifyContent: "center" }}>
              {sub.departments ? sub.departments.split('، ').filter((d: string) => d.trim()).map((d: string, i: number) => (
                <span key={i} style={{ background: "rgba(29,76,79,0.1)", color: primary, padding: "2px 10px", borderRadius: "8px", fontSize: "11px", fontWeight: 500 }}>{d}</span>
              )) : <span style={{ color: textGray, fontSize: "11px" }}>—</span>}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "14px" }}>
              <div style={{ background: bgLight, padding: "8px 4px", borderRadius: "6px" }}>
                <p style={{ margin: 0, fontSize: "10px", color: textGray }}>المستوى</p>
                <p style={{ margin: 0, fontSize: "13px", fontWeight: 700, color: primary }}>{levelLabels[sub.level] || sub.level}</p>
              </div>
              <div style={{ background: bgLight, padding: "8px 4px", borderRadius: "6px" }}>
                <p style={{ margin: 0, fontSize: "10px", color: textGray }}>الدكتور</p>
                <p style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: textDark }}>{sub.doctor_name || "—"}</p>
              </div>
            </div>
            <div style={{ display: "flex", gap: "6px" }}>
              <button onClick={() => viewSubjectDetails(sub)} style={{ flex: 1, background: primary, color: "#fff", border: "none", padding: "7px", borderRadius: "6px", cursor: "pointer", fontSize: "11px", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}><Eye size={13} /> عرض</button>
              <button onClick={() => startEdit(sub)} style={{ flex: 1, background: "transparent", color: primary, border: `1px solid ${primary}`, padding: "7px", borderRadius: "6px", cursor: "pointer", fontSize: "11px", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}><Pencil size={13} /> تعديل</button>
              <button onClick={() => handleDelete(sub.id, sub.name)} style={{ flex: 1, background: "transparent", color: red, border: "1px solid #f5c6cb", padding: "7px", borderRadius: "6px", cursor: "pointer", fontSize: "11px", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}><Trash2 size={13} /> حذف</button>
            </div>
          </div>
        ))}
      </div>
      )}
      {selectedSubject && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }} onClick={() => setSelectedSubject(null)}>
          <div style={{ background: cardBg, padding: "25px", borderRadius: "10px", width: "700px", maxHeight: "85vh", overflowY: "auto", boxShadow: "0 4px 20px rgba(0,0,0,0.15)" }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: "0 0 15px", color: primary, fontSize: "16px" }}>{viewLoading ? "جاري التحميل..." : `تفاصيل المادة: ${selectedSubject.name}`}</h3>
            {!viewLoading && <>
            <table style={{ width: "100%", fontSize: "13px", marginBottom: "15px" }}>
              <tbody>
                <tr><td style={{ padding: "6px 0", color: textGray, width: "110px" }}>الاسم:</td><td style={{ padding: "6px 0", fontWeight: 600 }}>{selectedSubject.name}</td></tr>
                <tr><td style={{ padding: "6px 0", color: textGray }}>الكود:</td><td style={{ padding: "6px 0", fontWeight: 600 }}>{selectedSubject.code}</td></tr>
                <tr><td style={{ padding: "6px 0", color: textGray }}>الأقسام:</td><td style={{ padding: "6px 0", fontWeight: 600 }}>{selectedSubject.departments || "—"}</td></tr>
                <tr><td style={{ padding: "6px 0", color: textGray }}>المستويات:</td><td style={{ padding: "6px 0", fontWeight: 600 }}>{selectedSubject.levels?.length ? selectedSubject.levels.join('، ') : "—"}</td></tr>
                <tr><td style={{ padding: "6px 0", color: textGray }}>إجمالي الشعب:</td><td style={{ padding: "6px 0", fontWeight: 600 }}>{selectedSubject.total_offerings ?? selectedSubject.offerings?.length ?? 0}</td></tr>
                <tr><td style={{ padding: "6px 0", color: textGray }}>إجمالي الدكاترة:</td><td style={{ padding: "6px 0", fontWeight: 600 }}>{selectedSubject.total_doctors ?? 0}</td></tr>
                <tr><td style={{ padding: "6px 0", color: textGray }}>إجمالي الطلاب:</td><td style={{ padding: "6px 0", fontWeight: 600 }}>{selectedSubject.total_students ?? 0}</td></tr>
              </tbody>
            </table>
            {selectedSubject.offerings && selectedSubject.offerings.length > 0 && (
              <>
              <h4 style={{ color: primary, fontSize: "14px", margin: "0 0 10px" }}>جميع الشعب الدراسية:</h4>
              <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", fontSize: "12px", borderCollapse: "collapse", minWidth: "650px" }}>
                <thead>
                  <tr style={{ background: bgLight }}>
                    <th style={{ padding: "8px", textAlign: "right", borderBottom: "1px solid #eee" }}>#</th>
                    <th style={{ padding: "8px", textAlign: "right", borderBottom: "1px solid #eee" }}>الدكتور</th>
                    <th style={{ padding: "8px", textAlign: "right", borderBottom: "1px solid #eee" }}>القسم</th>
                    <th style={{ padding: "8px", textAlign: "right", borderBottom: "1px solid #eee" }}>المستوى</th>
                    <th style={{ padding: "8px", textAlign: "right", borderBottom: "1px solid #eee" }}>الترم</th>
                    <th style={{ padding: "8px", textAlign: "right", borderBottom: "1px solid #eee" }}>النوع</th>
                    <th style={{ padding: "8px", textAlign: "right", borderBottom: "1px solid #eee" }}>الطلاب</th>
                    <th style={{ padding: "8px", textAlign: "right", borderBottom: "1px solid #eee" }}>الملفات</th>
                    <th style={{ padding: "8px", textAlign: "right", borderBottom: "1px solid #eee" }}>التكاليف</th>
                    <th style={{ padding: "8px", textAlign: "right", borderBottom: "1px solid #eee" }}>الكويزات</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedSubject.offerings.map((o: any) => (
                    <tr key={o.id} style={{ background: o.is_active_term ? "#f0fdf4" : "transparent" }}>
                      <td style={{ padding: "8px", borderBottom: "1px solid #f0f0f0" }}>{o.id}</td>
                      <td style={{ padding: "8px", borderBottom: "1px solid #f0f0f0" }}>{o.doctor_name}</td>
                      <td style={{ padding: "8px", borderBottom: "1px solid #f0f0f0" }}>{o.department_name}</td>
                      <td style={{ padding: "8px", borderBottom: "1px solid #f0f0f0" }}>{o.level}</td>
                      <td style={{ padding: "8px", borderBottom: "1px solid #f0f0f0" }}>{o.term_name}{o.is_active_term ? ' ✅' : ''}</td>
                      <td style={{ padding: "8px", borderBottom: "1px solid #f0f0f0" }}>{o.study_type === "general" ? "نظري" : o.study_type === "both" ? "نظري+عملي" : o.study_type === "paid" ? "مدفوع" : o.study_type}</td>
                      <td style={{ padding: "8px", borderBottom: "1px solid #f0f0f0" }}>{o.students_count}</td>
                      <td style={{ padding: "8px", borderBottom: "1px solid #f0f0f0" }}>{o.materials_count}</td>
                      <td style={{ padding: "8px", borderBottom: "1px solid #f0f0f0" }}>{o.assignments_count}</td>
                      <td style={{ padding: "8px", borderBottom: "1px solid #f0f0f0" }}>{o.quizzes_count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
              </>
            )}
            <button onClick={() => setSelectedSubject(null)} style={{ width: "100%", background: primary, color: "#fff", border: "none", padding: "10px", borderRadius: "10px", cursor: "pointer", marginTop: "15px", fontWeight: 600, fontSize: "13px" }}>إغلاق</button>
            </>}
          </div>
        </div>
      )}
    </div>
  );
};

// ================= إدارة الدكاترة =================
const InstructorsPage: React.FC = () => {
  const API = "http://127.0.0.1:8000/api/admin";
  const collegeId = (() => { try { const u = JSON.parse(localStorage.getItem("user") || "{}"); return u.college_id; } catch { return null; } })();
  const [instructors, setInstructors] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "", study_type: "", department_id: "" });
  const [selectedInstructor, setSelectedInstructor] = useState<any>(null);

  const fetchDepts = (studyType?: string) => {
    const params: any = { college_id: collegeId };
    if (studyType) params.study_type = studyType;
    axios.get(`${API}/departments`, { params }).then(r => { if (r.data.success) setDepartments(r.data.data); }).catch(() => {});
  };

  useEffect(() => {
    fetchInstructors();
    fetchDepts();
  }, []);

  const fetchInstructors = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/users`, { params: { role: 'doctor', college_id: collegeId } });
      if (res.data.success) setInstructors(res.data.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const addInstructor = async () => {
    if (!form.name || !form.email || !form.password) { alert("يرجى إدخال الاسم والبريد الإلكتروني وكلمة المرور"); return; }
    try {
      const res = await axios.post(`${API}/users`, { name: form.name, email: form.email, password: form.password, phone: form.phone || '', role: 'doctor', study_type: form.study_type || null, department_id: form.department_id ? Number(form.department_id) : null, is_active: 1 });
      if (res.data.success) {
        setForm({ name: "", email: "", password: "", phone: "", study_type: "", department_id: "" });
        setShowAdd(false);
        fetchInstructors();
      } else { alert(res.data.message || "فشل إضافة الدكتور"); }
    } catch (e: any) { alert(e.response?.data?.message || "فشل إضافة الدكتور"); }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`هل أنت متأكد من حذف الدكتور ${name}؟`)) return;
    try {
      const res = await axios.delete(`${API}/users/${id}`);
      if (res.data.success) fetchInstructors();
      else alert(res.data.message || "فشل حذف الدكتور");
    } catch (e: any) { alert(e.response?.data?.message || "فشل حذف الدكتور"); }
  };

  const filteredInstructors = instructors.filter((i: any) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return i.name?.toLowerCase().includes(q) || i.email?.toLowerCase().includes(q) || i.department_name?.toLowerCase().includes(q) || i.phone?.includes(q);
  });

  const exportToCSV = () => {
    const headers = ["الاسم", "البريد الإلكتروني", "رقم الهاتف", "القسم", "نوع الدراسة", "الحالة"];
    const rows = filteredInstructors.map((i: any) => [i.name, i.email, i.phone, i.department_name || "—", i.study_type === 'general' ? 'عام' : i.study_type === 'paid' ? 'نفقة (خاص)' : (i.study_type || '—'), i.is_active ? "نشط" : "غير نشط"]);
    const csvContent = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute("download", "instructors.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div style={pageContainer}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "10px" }}>
        <h2 style={{ margin: 0, color: primary, fontSize: "20px", fontWeight: 700, display: "flex", alignItems: "center", gap: "8px" }}>
          <Award size={20} /> إدارة الدكاترة
          {!loading && <span style={{ fontSize: "13px", color: textGray, fontWeight: 400 }}>({search ? `${filteredInstructors.length} من ${instructors.length}` : instructors.length})</span>}
        </h2>
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={() => { setForm({ name: "", email: "", password: "", phone: "", study_type: "", department_id: "" }); fetchDepts(); setShowAdd(!showAdd); }} style={btnPrimary}><PlusCircle size={16} /> إضافة دكتور</button>
          <button onClick={exportToCSV} style={btnOutline}><Download size={16} /> تصدير CSV</button>
        </div>
      </div>
      {/* Search */}
      <div style={{ marginBottom: "16px" }}>
        <div style={{ position: "relative", maxWidth: "400px" }}>
          <Search size={16} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", color: textGray }} />
          <input type="text" placeholder="بحث بالاسم أو البريد أو القسم..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ ...inputStyle, paddingRight: "36px" }} />
        </div>
      </div>
      {showAdd && (
        <div style={formCardStyle}>
          <h3 style={{ margin: "0 0 15px", color: primary, fontSize: "15px" }}>إضافة دكتور جديد</h3>
          <input type="text" placeholder="الاسم الكامل" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={{ ...inputStyle, marginBottom: "10px" }} />
          <input type="email" placeholder="البريد الإلكتروني" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} style={{ ...inputStyle, marginBottom: "10px" }} />
          <input type="password" placeholder="كلمة المرور" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} style={{ ...inputStyle, marginBottom: "10px" }} />
          <input type="tel" placeholder="رقم الهاتف (اختياري)" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} style={{ ...inputStyle, marginBottom: "10px" }} />
          <select value={form.study_type} onChange={(e) => { setForm({ ...form, study_type: e.target.value, department_id: "" }); fetchDepts(e.target.value || undefined); }} style={{ ...inputStyle, marginBottom: "10px" }}>
            <option value="">اختر نوع الدراسة</option>
            <option value="general">عام</option>
            <option value="paid">نفقة (خاص)</option>
          </select>
          <select value={form.department_id} onChange={(e) => setForm({ ...form, department_id: e.target.value })} style={{ ...inputStyle, marginBottom: "10px" }}>
            <option value="">{form.study_type ? (form.study_type === 'general' ? 'اختر تخصص عام' : 'اختر تخصص نفقة') : 'اختر نوع الدراسة أولاً'}</option>
            {departments.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          <p style={{ margin: "0 0 10px", fontSize: "11px", color: textGray }}>سيتم إنشاء الحساب بدور دكتور ونشط تلقائياً</p>
          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={addInstructor} style={btnPrimary}><Save size={16} /> حفظ</button>
            <button onClick={() => setShowAdd(false)} style={{ background: bgLight, color: textGray, border: "none", padding: "10px 20px", borderRadius: "8px", cursor: "pointer", fontSize: "13px", display: "flex", alignItems: "center", gap: "6px" }}><X size={16} /> إلغاء</button>
          </div>
        </div>
      )}
      {loading ? (
        <p style={{ color: textGray, fontSize: "13px", textAlign: "center", padding: "20px" }}>جاري التحميل...</p>
      ) : filteredInstructors.length === 0 ? (
        <p style={{ color: textGray, fontSize: "13px", textAlign: "center", padding: "20px" }}>{search ? "لا توجد نتائج للبحث" : "لا يوجد دكاترة"}</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" }}>
          {filteredInstructors.map((ins: any) => (
            <div key={ins.id} style={{ background: cardBg, borderRadius: "8px", boxShadow: "0 1px 6px rgba(0,0,0,0.06)", border: "1px solid #f0f0f0", borderTop: `3px solid ${primary}`, padding: "0", overflow: "hidden" }}>
              <div style={{ background: primary, padding: "14px 16px", color: "#fff" }}>
                <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 700 }}>{ins.name}</h3>
              </div>
              <div style={{ padding: "16px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "14px", fontSize: "12px", color: textGray }}>
                  <span><strong style={{ color: textDark, marginLeft: "4px" }}>البريد:</strong> {ins.email}</span>
                  <span><strong style={{ color: textDark, marginLeft: "4px" }}>الهاتف:</strong> {ins.phone || "—"}</span>
                  <span><strong style={{ color: textDark, marginLeft: "4px" }}>القسم:</strong> {ins.department_name || "—"}</span>
                  {ins.study_type && <span><strong style={{ color: textDark, marginLeft: "4px" }}>نوع الدراسة:</strong> {ins.study_type === 'general' ? 'عام' : ins.study_type === 'paid' ? 'نفقة (خاص)' : ins.study_type}</span>}
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button onClick={() => setSelectedInstructor(ins)} style={{ flex: 1, background: primary, color: "#fff", border: "none", padding: "8px", borderRadius: "6px", cursor: "pointer", fontSize: "12px", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}><Eye size={14} /> عرض</button>
                  <button onClick={() => handleDelete(ins.id, ins.name)} style={{ flex: 1, background: "transparent", color: red, border: "1px solid #f5c6cb", padding: "8px", borderRadius: "6px", cursor: "pointer", fontSize: "12px", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}><Trash2 size={14} /> حذف</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {selectedInstructor && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }} onClick={() => setSelectedInstructor(null)}>
          <div style={{ background: cardBg, padding: "25px", borderRadius: "10px", width: "480px", maxHeight: "80vh", overflowY: "auto", boxShadow: "0 4px 20px rgba(0,0,0,0.15)" }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: "0 0 15px", color: primary, fontSize: "16px" }}>تفاصيل الدكتور</h3>
            <table style={{ width: "100%", fontSize: "13px" }}>
              <tbody>
                <tr><td style={{ padding: "6px 0", color: "#888", width: "120px" }}>الاسم:</td><td style={{ padding: "6px 0", fontWeight: 600 }}>{selectedInstructor.name}</td></tr>
                <tr><td style={{ padding: "6px 0", color: "#888" }}>البريد الإلكتروني:</td><td style={{ padding: "6px 0", fontWeight: 600 }}>{selectedInstructor.email}</td></tr>
                <tr><td style={{ padding: "6px 0", color: "#888" }}>رقم الهاتف:</td><td style={{ padding: "6px 0", fontWeight: 600 }}>{selectedInstructor.phone || "—"}</td></tr>
                <tr><td style={{ padding: "6px 0", color: "#888" }}>القسم:</td><td style={{ padding: "6px 0", fontWeight: 600 }}>{selectedInstructor.department_name || "—"}</td></tr>
                <tr><td style={{ padding: "6px 0", color: "#888" }}>نوع الدراسة:</td><td style={{ padding: "6px 0", fontWeight: 600 }}>{selectedInstructor.study_type === 'general' ? 'عام' : selectedInstructor.study_type === 'paid' ? 'نفقة (خاص)' : (selectedInstructor.study_type || '—')}</td></tr>
                <tr><td style={{ padding: "6px 0", color: "#888" }}>الحالة:</td><td style={{ padding: "6px 0", fontWeight: 600 }}>{selectedInstructor.is_active ? "نشط" : "غير نشط"}</td></tr>
              </tbody>
            </table>
            <button onClick={() => setSelectedInstructor(null)} style={{ width: "100%", background: primary, color: "#fff", border: "none", padding: "10px", borderRadius: "8px", cursor: "pointer", marginTop: "15px", fontWeight: 600, fontSize: "13px" }}>إغلاق</button>
          </div>
        </div>
      )}
    </div>
  );
};

// ================= إدارة الأترام =================
const SemestersPage: React.FC = () => {
  const API = "http://127.0.0.1:8000/api/admin";
  const [semesters, setSemesters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editingSem, setEditingSem] = useState<any>(null);
  const [form, setForm] = useState({ name: "", year: "", term: "1", start_date: "", end_date: "", description: "" });

  useEffect(() => { fetchSemesters(); }, []);

  const fetchSemesters = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/terms`);
      if (res.data.success) setSemesters(res.data.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const saveSemester = async () => {
    if (!form.name || !form.start_date || !form.end_date) { alert("يرجى إدخال اسم الترم وتاريخ البداية والنهاية"); return; }
    try {
      if (editingSem) {
        const res = await axios.put(`${API}/terms/${editingSem.id}`, form);
        if (!res.data.success) { alert(res.data.message || "فشل التحديث"); return; }
      } else {
        const res = await axios.post(`${API}/terms`, form);
        if (!res.data.success) { alert(res.data.message || "فشل الإضافة"); return; }
      }
      setForm({ name: "", year: "", term: "1", start_date: "", end_date: "", description: "" });
      setEditingSem(null);
      setShowAdd(false);
      fetchSemesters();
    } catch (e: any) { alert(e.response?.data?.message || "فشل الحفظ"); }
  };

  const setActive = async (id: number) => {
    try {
      const res = await axios.put(`${API}/terms/${id}/set-active`);
      if (res.data.success) fetchSemesters();
      else alert(res.data.message || "فشل تعيين الترم النشط");
    } catch (e: any) { alert(e.response?.data?.message || "فشل تعيين الترم النشط"); }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`هل أنت متأكد من حذف الترم ${name}؟`)) return;
    try {
      const res = await axios.delete(`${API}/terms/${id}`);
      if (res.data.success) fetchSemesters();
      else alert(res.data.message || "فشل الحذف");
    } catch (e: any) { alert(e.response?.data?.message || "فشل الحذف"); }
  };

  const startEdit = (sem: any) => {
    setForm({ name: sem.name, year: String(sem.year || ""), term: String(sem.term || "1"), start_date: sem.start_date || "", end_date: sem.end_date || "", description: sem.description || "" });
    setEditingSem(sem);
    setShowAdd(true);
  };

  const exportToCSV = () => {
    const headers = ["الاسم", "السنة", "الترم", "تاريخ البداية", "تاريخ النهاية", "الحالة", "الوصف"];
    const rows = semesters.map((s: any) => [s.name, s.year, s.term === 1 ? "الأول" : "الثاني", s.start_date, s.end_date, s.is_active ? "نشط" : "غير نشط", s.description || ""]);
    const csvContent = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute("download", "semesters.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div style={pageContainer}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "10px" }}>
        <h2 style={{ margin: 0, color: primary, fontSize: "20px", fontWeight: 700, display: "flex", alignItems: "center", gap: "8px" }}>
          <Calendar size={20} /> إدارة الأترام
        </h2>
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={() => { setEditingSem(null); setForm({ name: "", year: "", term: "1", start_date: "", end_date: "", description: "" }); setShowAdd(!showAdd); }} style={btnPrimary}><PlusCircle size={16} /> إضافة ترم</button>
          <button onClick={exportToCSV} style={btnOutline}><Download size={16} /> تصدير CSV</button>
        </div>
      </div>
      {showAdd && (
        <div style={formCardStyle}>
          <h3 style={{ margin: "0 0 15px", color: primary, fontSize: "15px" }}>{editingSem ? "تعديل ترم" : "إضافة ترم جديد"}</h3>
          <input type="text" placeholder="اسم الترم (مثال: 2026 - الترم الأول)" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={{ ...inputStyle, marginBottom: "10px" }} />
          <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
            <input type="number" placeholder="السنة" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} style={{ ...inputStyle, flex: 1 }} />
            <select value={form.term} onChange={(e) => setForm({ ...form, term: e.target.value })} style={{ ...inputStyle, flex: 1 }}>
              <option value="1">الترم الأول</option>
              <option value="2">الترم الثاني</option>
            </select>
          </div>
          <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
            <input type="date" placeholder="تاريخ البداية" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} style={{ ...inputStyle, flex: 1 }} />
            <input type="date" placeholder="تاريخ النهاية" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} style={{ ...inputStyle, flex: 1 }} />
          </div>
          <textarea placeholder="وصف الترم" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={{ ...inputStyle, minHeight: "60px", marginBottom: "10px" }} />
          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={saveSemester} style={btnPrimary}><Save size={16} /> حفظ</button>
            <button onClick={() => { setShowAdd(false); setEditingSem(null); }} style={{ background: bgLight, color: textGray, border: "none", padding: "10px 20px", borderRadius: "8px", cursor: "pointer", fontSize: "13px", display: "flex", alignItems: "center", gap: "6px" }}><X size={16} /> إلغاء</button>
          </div>
        </div>
      )}
      {loading ? (
        <p style={{ color: textGray, fontSize: "13px", textAlign: "center", padding: "20px" }}>جاري التحميل...</p>
      ) : semesters.length === 0 ? (
        <p style={{ color: textGray, fontSize: "13px", textAlign: "center", padding: "20px" }}>لا توجد أترام</p>
      ) : (
        <div style={{ display: "grid", gap: "12px" }}>
          {semesters.map((sem: any) => (
            <div key={sem.id} style={{ ...cardStyle, borderTop: `3px solid ${primary}`, border: "1px solid #f0f0f0", borderRadius: "8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                    <h3 style={{ margin: 0, color: textDark, fontSize: "15px", fontWeight: 600 }}>{sem.name}</h3>
                    {sem.is_active && <span style={{ background: green, color: "#fff", padding: "2px 10px", borderRadius: "12px", fontSize: "11px", fontWeight: 600 }}>نشط</span>}
                  </div>
                  <p style={{ margin: "2px 0", color: textGray, fontSize: "12px" }}>{sem.start_date || "—"} → {sem.end_date || "—"}</p>
                  {sem.description && <p style={{ margin: "2px 0", color: textGray, fontSize: "11px" }}>{sem.description}</p>}
                </div>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  <button onClick={() => startEdit(sem)} style={{ background: "#f0f4f4", color: primary, border: "none", padding: "6px 14px", borderRadius: "8px", cursor: "pointer", fontSize: "12px", display: "flex", alignItems: "center", gap: "4px", fontWeight: 500 }}><Pencil size={14} /> تعديل</button>
                  {!sem.is_active && <button onClick={() => setActive(sem.id)} style={{ background: "#e8f5e9", color: green, border: "none", padding: "6px 14px", borderRadius: "8px", cursor: "pointer", fontSize: "12px", display: "flex", alignItems: "center", gap: "4px", fontWeight: 500 }}><CheckCircle size={14} /> تعيين نشط</button>}
                  <button onClick={() => handleDelete(sem.id, sem.name)} style={{ background: "#fef5f5", color: red, border: "none", padding: "6px 14px", borderRadius: "8px", cursor: "pointer", fontSize: "12px", display: "flex", alignItems: "center", gap: "4px", fontWeight: 500 }}><Trash2 size={14} /> حذف</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ================= ربط المواد =================
const CourseOfferingPage: React.FC = () => {
  const API = "http://127.0.0.1:8000/api/admin";
  const collegeId = (() => { try { const u = JSON.parse(localStorage.getItem("user") || "{}"); return u.college_id; } catch { return null; } })();
  const [offerings, setOfferings] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [terms, setTerms] = useState<any[]>([]);
  const [activeTerm, setActiveTerm] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [adding, setAdding] = useState(false);
  const [step, setStep] = useState(0);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    department_ids: [] as number[], level: "", subject_id: "", study_type: "general", doctor_id: "", ta_id: "",
  });

  const toggleDept = (id: number) => {
    setForm(prev => ({
      ...prev,
      department_ids: prev.department_ids.includes(id)
        ? prev.department_ids.filter(d => d !== id)
        : [...prev.department_ids, id]
    }));
  };

  const filteredSubjects = subjects.filter((s: any) => {
    if (form.level && s.level !== Number(form.level)) return false;
    return true;
  });

  const filteredOfferings = offerings.filter((o: any) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (o.subject_name?.toLowerCase() || '').includes(q) || (o.doctor_name?.toLowerCase() || '').includes(q) || (o.department_name?.toLowerCase() || '').includes(q);
  });

  useEffect(() => {
    Promise.all([fetchOfferings(), fetchDepartments(), fetchDoctors(), fetchTerms()]);
  }, []);

  const fetchOfferings = async () => {
    try { setLoading(true); const res = await axios.get(`${API}/course-offerings`, { params: { college_id: collegeId } }); if (res.data.success) setOfferings(res.data.data); } catch (e) { console.error(e); } finally { setLoading(false); }
  };
  const fetchDepartments = async () => { try { const res = await axios.get(`${API}/departments`, { params: { college_id: collegeId } }); if (res.data.success) setDepartments(res.data.data); } catch (e) { console.error(e); } };
  const fetchSubjects = async () => { try { const res = await axios.get(`${API}/subjects`, { params: { college_id: collegeId } }); if (res.data.success) setSubjects(res.data.data); } catch (e) { console.error(e); } };
  const fetchDoctors = async () => { try { const res = await axios.get(`${API}/users`, { params: { role: 'doctor', college_id: collegeId } }); if (res.data.success) setDoctors(res.data.data); } catch (e) { console.error(e); } };
  const fetchTerms = async () => { try { const res = await axios.get(`${API}/terms`); if (res.data.success) { setTerms(res.data.data); const active = res.data.data.find((t: any) => t.is_active); if (active) setActiveTerm(active); } } catch (e) { console.error(e); } };

  const resetForm = () => { setForm({ department_ids: [], level: "", subject_id: "", study_type: "general", doctor_id: "", ta_id: "" }); setStep(0); };

  const addOffering = async () => {
    if (!form.subject_id || !form.doctor_id || form.department_ids.length === 0 || !form.level) { alert("يرجى اختيار التخصصات والمادة والدكتور"); return; }
    if (!activeTerm) { alert("لا يوجد ترم نشط، يرجى تفعيل ترم أولاً"); return; }
    setAdding(true);
    try {
      await Promise.all(form.department_ids.map(deptId =>
        axios.post(`${API}/course-offerings`, {
          subject_id: Number(form.subject_id), doctor_id: Number(form.doctor_id),
          ta_id: form.ta_id ? Number(form.ta_id) : null, department_id: deptId,
          level: Number(form.level), term_id: activeTerm.id, study_type: form.study_type,
        })
      ));
      resetForm(); setShowAdd(false); fetchOfferings();
    } catch (e: any) { alert(e.response?.data?.message || "فشل الربط"); }
    finally { setAdding(false); }
  };

  const handleDelete = async (id: number, subject: string) => {
    if (!window.confirm(`هل أنت متأكد من حذف ربط مادة ${subject}؟`)) return;
    try { const res = await axios.delete(`${API}/course-offerings/${id}`); if (res.data.success) fetchOfferings(); else alert(res.data.message || "فشل الحذف"); } catch (e: any) { alert(e.response?.data?.message || "فشل الحذف"); }
  };

  const exportToCSV = () => {
    const stl = (st: string) => st === "general" ? "نظري" : st === "both" ? "نظري+عملي" : st === "paid" ? "مدفوع" : st;
    const headers = ["المادة", "الكود", "الدكتور", "د. عملي", "القسم", "المستوى", "الترم", "النوع", "الطلاب"];
    const rows = offerings.map((o: any) => [o.subject_name, o.subject_code, o.doctor_name, o.ta_name || "—", o.department_name, o.level, o.term_name, stl(o.study_type), o.students_count]);
    const csvContent = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a"); const url = URL.createObjectURL(blob); link.href = url; link.setAttribute("download", "course_offerings.csv"); document.body.appendChild(link); link.click(); document.body.removeChild(link); URL.revokeObjectURL(url);
  };

  return (
    <div style={pageContainer}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "10px" }}>
        <h2 style={{ margin: 0, color: primary, fontSize: "20px", fontWeight: 700, display: "flex", alignItems: "center", gap: "8px" }}>
          <Link2 size={20} /> ربط المواد بالدكاترة
        </h2>
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={() => { resetForm(); fetchSubjects(); setShowAdd(!showAdd); }} style={btnPrimary}><PlusCircle size={16} /> ربط مادة جديدة</button>
          <button onClick={exportToCSV} style={btnOutline}><Download size={16} /> تصدير CSV</button>
        </div>
      </div>

      {activeTerm ? (
        <div style={{ background: "#E8F5E9", padding: "10px 16px", borderRadius: "8px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#2e7d32" }}>
          <CheckCircle size={16} /> الترم النشط: {activeTerm.name}
        </div>
      ) : (
        <div style={{ background: "#fff3e0", padding: "10px 16px", borderRadius: "8px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#e65100" }}>
          <Calendar size={16} /> لا يوجد ترم نشط. يرجى تفعيل ترم من صفحة الأترام.
        </div>
      )}

      {showAdd && (
        <div style={formCardStyle}>
          <h3 style={{ margin: "0 0 16px", color: primary, fontSize: "15px" }}>
            {step === 0 ? "اختر التخصص" : step === 1 ? "اختر المستوى" : step === 2 ? "اختر المادة" : step === 3 ? "اختر نوع الدراسة" : "اختر الدكتور"}
          </h3>
          <div style={{ display: "flex", gap: "6px", marginBottom: "20px" }}>
            {[0, 1, 2, 3, 4].map((s) => (
              <div key={s} style={{ flex: 1, height: "4px", borderRadius: "2px", background: step >= s ? primary : "#e0e0e0" }} />
            ))}
          </div>

          {step === 0 && (
            <div>
              <p style={{ fontSize: "13px", color: textGray, marginBottom: "12px" }}>اختر التخصصات (يمكنك اختيار أكثر من تخصص)</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "10px" }}>
                {departments.map((d: any) => {
                  const selected = form.department_ids.includes(d.id);
                  return (
                    <div key={d.id} onClick={() => toggleDept(d.id)} style={{ padding: "12px 16px", borderRadius: "8px", border: selected ? `2px solid ${primary}` : "1px solid #e0e0e0", background: selected ? "rgba(29,76,79,0.08)" : cardBg, cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ width: "18px", height: "18px", borderRadius: "3px", border: selected ? `2px solid ${primary}` : "1px solid #ccc", background: selected ? primary : "transparent", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "11px", fontWeight: 700, flexShrink: 0 }}>{selected ? "✓" : ""}</span>
                      <p style={{ margin: 0, fontWeight: 600, fontSize: "13px", color: textDark }}>{d.name}</p>
                    </div>
                  );
                })}
              </div>
              <button onClick={() => { if (form.department_ids.length === 0) { alert("يرجى اختيار تخصص واحد على الأقل"); return; } setStep(1); }} style={{ ...btnPrimary, marginTop: "12px" }}><Save size={14} /> تأكيد</button>
            </div>
          )}

          {step === 1 && (
            <div>
              <p style={{ fontSize: "13px", color: textGray, marginBottom: "12px" }}>اختر المستوى الدراسي</p>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                {[1, 2, 3, 4].map((lvl) => (
                  <div key={lvl} onClick={() => { setForm({ ...form, level: String(lvl) }); setStep(2); }} style={{ padding: "12px 24px", borderRadius: "8px", border: form.level === String(lvl) ? `2px solid ${primary}` : "1px solid #e0e0e0", background: form.level === String(lvl) ? "rgba(29,76,79,0.05)" : cardBg, cursor: "pointer", textAlign: "center" }}>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: "14px", color: textDark }}>المستوى {lvl === 1 ? "الأول" : lvl === 2 ? "الثاني" : lvl === 3 ? "الثالث" : "الرابع"}</p>
                  </div>
                ))}
              </div>
              <button onClick={() => setStep(0)} style={{ ...btnOutline, marginTop: "12px" }}><X size={14} /> رجوع</button>
            </div>
          )}

          {step === 2 && (
            <div>
              <p style={{ fontSize: "13px", color: textGray, marginBottom: "12px" }}>اختر المادة التي تريد ربطها</p>
              {filteredSubjects.length === 0 ? (
                <p style={{ fontSize: "13px", color: "#e65100" }}>لا توجد مواد تطابق الاختيار. يرجى إضافة مادة أولاً.</p>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "8px" }}>
                  {filteredSubjects.map((s: any) => (
                    <div key={s.id} onClick={() => { setForm({ ...form, subject_id: String(s.id) }); setStep(3); }} style={{ padding: "12px 14px", borderRadius: "8px", border: form.subject_id === String(s.id) ? `2px solid ${primary}` : "1px solid #e0e0e0", background: form.subject_id === String(s.id) ? "rgba(29,76,79,0.05)" : cardBg, cursor: "pointer" }}>
                      <p style={{ margin: 0, fontWeight: 600, fontSize: "13px", color: textDark }}>{s.name}</p>
                      <p style={{ margin: "4px 0 0 0", fontSize: "11px", color: textGray }}>{s.code}</p>
                    </div>
                  ))}
                </div>
              )}
              <button onClick={() => setStep(1)} style={{ ...btnOutline, marginTop: "12px" }}><X size={14} /> رجوع</button>
            </div>
          )}

          {step === 3 && (
            <div>
              <p style={{ fontSize: "13px", color: textGray, marginBottom: "12px" }}>هل المادة تحتوي على جانب عملي؟</p>
              <div style={{ display: "flex", gap: "12px" }}>
                <div onClick={() => { setForm({ ...form, study_type: "general", ta_id: "" }); setStep(4); }} style={{ flex: 1, padding: "20px", borderRadius: "8px", border: form.study_type === "general" ? `2px solid ${primary}` : "2px solid #e8ecec", background: form.study_type === "general" ? "rgba(29,76,79,0.05)" : cardBg, cursor: "pointer", textAlign: "center" }}>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: "14px", color: textDark }}>نظري</p>
                </div>
                <div onClick={() => { setForm({ ...form, study_type: "both" }); setStep(4); }} style={{ flex: 1, padding: "20px", borderRadius: "8px", border: form.study_type === "both" ? `2px solid ${primary}` : "2px solid #e8ecec", background: form.study_type === "both" ? "rgba(29,76,79,0.05)" : cardBg, cursor: "pointer", textAlign: "center" }}>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: "14px", color: textDark }}>نظري + عملي</p>
                </div>
              </div>
              <button onClick={() => setStep(2)} style={{ ...btnOutline, marginTop: "12px" }}><X size={14} /> رجوع</button>
            </div>
          )}

          {step === 4 && (
            <div>
              <p style={{ fontSize: "13px", color: textGray, marginBottom: "12px" }}>اختر الدكتور {form.study_type === "both" ? "النظري" : ""}</p>
              {doctors.length === 0 ? (
                <p style={{ fontSize: "13px", color: "#e65100" }}>لا يوجد دكاترة. يرجى إضافة دكتور أولاً.</p>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "8px" }}>
                  {doctors.map((d: any) => (
                    <div key={d.id} onClick={() => setForm({ ...form, doctor_id: String(d.id) })} style={{ padding: "12px 14px", borderRadius: "8px", border: form.doctor_id === String(d.id) ? `2px solid ${primary}` : "1px solid #e0e0e0", background: form.doctor_id === String(d.id) ? "rgba(29,76,79,0.05)" : cardBg, cursor: "pointer" }}>
                      <p style={{ margin: 0, fontWeight: 600, fontSize: "13px", color: textDark }}>{d.name}</p>
                      <p style={{ margin: "4px 0 0 0", fontSize: "11px", color: textGray }}>{d.email}</p>
                      {d.department_name && <p style={{ margin: "2px 0 0 0", fontSize: "10px", color: "#888" }}>{d.department_name}{d.study_type ? ` (${d.study_type === 'general' ? 'عام' : d.study_type === 'paid' ? 'نفقة' : d.study_type})` : ''}</p>}
                    </div>
                  ))}
                </div>
              )}
              {form.study_type === "both" && (
                <div style={{ marginTop: "12px" }}>
                  <p style={{ fontSize: "12px", color: textGray, marginBottom: "6px" }}>اختر الدكتور العملي (اختياري)</p>
                  <select value={form.ta_id} onChange={(e) => setForm({ ...form, ta_id: e.target.value })} style={inputStyle}>
                    <option value="">بدون دكتور عملي</option>
                    {doctors.map((d: any) => (<option key={d.id} value={d.id} disabled={String(d.id) === form.doctor_id}>{d.name}{d.department_name ? ` - ${d.department_name}` : ''}{d.study_type ? ` (${d.study_type === 'general' ? 'عام' : d.study_type === 'paid' ? 'نفقة' : d.study_type})` : ''}</option>))}
                  </select>
                </div>
              )}
              <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
                <button onClick={addOffering} disabled={!form.doctor_id || adding} style={{ ...btnPrimary, opacity: !form.doctor_id || adding ? 0.6 : 1 }}>
                  {adding ? "جاري الحفظ..." : <><Save size={16} /> تأكيد الربط</>}
                </button>
                <button onClick={() => setStep(3)} style={btnOutline}><X size={14} /> رجوع</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Search */}
      <input type="text" placeholder="بحث باسم المادة أو الدكتور أو القسم..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ ...inputStyle, marginBottom: "16px" }} />

      {loading ? (
        <p style={{ color: textGray, fontSize: "13px", textAlign: "center", padding: "20px" }}>جاري التحميل...</p>
      ) : filteredOfferings.length === 0 ? (
        <div style={{ ...cardStyle, textAlign: "center", padding: "30px" }}>
          <p style={{ color: textGray }}>{offerings.length === 0 ? "لا توجد مواد مرتبطة" : "لا توجد نتائج للبحث"}</p>
          {offerings.length === 0 && <button onClick={() => { resetForm(); fetchSubjects(); setShowAdd(true); }} style={{ ...btnPrimary, marginTop: "10px" }}><PlusCircle size={16} /> إضافة ربط</button>}
        </div>
      ) : (
        <div>
          <h3 style={{ margin: "0 0 15px", color: primary, fontSize: "14px", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px" }}>
            <ClipboardList size={16} /> جميع المواد المرتبطة ({filteredOfferings.length})
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "16px" }}>
            {filteredOfferings.map((off: any) => (
              <div key={off.id} style={{ background: cardBg, borderRadius: "8px", boxShadow: "0 1px 6px rgba(0,0,0,0.06)", border: "1px solid #f0f0f0", borderTop: `3px solid ${primary}`, padding: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                  <h4 style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: primary }}>{off.subject_name}</h4>
                  <span style={{ background: "rgba(29,76,79,0.1)", color: primary, padding: "2px 10px", borderRadius: "12px", fontSize: "11px", fontWeight: 600, direction: "ltr", display: "inline-block" }}>{off.subject_code}</span>
                </div>
                <p style={{ margin: "0 0 10px", fontSize: "12px", color: textGray }}>{off.department_name} - المستوى {off.level}</p>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "10px" }}>
                  <span style={{ background: "rgba(29,76,79,0.08)", color: primary, padding: "3px 10px", borderRadius: "12px", fontSize: "11px", fontWeight: 500 }}>{off.study_type === "general" ? "نظري" : off.study_type === "both" ? "نظري+عملي" : off.study_type}</span>
                </div>
                <div style={{ fontSize: "12px", color: textGray, marginBottom: "4px" }}>
                  الدكتور: <strong style={{ color: textDark }}>{off.doctor_name}</strong>
                </div>
                {off.ta_name && (
                  <div style={{ fontSize: "12px", color: textGray, marginBottom: "4px" }}>
                    د. عملي: <strong style={{ color: textDark }}>{off.ta_name}</strong>
                  </div>
                )}
                <div style={{ display: "flex", gap: "12px", fontSize: "11px", color: textGray, marginTop: "8px", marginBottom: "10px" }}>
                  <span>الطلاب: <strong style={{ color: textDark }}>{off.students_count || 0}</strong></span>
                  <span>الترم: <strong style={{ color: textDark }}>{off.term_name}</strong></span>
                </div>
                <button onClick={() => handleDelete(off.id, off.subject_name)} style={{ width: "100%", background: "transparent", color: red, border: "1px solid #f5c6cb", padding: "8px", borderRadius: "6px", cursor: "pointer", fontSize: "12px", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}>
                  <Trash2 size={14} /> حذف الربط
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ================= التقارير =================
const ReportsPage: React.FC = () => {
  const API = "http://127.0.0.1:8000/api/admin";
  const collegeId = (() => { try { const u = JSON.parse(localStorage.getItem("user") || "{}"); return u.college_id; } catch { return null; } })();
  const [exporting, setExporting] = useState<string | null>(null);
  const [showFilter, setShowFilter] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [currentType, setCurrentType] = useState("");
  const [currentTitle, setCurrentTitle] = useState("");
  const [reportData, setReportData] = useState<any>(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [departments, setDepartments] = useState<any[]>([]);
  const [levels] = useState([1,2,3,4,5,6,7,8]);
  const [filters, setFilters] = useState<any>({});
  const [studyTypes] = useState(["عام", "موازي"]);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await axios.get(`${API}/departments`, { params: { college_id: collegeId } });
      if (res.data.success) setDepartments(res.data.data);
    } catch {}
  };

  const reportFilterConfig: Record<string, any[]> = {
    students: [
      { key: "department_id", label: "القسم", type: "dept_select", desc: "اختر قسماً معيناً أو كل الأقسام" },
      { key: "level", label: "المستوى", type: "level_select", desc: "اختر مستوى معيناً أو كل المستويات" },
      { key: "study_type", label: "نوع الدراسة", type: "study_type_select", desc: "عام أو موازي" },
    ],
    subjects: [
      { key: "department_id", label: "القسم", type: "dept_select", desc: "اختر قسماً معيناً أو كل الأقسام" },
      { key: "level", label: "المستوى", type: "level_select", desc: "اختر مستوى معيناً أو كل المستويات" },
      { key: "study_type", label: "نوع الدراسة", type: "study_type_select", desc: "عام أو موازي" },
    ],
    instructors: [
      { key: "department_id", label: "القسم", type: "dept_select", desc: "اختر قسماً معيناً أو كل الأقسام" },
    ],
    "course-offerings": [
      { key: "department_id", label: "القسم", type: "dept_select", desc: "اختر قسماً معيناً أو كل الأقسام" },
      { key: "level", label: "المستوى", type: "level_select", desc: "اختر مستوى معيناً أو كل المستويات" },
      { key: "study_type", label: "نوع الدراسة", type: "study_type_select", desc: "عام أو موازي" },
    ],
  };

  const openFilter = (type: string, title: string) => {
    setCurrentType(type);
    setCurrentTitle(title);
    setFilters({});
    setShowFilter(true);
  };

  const fetchReport = async (type: string, title: string, filterParams: any) => {
    setReportLoading(true);
    setCurrentTitle(title);
    setCurrentType(type);
    setSearchTerm("");
    setShowReport(true);
    setShowFilter(false);
    try {
      const params: any = { college_id: collegeId };
      Object.entries(filterParams).forEach(([k, v]) => { if (v) params[k] = v; });
      const res = await axios.get(`${API}/reports/${type}`, { params });
      if (res.data.success) setReportData(res.data);
      else { setReportData(null); alert(res.data.message); }
    } catch { setReportData(null); alert("خطأ في تحميل التقرير"); }
    finally { setReportLoading(false); }
  };

  const exportReport = async (type: string, title: string) => {
    setExporting(type);
    try {
      const params: any = { college_id: collegeId };
      Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v; });
      const res = await axios.get(`${API}/reports/${type}`, { params });
      const data = res.data.data || [];
      if (!Array.isArray(data) || data.length === 0) {
        alert("لا توجد بيانات للتصدير");
        setExporting(null);
        return;
      }
      const headers = Object.keys(data[0]);
      const rows = data.map((row: any) => headers.map((h: string) => String(row[h] ?? "")));
      const csvContent = [headers, ...rows].map(r => r.join(",")).join("\n");
      const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.href = url;
      link.setAttribute("download", `${title}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e: any) {
      alert(e.response?.data?.message || "فشل تصدير التقرير");
    }
    finally { setExporting(null); }
  };

  const printReport = () => { window.print(); };

  const filteredData = reportData?.data?.filter((row: any) => {
    if (!searchTerm) return true;
    return Object.values(row).some((val: any) =>
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    );
  }) || [];

  const renderFilterField = (field: any) => {
    const common = { ...inputStyle, marginBottom: "10px" };
    if (field.type === "dept_select") {
      return (
        <select value={filters.department_id || ""} onChange={(e) => setFilters({...filters, department_id: e.target.value})} style={common}>
          <option value="">جميع الأقسام</option>
          {departments.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
      );
    }
    if (field.type === "level_select") {
      return (
        <select value={filters.level || ""} onChange={(e) => setFilters({...filters, level: e.target.value})} style={common}>
          <option value="">جميع المستويات</option>
          {levels.map(l => <option key={l} value={l}>المستوى {l}</option>)}
        </select>
      );
    }
    if (field.type === "study_type_select") {
      return (
        <select value={filters.study_type || ""} onChange={(e) => setFilters({...filters, study_type: e.target.value})} style={common}>
          <option value="">جميع أنواع الدراسة</option>
          {studyTypes.map(st => <option key={st} value={st}>{st}</option>)}
        </select>
      );
    }
    return null;
  };

  const reports = [
    { key: "students", title: "تقرير الطلاب", description: "إحصائيات أعداد الطلاب حسب الأقسام" },
    { key: "subjects", title: "تقرير المواد", description: "جميع المواد وعدد الطلاب المسجلين" },
    { key: "instructors", title: "تقرير الدكاترة", description: "الدكاترة والمواد المخصصة لهم" },
    { key: "course-offerings", title: "تقرير الشعب", description: "جميع الشعب الدراسية المسجلة" },
  ];

  return (
    <div style={pageContainer}>
      <h2 style={{ margin: "0 0 20px", color: primary, fontSize: "20px", fontWeight: 700 }}>التقارير والإحصائيات</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px", marginBottom: "24px" }}>
        {reports.map((report) => (
          <div key={report.key} style={{ background: cardBg, borderRadius: "8px", boxShadow: "0 1px 6px rgba(0,0,0,0.06)", border: "1px solid #f0f0f0", borderTop: `3px solid ${primary}`, padding: "20px", textAlign: "center" }}>
            <h3 style={{ margin: "0 0 4px", color: textDark, fontSize: "15px", fontWeight: 700 }}>{report.title}</h3>
            <p style={{ margin: "0 0 14px", color: textGray, fontSize: "11px" }}>{report.description}</p>
            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={() => openFilter(report.key, report.title)} style={{ flex: 1, background: primary, color: "#fff", border: "none", padding: "8px", borderRadius: "6px", cursor: "pointer", fontSize: "11px", fontWeight: 600 }}>عرض التقرير</button>
              <button onClick={() => exportReport(report.key, report.title)} disabled={exporting === report.key} style={{ flex: 1, background: "transparent", color: primary, border: `1px solid ${primary}`, padding: "8px", borderRadius: "6px", cursor: "pointer", fontSize: "11px", fontWeight: 600, opacity: exporting === report.key ? 0.6 : 1 }}>
                {exporting === report.key ? "جاري..." : "تصدير CSV"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Modal */}
      {showFilter && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#fff", padding: "24px", borderRadius: "8px", width: "420px", boxShadow: "0 8px 30px rgba(0,0,0,0.15)", borderTop: `3px solid ${primary}` }}>
            <h3 style={{ color: primary, margin: "0 0 4px", fontSize: "16px", fontWeight: 700 }}>{currentTitle}</h3>
            <p style={{ color: textGray, fontSize: "12px", margin: "0 0 16px" }}>اختر الفلاتر لعرض التقرير</p>
            {(reportFilterConfig[currentType] || []).map((field: any) => (
              <div key={field.key} style={{ marginBottom: "8px" }}>
                <label style={{ display: "block", fontWeight: 600, marginBottom: "2px", color: "#333", fontSize: "13px" }}>{field.label}</label>
                <p style={{ margin: "0 0 6px", fontSize: "11px", color: textGray }}>{field.desc}</p>
                {renderFilterField(field)}
              </div>
            ))}
            <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
              <button onClick={() => fetchReport(currentType, currentTitle, filters)} style={{ flex: 1, background: primary, color: "#fff", border: "none", padding: "10px", borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: 600 }}>عرض التقرير</button>
              <button onClick={() => setShowFilter(false)} style={{ flex: 1, background: "#eee", color: "#333", border: "none", padding: "10px", borderRadius: "6px", cursor: "pointer", fontSize: "13px" }}>إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReport && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, overflowY: "auto" }}>
          <div style={{ background: "#fff", borderRadius: "8px", width: "80%", maxWidth: "900px", maxHeight: "85vh", display: "flex", flexDirection: "column", boxShadow: "0 8px 30px rgba(0,0,0,0.15)" }}>
            <div style={{ background: primary, padding: "14px 20px", color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 700 }}>{currentTitle}</h3>
              <button onClick={() => setShowReport(false)} style={{ background: "rgba(255,255,255,0.15)", color: "#fff", border: "none", padding: "6px 14px", borderRadius: "6px", cursor: "pointer", fontSize: "13px" }}>✕ إغلاق</button>
            </div>
            {reportLoading ? (
              <div style={{ padding: "40px", textAlign: "center", color: "#888" }}>جاري تحميل التقرير...</div>
            ) : reportData && reportData.data ? (
              <>
                {reportData.summary && (
                  <div style={{ padding: "14px 20px", background: "#f7f9fb", borderBottom: "1px solid #f0f0f0" }}>
                    <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                      {Object.entries(reportData.summary).map(([key, value]) => (
                        <div key={key} style={{ background: "#fff", padding: "10px 18px", borderRadius: "6px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
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
                  <button onClick={() => exportReport(currentType, currentTitle)} style={{ background: "transparent", color: primary, border: `1px solid ${primary}`, padding: "6px 14px", borderRadius: "6px", cursor: "pointer", fontSize: "12px", fontWeight: 600 }}>CSV</button>
                  <button onClick={printReport} style={{ background: "transparent", color: primary, border: `1px solid ${primary}`, padding: "6px 14px", borderRadius: "6px", cursor: "pointer", fontSize: "12px", fontWeight: 600 }}>طباعة</button>
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

// ================= الملف الشخصي =================
const ProfilePage: React.FC = () => {
  const API = "http://127.0.0.1:8000/api/admin";
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ phone: "" });
  const [showPwd, setShowPwd] = useState(false);
  const [pwdForm, setPwdForm] = useState({ current: "", newPwd: "", confirm: "" });
  const [pwdMsg, setPwdMsg] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const stored = localStorage.getItem("user");
        if (!stored) return;
        const user = JSON.parse(stored);
        const res = await axios.get(`${API}/profile/${user.id}`);
        if (res.data.success) { setProfile(res.data.data); setEditForm({ phone: res.data.data.phone || "" }); }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchProfile();
  }, []);

  const handleUpdate = async () => {
    try {
      const stored = localStorage.getItem("user");
      if (!stored) return;
      const user = JSON.parse(stored);
      const res = await axios.put(`${API}/profile/${user.id}`, { phone: editForm.phone });
      if (res.data.success) {
        setProfile({ ...profile, phone: editForm.phone });
        setIsEditing(false);
      } else { alert(res.data.message || "فشل حفظ البيانات"); }
    } catch (e: any) { alert(e.response?.data?.message || "فشل حفظ البيانات"); }
  };

  const roleLabel: Record<string, string> = { college_manager: "مدير كلية", system_admin: "مدير النظام", doctor: "دكتور", student: "طالب" };

  const handlePwdChange = () => {
    if (pwdForm.newPwd !== pwdForm.confirm) { setPwdMsg("كلمة المرور الجديدة غير متطابقة"); return; }
    if (pwdForm.newPwd.length < 6) { setPwdMsg("كلمة المرور يجب أن تكون 6 أحرف على الأقل"); return; }
    alert("تم تغيير كلمة المرور");
    setPwdForm({ current: "", newPwd: "", confirm: "" });
    setPwdMsg("");
  };

  const getQrUrl = (val: string) => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(val)}`;
  };

  if (loading) return <div style={pageContainer}><p style={{ color: textGray, fontSize: "13px", textAlign: "center", padding: "20px" }}>جاري التحميل...</p></div>;
  if (!profile) return <div style={pageContainer}><p style={{ color: textGray, fontSize: "13px", textAlign: "center", padding: "20px" }}>تعذر تحميل الملف الشخصي</p></div>;

  return (
    <div style={pageContainer}>
      <h2 style={{ margin: "0 0 20px", color: primary, fontSize: "20px", fontWeight: 700, display: "flex", alignItems: "center", gap: "8px" }}>
        <UserCircle size={20} /> الملف الشخصي
      </h2>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
        <div style={cardStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "16px" }}>
            <div style={{ width: "60px", height: "60px", borderRadius: "8px", background: "rgba(29, 76, 79, 0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <UserCircle size={30} color="#1D4C4F" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: "16px", color: textDark }}>{profile.name}</h3>
              <p style={{ margin: "4px 0 0 0", color: textGray, fontSize: "13px" }}>{roleLabel[profile.role] || profile.role}</p>
            </div>
          </div>

          <table style={{ width: "100%", fontSize: "13px" }}>
            <tbody>
              <tr><td style={{ padding: "6px 0", color: "#888", width: "110px" }}>البريد الإلكتروني</td><td style={{ padding: "6px 0", fontWeight: 600 }}>{profile.email}</td></tr>
              <tr><td style={{ padding: "6px 0", color: "#888" }}>رقم الهاتف</td><td style={{ padding: "6px 0", fontWeight: 600 }}>{profile.phone || "—"}</td></tr>
              <tr><td style={{ padding: "6px 0", color: "#888" }}>الكلية</td><td style={{ padding: "6px 0", fontWeight: 600 }}>{profile.college_name || "—"}</td></tr>
              <tr><td style={{ padding: "6px 0", color: "#888" }}>القسم</td><td style={{ padding: "6px 0", fontWeight: 600 }}>{profile.department_name || "—"}</td></tr>
              <tr><td style={{ padding: "6px 0", color: "#888" }}>الصلاحية</td><td style={{ padding: "6px 0", fontWeight: 600 }}>{roleLabel[profile.role] || profile.role}</td></tr>
            </tbody>
          </table>
        </div>

        <div style={{ ...cardStyle, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
          <h3 style={{ margin: "0 0 12px", fontSize: "14px", color: textDark, fontWeight: 700 }}>رمز QR</h3>
          {profile.qr_code ? (
            <div>
              <img src={getQrUrl(profile.qr_code)} alt="QR" style={{ width: "150px", height: "150px", borderRadius: "6px", border: "1px solid #ddd" }} />
              <p style={{ margin: "8px 0 0 0", fontSize: "11px", color: textGray, wordBreak: "break-all" }}>{profile.qr_code}</p>
            </div>
          ) : (
            <p style={{ color: textGray, fontSize: "13px" }}>لا يوجد رمز QR</p>
          )}
        </div>
      </div>

      {/* تحديث البيانات */}
      <div style={{ ...cardStyle, marginTop: "16px" }}>
        <h3 style={{ margin: "0 0 12px", fontSize: "14px", color: textDark, fontWeight: 700, display: "flex", alignItems: "center", gap: "6px" }}>
          <Pencil size={16} /> تحديث البيانات
        </h3>
        {isEditing ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <input type="text" placeholder="رقم الهاتف" value={editForm.phone} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} style={inputStyle} />
            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={handleUpdate} style={btnPrimary}><Save size={14} /> حفظ</button>
              <button onClick={() => setIsEditing(false)} style={{ background: "#eee", color: "#333", border: "none", padding: "10px 20px", borderRadius: "8px", cursor: "pointer", fontSize: "13px", display: "flex", alignItems: "center", gap: "6px" }}><X size={14} /> إلغاء</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setIsEditing(true)} style={{ width: "100%", background: "#f0f3f6", border: "1px solid #ddd", padding: "10px", borderRadius: "8px", textAlign: "center", cursor: "pointer", color: "#333", fontSize: "13px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
            <Pencil size={14} /> تعديل رقم الهاتف
          </button>
        )}
      </div>

      {/* تغيير كلمة المرور */}
      <div style={{ ...cardStyle, marginTop: "16px" }}>
        <h3 style={{ margin: "0 0 12px", fontSize: "14px", color: textDark, fontWeight: 700, display: "flex", alignItems: "center", gap: "6px" }}>
          <Lock size={16} /> تغيير كلمة المرور
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <input type={showPwd ? "text" : "password"} placeholder="كلمة المرور الحالية" value={pwdForm.current} onChange={e => setPwdForm({...pwdForm, current: e.target.value})} style={inputStyle} />
          <input type={showPwd ? "text" : "password"} placeholder="كلمة المرور الجديدة" value={pwdForm.newPwd} onChange={e => setPwdForm({...pwdForm, newPwd: e.target.value})} style={inputStyle} />
          <input type={showPwd ? "text" : "password"} placeholder="تأكيد كلمة المرور" value={pwdForm.confirm} onChange={e => setPwdForm({...pwdForm, confirm: e.target.value})} style={inputStyle} />
          <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#888", cursor: "pointer" }}>
            <input type="checkbox" checked={showPwd} onChange={() => setShowPwd(!showPwd)} /> إظهار كلمة المرور
          </label>
          {pwdMsg && <p style={{ margin: 0, fontSize: "12px", color: "#dc3545" }}>{pwdMsg}</p>}
          <button onClick={handlePwdChange} style={btnPrimary}><Lock size={14} /> تغيير كلمة المرور</button>
        </div>
      </div>
    </div>
  );
};

// ================= سجل العمليات =================
const ACTION_LIST_MM = [
  "جميع الإجراءات",
  // إدارة المستخدمين
  "إنشاء حساب", "تعديل حساب", "حذف حساب", "تفعيل حساب", "تعطيل حساب", "إعادة تعيين كلمة المرور",
  // الارتباطات
  "قبول طلب ارتباط", "رفض طلب ارتباط", "إلغاء ارتباط طالب", "ربط مادة", "فك ارتباط مادة",
  // الأقسام والكليات
  "إنشاء قسم", "تعديل قسم", "حذف قسم",
  // المواد
  "إنشاء مادة", "تعديل مادة", "حذف مادة",
  // الإعلانات والإشعارات
  "نشر إعلان", "حذف إعلان", "إرسال إشعار عام",
  // النظام
  "تسجيل دخول", "تسجيل خروج", "تعديل إعدادات النظام", "تعديل إعدادات المادة",
];

const AuditLogPage: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({ action: "", from_date: "", to_date: "", role: "" });
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
      if (filters.role) params.append("role", filters.role);
      params.append("page", String(p));
      params.append("per_page", "100");
      const res = await fetch(`${API}/admin/audit-logs?${params}`);
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
      if (filters.role) params.append("role", filters.role);
      const res = await fetch(`${API}/admin/audit-logs/${format}?${params}`);
      if (!res.ok) { alert("خطأ في التصدير"); return; }
      const blob = await res.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.setAttribute("download", `audit_logs.${format}`);
      document.body.appendChild(link); link.click();
      document.body.removeChild(link); URL.revokeObjectURL(link.href);
    } catch { alert("خطأ في التصدير"); }
  };

  const formatTime = (t: string) => {
    if (!t) return "";
    const d = new Date(t);
    return d.toLocaleDateString("ar-SA", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  const totalPages = Math.ceil(total / 100);

  return (
    <div style={pageContainer}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
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
            {ACTION_LIST_MM.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
        <div>
          <label style={{ display: "block", fontSize: 11, color: textGray, marginBottom: 4 }}>الدور</label>
          <select value={filters.role} onChange={(e) => setFilters({ ...filters, role: e.target.value })} style={{ ...inputStyle, width: "140px" }}>
            <option value="">جميع الأدوار</option>
            <option value="doctor">دكتور</option>
            <option value="student">طالب</option>
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
                <tr><td colSpan={5} style={{ padding: "30px", textAlign: "center", color: "#888" }}>لا توجد سجلات</td></tr>
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
              ...(p === page ? btnPrimary : btnOutline),
              minWidth: 36, textAlign: "center", padding: "6px 14px",
            }}>{p}</button>
          ))}
        </div>
      )}
    </div>
  );
};

// ================= سجل الطلاب =================
const OfficialStudentsPage: React.FC = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [levelFilter, setLevelFilter] = useState("");
  const [importData, setImportData] = useState("");
  const [showImport, setShowImport] = useState(false);
  const [importMode, setImportMode] = useState<"text" | "excel">("text");
  const [importFiles, setImportFiles] = useState<File[]>([]);
  const [importLoading, setImportLoading] = useState(false);
  const [form, setForm] = useState({ academic_number: "", student_name: "", department_id: "", level: "" });
  const API = "http://127.0.0.1:8000/api/admin";
  const collegeId = (() => { try { const u = JSON.parse(localStorage.getItem("user") || "{}"); return u.college_id; } catch { return null; } })();

  useEffect(() => { fetchStudents(); fetchDepartments(); }, []);

  useEffect(() => {
    const timer = setTimeout(() => { fetchStudents(); }, 300);
    return () => clearTimeout(timer);
  }, [search, deptFilter, levelFilter]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const params: any = { college_id: collegeId };
      if (search) params.search = search;
      if (deptFilter) params.department_id = deptFilter;
      if (levelFilter) params.level = levelFilter;
      const res = await axios.get(`${API}/official-students`, { params });
      if (res.data.success) setStudents(res.data.data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const fetchDepartments = async () => {
    try {
      const res = await axios.get(`${API}/departments`, { params: { college_id: collegeId } });
      if (res.data.success) setDepartments(res.data.data);
    } catch (e) { console.error(e); }
  };

  const resetForm = () => { setForm({ academic_number: "", student_name: "", department_id: "", level: "" }); setEditing(null); };

  const saveStudent = async () => {
    if (!form.academic_number || !form.student_name || !form.department_id || !form.level) { alert("يرجى ملء جميع الحقول"); return; }
    try {
      const payload = { ...form, college_id: collegeId, department_id: Number(form.department_id), level: Number(form.level) };
      if (editing) {
        const res = await axios.put(`${API}/official-students/${editing.id}`, payload);
        if (!res.data.success) { alert(res.data.message || "فشل التعديل"); return; }
      } else {
        const res = await axios.post(`${API}/official-students`, payload);
        if (!res.data.success) { alert(res.data.message || "فشل الإضافة"); return; }
      }
      resetForm();
      setShowForm(false);
      fetchStudents();
    } catch (e: any) { alert(e.response?.data?.message || "حدث خطأ"); }
  };

  const startEdit = (s: any) => {
    setForm({ academic_number: s.academic_number, student_name: s.student_name, department_id: String(s.department_id), level: String(s.level) });
    setEditing(s);
    setShowForm(true);
  };

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`هل تريد حذف الطالب ${name}؟`)) return;
    try {
      const res = await axios.delete(`${API}/official-students/${id}`);
      if (res.data.success) fetchStudents();
      else alert(res.data.message || "فشل الحذف");
    } catch (e) { console.error(e); }
  };

  const parseExcelFile = async (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target!.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: "array" });
          const sheet = workbook.Sheets[workbook.SheetNames[0]];
          const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });
          const result: any[] = [];
          for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            if (!row || row.length < 4) continue;
            const academic_number = String(row[0] ?? "").trim();
            const student_name = String(row[1] ?? "").trim();
            const deptVal = String(row[2] ?? "").trim();
            const level = Number(row[3]);
            if (!academic_number || !student_name || !deptVal || !level) continue;
            const deptById = departments.find((d: any) => String(d.id) === deptVal);
            const deptByName = departments.find((d: any) => d.name === deptVal);
            const dept = deptById || deptByName;
            if (!dept) continue;
            result.push({ academic_number, student_name, department_id: dept.id, level });
          }
          resolve(result);
        } catch (err) { reject(err); }
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  };

  const handleImport = async () => {
    setImportLoading(true);
    try {
      let students: any[] = [];
      if (importMode === "excel" && importFiles.length > 0) {
        for (const file of importFiles) {
          const parsed = await parseExcelFile(file);
          students = students.concat(parsed);
        }
      } else {
        if (!importData.trim()) { alert("يرجى لصق البيانات"); setImportLoading(false); return; }
        const lines = importData.trim().split("\n");
        for (const line of lines) {
          const parts = line.trim().split("\t");
          if (parts.length < 4) continue;
          const [academic_number, student_name, deptVal, level] = parts;
          const deptById = departments.find((d: any) => String(d.id) === deptVal.trim());
          const deptByName = departments.find((d: any) => d.name === deptVal.trim());
          const dept = deptById || deptByName;
          if (!dept) continue;
          students.push({ academic_number: academic_number.trim(), student_name: student_name.trim(), department_id: dept.id, level: Number(level.trim()) });
        }
      }
      if (students.length === 0) { alert("لا توجد بيانات صالحة للاستيراد (تأكد من تطابق الأقسام)"); setImportLoading(false); return; }
      const res = await axios.post(`${API}/official-students/import`, { college_id: collegeId, students });
      if (res.data.success) { alert(res.data.message); setImportData(""); setImportFiles([]); setShowImport(false); fetchStudents(); }
      else alert(res.data.message || "فشل الاستيراد");
    } catch (e: any) { alert(e.response?.data?.message || "حدث خطأ في قراءة الملف"); }
    setImportLoading(false);
  };

  const exportCSV = () => {
    if (students.length === 0) return;
    const headers = ["الرقم الجامعي", "اسم الطالب", "القسم", "المستوى"];
    const rows = students.map((s: any) => [s.academic_number, s.student_name, s.department_name || "", s.level]);
    const csv = [headers.join(","), ...rows.map((r: string[]) => r.join(","))].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "official_students.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const filteredStudents = students;

  return (
    <div style={pageContainer}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2 style={pageTitleStyle}><GraduationCap size={24} /> سجل الطلاب</h2>
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={() => { resetForm(); setShowForm(true); }} style={btnPrimary}><PlusCircle size={16} /> إضافة طالب</button>
          <button onClick={() => setShowImport(true)} style={btnOutline}><Download size={16} /> استيراد</button>
          <button onClick={exportCSV} style={btnOutline}><Download size={16} /> تصدير CSV</button>
        </div>
      </div>

      {/* Search & Filters */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: "200px", position: "relative" }}>
          <Search size={16} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", color: textGray }} />
          <input type="text" placeholder="بحث بالاسم أو الرقم الجامعي..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ ...inputStyle, paddingRight: "36px" }} />
        </div>
        <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)} style={{ ...inputStyle, width: "180px" }}>
          <option value="">كل الأقسام</option>
          {departments.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        <select value={levelFilter} onChange={(e) => setLevelFilter(e.target.value)} style={{ ...inputStyle, width: "120px" }}>
          <option value="">كل المستويات</option>
          {[1, 2, 3, 4, 5].map(l => <option key={l} value={l}>المستوى {l}</option>)}
        </select>
        <button onClick={() => { setSearch(""); setDeptFilter(""); setLevelFilter(""); }} style={{ background: bgLight, color: textGray, border: "1px solid #e0e0e0", padding: "10px 16px", borderRadius: "8px", cursor: "pointer", fontSize: "13px" }}>مسح</button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div style={formCardStyle}>
          <h3 style={{ margin: "0 0 15px", color: primary, fontSize: "15px" }}>{editing ? "تعديل طالب" : "إضافة طالب جديد"}</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" }}>
            <input type="text" placeholder="الرقم الجامعي" value={form.academic_number} onChange={(e) => setForm({ ...form, academic_number: e.target.value })} style={inputStyle} />
            <input type="text" placeholder="اسم الطالب" value={form.student_name} onChange={(e) => setForm({ ...form, student_name: e.target.value })} style={inputStyle} />
            <select value={form.department_id} onChange={(e) => setForm({ ...form, department_id: e.target.value })} style={inputStyle}>
              <option value="">اختر القسم</option>
              {departments.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
            <select value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} style={inputStyle}>
              <option value="">اختر المستوى</option>
              {[1, 2, 3, 4, 5].map(l => <option key={l} value={l}>المستوى {l}</option>)}
            </select>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={saveStudent} style={btnPrimary}><Save size={16} /> حفظ</button>
            <button onClick={() => { setShowForm(false); resetForm(); }} style={{ background: bgLight, color: textGray, border: "none", padding: "10px 20px", borderRadius: "8px", cursor: "pointer", fontSize: "13px", display: "flex", alignItems: "center", gap: "6px" }}><X size={16} /> إلغاء</button>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImport && (
        <div style={formCardStyle}>
          <h3 style={{ margin: "0 0 10px", color: primary, fontSize: "15px" }}>استيراد طلاب</h3>
          <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
            <button onClick={() => setImportMode("excel")} style={importMode === "excel" ? btnPrimary : { ...btnOutline, padding: "8px 16px", fontSize: "12px" }}><Download size={14} /> ملف Excel</button>
            <button onClick={() => setImportMode("text")} style={importMode === "text" ? btnPrimary : { ...btnOutline, padding: "8px 16px", fontSize: "12px" }}>نص</button>
          </div>
          {importMode === "excel" ? (
            <>
              <p style={{ fontSize: "12px", color: textGray, marginBottom: "10px" }}>اختر ملف Excel (xlsx, xls) يحتوي على أعمدة: الرقم الجامعي، اسم الطالب، القسم (اسم أو ID)، المستوى</p>
              <input type="file" accept=".xlsx,.xls" multiple onChange={(e) => setImportFiles(Array.from(e.target.files || []))} style={{ marginBottom: "10px" }} />
              {importFiles.length > 0 && <p style={{ fontSize: "11px", color: textGray, marginBottom: "10px" }}>{importFiles.length} ملف مختار</p>}
            </>
          ) : (
            <>
              <p style={{ fontSize: "12px", color: textGray, marginBottom: "10px" }}>الصق البيانات مفصولة بـ tab (الرقم الجامعي، اسم الطالب، اسم القسم أو ID القسم، المستوى) كل سجل في سطر</p>
              <textarea value={importData} onChange={(e) => setImportData(e.target.value)} style={{ ...inputStyle, minHeight: "150px", marginBottom: "10px", fontFamily: "monospace", direction: "ltr" }} />
            </>
          )}
          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={handleImport} disabled={importLoading} style={importLoading ? { ...btnPrimary, opacity: 0.6 } : btnPrimary}><Download size={16} /> {importLoading ? "جاري الاستيراد..." : "استيراد"}</button>
            <button onClick={() => { setShowImport(false); setImportData(""); setImportFiles([]); }} style={{ background: bgLight, color: textGray, border: "none", padding: "10px 20px", borderRadius: "8px", cursor: "pointer", fontSize: "13px", display: "flex", alignItems: "center", gap: "6px" }}><X size={16} /> إلغاء</button>
          </div>
        </div>
      )}

      {/* Students Table */}
      {loading ? (
        <p style={{ color: textGray, fontSize: "13px", textAlign: "center", padding: "20px" }}>جاري التحميل...</p>
      ) : filteredStudents.length === 0 ? (
        <p style={{ color: textGray, fontSize: "13px", textAlign: "center", padding: "20px" }}>لا توجد طلاب</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", background: cardBg, borderRadius: "10px", overflow: "hidden", boxShadow: "0 2px 10px rgba(0,0,0,0.06)" }}>
            <thead>
              <tr style={{ background: primary, color: "#fff" }}>
                <th style={{ padding: "12px 15px", textAlign: "right", fontWeight: 600 }}>#</th>
                <th style={{ padding: "12px 15px", textAlign: "right", fontWeight: 600 }}>الرقم الجامعي</th>
                <th style={{ padding: "12px 15px", textAlign: "right", fontWeight: 600 }}>اسم الطالب</th>
                <th style={{ padding: "12px 15px", textAlign: "right", fontWeight: 600 }}>القسم</th>
                <th style={{ padding: "12px 15px", textAlign: "right", fontWeight: 600 }}>المستوى</th>
                <th style={{ padding: "12px 15px", textAlign: "center", fontWeight: 600 }}>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((s: any, idx: number) => (
                <tr key={s.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                  <td style={{ padding: "10px 15px", color: textGray, fontSize: "12px" }}>{idx + 1}</td>
                  <td style={{ padding: "10px 15px", color: textDark, fontWeight: 600 }}>{s.academic_number}</td>
                  <td style={{ padding: "10px 15px", color: textDark }}>{s.student_name}</td>
                  <td style={{ padding: "10px 15px", color: textGray }}>{s.department_name || "—"}</td>
                  <td style={{ padding: "10px 15px" }}><span style={{ background: "rgba(29,76,79,0.1)", color: primary, padding: "2px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: 600 }}>{s.level}</span></td>
                  <td style={{ padding: "10px 15px", textAlign: "center" }}>
                    <button onClick={() => startEdit(s)} style={{ background: "#f0f4f4", color: primary, border: "none", padding: "6px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "12px", marginLeft: "6px", display: "inline-flex", alignItems: "center", gap: "4px" }}><Pencil size={14} /> تعديل</button>
                    <button onClick={() => handleDelete(s.id, s.student_name)} style={{ background: "#fef5f5", color: red, border: "none", padding: "6px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "12px", display: "inline-flex", alignItems: "center", gap: "4px" }}><Trash2 size={14} /> حذف</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
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
  const [form, setForm] = useState({ title: "", body: "", target_type: "all" });

  const user = (() => { try { return JSON.parse(localStorage.getItem("user") || "{}"); } catch { return {}; } })();
  const collegeId = user.college_id;
  const senderId = user.id;
  const API = "http://127.0.0.1:8000/api/admin";

  const fetchAnnouncements = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/announcements`, { params: { college_id: collegeId } });
      if (res.data.success) setAnnouncements(res.data.data);
    } catch (e) {
      console.error("Failed to load announcements", e);
    } finally {
      setLoading(false);
    }
  }, [collegeId]);

  useEffect(() => { fetchAnnouncements(); }, [fetchAnnouncements]);

  const resetForm = () => {
    setForm({ title: "", body: "", target_type: "all" });
    setEditingId(null);
  };

  const openCreate = () => {
    resetForm();
    setShowForm(true);
  };

  const openEdit = (a: any) => {
    setForm({ title: a.title, body: a.body, target_type: a.target_type });
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
      if (editingId) {
        const res = await axios.put(`${API}/announcements/${editingId}`, {
          title: form.title,
          body: form.body,
          target_type: form.target_type,
        });
        if (res.data.success) {
          fetchAnnouncements();
          setShowForm(false);
          resetForm();
        } else alert(res.data.message || "فشل التحديث");
      } else {
        const res = await axios.post(`${API}/announcements`, {
          college_id: collegeId,
          sender_id: senderId,
          title: form.title,
          body: form.body,
          target_type: form.target_type,
        });
        if (res.data.success) {
          fetchAnnouncements();
          setShowForm(false);
          resetForm();
        } else alert(res.data.message || "فشل الإنشاء");
      }
    } catch (e: any) {
      alert(e.response?.data?.message || "حدث خطأ");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`هل أنت متأكد من حذف الإعلان "${title}"؟`)) return;
    try {
      const res = await axios.delete(`${API}/announcements/${id}`);
      if (res.data.success) {
        fetchAnnouncements();
      } else alert(res.data.message || "فشل الحذف");
    } catch (e: any) {
      alert(e.response?.data?.message || "حدث خطأ");
    }
  };

  const targetLabel = (t: string) => {
    const map: Record<string, string> = { students: "الطلاب فقط", doctors: "الدكاترة فقط", all: "الجميع" };
    return map[t] || t;
  };

  return (
    <div style={pageContainer}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2 style={pageTitleStyle}><Bell size={24} /> الإعلانات</h2>
        <button onClick={openCreate} style={btnPrimary}><PlusCircle size={16} /> إعلان جديد</button>
      </div>

      {/* Create/Edit Modal */}
      {showForm && (
        <div style={formCardStyle}>
          <h3 style={{ margin: "0 0 15px", color: primary, fontSize: "15px" }}>
            {editingId ? "تعديل الإعلان" : "إعلان جديد"}
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" }}>
            <input
              type="text" placeholder="عنوان الإعلان" value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              style={inputStyle}
            />
            <select
              value={form.target_type}
              onChange={(e) => setForm({ ...form, target_type: e.target.value })}
              style={inputStyle}
            >
              <option value="all">الجميع (دكاترة وطلاب)</option>
              <option value="students">الطلاب فقط</option>
              <option value="doctors">الدكاترة فقط</option>
            </select>
          </div>
          <textarea
            placeholder="نص الإعلان" value={form.body}
            onChange={(e) => setForm({ ...form, body: e.target.value })}
            style={{ ...inputStyle, minHeight: "120px", marginBottom: "10px" }}
          />
          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={handleSave} disabled={creating} style={creating ? { ...btnPrimary, opacity: 0.6 } : btnPrimary}>
              <Save size={16} /> {creating ? "جاري الحفظ..." : (editingId ? "تحديث" : "إرسال")}
            </button>
            <button onClick={() => { setShowForm(false); resetForm(); }} style={{ background: bgLight, color: textGray, border: "none", padding: "10px 20px", borderRadius: "8px", cursor: "pointer", fontSize: "13px", display: "flex", alignItems: "center", gap: "6px" }}>
              <X size={16} /> إلغاء
            </button>
          </div>
        </div>
      )}

      {/* Announcements List */}
      {loading ? (
        <p style={{ color: textGray, fontSize: "13px", textAlign: "center", padding: "20px" }}>جاري التحميل...</p>
      ) : announcements.length === 0 ? (
        <p style={{ color: textGray, fontSize: "13px", textAlign: "center", padding: "20px" }}>لا توجد إعلانات</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", background: cardBg, borderRadius: "10px", overflow: "hidden", boxShadow: "0 2px 10px rgba(0,0,0,0.06)" }}>
            <thead>
              <tr style={{ background: primary, color: "#fff" }}>
                <th style={{ padding: "12px 15px", textAlign: "right", fontWeight: 600 }}>#</th>
                <th style={{ padding: "12px 15px", textAlign: "right", fontWeight: 600 }}>العنوان</th>
                <th style={{ padding: "12px 15px", textAlign: "right", fontWeight: 600 }}>تاريخ الإرسال</th>
                <th style={{ padding: "12px 15px", textAlign: "right", fontWeight: 600 }}>الفئة المستهدفة</th>
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
                      {targetLabel(a.target_type)}
                    </span>
                  </td>
                  <td style={{ padding: "10px 15px", textAlign: "center" }}>
                    <button onClick={() => openEdit(a)} style={{ background: "#f0f4f4", color: primary, border: "none", padding: "6px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "12px", marginLeft: "6px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                      <Pencil size={14} /> تعديل
                    </button>
                    <button onClick={() => handleDelete(a.id, a.title)} style={{ background: "#fef5f5", color: red, border: "none", padding: "6px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "12px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                      <Trash2 size={14} /> حذف
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Announcement detail cards for preview */}
      <div style={{ marginTop: "30px", display: "grid", gridTemplateColumns: "1fr", gap: "12px" }}>
        {announcements.map((a: any) => (
          <div key={`detail-${a.id}`} style={cardStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
              <h4 style={{ margin: 0, color: textDark, fontSize: "15px", fontWeight: 700 }}>{a.title}</h4>
              <span style={{ background: "rgba(29,76,79,0.1)", color: primary, padding: "2px 10px", borderRadius: "12px", fontSize: "11px", fontWeight: 600 }}>
                {targetLabel(a.target_type)}
              </span>
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
    <div style={{ display: "flex", width: "100vw", minHeight: "100vh", margin: 0, padding: 0, background: bgLight }}>
      <CollegeManagerSidebar onLogout={() => setShowLogoutConfirm(true)} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <TopBar />
        <div style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/departments" element={<DepartmentsPage />} />
            <Route path="/subjects" element={<SubjectsPage />} />
            <Route path="/instructors" element={<InstructorsPage />} />
            <Route path="/semesters" element={<SemestersPage />} />
            <Route path="/course-offering" element={<CourseOfferingPage />} />
            <Route path="/official-students" element={<OfficialStudentsPage />} />
            <Route path="/announcements" element={<AnnouncementsPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/audit-log" element={<AuditLogPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
        </div>
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
