import type { Location, MenuItem } from "../types/models.js";
import { assertArray } from "./guards.js";

export function findLocationById(
  locations: Location[],
  id: string,
): Location | null {
  assertArray(locations, "locations");
  for (const location of locations) {
    if (location.id === id) {
      return location;
    }
  }
  return null;
}

export function findMenuItemByName(
  items: MenuItem[],
  name: string,
): MenuItem | null {
  assertArray(items, "items");
  const normalizedName: string = name.toLowerCase();
  for (const item of items) {
    if (item.name.toLowerCase() === normalizedName) {
      return item;
    }
  }
  return null;
}

export function binarySearchLocationByCapacity(
  sortedLocations: Location[],
  targetCapacity: number,
): number {
  assertArray(sortedLocations, "sortedLocations");
  if (!Number.isFinite(targetCapacity)) {
    throw new RangeError("targetCapacity must be finite.");
  }
  let low: number = 0;
  let high: number = sortedLocations.length - 1;

  while (low <= high) {
    const middle: number = Math.floor(low + (high - low) / 2);
    const location: Location | undefined = sortedLocations[middle];
    if (location === undefined) {
      throw new TypeError("sortedLocations must not contain missing entries.");
    }
    if (location.seatingCapacity === targetCapacity) {
      return middle;
    }
    if (location.seatingCapacity < targetCapacity) {
      low = middle + 1;
    } else {
      high = middle - 1;
    }
  }
  return -1;
}
