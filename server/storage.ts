import { db } from "./db";
import {
  users, listings, applications,
  type User, type InsertUser, type UpdateListingRequest, type CreateListingRequest,
  type Listing, type Application, type InsertApplication
} from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";

export interface IStorage {
  // Listings
  getListings(filters?: { search?: string, location?: string, minPrice?: number, maxPrice?: number }): Promise<(Listing & { landlord: User })[]>;
  getListing(id: number): Promise<(Listing & { landlord: User }) | undefined>;
  createListing(listing: CreateListingRequest): Promise<Listing>;
  updateListing(id: number, updates: UpdateListingRequest): Promise<Listing>;
  deleteListing(id: number): Promise<void>;

  // Applications
  createApplication(app: InsertApplication): Promise<Application>;
  getApplicationsByListing(listingId: number): Promise<(Application & { tenant: User })[]>;
  getApplicationsByTenant(tenantId: string): Promise<(Application & { listing: Listing })[]>;
  updateApplicationStatus(id: number, status: "accepted" | "rejected"): Promise<Application | undefined>;
  
  // User Profile
  updateUserProfile(userId: string, updates: Partial<User>): Promise<User | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getListings(filters?: { search?: string, location?: string, minPrice?: number, maxPrice?: number }): Promise<(Listing & { landlord: User })[]> {
    let query = db.select({
      listing: listings,
      landlord: users,
    })
    .from(listings)
    .innerJoin(users, eq(listings.landlordId, users.id))
    .orderBy(desc(listings.createdAt));

    // Basic in-memory filtering for simplicity or add where clauses if needed.
    // Drizzle query builder is better but let's fetch and filter for now if complex, 
    // or add simple where clauses.
    
    // Implementing dynamic where clauses with drizzle is verbose without helper, 
    // for MVP fetching all and filtering in memory is okay for small data, 
    // but let's try to add at least status=available check.
    
    // Actually, let's just return all and let frontend filter or basic SQL filter.
    const results = await query;
    
    let filtered = results.map(r => ({ ...r.listing, landlord: r.landlord }));

    if (filters) {
      if (filters.search) {
        const lowerSearch = filters.search.toLowerCase();
        filtered = filtered.filter(l => 
          l.title.toLowerCase().includes(lowerSearch) || 
          l.description.toLowerCase().includes(lowerSearch)
        );
      }
      if (filters.location) {
        filtered = filtered.filter(l => l.location.toLowerCase().includes(filters.location!.toLowerCase()));
      }
      if (filters.minPrice) {
        filtered = filtered.filter(l => Number(l.price) >= filters.minPrice!);
      }
      if (filters.maxPrice) {
        filtered = filtered.filter(l => Number(l.price) <= filters.maxPrice!);
      }
    }
    
    return filtered;
  }

  async getListing(id: number): Promise<(Listing & { landlord: User }) | undefined> {
    const [result] = await db.select({
      listing: listings,
      landlord: users,
    })
    .from(listings)
    .innerJoin(users, eq(listings.landlordId, users.id))
    .where(eq(listings.id, id));

    if (!result) return undefined;
    return { ...result.listing, landlord: result.landlord };
  }

  async createListing(listing: CreateListingRequest): Promise<Listing> {
    const [newListing] = await db.insert(listings).values(listing).returning();
    return newListing;
  }

  async updateListing(id: number, updates: UpdateListingRequest): Promise<Listing> {
    const [updated] = await db.update(listings)
      .set(updates)
      .where(eq(listings.id, id))
      .returning();
    return updated;
  }

  async deleteListing(id: number): Promise<void> {
    await db.delete(listings).where(eq(listings.id, id));
  }

  async createApplication(app: InsertApplication): Promise<Application> {
    const [newApp] = await db.insert(applications).values(app).returning();
    return newApp;
  }

  async getApplicationsByListing(listingId: number): Promise<(Application & { tenant: User })[]> {
    const results = await db.select({
      application: applications,
      tenant: users,
    })
    .from(applications)
    .innerJoin(users, eq(applications.tenantId, users.id))
    .where(eq(applications.listingId, listingId));

    return results.map(r => ({ ...r.application, tenant: r.tenant }));
  }

  async getApplicationsByTenant(tenantId: string): Promise<(Application & { listing: Listing })[]> {
    const results = await db.select({
      application: applications,
      listing: listings,
    })
    .from(applications)
    .innerJoin(listings, eq(applications.listingId, listings.id))
    .where(eq(applications.tenantId, tenantId));

    return results.map(r => ({ ...r.application, listing: r.listing }));
  }

  async updateApplicationStatus(id: number, status: "accepted" | "rejected"): Promise<Application | undefined> {
    const [updated] = await db.update(applications)
      .set({ status })
      .where(eq(applications.id, id))
      .returning();
    return updated;
  }
  
  async updateUserProfile(userId: string, updates: Partial<User>): Promise<User | undefined> {
    const [updated] = await db.update(users)
      .set(updates)
      .where(eq(users.id, userId))
      .returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
