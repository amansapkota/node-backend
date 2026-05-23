import AdminJS from 'adminjs'
import * as AdminJSPrisma from '@adminjs/prisma'
import { PrismaClient } from '@prisma/client'
import * as PrismaModule from '@prisma/client'

const prisma = new PrismaClient()

AdminJS.registerAdapter({
  Resource: AdminJSPrisma.Resource,
  Database: AdminJSPrisma.Database,
})

const { getModelByName } = AdminJSPrisma

const admin = new AdminJS({
  rootPath: '/admin',
  resources: [
    { resource: { model: getModelByName('Category', PrismaModule), client: prisma } },
    { resource: { model: getModelByName('Product', PrismaModule), client: prisma } },
    { resource: { model: getModelByName('Branch', PrismaModule), client: prisma } },
    { resource: { model: getModelByName('Customer', PrismaModule), client: prisma } },
    { resource: { model: getModelByName('Admin', PrismaModule), client: prisma } },
    { resource: { model: getModelByName('DeliveryPartner', PrismaModule), client: prisma } },
    { resource: { model: getModelByName('Order', PrismaModule), client: prisma } },
    { resource: { model: getModelByName('OrderItem', PrismaModule), client: prisma } },
  ],
  branding: {
    companyName: 'Star Traders Admin',
    softwareBrothers: false,
  },
})

export { admin }