import type { Metadata } from "next";
import { AuthPanel } from "@/components/shared/auth-panel";

export const metadata: Metadata = { title: "Choose a new password" };

export default async function ResetPasswordPage({
  searchParams,
}: PageProps<"/reset-password">) {
  const { token } = await searchParams;
  return <AuthPanel mode="reset-password" token={Array.isArray(token) ? token[0] : token} />;
}
