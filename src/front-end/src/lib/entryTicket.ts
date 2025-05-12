import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export async function generateIngressTicket({
  owner,
  plate,
  reference,
  ingressDate,
}: {
  owner: string;
  plate: string;
  reference: string;
  ingressDate: string;
}) {
  const response = await fetch("/api/information");
  const info = await response.json();

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([165, 425]); // Tamaño: 58x150 mm
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const italicFont = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);
  const fontSize = 10;
  let y = 405; // Ajustado para mejor aprovechamiento del espacio

  const drawCentered = (text: string, usedFont = font, size = fontSize) => {
    const width = usedFont.widthOfTextAtSize(text, size);
    page.drawText(text, {
      x: (165 - width) / 2,
      y,
      size,
      font: usedFont,
    });
    y -= size + 2;
  };

  // Encabezado dividido en dos líneas
  const nameParts = info.info_name.split(" ");
  const half = Math.ceil(nameParts.length / 2);
  const line1 = nameParts.slice(0, half).join(" ");
  const line2 = nameParts.slice(half).join(" ");
  drawCentered(line1, boldFont);
  y -= 4;
  drawCentered(line2, boldFont);

  // Logo
  try {
    const imageUrl = "/media/logo_receipts.png";
    const imageRes = await fetch(imageUrl);
    const imageBlob = await imageRes.blob();
    const imageArrayBuffer = await imageBlob.arrayBuffer();
    const imageBytes = new Uint8Array(imageArrayBuffer);
    const img = await pdfDoc.embedPng(imageBytes);

    page.drawImage(img, {
      x: (165 - 30) / 2,
      y: y - 30,
      width: 30,
      height: 30,
    });
    y -= 40;
  } catch (error) {
    console.error("❌ Error al cargar la imagen:", error);
  }

  y -= 5;
  const smallFontSize = 8;
  drawCentered(info.info_owner, font, smallFontSize);
  drawCentered(`Cédula: ${info.info_owner_id_card}`, font, smallFontSize);
  drawCentered(`Teléfono: ${info.info_owner_phone}`, font, smallFontSize);
  y -= 6;

  drawCentered("Tiquete de Entrada", boldFont);
  y -= 6;

  const formatRow = (label: string, value: string) => {
    drawCentered(label, boldFont, 10);
    drawCentered(value, font, 10);
  };

  formatRow("Nombre", owner);
  formatRow("Referencia", reference);
  formatRow("Número de Placa", plate);

  const formattedDate = new Date(ingressDate).toLocaleString("es-CR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  formatRow("Ingreso", formattedDate);

  y -= 5;
  drawCentered("¡Gracias por preferirnos!", italicFont, 7);
  y -= 2;
  drawCentered(info.info_schedule, italicFont, 7);

  // Crear blob y URL
  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);

  // Imprimir automáticamente con iframe oculto
  const iframe = document.createElement("iframe");
  iframe.style.display = "none";
  iframe.src = url;
  document.body.appendChild(iframe);

  iframe.onload = function () {
    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    }, 500);
  };
}
