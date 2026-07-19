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

/* eslint-disable no-var */
declare global {
  var db: any
  var poolConnection: mysql.Pool | undefined
  var dbInitialized: boolean | undefined
}
/* eslint-enable no-var */

let poolConnection: mysql.Pool

if (process.env.NODE_ENV === "production") {
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
} else {
  if (!globalThis.poolConnection) {
    try {
      globalThis.poolConnection = mysql.createPool({
        host: dbHost,
        port: parseInt(dbPort),
        user: dbUser,
        password: dbPassword,
        database: dbName,
      })
    } catch (err) {
      globalThis.poolConnection = mysql.createPool(process.env.DATABASE_URL!)
    }
  }
  poolConnection = globalThis.poolConnection!
}

export const db = globalThis.db || drizzle(poolConnection, { schema, mode: "default" })

if (process.env.NODE_ENV !== "production") {
  globalThis.db = db
}

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

    // 3. Create categories table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS \`categories\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`tmdb_genre_id\` INT UNIQUE,
        \`name\` VARCHAR(100) NOT NULL,
        \`slug\` VARCHAR(100) NOT NULL UNIQUE,
        \`referral_url\` TEXT NULL,
        \`modal_image\` TEXT NULL,
        \`top_ads\` TEXT NULL,
        \`modal_ads\` TEXT NULL,
        \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `)

    // Add columns if they do not exist for existing database installations
    try {
      await connection.execute("ALTER TABLE `categories` ADD COLUMN `top_ads` TEXT NULL;")
    } catch (e) {}
    try {
      await connection.execute("ALTER TABLE `categories` ADD COLUMN `modal_ads` TEXT NULL;")
    } catch (e) {}

    // 4. Create tags table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS \`tags\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`name\` VARCHAR(100) NOT NULL,
        \`slug\` VARCHAR(100) NOT NULL UNIQUE,
        \`referral_url\` TEXT NULL,
        \`modal_image\` TEXT NULL,
        \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `)

    // 5. Create movies table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS \`movies\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`tmdb_id\` INT NOT NULL UNIQUE,
        \`title\` VARCHAR(255) NOT NULL,
        \`slug\` VARCHAR(191) NULL UNIQUE,
        \`overview\` TEXT NULL,
        \`poster_path\` VARCHAR(255) NULL,
        \`backdrop_path\` VARCHAR(255) NULL,
        \`release_date\` VARCHAR(50) NULL,
        \`vote_average\` DECIMAL(3,1) DEFAULT '0.0',
        \`cast\` JSON NULL,
        \`crew\` JSON NULL,
        \`videos\` JSON NULL,
        \`referral_url\` TEXT NULL,
        \`modal_image\` TEXT NULL,
        \`top_ads\` TEXT NULL,
        \`modal_ads\` TEXT NULL,
        \`redirect_url\` TEXT NULL,
        \`redirect_time\` INT DEFAULT 5,
        \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `)

    // Safe columns addition for existing database instances
    try {
      await connection.execute("ALTER TABLE `movies` ADD COLUMN `slug` VARCHAR(191) NULL UNIQUE;")
    } catch (e) {}
    try {
      await connection.execute("ALTER TABLE `movies` ADD COLUMN `top_ads` TEXT NULL;")
    } catch (e) {}
    try {
      await connection.execute("ALTER TABLE `movies` ADD COLUMN `modal_ads` TEXT NULL;")
    } catch (e) {}

    // 6. Create movie_categories table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS \`movie_categories\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`movie_id\` INT NOT NULL,
        \`category_id\` INT NOT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `)

    // 7. Create movie_tags table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS \`movie_tags\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`movie_id\` INT NOT NULL,
        \`tag_id\` INT NOT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `)

    // 8. Create ads table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS \`ads\` (
        \`id\` VARCHAR(50) PRIMARY KEY,
        \`hero_ads\` TEXT NULL,
        \`hero2_ads\` TEXT NULL,
        \`modal_ads\` TEXT NULL,
        \`header_ads\` TEXT NULL,
        \`membership_ref_link\` TEXT NULL,
        \`signin_ref_link\` TEXT NULL,
        \`global_bg\` TEXT NULL,
        \`floating_ads\` TEXT NULL,
        \`floating_ads_status\` VARCHAR(10) DEFAULT 'on',
        \`floating_desktop_ads\` TEXT NULL,
        \`floating_desktop_ads_status\` VARCHAR(10) DEFAULT 'on',
        \`layout_order\` TEXT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `)

    // Safe columns addition for existing database instances
    try {
      await connection.execute("ALTER TABLE `ads` ADD COLUMN `floating_desktop_ads` TEXT NULL;")
    } catch (e) {}
    try {
      await connection.execute("ALTER TABLE `ads` ADD COLUMN `floating_desktop_ads_status` VARCHAR(10) DEFAULT 'on';")
    } catch (e) {}
    try {
      await connection.execute("ALTER TABLE `ads` ADD COLUMN `layout_order` TEXT NULL;")
    } catch (e) {}

    // Seed default global ads configurations
    const [adRows] = await connection.execute(
      "SELECT id FROM ads WHERE id = 'global'"
    )
    if ((adRows as any[]).length === 0) {
      console.log("Seeding default global ads configs...")
      await connection.execute(
        "INSERT INTO ads (id, hero_ads, hero2_ads, modal_ads, header_ads, membership_ref_link, signin_ref_link, global_bg, floating_ads, floating_ads_status, floating_desktop_ads, floating_desktop_ads_status, layout_order) VALUES ('global', '', '', '', '', '', '', '', '', 'on', '', 'on', '[\"top-ad\", \"hero\", \"ad-middle\", \"tabs\", \"ad-bottom\"]')"
      )
    }

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

    // 9. Populate movie slugs for any existing records that lack them
    const [movieRows] = await connection.execute(
      "SELECT id, title FROM movies WHERE slug IS NULL OR slug = ''"
    )
    for (const movieRow of movieRows as any[]) {
      const baseSlug = movieRow.title
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^\w\-]+/g, "")
        .replace(/\-\-+/g, "-")
        .replace(/^-+/, "")
        .replace(/-+$/, "") || `movie-${movieRow.id}`

      try {
        await connection.execute(
          "UPDATE movies SET slug = ? WHERE id = ?",
          [baseSlug, movieRow.id]
        )
      } catch (err) {
        await connection.execute(
          "UPDATE movies SET slug = ? WHERE id = ?",
          [`${baseSlug}-${movieRow.id}`, movieRow.id]
        )
      }
    }

    connection.release()
  } catch (err) {
    console.error("Database auto-initialization failed:", err)
  }
}

// Trigger initialization in background on import once
if (!globalThis.dbInitialized) {
  globalThis.dbInitialized = true
  initializeDatabase()
}
