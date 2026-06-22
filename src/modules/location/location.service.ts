import { AppError } from "../../utils/app-error";

const BASE_URL = "https://production.cas.so/address-kit/2025-07-01";

export class LocationService {
  /**
   * Lấy danh sách Tỉnh/Thành phố
   */
  async getAllProvinces() {
    try {
      const response = await fetch(`${BASE_URL}/provinces`);
      if (!response.ok) throw new Error("Failed to fetch provinces");

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching provinces:", error);
      throw new AppError("Không thể lấy danh sách tỉnh/thành phố", 500);
    }
  }

  /**
   * Lấy danh sách Phường/Xã theo Tỉnh
   */
  async getWardsByProvince(provinceCode: string) {
    if (!provinceCode) {
      throw new AppError("Province code is required", 400);
    }

    try {
      const response = await fetch(
        `${BASE_URL}/provinces/${provinceCode}/communes`,
      );
      if (!response.ok) throw new Error("Failed to fetch wards");

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching wards:", error);
      throw new AppError("Không thể lấy danh sách phường/xã", 500);
    }
  }

  /**
   * Lấy tất cả Phường/Xã (dùng khi cần search)
   */
  async getAllCommunes() {
    try {
      const response = await fetch(`${BASE_URL}/communes`);
      if (!response.ok) throw new Error("Failed to fetch communes");

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching all communes:", error);
      throw new AppError("Không thể lấy danh sách xã/phường", 500);
    }
  }

  /**
   * Tìm kiếm phường/xã theo từ khóa
   */
  async searchWards(keyword: string) {
    if (!keyword || keyword.trim().length < 2) {
      throw new AppError("Keyword phải có ít nhất 2 ký tự", 400);
    }

    try {
      const allCommunes = await this.getAllCommunes();
      const searchTerm = keyword.toLowerCase().trim();

      return allCommunes.filter(
        (commune: any) =>
          commune.name?.toLowerCase().includes(searchTerm) ||
          commune.provinceName?.toLowerCase().includes(searchTerm),
      );
    } catch (error) {
      throw new AppError("Lỗi khi tìm kiếm phường/xã", 500);
    }
  }
}

export const locationService = new LocationService();
