const Sequelize = require("sequelize");
const db = require("../db");

const Group = db.define("group", {
  Id: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
    allowNull: false,
  },
});

module.exports = Group;
