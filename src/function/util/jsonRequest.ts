import { Agent } from "node:https";
import fetch, { RequestInit } from "node-fetch";
import { getObjectKey, parseJSON } from "../parser";

function buildJSONConfig(data) {
  const apiConfig = {
    method: "GET",
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
    ctx.argsCheck(1, error, "$jsonRequest");
    const [apiUrl, requestData = {}, property, errorMessage] =
      await ctx.getEvaluateArgs();
    ctx.checkArgumentTypes(
      [apiUrl, requestData, property, errorMessage],
      error,
      [
        "string",
        "object | undefined",
        "string | undefined",
        "string | undefined",
      ],
    );

    const sanitizedData = Object.keys(requestData)
      .filter(
        (key) => requestData[key] !== undefined && requestData[key] !== null,
      )
      .reduce((acc, key) => ({ ...acc, [key]: requestData[key] }), {});
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
      const text = await response.json();
      return getObjectKey(text, property);
    } catch (err) {
      if (ctx.replyMessage)
        event.reply(errorMessage || `Failed To Request To API: ${err}`);
      else event.send(errorMessage || `Failed To Request To API: ${err}`);
      return undefined;
    }
  },
};
