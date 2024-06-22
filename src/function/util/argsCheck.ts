import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$argsCheck")
  .setBrackets(true)
  .setFields({
    name: "condition",
    required: true,
    type: [ArgsType.String],
  })
  .setFields({
    name: "errorMessage",
    required: true,
    type: [ArgsType.Any],
    converType: ArgsType.String,
  })
  .onCallback(async (context, func) => {
    const [condition, errorMessage] = await func.resolveFields(context);
    const msgArgs = context.eventData?.text?.split(/\s+/).length || 0;

    const checkers = {
      "<": msgArgs < Number(condition.replace("<", "")),
      ">": msgArgs > Number(condition.replace(">", "")),
      "<=": msgArgs <= Number(condition.replace("<=", "")),
      ">=": msgArgs >= Number(condition.replace(">=", "")),
      "==": msgArgs === Number(condition.replace("==", "")),
    };

    const check = condition.startsWith("<=")
      ? checkers["<="]
      : condition.startsWith(">=")
        ? checkers[">="]
        : condition.startsWith("<")
          ? checkers["<"]
          : condition.startsWith(">")
            ? checkers[">"]
            : checkers["=="];

    if (!check && errorMessage) {
      return func.reject(errorMessage, true);
    }

    return func.resolve();
  });
