import test from "node:test";
import assert from "node:assert/strict";
import { classify } from "./classify.mjs";

const f = (path, added = 1, deleted = 0) => ({ path, added, deleted });
const cls = (files, floor) => classify(files, floor).class;

test("docs only", () => assert.equal(cls([f("README.md"), f("docs/guide.txt")]), "docs"));
test("empty diff is docs", () => assert.equal(cls([]), "docs"));
test("application code is standard", () => assert.equal(cls([f("app/text.js"), f("app/text.test.js")]), "standard"));
test("code plus docs is standard", () => assert.equal(cls([f("README.md"), f("app/a.js")]), "standard"));
test("workflow change is high", () => assert.equal(cls([f(".github/workflows/ci.yml")]), "high"));
test("auth path is high", () => assert.equal(cls([f("app/auth/login.js")]), "high"));
test("migrations, terraform, Dockerfile, env are high", () => {
  for (const p of ["db/migrations/001.sql", "infra/main.tf", "modules/x.tf", "Dockerfile", "app/Dockerfile.prod", ".env.production"]) assert.equal(cls([f(p)]), "high", p);
});
test("dependency manifests and lockfiles are high", () => {
  for (const p of ["app/package.json", "package-lock.json", "requirements.txt", "go.sum", "Cargo.lock"]) assert.equal(cls([f(p)]), "high", p);
});
test("diff over 400 lines is high, exactly 400 is not", () => {
  assert.equal(cls([f("app/a.js", 400)]), "standard");
  assert.equal(cls([f("app/a.js", 300, 101)]), "high");
});
test("a high file among low ones wins", () => assert.equal(cls([f("README.md"), f("app/a.js"), f("infra/x.js")]), "high"));
test("auth-like names that are not directories stay standard", () => assert.equal(cls([f("app/author.js"), f("app/authority.js")]), "standard"));
test("floor can raise but never lower", () => {
  assert.equal(cls([f("README.md")], "standard"), "standard");
  assert.equal(cls([f("app/a.js")], "high"), "high");
  assert.equal(cls([f(".github/workflows/ci.yml")], "docs"), "high");
  assert.equal(cls([f(".github/workflows/ci.yml")], "standard"), "high");
});
test("reasons explain the class", () => {
  const r = classify([f("infra/main.tf")]);
  assert.match(r.reasons.join(" "), /high-risk path: infra\/main\.tf/);
});
