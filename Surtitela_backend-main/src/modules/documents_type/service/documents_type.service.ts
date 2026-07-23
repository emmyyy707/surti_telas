import prisma from "../../../config/prisma.js";

export type DocumentTypePublic = {
  id_document_type: number;
  document_type: string;
};

export async function getAllDocumentTypes(): Promise<DocumentTypePublic[]> {
  return prisma.documents_type.findMany();
}

export async function createDocumentType(data: { document_type: string }): Promise<DocumentTypePublic | null> {
  try {
    return await prisma.documents_type.create({ data });
  } catch (error) {
    console.error("Error al crear tipo de documento:", error);
    return null;
  }
}

export async function deleteDocumentType(id_document_type: number): Promise<boolean> {
  try {
    await prisma.documents_type.delete({ where: { id_document_type } });
    return true;
  } catch (error) {
    console.error("Error al eliminar tipo de documento:", error);
    return false;
  }
}

