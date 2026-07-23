import { Router } from "express";
import {
  listProducts,
  listPaginatedProducts,
  listPublishedProducts,
  listFeaturedProducts,
  getProductById,
  getProductByRef,
  handleCreateProduct,
  handleUpdateProductByRef,
  handlePublishProductByRef,
  handleUnpublishProductByRef,
  handleDeleteProductByRef,
} from "../controller/products.controller.js";
import { verifyToken, authorizeRoles } from "../../../shared/auth.js";

const router = Router();

// Main product listing with filters
router.get("/", listProducts);

// Paginated products endpoint
router.get("/paginated", listPaginatedProducts);

// Published products endpoint
router.get("/published", listPublishedProducts);

// Featured products endpoint
router.get("/featured", listFeaturedProducts);

// Get product by internal ID
router.get("/:id", getProductById);

// Create product (protected)
router.post("/", verifyToken, authorizeRoles("admin", "asesor"), handleCreateProduct);

// Update product by reference (protected)
router.patch("/:ref", verifyToken, authorizeRoles("admin", "asesor"), handleUpdateProductByRef);

// Publish product by reference (protected)
router.post("/:ref/publish", verifyToken, authorizeRoles("admin", "asesor"), handlePublishProductByRef);
router.patch("/:ref/publish", verifyToken, authorizeRoles("admin", "asesor"), handlePublishProductByRef);

// Unpublish product by reference (protected)
router.post("/:ref/unpublish", verifyToken, authorizeRoles("admin", "asesor"), handleUnpublishProductByRef);
router.patch("/:ref/unpublish", verifyToken, authorizeRoles("admin", "asesor"), handleUnpublishProductByRef);

// Delete product by reference (protected)
router.delete("/:ref", verifyToken, authorizeRoles("admin"), handleDeleteProductByRef);

export default router;