import fetch, { RequestInit } from "node-fetch";
import { Agent } from "node:https";
import { getObjectKey } from "../parser";

function buildJSONConfig(data) {
  const apiConfig = {
    method: "POST",
    compress: true,
    headers: {
      "content-type": "application/json",
      connection: "keep-alive",
    },
    body: JSON.stringify(data),
    agent: new Agent({
      keepAlive: true,
      keepAliveMsecs: 10000,
    }),
  };

  return Promise.resolve(apiConfig);
}

export default {
  name: "$jsonRequest",
  callback: async (ctx, event, database, error) => {
    ctx.argsCheck(1, error);
    const [apiUrl, property = {}, errorMessage] = await ctx.getEvaluateArgs();
    ctx.checkArgumentTypes([apiUrl, property, errorMessage], error, [
      "string",
      "object",
      "string | undefined",
    ]);

    const sanitizedData = Object.keys(property)
      .filter((key) => property[key] !== undefined && property[key] !== null)
      .reduce((acc, key) => ({ ...acc, [key]: property[key] }), {});
    const config = buildJSONConfig(sanitizedData);
    try {
      const response = await fetch(apiUrl, config as RequestInit);
      if (response.status === 404) {
        if (ctx.replyMessage)
          event.reply(
            errorMessage || `Failed To Request To API: ${response.statusText}`,
          );
        else
          event.send(
            errorMessage || `Failed To Request To API: ${response.statusText}`,
          );
        return undefined;
      }
      const text = await response.text();
      return JSON.parse(text).result;
    } catch (err) {
      if (ctx.replyMessage)
        event.reply(errorMessage || `Failed To Request To API: ${err}`);
      else event.send(errorMessage || `Failed To Request To API: ${err}`);
      return undefined;
    }
  },
};
