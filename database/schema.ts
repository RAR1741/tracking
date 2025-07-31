import {
  boolean,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const guestBook = pgTable("guestBook", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
});

// Roles and Permissions tables
export const role = pgTable("role", {
  id: text().primaryKey(),
  name: varchar({ length: 100 }).notNull().unique(),
  description: text(),
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp().notNull().defaultNow(),
});

export const permission = pgTable("permission", {
  id: text().primaryKey(),
  name: varchar({ length: 100 }).notNull().unique(),
  description: text(),
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp().notNull().defaultNow(),
});

export const rolePermission = pgTable(
  "role_permission",
  {
    roleId: text()
      .notNull()
      .references(() => role.id, { onDelete: "cascade" }),
    permissionId: text()
      .notNull()
      .references(() => permission.id, { onDelete: "cascade" }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.roleId, table.permissionId] }),
  })
);

export const userRole = pgTable(
  "user_role",
  {
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    roleId: text()
      .notNull()
      .references(() => role.id, { onDelete: "cascade" }),
    assignedAt: timestamp().notNull().defaultNow(),
    assignedBy: text().references(() => user.id),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.roleId] }),
  })
);

export const userPermission = pgTable(
  "user_permission",
  {
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    permissionId: text()
      .notNull()
      .references(() => permission.id, { onDelete: "cascade" }),
    assignedAt: timestamp().notNull().defaultNow(),
    assignedBy: text().references(() => user.id),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.permissionId] }),
  })
);

// Better Auth tables
export const user = pgTable("user", {
  id: text().primaryKey(),
  name: text(),
  email: text().notNull().unique(),
  emailVerified: boolean().notNull().default(false),
  image: text(),
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp().notNull().defaultNow(),
});

export const session = pgTable("session", {
  id: text().primaryKey(),
  userId: text()
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  token: text().notNull().unique(),
  expiresAt: timestamp().notNull(),
  ipAddress: text(),
  userAgent: text(),
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp().notNull().defaultNow(),
});

export const account = pgTable("account", {
  id: text().primaryKey(),
  userId: text()
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accountId: text().notNull(),
  providerId: text().notNull(),
  accessToken: text(),
  refreshToken: text(),
  accessTokenExpiresAt: timestamp(),
  refreshTokenExpiresAt: timestamp(),
  scope: text(),
  idToken: text(),
  password: text(),
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp().notNull().defaultNow(),
});

export const verification = pgTable("verification", {
  id: text().primaryKey(),
  identifier: text().notNull(),
  value: text().notNull(),
  expiresAt: timestamp().notNull(),
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp().notNull().defaultNow(),
});
