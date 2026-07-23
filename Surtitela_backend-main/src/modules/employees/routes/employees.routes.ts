import { Router } from "express";
import { listEmployees, handleCreateEmployee, handleDeleteEmployee } from "../controller/employees.controller.js";

const router = Router();
router.get("/", listEmployees);
router.post("/", handleCreateEmployee);
router.delete("/:id", handleDeleteEmployee);

export default router;
