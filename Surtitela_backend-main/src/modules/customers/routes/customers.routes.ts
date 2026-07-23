import { Router } from "express";
import { listCustomers, getCustomer, handleCreateCustomer, handleUpdateCustomer, handleDeleteCustomer } from "../controller/customers.controller.js";
import { verifyToken, authorizeRoles } from "../../../shared/auth.js";

const router = Router();
router.use(verifyToken, authorizeRoles("admin"));
router.get("/", listCustomers);
router.get("/:id", getCustomer);
router.post("/", handleCreateCustomer);
router.patch("/:id", handleUpdateCustomer);
router.put("/:id", handleUpdateCustomer);
router.delete("/:id", handleDeleteCustomer);

export default router;
