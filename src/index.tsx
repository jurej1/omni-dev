import { logger } from "./logger";
import { render } from "@opentui/solid";
import { App } from "./app";

logger.log("=== session start ===");

render(App);
