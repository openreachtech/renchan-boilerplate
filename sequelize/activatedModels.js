'use strict'

const path = require('path')
const { SequelizeActivator } = require('@openreachtech/renchan').sequelize

module.exports = SequelizeActivator
  .createByPaths({
    configPath: path.join(__dirname, './config'),
    modelsPath: path.join(__dirname, './models'),
  })
  .activateSequelize()
