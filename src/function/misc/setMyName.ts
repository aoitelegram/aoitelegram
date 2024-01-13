export default {
  name: "$setMyName",
  callback: async (context) => {
    context.argsCheck(1);
    const [name, language_code] = context.splits;
    context.checkArgumentTypes(["string", "string | undefined"]);
    if (context.isError) return;

    await context.telegram.setMyName(name, language_code);

    return true;
  },
};
