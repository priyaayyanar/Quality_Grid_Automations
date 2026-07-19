import type { ModuleRunner } from "../types";

/**
 * View Cart module runner - SCAFFOLD ONLY. See registrationRunner.ts for
 * the full explanation - same reasoning applies here.
 */
export const runCartTest: ModuleRunner = async (_page, request) => {
  return {
    status: "BLOCKED",
    actualResult: "",
  };
};
