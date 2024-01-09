import { Agent } from "node:https";
import { getObjectKey } from "../parser";
import fetch, { RequestInit } from "node-fetch";

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
  callback: async (context) => {
    context.argsCheck(1);
    let [apiUrl, requestData = {}, property, errorMessage] = context.splits;
    context.checkArgumentTypes([
      "string",
      "object | undefined",
      "string | undefined",
      "string | undefined",
    ]);
    if (context.isError) return;
    requestData = JSON.parse(JSON.stringify(requestData));

    const sanitizedData = Object.keys(requestData)
      .filter(
        (key) => requestData[key] !== undefined && requestData[key] !== null,
      )
      .reduce((acc, key) => ({ ...acc, [key]: requestData[key] }), {});
    const config = await buildJSONConfig(sanitizedData);
    try {
      const response = await fetch(apiUrl, config as RequestInit);
      if (response.status === 404) {
        context.sendError(`Failed To Request To API: ${response.statusText}`);
        return "";
      }
      const text = await response.json();
      return getObjectKey(text, property);
    } catch (err) {
      context.sendError(`Failed To Request To API: ${err}`);
      return "";
    }
  },
};
