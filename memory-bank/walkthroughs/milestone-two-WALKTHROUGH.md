# Milestone 2 Walkthrough: Brasaland Operations

## Overview

The [operations package](../../packages/brasaland-operations/README.md) implements
Brasaland's typed sales, waste, and performance calculations. It includes all 23
required operations, a public module entry point, and a synthetic demonstration;
it does not add a website screen, API, or database.

## Logic flow

1. Represent data with the interfaces in
   [models.ts](../../packages/brasaland-operations/src/types/models.ts).
2. Check menu items, sales, and locations with
   [validations.ts](../../packages/brasaland-operations/src/utils/validations.ts).
   Validators collect business-rule errors rather than changing the data.
3. Filter or sort arrays with
   [collections.ts](../../packages/brasaland-operations/src/utils/collections.ts),
   or locate entries with
   [search.ts](../../packages/brasaland-operations/src/utils/search.ts).
4. Pass the selected records to
   [transformations.ts](../../packages/brasaland-operations/src/utils/transformations.ts)
   for totals, margins, groups, country comparisons, scores, and rankings.
5. Consume exports from [index.ts](../../packages/brasaland-operations/src/index.ts).
   The [demo](../../packages/brasaland-operations/src/demo.ts) demonstrates every
   required operation and prints the resulting report.

```text
Typed data -> Business validation -> Filter/search/sort -> Reports and scores
```

## Key changes

- [package.json](../../packages/brasaland-operations/package.json): local
  `typecheck`, `build`, and `demo` commands; compiled module and type exports.
- [tsconfig.json](../../packages/brasaland-operations/tsconfig.json): strict
  checking, explicit handling of potentially missing array entries, and build
  output that is blocked when compilation fails.
- [guards.ts](../../packages/brasaland-operations/src/utils/guards.ts): shared
  checks for arrays, dates, amounts, currencies, and finite rounded results.
- [Package README](../../packages/brasaland-operations/README.md): all public
  functions, error behavior, limitations, and setup instructions.
- [Development plan](../../docs/milestone-two-plan.md): approved contracts and
  phase-by-phase verification results.

## Decision breakdowns

### 1. Sorting does not change the original array

**What and where:** Capacity sorting in
[collections.ts](../../packages/brasaland-operations/src/utils/collections.ts)
copies the array before sorting.

```typescript
return [...locations].sort(
  (left, right) => (left.seatingCapacity - right.seatingCapacity) * direction,
);
```

**How:** The spread expression creates a new array. The direction multiplier
selects ascending or descending order; equal capacities retain input order.

**Why:** Different consumers can sort the same data without changing each other's
input. This prevents mutation, meaning an unexpected change to existing data.
Contained location objects are shared, not deeply copied.

### 2. Daily revenue uses UTC dates

**What and where:** `calculateDailyRevenue` in
[transformations.ts](../../packages/brasaland-operations/src/utils/transformations.ts)
compares UTC calendar components.

```typescript
return sale.timestamp.getUTCFullYear() === date.getUTCFullYear() &&
  sale.timestamp.getUTCMonth() === date.getUTCMonth() &&
  sale.timestamp.getUTCDate() === date.getUTCDate();
```

**How:** Explicit-offset timestamps represent instants, while these methods
consistently determine which UTC day contains each instant.

**Why:** Results do not depend on the machine's time zone. UTC is a common time
reference, not the restaurant's local business day; location-aware reporting is
explicitly deferred because the required signature has no time-zone parameter.

### 3. Missing menu references are errors

**What and where:** The private `requireMenuItem` helper in
[transformations.ts](../../packages/brasaland-operations/src/utils/transformations.ts)
checks lookup results.

```typescript
const item: MenuItem | undefined = itemsById.get(sale.itemId);
if (item === undefined) {
  throw new Error(`Sale ${sale.id} references missing menu item ${sale.itemId}.`);
}
return item;
```

**How:** A `Map`, a key-based lookup collection, connects each sale to its menu
item. An absent item stops the report with an identifying error.

**Why:** Silently treating unknown ingredient costs as zero would overstate
margin. Ingredient cost is multiplied by quantity; sale and waste amounts are
already record totals and are not multiplied again.

### 4. Scoring accepts an explicit reference date

**What and where:** `scoreLocationPerformance` in
[transformations.ts](../../packages/brasaland-operations/src/utils/transformations.ts)
adds an optional final parameter.

```typescript
referenceDate: Date = new Date(),
```

**How:** Opening is estimated as January 1 of the opening year. Elapsed whole UTC
days have a minimum of one; ranking passes the same reference date to every
location.

**Why:** A fixed date makes scoring deterministic: identical inputs produce
identical results. Existing calls can omit it, but that clock-dependent default
is not strictly pure. A pure function depends only on explicit inputs and does
not modify them. Current-year location validation also depends on the clock.

### 5. Financial losses remain visible

**What and where:** Margin and scoring in
[transformations.ts](../../packages/brasaland-operations/src/utils/transformations.ts)
use different bounds.

```typescript
const marginPoints: number = Math.min(10, Math.max(0, margin / 10));
```

**How:** Financial margin, the percentage of revenue remaining after ingredient
costs, can be negative. Performance points cannot. Zero revenue returns an overall
score of zero, avoiding division by zero and rewards for inactivity.

**Why:** Clamping the report itself would conceal losses. Clamping only points
preserves the agreed 0-100 performance scale.

## Verification

The type checker, compiled financial/scoring examples, package self-import, and
public API shape checks passed. The demo produced identical output with host
time zones set to UTC and America/Los_Angeles.

Verified sample outputs: revenue USD 50.50 / COP 202,000; average ticket USD 25.25 /
COP 101,000; Medellin margin 61.08%; Miami margin 73.33%; top seller French Fries,
3 units. With the demo's added waste record and fixed reference date, the ranking
is Miami 27.63 followed by Medellin 13.51.

No automated test files were added. Temporary verification output was removed;
the normal ignored build directory can be regenerated with `npm run build`.
The existing public website was not changed.

## Glossary

- **Deterministic:** Identical inputs produce identical results.
- **Interface:** A TypeScript description of an object's required fields and types.
- **Literal union:** A type limited to specified values, such as `"USD" | "COP"`.
- **Map:** A collection that looks up values by a key, such as a menu item ID.
- **Margin:** Revenue remaining after ingredient costs, expressed as a percentage.
- **Mutation:** A change to an existing array or object.
- **Pure function:** A function that depends only on explicit inputs and does not
  modify them.
- **UTC:** A shared time reference used here to define consistent calendar days.
