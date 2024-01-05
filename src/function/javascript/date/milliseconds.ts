export default {
  name: "$milliseconds",
  callback: (context) => {
    return new Date().getMilliseconds();
  },
};
