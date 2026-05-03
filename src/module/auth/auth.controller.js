import ApiResponse from "../../common/utils/api-response.js";
import { authenticateUserWithPassword, signInWithPassword } from "./auth.service.js";

export const signInUser = async (req, res, next) => {
  try {
    const result = await signInWithPassword(req.body);
    return ApiResponse.ok(res, "Signed in.", result);
  } catch (error) {
    next(error);
  }
};

export const authenticateUser = async (req, res, next) => {
  try {
    const result = await authenticateUserWithPassword(req.body);

    return ApiResponse.ok(res, "User authenticated.", result);
  } catch (error) {
    next(error);
  }
};
