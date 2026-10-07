export function greet(name) {
  if (typeof name !== "string" || name.trim() === "") throw new TypeError("name is required");
  return `Hello, ${name.trim()}!`;
}

// greet() trims whitespace and rejects empty names.
