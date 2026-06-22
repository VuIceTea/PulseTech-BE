import { Router } from "express";
import {
  getProvincesHandler,
  getWardsByProvinceHandler,
  searchWardsHandler,
} from "./location.controller";

const router = Router();

router.get("/provinces", getProvincesHandler);
router.get("/provinces/:provinceId/wards", getWardsByProvinceHandler);
router.get("/wards/search", searchWardsHandler);

export default router;
