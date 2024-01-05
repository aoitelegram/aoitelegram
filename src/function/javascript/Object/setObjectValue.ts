import { setObjectKey } from "../../parser";

export default {
  name: "$setObjectValue",
  callback: (context) => {
    context.argsCheck(2);
    const [object, key, newValue] = context.splits;
    context.checkArgumentTypes(["object", "unknown", "unknown"]);
    if (context.isError) return;

    const dataObject = JSON.parse(JSON.stringify(object));
    return setObjectKey(dataObject, key, newValue);
  },
};
