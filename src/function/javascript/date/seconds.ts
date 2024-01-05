export default {
  name: "$seconds",
  callback: (context) => {
    return new Date().getSeconds();
  },
};
