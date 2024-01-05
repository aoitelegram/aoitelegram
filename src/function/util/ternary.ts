import { ConditionChecker } from "../condition";

export default {
  name: "$ternary",
  callback: (context) => {
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
