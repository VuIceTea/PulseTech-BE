import { RequestHandler } from "express";
import {
  addAddress,
  deleteAddress,
  listAddresses,
  updateAddress,
} from "./address.service";
import { AddAddressDto } from "./dto/add-address.dto";
import { AppError } from "../../utils/app-error";

function getStatusCode(error: unknown, fallback: number): number {
  return error instanceof AppError ? error.statusCode : fallback;
}

export const addAddressHandler: RequestHandler = async (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const parsed = AddAddressDto.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: parsed.error.issues[0]?.message ?? "Invalid address payload",
      });
    }

    const payload = parsed.data;
    const address = await addAddress(userId, payload);
    res
      .status(201)
      .json({ message: "Address added successfully", data: address });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(getStatusCode(error, 400)).json({ message });
  }
};

export const listAddressesHandler: RequestHandler = async (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const addresses = await listAddresses(userId);
    res.status(200).json({ data: addresses });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(getStatusCode(error, 400)).json({ message });
  }
};

export const updateAddressHandler: RequestHandler = async (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const addressId = typeof req.params.id === "string" ? req.params.id : "";
    const parsed = AddAddressDto.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: parsed.error.issues[0]?.message ?? "Invalid address payload",
      });
    }
    const payload = parsed.data;
    const address = await updateAddress(userId, addressId, payload);
    res
      .status(200)
      .json({ message: "Address updated successfully", data: address });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(getStatusCode(error, 400)).json({ message });
  }
};

export const deleteAddressHandler: RequestHandler = async (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const addressId = typeof req.params.id === "string" ? req.params.id : "";
    await deleteAddress(userId, addressId);
    res.status(200).json({ message: "Address deleted successfully" });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(getStatusCode(error, 400)).json({ message });
  }
};
