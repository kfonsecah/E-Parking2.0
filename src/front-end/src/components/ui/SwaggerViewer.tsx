"use client";

import React, { useEffect, useRef } from "react";
import { SwaggerUIBundle, SwaggerUIStandalonePreset } from "swagger-ui-dist";
import "swagger-ui-dist/swagger-ui.css";

export default function SwaggerViewer() {
  const swaggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (swaggerRef.current) {
      SwaggerUIBundle({
        url: "/api/docs/endpoints/",
        domNode: swaggerRef.current,
        presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
        layout: "StandaloneLayout",
      });
    }
  }, []);

  return <div ref={swaggerRef} style={{ minHeight: "100vh" }} />;
}
