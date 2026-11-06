import type { Metadata } from "next";
import { AuthPanel } from "@/components/shared/auth-panel";
export const metadata: Metadata = { title: "Create an account" };
export default function RegisterPage() { return <AuthPanel mode="register" />; }
