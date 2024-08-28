import { Agent } from "node:https";
import { getObjectKey } from "@aoitelegram/util";
import fetch, { RequestInit } from "node-fetch";
import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$jsonRequest")
  .setBrackets(true)
  .setFields({ name: "link", type: [ArgsType.Any], required: true })
  .setFields({ name: "property", type: [ArgsType.Any], required: false })
  .setFields({ name: "errorMessage", type: [ArgsType.Any], required: false })
  .setFields({
    name: "headers",
    type: [ArgsType.Object],
    rest: true,
    required: false,
    defaultValue: {},
  })
  .onCallback(async (context, func) => {
    const [link, property, errorMessage, headers] =
      await func.resolveFields(context);

    const sanitizedData = Object.keys(headers)
      .filter((key) => !headers[key])
      .reduce((acc, key) => ({ ...acc, [key]: headers[key] }), {});

    try {
      const response = await fetch(link, {
        method: "GET",
        headers: sanitizedData,
        agent: new Agent(),
      });

      if (response.status === 404) {
        return errorMessage
          ? func.reject(errorMessage, true)
          : func.reject(`Failed To Request To API: ${response.statusText}`);
      }
      return func.resolve(getObjectKey(await response.json(), property));
    } catch (err) {
      return errorMessage
        ? func.reject(errorMessage, true)
        : func.reject(`Failed To Request To API: ${err}`);
    }
  });
