import type {
  CountryMetrics,
  Location,
  MenuItem,
  PaymentMethod,
  SaleTransaction,
  WasteReason,
  WasteRecord,
} from "../types/models.js";
import { filterSalesByLocation } from "./collections.js";
import {
  assertArray,
  assertCurrency,
  assertDate,
  assertNonNegative,
  assertPositive,
  priceAmount,
  roundToTwo,
} from "./guards.js";

function sumRevenue(
  sales: SaleTransaction[],
  currency: "USD" | "COP",
): number {
  return sales.reduce(
    (total, sale) =>
      total + priceAmount(sale.totalPrice, currency, `Sale ${sale.id} totalPrice`),
    0,
  );
}

function requireMenuItem(
  sale: SaleTransaction,
  itemsById: Map<string, MenuItem>,
): MenuItem {
  const item: MenuItem | undefined = itemsById.get(sale.itemId);
  if (item === undefined) {
    throw new Error(`Sale ${sale.id} references missing menu item ${sale.itemId}.`);
  }
  return item;
}

function sumWasteCost(
  wasteRecords: WasteRecord[],
  locationId: string,
  currency: "USD" | "COP",
): number {
  return wasteRecords
    .filter((record) => record.locationId === locationId)
    .reduce(
      (sum, record) =>
        sum + priceAmount(record.cost, currency, `Waste ${record.id} cost`),
      0,
    );
}

export function calculateDailyRevenue(
  sales: SaleTransaction[],
  date: Date,
  currency: "USD" | "COP",
): number {
  assertArray(sales, "sales");
  assertDate(date, "date");
  assertCurrency(currency);
  const dailySales: SaleTransaction[] = sales.filter((sale) => {
    assertDate(sale.timestamp, `Sale ${sale.id} timestamp`);
    return sale.timestamp.getUTCFullYear() === date.getUTCFullYear() &&
      sale.timestamp.getUTCMonth() === date.getUTCMonth() &&
      sale.timestamp.getUTCDate() === date.getUTCDate();
  });
  return roundToTwo(sumRevenue(dailySales, currency));
}

export function calculateLocationMargin(
  sales: SaleTransaction[],
  menuItems: MenuItem[],
  locationId: string,
  currency: "USD" | "COP",
): number {
  assertArray(sales, "sales");
  assertArray(menuItems, "menuItems");
  assertCurrency(currency);
  const locationSales: SaleTransaction[] = filterSalesByLocation(sales, locationId);
  const itemsById: Map<string, MenuItem> = new Map(
    menuItems.map((item) => [item.id, item]),
  );
  const revenue: number = sumRevenue(locationSales, currency);
  const ingredientCost: number = locationSales.reduce((total, sale) => {
    const item: MenuItem = requireMenuItem(sale, itemsById);
    assertPositive(sale.quantity, `Sale ${sale.id} quantity`);
    return total + sale.quantity *
      priceAmount(item.ingredientCost, currency, `Menu item ${item.id} ingredientCost`);
  }, 0);
  if (!Number.isFinite(ingredientCost) || !Number.isFinite(revenue)) {
    throw new RangeError("Margin totals exceed the supported numeric range.");
  }
  return revenue === 0 ? 0 : roundToTwo(((revenue - ingredientCost) / revenue) * 100);
}

export function calculateWasteCost(
  wasteRecords: WasteRecord[],
  locationId: string,
  currency: "USD" | "COP",
): number {
  assertArray(wasteRecords, "wasteRecords");
  assertCurrency(currency);
  return roundToTwo(sumWasteCost(wasteRecords, locationId, currency));
}

export function convertCurrency(
  amount: number,
  fromCurrency: "USD" | "COP",
  toCurrency: "USD" | "COP",
): number {
  assertCurrency(fromCurrency);
  assertCurrency(toCurrency);
  if (!Number.isFinite(amount)) {
    throw new RangeError("amount must be finite.");
  }
  if (fromCurrency === toCurrency) {
    return amount;
  }
  return roundToTwo(fromCurrency === "USD" ? amount * 4000 : amount / 4000);
}

export function countSalesByPaymentMethod(
  sales: SaleTransaction[],
): Record<PaymentMethod, number> {
  assertArray(sales, "sales");
  const counts: Record<PaymentMethod, number> = {
    Cash: 0,
    "Credit card": 0,
    "Debit card": 0,
    "Digital wallet": 0,
  };
  for (const sale of sales) {
    if (!Object.hasOwn(counts, sale.paymentMethod)) {
      throw new TypeError(`Sale ${sale.id} has an invalid payment method.`);
    }
    counts[sale.paymentMethod] += 1;
  }
  return counts;
}

export function calculateAverageTicket(
  sales: SaleTransaction[],
  currency: "USD" | "COP",
): number {
  assertArray(sales, "sales");
  assertCurrency(currency);
  return sales.length === 0 ? 0 : roundToTwo(sumRevenue(sales, currency) / sales.length);
}

export function findTopSellingItems(
  sales: SaleTransaction[],
  menuItems: MenuItem[],
  topN: number,
): Array<{ item: MenuItem; totalSold: number }> {
  assertArray(sales, "sales");
  assertArray(menuItems, "menuItems");
  assertNonNegative(topN, "topN");
  if (!Number.isInteger(topN)) {
    throw new RangeError("topN must be an integer.");
  }
  if (topN === 0) {
    return [];
  }
  const itemsById: Map<string, MenuItem> = new Map(
    menuItems.map((item) => [item.id, item]),
  );
  const totals: Map<string, { item: MenuItem; totalSold: number }> = new Map();
  for (const sale of sales) {
    const item: MenuItem = requireMenuItem(sale, itemsById);
    assertPositive(sale.quantity, `Sale ${sale.id} quantity`);
    const totalSold: number = (totals.get(item.id)?.totalSold ?? 0) + sale.quantity;
    if (!Number.isFinite(totalSold)) {
      throw new RangeError(`Menu item ${item.id} quantity total exceeds the supported numeric range.`);
    }
    totals.set(item.id, { item, totalSold });
  }
  return [...totals.values()]
    .sort((left, right) => right.totalSold - left.totalSold)
    .slice(0, topN);
}

export function groupWasteByReason(
  wasteRecords: WasteRecord[],
): Record<WasteReason, WasteRecord[]> {
  assertArray(wasteRecords, "wasteRecords");
  const groups: Record<WasteReason, WasteRecord[]> = {
    Expired: [],
    "Cooking error": [],
    "Customer return": [],
    Damage: [],
    Other: [],
  };
  for (const record of wasteRecords) {
    if (!Object.hasOwn(groups, record.reason)) {
      throw new TypeError(`Waste ${record.id} has an invalid reason.`);
    }
    groups[record.reason].push(record);
  }
  return groups;
}

export function calculateCountryComparison(
  sales: SaleTransaction[],
  locations: Location[],
  menuItems: MenuItem[],
): { Colombia: CountryMetrics; USA: CountryMetrics } {
  assertArray(sales, "sales");
  assertArray(locations, "locations");
  assertArray(menuItems, "menuItems");
  const result: { Colombia: CountryMetrics; USA: CountryMetrics } = {
    Colombia: {
      totalLocations: 0,
      totalRevenue: { USD: 0, COP: 0 },
      averageRevenuePerLocation: { USD: 0, COP: 0 },
      totalSales: 0,
    },
    USA: {
      totalLocations: 0,
      totalRevenue: { USD: 0, COP: 0 },
      averageRevenuePerLocation: { USD: 0, COP: 0 },
      totalSales: 0,
    },
  };
  const locationsById: Map<string, Location> = new Map();
  for (const location of locations) {
    if (location.country !== "Colombia" && location.country !== "USA") {
      throw new TypeError(`Location ${location.id} has an invalid country.`);
    }
    if (locationsById.has(location.id)) {
      throw new Error(`Duplicate location ID ${location.id}.`);
    }
    locationsById.set(location.id, location);
    result[location.country].totalLocations += 1;
  }
  for (const sale of sales) {
    const location: Location | undefined = locationsById.get(sale.locationId);
    if (location === undefined) {
      throw new Error(`Sale ${sale.id} references missing location ${sale.locationId}.`);
    }
    const metrics: CountryMetrics = result[location.country];
    metrics.totalSales += 1;
    metrics.totalRevenue.USD += priceAmount(sale.totalPrice, "USD", `Sale ${sale.id} totalPrice`);
    metrics.totalRevenue.COP += priceAmount(sale.totalPrice, "COP", `Sale ${sale.id} totalPrice`);
  }
  for (const metrics of Object.values(result)) {
    const count: number = metrics.totalLocations;
    metrics.averageRevenuePerLocation = {
      USD: count === 0 ? 0 : roundToTwo(metrics.totalRevenue.USD / count),
      COP: count === 0 ? 0 : roundToTwo(metrics.totalRevenue.COP / count),
    };
    metrics.totalRevenue = {
      USD: roundToTwo(metrics.totalRevenue.USD),
      COP: roundToTwo(metrics.totalRevenue.COP),
    };
  }
  return result;
}

export function scoreLocationPerformance(
  location: Location,
  sales: SaleTransaction[],
  wasteRecords: WasteRecord[],
  menuItems: MenuItem[],
  referenceDate: Date = new Date(),
): number {
  if (location === null || typeof location !== "object" || Array.isArray(location)) {
    throw new TypeError("location must be an object.");
  }
  assertArray(sales, "sales");
  assertArray(wasteRecords, "wasteRecords");
  assertArray(menuItems, "menuItems");
  assertDate(referenceDate, "referenceDate");
  assertPositive(location.seatingCapacity, `Location ${location.id} seatingCapacity`);
  if (
    !Number.isInteger(location.openingYear) ||
    location.openingYear < 2008 ||
    location.openingYear > referenceDate.getUTCFullYear()
  ) {
    throw new RangeError(
      `Location ${location.id} openingYear must be between 2008 and the reference year.`,
    );
  }

  const locationSales: SaleTransaction[] = filterSalesByLocation(sales, location.id);
  const revenue: number = sumRevenue(locationSales, "USD");
  const wasteCost: number = sumWasteCost(wasteRecords, location.id, "USD");
  if (!Number.isFinite(revenue) || !Number.isFinite(wasteCost)) {
    throw new RangeError("Performance totals exceed the supported numeric range.");
  }
  const margin: number = calculateLocationMargin(
    locationSales, menuItems, location.id, "USD",
  );
  if (revenue === 0) {
    return 0;
  }

  const openingTime: number = Date.UTC(location.openingYear, 0, 1);
  const referenceDay: number = Date.UTC(
    referenceDate.getUTCFullYear(),
    referenceDate.getUTCMonth(),
    referenceDate.getUTCDate(),
  );
  const operatingDays: number = Math.max(
    1, Math.floor((referenceDay - openingTime) / 86_400_000),
  );
  const revenuePoints: number = Math.min(40, (revenue / operatingDays / 1000) * 40);
  const efficiencyPoints: number = Math.min(
    30, (locationSales.length / location.seatingCapacity) * 30,
  );
  const wastePoints: number = Math.max(0, 20 - (wasteCost / revenue) * 100 * 2);
  const marginPoints: number = Math.min(10, Math.max(0, margin / 10));
  return roundToTwo(revenuePoints + efficiencyPoints + wastePoints + marginPoints);
}

export function rankLocationsByPerformance(
  locations: Location[],
  sales: SaleTransaction[],
  wasteRecords: WasteRecord[],
  menuItems: MenuItem[],
  referenceDate: Date = new Date(),
): Array<{ location: Location; score: number }> {
  assertArray(locations, "locations");
  assertArray(sales, "sales");
  assertArray(wasteRecords, "wasteRecords");
  assertArray(menuItems, "menuItems");
  assertDate(referenceDate, "referenceDate");
  return locations
    .map((location) => ({
      location,
      score: scoreLocationPerformance(
        location, sales, wasteRecords, menuItems, referenceDate,
      ),
    }))
    .sort((left, right) => right.score - left.score);
}
