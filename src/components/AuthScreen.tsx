import React, { useState } from "react";
import LoginForm from "./LoginForm";
import ForgotPassword from "./ForgotPassword";
import VerifyCode from "./VerifyCode";
import ResetPassword from "./ResetPassword";
import DownloadPage from "./DownloadPage";

interface AuthScreenProps {
  onLogin: (role: string, userData: any) => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<"login" | "forgot" | "verify" | "reset" | "download">("login");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  if (mode === "login") {
    return (
      <LoginForm
        onLogin={onLogin}
        onForgotPassword={() => setMode("forgot")}
        onDownloadApp={() => setMode("download")}
      />
    );
  }

  if (mode === "forgot") {
    return (
      <ForgotPassword
        onBack={() => setMode("login")}
        onVerified={(e) => {
          setEmail(e);
          setMode("verify");
        }}
      />
    );
  }

  if (mode === "verify") {
    return (
      <VerifyCode
        email={email}
        onBack={() => setMode("forgot")}
        onVerified={(code) => {
          setOtp(code);
          setMode("reset");
        }}
      />
    );
  }

  if (mode === "reset") {
    return (
      <ResetPassword
        email={email}
        otp={otp}
        onBack={() => setMode("login")}
        onSuccess={() => setMode("login")}
      />
    );
  }

  if (mode === "download") {
    return (
      <DownloadPage
        onBack={() => setMode("login")}
      />
    );
  }

  return null;
};

export default AuthScreen;
