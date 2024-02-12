export default {
  name: "$toLocaleDateString",
  callback: (context) => {
    return new Date().toLocaleDateString();
  },
};
