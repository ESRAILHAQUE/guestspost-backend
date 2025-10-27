/**
 * Database Seed Script
 * Populates the database with dummy data for development/testing
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { User } from "@/modules/user/user.model";
import { Package } from "@/modules/package/package.model";
import { BlogPost } from "@/modules/blog/blog.model";
import { Review } from "@/modules/review/review.model";
import { Activity } from "@/modules/activity/activity.model";
import bcrypt from "bcryptjs";

// Load environment variables
dotenv.config({ path: path.join(__dirname, "../../.env") });

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/guestpost_db";

const packages = [
  {
    name: "Starter Package",
    price: 299,
    description:
      "Perfect for small businesses looking to establish their online presence",
    features: [
      "5 High-Quality Guest Posts",
      "DA 30+ Websites",
      "Content Writing Included",
      "Basic SEO Optimization",
      "Monthly Report",
    ],
    popular: false,
    offer: false,
    status: "active" as const,
  },
  {
    name: "Professional Package",
    price: 599,
    description:
      "Ideal for growing businesses that need comprehensive link building",
    features: [
      "10 High-Quality Guest Posts",
      "DA 40+ Websites",
      "Premium Content Writing",
      "Advanced SEO Optimization",
      "Bi-weekly Reports",
      "Social Media Promotion",
    ],
    popular: true,
    offer: false,
    status: "active" as const,
  },
  {
    name: "Enterprise Package",
    price: 1199,
    description:
      "For established businesses requiring maximum authority and reach",
    features: [
      "20 High-Quality Guest Posts",
      "DA 50+ Websites",
      "Expert Content Writing",
      "Full SEO Strategy",
      "Weekly Reports",
      "Social Media Campaign",
      "Dedicated Account Manager",
    ],
    popular: false,
    offer: false,
    status: "active" as const,
  },
];

const blogPosts = [
  {
    title: "10 Essential SEO Strategies for 2024",
    slug: "10-essential-seo-strategies-for-2024",
    content:
      "In this comprehensive guide, we'll explore the most important SEO strategies that will dominate 2024...",
    excerpt:
      "Discover the essential SEO strategies that will help your website rank higher in search results in 2024.",
    author: "admin",
    category: "SEO",
    tags: ["SEO", "Digital Marketing", "Strategy"],
    status: "published" as const,
  },
  {
    title: "How to Build Quality Backlinks in 2024",
    slug: "how-to-build-quality-backlinks-in-2024",
    content:
      "Building quality backlinks is one of the most important aspects of SEO...",
    excerpt:
      "Learn proven strategies for building high-quality backlinks that will boost your SEO rankings.",
    author: "admin",
    category: "SEO",
    tags: ["Backlinks", "SEO", "Link Building"],
    status: "published" as const,
  },
];

const reviews = [
  {
    name: "John Smith",
    company: "TechStart Inc.",
    rating: 5,
    review:
      "Excellent service! The guest posts were high-quality and helped us boost our SEO rankings significantly. Highly recommended!",
    image: "",
  },
  {
    name: "Sarah Johnson",
    company: "Digital Marketing Pro",
    rating: 5,
    review:
      "Amazing experience working with this team. They delivered exactly what they promised and on time. Our traffic increased by 40% in just 2 months!",
    image: "",
  },
  {
    name: "Michael Chen",
    company: "GreenTech Solutions",
    rating: 4,
    review:
      "Great content quality and professional service. The team was responsive and helpful throughout the process. Would definitely work with them again.",
    image: "",
  },
  {
    name: "Emily Davis",
    company: "Content Creators Hub",
    rating: 5,
    review:
      "Outstanding results! The backlinks we received are from high-authority sites and have significantly improved our domain authority. Worth every penny!",
    image: "",
  },
  {
    name: "David Brown",
    company: "Startup Ventures",
    rating: 5,
    review:
      "Best investment we made for our digital marketing strategy. Professional service, great communication, and exceptional results. Can't thank them enough!",
    image: "",
  },
];

const activities = [
  {
    userId: "admin",
    userName: "Admin User",
    type: "order" as const,
    action: "New Order Created",
    description: "User placed a new order for Guest Post Package",
  },
  {
    userId: "admin",
    userName: "Admin User",
    type: "user" as const,
    action: "New User Registered",
    description: "A new user registered to the platform",
  },
  {
    userId: "admin",
    userName: "Admin User",
    type: "website" as const,
    action: "Website Added",
    description: "A new website was added to the catalog",
  },
  {
    userId: "admin",
    userName: "Admin User",
    type: "fund_request" as const,
    action: "Fund Request Submitted",
    description: "User submitted a fund withdrawal request",
  },
  {
    userId: "admin",
    userName: "Admin User",
    type: "site_submission" as const,
    action: "Site Submission Received",
    description: "A new site submission was received",
  },
];

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✓ Connected to MongoDB");

    // Seed data is now optional - only admin user creation

    // Uncomment the following lines if you want to seed dummy data:
    /*
    console.log("\nClearing existing data...");
    await Package.deleteMany({});
    await BlogPost.deleteMany({});
    await Review.deleteMany({});
    await Activity.deleteMany({});
    console.log("✓ Cleared existing data");

    // Seed Packages
    console.log("\nSeeding packages...");
    const createdPackages = await Package.insertMany(packages);
    console.log(`✓ Created ${createdPackages.length} packages`);

    // Seed Blog Posts
    console.log("\nSeeding blog posts...");
    const createdPosts = await BlogPost.insertMany(blogPosts);
    console.log(`✓ Created ${createdPosts.length} blog posts`);

    // Seed Reviews
    console.log("\nSeeding reviews...");
    const createdReviews = await Review.insertMany(reviews);
    console.log(`✓ Created ${createdReviews.length} reviews`);

    // Seed Activities
    console.log("\nSeeding activities...");
    const createdActivities = await Activity.insertMany(activities);
    console.log(`✓ Created ${createdActivities.length} activities`);
    */

    // Check if admin user exists
    const adminExists = await User.findOne({
      user_email: "esrailbblhs@gmail.com",
    });

    if (!adminExists) {
      console.log("\nCreating admin user...");
      const hashedPassword = await bcrypt.hash("Esr@il2865", 12);
      await User.create({
        user_nicename: "Admin User",
        user_email: "esrailbblhs@gmail.com",
        user_pass: hashedPassword,
        role: "admin",
        user_status: "active",
        balance: 0,
      });
      console.log("✓ Created admin user");
    } else {
      console.log("✓ Admin user already exists");
    }

    console.log("\n✅ Database seeding completed successfully!");
    console.log("\nLogin Credentials:");
    console.log("Email: esrailbblhs@gmail.com");
    console.log("Password: Esr@il2865");

    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

// Run the seed function
seedDatabase();
// Enhanced seeding script
