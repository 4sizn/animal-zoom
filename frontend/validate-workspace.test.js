#!/usr/bin/env node

/**
 * Workspace Configuration Validation Tests
 * RED Phase: These tests will initially fail until workspace is properly configured
 */

const { existsSync, readFileSync } = require("fs");
const { join } = require("path");

const WORKSPACE_ROOT = __dirname;

let failedTests = 0;
let passedTests = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`✅ PASS: ${name}`);
    passedTests++;
  } catch (error) {
    console.error(`❌ FAIL: ${name}`);
    console.error(`   ${error.message}`);
    failedTests++;
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function assertFileExists(filePath, message) {
  assert(existsSync(filePath), message || `File does not exist: ${filePath}`);
}

// Test Suite
console.log("🧪 Running Workspace Configuration Tests\n");

test("pnpm-workspace.yaml exists", () => {
  assertFileExists(
    join(WORKSPACE_ROOT, "pnpm-workspace.yaml"),
    "pnpm-workspace.yaml must exist in workspace root",
  );
});

test("pnpm-workspace.yaml contains packages config", () => {
  const yamlPath = join(WORKSPACE_ROOT, "pnpm-workspace.yaml");
  assertFileExists(yamlPath);
  const content = readFileSync(yamlPath, "utf-8");
  assert(
    content.includes("packages:"),
    "pnpm-workspace.yaml must contain packages configuration",
  );
  assert(
    content.includes("'packages/*'") || content.includes('"packages/*"'),
    "pnpm-workspace.yaml must include packages/* pattern",
  );
});

test("root package.json exists", () => {
  assertFileExists(
    join(WORKSPACE_ROOT, "package.json"),
    "package.json must exist in workspace root",
  );
});

test("root package.json is valid and has workspaces scripts", () => {
  const packagePath = join(WORKSPACE_ROOT, "package.json");
  assertFileExists(packagePath);
  const pkg = JSON.parse(readFileSync(packagePath, "utf-8"));
  assert(pkg.name, "package.json must have a name");
  assert(pkg.private === true, "Root package.json must be private");
  assert(pkg.scripts, "package.json must have scripts");
  assert(pkg.scripts.dev, "package.json must have dev script");
  assert(pkg.scripts.build, "package.json must have build script");
  assert(pkg.scripts.test, "package.json must have test script");
});

test("turbo.json exists", () => {
  assertFileExists(
    join(WORKSPACE_ROOT, "turbo.json"),
    "turbo.json must exist in workspace root",
  );
});

test("turbo.json has valid pipeline configuration", () => {
  const turboPath = join(WORKSPACE_ROOT, "turbo.json");
  assertFileExists(turboPath);
  const turboConfig = JSON.parse(readFileSync(turboPath, "utf-8"));
  assert(turboConfig.pipeline, "turbo.json must have pipeline configuration");
  assert(turboConfig.pipeline.build, "turbo.json must have build task");
  assert(turboConfig.pipeline.dev, "turbo.json must have dev task");
  assert(turboConfig.pipeline.test, "turbo.json must have test task");
});

test("tsconfig.base.json exists", () => {
  assertFileExists(
    join(WORKSPACE_ROOT, "tsconfig.base.json"),
    "tsconfig.base.json must exist in workspace root",
  );
});

test("tsconfig.base.json has valid configuration", () => {
  const tsconfigPath = join(WORKSPACE_ROOT, "tsconfig.base.json");
  assertFileExists(tsconfigPath);
  const tsconfig = JSON.parse(readFileSync(tsconfigPath, "utf-8"));
  assert(
    tsconfig.compilerOptions,
    "tsconfig.base.json must have compilerOptions",
  );
  assert(
    tsconfig.compilerOptions.strict,
    "TypeScript strict mode must be enabled",
  );
  assert(
    tsconfig.compilerOptions.moduleResolution,
    "moduleResolution must be specified",
  );
});

test("packages directory exists", () => {
  assertFileExists(
    join(WORKSPACE_ROOT, "packages"),
    "packages directory must exist",
  );
});

test("shared package exists", () => {
  assertFileExists(
    join(WORKSPACE_ROOT, "packages/shared"),
    "packages/shared directory must exist",
  );
  assertFileExists(
    join(WORKSPACE_ROOT, "packages/shared/package.json"),
    "packages/shared/package.json must exist",
  );
});

test("3d-viewer package exists", () => {
  assertFileExists(
    join(WORKSPACE_ROOT, "packages/3d-viewer"),
    "packages/3d-viewer directory must exist",
  );
  assertFileExists(
    join(WORKSPACE_ROOT, "packages/3d-viewer/package.json"),
    "packages/3d-viewer/package.json must exist",
  );
});

test("chat-ui package exists", () => {
  assertFileExists(
    join(WORKSPACE_ROOT, "packages/chat-ui"),
    "packages/chat-ui directory must exist",
  );
  assertFileExists(
    join(WORKSPACE_ROOT, "packages/chat-ui/package.json"),
    "packages/chat-ui/package.json must exist",
  );
});

test("main-app package exists", () => {
  assertFileExists(
    join(WORKSPACE_ROOT, "packages/main-app"),
    "packages/main-app directory must exist",
  );
  assertFileExists(
    join(WORKSPACE_ROOT, "packages/main-app/package.json"),
    "packages/main-app/package.json must exist",
  );
});

test("each package has required scripts", () => {
  const packages = ["shared", "3d-viewer", "chat-ui", "main-app"];
  packages.forEach((pkg) => {
    const packagePath = join(WORKSPACE_ROOT, "packages", pkg, "package.json");
    assertFileExists(packagePath, `${pkg}/package.json must exist`);
    const packageJson = JSON.parse(readFileSync(packagePath, "utf-8"));
    assert(packageJson.scripts, `${pkg} must have scripts`);
    assert(packageJson.scripts.build, `${pkg} must have build script`);
    assert(packageJson.scripts.test, `${pkg} must have test script`);

    // UI packages need dev and dev:standalone
    if (pkg !== "shared") {
      assert(packageJson.scripts.dev, `${pkg} must have dev script`);
      assert(
        packageJson.scripts["dev:standalone"],
        `${pkg} must have dev:standalone script`,
      );
    }
  });
});

// Print Summary
console.log("\n" + "=".repeat(50));
console.log(`Tests: ${passedTests} passed, ${failedTests} failed`);
console.log("=".repeat(50));

process.exit(failedTests > 0 ? 1 : 0);
