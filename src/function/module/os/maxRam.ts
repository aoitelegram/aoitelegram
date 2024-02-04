import os from "node:os";

export default {
  name: "$maxRam",
  callback: (context) => {
    return (os.totalmem() / 1024 / 1024).toFixed(2);
  },
};
