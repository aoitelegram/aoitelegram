import fs from "node:fs";
import fsx from "fs-extra";
import path from "node:path";
import importSync from "import-sync";
import { AoiClient } from "./AoiClient";
import { AoijsError } from "./AoiError";
import { version } from "../index";

/**
 * Class representing a plugin manager for loading and managing plugins in a Node.js application.
 */
class PluginManager {
  aoitelegram: AoiClient;

  /**
   * Create an instance of the PluginManager.
   * @param options.searchingForPlugins - Specify whether to search for plugins during initialization.
   * @param options.aoitelegram - The AoiClient instance to load commands into.
   */
  constructor(options: {
    aoitelegram: AoiClient;
    searchingForPlugins?: boolean;
  }) {
    this.aoitelegram = options.aoitelegram;
    if (options.searchingForPlugins === true) {
      const pathAoiPlugins = path.join(
        process.cwd(),
        "node_modules",
        ".aoiplugins",
      );

      const existsAoiPlugins = fs.existsSync(pathAoiPlugins);
      if (!existsAoiPlugins) {
        fs.mkdirSync(pathAoiPlugins);
      }

      this.searchingForPlugins();
    }
  }

  /**
   * Load plugins from a directory.
   * @param plugins - The path to the directory containing plugins.
   * @returns An array of plugin functions.
   */
  loadDirPlugins(plugins: string) {
    loadPluginsFunction(path.join(process.cwd(), plugins), this.aoitelegram);
  }

  /**
   * Load plugins from the specified list.
   * @param plugins - List of plugin names to load.
   * @returns An array of plugin functions.
   */
  loadPlugins(...plugins: string[]) {
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
      const packageJSON = importSync(
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

      loadPluginsFunction(path.join(pathPlugin, packageJSON), this.aoitelegram);
    }
  }

  /**
   * Search for plugins in the 'node_modules' directory and copy them to the '.aoiplugins' directory.
   */
  searchingForPlugins() {
    const nodeModulesPath = path.join(process.cwd(), "node_modules");
    const aoiPluginsPath = path.join(nodeModulesPath, ".aoiplugins");

    if (!fs.existsSync(aoiPluginsPath)) {
      fs.mkdirSync(aoiPluginsPath);
    }

    const items = fs.readdirSync(nodeModulesPath);

    for (const folder of items) {
      const folderPath = path.join(nodeModulesPath, folder);

      if (!fs.lstatSync(folderPath).isDirectory()) continue;
      const aoiPluginJsonPath = path.join(folderPath, ".aoiplugin.json");

      if (!fs.existsSync(aoiPluginJsonPath)) continue;
      const pluginInfo = importSync(aoiPluginJsonPath);
      if (!pluginInfo.main) continue;

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

/**
 * Recursively reads and collects custom functions from a directory, and optionally registers them with an AoiClient.
 * @param dirPath - The directory path to search for custom functions.
 **/
function loadPluginsFunction(dirPath: string, aoitelegram: AoiClient) {
  const processFile = (itemPath: string) => {
    const dataRequire = importSync(itemPath);
    const dataFunction = dataRequire.default || dataRequire;
    aoitelegram.ensureFunction(dataFunction);
  };

  const processItem = (item: string) => {
    const itemPath = path.join(dirPath, item);
    const stats = fs.statSync(itemPath);

    if (stats.isDirectory()) {
      loadPluginsFunction(itemPath, aoitelegram);
    } else if (itemPath.endsWith(".js")) {
      processFile(itemPath);
    }
  };

  const items = fs.readdirSync(dirPath);
  for (const file of items) {
    try {
      processItem(file);
    } catch (err) {
      console.log(err);
    }
  }
}

export { PluginManager };
