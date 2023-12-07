export default {
  name: "$argsCheck",
  callback: async (ctx, event, database, error) => {
    ctx.argsCheck(2, error);
    const [condition, errorMessage = ""] = await ctx.getEvaluateArgs();
    const msgArgs = event.text?.split(/\s+/).length - 1 || 0;
    ctx.checkArgumentTypes([condition, errorMessage], error, [
      "string",
      "string | undefined",
    ]);

    if (
      !["==", "!=", "<=", ">=", "||", "&&", "<", ">"].some((search) =>
        condition.includes(search),
      )
    ) {
      return error.customError("Valid operators", "$argsCheck");
    }

    const checkers = {
      "<": msgArgs < Number(condition.replace("<", "")),
      ">": msgArgs > Number(condition.replace(">", "")),
      "<=": msgArgs <= Number(condition.replace("<=", "")),
      ">=": msgArgs >= Number(condition.replace(">=", "")),
      "==": msgArgs == Number(condition),
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

    if (!check && errorMessage !== "") {
      if (ctx.replyMessage) event.reply(errorMessage);
      else event.send(errorMessage);
      return true;
    }
    return false;
  },
};
