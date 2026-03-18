import { RegisterForm } from "@/components/auth/RegisterForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register - JSGram",
  description: "Create your JSGram account",
};

export default function RegisterPage() {
  return <RegisterForm />;
}
