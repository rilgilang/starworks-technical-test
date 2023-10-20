const { sequelize } = require("../../models");

class TransactionRepository {
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

module.exports = TransactionRepository;
