import type {
  Location,
  MenuItem,
  Price,
  SaleTransaction,
} from "../types/models.js";

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

function assertEntity(value: object, name: string): void {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new TypeError(`${name} must be an object.`);
  }
}

function isPositiveFinite(value: number): boolean {
  return Number.isFinite(value) && value > 0;
}

function validatePrice(price: Price, field: string): string[] {
  if (price === null || typeof price !== "object") {
    return [`${field} must include positive USD and COP amounts.`];
  }

  const errors: string[] = [];

  if (!isPositiveFinite(price.USD)) {
    errors.push(`${field}.USD must be a finite number greater than 0.`);
  }
  if (!isPositiveFinite(price.COP)) {
    errors.push(`${field}.COP must be a finite number greater than 0.`);
  }

  return errors;
}

function isNonEmptyName(value: string): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

export function validateMenuItem(item: MenuItem): ValidationResult {
  assertEntity(item, "Menu item");
  const errors: string[] = [
    ...validatePrice(item.basePrice, "basePrice"),
    ...validatePrice(item.ingredientCost, "ingredientCost"),
  ];

  if (!isNonEmptyName(item.name)) {
    errors.push("name must not be empty.");
  }
  if (!isPositiveFinite(item.prepTimeMinutes) || item.prepTimeMinutes > 60) {
    errors.push("prepTimeMinutes must be a finite number greater than 0 and at most 60.");
  }
  if (item.isAvailableInColombia !== true && item.isAvailableInUSA !== true) {
    errors.push("Menu item must be available in at least one country.");
  }

  return { valid: errors.length === 0, errors };
}

export function validateSaleTransaction(sale: SaleTransaction): ValidationResult {
  assertEntity(sale, "Sale transaction");
  const errors: string[] = validatePrice(sale.totalPrice, "totalPrice");

  if (!isPositiveFinite(sale.quantity)) {
    errors.push("quantity must be a finite number greater than 0.");
  }
  if (!isNonEmptyName(sale.waiterName)) {
    errors.push("waiterName must not be empty.");
  }

  return { valid: errors.length === 0, errors };
}

export function validateLocation(location: Location): ValidationResult {
  assertEntity(location, "Location");
  const errors: string[] = [
    ...validatePrice(location.monthlyRentCost, "monthlyRentCost"),
    ...validatePrice(location.averageMonthlyUtilities, "averageMonthlyUtilities"),
  ];
  const currentYear: number = new Date().getUTCFullYear();

  if (
    !Number.isInteger(location.openingYear) ||
    location.openingYear < 2008 ||
    location.openingYear > currentYear
  ) {
    errors.push(`openingYear must be an integer between 2008 and ${currentYear}.`);
  }
  if (!isPositiveFinite(location.seatingCapacity)) {
    errors.push("seatingCapacity must be a finite number greater than 0.");
  }
  if (!isPositiveFinite(location.staffCount)) {
    errors.push("staffCount must be a finite number greater than 0.");
  }

  return { valid: errors.length === 0, errors };
}
