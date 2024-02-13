import fs from "node:fs";
import { AoiBase } from "./classes/AoiBase.js";
import { AoiClient } from "./classes/AoiClient.js";
import { AoijsError } from "./classes/AoiError.js";
import { AoiWarning } from "./classes/AoiWarning.js";
import { AoiManager } from "./classes/AoiManager.js";
import { DataFunction } from "./classes/AoiTyping.js";
import { CustomEvent } from "./classes/CustomEvent.js";
import { LoadCommands } from "./classes/LoadCommands.js";
import { PluginManager } from "./classes/PluginManager.js";
const packageJSON = JSON.parse(fs.readFileSync("./package.json").toString());
const { version } = packageJSON;

export {
  AoiClient,
  AoiBase,
  AoiWarning,
  AoiManager,
  AoijsError,
  PluginManager,
  CustomEvent,
  LoadCommands,
  DataFunction,
  packageJSON,
  version,
};
export default {
  AoiClient,
  AoiBase,
  AoiWarning,
  AoiManager,
  AoijsError,
  PluginManager,
  CustomEvent,
  LoadCommands,
  version,
};
