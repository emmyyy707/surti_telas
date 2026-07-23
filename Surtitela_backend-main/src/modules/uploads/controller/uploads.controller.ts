import { Request, Response } from "express";
import { uploadImage, deleteImage, replaceImage, validateImage } from "../service/image.service.js";
import prisma from "../../../config/prisma.js";
import { respuestaBadRequest, respuestaExitosa, respuestaError, respuestaNotFound } from "../../../shared/http.js";

export async function upload(req: Request, res: Response): Promise<Response> {
  const file = req.file;
  if (!file) {
    return respuestaBadRequest(res, "No se proporcionó ningún archivo");
  }

  const validation = validateImage(file);
  if (!validation.valid) {
    return res.status(413).json({ status: "error", message: validation.error });
  }

  try {
    const { entityType, entityId } = req.body;
    const result = await uploadImage(file, entityType, entityId ? Number(entityId) : undefined);

    const savedImage = await prisma.image.create({
      data: {
        originalName: file.originalname,
        fileName: file.filename,
        url: result.url,
        publicId: result.publicId,
        mimeType: result.mimeType,
        size: result.size,
        width: result.width,
        height: result.height,
      },
    });

    return res.status(201).json({
      success: true,
      data: {
        id: savedImage.id,
        url: result.url,
        publicId: result.publicId,
        size: result.size,
        width: result.width,
        height: result.height,
        mimeType: result.mimeType,
      },
    });
  } catch (error) {
    console.error("Error uploading image:", error);
    return respuestaError(res);
  }
}

export async function remove(req: Request, res: Response): Promise<Response> {
  const id = String(req.params.id);
  if (!id) {
    return respuestaBadRequest(res, "ID inválido");
  }

  try {
    const image = await prisma.image.findUnique({ where: { id } });
    if (!image) {
      return respuestaNotFound(res);
    }

    await deleteImage(image.publicId);
    await prisma.image.delete({ where: { id } });

    return respuestaExitosa(res, null, "Imagen eliminada");
  } catch (error) {
    console.error("Error deleting image:", error);
    return respuestaError(res);
  }
}

export async function replace(req: Request, res: Response): Promise<Response> {
  const id = String(req.params.id);
  if (!id) {
    return respuestaBadRequest(res, "ID inválido");
  }

  const file = req.file;
  if (!file) {
    return respuestaBadRequest(res, "No se proporcionó ningún archivo");
  }

  const validation = validateImage(file);
  if (!validation.valid) {
    return res.status(413).json({ status: "error", message: validation.error });
  }

  try {
    const image = await prisma.image.findUnique({ where: { id } });
    if (!image) {
      return respuestaNotFound(res);
    }

    const result = await replaceImage(image.publicId, file);

    await prisma.image.update({
      where: { id },
      data: {
        originalName: file.originalname,
        fileName: file.filename,
        url: result.url,
        publicId: result.publicId,
        mimeType: result.mimeType,
        size: result.size,
        width: result.width,
        height: result.height,
        updatedAt: new Date(),
      },
    });

    return respuestaExitosa(res, {
      url: result.url,
      publicId: result.publicId,
      size: result.size,
      width: result.width,
      height: result.height,
    }, "Imagen actualizada");
  } catch (error) {
    console.error("Error replacing image:", error);
    return respuestaError(res);
  }
}

export async function list(req: Request, res: Response): Promise<Response> {
  const { entityType, entityId } = req.query;

  const where: any = {};
  if (entityType) where.entityType = entityType;
  if (entityId) where.entityId = Number(entityId);

  const images = await prisma.image.findMany({ where });

  return respuestaExitosa(res, images.map(img => ({
    id: img.id,
    url: img.url,
    publicId: img.publicId,
    mimeType: img.mimeType,
    size: img.size,
    width: img.width,
    height: img.height,
    originalName: img.originalName,
  })));
}