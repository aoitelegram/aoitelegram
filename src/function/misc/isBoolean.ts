import { toParse } from "../parser";

export default {
  name: "$isBoolean",
  callback: (context) => {
    context.argsCheck(1);
    const check = context.inside;
    if (context.isError) return;

    return toParse(`${check}`) === "boolean";
  },
};
