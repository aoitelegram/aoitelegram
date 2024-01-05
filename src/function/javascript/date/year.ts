export default {
  name: "$year",
  callback: (context) => {
    return new Date().getFullYear();
  },
};
