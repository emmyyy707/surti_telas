import { loadEnvironment } from "./config/env.js";
loadEnvironment();

const { iniciarServidor } = await import("./shared/server.js");

iniciarServidor().catch((error) => {
  console.error("Error iniciando servidor:", error);
  process.exit(1);
});