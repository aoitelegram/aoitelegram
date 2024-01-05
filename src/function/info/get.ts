export default {
  name: "$get",
  callback: (context) => {
    context.argsCheck(1);
    if (context.isError) return;

    const [variable, type = "local"] = context.splits;

    return type === "global"
      ? context.telegram.globalVars.get(variable)
      : context.localVars.get(variable);
  },
};
