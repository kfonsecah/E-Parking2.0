// src/front-end/src/app/api/recognize-plates/recognize-plate.ts

import { NextRequest, NextResponse } from "next/server";

/**
 * @swagger
 * /api/recognize-plates:
 *   post:
 *     summary: Recognize License Plate
 *     description: Uses a custom AI model developed by the ParkXpress team to recognize license plates from uploaded images.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: The image file containing the license plate to be recognized.
 *     responses:
 *       200:
 *         description: License plate recognized successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 plate_number:
 *                   type: string
 *                   description: The recognized license plate number.
 *                   example: "ABC1234"
 *                 confidence:
 *                   type: number
 *                   description: The confidence score of the recognition.
 *                   example: 0.98
 *                 region:
 *                   type: string
 *                   description: The detected region of the license plate.
 *                   example: "CR"
 *                 processing_time:
 *                   type: number
 *                   description: The time taken to process the image in seconds.
 *                   example: 0.123
 *       400:
 *         description: No image file provided.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "No se envió ninguna imagen"
 *       500:
 *         description: Error connecting to the AI recognition service.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "No se pudo conectar con el servicio de reconocimiento"
 */

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("image") as File;

  if (!file) {
    return NextResponse.json(
      { error: "No se envió ninguna imagen" },
      { status: 400 }
    );
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Nueva URL de la API desplegada en Railway
  const pythonApiUrl = "https://alpr-api-production.up.railway.app/recognize";

  const forwardFormData = new FormData();
  forwardFormData.append("file", new Blob([buffer]), "image.jpg");

  try {
    const response = await fetch(pythonApiUrl, {
      method: "POST",
      body: forwardFormData,
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Error desde API Python:", error);
      return NextResponse.json(
        { error: "Error desde API de reconocimiento" },
        { status: 500 }
      );
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (err) {
    console.error("Error al conectar con API Python:", err);
    return NextResponse.json(
      { error: "No se pudo conectar con el servicio de reconocimiento" },
      { status: 500 }
    );
  }
}
