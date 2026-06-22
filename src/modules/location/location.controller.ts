import type { RequestHandler } from "express";
import { locationService } from "./location.service";
import { AppError } from "../../utils/app-error";

function parseParam(value: unknown, fieldName: string = "ID"): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new AppError(`${fieldName} không hợp lệ`, 400);
  }
  return value.trim();
}

function parseQueryKeyword(value: unknown): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new AppError("Keyword is required", 400);
  }
  return value.trim();
}

export const getProvincesHandler: RequestHandler = async (req, res) => {
  try {
    const provinces = await locationService.getAllProvinces();
    res.json({ data: provinces });
  } catch (error: any) {
    const message = error instanceof AppError ? error.message : "Lỗi server";
    res.status(500).json({ message });
  }
};

export const getWardsByProvinceHandler: RequestHandler = async (req, res) => {
  try {
    const provinceCode = parseParam(req.params.provinceCode, "Province Code");

    const wards = await locationService.getWardsByProvince(provinceCode);
    res.json({ data: wards });
  } catch (error: any) {
    const message = error instanceof AppError ? error.message : "Lỗi server";
    res.status(400).json({ message });
  }
};

export const searchWardsHandler: RequestHandler = async (req, res) => {
  try {
    const keyword = parseQueryKeyword(req.query.keyword);

    const wards = await locationService.searchWards(keyword);
    res.json({ data: wards });
  } catch (error: any) {
    const message = error instanceof AppError ? error.message : "Lỗi server";
    res.status(400).json({ message });
  }
};
