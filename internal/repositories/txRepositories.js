const { sequelize } = require("../../models");

class TxRepository {
  constructor() {}
  startTx = async () => {
    const tx = await sequelize.transaction();
    return tx;
  };

  commitTx = async (tx) => {
    await tx.commit();
  };

  rollbackTx = async (tx) => {
    await tx.rollback();
  };
}

module.exports = TxRepository;
