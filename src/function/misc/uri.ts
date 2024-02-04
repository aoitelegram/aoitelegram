export default {
  name: "$uri",
  callback: (context) => {
    context.argsCheck(1);
    const [text, type = "encode"] = context.splits;
    if (context.isError) return;

    return type == "encode"
      ? encodeURIComponent(text)
      : decodeURIComponent(text);
  },
};
