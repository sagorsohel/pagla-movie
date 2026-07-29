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
  slug: varchar("slug", { length: 191 }).unique(),
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
  topAds: text("top_ads"),
  modalAds: text("modal_ads"),
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

export const ads = mysqlTable("ads", {
  id: varchar("id", { length: 50 }).primaryKey(),
  heroAds: text("hero_ads"),
  hero2Ads: text("hero2_ads"),
  modalAds: text("modal_ads"),
  headerAds: text("header_ads"),
  membershipRefLink: text("membership_ref_link"),
  signinRefLink: text("signin_ref_link"),
  globalBg: text("global_bg"),
  floatingAds: text("floating_ads"),
  floatingAdsStatus: varchar("floating_ads_status", { length: 10 }).default("on"),
  floatingDesktopAds: text("floating_desktop_ads"),
  floatingDesktopAdsStatus: varchar("floating_desktop_ads_status", { length: 10 }).default("on"),
  layoutOrder: text("layout_order"),
  footerAds: text("footer_ads"),
  signupRedirectUrl: text("signup_redirect_url"),
  signupRedirectTime: int("signup_redirect_time").default(5),
  signupRedirectTimeUnit: varchar("signup_redirect_time_unit", { length: 10 }).default("sec"),
})

export const customAds = mysqlTable("custom_ads", {
  id: varchar("id", { length: 191 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  code: text("code"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})
