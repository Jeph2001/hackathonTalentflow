#!/usr/bin/env node

/**
 * Test Runner Script
 * Runs all test suites and generates a comprehensive report
 */

import { execSync } from "child_process";
import fs from "fs";
import path from "path";

interface TestResult {
  suite: string;
  passed: number;
  failed: number;
  duration: number;
  errors: string[];
}

class TestRunner {
  private results: TestResult[] = [];
  private startTime: number = Date.now();

  async runAllTests() {
    console.log("🚀 Starting Productivity API Test Suite");
    console.log("=".repeat(50));

    const testSuites = [
      { name: "Setup", path: "tests/setup/test-setup.ts" },
      { name: "Todo API", path: "tests/unit/todo-api.test.ts" },
      { name: "Note API", path: "tests/unit/note-api.test.ts" },
      { name: "Event API", path: "tests/unit/event-api.test.ts" },
      { name: "Category API", path: "tests/unit/category-api.test.ts" },
      {
        name: "Dashboard Integration",
        path: "tests/integration/dashboard-api.test.ts",
      },
      {
        name: "Cache Performance",
        path: "tests/performance/cache-performance.test.ts",
      },
      { name: "Authentication", path: "tests/security/authentication.test.ts" },
      { name: "Load Testing", path: "tests/stress/load-testing.test.ts" },
    ];

    for (const suite of testSuites) {
      await this.runTestSuite(suite.name, suite.path);
    }

    this.generateReport();
  }

  private async runTestSuite(suiteName: string, testPath: string) {
    console.log(`\n📋 Running ${suiteName} tests...`);

    const suiteStartTime = Date.now();
    let passed = 0;
    let failed = 0;
    const errors: string[] = [];

    try {
      // Run Jest for the specific test file
      const command = `npx jest ${testPath} --verbose --no-cache`;
      const output = execSync(command, {
        encoding: "utf8",
        stdio: "pipe",
      });

      // Parse Jest output (simplified parsing)
      const lines = output.split("\n");
      for (const line of lines) {
        if (line.includes("✓") || line.includes("PASS")) {
          passed++;
        } else if (line.includes("✗") || line.includes("FAIL")) {
          failed++;
          errors.push(line.trim());
        }
      }

      console.log(`✅ ${suiteName}: ${passed} passed, ${failed} failed`);
    } catch (error: any) {
      failed++;
      errors.push(error.message);
      console.log(`❌ ${suiteName}: Test suite failed`);
      console.error(error.message);
    }

    const duration = Date.now() - suiteStartTime;

    this.results.push({
      suite: suiteName,
      passed,
      failed,
      duration,
      errors,
    });
  }

  private generateReport() {
    const totalDuration = Date.now() - this.startTime;
    const totalPassed = this.results.reduce(
      (sum, result) => sum + result.passed,
      0
    );
    const totalFailed = this.results.reduce(
      (sum, result) => sum + result.failed,
      0
    );
    const totalTests = totalPassed + totalFailed;

    console.log("\n" + "=".repeat(50));
    console.log("📊 TEST RESULTS SUMMARY");
    console.log("=".repeat(50));

    // Overall statistics
    console.log(`\n🎯 Overall Results:`);
    console.log(`   Total Tests: ${totalTests}`);
    console.log(
      `   Passed: ${totalPassed} (${((totalPassed / totalTests) * 100).toFixed(
        1
      )}%)`
    );
    console.log(
      `   Failed: ${totalFailed} (${((totalFailed / totalTests) * 100).toFixed(
        1
      )}%)`
    );
    console.log(`   Duration: ${(totalDuration / 1000).toFixed(2)}s`);

    // Suite breakdown
    console.log(`\n📋 Suite Breakdown:`);
    this.results.forEach((result) => {
      const status = result.failed === 0 ? "✅" : "❌";
      const successRate =
        result.passed + result.failed > 0
          ? ((result.passed / (result.passed + result.failed)) * 100).toFixed(1)
          : "0.0";

      console.log(
        `   ${status} ${result.suite}: ${result.passed}/${
          result.passed + result.failed
        } (${successRate}%) - ${(result.duration / 1000).toFixed(2)}s`
      );
    });

    // Error details
    const failedSuites = this.results.filter((result) => result.failed > 0);
    if (failedSuites.length > 0) {
      console.log(`\n❌ Failed Tests Details:`);
      failedSuites.forEach((result) => {
        console.log(`\n   ${result.suite}:`);
        result.errors.forEach((error) => {
          console.log(`     - ${error}`);
        });
      });
    }

    // Performance insights
    console.log(`\n⚡ Performance Insights:`);
    const slowestSuite = this.results.reduce((prev, current) =>
      prev.duration > current.duration ? prev : current
    );
    const fastestSuite = this.results.reduce((prev, current) =>
      prev.duration < current.duration ? prev : current
    );

    console.log(
      `   Slowest Suite: ${slowestSuite.suite} (${(
        slowestSuite.duration / 1000
      ).toFixed(2)}s)`
    );
    console.log(
      `   Fastest Suite: ${fastestSuite.suite} (${(
        fastestSuite.duration / 1000
      ).toFixed(2)}s)`
    );

    // Generate JSON report
    this.generateJSONReport();

    // Final status
    console.log("\n" + "=".repeat(50));
    if (totalFailed === 0) {
      console.log("🎉 ALL TESTS PASSED! 🎉");
    } else {
      console.log(`⚠️  ${totalFailed} TEST(S) FAILED`);
    }
    console.log("=".repeat(50));
  }

  private generateJSONReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalTests: this.results.reduce(
          (sum, r) => sum + r.passed + r.failed,
          0
        ),
        totalPassed: this.results.reduce((sum, r) => sum + r.passed, 0),
        totalFailed: this.results.reduce((sum, r) => sum + r.failed, 0),
        totalDuration: Date.now() - this.startTime,
        successRate: 0,
      },
      suites: this.results,
    };

    report.summary.successRate =
      report.summary.totalTests > 0
        ? (report.summary.totalPassed / report.summary.totalTests) * 100
        : 0;

    const reportPath = path.join(process.cwd(), "test-results.json");
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    console.log(`\n📄 Detailed report saved to: ${reportPath}`);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const runner = new TestRunner();
  runner.runAllTests().catch((error) => {
    console.error("Test runner failed:", error);
    process.exit(1);
  });
}

export { TestRunner };
