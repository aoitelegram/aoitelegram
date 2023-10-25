import fs from "node:fs";
import path from "node:path";
import fsx from "fs-extra";
import { AoiClient } from "./AoiClient";
import { AoijsError } from "./AoiError";
import { DataFunction } from "context";
import { version } from "../../package.json";
/**
 * Class representing a plugin manager for loading and managing plugins in a Node.js application.
 */
class PluginManager {
  #aoitelegram?: AoiClient;
  /**
   * Create an instance of the PluginManager.
   * @param {boolean} [searchingForPlugins] - Specify whether to search for plugins during initialization.
   * @param {AoiClient} [aoitelegram] - The AoiClient instance to load commands into.
   */
  constructor(searchingForPlugins?: boolean, aoitelegram?: AoiClient) {
    if (searchingForPlugins) {
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
   * @param {string} plugins - The path to the directory containing plugins.
   * @param {"dir" | "node_modules"} [type="node_modules"] - The type of directory containing plugins.
   * @returns {DataFunction[]} An array of plugin functions.
   * @throws {AoijsError} Throws an error if the 'type' parameter is not specified.
   */
  loadDirPlugins(
    plugins: string,
    type: "dir" | "node_modules" = "node_modules",
  ) {
    if (type !== "dir" && type !== "node_modules") {
      throw new AoijsError(
        "parameter",
        "You did not specify the 'type' parameter.",
      );
    }
    let collectionFunction: DataFunction[] = [];
    return readFunctionsInDirectory(
      path.join(process.cwd(), plugins),
      collectionFunction,
      this.#aoitelegram,
    );
  }

  /**
   * Load plugins from the specified list.
   * @param {...string} plugins - List of plugin names to load.
   * @returns {DataFunction[]} An array of plugin functions.
   * @throws {AoijsError} Throws an error if the specified plugin or its main file is not found.
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
          "path to the specified plugin does not exist.",
        );
      }
      const packageJSON = require(
        path.join(pathPlugin, ".aoiplugin.json"),
      ).main;

      if (!packageJSON) {
        throw new AoijsError(
          "aoiplugins",
          "incorrect path to the specified main file in the plugin does not exist.",
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
  async #searchingForPlugins() {
    const nodeModulesPath = path.join(process.cwd(), "node_modules");
    const aoiPluginsPath = path.join(nodeModulesPath, ".aoiplugins");

    if (!fs.existsSync(aoiPluginsPath)) {
      fs.mkdirSync(aoiPluginsPath);
    }

    const items = await fs.readdirSync(nodeModulesPath);

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
                `To download the library "${folder}", the library version "aoitelegram" should be equal to or higher than ${pluginInfo.version}.`,
              );
            }
            const mainFilePath = path.join(folderPath, pluginInfo.main);
            const destPath = path.join(aoiPluginsPath, folder);

            if (!fs.existsSync(destPath)) {
              fs.mkdirSync(destPath);
            }

            await fsx.copySync(folderPath, destPath);
          }
        }
      }
    }
  }
}

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
      const dataFunc = require(dirPath).data;
      if (dataFunc) {
        collectionFunction.push({
          name: dataFunc.name,
          version: dataFunc.version,
          callback: dataFunc.callback,
        });
      }
    }
    if (aoitelegram) {
      aoitelegram.addFunction(collectionFunction);
      return;
    }
    return collectionFunction;
  }

  for (const item of items) {
    const itemPath = path.join(dirPath, item);
    const stats = fs.statSync(itemPath);

    if (stats.isDirectory()) {
      readFunctionsInDirectory(itemPath, collectionFunction, aoitelegram);
    } else if (itemPath.endsWith(".js")) {
      const dataFunc = require(itemPath).data;
      if (dataFunc) {
        collectionFunction.push({
          name: dataFunc.name,
          version: dataFunc.version,
          callback: dataFunc.callback,
        });
      }
      if (aoitelegram) {
        aoitelegram.addFunction(collectionFunction);
      }
    }
  }

  return collectionFunction;
}

export { PluginManager };
