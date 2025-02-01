const blackList = new Set();

const revokeAccessToken = (accessToken) => {
  blackList.add(accessToken);
};

module.exports = {
  blackList,
  revokeAccessToken,
};
