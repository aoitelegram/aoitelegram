import { toParse } from "../parser";

export default {
  name: "$isNumber",
  callback: (context) => {
    context.argsCheck(1);
    const check = context.inside;
    if (context.isError) return;

    return toParse(`${check}`) === "number";
  },
};
