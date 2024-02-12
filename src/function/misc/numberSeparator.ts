export default {
  name: "$numberSeparator",
  callback: (context) => {
    context.argsCheck(1);
    const [number, sep = ","] = context.splits;
    context.checkArgumentTypes(["number"]);
    if (context.isError) return;

    const splits = number.split(".");

    let result = Number(splits[0]).toLocaleString().replace(/\,/g, sep);
    if (splits[1]) {
      result = `${result}.${splits[1]}`;
    }

    return result;
  },
};
