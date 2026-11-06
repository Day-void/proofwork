import type { Metadata } from "next";
import { connection } from "next/server";
import { AuthPanel } from "@/components/shared/auth-panel";
import { isAuthEmailConfigured } from "@/lib/auth/email";
export const metadata: Metadata = { title: "Reset password" };
export default async function ForgotPasswordPage() {
  await connection();
  return <AuthPanel mode="forgot-password" emailConfigured={isAuthEmailConfigured()} />;
}
