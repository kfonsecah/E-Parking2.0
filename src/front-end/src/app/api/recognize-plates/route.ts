// src/front-end/src/app/api/recognize-plates/recognize-plate.ts

import { NextRequest, NextResponse } from "next/server";

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
