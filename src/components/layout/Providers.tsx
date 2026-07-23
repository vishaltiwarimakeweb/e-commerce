"use client";

import { ThemeProvider } from "next-themes";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider } from "@/components/layout/AuthProvider";
import type { AuthUser } from "@/types/auth";
import type { ReactNode } from "react";

export function Providers({
  initialUser,
  children,
}: {
  initialUser: AuthUser | null;
  children: ReactNode;
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider initialUser={initialUser}>
        {children}
        <ToastContainer position="top-right" theme="colored" autoClose={3500} />
      </AuthProvider>
    </ThemeProvider>
  );
}
