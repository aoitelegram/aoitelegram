import os from "node:os";

export default {
  name: "$getOSTCpus",
  callback: (context) => {
    return os.cpus();
  },
};
