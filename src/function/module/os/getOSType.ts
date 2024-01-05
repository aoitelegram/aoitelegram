import os from "node:os";

export default {
  name: "$getOSType",
  callback: (context) => {
    return os.type();
  },
};
