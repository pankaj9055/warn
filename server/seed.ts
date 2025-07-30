import { db } from "./db";
import { users, serviceCategories, services, paymentMethods } from "@shared/schema";
import bcrypt from "bcrypt";

async function seed() {
  console.log("🌱 Starting database seed...");

  try {
    // Clear existing data
    await db.delete(services);
    await db.delete(serviceCategories);
    await db.delete(paymentMethods);
    await db.delete(users);

    // Create test users
    const hashedAdminPassword = await bcrypt.hash("admin123", 10);
    const hashedUserPassword = await bcrypt.hash("user123", 10);

    const [adminUser] = await db.insert(users).values({
      username: "admin",
      email: "admin@jksmm.com",
      password: hashedAdminPassword,
      plainTextPassword: "admin123",
      walletBalance: "500.00",
      isAdmin: true,
      referralCode: "ADMIN001",
    }).returning();

    const [testUser] = await db.insert(users).values({
      username: "testuser",
      email: "testuser@jksmm.com",
      password: hashedUserPassword,
      plainTextPassword: "user123",
      walletBalance: "100.00",
      isAdmin: false,
      referralCode: "USER001",
    }).returning();

    console.log("✅ Created test users:");
    console.log(`  - Admin: username: admin, password: admin123`);
    console.log(`  - User: username: testuser, password: user123`);

    // Create service categories
    const categories = [
      { name: "Instagram", slug: "instagram", icon: "📸", color: "#E4405F", isActive: true },
      { name: "YouTube", slug: "youtube", icon: "📺", color: "#FF0000", isActive: true },
      { name: "TikTok", slug: "tiktok", icon: "🎵", color: "#000000", isActive: true },
      { name: "Facebook", slug: "facebook", icon: "📘", color: "#1877F2", isActive: true },
      { name: "Twitter", slug: "twitter", icon: "🐦", color: "#1DA1F2", isActive: true },
    ];

    const insertedCategories = await db.insert(serviceCategories).values(categories).returning();
    console.log(`✅ Created ${insertedCategories.length} service categories`);

    // Create sample services
    const sampleServices = [
      {
        categoryId: insertedCategories[0].id, // Instagram
        name: "Instagram Followers",
        description: "High quality Instagram followers",
        pricePerThousand: "0.50",
        minQuantity: 100,
        maxQuantity: 10000,
        isActive: true,
        providerId: null,
        providerServiceId: null,
      },
      {
        categoryId: insertedCategories[0].id, // Instagram
        name: "Instagram Likes",
        description: "Real Instagram likes for posts",
        pricePerThousand: "0.30",
        minQuantity: 50,
        maxQuantity: 5000,
        isActive: true,
        providerId: null,
        providerServiceId: null,
      },
      {
        categoryId: insertedCategories[1].id, // YouTube
        name: "YouTube Views",
        description: "High retention YouTube views",
        pricePerThousand: "1.20",
        minQuantity: 500,
        maxQuantity: 50000,
        isActive: true,
        providerId: null,
        providerServiceId: null,
      },
    ];

    const insertedServices = await db.insert(services).values(sampleServices).returning();
    console.log(`✅ Created ${insertedServices.length} sample services`);

    // Create payment methods
    const paymentMethodsData = [
      { name: "UPI", type: "upi", isActive: true },
      { name: "Paytm", type: "wallet", isActive: true },
      { name: "PhonePe", type: "wallet", isActive: true },
      { name: "Bank Transfer", type: "bank", isActive: true },
    ];

    const insertedPaymentMethods = await db.insert(paymentMethods).values(paymentMethodsData).returning();
    console.log(`✅ Created ${insertedPaymentMethods.length} payment methods`);

    console.log("🎉 Database seeded successfully!");
    
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

// Run seed if this file is executed directly
if (import.meta.url.endsWith(process.argv[1])) {
  seed()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { seed };