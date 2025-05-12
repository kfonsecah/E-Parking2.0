export function normalizeColor(color: string): string {
  return color
    .normalize("NFD") // Descompone letras acentuadas
    .replace(/[\u0300-\u036f]/g, "") // Elimina los acentos de forma segura
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");
}
