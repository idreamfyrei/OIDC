import { Router } from "express";
import { profileImageUpload } from "../../common/middleware/multer.js";
import { createAccount } from "./account.controller.js";

const accountRouter = Router();

accountRouter.post("/accounts/register", profileImageUpload, createAccount);

export default accountRouter;
