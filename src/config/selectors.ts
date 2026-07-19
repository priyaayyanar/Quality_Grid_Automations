/**
 * SINGLE SOURCE OF TRUTH for DOM selectors on quality-fashion.lovable.app.
 *
 * Two categories below, clearly separated:
 *
 * 1. CONFIRMED - taken directly from Priya's original loginRunner.js,
 *    which already had working, presumably-tested login logic (not a
 *    stub). These are trusted as-is.
 *
 * 2. NEEDS VERIFICATION - anything I could not see myself, since I have
 *    no browser access to the live site. Run:
 *
 *        npx playwright codegen https://quality-fashion.lovable.app
 *
 *    ...click through the real flow, and Codegen will print the exact
 *    selector Playwright recorded. Paste it in below. Until verified,
 *    treat any FAIL result coming from these selectors with suspicion -
 *    it might be a real bug, or it might be a wrong selector.
 */

export const CONFIRMED_SELECTORS = {
  usernameField: "#username",
  passwordField: "#password",
  loginButton: "#loginButton",
  loginNavLink: { role: "link", name: "Login" } as const,
};

export const NEEDS_VERIFICATION_SELECTORS = {
  // Guessed as a case-insensitive text match on a link. Verify via Codegen.
  forgotPasswordLink: { role: "link", name: /forgot password/i } as const,

  // No real selector guess made here at all - this depends entirely on
  // whatever markup the app actually uses for its validation error text.
  // Fill in with a real selector once you've triggered the error and
  // inspected it (right-click -> Inspect in the browser, or Codegen).
  usernameLengthErrorSelector: null as string | null,
};

export const APP_CONFIG = {
  baseUrl: "https://quality-fashion.lovable.app",
  dashboardUrlFragment: "/dashboard",
  dashboardTitleFragment: "My Account",
};
