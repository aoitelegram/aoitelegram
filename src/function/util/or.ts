import { ConditionChecker } from "../condition";

export default {
  name: "$or",
  callback: (context) => {
    context.argsCheck(2);
    const [...condition] = context.splits;
    if (context.isError) return;

    let conditionResult: boolean[] = [];

    for (const cond of condition) {
      const solve = ConditionChecker.solve(cond);
      try {
        conditionResult.push(eval(solve));
      } catch (e) {
        conditionResult.push(false);
      }
    }

    return conditionResult.includes(true);
  },
};
