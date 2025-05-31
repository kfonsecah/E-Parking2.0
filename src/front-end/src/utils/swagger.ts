// utils/swagger.ts
import swaggerJsdoc from "swagger-jsdoc";
import path from "path";

const isProduction = process.env.NODE_ENV === "production";
const serverUrl = isProduction
  ? process.env.API_URL || "https://parkxpress.vercel.app/api"
  : "http://localhost:3000/api";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Park Xpress API",
      version: "1.0.0",
      description: `
        This is the API documentation for the Park Xpress system.
        It includes all the necessary endpoints for managing users, sessions, and parking system data.
      `,
      contact: {
        name: "Park Xpress Support",
        email: "parkxpresscr@gmail.com",
        url: "https://parkxpress.vercel.app",
      },
      license: {
        name: "MIT",
        url: "https://opensource.org/licenses/MIT",
      },
    },
    servers: [
      {
        url: serverUrl,
        description: isProduction ? "Production Server" : "Local Server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description:
            "Authentication using JWT. Add 'Bearer {token}' to the Authorization header.",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [path.join(process.cwd(), "src/app/api/**/*.ts")],
};

export const swaggerSpec = swaggerJsdoc(options);
