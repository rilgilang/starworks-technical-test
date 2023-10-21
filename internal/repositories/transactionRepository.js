const uuid = require("uuid");
const { transaction } = require("../../models");

class TransactionRepository {
  constructor() {}
  findTransaction = async (transactionId, status) => {
    let data;
    if (status) {
      data = await transaction.findOne({
        where: {
          id: transactionId,
          status: status,
        },
      });
    } else {
      data = await transaction.findOne({
        where: {
          id: transactionId,
        },
      });
    }

    return data;
  };

  createTransaction = async (payload) => {
    const data = await transaction.create({
      id: uuid.v4(),
      recipient_address: payload.recipient_address,
      sender_address: payload.sender_address,
      amount: payload.amount,
      status: "pending",
    });

    return data;
  };

  updateTransactionStatus = async (status, transactionId) => {
    const data = await transaction.update(
      { status: status },
      { where: { id: transactionId } }
    );

    return data;
  };

  destroyAll = async () => {
    const result = await transaction.destroy({
      where: {},
      truncate: true,
    });

    return result;
  };
}

module.exports = TransactionRepository;
