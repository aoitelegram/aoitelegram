import os from "node:os";

export default {
  name: "$getOsHost",
  callback: (context) => {
    return os.hostname();
  },
};
