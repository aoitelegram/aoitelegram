export default {
  name: "$argsCheck",
  callback: (context) => {
    context.argsCheck(2);
    const [condition, errorMessage = ""] = context.splits;
    const msgArgs = context.event.text?.split(/\s+/).length - 1 || 0;
    if (context.isError) return;

    if (
      !["==", "!=", "<=", ">=", "||", "&&", "<", ">"].some((search) =>
        condition.includes(search),
      )
    ) {
      context.sendError("Invalid operators");
      return;
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
      context.sendError(errorMessage, true);
      return;
    }
    return "";
  },
};
