exports.walletAddressGenerator = async (username, email) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(`${username}:${email}`);
  try {
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
    return hashHex;
  } catch (error) {
    console.error("Error generating SHA-256 hash:", error);
    return null;
  }
};

exports.pinHashGenerator = async (pin) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(`${pin}`);
  try {
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
    return hashHex;
  } catch (error) {
    console.error("Error generating SHA-256 hash:", error);
    return null;
  }
};
