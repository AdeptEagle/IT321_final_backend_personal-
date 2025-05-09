const config = require('../config.json')
const mysql = require('mysql2/promise')
const { Sequelize } = require('sequelize')

module.exports = db = { }

async function initialize(){
  const { host, port, user, password, database } = {
    host: process.env.DB_HOST || config.database.host,
    port: process.env.DB_PORT || config.database.port,
    user: process.env.DB_USER || config.database.user,
    password: process.env.DB_PASSWORD || config.database.password,
    database: process.env.DB_NAME || config.database.database
  }
  
  const connection = await mysql.createConnection({ host, port, user, password })
  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`)

  const sequelize = new Sequelize(database, user, password, { 
    host,
    port,
    dialect: 'mysql'
  })

  db.Account = require('../accounts/account.model')(sequelize)
  db.Department = require('../departments/department.model')(sequelize)
  db.refreshToken = require('../accounts/refresh-token.model')(sequelize)
  db.Employee = require('../employees/employee.model')(sequelize)

  // one to many (account -> refreshToken)
  db.Account.hasMany(db.refreshToken, { onDelete: 'CASCADE' })
  db.refreshToken.belongsTo(db.Account)

  // one to one (employee to account)
  db.Account.hasOne(db.Employee, {
    foreignKey: 'userId',
    onDelete: 'CASCADE'
  })
  db.Employee.belongsTo(db.Account, {
    foreignKey: 'userId'
  })  

  // one to many (employee -> department) 
  db.Department.hasMany(db.Employee, {
    foreignKey: 'departmentId',
    onDelete: 'SET NULL'
  })  
  db.Employee.belongsTo(db.Department, {
    foreignKey: 'departmentId'
  })

  await sequelize.sync({ force: true })
}

initialize()
