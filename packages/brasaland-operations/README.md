# Brasaland Operations

Reusable TypeScript logic for Brasaland's restaurant operations.

## Current scope

The package provides all required domain models, three business validators, six
collection operations, three searches, eleven financial/report/scoring utilities,
and a reproducible executable demonstration. There is no API, database, or UI.

The [development plan](../../docs/milestone-two-plan.md) records the approved
behavior and phase completion criteria. The
[active briefing](../../memory-bank/active-contexts/milestone-two-CONTEXT.md)
defines the required entity fields and business rules.

## Setup and validation

From the repository root in PowerShell:

```powershell
Set-Location packages\brasaland-operations
npm ci
npm run typecheck
npm run demo
```

Dependencies and commands are local to this package. No root workspace runner or
changes to the public website are required.

Use Node.js 22 or newer and npm. `npm run build` emits JavaScript and declarations
under the ignored `dist/` directory. `npm run demo` builds first and runs the
synthetic example with a fixed scoring reference date of March 16, 2024. The
printed data is illustrative, not an actual operations report.

The public entry point is [src/index.ts](src/index.ts), emitted as `dist/index.js`.
After building and linking/installing this local package in a consumer:

```typescript
import { calculateDailyRevenue } from "@brasaland/operations";
import type { SaleTransaction } from "@brasaland/operations";

const sales: SaleTransaction[] = [];
const revenue: number = calculateDailyRevenue(
  sales, new Date("2024-03-15T00:00:00Z"), "USD",
);
```

The library has no runtime dependencies or Node-only imports. A browser consumer
can use the emitted ES modules or its own bundler. No workspace linking or
integration with the public website is configured by this milestone.

## Models

[src/types/models.ts](src/types/models.ts) exports:

- `Price`, `MenuItem`, `SaleTransaction`, `Location`, `WasteRecord`, and
  `CountryMetrics`.
- `MenuCategory`, `MenuItemStatus`, `PaymentMethod`, `Country`, `LocationStatus`,
  and `WasteReason` literal unions.

Import models with `import type` in TypeScript consumers. These declarations
have no runtime dependencies and do not perform runtime validation.

```typescript
import type { Price } from "./types/models.js";

const samplePrice: Price = { USD: 18.5, COP: 74000 };
```

The example assumes a consumer inside `src/`. The `.js` import suffix follows
TypeScript's NodeNext module convention.

## Business validation

[src/utils/validations.ts](src/utils/validations.ts) exports `validateMenuItem`,
`validateSaleTransaction`, `validateLocation`, and the `ValidationResult` type.

Each validator returns `{ valid: boolean, errors: string[] }`. Valid entities
produce an empty error array; invalid entities collect all applicable violations
without changing the input. All required positive numeric values must also be
finite. Required names cannot be empty or whitespace-only.

- Menu items: positive base prices and ingredient costs in both currencies,
  preparation time greater than zero and at most 60 minutes, a nonempty name,
  and availability in at least one country.
- Sales: positive quantity and total prices in both currencies, and a nonempty
  waiter name.
- Locations: integer opening year from 2008 through the current UTC year,
  positive seating capacity and staff count, and positive rent and utility costs
  in both currencies.

Null or non-object entity arguments throw `TypeError` rather than becoming empty
data. These functions check the specified business rules for typed entities; they
are not complete schema parsers for arbitrary external JSON. Location validation
uses the current UTC year to enforce the briefing's current-year rule.

## Collections and searches

[collections.ts](src/utils/collections.ts) provides location and date-range sales
filters, category filtering, active-location filtering, capacity sorting, and
price sorting in either currency. Date ranges compare exact instants inclusively;
invalid dates (including sale timestamps) and reversed ranges throw errors.
Sorting returns a new array and preserves input order for ties. Filtering and
sorting do not clone the contained entities.

[search.ts](src/utils/search.ts) provides explicit linear searches by location ID
and case-insensitive menu item name, returning `null` when not found. Capacity
binary search returns an index or `-1` and requires an array already sorted by
ascending capacity. It does not sort or scan to validate that precondition; any
matching index is valid for duplicate capacities. Non-finite targets are rejected.

All collection and search array arguments reject null or non-array values with
`TypeError`. Entity business rules should be checked with the validators before
processing; these utilities are not parsers for arbitrary external JSON.

## Financial calculations and reports

[transformations.ts](src/utils/transformations.ts) exports:

| Function | Result |
| --- | --- |
| `calculateDailyRevenue` | Revenue on the supplied UTC calendar date. |
| `calculateLocationMargin` | Ingredient-based profit margin percentage for one location. |
| `calculateWasteCost` | Total recorded waste cost for one location. |
| `convertCurrency` | USD/COP conversion using 1 USD = 4000 COP. |
| `countSalesByPaymentMethod` | Transaction counts with all payment-method keys present. |
| `calculateAverageTicket` | Total revenue divided by transaction count. |
| `findTopSellingItems` | Sold menu items ranked by total quantity, limited to `topN`. |
| `groupWasteByReason` | Waste records grouped under all waste-reason keys. |
| `calculateCountryComparison` | Location counts, revenue in both currencies, revenue per location, and transaction counts for Colombia and USA. |
| `scoreLocationPerformance` | A location's performance score from 0 to 100. |
| `rankLocationsByPerformance` | Locations and scores ranked highest first. |

- Sale `totalPrice` and waste `cost` are record totals, not per-unit values.
  Ingredient costs are per unit and are multiplied by sale quantity.
- Financial reports use the requested stored currency without converting it
  again. Calculated outputs are rounded to two decimal places; intermediate
  monetary totals are not rounded. Numbers do not retain trailing zeroes.
- Same-currency conversion returns the original amount, without rounding.
  Conversion supports finite negative amounts; recorded prices/costs must be
  nonnegative. Business validators enforce strictly positive entity prices.
- A loss produces a negative margin, intentionally clarifying the briefing's
  0-100 margin description. Zero revenue produces a margin of zero.
- Missing menu references in margin/top-seller reports and missing location
  references in country comparison throw errors identifying the sale and missing
  ID; no records are silently discarded. Country comparison also rejects duplicate
  location IDs to prevent inconsistent totals.
- Country comparison counts all supplied locations regardless of status.
  Its `menuItems` argument is retained to match the briefing, but no menu join is
  needed to calculate its specified metrics.
- Empty numerical reports return zero. Empty country comparisons contain both
  countries with zero metrics. Empty grouping/count reports contain every
  specified key.
- Top sellers exclude unsold items. Ties follow first appearance in the sales
  input. Zero `topN` returns `[]`; negative, fractional, or non-finite limits throw
  `RangeError`; oversized limits return all sold items.
- Non-finite amounts and unsupported currencies are rejected. Numerical overflow
  throws an error rather than producing a non-finite financial result.

### UTC reporting limitation

Daily revenue uses UTC year/month/day, independent of the host time zone.
Timestamps should include `Z` or an explicit offset. Invalid dates are rejected.
The required signature lacks a location or time-zone argument: it does not report
restaurant-local business days. Future location-aware reporting should use
`America/Bogota` and `America/New_York`, including daylight-saving changes.

### Performance scoring

Both scoring functions accept an optional final `referenceDate: Date` argument.
Existing briefing calls remain valid; omitting the argument uses today. Ranking
passes one reference date to every location.

- Estimate opening as January 1 of `openingYear` in UTC.
- Operating days are elapsed whole UTC days through the reference date, with a
  minimum of one. Reject opening years before 2008 or after the reference year.
- Revenue points: `min(40, totalUSDRevenue / operatingDays / 1000 * 40)`.
- Efficiency points: `min(30, transactionCount / seatingCapacity * 30)`.
- Waste points: `max(0, 20 - wasteUSD / revenueUSD * 100 * 2)`.
- Margin points: `min(10, max(0, marginPercent / 10))`, using the required margin
  function.
- Zero revenue earns an overall score of zero, including no-sales/no-waste
  locations. Losses never create negative margin points.
- Scoring uses only the requested location's sales and waste. It evaluates all
  supplied history, not an implicit reporting window. Ranking includes every
  supplied location and preserves input order for tied scores.

The optional date is an approved backward-compatible signature extension. With
an explicit reference date, scoring is deterministic and does not change inputs.
Default-today scoring and current-year location validation depend on the clock
and therefore are not strictly pure. This limitation is explicit rather than
hidden behind a global reference date.

## Verification

The executable [demo](src/demo.ts) invokes every required operation, validates its
typed sample entities, and prints results including:

| Result | Expected |
| --- | --- |
| Daily revenue | USD 50.50 / COP 202,000 |
| Average ticket | USD 25.25 / COP 101,000 |
| Medellin margin | 61.08% |
| Miami margin | 73.33% |
| Top seller | French Fries, 3 units |

Development verification also exercised empty inputs, invalid dates and ranges,
missing relationships, non-finite values, quantity semantics, stable ties,
unchanged inputs, exact score components, and score bounds. No automated test
files or test framework were added.
