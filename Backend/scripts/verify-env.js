require("dotenv").config();

console.log("Environment Variables Check:");
console.log(
  "TWO_FACTOR_API_KEY:",
  process.env.TWO_FACTOR_API_KEY ? "Set" : "Not Set"
);
console.log("NODE_ENV:", process.env.NODE_ENV);

if (!process.env.TWO_FACTOR_API_KEY) {
  console.error("ERROR: TWO_FACTOR_API_KEY is not set!");
  process.exit(1);
}

console.log("All required environment variables are set!");
