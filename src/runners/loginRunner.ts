import type { Page } from "playwright";
import type { ModuleRunner, TestExecutionRequest, ExecutionStatus } from "../types";
import { CONFIRMED_SELECTORS, NEEDS_VERIFICATION_SELECTORS, APP_CONFIG } from "../config/selectors";

/**
 * Login module runner. Dispatches by testCaseId to a specific check where
 * one exists; otherwise falls through to the generic login-attempt flow.
 *
 * NOTE ON TEST CASE IDs: this dispatches on the CURRENT live sheet's IDs
 * (TC001, TC009, TC016). If the sheet ever gets regenerated/renumbered
 * again, these case labels need to move with it - check
 * 02_Generated_Test_Cases for whichever row matches the Test Scenario
 * text in the comments below, don't assume the ID stays put.
 */
export const runLoginTest: ModuleRunner = async (page, request) => {
  await openLoginPage(page);

  switch (request.testCaseId) {
    case "TC001": // Test Scenario: "Verify Login Page UI Elements"
      return verifyLoginPageElements(page);

    case "TC016": // Test Scenario: "Forgot Password Link Redirection"
      return verifyForgotPasswordRedirect(page);

    case "TC009": // Test Scenario: "Username Field Maximum Character Limit"
      return verifyUsernameBoundary(page, request);

    default:
      return runGenericLoginAttempt(page, request);
  }
};

async function openLoginPage(page: Page): Promise<void> {
  await page.goto(APP_CONFIG.baseUrl);
  await page.waitForLoadState("networkidle");
  await page.getByRole(
    CONFIRMED_SELECTORS.loginNavLink.role,
    { name: CONFIRMED_SELECTORS.loginNavLink.name }
  ).click();
  await page.waitForURL("**/login");
  // IMPORTANT: waitForURL only confirms the URL changed, not that a
  // client-side-rendered page has actually finished painting its DOM.
  // Without this, isVisible() checks immediately after navigation can
  // race against React/the app's render cycle and report "not visible"
  // for elements that appear a moment later.
  await page.waitForLoadState("networkidle");
}

async function runGenericLoginAttempt(
  page: Page,
  request: TestExecutionRequest
): Promise<{ status: ExecutionStatus; actualResult: string }> {
  const username = request.testData["Username"];
  const password = request.testData["Password"];

  if (!username || !password) {
    return {
      status: "BLOCKED",
      actualResult: `No Username/Password in testData for ${request.testCaseId} - this scenario likely needs a dedicated case in loginRunner.ts rather than the generic login path.`,
    };
  }

  await page.locator(CONFIRMED_SELECTORS.usernameField).fill(username);
  await page.locator(CONFIRMED_SELECTORS.passwordField).fill(password);
  await page.locator(CONFIRMED_SELECTORS.loginButton).click();
  await page.waitForTimeout(3000);

  const currentUrl = page.url();
  const pageTitle = await page.title();

  const reachedDashboard =
    currentUrl.includes(APP_CONFIG.dashboardUrlFragment) &&
    pageTitle.includes(APP_CONFIG.dashboardTitleFragment);

  if (reachedDashboard) {
    return {
      status: "PASS",
      actualResult: `Login succeeded. Redirected to ${currentUrl}, page title "${pageTitle}".`,
    };
  }

  return {
    status: "FAIL",
    actualResult: `Login did not reach the dashboard. Ended on ${currentUrl}, page title "${pageTitle}".`,
  };
}

async function verifyLoginPageElements(
  page: Page
): Promise<{ status: ExecutionStatus; actualResult: string }> {

  // waitFor({state:"visible"}) actively waits up to the timeout for the
  // element to appear, unlike isVisible() which checks instantly and was
  // the root cause of this check failing on a still-rendering page.
  const isVisibleWithWait = async (locator: ReturnType<Page["locator"]>) =>
    locator.waitFor({ state: "visible", timeout: 5000 }).then(() => true).catch(() => false);

  const checks = {
    usernameField: await isVisibleWithWait(page.locator(CONFIRMED_SELECTORS.usernameField)),
    passwordField: await isVisibleWithWait(page.locator(CONFIRMED_SELECTORS.passwordField)),
    loginButton: await isVisibleWithWait(page.locator(CONFIRMED_SELECTORS.loginButton)),
    forgotPasswordLink: await isVisibleWithWait(
      page.getByRole(NEEDS_VERIFICATION_SELECTORS.forgotPasswordLink.role, {
        name: NEEDS_VERIFICATION_SELECTORS.forgotPasswordLink.name,
      })
    ),
  };

  const missing = Object.entries(checks)
    .filter(([, visible]) => !visible)
    .map(([name]) => name);

  if (missing.length === 0) {
    return {
      status: "PASS",
      actualResult: "All required login page elements are visible (username field, password field, login button, forgot password link).",
    };
  }

  return {
    status: "FAIL",
    actualResult: `Missing or not visible: ${missing.join(", ")}. Note: forgotPasswordLink uses an unverified selector guess - check config/selectors.ts if this is the only one failing.`,
  };
}

async function verifyForgotPasswordRedirect(
  page: Page
): Promise<{ status: ExecutionStatus; actualResult: string }> {
  const urlBefore = page.url();

  await page
    .getByRole(NEEDS_VERIFICATION_SELECTORS.forgotPasswordLink.role, {
      name: NEEDS_VERIFICATION_SELECTORS.forgotPasswordLink.name,
    })
    .click();

  await page.waitForTimeout(2000);
  const urlAfter = page.url();

  const didRedirect = urlAfter !== urlBefore && !urlAfter.endsWith("/login");

  if (didRedirect) {
    return {
      status: "PASS",
      actualResult: `Forgot Password link redirected to ${urlAfter}.`,
    };
  }

  return {
    status: "FAIL",
    actualResult: `Forgot Password link did not redirect to a recovery page. URL remained ${urlAfter} (started at ${urlBefore}).`,
  };
}

async function verifyUsernameBoundary(
  page: Page,
  request: TestExecutionRequest
): Promise<{ status: ExecutionStatus; actualResult: string }> {
  const username = request.testData["Username"];
  const password = request.testData["Password"];

  if (!username || !password) {
    return {
      status: "BLOCKED",
      actualResult: "No Username/Password in testData for the boundary check.",
    };
  }

  await page.locator(CONFIRMED_SELECTORS.usernameField).fill(username);
  await page.locator(CONFIRMED_SELECTORS.passwordField).fill(password);
  await page.locator(CONFIRMED_SELECTORS.loginButton).click();
  await page.waitForTimeout(2000);

  const currentUrl = page.url();
  const stillOnLoginPage = currentUrl.includes("/login");

  // No confirmed selector for the actual error message exists yet - see
  // config/selectors.ts. Falling back to a loose body-text scan, which
  // is a real limitation, not a confirmed check.
  const bodyText = await page.locator("body").innerText().catch(() => "");
  const mentionsLength = /exceed|character|length|too long/i.test(bodyText);

  if (stillOnLoginPage && mentionsLength) {
    return {
      status: "PASS",
      actualResult: "Over-length username was rejected with a length-related message on the page.",
    };
  }

  if (stillOnLoginPage) {
    return {
      status: "FAIL",
      actualResult: "Login was blocked, but no length-related message was found via the (unverified) body-text scan - confirm the real selector in config/selectors.ts.",
    };
  }

  return {
    status: "FAIL",
    actualResult: `Login was NOT blocked - over-length username was accepted, page navigated to ${currentUrl}.`,
  };
}