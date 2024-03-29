// import { ConditionChecker } from "../condition";

export default {
  name: "$ternary",
  brackets: !0,
  description:
    "Creates a condition and executes a code depending on the condition.",
  fields: [
    {
      name: "condition",
      description: "the condition to test.",
      type: "STRING",
      required: !0,
    },
    {
      name: "when true",
      description: "the code to execute if condition is true.",
      type: "STRING",
      required: !1,
    },
    {
      name: "when false",
      description: "the code to execute if condition is false",
      type: "STRING",
      required: !1,
    },
  ],
  callback: (i, t) => {
    context.argsCheck(3);
    const [condition, isTrue, isFalse] = context.splits;
    if (context.isError) return;
    if (
      !["==", "!=", "<=", ">=", "||", "&&", "<", ">"].some((search) =>
        condition.includes(search),
      )
    ) {
      context.sendError("Invalid operators");
      return;
    }
    let response = false;
    try {
      response = eval(ConditionChecker.solve(condition));
    } catch (err) {
      response = false;
    }
    return response ? isTrue : isFalse;
  },
};
