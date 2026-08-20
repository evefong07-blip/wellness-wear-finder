import test from "node:test";
import assert from "node:assert/strict";
import { combinePreferredDateTime, isValidSingaporeMobile, singaporeDateValue, singaporeMobileDigits } from "../lib/logic/form.ts";

test("normalizes and validates Singapore mobile numbers", () => {
  assert.equal(singaporeMobileDigits("+65 8123 4567"), "81234567");
  assert.equal(isValidSingaporeMobile("8123 4567"), true);
  assert.equal(isValidSingaporeMobile("+65 9234 5678"), true);
  assert.equal(isValidSingaporeMobile("7123 4567"), false);
  assert.equal(isValidSingaporeMobile("8123"), false);
});

test("keeps fitting date and time separate until both are chosen", () => {
  assert.equal(combinePreferredDateTime("2026-08-21", ""), "");
  assert.equal(combinePreferredDateTime("", "14:00"), "");
  assert.equal(combinePreferredDateTime("2026-08-21", "14:00"), "2026-08-21T14:00");
});

test("formats the minimum fitting date in Singapore time", () => {
  assert.equal(singaporeDateValue(new Date("2026-08-20T16:30:00Z")), "2026-08-21");
});
