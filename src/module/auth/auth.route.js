import { Router } from "express";
import { authenticateUser, signInUser } from "./auth.controller.js";

const authRouter = Router();

authRouter.post("/auth/sign-in", signInUser);
authRouter.post("/auth/user", authenticateUser);

export default authRouter;
