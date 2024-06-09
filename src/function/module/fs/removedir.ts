import fs from "node:fs/promises";
import path from "node:path";
import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$removedir")
  .setAliases(["$removefile"])
  .setBrackets(true)
  .setFields({
    name: "src",
    required: true,
    type: [ArgsType.Any],
  })
  .onCallback(async (context, func) => {
    const [src] = await func.resolveFields(context);

    async function removeDir(dir: string) {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (let entry of entries) {
        const entryPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          await removeDir(entryPath);
        } else {
          await fs.unlink(entryPath);
        }
      }
      await fs.rmdir(dir);
    }

    await removeDir(src);
    return func.resolve(true);
  });
