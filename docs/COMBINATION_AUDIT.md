# Catalogue and Budget Combination Audit

Audit date: 20 August 2026

## Active catalogue

| Category | Actual catalogue price |
|---|---:|
| Knee Supporter | S$165 |
| Wellness Socks | S$70–S$115 |
| Wellness Eye Mask | S$65–S$70 |

There is no fourth active category. **Everyday warmth and comfort** was removed from Q1 and does not map to a catalogue product.

## Q4 budget bands

1. S$65–S$70
2. S$70–S$115
3. About S$165
4. I’m flexible / not sure

`Correct` means the complete catalogue price or range sits inside the selected budget. `Mismatch — explained` means the catalogue price is wholly or partly outside the selected budget and both the teaser and final result explicitly display a **Budget mismatch** explanation. A boundary-only overlap is treated as a mismatch, not as a complete fit.

## Direct category selection matrix

| Q3 category | Q4 budget | Price shown | Result |
|---|---|---|---|
| Knee Supporter | S$65–S$70 | Typical catalogue price: S$165 | Mismatch — explained |
| Knee Supporter | S$70–S$115 | Typical catalogue price: S$165 | Mismatch — explained |
| Knee Supporter | About S$165 | Typical catalogue price: S$165 | Correct |
| Knee Supporter | Flexible / not sure | Typical catalogue price: S$165 | Correct — flexible budget explained |
| Wellness Socks | S$65–S$70 | Typical catalogue range: S$70–S$115 | Mismatch — explained |
| Wellness Socks | S$70–S$115 | Typical catalogue range: S$70–S$115 | Correct |
| Wellness Socks | About S$165 | Typical catalogue range: S$70–S$115 | Mismatch — explained |
| Wellness Socks | Flexible / not sure | Typical catalogue range: S$70–S$115 | Correct — flexible budget explained |
| Wellness Eye Mask | S$65–S$70 | Typical catalogue range: S$65–S$70 | Correct |
| Wellness Eye Mask | S$70–S$115 | Typical catalogue range: S$65–S$70 | Mismatch — explained |
| Wellness Eye Mask | About S$165 | Typical catalogue range: S$65–S$70 | Mismatch — explained |
| Wellness Eye Mask | Flexible / not sure | Typical catalogue range: S$65–S$70 | Correct — flexible budget explained |

## “Help me choose” matrix

These cases omit the Q3 category preference and use the category-specific Q1 and Q2 answers. The price and mismatch result remains internally consistent for every budget.

| Q1/Q2 need | Q4 budget | Match | Price shown | Result |
|---|---|---|---|---|
| Knee / walking or stairs | S$65–S$70 | Knee Supporter | S$165 | Mismatch — explained |
| Knee / walking or stairs | S$70–S$115 | Wellness Socks | S$70–S$115 | Correct |
| Knee / walking or stairs | About S$165 | Knee Supporter | S$165 | Correct |
| Knee / walking or stairs | Flexible / not sure | Knee Supporter | S$165 | Correct — flexible |
| Feet / long hours standing | S$65–S$70 | Wellness Socks | S$70–S$115 | Mismatch — explained |
| Feet / long hours standing | S$70–S$115 | Wellness Socks | S$70–S$115 | Correct |
| Feet / long hours standing | About S$165 | Wellness Socks | S$70–S$115 | Mismatch — explained |
| Feet / long hours standing | Flexible / not sure | Wellness Socks | S$70–S$115 | Correct — flexible |
| Eye rest / bedtime | S$65–S$70 | Wellness Eye Mask | S$65–S$70 | Correct |
| Eye rest / bedtime | S$70–S$115 | Wellness Eye Mask | S$65–S$70 | Mismatch — explained |
| Eye rest / bedtime | About S$165 | Wellness Eye Mask | S$65–S$70 | Mismatch — explained |
| Eye rest / bedtime | Flexible / not sure | Wellness Eye Mask | S$65–S$70 | Correct — flexible |

## “Not sure yet” + “Help me choose” fallback matrix

These cases use `Not sure yet` at Q1, `It varies` at Q2 and `Help me choose` at Q3. Concrete budgets now select the category whose complete catalogue range fits that budget. This specifically verifies the fallback path that previously treated a one-dollar boundary overlap as a full match.

| Q4 budget | Fallback match | Price shown | Result |
|---|---|---|---|
| S$65–S$70 | Wellness Eye Mask | S$65–S$70 | Correct |
| S$70–S$115 | Wellness Socks | S$70–S$115 | Correct |
| About S$165 | Knee Supporter | S$165 | Correct |
| Flexible / not sure | Knee Supporter | S$165 | Correct — deterministic flexible fallback |

## Automated evidence

The regression suite in `tests/pricingMatrix.test.ts` executes all 12 direct category/budget combinations, all 12 category-specific `Help me choose` combinations, all four `Not sure yet` fallbacks, and exact price-copy assertions. The complete project test run passes 16 test cases with no failures; the matrix tests contain 28 combination assertions in addition to the existing assessment, WhatsApp, form and dashboard tests.

After deployment, all 28 combinations above were repeated through the live Chrome UI up to the non-submitting Q5 teaser. The visible category, catalogue price and budget explanation matched this table in every cell. No customer details were entered, no assessment rows were created, and the browser console reported no warnings or errors.
