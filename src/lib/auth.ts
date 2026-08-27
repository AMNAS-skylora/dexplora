import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export type AdminRole = "SUPER_ADMIN" | "ADMIN" | "EDITOR";


const JWT_SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || "dexplora_super_secret_jwt_key_2026_production_change_this"
);

export interface AdminSession {
  userId: string;
  name: string;
  email: string;
  role: AdminRole;
}

export async function signSessionToken(payload: AdminSession): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET_KEY);
}

export async function verifySessionToken(token: string): Promise<AdminSession | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET_KEY);
    return {
      userId: payload.userId as string,
      name: payload.name as string,
      email: payload.email as string,
      role: payload.role as AdminRole,
    };
  } catch (error) {
    return null;
  }
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("dexplora_admin_session")?.value;
  if (!token) return null;
  return await verifySessionToken(token);
}

export async function setAdminSessionCookie(payload: AdminSession) {
  const token = await signSessionToken(payload);
  const cookieStore = await cookies();
  cookieStore.set("dexplora_admin_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });
}

export async function clearAdminSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete("dexplora_admin_session");
}
