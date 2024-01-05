import { execSync } from "node:child_process";

export default {
  name: "$exec",
  callback: (context) => {
    context.argsCheck(1);
    const command = context.inside;
    if (context.isError) return;

    try {
      return execSync(command).toString();
    } catch (err) {
      return err;
    }
  },
};
