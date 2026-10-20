'use strict'

const fs = require('node:fs')
const path = require('node:path')

const {
  Sequelize,
} = require('sequelize')

const ENVIRONMENT = 'development'

process.env.NODE_ENV = ENVIRONMENT

const config = require('../sequelize/config.cjs')

const SQLITE_DIALECT = 'sqlite'
const STORAGE_DIRECTORY = path.resolve(__dirname, '../sequelize/storage')

/**
 * Remove every SQLite file under the storage directory.
 */
function removeSqliteFiles () {
  if (!fs.existsSync(STORAGE_DIRECTORY)) {
    return
  }

  const names = fs.readdirSync(STORAGE_DIRECTORY)
    .filter(name => name.endsWith('.sqlite3'))

  names.forEach(name => {
    fs.rmSync(path.join(STORAGE_DIRECTORY, name))
  })
}

/**
 * Drop the database the development entry names, connected without selecting it.
 */
async function dropServerDatabase () {
  const {
    database,
    ...connectionOptions
  } = config[ENVIRONMENT]

  const sequelize = new Sequelize({
    ...connectionOptions,
    logging: false,
  })

  try {
    await sequelize.getQueryInterface()
      .dropDatabase(database)
  } finally {
    await sequelize.close()
  }
}

if (config[ENVIRONMENT].dialect === SQLITE_DIALECT) {
  removeSqliteFiles()
} else {
  dropServerDatabase()
}
