export const constants = {
  ROLES: {
    ADMIN: "ADMIN",
    CUSTOMER: "CUSTOMER",
    STAFF: "STAFF",
  } as const,

  ORDER_STATUS: {
    PENDING: "PENDING",
    CONFIRMED: "CONFIRMED",
    PROCESSING: "PROCESSING",
    SHIPPING: "SHIPPING",
    DELIVERED: "DELIVERED",
    CANCELLED: "CANCELLED",
    RETURNED: "RETURNED",
  } as const,

  PAYMENT_METHOD: {
    COD: "COD",
    VNPAY: "VNPAY",
    MOMO: "MOMO",
    BANK: "BANK",
  } as const,

  PRODUCT_STATUS: {
    ACTIVE: "ACTIVE",
    INACTIVE: "INACTIVE",
    OUT_OF_STOCK: "OUT_OF_STOCK",
  } as const,

  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,

  MAX_PRODUCT_IMAGES: 8,
} as const;

export default constants;
