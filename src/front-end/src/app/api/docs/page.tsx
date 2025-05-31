"use client";

import dynamic from "next/dynamic";

// Carga dinámica del componente Swagger
const SwaggerViewer = dynamic(() => import("@/components/ui/SwaggerViewer"), {
  ssr: false,
  loading: () => <p>Cargando documentación Swagger...</p>,
});

export default function SwaggerPage() {
  return <SwaggerViewer />;
}
