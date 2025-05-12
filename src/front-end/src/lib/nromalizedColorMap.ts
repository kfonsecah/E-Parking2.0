import { colorMap } from "./colors";
import { normalizeColor } from "./normalizeColor";

export const normalizedColorMap: { [key: string]: string } = Object.fromEntries(
  Object.entries(colorMap).map(([key, value]) => [
    normalizeColor(key), // Clave normalizada
    value,
  ])
);
