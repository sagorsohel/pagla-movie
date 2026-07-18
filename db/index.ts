import { drizzle } from "drizzle-orm/mysql2"
import mysql from "mysql2/promise"
import * as schema from "./schema"
import dns from "dns"

// Force Node.js to prioritize IPv4 (127.0.0.1) over IPv6 (::1) when resolving localhost
if (typeof dns.setDefaultResultOrder === "function") {
  dns.setDefaultResultOrder("ipv4first")
}

const dbHost = process.env.DB_HOST || "127.0.0.1"
const dbPort = process.env.DB_PORT || "3306"
const dbUser = process.env.DB_USER || "root"
const dbPassword = process.env.DB_PASSWORD || ""
const dbName = process.env.DB_NAME || "pagla_movie"

if (!process.env.DATABASE_URL) {
  const encodedPassword = encodeURIComponent(dbPassword)
  process.env.DATABASE_URL = `mysql://${dbUser}:${encodedPassword}@${dbHost}:${dbPort}/${dbName}`
}

let poolConnection: mysql.Pool

try {
  poolConnection = mysql.createPool({
    host: dbHost,
    port: parseInt(dbPort),
    user: dbUser,
    password: dbPassword,
    database: dbName,
  })
} catch (err) {
  poolConnection = mysql.createPool(process.env.DATABASE_URL!)
}

export const db = drizzle(poolConnection, { schema, mode: "default" })

// Auto-run schema setup and admin seeding
async function initializeDatabase() {
  try {
    // Ensure the database exists before establishing connection pool queries
    const tempConnection = await mysql.createConnection({
      host: dbHost,
      port: parseInt(dbPort),
      user: dbUser,
      password: dbPassword,
    })
    await tempConnection.execute(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`)
    await tempConnection.end()
    console.log(`Database '${dbName}' verified or created.`)

    const connection = await poolConnection.getConnection()
    console.log("Database connected. Running auto-initialization...")

    // 1. Create users table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS \`users\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`email\` VARCHAR(191) NOT NULL UNIQUE,
        \`password\` VARCHAR(255) NOT NULL,
        \`role\` VARCHAR(50) NOT NULL DEFAULT 'user',
        \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `)

    // 2. Create pages table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS \`pages\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`title\` VARCHAR(255) NOT NULL,
        \`slug\` VARCHAR(191) NOT NULL UNIQUE,
        \`redirect_url\` TEXT NULL,
        \`redirect_time\` INT NOT NULL DEFAULT 5,
        \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `)

    // 3. Seed admin user
    const adminEmail = "admin@gmail.com"
    const adminPass = "sohoj@sohoj"

    const [rows] = await connection.execute(
      "SELECT id FROM users WHERE email = ?",
      [adminEmail]
    )

    if ((rows as any[]).length === 0) {
      console.log(`Seeding admin user: ${adminEmail}`)
      const hashedPassword = await import("bcryptjs").then((m) => m.default.hash(adminPass, 10))
      await connection.execute(
        "INSERT INTO users (email, password, role) VALUES (?, ?, ?)",
        [adminEmail, hashedPassword, "admin"]
      )
      console.log("Admin user seeded successfully!")
    }

    connection.release()
  } catch (err) {
    console.error("Database auto-initialization failed:", err)
  }
}

// Trigger initialization in background on import
initializeDatabase()
