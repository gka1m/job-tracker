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
        <h1>Job Tracker</h1>
        <p>
          {mode === "signin"
            ? "Sign in to your account"
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
