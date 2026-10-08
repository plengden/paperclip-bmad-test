// Returns value limited to the inclusive range [min, max].
// Throws TypeError if any argument is not a number (NaN included); throws RangeError if min > max.
// Infinite bounds are allowed.
export function clamp(value, min, max) {
  for (const n of [value, min, max]) {
    if (typeof n !== "number" || Number.isNaN(n)) throw new TypeError("arguments must be numbers");
  }
  if (min > max) throw new RangeError("min must not be greater than max");
  return Math.min(Math.max(value, min), max);
}
