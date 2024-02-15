import { promises as fs } from "node:fs";
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

      fs.access(pathAoiPlugins)
        .catch(() => fs.mkdir(pathAoiPlugins))
        .then(() => this.searchingForPlugins());
    }
  }

  /**
   * Load plugins from a directory.
   * @param plugins - The path to the directory containing plugins.
   * @returns An array of plugin functions.
   */
  async loadDirPlugins(plugins: string) {
    await loadPluginsFunction(
      path.join(process.cwd(), plugins),
      this.aoitelegram,
    );
  }

  /**
   * Load plugins from the specified list.
   * @param plugins - List of plugin names to load.
   * @returns An array of plugin functions.
   */
  async loadPlugins(...plugins: string[]) {
    for (const dirFunc of plugins) {
      const pathPlugin = path.join(
        process.cwd(),
        "node_modules",
        ".aoiplugins",
        dirFunc,
      );
      try {
        await fs.access(pathPlugin);
      } catch (error) {
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
          `incorrect path to the specified main file in the plugin does not exist "${path.join(pathPlugin, ".aoiplugin.json")}"`,
        );
      }
      await loadPluginsFunction(
        path.join(pathPlugin, packageJSON),
        this.aoitelegram,
      );
    }
  }

  /**
   * Search for plugins in the 'node_modules' directory and copy them to the '.aoiplugins' directory.
   */
  async searchingForPlugins() {
    const nodeModulesPath = path.join(process.cwd(), "node_modules");
    const aoiPluginsPath = path.join(nodeModulesPath, ".aoiplugins");

    await fs.access(aoiPluginsPath).catch(() => fs.mkdir(aoiPluginsPath));

    const items = await fs.readdir(nodeModulesPath);

    for (const folder of items) {
      const folderPath = path.join(nodeModulesPath, folder);

      if (!(await fs.lstat(folderPath)).isDirectory()) continue;
      const aoiPluginJsonPath = path.join(folderPath, ".aoiplugin.json");

      if (!(await fs.access(aoiPluginJsonPath).catch(() => false))) continue;
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

      await fs.access(destPath).catch(() => fs.mkdir(destPath));
      await fsx.copy(folderPath, destPath);
    }
  }
}

/**
 * Recursively reads and collects custom functions from a directory, and optionally registers them with an AoiClient.
 * @param dirPath - The directory path to search for custom functions.
 **/
async function loadPluginsFunction(dirPath: string, aoitelegram: AoiClient) {
  const processFile = async (itemPath: string) => {
    try {
      const dataRequire = await import(itemPath);
      const dataFunction = dataRequire.default || dataRequire;
      aoitelegram.ensureFunction(dataFunction);
    } catch (error) {
      console.error(error);
    }
  };

  const processItem = async (item: string) => {
    const itemPath = path.join(dirPath, item);
    try {
      const stats = await fs.stat(itemPath);
      if (stats.isDirectory()) {
        await loadPluginsFunction(itemPath, aoitelegram);
      } else if (itemPath.endsWith(".js")) {
        await processFile(itemPath);
      }
    } catch (error) {
      console.error(error);
    }
  };

  try {
    const items = await fs.readdir(dirPath);
    await Promise.all(items.map(processItem));
  } catch (error) {
    console.error(error);
  }
}

export { PluginManager };
