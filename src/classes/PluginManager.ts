import fs from "node:fs";
import fsx from "fs-extra";
import path from "node:path";
import { AoiClient } from "./AoiClient";
import { AoijsError } from "./AoiError";
import { DataFunction } from "./AoiTyping";
import { version } from "../../package.json";
/**
 * Class representing a plugin manager for loading and managing plugins in a Node.js application.
 */
class PluginManager {
  #aoitelegram?: AoiClient;
  /**
   * Create an instance of the PluginManager.
   * @param {boolean} [searchingForPlugins=true] - Specify whether to search for plugins during initialization.
   * @param {AoiClient} [aoitelegram] - The AoiClient instance to load commands into.
   */
  constructor(searchingForPlugins?: boolean, aoitelegram?: AoiClient) {
    if (searchingForPlugins === true) {
      const pathAoiPlugins = path.join(
        process.cwd(),
        "node_modules",
        ".aoiplugins",
      );
      const existsAoiPlugins = fs.existsSync(pathAoiPlugins);
      if (!existsAoiPlugins) {
        fs.mkdirSync(pathAoiPlugins);
      }
      this.#searchingForPlugins();
    }
    this.#aoitelegram = aoitelegram;
  }

  /**
   * Load plugins from a directory.
   * @param plugins - The path to the directory containing plugins.
   * @returns An array of plugin functions.
   */
  loadDirPlugins(plugins: string) {
    let collectionFunction: DataFunction[] = [];
    return readFunctionsInDirectory(
      path.join(process.cwd(), plugins),
      collectionFunction,
      this.#aoitelegram,
    );
  }

  /**
   * Load plugins from the specified list.
   * @param plugins - List of plugin names to load.
   * @returns An array of plugin functions.
   */
  loadPlugins(...plugins: string[]) {
    let collectionFunction: DataFunction[] = [];
    for (const dirFunc of plugins) {
      const pathPlugin = path.join(
        process.cwd(),
        "node_modules",
        ".aoiplugins",
        dirFunc,
      );
      if (!fs.existsSync(pathPlugin)) {
        throw new AoijsError(
          "aoiplugins",
          `path to the specified plugin does not exist "${pathPlugin}"`,
        );
      }
      const packageJSON = require(
        path.join(pathPlugin, ".aoiplugin.json"),
      ).main;

      if (!packageJSON) {
        throw new AoijsError(
          "aoiplugins",
          `incorrect path to the specified main file in the plugin does not exist "${path.join(
            pathPlugin,
            ".aoiplugin.json",
          )}"`,
        );
      }

      collectionFunction.push(
        ...(readFunctionsInDirectory(
          path.join(pathPlugin, packageJSON),
          collectionFunction,
          this.#aoitelegram,
        ) ?? []),
      );
    }
    return collectionFunction;
  }

  /**
   * Search for plugins in the 'node_modules' directory and copy them to the '.aoiplugins' directory.
   * @private
   */
  #searchingForPlugins() {
    const nodeModulesPath = path.join(process.cwd(), "node_modules");
    const aoiPluginsPath = path.join(nodeModulesPath, ".aoiplugins");

    if (!fs.existsSync(aoiPluginsPath)) {
      fs.mkdirSync(aoiPluginsPath);
    }

    const items = fs.readdirSync(nodeModulesPath);

    for (const folder of items) {
      const folderPath = path.join(nodeModulesPath, folder);

      if (fs.lstatSync(folderPath).isDirectory()) {
        const aoiPluginJsonPath = path.join(folderPath, ".aoiplugin.json");

        if (fs.existsSync(aoiPluginJsonPath)) {
          const pluginInfo = require(aoiPluginJsonPath);
          if (pluginInfo.main) {
            if (pluginInfo.version > version) {
              throw new AoijsError(
                "aoiplugins",
                `to download the library "${folder}", the library version "aoitelegram" should be equal to or higher than ${pluginInfo.version}`,
              );
            }
            const mainFilePath = path.join(folderPath, pluginInfo.main);
            const destPath = path.join(aoiPluginsPath, folder);
            if (!fs.existsSync(destPath)) {
              fs.mkdirSync(destPath);
            }
            fsx.copySync(folderPath, destPath);
          }
        }
      }
    }
  }
}

/**
 * Recursively reads and collects custom functions from a directory, and optionally registers them with an AoiClient.
 * @param dirPath - The directory path to search for custom functions.
 * @param collectionFunctions - An array to collect the custom functions.
 * @param aoitelegram - (Optional) An AoiClient to register custom functions.
 * @returns An array of collected custom functions or registers them with the AoiClient if provided.
 */
function readFunctionsInDirectory(
  dirPath: string,
  collectionFunctions: DataFunction[],
  aoitelegram?: AoiClient,
) {
  let collectionFunction: DataFunction[] = [...collectionFunctions];
  let items: string[] = [];

  try {
    items = fs.readdirSync(dirPath);
  } catch (err) {
    const messageError = err as { code: string };
    if (messageError.code === "ENOTDIR") {
      delete require.cache[dirPath];
      const dataFunc = require(dirPath).default ?? require(dirPath) ?? {};
      if (dataFunc.callback && (dataFunc.type === "js" || !dataFunc.type)) {
        collectionFunction.push({
          name: dataFunc.name,
          type: "js",
          version: dataFunc.version,
          callback: dataFunc.callback,
        });
      } else if (dataFunc.code && dataFunc.type === "aoitelegram") {
        collectionFunction.push({
          name: dataFunc.name,
          type: "aoitelegram",
          version: dataFunc.version,
          code: dataFunc.code,
        });
      } else
        throw new AoijsError(
          "plugins",
          "the specified parameters for creating a custom function do not match the requirements",
          undefined,
          dataFunc.name,
        );
    }
    if (aoitelegram) {
      aoitelegram.addFunction(collectionFunction);
      return collectionFunction;
    }
    return collectionFunction;
  }

  for (const item of items) {
    const itemPath = path.join(dirPath, item);
    const stats = fs.statSync(itemPath);

    if (stats.isDirectory()) {
      readFunctionsInDirectory(itemPath, collectionFunction, aoitelegram);
    } else if (itemPath.endsWith(".js")) {
      delete require.cache[itemPath];
      const dataFunc = require(itemPath).default ?? require(itemPath) ?? {};
      if (dataFunc.callback && (dataFunc.type === "js" || !dataFunc.type)) {
        collectionFunction.push({
          name: dataFunc.name,
          type: "js",
          version: dataFunc.version,
          callback: dataFunc.callback,
        });
      } else if (dataFunc.code && dataFunc.type === "aoitelegram") {
        collectionFunction.push({
          name: dataFunc.name,
          type: "aoitelegram",
          version: dataFunc.version,
          code: dataFunc.code,
        });
      } else
        throw new AoijsError(
          "plugins",
          "the specified parameters for creating a custom function do not match the requirements",
          undefined,
          dataFunc.name,
        );
      if (aoitelegram) {
        aoitelegram.addFunction(collectionFunction);
        return collectionFunction;
      }
    }
  }

  return collectionFunction;
}

export { PluginManager };
