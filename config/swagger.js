// config/swagger.js
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Reconstruct __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const options = {
  // 1. Definition (Metadata for the API)
  definition: {
    openapi: '3.1.0',
    info: {
      title: 'Social Ideas Platform Node.js Backend API',
      version: '1.0.0', // Update this if your package.json changes
      description: 'API for Comments, Votes, Activity Feed, and Notifications.',
    },
    servers: [{
      url: `/api/v1`,
      description: 'API Version 1',
    }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },

  // 2. API Paths (Explicitly targeting JSDoc files)
  // Using join(..., '..', 'folder') ensures a reliable absolute path from the project root.
  apis: [
    // Routes containing your endpoint documentation
    join(__dirname, '..', 'src', 'routes', '*.js'),
    // Models (if you add schema definitions directly to Mongoose models)
    join(__dirname, '..', 'src', 'models', '*.js')
  ],
};

const swaggerSpec = swaggerJsdoc(options);

const setupSwagger = (app) => {
  // Serve the documentation via Swagger UI
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // Optional: Serve the raw specification JSON
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
};

export default setupSwagger;