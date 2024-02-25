const version = "1.0.0";
import { Context } from "./Context";
import { AoiBase } from "./classes/AoiBase";
import { AoiClient } from "./classes/AoiClient";
import { AoiLogger } from "./classes/AoiLogger";
import { AoijsError } from "./classes/AoiError";
import { AoiWarning } from "./classes/AoiWarning";
import { AoiManager } from "./classes/AoiManager";
import { DataFunction } from "./classes/AoiTyping";
import { CustomEvent } from "./classes/CustomEvent";
import { LoadCommands } from "./classes/LoadCommands";
import { AoiExtension } from "./classes/AoiExtension";
// import { PluginManager } from "@aoitelegram/plugin";

export {
  AoiBase,
  AoiClient,
  AoiLogger,
  AoiWarning,
  AoiManager,
  AoijsError,
  AoiExtension,
  //  PluginManager,
  CustomEvent,
  LoadCommands,
  DataFunction,
  Context,
  version,
};
export default {
  AoiBase,
  AoiClient,
  AoiLogger,
  AoiWarning,
  AoiManager,
  AoijsError,
  AoiExtension,
  //  PluginManager,
  CustomEvent,
  LoadCommands,
  Context,
  version,
};
