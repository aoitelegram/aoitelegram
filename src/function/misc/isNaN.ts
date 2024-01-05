import { toParse } from "../parser";

export default {
  name: "$isNaN",
  callback: (context) => {
    context.argsCheck(1);
    const check = context.inside;
    if (context.isError) return;

    return toParse(`${check}`) === "nan";
  },
};
