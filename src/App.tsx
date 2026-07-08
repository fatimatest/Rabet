import React, { useState, useEffect } from "react";
import "./App.css";
import AuthScreen from "./components/AuthScreen";
import Student from "./student";
import Doctor from "./doctor";
import Mnagment from "./mnagment";
import Mm from "./mm";

function App() {
  const [role, setRole] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        if (!user || !user.id) {
          localStorage.removeItem("user");
          setLoading(false);
          return;
        }
        setRole(user.role || user.user_type || "student");
        setUserData(user);
      } catch (e) {
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  }, []);

  const handleLogin = (userRole: string, user: any) => {
    if (!user || !user.id) return;
    setRole(userRole);
    setUserData(user);
    localStorage.setItem("user", JSON.stringify(user));
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("auth_token");
    setRole(null);
    setUserData(null);
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontFamily: "'Cairo', sans-serif",
          color: "#1D4C4F",
        }}
      >
        جاري التحميل...
      </div>
    );
  }

  if (!role || !userData || !userData.id) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  if (role === "student") {
    return <Student userData={userData} onLogout={handleLogout} />;
  }

  if (role === "doctor") {
    return <Doctor userData={userData} onLogout={handleLogout} />;
  }

  if (role === "system_admin") {
    return <Mnagment userData={userData} onLogout={handleLogout} />;
  }

  if (role === "college_manager") {
    return <Mm userData={userData} onLogout={handleLogout} />;
  }

  // Fallback: show role name for debugging
  return <h1 style={{textAlign:'center', marginTop:'100px', color:'#1D4C4F'}}>دور المستخدم: {role} - يرجى التواصل مع الدعم الفني</h1>;
}

export default App;
