import React from "react";

const SystemLogo: React.FC<{ size?: number }> = ({ size = 80 }) => {
  return (
    <div style={{ width: `${size}px`, height: `${size}px`, borderRadius: "50%", margin: "0 auto 10px", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", border: "2px solid rgba(255,255,255,0.3)", background: "#fff" }}>
      <img src="/logo.jpg" alt="Rabet Logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
    </div>
  );
};

export default SystemLogo;
