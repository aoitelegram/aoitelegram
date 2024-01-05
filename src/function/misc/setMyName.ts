export default {
  name: "$setMyName",
  callback: async (context) => {
    context.argsCheck(1);
    const [name, language_code] = context.splits;
    context.checkArgumentTypes(["string", "string | undefined"]);
    if (context.isError) return;

    const result = await context.telegram
      .setMyName(name, language_code)
      .catch((err) => err);

    if (typeof result !== "boolean") {
      context.sendError("Failed to usage");
      return;
    }

    return true;
  },
};
