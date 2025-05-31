import NextAuth from "next-auth";
import { authOptions } from "@/lib/authOptions";

/**
 * @swagger
 * /auth:
 *   post:
 *     summary: Sign in with Google
 *     description: Authenticates a user using NextAuth and Google OAuth.
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *                 example: "4/0AX4XfWjNQhxCmBhf2FkdjVk9Wg23PAdDlXoyzj8O1hI"
 *     responses:
 *       200:
 *         description: User successfully authenticated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "123"
 *                 name:
 *                   type: string
 *                   example: "John Doe"
 *                 email:
 *                   type: string
 *                   example: "john@example.com"
 *                 role:
 *                   type: string
 *                   example: "Administrator"
 *                 sessionId:
 *                   type: string
 *                   example: "123e4567-e89b-12d3-a456-426614174000"
 *       401:
 *         description: User not registered or authentication error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "User not registered. Please contact the administrator."
 */
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
