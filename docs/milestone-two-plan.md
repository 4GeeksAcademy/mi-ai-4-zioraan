# Milestone 2 Plan: Brasaland Operations Utilities

Status: All six phases complete and verified.
Decisions approved: 2026-10-28.

## Goal and sources

Build reusable, explicitly typed TypeScript utilities for sales analytics, waste
reporting, and location performance.

- [Milestone requirements](https://github.com/4GeeksAcademy/ai-engineering-syllabus/blob/main/content/projects/ai-eng-milestone-coding-fundamentals/README.md)
- [Active Brasaland briefing](../memory-bank/active-contexts/milestone-two-CONTEXT.md)
- [Company context](../memory-bank/company-CONTEXT.md)
- [Previous milestone context](../memory-bank/historical-contexts/milestone-one-CONTEXT.md)

The active briefing defines the required entities, function names, signatures,
and business rules. The approved decisions below resolve ambiguities; intentional
clarifications and signature extensions are identified explicitly.

## Scope and placement

Create a dedicated `packages/brasaland-operations/` package with:

```text
packages/brasaland-operations/
  package.json
  tsconfig.json
  README.md
  src/
    index.ts
    types/
      models.ts
    utils/
      collections.ts
      guards.ts
      search.ts
      transformations.ts
      validations.ts
    demo.ts
```

- Keep the required types and utility modules independent of browser and Node
  runtime APIs so future consumers can reuse them.
- Include strict TypeScript configuration, a package-local type-check command,
  and an executable demonstration using synthetic sample data.
- Document public usage, commands, assumptions, and error behavior.
- Do not add a root workspace runner or change the public website's build.
- Leave existing shared type placeholders unchanged unless a consumer needs them.
- Preserve existing uncommitted changes and use the current
  `feature/milestone-2` branch.

Out of scope: APIs, persistence, authentication, dashboards, live exchange rates,
AI features, and changes to Brasa Points.

## Development phases

Implement one small, reviewable phase at a time.

### 1. Models and package setup

Completed: 2026-10-28. Package dependencies installed and `npm run typecheck`
passed with all required models defined.

- Define `Price`, `MenuItem`, `SaleTransaction`, `Location`, `WasteRecord`,
  `CountryMetrics`, and all required literal unions.
- Preserve the exact entity fields and types from the active briefing.
- Configure strict TypeScript and document a package-local validation command.

Completion: required models are present and the package type-checks.

### 2. Business validation

Completed: 2026-10-28. Type-check and executable validator examples passed,
covering valid entities, boundaries, non-finite numbers, accumulated violations,
null rejection, and unchanged inputs. No automated test files were added.

- Implement `validateMenuItem`, `validateSaleTransaction`, and `validateLocation`.
- Return `{ valid, errors }`, collecting all applicable business-rule violations.
- Enforce required names, positive prices and costs, preparation-time limits,
  country availability, opening-year bounds, seating capacity, and staffing.
- Reject non-finite numeric values such as `NaN` and `Infinity`.

Completion: valid samples pass and invalid examples report specific violations.

### 3. Collections and searching

Completed: 2026-10-28. Type-check and compiled JavaScript examples passed for all
nine operations, both currencies and sort orders, stable ties, inclusive instant
boundaries, missing and empty results, invalid arguments, and unchanged inputs.
Direct Node execution of TypeScript could not resolve NodeNext `.js` imports;
verification used temporary compiled output, which was removed afterward.

- Implement all six collection functions and all three search functions.
- Use inclusive date-range boundaries and case-insensitive menu-name search.
- Implement linear and binary search explicitly.
- Do not mutate input arrays when filtering or sorting.

Completion: filtering, ascending/descending sorting, searches, and missing-result
behavior match the briefing and approved decisions.

### 4. Financial calculations and reports

Completed: 2026-10-28. Compiled examples matched the sample revenue, ticket, and
margin targets in both currencies. Checks covered every report, UTC boundaries,
record-total versus per-unit costs, losses, empty inputs, rounding, explicit
relationship errors, and unchanged inputs. A misplaced helper brace was corrected
after the initial compile; the next compile and execution passed.

- Implement the four financial utilities and five aggregation/report functions.
- Select the requested currency, apply quantity-based ingredient costs, and
  round final calculated financial results to two decimal places.
- Produce payment counts, average tickets, top-selling items, waste groups,
  and country comparisons.
- Surface missing relationships instead of silently undercounting reports.

Completion: sample outputs match the verification targets below in both currencies.

### 5. Performance scoring

Completed: 2026-10-28. Compiled examples verified exact weighted scores,
component caps, zero revenue, losses, waste penalties, reference-day estimates,
transaction-count efficiency, location isolation, stable rankings, explicit
errors, unchanged inputs, and scores within 0-100.

- Implement location scoring and ranking with the specified 40/30/20/10 weights.
- Use only the relevant location's sales and waste.
- Apply the agreed reference-date, operating-day, zero-revenue, and loss rules.
- Return finite scores within 0-100, rounded to two decimal places, ranked highest
  first.

Completion: each component respects its bounds and ranking uses one reference
date for all locations.

### 6. Verification and handoff

Completed: 2026-10-28. The type checker, build, and persistent demonstration
passed. All 23 runtime exports were verified through the package entry point,
along with exact demonstration outputs and complete grouping/count shapes.
Running the demo under UTC and America/Los_Angeles produced identical results.
Null-array rejection, conversion contracts, empty rankings, and country reports
were checked. The public website has no changes. Temporary phase-check output
was removed; normal build output and dependencies are ignored by Git.

Usage and behavior are documented in the
[package README](../packages/brasaland-operations/README.md), with the completed
implementation explained in the
[milestone walkthrough](../memory-bank/walkthroughs/milestone-two-WALKTHROUGH.md).

- Run the package type checker and executable examples.
- Check the exact output shapes, numerical targets, and edge cases below.
- Do not introduce automated tests unless explicitly requested.
- Document usage and intentional departures from ambiguous briefing language.
- Confirm the public website implementation remains unchanged.
- At milestone completion, follow the repository's walkthrough rule; do not
  create a completion walkthrough during planning or partial implementation.

Completion: validation succeeds, documented commands work, and the agreed
behavior is demonstrated.

## Approved implementation decisions

### Dates and time zones

- Use UTC calendar days for daily revenue in this milestone.
- Match the supplied date's UTC year, month, and day.
- Use explicit offsets or `Z` in demonstration timestamps.
- Compare exact instants for date-range filtering, including both endpoints.
- Reject invalid dates and ranges whose start is after the end.
- Never depend on the developer machine's local time zone.

Limitation: UTC reporting days are not restaurant business days. The required
daily-revenue signature has no location or time-zone argument. Document this
limitation rather than imply location-aware reporting is implemented. A future
location-aware feature should use `America/Bogota` and `America/New_York`,
including Florida daylight-saving transitions.

### Scoring reference date and operating days

- Estimate a location's opening date as January 1 of `openingYear` in UTC.
- Calculate elapsed whole UTC days, with a minimum denominator of one day.
- Allow an optional final `referenceDate: Date` parameter on
  `scoreLocationPerformance` and `rankLocationsByPerformance`, defaulting to today.
- Pass one reference date from ranking to every location score.
- Supply a fixed reference date in demonstrations for reproducible results.

Approved tradeoff: this is a backward-compatible extension to the briefing's
signatures. The default-today entry point is not strictly pure; calculations with
an explicitly supplied date are deterministic. Document that distinction. If
assessment requires exact signatures and strict purity simultaneously, confirm
the contract with the mentor rather than conceal the clock dependency.

### Zero revenue, losses, and scoring bounds

- Empty sales produce zero revenue and zero average ticket.
- Return zero margin for zero revenue as an explicit reporting convention.
- Preserve actual negative margins when ingredient costs exceed revenue.
- Clamp performance components to their respective nonnegative point ranges;
  negative margins earn zero margin points.
- A location with neither sales nor waste has an overall score of zero.
- Waste with zero revenue earns zero waste-control points.
- Do not award waste-control points to an inactive, zero-revenue location.
- Avoid division by zero throughout.
- Use transaction count, not units sold, for seating efficiency.
- Use quantities sold for top-selling items.

Intentional clarification: the briefing describes margin as 0-100, but real
losses require negative percentages. Financial reports preserve those losses;
only performance points are bounded.

### Missing relationships

- When margin or top-seller calculations need a menu item that is missing, throw
  an explicit error identifying the transaction and item.
- When country comparison needs a location that is missing, throw an explicit
  error identifying the transaction and location.
- Do not skip unmatched records or assume zero ingredient cost.
- Validate relationships only where needed. Filtering sales by a location ID
  does not require a separate location catalogue.
- Business validators return validation results rather than throwing for ordinary
  business-rule violations.

### Empty inputs and invalid arguments

| Case | Behavior |
| --- | --- |
| Empty filters, sorts, rankings, or top-seller results | Return `[]`. |
| Linear search misses | Return `null`. |
| Binary search misses | Return `-1`. |
| Empty totals, averages, or margins | Return `0`. |
| Empty payment counts | Include every payment method with `0`. |
| Empty waste grouping | Include every waste reason with `[]`. |
| Country with no locations | Return zero metrics, including average revenue per location. |
| `topN === 0` | Return `[]`. |
| Negative, fractional, or non-finite `topN` | Throw `RangeError`. |
| `topN` exceeds available sold items | Return all sold items. |
| Invalid dates or reversed ranges | Throw an explicit error. |
| `null` where an array or entity is required | Reject explicitly; do not substitute empty data. |

Preserve the required non-nullable TypeScript signatures. Null handling does not
make null an accepted domain value.

### Money

- Treat sale `totalPrice` and waste `cost` as record totals; do not multiply them
  by quantity again.
- Treat menu `ingredientCost` as a per-unit cost and multiply by sale quantity.
- Sum the requested stored currency; do not convert already-denominated fields
  again.
- Use the required fixed exchange rate: 1 USD = 4000 COP.
- Round final calculated results, not each intermediate calculation.
- Same-currency conversion returns the original amount unchanged, as required.

### Ties and binary search

- Preserve input order for equal sorting and ranking values.
- Binary search may return any matching index when capacities are duplicated.
- Document the ascending-capacity precondition; do not sort inside binary search.

## Verification targets

Use the active briefing's sample menu items, locations, and sales.

| Result | Expected |
| --- | --- |
| Combined sales revenue | USD 50.50 / COP 202,000 |
| Average ticket | USD 25.25 / COP 101,000 |
| Medellin ingredient-based margin | 61.08% |
| Miami ingredient-based margin | 73.33% |
| Top-selling item | French Fries, 3 units |

Also exercise:

- Empty arrays and missing search results.
- Inclusive date boundaries and timestamps crossing UTC midnight.
- Invalid dates and reversed ranges.
- Unchanged input arrays after sorting.
- Both conversion directions and unchanged same-currency amounts.
- Quantity-based ingredient costs versus already-totaled sales and waste costs.
- Missing menu and location references.
- Complete payment-method and waste-reason output keys.
- Invalid and oversized `topN`.
- Zero revenue, negative margins, scoring bounds, and stable ties.
- Fixed-reference-date scoring and a shared reference date across rankings.

## Current next step

All planned phases are complete. Ready for user review; no commit, push, or
pull request has been created.
