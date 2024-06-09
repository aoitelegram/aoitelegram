import fs from "node:fs/promises";
import path from "node:path";
import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$movedir")
  .setAliases(["$movefile"])
  .setBrackets(true)
  .setFields({
    name: "src",
    required: true,
    type: [ArgsType.Any],
  })
  .setFields({
    name: "dest",
    required: true,
    type: [ArgsType.Any],
  })
  .onCallback(async (context, func) => {
    const [src, dest] = await func.resolveFields(context);

    async function copyDir(src: string, dest: string) {
      const entries = await fs.readdir(src, { withFileTypes: true });
      await fs.mkdir(dest, { recursive: true });

      for (let entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
          await copyDir(srcPath, destPath);
        } else {
          await fs.copyFile(srcPath, destPath);
        }
      }
    }

    await copyDir(src, dest);
    return func.resolve(true);
  });
