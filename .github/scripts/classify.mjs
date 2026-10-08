// Deterministic risk classifier. Input: changed files with line counts. Output: { class, reasons }.
// Rules (highest match wins): high > standard > docs. See Target-Design.md decision 1.
// Usage: node classify.mjs <base-sha> <head-sha> [--floor docs|standard|high]
//   --floor can only RAISE the class (agents and humans may raise; lowering is a recorded human override elsewhere).
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";

export const ORDER = ["docs", "standard", "high"];
export const DIFF_LINE_LIMIT = 400;

const HIGH_PATH = [
  /(^|\/)auth(entication|orization)?\//i,
  /(^|\/)security\//i,
  /(^|\/)secrets?\//i,
  /(^|\/)infra(structure)?\//i,
  /(^|\/)migrations?\//i,
  /^\.github\/workflows\//,
  /\.tf$/,
  /(^|\/)Dockerfile[^/]*$/,
  /(^|\/)\.env[^/]*$/,
];
const MANIFEST = /(^|\/)(package(-lock)?\.json|yarn\.lock|pnpm-lock\.yaml|requirements[^/]*\.txt|pyproject\.toml|poetry\.lock|Pipfile(\.lock)?|go\.(mod|sum)|Cargo\.(toml|lock)|pom\.xml|build\.gradle(\.kts)?|Gemfile(\.lock)?|composer\.(json|lock))$/;
const DOC = /(\.(md|mdx|rst|txt|adoc)$)|(^|\/)docs?\//i;

export function classify(files, floor = "docs") {
  const reasons = [];
  const lines = files.reduce((n, f) => n + (f.added || 0) + (f.deleted || 0), 0);
  let cls = "docs";
  if (files.length === 0) reasons.push("no changed files");
  for (const f of files) {
    if (HIGH_PATH.some((r) => r.test(f.path))) { cls = "high"; reasons.push(`high-risk path: ${f.path}`); }
    else if (MANIFEST.test(f.path)) { cls = "high"; reasons.push(`dependency manifest or lockfile: ${f.path}`); }
    else if (!DOC.test(f.path) && cls !== "high") { cls = "standard"; }
  }
  if (lines > DIFF_LINE_LIMIT) { cls = "high"; reasons.push(`diff of ${lines} lines exceeds ${DIFF_LINE_LIMIT}`); }
  if (cls === "standard") reasons.push("application code or tests changed, no high-risk rule hit");
  if (cls === "docs" && files.length) reasons.push("only documentation files changed");
  if (ORDER.indexOf(floor) > ORDER.indexOf(cls)) { reasons.push(`raised from ${cls} to ${floor} by floor`); cls = floor; }
  return { class: cls, reasons, changedFiles: files.length, changedLines: lines };
}

export function changedFiles(base, head) {
  const out = execFileSync("git", ["diff", "--numstat", "-z", `${base}...${head}`], { encoding: "utf8" });
  const files = [];
  const parts = out.split("\0");
  for (let i = 0; i < parts.length; i++) {
    const m = /^(\d+|-)\t(\d+|-)\t(.*)$/.exec(parts[i]);
    if (!m) continue;
    let path = m[3];
    if (path === "") { path = parts[i + 2]; i += 2; } // rename: old and new path follow
    files.push({ path, added: m[1] === "-" ? 0 : +m[1], deleted: m[2] === "-" ? 0 : +m[2] });
  }
  return files;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [base, head, flag, floor] = process.argv.slice(2);
  if (!base || !head) { console.error("usage: classify.mjs <base> <head> [--floor class]"); process.exit(2); }
  if (flag === "--floor" && !ORDER.includes(floor)) { console.error("floor must be docs, standard or high"); process.exit(2); }
  console.log(JSON.stringify(classify(changedFiles(base, head), flag === "--floor" ? floor : "docs")));
}
