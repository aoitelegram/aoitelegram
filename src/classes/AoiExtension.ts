import { version } from "../index.js";
import { AoijsError } from "./AoiError";
import type { AoiClient } from "./AoiClient";

abstract class AoiExtension {
  abstract name: string;
  abstract description: string;
  abstract version: string;
  abstract targetVersion?: string | string[];
  abstract requireExtension?: string[];

  abstract init(aoitelegram: AoiClient): void;
  abstract init(aoitelegram: AoiClient): Promise<void>;

  async initPlugins(aoitelegram: AoiClient) {
    if (typeof this.targetVersion === "string") {
      if (this.targetVersion > version) {
        throw new AoijsError(
          `The extension supports only '${this.targetVersion}' and above`,
          this.name,
        );
      }
    }

    if (Array.isArray(this.targetVersion)) {
      const requireVersion = this.targetVersion.indexOf(version);
      if (requireVersion === -1) {
        throw new AoijsError(
          `This extension does not support version '${version}' of the library. To ensure everything works correctly, use ${this.targetVersion.slice(0, 10).join(", ")} and others`,
          this.name,
        );
      }
    }

    if (this.requireExtension?.length) {
      const currentExtensions = aoitelegram.parameters.extensions || [];
      for (const extension of this.requireExtension) {
        if (
          currentExtensions.findIndex(({ name }) => name === extension) === -1
        ) {
          throw new AoijsError(
            `The extension requires the extension: '${extension}'. Also, make sure you have the dependencies that the extension requires: ${this.requireExtension.slice(0, 10).join(", ")}`,
            this.name,
          );
        }
      }
    }

    await this.init(aoitelegram);
  }
}

export { AoiExtension };
