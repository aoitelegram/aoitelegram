export default {
  name: "$packageVersion",
  callback: (context) => {
    return context.packageJSON.version;
  },
};
