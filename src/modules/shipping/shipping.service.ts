import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/app-error";

export class ShippingService {
  async calculateShipping(data: {
    addressId: string;
    orderAmount: number;
    shippingMethodId?: string | null;
  }) {
    const address = await prisma.address.findUnique({
      where: { id: data.addressId },
    });

    if (!address) throw new AppError("Địa chỉ không tồn tại", 404);

    const orderAmount = Number(data.orderAmount);

    if (orderAmount >= 500000) {
      return {
        shippingFee: 0,
        shippingMethodName: "Miễn phí vận chuyển",
        estimatedDays: 2,
        isFreeShipping: true,
        note: "Miễn phí vận chuyển cho đơn hàng từ 500.000đ",
        distanceTier: "Toàn quốc",
      };
    }

    const provinceName = (address.provinceName || "").trim().toLowerCase();

    let shippingFee = 30000;
    let tier = "Nội thành / Gần";

    const northernProvinces = [
      "hà nội",
      "hải phòng",
      "nam định",
      "thái bình",
      "hưng yên",
      "bắc ninh",
      "vĩnh phúc",
      "hà nam",
    ];

    const southernProvinces = [
      "tp. hồ chí minh",
      "bình dương",
      "đồng nai",
      "long an",
      "tây ninh",
      "bà rịa vũng tàu",
    ];

    if (northernProvinces.some((p) => provinceName.includes(p))) {
      shippingFee = 25000;
      tier = "Miền Bắc";
    } else if (southernProvinces.some((p) => provinceName.includes(p))) {
      shippingFee = 25000;
      tier = "Miền Nam";
    } else if (
      provinceName.includes("hà nội") ||
      provinceName.includes("hồ chí minh")
    ) {
      shippingFee = 20000;
      tier = "Nội thành";
    } else {
      shippingFee = 40000;
      tier = "Tỉnh xa";
    }

    return {
      shippingFee,
      shippingMethodName: "Giao hàng tiêu chuẩn",
      estimatedDays: tier === "Nội thành" ? 1 : 2,
      isFreeShipping: false,
      note: `Phí vận chuyển theo khu vực: ${tier}`,
      distanceTier: tier,
    };
  }
}

export const shippingService = new ShippingService();
