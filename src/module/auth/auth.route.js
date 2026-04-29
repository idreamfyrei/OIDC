import { Router } from "express";
import { signInUser } from "./auth.controller.js";

const authRouter = Router();

authRouter.post("/auth/sign-in", signInUser);

export default authRouter;
