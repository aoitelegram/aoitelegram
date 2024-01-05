import os from "node:os";

export default {
  name: "$getOsMachine",
  callback: (context) => {
    return os.machine();
  },
};
