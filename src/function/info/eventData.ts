import { getObjectKey } from "../parser";

export default {
  name: "$eventData",
  callback: (context) => {
    return getObjectKey(context.event, context.inside);
  },
};
