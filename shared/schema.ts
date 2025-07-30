import { pgTable, text, serial, integer, boolean, timestamp, decimal, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  password: text("password").notNull(),
  plainTextPassword: text("plain_text_password"), // For admin view only
  walletBalance: decimal("wallet_balance", { precision: 10, scale: 2 }).default("0.00"),
  isAdmin: boolean("is_admin").default(false),
  isVerified: boolean("is_verified").default(false),
  referralCode: text("referral_code").unique(),
  referredBy: integer("referred_by"),
  totalReferralEarnings: decimal("total_referral_earnings", { precision: 10, scale: 2 }).default("0.00"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const serviceCategories = pgTable("service_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  icon: text("icon").notNull(),
  color: text("color").notNull(),
  isActive: boolean("is_active").default(true),
});

export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  pricePerThousand: decimal("price_per_thousand", { precision: 10, scale: 4 }).notNull(),
  minQuantity: integer("min_quantity").default(100),
  maxQuantity: integer("max_quantity").default(100000),
  isActive: boolean("is_active").default(true),
  providerId: integer("provider_id"),
  providerServiceId: text("provider_service_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  serviceId: integer("service_id").notNull(),
  targetUrl: text("target_url").notNull(),
  quantity: integer("quantity").notNull(),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"), // pending, processing, completed, cancelled, partial
  startCount: integer("start_count").default(0),
  remains: integer("remains").default(0),
  deliveredCount: integer("delivered_count").default(0), // Actual delivered count from provider
  completionPercentage: decimal("completion_percentage", { precision: 5, scale: 2 }).default("0.00"), // Real completion %
  isSentToProvider: boolean("is_sent_to_provider").default(false), // Track if order sent to provider
  providerOrderId: text("provider_order_id"),
  cancelReason: text("cancel_reason"), // Reason for cancellation
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(), // deposit, order, referral, withdrawal
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  description: text("description").notNull(),
  status: text("status").notNull().default("completed"), // pending, completed, failed
  paymentMethod: text("payment_method"), // stripe, razorpay, manual
  paymentIntentId: text("payment_intent_id"),
  orderId: integer("order_id"),
  transactionId: text("transaction_id"), // External payment reference
  referenceNumber: text("reference_number"), // Internal tracking number  
  createdAt: timestamp("created_at").defaultNow(),
});

export const referrals = pgTable("referrals", {
  id: serial("id").primaryKey(),
  referrerId: integer("referrer_id").notNull(),
  referredUserId: integer("referred_user_id").notNull(),
  commissionAmount: decimal("commission_amount", { precision: 10, scale: 2 }).notNull(),
  type: text("type").notNull(), // signup, deposit
  depositAmount: decimal("deposit_amount", { precision: 10, scale: 2 }),
  isPaid: boolean("is_paid").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const adminMessages = pgTable("admin_messages", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const supportTickets = pgTable("support_tickets", {
  id: serial("id").primaryKey(),
  ticketId: text("ticket_id").notNull().unique(), // Unique ticket ID like "TKT-12345"
  userId: integer("user_id").notNull(),
  orderId: integer("order_id"), // Optional: link to specific order
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  status: text("status").notNull().default("open"), // open, replied, closed
  priority: text("priority").notNull().default("medium"), // low, medium, high
  adminReply: text("admin_reply"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const providers = pgTable("providers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  apiUrl: text("api_url").notNull(),
  apiKey: text("api_key").notNull(),
  isActive: boolean("is_active").default(true),
  balance: decimal("balance", { precision: 10, scale: 2 }).default("0.00"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const paymentMethods = pgTable("payment_methods", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // upi, crypto, bank, wallet
  isActive: boolean("is_active").default(true),
  config: jsonb("config"), // Store UPI ID, crypto wallet address, etc.
  qrCodeImage: text("qr_code_image"), // Store QR code image URL or base64
  icon: text("icon"),
  description: text("description"),
  minAmount: decimal("min_amount", { precision: 10, scale: 2 }).default("10.00"),
  maxAmount: decimal("max_amount", { precision: 10, scale: 2 }).default("50000.00"),
  processingFee: decimal("processing_fee", { precision: 5, scale: 2 }).default("0.00"), // percentage
  createdAt: timestamp("created_at").defaultNow(),
});

export const cryptoPayments = pgTable("crypto_payments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").notNull(), // USDT, BTC, ETH, etc.
  walletAddress: text("wallet_address").notNull(),
  transactionHash: text("transaction_hash"),
  status: text("status").notNull().default("pending"), // pending, confirmed, failed
  networkFee: decimal("network_fee", { precision: 10, scale: 2 }).default("0.00"),
  exchangeRate: decimal("exchange_rate", { precision: 10, scale: 4 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  confirmedAt: timestamp("confirmed_at"),
});

export const upiPayments = pgTable("upi_payments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  upiId: text("upi_id").notNull(),
  transactionId: text("transaction_id"),
  paymentScreenshot: text("payment_screenshot"), // Image URL for manual verification
  status: text("status").notNull().default("pending"), // pending, verified, failed
  adminNotes: text("admin_notes"),
  createdAt: timestamp("created_at").defaultNow(),
  verifiedAt: timestamp("verified_at"),
  verifiedBy: integer("verified_by"), // Admin user ID
});

export const userMessages = pgTable("user_messages", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  adminId: integer("admin_id"), // Which admin sent the message (null for user messages)
  message: text("message").notNull(),
  isFromAdmin: boolean("is_from_admin").default(false),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Admin Settings Table
export const adminSettings = pgTable("admin_settings", {
  id: serial("id").primaryKey(),
  settingKey: text("setting_key").notNull().unique(),
  settingValue: text("setting_value").notNull(),
  description: text("description"),
  updatedBy: integer("updated_by").references(() => users.id),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  orders: many(orders),
  transactions: many(transactions),
  supportTickets: many(supportTickets),
  referrals: many(referrals, { relationName: "referrer" }),
  referredUsers: many(referrals, { relationName: "referred" }),
  referrer: one(users, {
    fields: [users.referredBy],
    references: [users.id],
  }),
}));

export const serviceCategoriesRelations = relations(serviceCategories, ({ many }) => ({
  services: many(services),
}));

export const servicesRelations = relations(services, ({ one, many }) => ({
  category: one(serviceCategories, {
    fields: [services.categoryId],
    references: [serviceCategories.id],
  }),
  orders: many(orders),
  provider: one(providers, {
    fields: [services.providerId],
    references: [providers.id],
  }),
}));

export const ordersRelations = relations(orders, ({ one }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  service: one(services, {
    fields: [orders.serviceId],
    references: [services.id],
  }),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id],
  }),
  order: one(orders, {
    fields: [transactions.orderId],
    references: [orders.id],
  }),
}));

export const referralsRelations = relations(referrals, ({ one }) => ({
  referrer: one(users, {
    fields: [referrals.referrerId],
    references: [users.id],
    relationName: "referrer",
  }),
  referredUser: one(users, {
    fields: [referrals.referredUserId],
    references: [users.id],
    relationName: "referred",
  }),
}));

export const supportTicketsRelations = relations(supportTickets, ({ one }) => ({
  user: one(users, {
    fields: [supportTickets.userId],
    references: [users.id],
  }),
}));

export const providersRelations = relations(providers, ({ many }) => ({
  services: many(services),
}));

export const paymentMethodsRelations = relations(paymentMethods, ({ many }) => ({
  cryptoPayments: many(cryptoPayments),
  upiPayments: many(upiPayments),
}));

export const cryptoPaymentsRelations = relations(cryptoPayments, ({ one }) => ({
  user: one(users, {
    fields: [cryptoPayments.userId],
    references: [users.id],
  }),
}));

export const upiPaymentsRelations = relations(upiPayments, ({ one }) => ({
  user: one(users, {
    fields: [upiPayments.userId],
    references: [users.id],
  }),
  verifiedByUser: one(users, {
    fields: [upiPayments.verifiedBy],
    references: [users.id],
  }),
}));

export const userMessagesRelations = relations(userMessages, ({ one }) => ({
  user: one(users, {
    fields: [userMessages.userId],
    references: [users.id],
  }),
  admin: one(users, {
    fields: [userMessages.adminId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertServiceCategorySchema = createInsertSchema(serviceCategories).omit({
  id: true,
});

export const insertServiceSchema = createInsertSchema(services).omit({
  id: true,
  createdAt: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
});

export const insertReferralSchema = createInsertSchema(referrals).omit({
  id: true,
  createdAt: true,
});

export const supportContacts = pgTable("support_contacts", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // 'whatsapp', 'instagram', 'telegram', 'phone'
  label: text("label").notNull(),
  value: text("value").notNull(), // phone number, username, link
  isActive: boolean("is_active").default(true),
  displayOrder: integer("display_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertSupportContactSchema = createInsertSchema(supportContacts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSupportTicketSchema = createInsertSchema(supportTickets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAdminMessageSchema = createInsertSchema(adminMessages).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAdminSettingSchema = createInsertSchema(adminSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserMessageSchema = createInsertSchema(userMessages).omit({
  id: true,
  createdAt: true,
});

export const insertProviderSchema = createInsertSchema(providers).omit({
  id: true,
  createdAt: true,
});

export const insertPaymentMethodSchema = createInsertSchema(paymentMethods).omit({
  id: true,
  createdAt: true,
});

export const insertCryptoPaymentSchema = createInsertSchema(cryptoPayments).omit({
  id: true,
  createdAt: true,
  confirmedAt: true,
});

export const insertUpiPaymentSchema = createInsertSchema(upiPayments).omit({
  id: true,
  createdAt: true,
  verifiedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type ServiceCategory = typeof serviceCategories.$inferSelect;
export type InsertServiceCategory = z.infer<typeof insertServiceCategorySchema>;
export type Service = typeof services.$inferSelect;
export type InsertService = z.infer<typeof insertServiceSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Referral = typeof referrals.$inferSelect;
export type InsertReferral = z.infer<typeof insertReferralSchema>;
export type SupportTicket = typeof supportTickets.$inferSelect;
export type InsertSupportTicket = z.infer<typeof insertSupportTicketSchema>;
export type Provider = typeof providers.$inferSelect;
export type InsertProvider = z.infer<typeof insertProviderSchema>;
export type PaymentMethod = typeof paymentMethods.$inferSelect;
export type InsertPaymentMethod = z.infer<typeof insertPaymentMethodSchema>;
export type CryptoPayment = typeof cryptoPayments.$inferSelect;
export type InsertCryptoPayment = z.infer<typeof insertCryptoPaymentSchema>;
export type UpiPayment = typeof upiPayments.$inferSelect;
export type InsertUpiPayment = z.infer<typeof insertUpiPaymentSchema>;

export type AdminMessage = typeof adminMessages.$inferSelect;
export type InsertAdminMessage = z.infer<typeof insertAdminMessageSchema>;
export type SupportContact = typeof supportContacts.$inferSelect;
export type InsertSupportContact = z.infer<typeof insertSupportContactSchema>;
export type UserMessage = typeof userMessages.$inferSelect;
export type InsertUserMessage = z.infer<typeof insertUserMessageSchema>;

export type AdminSetting = typeof adminSettings.$inferSelect;
export type InsertAdminSetting = z.infer<typeof insertAdminSettingSchema>;
