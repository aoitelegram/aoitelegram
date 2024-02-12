import fetch from "node-fetch";
import { Agent } from "node:https";

export default {
  name: "$isValidLink",
  callback: async (context) => {
    context.argsCheck(1);
    const link = context.inside;
    if (context.isError) return;

    const response = await fetch(link, {
      agent: new Agent(),
      method: "GET",
    }).catch(() => null);

    return response !== null;
  },
};
