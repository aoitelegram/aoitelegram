export default {
  name: "$toLocaleString",
  callback: (context) => {
    return new Date().toLocaleString();
  },
};
