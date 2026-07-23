import { Router } from "express";
import { listProductCategories, handleCreateProductCategory, handleDeleteProductCategory } from "../controller/products_category.controller.js";

const router = Router();
router.get("/", listProductCategories);
router.post("/", handleCreateProductCategory);
router.delete("/:id", handleDeleteProductCategory);

export default router;
