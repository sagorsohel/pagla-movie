import { mysqlTable, serial, varchar, timestamp, text, int, decimal, json } from "drizzle-orm/mysql-core"

export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 191 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  role: varchar("role", { length: 50 }).notNull().default("user"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const pages = mysqlTable("pages", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 191 }).notNull().unique(),
  redirectUrl: text("redirect_url"),
  redirectTime: int("redirect_time").notNull().default(5),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const categories = mysqlTable("categories", {
  id: serial("id").primaryKey(),
  tmdbGenreId: int("tmdb_genre_id").unique(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  referralUrl: text("referral_url"),
  modalImage: text("modal_image"),
  topAds: text("top_ads"),
  modalAds: text("modal_ads"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const tags = mysqlTable("tags", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  referralUrl: text("referral_url"),
  modalImage: text("modal_image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const movies = mysqlTable("movies", {
  id: serial("id").primaryKey(),
  tmdbId: int("tmdb_id").notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  overview: text("overview"),
  posterPath: varchar("poster_path", { length: 255 }),
  backdropPath: varchar("backdrop_path", { length: 255 }),
  releaseDate: varchar("release_date", { length: 50 }),
  voteAverage: decimal("vote_average", { precision: 3, scale: 1 }).default("0.0"),
  cast: json("cast"), // Array: [{id, name, character, profile_path}]
  crew: json("crew"), // Array: [{id, name, job, profile_path}]
  videos: json("videos"), // Array: [{name, key, site, type}]
  referralUrl: text("referral_url"),
  modalImage: text("modal_image"),
  redirectUrl: text("redirect_url"),
  redirectTime: int("redirect_time").default(5),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const movieCategories = mysqlTable("movie_categories", {
  id: serial("id").primaryKey(),
  movieId: int("movie_id").notNull(),
  categoryId: int("category_id").notNull(),
})

export const movieTags = mysqlTable("movie_tags", {
  id: serial("id").primaryKey(),
  movieId: int("movie_id").notNull(),
  tagId: int("tag_id").notNull(),
})
