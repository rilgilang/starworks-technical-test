/* Check if string is a valid SHA256 Hash */
exports.checkIfValidSHA256 = (str) => {
  // Regular expression to check if string is a SHA256 hash
  const regexExp = /^[a-f0-9]{64}$/gi;

  return regexExp.test(str);
};
