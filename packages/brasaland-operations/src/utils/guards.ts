import type { Price } from "../types/models.js";

export function assertArray<T>(value: T[], name: string): void {
  if (!Array.isArray(value)) {
    throw new TypeError(`${name} must be an array.`);
  }
}

export function assertDate(value: Date, name: string): void {
  if (!(value instanceof Date) || !Number.isFinite(value.getTime())) {
    throw new TypeError(`${name} must be a valid Date.`);
  }

}

export function assertCurrency(currency: "USD" | "COP"): void {
  if (currency !== "USD" && currency !== "COP") {
    throw new TypeError("currency must be USD or COP.");
  }
}

export function assertNonNegative(value: number, name: string): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new RangeError(`${name} must be a finite nonnegative number.`);
  }
}

export function assertPositive(value: number, name: string): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new RangeError(`${name} must be a finite number greater than 0.`);
  }
}

export function priceAmount(
  price: Price,
  currency: "USD" | "COP",
  name: string,
): number {
  assertCurrency(currency);
  if (price === null || typeof price !== "object") {
    throw new TypeError(`${name} must contain USD and COP amounts.`);
  }
  const amount: number = price[currency];
  assertNonNegative(amount, `${name}.${currency}`);
  return amount;
}

export function roundToTwo(value: number): number {
  if (!Number.isFinite(value)) {
    throw new RangeError("Calculation produced a non-finite result.");
  }
  const magnitude: number = Math.abs(value);
  const rounded: number =
    Math.round((magnitude + Number.EPSILON * magnitude) * 100) / 100;
  if (!Number.isFinite(rounded)) {
    throw new RangeError("Calculation exceeds the supported numeric range.");
  }
  return rounded === 0 ? 0 : Math.sign(value) * rounded;
}
