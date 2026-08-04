import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export async function adminGuard() {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user?.role !== "ADMIN" && session.user?.role !== "STAFF") redirect("/account");
  return session;
}

export async function requireUser() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect("/login?callbackUrl=/account");
  return userId;
}