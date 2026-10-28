import type {
  Location,
  MenuItem,
  SaleTransaction,
  WasteRecord,
} from "./index.js";
import {
  binarySearchLocationByCapacity,
  calculateAverageTicket,
  calculateCountryComparison,
  calculateDailyRevenue,
  calculateLocationMargin,
  calculateWasteCost,
  convertCurrency,
  countSalesByPaymentMethod,
  filterActiveLocations,
  filterMenuItemsByCategory,
  filterSalesByDateRange,
  filterSalesByLocation,
  findLocationById,
  findMenuItemByName,
  findTopSellingItems,
  groupWasteByReason,
  rankLocationsByPerformance,
  scoreLocationPerformance,
  sortLocationsByCapacity,
  sortMenuItemsByPrice,
  validateLocation,
  validateMenuItem,
  validateSaleTransaction,
} from "./index.js";

const menuItems: MenuItem[] = [
  {
    id: "ITEM-PICANHA-250",
    name: "Picanha 250g",
    category: "Meat",
    basePrice: { USD: 18.5, COP: 74000 },
    ingredientCost: { USD: 7.2, COP: 28800 },
    prepTimeMinutes: 15,
    isAvailableInColombia: true,
    isAvailableInUSA: true,
    allergens: [],
    status: "Active",
  },
  {
    id: "ITEM-FRIES",
    name: "French Fries",
    category: "Side",
    basePrice: { USD: 4.5, COP: 18000 },
    ingredientCost: { USD: 1.2, COP: 4800 },
    prepTimeMinutes: 8,
    isAvailableInColombia: true,
    isAvailableInUSA: true,
    allergens: [],
    status: "Active",
  },
  {
    id: "ITEM-COKE",
    name: "Coca-Cola",
    category: "Beverage",
    basePrice: { USD: 2.5, COP: 10000 },
    ingredientCost: { USD: 0.8, COP: 3200 },
    prepTimeMinutes: 2,
    isAvailableInColombia: true,
    isAvailableInUSA: true,
    allergens: [],
    status: "Active",
  },
];

const medellin: Location = {
  id: "LOC-MEDELLIN-01",
  name: "Brasaland Medellin Centro",
  city: "Medellin",
  country: "Colombia",
  openingYear: 2008,
  seatingCapacity: 80,
  staffCount: 12,
  monthlyRentCost: { USD: 1500, COP: 6000000 },
  averageMonthlyUtilities: { USD: 400, COP: 1600000 },
  manager: "Carlos Jimenez",
  status: "Active",
};
const miami: Location = {
  id: "LOC-MIAMI-01",
  name: "Brasaland Miami Beach",
  city: "Miami",
  country: "USA",
  openingYear: 2018,
  seatingCapacity: 100,
  staffCount: 15,
  monthlyRentCost: { USD: 5500, COP: 22000000 },
  averageMonthlyUtilities: { USD: 800, COP: 3200000 },
  manager: "Jake Morrison",
  status: "Active",
};
const locations: Location[] = [medellin, miami];

const sales: SaleTransaction[] = [
  {
    id: "TXN-2024-15482",
    locationId: medellin.id,
    itemId: "ITEM-PICANHA-250",
    quantity: 2,
    totalPrice: { USD: 37, COP: 148000 },
    paymentMethod: "Credit card",
    timestamp: new Date("2024-03-15T19:30:00Z"),
    waiterName: "Maria Gonzalez",
  },
  {
    id: "TXN-2024-15483",
    locationId: miami.id,
    itemId: "ITEM-FRIES",
    quantity: 3,
    totalPrice: { USD: 13.5, COP: 54000 },
    paymentMethod: "Cash",
    timestamp: new Date("2024-03-15T20:15:00Z"),
    waiterName: "John Smith",
  },
];
const wasteRecords: WasteRecord[] = [
  {
    id: "WASTE-DEMO-01",
    locationId: medellin.id,
    itemId: "ITEM-FRIES",
    quantity: 2,
    reason: "Cooking error",
    cost: { USD: 2.4, COP: 9600 },
    timestamp: new Date("2024-03-15T21:00:00Z"),
    reportedBy: "Demo Staff",
  },
];
const day: Date = new Date("2024-03-15T00:00:00Z");
const referenceDate: Date = new Date("2024-03-16T00:00:00Z");
const sortedLocations: Location[] = sortLocationsByCapacity(locations, "asc");
const validations = [
  ...menuItems.map(validateMenuItem),
  ...locations.map(validateLocation),
  ...sales.map(validateSaleTransaction),
];
for (const result of validations) {
  if (!result.valid) {
    throw new Error(`Demo data failed validation: ${result.errors.join(" ")}`);
  }
}

export const demoResults = {
  referenceDate: referenceDate.toISOString(),
  validatedEntities: validations.length,
  dailyRevenue: {
    USD: calculateDailyRevenue(sales, day, "USD"),
    COP: calculateDailyRevenue(sales, day, "COP"),
  },
  averageTicket: {
    USD: calculateAverageTicket(sales, "USD"),
    COP: calculateAverageTicket(sales, "COP"),
  },
  marginPercent: {
    Medellin: calculateLocationMargin(sales, menuItems, medellin.id, "USD"),
    Miami: calculateLocationMargin(sales, menuItems, miami.id, "USD"),
  },
  wasteCost: {
    USD: calculateWasteCost(wasteRecords, medellin.id, "USD"),
    COP: calculateWasteCost(wasteRecords, medellin.id, "COP"),
  },
  conversion: {
    oneUSDInCOP: convertCurrency(1, "USD", "COP"),
    fourThousandCOPInUSD: convertCurrency(4000, "COP", "USD"),
  },
  collections: {
    medellinSales: filterSalesByLocation(sales, medellin.id).map((sale) => sale.id),
    dailySales: filterSalesByDateRange(
      sales, day, new Date("2024-03-15T23:59:59.999Z"),
    ).map((sale) => sale.id),
    meatItems: filterMenuItemsByCategory(menuItems, "Meat").map((item) => item.id),
    activeLocations: filterActiveLocations(locations).map((location) => location.id),
    capacityAscending: sortedLocations.map((location) => location.id),
    priceDescendingUSD: sortMenuItemsByPrice(menuItems, "USD", "desc")
      .map((item) => item.id),
  },
  searches: {
    location: findLocationById(locations, medellin.id)?.id ?? null,
    menuItem: findMenuItemByName(menuItems, "FRENCH FRIES")?.id ?? null,
    capacityIndex: binarySearchLocationByCapacity(sortedLocations, 100),
  },
  paymentCounts: countSalesByPaymentMethod(sales),
  topSellingItems: findTopSellingItems(sales, menuItems, 3)
    .map(({ item, totalSold }) => ({ name: item.name, totalSold })),
  wasteByReason: Object.fromEntries(
    Object.entries(groupWasteByReason(wasteRecords))
      .map(([reason, records]) => [reason, records.map((record) => record.id)]),
  ),
  countryComparison: calculateCountryComparison(sales, locations, menuItems),
  medellinScore: scoreLocationPerformance(
    medellin, sales, wasteRecords, menuItems, referenceDate,
  ),
  ranking: rankLocationsByPerformance(
    locations, sales, wasteRecords, menuItems, referenceDate,
  ).map(({ location, score }) => ({ locationId: location.id, score })),
};

console.log(JSON.stringify(demoResults, null, 2));
