import AdminJS from "adminjs";
import AdminJSFastify from "@adminjs/fastify";
import { Database, Resource, getModelByName } from "@adminjs/prisma";
import { authenticate, COOKIE_PASSWORD, sessionStore } from "./config.js";
import prisma from "../lib/prisma.js";

AdminJS.registerAdapter({ Database, Resource });

export const admin = new AdminJS({
  resources: [
    {
      resource: { model: getModelByName("Customer"), client: prisma },
      options: {
        listProperties: ["phone", "role", "isActivated"],
        filterProperties: ["phone", "role"],
      },
    },
    {
      resource: { model: getModelByName("DeliveryPartner"), client: prisma },
      options: {
        listProperties: ["email", "role", "isActivated"],
        filterProperties: ["email", "role"],
      },
    },
    { resource: { model: getModelByName("Admin"), client: prisma } },
    { resource: { model: getModelByName("Branch"), client: prisma } },
    { resource: { model: getModelByName("Product"), client: prisma } },
    { resource: { model: getModelByName("Category"), client: prisma } },
    { resource: { model: getModelByName("Order"), client: prisma } },
    { resource: { model: getModelByName("Counter"), client: prisma } },
  ],
  branding: {
    companyName: "Grocery Delivery App",
    withMadeWithLove: false,
  },
  rootPath: "/admin",
});

export const buildAdminRouter = async (app) => {
  await AdminJSFastify.buildAuthenticatedRouter(
    admin,
    {
      authenticate,
      cookiePassword: COOKIE_PASSWORD,
      cookieName: "adminjs",
    },
    app,
    {
      store: sessionStore,
      saveUninitialized: true,
      secret: COOKIE_PASSWORD,
      cookie: {
        httpOnly: process.env.NODE_ENV === "production",
        secure: process.env.NODE_ENV === "production",
      },
    }
  );
};