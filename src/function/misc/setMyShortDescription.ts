export default {
  name: "$setMyShortDescription",
  callback: async (context) => {
    context.argsCheck(1);
    const [description, language_code] = context.splits;
    context.checkArgumentTypes(["string", "string | undefined"]);
    if (context.isError) return;

    const result = await context.telegram.setMyShortDescription(
      description,
      language_code,
    );

    return true;
  },
};
