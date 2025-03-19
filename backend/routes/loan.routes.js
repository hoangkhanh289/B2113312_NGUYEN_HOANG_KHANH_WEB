import express from "express";
import { borrowBook } from "../controllers/loan.controller.js";

const router = express.Router();

router.post("/", borrowBook);

export default router;

