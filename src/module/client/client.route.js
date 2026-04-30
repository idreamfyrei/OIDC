import { Router } from "express";
import {
  getClientPublicDetails,
  getClients,
  registerClient,
} from "./client.controller.js";

const clientRouter = Router();

clientRouter.get("/clients", getClients);
clientRouter.post("/clients/register", registerClient);
clientRouter.get("/clients/:clientId", getClientPublicDetails);

export default clientRouter;
