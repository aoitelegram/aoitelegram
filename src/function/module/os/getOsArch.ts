import os from "node:os";

export default {
  name: "$getOsArch",
  callback: (context) => {
    return os.arch();
  },
};
