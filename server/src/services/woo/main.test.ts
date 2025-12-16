import "dotenv/config";
import { pathToFileURL } from "node:url";
import { listarExcursionesWoo } from "./main.js";

async function runWooTest() {
  try {
    const response = await listarExcursionesWoo({ per_page: 5 });
    console.log("WooCommerce excursion test result:");
    console.log("  total items:", response.pagination.total);
    console.log("  total pages:", response.pagination.totalPages);
    console.log("  returned items:", response.data.length);
    console.log("  sample products:", response.data.map((p) => ({ id: p.id, name: p.name })));
  } catch (error) {
    console.error("Failed to list WooCommerce excursions:", error);
    process.exitCode = 1;
  }
}

const invokedDirectly =
  process.argv[1] !== undefined &&
  pathToFileURL(process.argv[1]).href === import.meta.url;

if (invokedDirectly) {
  runWooTest();
}
