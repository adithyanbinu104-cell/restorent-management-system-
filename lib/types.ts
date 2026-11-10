export type MenuItem = {
  itemId: string;
  itemName: string;
  stock: number;
  price: number;
  image: string;
};

export type RestaurantOrder = {
  orderId: string;
  itemId: string;
  itemName?: string;
  quantity: number;
  singleItemPrice: number;
  totalPrice: number;
  payment: string;
};

export type ApiResponse<T = unknown> = {
  success: boolean;
  sheet?: string;
  total?: number;
  data?: T;
  message?: string;
  error?: string;
};

// Normalize Google Sheets header keys (with spaces) to camelCase
export function normalizeItem(raw: Record<string, unknown>): MenuItem {
  const get = (...keys: string[]) => {
    for (const k of keys) {
      if (raw[k] !== undefined) return raw[k];
      // try lowercased trimmed
      const found = Object.keys(raw).find((rk) => rk.trim().toLowerCase() === k.trim().toLowerCase());
      if (found) return raw[found];
    }
    return undefined;
  };
  return {
    itemId: String(get("item id", "itemId", "id", "ID") ?? ""),
    itemName: String(get("item name", "itemName", "name") ?? ""),
    stock: Number(get("stock", "Stock") ?? 0),
    price: Number(get("price", "Price") ?? 0),
    image: String(get("image", "Image", "img") ?? ""),
  };
}

export function normalizeOrder(raw: Record<string, unknown>): RestaurantOrder {
  const get = (...keys: string[]) => {
    for (const k of keys) {
      if (raw[k] !== undefined) return raw[k];
      const found = Object.keys(raw).find((rk) => rk.trim().toLowerCase() === k.trim().toLowerCase());
      if (found) return raw[found];
    }
    return undefined;
  };
  return {
    orderId: String(get("order id", "orderId", "id") ?? ""),
    itemId: String(get("item id", "itemId") ?? ""),
    quantity: Number(get("quantity", "Quantity") ?? 0),
    singleItemPrice: Number(get("single item price", "singleItemPrice", "price") ?? 0),
    totalPrice: Number(get("total price", "totalPrice", "total") ?? 0),
    payment: String(get("payment", "Payment") ?? ""),
  };
}
