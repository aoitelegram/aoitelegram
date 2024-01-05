import os from "node:os";

export default {
  name: "$platform",
  callback: (context) => {
    return os.platform();
  },
};
