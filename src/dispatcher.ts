import type { ModuleRunner } from "./types";
import { runLoginTest } from "./runners/loginRunner";
import { runRegistrationTest } from "./runners/registrationRunner";
import { runCartTest } from "./runners/cartRunner";

/**
 * Routes by Story ID (already present on every row of 02_Generated_Test_Cases,
 * no extra field needed from n8n) to the module that knows how to run it.
 *
 * RTA-3  = User Login        (from 00_Project_Info / your Jira RTA board)
 * RTA-2  = User Registration
 * RTA-30 = View Cart
 *
 * If your team's Story IDs ever change, update this map - it's the only
 * place that needs to know about them.
 */
export const MODULE_RUNNERS: Record<string, ModuleRunner> = {
  "RTA-3": runLoginTest,
  "RTA-2": runRegistrationTest,
  "RTA-30": runCartTest,
};
