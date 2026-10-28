import type {
  Location,
  MenuCategory,
  MenuItem,
  SaleTransaction,
} from "../types/models.js";
import { assertArray, assertDate } from "./guards.js";

export function filterSalesByLocation(
  sales: SaleTransaction[],
  locationId: string,
): SaleTransaction[] {
  assertArray(sales, "sales");
  return sales.filter((sale) => sale.locationId === locationId);
}

export function filterSalesByDateRange(
  sales: SaleTransaction[],
  startDate: Date,
  endDate: Date,
): SaleTransaction[] {
  assertArray(sales, "sales");
  assertDate(startDate, "startDate");
  assertDate(endDate, "endDate");
  const start: number = startDate.getTime();
  const end: number = endDate.getTime();
  if (start > end) {
    throw new RangeError("startDate must not be after endDate.");
  }

  return sales.filter((sale) => {
    assertDate(sale.timestamp, `Sale ${sale.id} timestamp`);
    const timestamp: number = sale.timestamp.getTime();
    return timestamp >= start && timestamp <= end;
  });
}

export function filterMenuItemsByCategory(
  items: MenuItem[],
  category: MenuCategory,
): MenuItem[] {
  assertArray(items, "items");
  return items.filter((item) => item.category === category);
}

export function filterActiveLocations(locations: Location[]): Location[] {
  assertArray(locations, "locations");
  return locations.filter((location) => location.status === "Active");
}

export function sortLocationsByCapacity(
  locations: Location[],
  order: "asc" | "desc",
): Location[] {
  assertArray(locations, "locations");
  const direction: number = order === "asc" ? 1 : -1;
  return [...locations].sort(
    (left, right) => (left.seatingCapacity - right.seatingCapacity) * direction,
  );
}

export function sortMenuItemsByPrice(
  items: MenuItem[],
  currency: "USD" | "COP",
  order: "asc" | "desc",
): MenuItem[] {
  assertArray(items, "items");
  const direction: number = order === "asc" ? 1 : -1;
  return [...items].sort(
    (left, right) => (left.basePrice[currency] - right.basePrice[currency]) * direction,
  );
}
