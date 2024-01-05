export default {
  name: "$reply",
  callback: (context) => {
    const [reply = true] = context.splits;
    context.checkArgumentTypes(["boolean"]);
    if (context.isError) return;

    context.replyMessage = reply;
    return "";
  },
};
