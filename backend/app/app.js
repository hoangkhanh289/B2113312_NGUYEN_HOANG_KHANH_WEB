import express from "express";
import cors from "cors";
import userRoutes from "../routes/user.routes.js";
import bookRoutes from "../routes/book.routes.js";
import loanRoutes from "../routes/loan.routes.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/loans", loanRoutes);

export default app;
