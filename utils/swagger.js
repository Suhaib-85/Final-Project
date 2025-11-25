import fs from "fs";
import path from "path";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
const packageJsonPath = path.resolve("./package.json");
const pkg = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
const version = pkg.version;

const options = {
    definition: {
        openapi: "3.1.0",
        info: {
            title: "Social Media API Docs",
            version: version,
            description: "Automatically generated API documentation",
        },
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT"
                }
            }
        },
        security: [
            {
                bearerAuth: []
            }
        ]
    },

    // Automatically read JSDoc comments from these files
    apis: ["./routes/*.js"],
};

const swaggerSpec = swaggerJSDoc(options);

export function swaggerDocs(app) {
    app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

    // Serve raw JSON
    app.get("/docs.json", (req, res) => {
        res.setHeader("Content-Type", "application/json");
        res.send(swaggerSpec);
    });

    console.log(`Docs available at: /docs`);
}
