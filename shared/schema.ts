import { pgTable, text, serial, integer, boolean, timestamp, decimal, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./models/auth";
import { relations } from "drizzle-orm";

export * from "./models/auth";

// === TABLE DEFINITIONS ===

export const listings = pgTable("listings", {
  id: serial("id").primaryKey(),
  landlordId: text("landlord_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  address: text("address").notNull(),
  location: text("location").notNull(), // City/Area
  coordinates: jsonb("coordinates").$type<{lat: number, lng: number}>(), // For map
  features: jsonb("features").$type<string[]>(), // e.g. ["Wifi", "Parking"]
  images: jsonb("images").$type<string[]>().notNull(), // Array of image URLs
  status: text("status", { enum: ["available", "rented"] }).default("available").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const applications = pgTable("applications", {
  id: serial("id").primaryKey(),
  listingId: integer("listing_id").notNull().references(() => listings.id),
  tenantId: text("tenant_id").notNull().references(() => users.id),
  status: text("status", { enum: ["pending", "accepted", "rejected"] }).default("pending").notNull(),
  message: text("message"), // Note from tenant
  createdAt: timestamp("created_at").defaultNow(),
});

// === RELATIONS ===

export const usersRelations = relations(users, ({ many }) => ({
  listings: many(listings),
  applications: many(applications),
}));

export const listingsRelations = relations(listings, ({ one, many }) => ({
  landlord: one(users, {
    fields: [listings.landlordId],
    references: [users.id],
  }),
  applications: many(applications),
}));

export const applicationsRelations = relations(applications, ({ one }) => ({
  listing: one(listings, {
    fields: [applications.listingId],
    references: [listings.id],
  }),
  tenant: one(users, {
    fields: [applications.tenantId],
    references: [users.id],
  }),
}));

// === BASE SCHEMAS ===

export const insertListingSchema = createInsertSchema(listings).omit({ 
  id: true, 
  createdAt: true,
  landlordId: true // Set by backend
});

export const insertApplicationSchema = createInsertSchema(applications).omit({
  id: true,
  createdAt: true,
  tenantId: true, // Set by backend
  status: true // Default to pending
});

// === EXPLICIT API CONTRACT TYPES ===

export type Listing = typeof listings.$inferSelect;
export type InsertListing = z.infer<typeof insertListingSchema>;
export type Application = typeof applications.$inferSelect;
export type InsertApplication = z.infer<typeof insertApplicationSchema>;

export type CreateListingRequest = InsertListing;
export type UpdateListingRequest = Partial<InsertListing>;

// Response types
export type ListingWithLandlord = Listing & { landlord: User };
export type ApplicationWithDetails = Application & { listing: Listing, tenant: User };

