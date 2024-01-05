import { ConditionChecker } from "../condition";

export default {
  name: "$onlyIf",
  callback: (context) => {
    context.argsCheck(2);
    const [condition, errorText] = context.splits;
    if (context.isError) return;

    if (
      !["==", "!=", "<=", ">=", "||", "&&", "<", ">"].some((search) =>
        condition.includes(search),
      )
    ) {
      context.sendError("Invalid operators");
    }

    try {
      const result = eval(ConditionChecker.solve(condition));
      if (result !== true && result !== false) {
        context.sendError("Invalid condition");
      }

      if (!result) {
        if (!result) {
          context.event.send(errorText);
        } else context.isError = true;
      }
    } catch (err) {
      context.sendError("Invalid condition");
    }
  },
};
