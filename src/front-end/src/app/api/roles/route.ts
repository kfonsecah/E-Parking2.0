import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
/**
 * @swagger
 * /api/roles:
 *   get:
 *     summary: Get All Roles
 *     description: Retrieves all roles along with the associated users for each role.
 *     responses:
 *       200:
 *         description: Roles retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   rol_id:
 *                     type: integer
 *                     description: The ID of the role.
 *                     example: 1
 *                   rol_name:
 *                     type: string
 *                     description: The name of the role.
 *                     example: "Administrator"
 *                   rol_description:
 *                     type: string
 *                     description: The description of the role.
 *                     example: "Full access to all system features."
 *                   users:
 *                     type: array
 *                     description: The list of users associated with this role.
 *                     items:
 *                       type: object
 *                       properties:
 *                         users_id:
 *                           type: integer
 *                           description: The ID of the user.
 *                           example: 101
 *                         users_username:
 *                           type: string
 *                           description: The username of the user.
 *                           example: "johndoe"
 *                         users_email:
 *                           type: string
 *                           description: The email of the user.
 *                           example: "john.doe@example.com"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error al obtener los roles"
 *                 detail:
 *                   type: string
 *                   example: "An unexpected error occurred while retrieving the roles."
 */
export async function GET() {
  try {
    const roles = await prisma.ep_roles.findMany({
      include: { users: true },
    });
    return NextResponse.json(roles);
  } catch (error) {
    return NextResponse.json(
      { error: "Error al obtener los roles", detail: `${error}` },
      { status: 500 }
    );
  }
}
