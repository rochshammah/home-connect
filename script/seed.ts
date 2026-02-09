import { db } from "../server/db";
import { users, listings } from "@shared/schema";
import { eq } from "drizzle-orm";

async function seed() {
  console.log("Seeding database...");

  // Create a landlord user if not exists (using upsert logic)
  // Since we don't have replit auth mechanism here to gen random IDs easily matched,
  // we'll just insert and ignore conflicts or check existence.
  // Actually, we'll create a dummy user with a known ID for testing if possible,
  // but IDs are random UUIDs.
  // We'll insert a user and use their ID.
  
  // Note: users.id is default random uuid.
  
  const landlordEmail = "landlord@example.com";
  let landlordId = "";
  
  // Check if landlord exists
  const existingLandlord = await db.select().from(users).where(eq(users.email, landlordEmail)).limit(1);
  
  if (existingLandlord.length > 0) {
    landlordId = existingLandlord[0].id;
    console.log("Found existing landlord:", landlordId);
  } else {
    const [landlord] = await db.insert(users).values({
      email: landlordEmail,
      firstName: "John",
      lastName: "Doe",
      username: "john_landlord",
      profileImageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
      role: "landlord",
      bio: "Experienced landlord with premium properties.",
      phoneNumber: "555-0101"
    }).returning();
    landlordId = landlord.id;
    console.log("Created landlord:", landlordId);
  }

  // Create listings
  const existingListings = await db.select().from(listings).limit(1);
  if (existingListings.length === 0) {
    await db.insert(listings).values([
      {
        landlordId,
        title: "Modern Apartment in Downtown",
        description: "A beautiful 2-bedroom apartment with city views, modern amenities, and close to public transport.",
        price: "2500.00",
        address: "123 Main St, New York, NY",
        location: "New York",
        coordinates: { lat: 40.7128, lng: -74.0060 },
        features: ["Wifi", "Gym", "Pool", "Parking"],
        images: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267", "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688"],
        status: "available"
      },
      {
        landlordId,
        title: "Cozy Studio near Park",
        description: "Perfect for students or singles. Quiet neighborhood, fully furnished.",
        price: "1200.00",
        address: "456 Park Ave, Brooklyn, NY",
        location: "Brooklyn",
        coordinates: { lat: 40.6782, lng: -73.9442 },
        features: ["Furnished", "Utilities Included"],
        images: ["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2"],
        status: "available"
      },
      {
        landlordId,
        title: "Luxury Villa with Ocean View",
        description: "Experience luxury living in this 5-bedroom villa with private beach access.",
        price: "8000.00",
        address: "789 Ocean Dr, Miami, FL",
        location: "Miami",
        coordinates: { lat: 25.7617, lng: -80.1918 },
        features: ["Beach Access", "Private Pool", "Garage", "Security System"],
        images: ["https://images.unsplash.com/photo-1613977257363-707ba9348227", "https://images.unsplash.com/photo-1512917774080-9991f1c4c750"],
        status: "available"
      }
    ]);
    console.log("Seeded listings.");
  } else {
    console.log("Listings already exist.");
  }

  console.log("Seeding complete.");
}

seed().catch(console.error);
