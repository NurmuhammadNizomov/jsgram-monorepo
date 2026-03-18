import { LoginForm } from "@/components/auth/LoginForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login - JSGram",
  description: "Sign in to your JSGram account",
};

export default function LoginPage() {
  return <LoginForm />;
}
