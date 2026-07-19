import type { ModuleRunner } from "../types";

/**
 * Registration module runner - SCAFFOLD ONLY.
 *
 * I have not implemented real logic here, on purpose: I have no visibility
 * into the actual Registration form's selectors, and guessing them would
 * be fabricating code that looks confident but likely isn't correct -
 * exactly the failure mode you asked me to avoid.
 *
 * Returns BLOCKED with an empty actualResult, which correctly routes
 * through v4.0B's existing "Has Actual Result?" check into the Blocked
 * path - it will NOT be sent to the LLM for judgment, and will NOT
 * silently show up as a false Pass or Fail.
 *
 * TO IMPLEMENT: follow the exact same pattern as loginRunner.ts -
 * 1. Run `npx playwright codegen https://quality-fashion.lovable.app`
 * 2. Walk through registration manually, copy the real selectors it records
 * 3. Add them to config/selectors.ts under a new REGISTRATION_SELECTORS export
 * 4. Write the dispatch switch here, same shape as runLoginTest
 */
export const runRegistrationTest: ModuleRunner = async (_page, request) => {
  return {
    status: "BLOCKED",
    actualResult: "",
  };
};
