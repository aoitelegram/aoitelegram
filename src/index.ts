import importSync from "import-sync";
import { AoiBase } from "./classes/AoiBase";
import { AoiClient } from "./classes/AoiClient";
import { AoijsError } from "./classes/AoiError";
import { AoiWarning } from "./classes/AoiWarning";
import { AoiManager } from "./classes/AoiManager";
import { DataFunction } from "./classes/AoiTyping";
import { CustomEvent } from "./classes/CustomEvent";
import { LoadCommands } from "./classes/LoadCommands";
import { AoiExtension } from "./classes/AoiExtension";
import { PluginManager } from "./classes/PluginManager";
const { version } = importSync("../package.json");

export {
  AoiClient,
  AoiBase,
  AoiWarning,
  AoiManager,
  AoijsError,
  AoiExtension,
  PluginManager,
  CustomEvent,
  LoadCommands,
  DataFunction,
  version,
};
export default {
  AoiClient,
  AoiBase,
  AoiWarning,
  AoiManager,
  AoijsError,
  AoiExtension,
  PluginManager,
  CustomEvent,
  LoadCommands,
  version,
};
