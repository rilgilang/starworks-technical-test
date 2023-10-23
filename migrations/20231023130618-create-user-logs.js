"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("user_logs", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      user_id: {
        type: Sequelize.INTEGER,
      },
      wallet_address: {
        type: Sequelize.STRING,
      },
      browser_type: {
        type: Sequelize.STRING,
      },
      login_succes: {
        type: Sequelize.INTEGER,
      },
      login_failed: {
        type: Sequelize.INTEGER,
      },
      last_attemp: {
        type: Sequelize.ENUM("login_succes", "login_failed"),
      },
      last_seen: {
        type: Sequelize.DATE,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("user_logs");
  },
};
