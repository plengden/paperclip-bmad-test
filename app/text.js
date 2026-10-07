// Capitalises the first letter of each whitespace-separated word and lower-cases the rest.
// Throws TypeError for non-string input; returns "" for an empty or whitespace-only string.
export function titleCase(input) {
  if (typeof input !== "string") throw new TypeError("input must be a string");
  return input
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0)
    .map((word) => word[0].toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}
