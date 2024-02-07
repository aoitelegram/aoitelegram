import { randomUUID } from "node:crypto";

export default {
  name: "$randomUUID",
  callback: (context) => {
    if (context.isError) return;

    return randomUUID();
  },
};
