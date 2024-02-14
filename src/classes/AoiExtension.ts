import { version } from "../index.js";
import { AoiClient } from "./AoiClient";
import { AoijsError } from "./AoiError";

/**
 * Abstract class representing an Aoi extension.
 */
abstract class AoiExtension {
  /** The name of the extension. */
  abstract name: string;
  /** The description of the extension. */
  abstract description: string;
  /** The version of the extension. */
  abstract version: string;
  /** The target version(s) of the Aoi library this extension supports. */
  abstract targetVersion?: string | string[];
  /** The required extensions for this extension to function properly. */
  abstract requireExtension?: string[];

  /**
   * Initializes the extension.
   * @param aoitelegram - The AoiClient instance.
   */
  abstract init(aoitelegram: AoiClient): void;

  /**
   * Initializes plugins and performs version and dependency checks.
   * @param aoitelegram - The AoiClient instance.
   */
  initPlugins(aoitelegram: AoiClient) {
    if (typeof this?.targetVersion === "string") {
      if (this.targetVersion > version) {
        throw new AoijsError(
          this.name,
          `the extension supports only "${this.targetVersion}" and above`,
        );
      }
    }

    if (Array.isArray(this?.targetVersion)) {
      const requireVersion = this.targetVersion.some((v) => v === version);
      if (!requireVersion) {
        throw new AoijsError(
          this.name,
          `this extension does not support version "${version}" of the library. To ensure everything works correctly, use ${this.targetVersion.slice(0, 10).join(", ")} and others`,
        );
      }
    }

    if (this?.requireExtension?.length) {
      const currentExtensions = aoitelegram.extensions || [];
      for (const extension of this.requireExtension) {
        const hasExtensions = currentExtensions.findIndex(
          ({ name }) => name === extension,
        );
        if (hasExtensions === -1) {
          throw new AoijsError(
            this.name,
            `the extension requires the extension: "${extension}". Also, make sure you have the dependencies that the extension requires: ${this.requireExtension.slice(0, 10).join(", ")}`,
          );
        }
      }
    }

    this.init(aoitelegram);
  }
}

export { AoiExtension };
