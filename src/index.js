'use strict'
require('module-alias/register')

// const dbInit = require('@/services/db-initializer')
// dbInit.init()

const surveyor = require('@/services/identity-surveyor')
surveyor.survey()
