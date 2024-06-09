import fetch from "node-fetch";
import { HttpID } from "../index";
import { Buffer } from "node:buffer";
import { AoiFunction, ArgsType } from "@structures/AoiFunction";

enum HTTPContentType {
  JSON,
  Text,
}

export default new AoiFunction()
  .setName("$httpRequest")
  .setBrackets(true)
  .setFields({
    name: "url",
    required: true,
    type: [ArgsType.String],
  })
  .setFields({
    name: "method",
    required: true,
    type: [ArgsType.String],
  })
  .setFields({
    name: "variable",
    required: false,
    type: [ArgsType.String],
    defaultValue: "result",
  })
  .onCallback(async (context, func) => {
    const [url, method, variable] = await func.resolveFields(context);
    const httpData = context.variable.get(HttpID);
    const response = await fetch(url, {
      ...httpData,
      method,
      body: httpData.body || httpData.form,
    });

    const contextOverrideType = httpData.contentType;
    const requestContentType = response.headers
      .get("content-type")
      ?.split(";")[0];
    context.variable.set(HttpID, {});

    if (contextOverrideType !== undefined) {
      const overrideKey = HTTPContentType[
        contextOverrideType
      ]?.toLowerCase() as Lowercase<keyof typeof HTTPContentType>;
      context.variable.set(HttpID, {
        variable: { variable, result: await response[overrideKey]() },
      });
    } else {
      if (requestContentType === "application/json") {
        context.variable.set(HttpID, {
          variable: { variable, result: await response.json() },
        });
      } else if (requestContentType?.includes("image")) {
        const imageData = await response.arrayBuffer();
        const base64Image = Buffer.from(imageData).toString("base64");
        context.variable.set(HttpID, {
          variable: { variable, result: base64Image },
        });
      } else {
        context.variable.set(HttpID, {
          variable: { variable, result: await response.text() },
        });
      }
    }

    return func.resolve(response.status);
  });
