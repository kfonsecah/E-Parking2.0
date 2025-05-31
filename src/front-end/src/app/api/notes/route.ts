import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * @swagger
 * /api/notes:
 *   get:
 *     summary: Get Daily Notes
 *     description: Retrieves all active notes for the current day, including user details and expiration status.
 *     responses:
 *       200:
 *         description: Notes retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   description: Indicates if the request was successful.
 *                   example: true
 *                 notas:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: The unique identifier for the note.
 *                         example: 1
 *                       contenido:
 *                         type: string
 *                         description: The content of the note.
 *                         example: "Remember to lock the main gate."
 *                       fecha:
 *                         type: string
 *                         format: date-time
 *                         description: The creation date of the note.
 *                         example: "2025-05-19T08:00:00Z"
 *                       expiracion:
 *                         type: string
 *                         format: date-time
 *                         description: The expiration date of the note, if any.
 *                         example: "2025-05-19T23:59:59Z"
 *                       estado:
 *                         type: string
 *                         description: The status of the note (e.g., "nuevo", "advertencia", "alerta", "expirado").
 *                         example: "nuevo"
 *                       color:
 *                         type: string
 *                         description: The color representing the note's status.
 *                         example: "green"
 *                       usuario:
 *                         type: string
 *                         description: The full name of the user who created the note.
 *                         example: "Juan Pérez"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "An unexpected error occurred while fetching notes."
 */
export async function GET(req: NextRequest) {
  try {
    // Costa Rica timezone (UTC-6)
    const crNow = new Date(Date.now() - 6 * 60 * 60 * 1000);
    crNow.setUTCHours(0, 0, 0, 0);

    const startOfDay = new Date(crNow);
    const endOfDay = new Date(startOfDay);
    endOfDay.setUTCHours(23, 59, 59, 999);

    // Obtener notas con manejo de expiración
    const notes = await prisma.ep_notes.findMany({
      where: {
        OR: [
          // Notas sin expiración (sin límite de tiempo)
          { notes_expiry: null },
          // Notas con fecha de expiración futura
          { notes_expiry: { gte: new Date() } },
        ],
        notes_date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      orderBy: {
        notes_date: "desc",
      },
      select: {
        notes_id: true,
        notes_content: true,
        notes_date: true,
        notes_expiry: true,
        notes_status: true,
        user: {
          select: {
            users_name: true,
            users_lastname: true,
          },
        },
      },
    });

    // Formatear resultados
    const result = notes.map((note) => {
      const expired =
        note.notes_expiry && new Date(note.notes_expiry) < new Date();
      let statusColor = "green"; // Predeterminado para "nuevo"

      if (note.notes_status === "advertencia") statusColor = "yellow";
      else if (note.notes_status === "alerta") statusColor = "red";
      else if (expired) statusColor = "gray"; // Expirado

      return {
        id: note.notes_id,
        contenido: note.notes_content,
        fecha: note.notes_date,
        expiracion: note.notes_expiry,
        estado: expired ? "expirado" : note.notes_status,
        color: statusColor,
        usuario: `${note.user.users_name} ${note.user.users_lastname}`,
      };
    });

    return NextResponse.json({ ok: true, notas: result });
  } catch (error: any) {
    console.error("❌ Error fetching notes:", error.message);
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}
