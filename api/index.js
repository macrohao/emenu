const app = require('../server/index');

module.exports = async (req, res) => {
  await app(req, res);
};
