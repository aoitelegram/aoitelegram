export default {
  name: "$setMyDescription",
  callback: async (context) => {
    context.argsCheck(1);
    const [description, language_code] = context.splits;
    context.checkArgumentTypes(["string", "string | undefined"]);
    if (context.isError) return;

    const result = await context.telegram.setMyDescription(
      description,
      language_code,
    );

    return true;
  },
};
