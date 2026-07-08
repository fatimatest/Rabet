import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import logo from "./assets/logo.jpg";

/* ================= TYPES ================= */
type Role = "admin" | "doctor" | "student";

interface User {
  id: number;
  name: string;
  role: Role;
  active: boolean;
}

/* ================= STYLES ================= */
const btnStyle = {
  backgroundColor: "#2E8B86",
  color: "#fff",
  padding: "5px 10px",
  border: "none",
  margin: "5px",
  cursor: "pointer"
};

/* ================= SIDEBAR ================= */
const Sidebar = () => {
  const linkStyle = {
    color: "#fff",
    display: "block",
    marginBottom: 8,
    textDecoration: "none"
  };

  return (
    <div style={{
      width: 220,
      background: "#2E8B86",
      color: "#fff",
      height: "100vh",
      padding: 10
    }}>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <img src={logo} style={{ width: 100, borderRadius: "50%" }} />
        <h3>مدير النظام</h3>
      </div>

      <Link to="/" style={linkStyle}>Dashboard</Link>
      <Link to="/colleges" style={linkStyle}>Colleges</Link>
      <Link to="/managers" style={linkStyle}>College Managers</Link>
      <Link to="/users" style={linkStyle}>Users</Link>
      <Link to="/terms" style={linkStyle}>Terms</Link>
      <Link to="/reports" style={linkStyle}>Reports</Link>
      <Link to="/logs" style={linkStyle}>Audit Logs</Link>
      <Link to="/settings" style={linkStyle}>Settings</Link>
      <Link to="/logout" style={linkStyle}>Logout</Link>
    </div>
  );
};

/* ================= DASHBOARD ================= */
const Dashboard = () => (
  <div>
    <h2>Dashboard</h2>
    <p>عدد الكليات: 4</p>
    <p>عدد المستخدمين: 20</p>
    <p>عدد الطلاب: 15</p>
    <p>عدد الدكاترة: 5</p>
    <p>عدد الأترام: 2</p>
  </div>
);

/* ================= COLLEGES ================= */
const Colleges = () => {
  const [list, setList] = useState<string[]>([]);
  const [name, setName] = useState("");

  return (
    <div>
      <h2>Colleges</h2>

      <input value={name} onChange={e => setName(e.target.value)} />
      <button style={btnStyle} onClick={() => {
        if (!name) return;
        setList([...list, name]);
        setName("");
      }}>إضافة</button>

      {list.map((c, i) => (
        <div key={i}>
          {c}
          <button onClick={() => setList(list.filter((_, idx) => idx !== i))}>
            حذف
          </button>
        </div>
      ))}
    </div>
  );
};

/* ================= MANAGERS ================= */
const Managers = () => {
  const [managers, setManagers] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [college, setCollege] = useState("");

  return (
    <div>
      <h2>College Managers</h2>

      <input placeholder="الاسم" value={name} onChange={e => setName(e.target.value)} />
      <input placeholder="الكلية" value={college} onChange={e => setCollege(e.target.value)} />

      <button style={btnStyle} onClick={() => {
        if (!name || !college) return;
        setManagers([...managers, {
          id: Date.now(),
          name,
          college,
          active: true
        }]);
        setName("");
        setCollege("");
      }}>إضافة</button>

      {managers.map(m => (
        <div key={m.id}>
          {m.name} - {m.college}

          <button onClick={() => {
            m.active = !m.active;
            setManagers([...managers]);
          }}>
            {m.active ? "إيقاف" : "تفعيل"}
          </button>

          <button onClick={() =>
            setManagers(managers.filter(x => x.id !== m.id))
          }>
            حذف
          </button>
        </div>
      ))}
    </div>
  );
};

/* ================= USERS ================= */
const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [name, setName] = useState("");
  const [role, setRole] = useState<Role>("student");
  const [filter, setFilter] = useState("all");

  const filtered = users.filter(u =>
    filter === "all" ? true : u.role === filter
  );

  return (
    <div>
      <h2>Users</h2>

      <input value={name} onChange={e => setName(e.target.value)} />

      <select onChange={e => setRole(e.target.value as Role)}>
        <option value="student">طالب</option>
        <option value="doctor">دكتور</option>
      </select>

      <button style={btnStyle} onClick={() => {
        if (!name) return;
        setUsers([...users, {
          id: Date.now(),
          name,
          role,
          active: true
        }]);
        setName("");
      }}>
        إضافة
      </button>

      <select onChange={e => setFilter(e.target.value)}>
        <option value="all">الكل</option>
        <option value="student">طلاب</option>
        <option value="doctor">دكاترة</option>
      </select>

      {filtered.map(u => (
        <div key={u.id}>
          {u.name} ({u.role})

          <button onClick={() => {
            u.active = !u.active;
            setUsers([...users]);
          }}>
            {u.active ? "إيقاف" : "تفعيل"}
          </button>

          <button onClick={() =>
            setUsers(users.filter(x => x.id !== u.id))
          }>
            حذف
          </button>
        </div>
      ))}
    </div>
  );
};

/* ================= TERMS ================= */
const Terms = () => {
  const [terms, setTerms] = useState<any[]>([]);
  const [name, setName] = useState("");

  return (
    <div>
      <h2>Terms</h2>

      <input value={name} onChange={e => setName(e.target.value)} />
      <button style={btnStyle} onClick={() => {
        if (!name) return;
        setTerms([...terms, {
          id: Date.now(),
          name,
          active: false
        }]);
        setName("");
      }}>
        إضافة ترم
      </button>

      {terms.map(t => (
        <div key={t.id}>
          {t.name}

          <button onClick={() => {
            t.active = !t.active;
            setTerms([...terms]);
          }}>
            {t.active ? "إغلاق" : "تفعيل"}
          </button>
        </div>
      ))}
    </div>
  );
};

/* ================= REPORTS ================= */
const Reports = () => (
  <div>
    <h2>Reports</h2>
    <p>عدد المستخدمين: 20</p>
    <p>النشاط: جيد</p>
  </div>
);

/* ================= LOGS ================= */
const Logs = () => (
  <div>
    <h2>Audit Logs</h2>
    <p>Ali أنشأ مستخدم</p>
    <p>Sara حذفت عنصر</p>
  </div>
);

/* ================= SETTINGS ================= */
const Settings = () => (
  <div>
    <h2>Settings</h2>
    <p>مدة QR: 10 دقائق</p>
    <p>الإشعارات: مفعلة</p>
  </div>
);

/* ================= APP ================= */
export default function App() {
  return (
    <BrowserRouter>
      <div style={{ display: "flex" }}>
        <Sidebar />
        <div style={{ padding: 20, width: "100%" }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/colleges" element={<Colleges />} />
            <Route path="/managers" element={<Managers />} />
            <Route path="/users" element={<Users />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/logs" element={<Logs />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/logout" element={<div>تم تسجيل الخروج</div>} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}