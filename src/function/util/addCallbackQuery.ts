function pushIndexArray(index, value, array) {
  if (!Array.isArray(array[index])) {
    array[index] = [];
  }

  array[index].push(value);
}

export default {
  name: "$addCallbackQuery",
  callback: (context) => {
    context.argsCheck(3);
    const [index, text, callback_data] = context.splits;
    context.checkArgumentTypes(["number", "string", "string"]);
    if (context.isError) return;

    pushIndexArray(
      index - 1,
      {
        text,
        callback_data,
      },
      context.callback_query,
    );
    return "";
  },
};
