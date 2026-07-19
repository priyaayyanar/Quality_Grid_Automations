import type { Page } from "playwright";

/**
 * What n8n sends per test case.
 *
 * IMPORTANT DESIGN DECISION: testData arrives already parsed as a
 * Record<string,string> - NOT as the raw comma-separated string from the
 * "Test Data" column. Parsing "Username: x, Password: y" into structured
 * fields is a data-transform job, better done in n8n (a Code node) than
 * inside the Playwright server. This keeps this server focused on one
 * job only: drive a browser and report what happened.
 */
export interface TestExecutionRequest {
  testCaseId: string;      // e.g. "TC016"
  storyId: string;         // e.g. "RTA-3" - used to route to the right module runner
  testData: Record<string, string>;  // e.g. { Username: "validuser", Password: "ValidPassword123!" }
  expectedResult: string;  // carried through for logging/debugging only, not used for pass/fail logic here
}

export type ExecutionStatus = "PASS" | "FAIL" | "BLOCKED";

export interface TestExecutionResult {
  testCaseId: string;
  status: ExecutionStatus;
  actualResult: string;
  screenshotPath: string;
  executionTime: string;
}

/**
 * A module runner (login, registration, cart, ...) implements this.
 * It receives a live Playwright Page already on the site, plus the
 * request, and returns a status + human-readable actual result.
 * It does NOT handle browser launch/close or screenshots - the server
 * does that once, generically, around whichever runner gets called.
 */
export type ModuleRunner = (
  page: Page,
  request: TestExecutionRequest
) => Promise<{ status: ExecutionStatus; actualResult: string }>;
