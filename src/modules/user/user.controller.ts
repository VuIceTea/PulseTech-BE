import type { RequestHandler } from "express";
import {
  deactivateUser,
  getProfile,
  listUsers,
  updateUser,
} from "./user.service";
import {
  parseCreateUserBody,
  parseListUsersQuery,
  parseUpdateUserBody,
  parseUserId,
} from "./user.validator";
import { AppError } from "../../utils/app-error";

function getStatusCode(error: unknown, fallback: number): number {
  return error instanceof AppError ? error.statusCode : fallback;
}

export const listUsersHandler: RequestHandler = async (req, res) => {
  const query = parseListUsersQuery(req.query as Record<string, unknown>);
  const result = await listUsers(query);
  res.status(200).json(result);
};

export const getProfileHandler: RequestHandler = async (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await getProfile(userId);
    res.status(200).json({ data: user });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(getStatusCode(error, 400)).json({ message });
  }
};

export const updateProfileHandler: RequestHandler = async (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const payload = parseUpdateUserBody(req.body);
    const user = await updateUser(userId, payload);

    res
      .status(200)
      .json({ message: "Profile updated successfully", data: user });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(getStatusCode(error, 400)).json({ message });
  }
};

export const deactivateUserHandler: RequestHandler = async (req, res) => {
  const id = parseUserId(req.params.id);
  const user = await deactivateUser(id);

  res.status(200).json({
    message: "User deactivated successfully",
    data: user,
  });
};
