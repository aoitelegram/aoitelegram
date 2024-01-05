import { arrayAt } from "../parser";

export default {
  name: "$onlyIfMessageContains",
  callback: (context) => {
    context.argsCheck(2);
    const [text, ...chars] = context.splits;
    context.checkArgumentTypes(["string", "...unknown"]);
    if (context.isError) return;

    const result = chars.some((search) => text.includes(search));
    const messageError = arrayAt(chars, -1);
    if (!result) {
      if (messageError) {
        context.sendError(messageError, true);
      } else context.isError = true;
    }
  },
};
