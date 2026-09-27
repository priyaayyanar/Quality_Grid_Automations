# QualityGrid Playwright TS Service

A small Express + Playwright service that executes automated UI test cases against [quality-fashion.lovable.app](https://quality-fashion.lovable.app), one test case at a time, on behalf of the QualityGrid n8n automation workflow.

## How it fits together

n8n (workflow `v4.0A_Start_Run`) loops over generated test cases and calls this service once per row, synchronously, then forwards the result on to `v4.0B_Receive_Results`. This service intentionally has no batching or callback logic — one request in, one result out.

```
n8n (v4.0A) --POST /execute-test--> this service --Playwright--> quality-fashion.lovable.app
                                          |
                                          v
                                   TestExecutionResult --> n8n (v4.0B)
```

## Demo

A full end-to-end walkthrough — the n8n workflow looping over generated test cases while this service drives Playwright against the live quality-fashion site — is recorded here:

- **[QualityGrid_Full_Demo_With_Website.mp4](QualityGrid_Full_Demo_With_Website.mp4)** — full demo, including the website under test
- **[PresentationDayPic.jpeg](PresentationDayPic.jpeg)** — presentation day photo

## Requirements

- Node.js 18+
- npm

## Setup

```bash
npm install
npx playwright install chromium
```

## Running

```bash
npm run dev     # runs src/server.ts directly via ts-node
```

```bash
npm run build    # compiles TypeScript to dist/
npm start         # runs the compiled server from dist/server.js
```

The server listens on `http://localhost:3000`.

## API

### `GET /`

Health check. Returns a plain-text confirmation that the service is running.

### `POST /execute-test`

Executes a single test case and returns its result.

**Request body** (`TestExecutionRequest`):

```json
{
  "testCaseId": "TC016",
  "storyId": "RTA-3",
  "testData": { "Username": "validuser", "Password": "ValidPassword123!" },
  "expectedResult": "User is logged in successfully"
}
```

**Response body** (`TestExecutionResult`):

```json
{
  "testCaseId": "TC016",
  "status": "PASS",
  "actualResult": "...",
  "screenshotPath": "screenshots/TC016_PASS.png",
  "executionTime": "2026-07-26T12:34:56.789Z"
}
```

`status` is one of `PASS`, `FAIL`, or `BLOCKED`. A screenshot is captured for every run and saved under `screenshots/`.

## Project structure

```
src/
  server.ts               Express app and the /execute-test endpoint
  dispatcher.ts            Routes a request's storyId to the right module runner
  types.ts                 Shared request/result/runner types
  config/selectors.ts      Single source of truth for DOM selectors
  runners/
    loginRunner.ts         RTA-3  - User Login
    registrationRunner.ts  RTA-2  - User Registration
    cartRunner.ts          RTA-30 - View Cart
```

### Adding a new module

1. Add its DOM selectors to `src/config/selectors.ts`.
2. Create a new runner in `src/runners/` that implements the `ModuleRunner` type from `src/types.ts`.
3. Register it in `MODULE_RUNNERS` in `src/dispatcher.ts` under its Jira Story ID.

If a `storyId` has no registered runner, the endpoint responds with a `BLOCKED` result instead of erroring.

## Notes

- `HEADLESS` in `src/server.ts` is `true` by default; set it to `false` locally while debugging a specific test case so you can watch the browser.
- Screenshots and build output are git-ignored (see `.gitignore`).
