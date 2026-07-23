import { Request, Response } from "express";
import { respuestaExitosa, respuestaError, respuestaIdInvalido } from "../../../shared/http.js";
import { productUseCase } from "../../../shared/dependencies.js";

export async function listProducts(req: Request, res: Response): Promise<Response> {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 8;

    if (req.query.ref) {
      const ref = String(req.query.ref);
      const productByRef = await productUseCase.getByRef(ref);
      if (productByRef) {
        return respuestaExitosa(res, productByRef);
      }
      const id = Number(ref);
      if (!Number.isNaN(id)) {
        const productById = await productUseCase.getById(id);
        if (productById) {
          return respuestaExitosa(res, productById);
        }
      }
      return res.status(404).json({ status: "error", message: "Producto no encontrado" });
    }

    const filters: any = {};

    if (req.query.categoria) filters.categoria = String(req.query.categoria);
    if (req.query.color) filters.color = String(req.query.color);
    if (req.query.talla) filters.talla = String(req.query.talla);
    if (req.query.search) filters.search = String(req.query.search);
    if (req.query.publicado !== undefined) filters.publicado = req.query.publicado === "true";
    if (req.query.published !== undefined) filters.publicado = String(req.query.published) === "true";
    if (req.query.destacado !== undefined) filters.destacado = req.query.destacado === "true";
    if (req.query.nuevo !== undefined) filters.nuevo = req.query.nuevo === "true";

    const data = await productUseCase.list(filters, page, limit);
    return res.status(200).json(data.data);
  } catch (error) {
    console.error(error);
    return respuestaError(res);
  }
}

export async function listPaginatedProducts(req: Request, res: Response): Promise<Response> {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 8;

    const filters: any = {};
    if (req.query.categoria) filters.categoria = String(req.query.categoria);
    if (req.query.color) filters.color = String(req.query.color);
    if (req.query.talla) filters.talla = String(req.query.talla);
    if (req.query.search) filters.search = String(req.query.search);
    if (req.query.publicado !== undefined) filters.publicado = req.query.publicado === "true";
    if (req.query.published !== undefined) filters.publicado = String(req.query.published) === "true";
    if (req.query.destacado !== undefined) filters.destacado = req.query.destacado === "true";
    if (req.query.nuevo !== undefined) filters.nuevo = req.query.nuevo === "true";

    const data = await productUseCase.list(filters, page, limit);
    return res.status(200).json(data);
  } catch (error) {
    console.error(error);
    return respuestaError(res);
  }
}

export async function listPublishedProducts(req: Request, res: Response): Promise<Response> {
  try {
    const data = await productUseCase.list({ publicado: true }, 1, 100);
    return res.status(200).json(data.data);
  } catch (error) {
    console.error(error);
    return respuestaError(res);
  }
}

export async function listFeaturedProducts(req: Request, res: Response): Promise<Response> {
  try {
    const data = await productUseCase.list({}, 1, 100);
    const featured = data.data.filter(p => p.destacado === true || p.nuevo === true);
    return res.status(200).json(featured);
  } catch (error) {
    console.error(error);
    return respuestaError(res);
  }
}

export async function getProductById(req: Request, res: Response): Promise<Response> {
  const rawId = String(req.params.id);
  const id = Number(rawId);

  try {
    let data = null;
    if (!Number.isNaN(id)) {
      data = await productUseCase.getById(id);
    }
    if (!data) {
      data = await productUseCase.getByRef(rawId);
    }

    if (!data) return res.status(404).json({ status: "error", message: "Producto no encontrado" });
    return res.status(200).json(data);
  } catch (error) {
    console.error(error);
    return respuestaError(res);
  }
}

export async function getProductByRef(req: Request, res: Response): Promise<Response> {
  const ref = String(req.params.ref);
  if (!ref) return res.status(400).json({ status: "error", message: "Referencia requerida" });

  try {
    const data = await productUseCase.getByRef(ref);
    if (!data) return res.status(404).json({ status: "error", message: "Producto no encontrado" });
    return res.status(200).json(data);
  } catch (error) {
    console.error(error);
    return respuestaError(res);
  }
}

export async function handleCreateProduct(req: Request, res: Response): Promise<Response> {
  const body = req.body ?? {};
  const name = body.name ?? body.nombre;
  const price = body.price ?? body.precio;
  const description = body.description ?? body.descripcion;
  const imagenes = Array.isArray(body.imagenes) ? body.imagenes : undefined;
  const imagen = imagenes?.[0] ?? body.imagen ?? body.imagenPrincipal;
  const stock = body.stock ?? body.cantidadStock;
  const categoryValue = body.id_product_category ?? body.categoria;
  const id_product_category = typeof categoryValue === "number" ? categoryValue : undefined;
  const published = body.publicado ?? body.status;

  if (!name || price === undefined || stock === undefined || !imagenes || imagenes.length === 0) {
    return res.status(400).json({ status: "error", message: "nombre, precio, cantidadStock e imagenes son requeridos" });
  }

  try {
    const data = await productUseCase.create({
      name,
      nombre: name,
      price: Number(price),
      precio: Number(price),
      description,
      descripcion: description,
      imagen: imagen,
      imagenPrincipal: imagen,
      imagenes,
      stock: Number(stock),
      cantidadStock: Number(stock),
      id_product_category,
      categoria: typeof categoryValue === "string" ? categoryValue : undefined,
      publicado: published !== undefined ? Boolean(published) : undefined,
      status: published !== undefined ? Boolean(published) : undefined,
      ref: body.ref,
      codigo: body.codigo,
      color: body.color ?? body.colores?.[0],
      colors: body.colores ?? body.colors ?? body.colorList,
      colorList: body.colores ?? body.colors ?? body.colorList,
      talla: body.talla,
      tallas: body.tallas,
      tela: body.tela,
      destacado: body.destacado,
      nuevo: body.nuevo,
    });
    if (!data) return res.status(409).json({ status: "error", message: "Error" });
    return res.status(201).json(data);
  } catch (error) {
    console.error(error);
    return respuestaError(res);
  }
}

export async function handleUpdateProductByRef(req: Request, res: Response): Promise<Response> {
  const ref = String(req.params.ref);
  if (!ref) return res.status(400).json({ status: "error", message: "Referencia requerida" });

  const body = req.body ?? {};
  const name = body.name ?? body.nombre;
  const price = body.price ?? body.precio;
  const description = body.description ?? body.descripcion;
  const imagenes = Array.isArray(body.imagenes) ? body.imagenes : undefined;
  const imagen = imagenes?.[0] ?? body.imagen ?? body.imagenPrincipal;
  const stock = body.stock ?? body.cantidadStock;
  const categoryValue = body.id_product_category ?? body.categoria;
  const id_product_category = typeof categoryValue === "number" ? categoryValue : undefined;
  const published = body.publicado ?? body.status;
  try {
    const product = await productUseCase.getByRef(ref);
    if (!product) return res.status(404).json({ status: "error", message: "Producto no encontrado" });

    const data = await productUseCase.updateByRef(ref, {
      name,
      nombre: name,
      price: price !== undefined ? Number(price) : undefined,
      precio: price !== undefined ? Number(price) : undefined,
      description,
      descripcion: description,
      imagen: imagen,
      imagenPrincipal: imagen,
      imagenes,
      stock: stock !== undefined ? Number(stock) : undefined,
      cantidadStock: stock !== undefined ? Number(stock) : undefined,
      id_product_category,
      categoria: typeof categoryValue === "string" ? categoryValue : undefined,
      status: published !== undefined ? Boolean(published) : undefined,
      publicado: published !== undefined ? Boolean(published) : undefined,
      ref: body.ref,
      codigo: body.codigo,
      color: body.color ?? body.colores?.[0],
      colors: body.colores ?? body.colors ?? body.colorList,
      colorList: body.colores ?? body.colors ?? body.colorList,
      talla: body.talla,
      tallas: body.tallas,
      tela: body.tela,
      destacado: body.destacado,
      nuevo: body.nuevo,
    });
    if (!data) return res.status(404).json({ status: "error", message: "Producto no encontrado" });
    return res.status(200).json(data);
  } catch (error) {
    console.error(error);
    return respuestaError(res);
  }
}

export async function handlePublishProductByRef(req: Request, res: Response): Promise<Response> {
  const ref = String(req.params.ref);
  if (!ref) return res.status(400).json({ status: "error", message: "Referencia requerida" });

  try {
    const data = await productUseCase.updateByRef(ref, { status: true, publicado: true });
    if (!data) return res.status(404).json({ status: "error", message: "Producto no encontrado" });
    return res.status(200).json(data);
  } catch (error) {
    console.error(error);
    return respuestaError(res);
  }
}

export async function handleUnpublishProductByRef(req: Request, res: Response): Promise<Response> {
  const ref = String(req.params.ref);
  if (!ref) return res.status(400).json({ status: "error", message: "Referencia requerida" });

  try {
    const data = await productUseCase.updateByRef(ref, { status: false, publicado: false });
    if (!data) return res.status(404).json({ status: "error", message: "Producto no encontrado" });
    return res.status(200).json(data);
  } catch (error) {
    console.error(error);
    return respuestaError(res);
  }
}

export async function handleDeleteProductByRef(req: Request, res: Response): Promise<Response> {
  const ref = String(req.params.ref);
  if (!ref) return res.status(400).json({ status: "error", message: "Referencia requerida" });

  try {
    const success = await productUseCase.deleteByRef(ref);
    if (!success) return res.status(404).json({ status: "error", message: "No encontrado" });
    return res.status(200).json({ status: "success", message: "Producto eliminado" });
  } catch (error) {
    console.error(error);
    return respuestaError(res);
  }
}