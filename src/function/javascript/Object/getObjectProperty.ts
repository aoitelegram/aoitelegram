import { getObjectKey } from "../../parser";

export default {
  name: "$getObjectProperty",
  callback: (context) => {
    context.argsCheck(1);
    const [dataObject, path] = context.splits;
    if (context.isError) return;

    const object = JSON.parse(JSON.stringify(dataObject));
    return getObjectKey(object, path);
  },
};
