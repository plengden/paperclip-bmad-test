// Returns the sum of an array of finite numbers; 0 for an empty array.
// Throws TypeError if the input is not an array or any element is not a finite number.
export function sum(numbers) {
  if (!Array.isArray(numbers)) throw new TypeError("numbers must be an array");
  let total = 0;
  for (const n of numbers) {
    if (typeof n !== "number" || !Number.isFinite(n)) throw new TypeError("elements must be finite numbers");
    total += n;
  }
  return total;
}
