import ApiResponse from "../../common/utils/api-response.js";
import { registerAccount } from "./account.service.js";

export const createAccount = async (req, res, next) => {
  try {
    const result = await registerAccount({
      body: req.body,
      file: req.file,
    });

    return ApiResponse.created(res, "Account created.", result);
  } catch (error) {
    next(error);
  }
};
