export default {
  name: "$hour",
  callback: (context) => {
    return new Date().getHours();
  },
};
