import express, { type Request, type Response } from "express";
import { chromium } from "playwright";
import { MODULE_RUNNERS } from "./dispatcher";
import type { TestExecutionRequest, TestExecutionResult } from "./types";

const app = express();
app.use(express.json());

const PORT = 3000;

// Set to true once you're running full batches - false is useful while
// you're actively watching/debugging individual test cases.
const HEADLESS = true;

app.get("/", (_req: Request, res: Response) => {
  res.send("QualityGrid Playwright Service is running.");
});

/**
 * SINGLE endpoint, called ONCE PER TEST CASE, synchronously.
 *
 * This intentionally does NOT accept a batch or a callbackUrl - the
 * earlier server.js design assumed the server would batch-process and
 * call back later, but that added real complexity for no benefit here.
 * Instead: n8n's v4.0A loops over test cases and calls this endpoint
 * once per row, waiting for each direct response, then forwards that
 * single result on to v4.0B's webhook itself. This server stays simple:
 * one request in, one result out.
 *
 * Expects a TestExecutionRequest JSON body (see src/types.ts).
 */
app.post("/execute-test", async (req: Request, res: Response) => {
  const request = req.body as TestExecutionRequest;

  console.log(`\n=== Executing ${request.testCaseId} (Story ${request.storyId}) ===`);
  console.log("testData:", request.testData);

  const runner = MODULE_RUNNERS[request.storyId];

  if (!runner) {
    const result: TestExecutionResult = {
      testCaseId: request.testCaseId,
      status: "BLOCKED",
      actualResult: `No module runner registered for Story ID "${request.storyId}" - check dispatcher.ts.`,
      screenshotPath: "",
      executionTime: new Date().toISOString(),
    };
    console.log("No runner found:", result);
    res.json(result);
    return;
  }

  const browser = await chromium.launch({ headless: HEADLESS });
  const page = await browser.newPage();

  try {
    const { status, actualResult } = await runner(page, request);

    let screenshotPath = "";
    try {
      screenshotPath = `screenshots/${request.testCaseId}_${status}.png`;
      await page.screenshot({ path: screenshotPath, fullPage: true });
    } catch (screenshotError) {
      console.error("Screenshot capture failed (non-fatal):", screenshotError);
      screenshotPath = "";
    }

    const result: TestExecutionResult = {
      testCaseId: request.testCaseId,
      status,
      actualResult,
      screenshotPath,
      executionTime: new Date().toISOString(),
    };

    console.log("Result:", result);
    res.json(result);

  } catch (error) {
    console.error(`ERROR executing ${request.testCaseId}:`, error);

    const result: TestExecutionResult = {
      testCaseId: request.testCaseId,
      status: "BLOCKED",
      actualResult: `Script error during execution: ${error instanceof Error ? error.message : String(error)}`,
      screenshotPath: "",
      executionTime: new Date().toISOString(),
    };

    res.status(200).json(result);

  } finally {
    await browser.close();
  }
});

app.listen(PORT, () => {
  console.log(`QualityGrid Playwright Service running on http://localhost:${PORT}`);
});
