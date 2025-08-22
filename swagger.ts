import swaggerAutogen from "swagger-autogen";

const doc = {
    info: {
        title: "DarulSihha API",
        description: "Auto-generated Swagger Docs",
    },
    host: "localhost:8000",
    schemes: ["http"],
};

const outputFile = "./swagger-output.json";
const endpointsFiles = ["./src/index.ts"];

swaggerAutogen()(outputFile, endpointsFiles, doc);
