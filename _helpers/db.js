const config = require(process.env.NODE_ENV === 'production' ? '../config.prod.json' : '../config.json')
const { Sequelize } = require('sequelize')

module.exports = db = { }

async function initialize(){
  const { host, port, user, password, database, dialect } = config.database
  console.log('Connecting to database:', { host, port, user, database, dialect })
  
  try {
    const sequelize = new Sequelize(database, user, password, { 
      host,
      port,
      dialect: dialect || 'mysql',
      logging: false // Set to console.log to see SQL queries
    })

    // Test the connection
    await sequelize.authenticate()
    console.log('Database connection successful')

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

    await sequelize.sync()
    console.log('Database sync completed')
  } catch (error) {
    console.error('Database connection error:', error)
    throw error
  }
}

initialize()
