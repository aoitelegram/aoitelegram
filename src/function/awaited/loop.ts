import ms from "ms";

export default {
  name: "$loop",
  callback: (context) => {
    context.argsCheck(2);
    const [name, milliseconds, data = {}] = context.splits;
    context.checkArgumentTypes(["string", "string", "object"]);
    if (context.isError) return;

    context.telegram.awaitedManager.addAwaited(name, {
      milliseconds: +ms(milliseconds),
      data: JSON.parse(data),
      context: context.event,
    });
  },
};
