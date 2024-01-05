export default {
  name: "$text",
  callback: (context) => {
    const text = context.event.text || context.event.message?.text;
    const index = context.inside;
    let textSplit: string[] | undefined = text?.split(/\s+/);
    const argsFunc = textSplit?.[Number(index) - 1];
    const noArgsFunc = textSplit?.join?.(" ");
    return index === undefined ? `${noArgsFunc}` : `${argsFunc}`;
  },
};
