import { toParse } from "../parser";

export default {
  name: "$isUndefined",
  callback: (context) => {
    context.argsCheck(1);
    const check = context.inside;
    if (context.isError) return;

    return toParse(`${check}`) === "undefined";
  },
};
