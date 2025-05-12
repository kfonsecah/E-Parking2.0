import { jwtVerify } from "jose";
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

export async function getUserIdFromRequest(
  req: NextRequest
): Promise<number | null> {
  try {
    // Intentar sesión NextAuth primero
    const session = await getServerSession(authOptions);
    if (session?.user) {
      return Number((session.user as any).id);
    }

    // Intentar JWT de cookie propia
    const token = req.cookies.get("app-session")?.value;
    if (!token) return null;

    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    const { payload } = await jwtVerify(token, secret);

    return Number(payload.id);
  } catch (error) {
    console.error("❌ Error verificando sesión o token:", error);
    return null;
  }
}
