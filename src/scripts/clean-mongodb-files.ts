/**
 * Clean MongoDB Files Script
 * Removes base64 file data from MongoDB collections
 *
 * Usage: npm run clean:files
 * or: ts-node -r tsconfig-paths/register src/scripts/clean-mongodb-files.ts
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { config } from "@/config/env.config";
import { SiteSubmission } from "@/modules/siteSubmission/siteSubmission.model";
import { Order } from "@/modules/order/order.model";

// Load environment variables
dotenv.config({ path: path.join(__dirname, "../../.env") });

/**
 * Clean site submission files from MongoDB
 */
const cleanSiteSubmissionFiles = async () => {
  try {
    console.log("🔍 Checking site submissions...");

    const submissions = await SiteSubmission.find({
      "csvFile.data": { $exists: true, $ne: null },
    });

    console.log(
      `📋 Found ${submissions.length} submissions with base64 file data`
    );

    let cleaned = 0;
    for (const submission of submissions) {
      if (submission.csvFile && (submission.csvFile as any).data) {
        // Remove base64 data, keep only metadata if needed
        await SiteSubmission.updateOne(
          { _id: submission._id },
          {
            $unset: { "csvFile.data": "" },
            $set: {
              "csvFile.filePath": null,
              "csvFile.fileName":
                (submission.csvFile as any).name || "removed.csv",
            },
          }
        );
        cleaned++;
        console.log(`✅ Cleaned submission: ${submission._id}`);
      }
    }

    console.log(`✨ Cleaned ${cleaned} site submissions`);
    return cleaned;
  } catch (error) {
    console.error("❌ Error cleaning site submissions:", error);
    throw error;
  }
};

/**
 * Clean order files from MongoDB
 */
const cleanOrderFiles = async () => {
  try {
    console.log("🔍 Checking orders...");

    const orders = await Order.find({
      $or: [
        { "file.data": { $exists: true, $ne: null } },
        { file: { $type: "object" } },
      ],
    });

    console.log(`📋 Found ${orders.length} orders with base64 file data`);

    let cleaned = 0;
    for (const order of orders) {
      if (
        order.file &&
        typeof order.file === "object" &&
        (order.file as any).data
      ) {
        // Remove base64 data
        await Order.updateOne(
          { _id: order._id },
          {
            $unset: { "file.data": "" },
            $set: {
              "file.filePath": null,
              "file.fileName": (order.file as any).name || "removed.pdf",
            },
          }
        );
        cleaned++;
        console.log(`✅ Cleaned order: ${order._id}`);
      }
    }

    console.log(`✨ Cleaned ${cleaned} orders`);
    return cleaned;
  } catch (error) {
    console.error("❌ Error cleaning orders:", error);
    throw error;
  }
};

/**
 * Main function
 */
const main = async () => {
  try {
    console.log("🚀 Starting MongoDB file cleanup...\n");

    // Connect to MongoDB
    await mongoose.connect(config.database.uri);
    console.log("✅ Connected to MongoDB\n");

    // Clean files
    const siteSubmissionsCleaned = await cleanSiteSubmissionFiles();
    console.log("");
    const ordersCleaned = await cleanOrderFiles();

    console.log("\n📊 Summary:");
    console.log(`   Site Submissions: ${siteSubmissionsCleaned} cleaned`);
    console.log(`   Orders: ${ordersCleaned} cleaned`);
    console.log(
      `   Total: ${siteSubmissionsCleaned + ordersCleaned} documents cleaned`
    );

    console.log("\n✅ Cleanup completed successfully!");
  } catch (error) {
    console.error("\n❌ Cleanup failed:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("\n👋 Disconnected from MongoDB");
    process.exit(0);
  }
};

// Run the script
if (require.main === module) {
  main();
}

export { cleanSiteSubmissionFiles, cleanOrderFiles };
