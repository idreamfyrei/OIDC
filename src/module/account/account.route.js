import { Router } from "express";
import { createAccount } from "./account.controller.js";

const accountRouter = Router();

accountRouter.post("/accounts/register", createAccount);

export default accountRouter;
