"use client";

import { useState } from "react";
import SignInForm from "@/app/components/SignInForm";
import SignUpForm from "@/app/components/SignUpForm";

export default function LoginPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
      }}
    >
      <div
        style={{
          width: "400px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        <h1 className="text-[#F5F7FA] text-3xl">Job Tracker</h1>
        <p className="text-[#F5F7FA]">
          {mode === "signin"
            ? "Sign in to your account for a productive job hunt"
            : "Create your account"}
        </p>

        {mode === "signin" ? (
          <SignInForm onSwitch={() => setMode("signup")} />
        ) : (
          <SignUpForm onSwitch={() => setMode("signin")} />
        )}
      </div>
    </div>
  );
}
