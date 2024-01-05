import { version } from "../../../package.json";

export default {
  name: "$packageVersion",
  callback: (context) => {
    return version;
  },
};
