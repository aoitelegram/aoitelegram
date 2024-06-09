import fetch from "node-fetch";
import { HttpID } from "../index";
import { Buffer } from "node:buffer";
import { readFile } from "node:fs/promises";
import { AoiFunction, ArgsType } from "@structures/AoiFunction";

async function searchFile(search: string): Promise<Buffer> {
  if (search.startsWith("http")) {
    const response = await fetch(search);
    return Buffer.from(await response.arrayBuffer());
  }
  return await readFile(search);
}

export default new AoiFunction()
  .setName("$httpAppendFile")
  .setBrackets(true)
  .setFields({
    name: "key",
    required: true,
    type: [ArgsType.String],
  })
  .setFields({
    name: "path",
    required: true,
    type: [ArgsType.String],
  })
  .setFields({
    name: "name",
    required: false,
    type: [ArgsType.String],
    defaultValue: "text.txt",
  })
  .onCallback(async (context, func) => {
    const [key, path, file] = await func.resolveFields(context);
    const httpData = context.variable.get(HttpID);

    if ("form" in httpData) {
      return func.reject("To add a file, you need to use $httpAddForm first");
    }

    httpData.form.append(key, new Blob([await searchFile(path)], file));
    context.variable.set(HttpID, httpData);
    return func.resolve(true);
  });
