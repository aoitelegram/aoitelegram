import os from "node:os";

export default {
  name: "$getOsHost.ts",
  callback: (context) => {
    return os.hostname();
  },
};
