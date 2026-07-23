import { db } from "@/db"
import { movies, categories, movieCategories } from "@/db/schema"
import { eq } from "drizzle-orm"

const TMDB_API_KEY = process.env.TMDB_API_KEY || "892b7c8469f251441be840cf2aeb9d74"
const TMDB_BASE_URL = "https://api.themoviedb.org/3"

function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "")
}

export async function scrapeLastMonthMovies(startPage: number = 1, endPage: number = 10) {
  const apiKey = TMDB_API_KEY
  if (!apiKey) {
    throw new Error("TMDB API Key is missing. Configure it in .env file.")
  }

  const fromPage = Math.max(1, startPage)
  const toPage = Math.max(fromPage, endPage)

  console.log(`Scraping popular movies from TMDB (pages ${fromPage} to ${toPage})...`)

  let totalImported = 0

  try {
    for (let page = fromPage; page <= toPage; page++) {
      // Map virtual page index to TMDB discover request query (TMDB max page limit is 500)
      let discoverUrl = `${TMDB_BASE_URL}/discover/movie?api_key=${apiKey}&sort_by=popularity.desc&page=${page}`
      if (page > 500) {
        const startYear = 2026
        const virtualPageOffset = page - 501
        const yearIndex = Math.floor(virtualPageOffset / 500)
        const targetYear = startYear - yearIndex
        const targetPage = (virtualPageOffset % 500) + 1
        discoverUrl = `${TMDB_BASE_URL}/discover/movie?api_key=${apiKey}&sort_by=popularity.desc&primary_release_year=${targetYear}&page=${targetPage}`
      }
      const res = await fetch(discoverUrl)
      if (!res.ok) {
        console.error(`TMDB Discover failed for page ${page}: ${res.statusText}`)
        break
      }

      const discoverData = await res.json()
      const results = discoverData.results || []
      if (results.length === 0) break

      console.log(`Discovered ${results.length} movies on page ${page}`)

      for (const movieItem of results) {
        const tmdbId = movieItem.id

        // Optimization: Skip fetching detail details if the movie already exists in database
        const [existingMovie] = await db
          .select()
          .from(movies)
          .where(eq(movies.tmdbId, tmdbId))
          .limit(1)

        if (existingMovie) {
          console.log(`Movie with TMDB ID ${tmdbId} already exists. Skipping TMDB fetch.`)
          continue
        }

        // Fetch details including credits and videos in one request
        const detailsUrl = `${TMDB_BASE_URL}/movie/${tmdbId}?api_key=${apiKey}&append_to_response=credits,videos`
        const detailRes = await fetch(detailsUrl)
        if (!detailRes.ok) {
          console.error(`Failed to fetch details for movie ${tmdbId}: ${detailRes.statusText}`)
          continue
        }

        const movieData = await detailRes.json()

        // 1. Process and save categories
        const genreIds: number[] = []
        const movieGenres = movieData.genres || []
        for (const genre of movieGenres) {
          const [existingGenre] = await db
            .select()
            .from(categories)
            .where(eq(categories.tmdbGenreId, genre.id))
            .limit(1)

          let finalGenreId = 0

          if (!existingGenre) {
            const slug = slugify(genre.name)
            try {
              const [inserted] = await db.insert(categories).values({
                tmdbGenreId: genre.id,
                name: genre.name,
                slug: slug,
              }) as any
              finalGenreId = inserted.insertId
            } catch (err) {
              // Concurrency check for slug
              const [found] = await db
                .select()
                .from(categories)
                .where(eq(categories.slug, slug))
                .limit(1)
              if (found) {
                finalGenreId = found.id
              }
            }
          } else {
            finalGenreId = existingGenre.id
          }

          if (finalGenreId > 0) {
            genreIds.push(finalGenreId)
          }
        }

        // 2. Prepare Cast & Crew details
        const castData = (movieData.credits?.cast || []).slice(0, 10).map((c: any) => ({
          id: c.id,
          name: c.name,
          character: c.character,
          profile_path: c.profile_path,
        }))

        const crewData = (movieData.credits?.crew || [])
          .filter((c: any) => c.job === "Director" || c.job === "Writer")
          .slice(0, 5)
          .map((c: any) => ({
            id: c.id,
            name: c.name,
            job: c.job,
            profile_path: c.profile_path,
          }))

        // 3. Prepare videos
        const videoData = (movieData.videos?.results || [])
          .filter((v: any) => v.site === "YouTube" && (v.type === "Trailer" || v.type === "Teaser"))
          .slice(0, 2)
          .map((v: any) => ({
            name: v.name,
            key: v.key,
            site: v.site,
            type: v.type,
          }))

        // 4. Save Movie
        const movieValues = {
          tmdbId: movieData.id,
          title: movieData.title,
          slug: slugify(movieData.title),
          overview: movieData.overview,
          posterPath: movieData.poster_path,
          backdropPath: movieData.backdrop_path,
          releaseDate: movieData.release_date,
          voteAverage: String(movieData.vote_average || "0.0"),
          cast: castData,
          crew: crewData,
          videos: videoData,
        }

        let movieId = 0
        try {
          const [inserted] = await db.insert(movies).values(movieValues) as any
          movieId = inserted.insertId
        } catch (err) {
          movieValues.slug = `${movieValues.slug}-${movieData.id}`
          const [inserted] = await db.insert(movies).values(movieValues) as any
          movieId = inserted.insertId
        }

        // 5. Connect Movie <-> Categories
        await db.delete(movieCategories).where(eq(movieCategories.movieId, movieId))

        for (const catId of genreIds) {
          await db.insert(movieCategories).values({
            movieId,
            categoryId: catId,
          })
        }

        totalImported++
      }
    }
  } catch (err) {
    console.error(`Error scraping TMDB movies:`, err)
  }

  return { success: true, count: totalImported }
}
