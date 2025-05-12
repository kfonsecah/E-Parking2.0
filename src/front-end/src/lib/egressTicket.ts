import { PDFDocument, StandardFonts } from "pdf-lib";

export async function generateEgressTicket({
  owner,
  plate,
  reference,
  ingressDate,
  egressDate,
  fare,
}: {
  owner: string;
  plate: string;
  reference: string;
  ingressDate: string;
  egressDate: string;
  fare: string;
}) {
  const response = await fetch("/api/information");
  const info = await response.json();
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([165, 842]); // 58x297 mm
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const italicFont = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  const fontSize = 10;
  const smallFontSize = 8;
  let y = 820;

  const drawCentered = (
    text: string,
    usedFont = font,
    size = fontSize,
    space: number = size + 2
  ) => {
    const width = usedFont.widthOfTextAtSize(text, size);
    page.drawText(text, {
      x: (165 - width) / 2,
      y,
      size,
      font: usedFont,
    });
    y -= space;
  };

  // Encabezado (nombre del parqueo dividido en 2 líneas)
  const nameParts = info.info_name.split(" ");
  const half = Math.ceil(nameParts.length / 2);
  drawCentered(nameParts.slice(0, half).join(" "), boldFont, 10);
  drawCentered(nameParts.slice(half).join(" "), boldFont, 10, 14);

  // Logo desde carpeta public
  try {
    const imageUrl = "/media/receipts.png";
    const imageRes = await fetch(imageUrl);
    const imageBlob = await imageRes.blob();
    const imageArrayBuffer = await imageBlob.arrayBuffer();
    const imageBytes = new Uint8Array(imageArrayBuffer);
    const img = await pdfDoc.embedPng(imageBytes);
    page.drawImage(img, {
      x: (165 - 40) / 2,
      y: y - 40,
      width: 40,
      height: 40,
    });
    y -= 60;
  } catch (error) {
    console.error("❌ Error al cargar la imagen del tiquete:", error);
  }

  // Información del propietario del parqueo
  drawCentered(info.info_owner, font, smallFontSize);
  drawCentered(`Cédula: ${info.info_owner_id_card}`, font, smallFontSize);
  drawCentered(`Teléfono: ${info.info_owner_phone}`, font, smallFontSize);
  y -= 10;

  drawCentered("Tiquete de Salida", boldFont);
  y -= 8;

  const formatCRDate = (iso: string, forceUTCOffset = false) => {
    const utcDate = new Date(iso);

    // Forzar conversión manual si el valor viene de base de datos (UTC puro)
    const dateToUse = forceUTCOffset
      ? new Date(utcDate.getTime() - 6 * 60 * 60 * 1000)
      : utcDate;

    return dateToUse.toLocaleString("es-CR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatRow = (
    label: string,
    value: string,
    spaceAfter = 14 // Espaciado personalizado entre bloques
  ) => {
    drawCentered(label, boldFont, 10);
    drawCentered(value, font, 10, spaceAfter);
  };

  // Detalles del vehículo
  formatRow("Nombre", owner);
  formatRow("Referencia", reference);
  formatRow("Número de Placa", plate);
  formatRow("Ingreso", formatCRDate(ingressDate, true));
  formatRow("Egreso", formatCRDate(egressDate));
  formatRow("Monto por cancelar", `CRC${fare}`);

  y -= 10;
  drawCentered("¡Gracias por preferirnos!", italicFont, 7);
  drawCentered(info.info_schedule, italicFont, 7);

  // Mostrar o imprimir PDF
  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  window.open(url); // Esto abre el PDF automáticamente
}
