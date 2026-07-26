/**
 * SINGLE SOURCE OF TRUTH for DOM selectors on quality-fashion.lovable.app.
 *
 * Three sections below, one per module, each split into CONFIRMED
 * (verified working - either from Priya's original loginRunner.js, or
 * from an actual Playwright Codegen session) vs NEEDS VERIFICATION
 * (best-guess or not-yet-confirmed - treat any FAIL coming from these
 * with suspicion, it might be a real bug or a wrong selector).
 *
 * To (re)verify anything below:
 *
 *     npx playwright codegen https://quality-fashion.lovable.app
 *
 * ...click through the real flow, and Codegen will print the exact
 * selector Playwright recorded. Paste it in below.
 */

// ============================================================
// LOGIN (Story ID: RTA-3)
// ============================================================

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
  usernameLengthErrorSelector: null as string | null,
};

// ============================================================
// REGISTRATION (Story ID: RTA-2)
// Confirmed via Priya's Playwright Codegen session on the live
// /register (Sign Up) flow, 2026-07-23.
// ============================================================

export const REGISTRATION_SELECTORS = {
  signUpLink: { role: "link", name: "Sign Up" } as const,
  firstNameField: { role: "textbox", name: "First Name" } as const,
  lastNameField: { role: "textbox", name: "Last Name" } as const,
  emailFieldLabel: "Email", // used with page.getByLabel(...)
  phoneField: { role: "textbox", name: "Phone" } as const,
  usernameField: { role: "textbox", name: "Username" } as const,
  // exact:true matters here - without it this also matches "Confirm Password".
  passwordField: { role: "textbox", name: "Password", exact: true } as const,
  confirmPasswordField: { role: "textbox", name: "Confirm Password" } as const,
  // FRAGILE: Codegen recorded these accessible names as the visible option
  // text concatenated onto the field, which suggests these <select>
  // elements don't have a clean name/aria-label of their own. Works as
  // recorded, but re-verify with Codegen if it ever stops matching -
  // a real `name`/`aria-label` attribute would be far more robust.
  genderSelectLabel: "GenderSelect...MaleFemaleOther",
  countrySelectLabel: "CountryIndiaUSAUKCanadaAustralia",
  termsCheckbox: { role: "checkbox", name: "I agree to the Terms &" } as const,
  createAccountButton: { role: "button", name: "Create Account" } as const,
};

export const REGISTRATION_NEEDS_VERIFICATION = {
  // Codegen's recorded flow moved straight from clicking "Create Account"
  // to browsing the site - no success toast/message was ever captured.
  // Runner falls back to a URL-change + no-validation-error heuristic.
  // If the real app shows an explicit success message, confirm its
  // selector here and switch the runner over to check for it directly.
  successIndicatorSelector: null as string | null,
  emailAlreadyRegisteredError: null as string | null,
  firstNameLengthError: null as string | null,
  passwordMismatchError: null as string | null,
  passwordLengthError: null as string | null,
  passwordPolicyError: null as string | null,
  phoneFormatError: null as string | null,
  mandatoryFieldIndicator: null as string | null, // e.g. a red "*" next to labels
};

// ============================================================
// CART (Story ID: RTA-30)
// Confirmed via Priya's Playwright Codegen session plus a direct
// screenshot of the live /cart page with 3 items, 2026-07-23.
// ============================================================

export const CART_SELECTORS = {
  cartHeaderLink: { role: "link", name: "Cart" } as const,
  // Per-product Add to Cart buttons use data-testid="add-to-cart-p{N}".
  // p1, p16, p19 are confirmed to exist via Codegen - treated as
  // known-good products rather than guessing arbitrary IDs.
  addToCartTestId: (productId: number) => `add-to-cart-p${productId}`,
  knownProductIds: [1, 16, 19] as const,
  // Confirmed directly from Codegen.
  checkoutButton: { role: "link", name: "Proceed to Checkout" } as const,
  // Confirmed from the live screenshot: heading reads "Shopping Cart (N)".
  cartHeadingPattern: /Shopping Cart \(\d+\)/,
  orderSummaryHeading: "Order Summary",
};

export const CART_NEEDS_VERIFICATION = {
  emptyCartMessage: null as string | null, // expect something like "Your cart is empty" - confirm exact text via Codegen
  removeItemButton: null as string | null, // visible in the screenshot as a "Remove" link per row - confirm real selector
  quantityIncrementButton: null as string | null, // "+" stepper seen in screenshot
  quantityDecrementButton: null as string | null, // "-" stepper seen in screenshot
  quantityInput: null as string | null,
  deactivatedProductAlert: null as string | null, // no admin/mock seam exists yet - see cartRunner.ts TC011 (BLOCKED)
};

// ============================================================
// SHARED TEST FIXTURES
// ============================================================

export const TEST_ACCOUNT = {
  // Registered live via Codegen during Registration testing (2026-07-23) -
  // reused as a stable, already-existing logged-in account for Cart
  // tests, which all assume a logged-in user with cart access.
  // If this account ever gets deleted/reset, re-register it once via
  // Codegen and update here.
  username: "johndoe123",
  password: "Password123!",
};

export const APP_CONFIG = {
  baseUrl: "https://quality-fashion.lovable.app",
  dashboardUrlFragment: "/dashboard",
  dashboardTitleFragment: "My Account",
  registerUrlFragment: "/register",
  cartUrlFragment: "/cart",
};
