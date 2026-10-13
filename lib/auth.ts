import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

const SECRET_KEY = process.env.ADMIN_SECRET || process.env.SESSION_SECRET || "default_development_secret_key_change_in_production";
const key = new TextEncoder().encode(SECRET_KEY);
const COOKIE_NAME = "admin_session";

export async function encrypt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(key);
}

export async function decrypt(input: string): Promise<any> {
  try {
    const { payload } = await jwtVerify(input, key, {
      algorithms: ["HS256"],
    });
    return payload;
  } catch (error) {
    return null;
  }
}

export async function createSession() {
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  const session = await encrypt({ user: "admin", expires });

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, session, {
    expires,
    maxAge: 7 * 24 * 60 * 60, // 7 days
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getSession(req?: NextRequest) {
  try {
    let sessionCookie;
    if (req) {
      sessionCookie = req.cookies.get(COOKIE_NAME)?.value;
    } else {
      const cookieStore = await cookies();
      sessionCookie = cookieStore.get(COOKIE_NAME)?.value;
    }

    if (!sessionCookie) return null;
    return await decrypt(sessionCookie);
  } catch {
    return null;
  }
}
