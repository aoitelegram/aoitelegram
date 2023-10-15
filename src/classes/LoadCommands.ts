import fs from "fs";
import path from "path";
import figlet from "figlet";
import { AoiClient } from "./AoiClient";

/**
 * Class to load and process commands for AoiTelegram.
 */
class LoadCommands {
  #aoitelegram: AoiClient;
  #count: number = 1;
  /**
   * Constructor for LoadCommands.
   * @param {AoiClient} aoitelegram - The AoiClient instance to load commands into.
   */
  constructor(aoitelegram: AoiClient) {
    this.#aoitelegram = aoitelegram;
  }

  /**
   * Asynchronously loads commands from the specified directory path.
   * @param {string} dirPath - The directory path from which to load commands.
   */
  async loadCommands(dirPath: string) {
    if (this.#count === 1) {
      dirPath = path.join(process.cwd(), dirPath);
      const bigText = figlet.textSync("AoiTelegram");
      console.log(bigText);
      this.#count = 0;
    }

    const items = await fs.readdirSync(dirPath);
    for await (const item of items) {
      const itemPath = path.join(dirPath, item);
      const stats = fs.statSync(itemPath);

      if (stats.isDirectory()) {
        this.loadCommands(itemPath);
      } else if (itemPath.endsWith(".js")) {
        const requireFun = require(itemPath);
        const dataFunc = requireFun.data ? requireFun.data : requireFun;
        if (dataFunc.type === "command") {
          this.#aoitelegram.command({
            name: dataFunc.name,
            code: dataFunc.code,
          });
          console.log(
            `| Loading in ${itemPath} | Loaded '${dataFunc.name}' | ${dataFunc.type} |`,
          );
        }
      }
    }
  }
}

export { LoadCommands };
