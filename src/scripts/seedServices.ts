/**
 * Seed Services Script
 * Seeds default services into the database
 */

import mongoose from "mongoose";
import { Service } from "../modules/service/service.model";
import { logger } from "../utils/logger";

const defaultServices = [
  {
    title: "Article Writing",
    description:
      "Professional content creation with SEO optimization and engaging storytelling for your target audience.",
    icon: "CheckCircle",
    status: "active",
    order: 1,
  },
  {
    title: "HOTH Link Insertions",
    description:
      "Strategic link placement in existing high-authority content to boost your website's domain authority.",
    icon: "Zap",
    status: "active",
    order: 2,
  },
  {
    title: "HOTH Digital PR",
    description:
      "Comprehensive digital PR campaigns to increase brand visibility and earn high-quality backlinks.",
    icon: "Award",
    status: "active",
    order: 3,
  },
  {
    title: "Content Syndication",
    description:
      "Distribute your content across multiple high-authority platforms to maximize reach and engagement.",
    icon: "Users",
    status: "active",
    order: 4,
  },
  {
    title: "Press Releases",
    description:
      "Professional press release writing and distribution to major news outlets and industry publications.",
    icon: "Shield",
    status: "active",
    order: 5,
  },
];

async function seedServices() {
  try {
    // Connect to MongoDB
    const mongoUri =
      process.env.MONGODB_URI || "mongodb://localhost:27017/guestpost";
    await mongoose.connect(mongoUri);
    logger.info("Connected to MongoDB");

    // Clear existing services
    await Service.deleteMany({});
    logger.info("Cleared existing services");

    // Insert default services
    const services = await Service.insertMany(defaultServices);
    logger.success(`Successfully seeded ${services.length} services`);

    // Log the seeded services
    services.forEach((service) => {
      logger.info(`- ${service.title}`);
    });

    // Close connection
    await mongoose.connection.close();
    logger.success("Database connection closed");
    process.exit(0);
  } catch (error) {
    logger.error("Error seeding services:", error);
    process.exit(1);
  }
}

seedServices();


