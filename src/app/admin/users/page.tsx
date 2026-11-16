import type { Metadata } from "next";
import { asc } from "drizzle-orm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toggleUserAccess, updateUserRole } from "@/features/administration/actions";
import { requireRole } from "@/lib/auth/guards";
import { db } from "@/lib/database";
import { user, userRoles } from "@/lib/database/schema";

export const metadata: Metadata = { title: "User management" };

export default async function AdminUsersPage() {
  const session = await requireRole(["admin"]);
  if (!db) return <main className="p-8">The database is not configured.</main>;
  const users = await db.select().from(user).orderBy(asc(user.createdAt));
  return <main className="min-h-screen bg-surface-50 text-navy-950"><div className="mx-auto max-w-6xl px-5 py-10 sm:px-8"><h1 className="text-3xl font-semibold tracking-[-.045em]">User management</h1><p className="mt-2 text-sm text-surface-600">Assign workspace roles and suspend access. Disabling an account revokes its current sessions.</p><section className="mt-7 overflow-x-auto rounded-xl border border-surface-200 bg-white"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-surface-50 text-xs uppercase tracking-wide text-surface-500"><tr><th className="px-4 py-3">User</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">Created</th><th className="px-4 py-3">Access</th></tr></thead><tbody className="divide-y divide-surface-100">{users.map((item) => <tr key={item.id}><td className="px-4 py-4"><strong>{item.name}</strong><p className="mt-1 text-xs text-surface-500">{item.email}</p></td><td className="px-4 py-4"><Badge variant="secondary" className={item.disabled ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-800"}>{item.disabled ? "Disabled" : item.emailVerified ? "Verified email" : "Email unverified"}</Badge></td><td className="px-4 py-4"><form action={updateUserRole} className="flex items-center gap-2"><input type="hidden" name="userId" value={item.id} /><select name="role" defaultValue={item.role} className="min-h-9 rounded-md border border-surface-200 bg-white px-2 text-xs">{userRoles.map((role) => <option key={role} value={role}>{role}</option>)}</select><Button type="submit" size="sm" variant="outline" disabled={item.id === session.user.id}>Save</Button></form></td><td className="px-4 py-4 text-xs text-surface-500">{item.createdAt.toLocaleDateString()}</td><td className="px-4 py-4"><form action={toggleUserAccess}><input type="hidden" name="userId" value={item.id} /><Button type="submit" size="sm" variant={item.disabled ? "outline" : "destructive"} disabled={item.id === session.user.id}>{item.disabled ? "Enable" : "Disable"}</Button></form></td></tr>)}</tbody></table></section></div></main>;
}
