import { ConditionChecker } from "../condition";

export default {
  name: "$checkCondition",
  callback: (context) => {
    context.argsCheck(1);
    const condition = context.inside;
    if (context.isError) return;

    if (
      !["==", "!=", "<=", ">=", "||", "&&", "<", ">"].some((search) =>
        condition.includes(search),
      )
    ) {
      context.sendError("Invalid operators");
      return;
    }
    try {
      const result = eval(ConditionChecker.solve(condition));
      console.log("checkContains: ", result);
      if (result != true && result != false) {
        context.sendError("Invalid condition");
        return false;
      }
      return result;
    } catch (err) {
      console.log("checkContains: ", err);
      return false;
    }
  },
};
