import fs from "fs";
import https from "https";
import app from "./app.js";
import prisma from "../config/prisma.js";
import { ensurePrincipalAdminExists } from "../modules/users/service/users.service.js";
import { loadEnvironment } from "../config/env.js";

// Cargar variables de entorno antes de iniciar el servidor
loadEnvironment();

export async function iniciarServidor(): Promise<void> {
  const PORT = Number(process.env.PORT) || 3000;
  const HOST = process.env.HOST || "localhost";
  const keyPath = process.env.HTTPS_KEY_PATH;
  const certPath = process.env.HTTPS_CERT_PATH;
  const caPath = process.env.HTTPS_CA_PATH;

  const canUseHttps = Boolean(
    keyPath &&
      certPath &&
      fs.existsSync(keyPath) &&
      fs.existsSync(certPath)
  );

  console.log("Conectando a la base de datos...");
  await prisma.$connect();
  console.log("Conexión a la base de datos establecida.");

  console.log("Asegurando existencia del Administrador Principal...");
  await ensurePrincipalAdminExists();
  console.log("Administración Principal asegurada.");

  console.log("Calentando Prisma con una consulta inicial de producto...");
  try {
    await prisma.products.findFirst();
    console.log("Prisma calentado.");
  } catch (err: any) {
    console.warn("Prisma warmup falló, se omite:", err?.message ?? err);
  }

  const protocol = canUseHttps ? "https" : "http";
  const url = `${protocol}://${HOST}:${PORT}`;

  if (canUseHttps) {
    const httpsOptions: https.ServerOptions = {
      key: fs.readFileSync(keyPath as string),
      cert: fs.readFileSync(certPath as string),
    };

    if (caPath && fs.existsSync(caPath)) {
      httpsOptions.ca = fs.readFileSync(caPath);
    }

    https.createServer(httpsOptions, app).listen(PORT, HOST, () => {
      console.log("Surtitelas iniciado");
      console.log(`Escuchando en ${url}`);
    });
  } else {
    if (keyPath || certPath) {
      console.warn(
        "No se pudo habilitar HTTPS: falta el archivo de clave o certificado, o la ruta es inválida. Se inicia en HTTP."
      );
    }

    app.listen(PORT, HOST, () => {
      console.log("Surtitelas iniciado");
      console.log(`Escuchando en ${url}`);
    });
  }
}
