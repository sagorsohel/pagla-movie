# TMDB API Integration Guide (বাংলা গাইড)

এই গাইডে TMDB (The Movie Database) API-এর মূল এন্ডপয়েন্টসমূহ, তাদের প্যারামিটার, রেসপন্স ফরম্যাট এবং কিভাবে সেগুলো ব্যবহার করবেন তা বিস্তারিত আলোচনা করা হয়েছে।

---

## ১. বেসিক কনফিগারেশন (Base Setup)

TMDB-এর সব API রিকোয়েস্টের জন্য একটি বেস ইউআরএল (Base URL) এবং ইমেজ দেখানোর জন্য একটি ইমেজ ইউআরএল (Image URL) ব্যবহার করতে হয়।

*   **API Base URL:** `https://api.themoviedb.org/3`
*   **Image Base URL:** `https://image.tmdb.org/t/p/<size>/`
    *   সাধারণত ব্যবহৃত সাইজগুলো: `w200` (ছোট পোস্টার), `w500` (মাঝারি পোস্টার), `w1280` (ব্যানার/ব্যাকড্রপ), এবং `original` (আসল কোয়ালিটি)।
    *   **উদাহরণ:** যদি এপিআই থেকে পোস্টার পাথ `"backdrop_path": "/dqK73aII0t4mC4z45564.jpg"` পান, তবে সম্পূর্ণ ইমেজ ইউআরএল হবে:  
        `https://image.tmdb.org/t/p/w500/dqK73aII0t4mC4z45564.jpg`

### রিকোয়েস্ট হেডার (Headers):
API কল করার সময় হেডার হিসেবে Bearer Token ব্যবহার করা সবচেয়ে নিরাপদ এবং সহজ:
```http
Authorization: Bearer YOUR_TMDB_READ_ACCESS_TOKEN
accept: application/json
```
অথবা কুয়েরি প্যারামিটার হিসেবে API Key পাঠাতে পারেন: `?api_key=YOUR_API_KEY`

---

## ২. জেনার / ক্যাটাগরি (Genres & Categories)

মুভি এবং টিভি শো-এর ক্যাটাগরি বা জেনার আইডি ও নামের তালিকা পাওয়ার জন্য এই এন্ডপয়েন্টগুলো ব্যবহার করতে হবে।

### ক. মুভি জেনার লিস্ট (Movie Genre List)
*   **Endpoint:** `/genre/movie/list`
*   **Method:** `GET`
*   **Query Params:** `language=en` (অথবা অন্য কোনো ভাষা)
*   **Response Format:**
```json
{
  "genres": [
    { "id": 28, "name": "Action" },
    { "id": 12, "name": "Adventure" },
    { "id": 35, "name": "Comedy" }
  ]
}
```

### খ. টিভি শো জেনার লিস্ট (TV Genre List)
*   **Endpoint:** `/genre/tv/list`
*   **Method:** `GET`
*   **Response Format:** মুভি জেনারের মতোই আইডি ও নামের লিস্ট পাবেন।

---

## ৩. মুভি ফিচার ও লিস্ট (Movie Lists)

### ক. টপ রেটেড মুভি (Top Rated Movies)
সবচেয়ে বেশি রেটিং পাওয়া মুভিগুলোর তালিকা।
*   **Endpoint:** `/movie/top_rated`
*   **Method:** `GET`
*   **Query Params:** `page=1` (পেজিনেশন সাপোর্ট করে, প্রতি পেজে ২০টি রেজাল্ট থাকে)
*   **Response Structure:**
```json
{
  "page": 1,
  "results": [
    {
      "id": 278,
      "title": "The Shawshank Redemption",
      "overview": "Imprisoned in the 1940s for the double murder of his wife and her lover...",
      "poster_path": "/9cq3Q48y7yURG476RL561NW5.jpg",
      "backdrop_path": "/kXfqK2UBuQQypy04ck2nVUsPT1t.jpg",
      "genre_ids": [18, 80],
      "release_date": "1994-09-23",
      "vote_average": 8.7,
      "vote_count": 26800
    }
  ],
  "total_pages": 490,
  "total_results": 9784
}
```

### খ. আপকামিং মুভি (Upcoming Movies)
যেসব মুভি সামনে রিলিজ হতে যাচ্ছে।
*   **Endpoint:** `/movie/upcoming`
*   **Method:** `GET`
*   **Query Params:** `page=1`

### গ. জনপ্রিয় মুভি (Popular Movies)
বর্তমানে ট্রেন্ডিং ও জনপ্রিয় মুভির তালিকা।
*   **Endpoint:** `/movie/popular`
*   **Method:** `GET`

### ঘ. বর্তমানে সিনেমা হলে চলা মুভি (Now Playing Movies)
*   **Endpoint:** `/movie/now_playing`
*   **Method:** `GET`

---

## ৪. টিভি শো ফিচার ও লিস্ট (TV Show Lists)

টিভি সিরিজের জন্য এন্ডপয়েন্টগুলো নিচে দেওয়া হলো:

### ক. জনপ্রিয় টিভি শো (Popular TV Shows)
*   **Endpoint:** `/tv/popular`
*   **Method:** `GET`
*   **Response Structure:**
```json
{
  "page": 1,
  "results": [
    {
      "id": 94605,
      "name": "Arcane",
      "original_name": "Arcane",
      "overview": "Amidst the escalating discords of twin cities Piltover and Zaun...",
      "poster_path": "/fqld424aZqd3n57XY30n1g794X.jpg",
      "backdrop_path": "/c8pI9N48g52Sih7D58vJ4294X.jpg",
      "genre_ids": [16, 10765, 10759, 18],
      "first_air_date": "2021-11-06",
      "vote_average": 8.7
    }
  ]
}
```
> **উল্লেখ্য:** মুভির ক্ষেত্রে `title` এবং `release_date` থাকে, আর টিভি শো-এর ক্ষেত্রে `name` এবং `first_air_date` থাকে।

### খ. টপ রেটেড টিভি শো (Top Rated TV Shows)
*   **Endpoint:** `/tv/top_rated`
*   **Method:** `GET`

### গ. আজকে এয়ার হবে এমন টিভি শো (Airing Today TV Shows)
*   **Endpoint:** `/tv/airing_today`
*   **Method:** `GET`

### ঘ. বর্তমানে অন-এয়ার টিভি শো (On The Air TV Shows)
*   **Endpoint:** `/tv/on_the_air`
*   **Method:** `GET`

---

## ৫. নির্দিষ্ট মুভি/টিভি শো এর বিস্তারিত (Single Content Details)

যেকোনো নির্দিষ্ট মুভি বা টিভি শো-এর ওপর ক্লিক করলে তার সম্পূর্ণ তথ্য পেতে এই এপিআইগুলো কল করতে হবে।

### ক. সিঙ্গেল মুভি ডিটেইলস (Movie Details)
*   **Endpoint:** `/movie/{movie_id}`
*   **Method:** `GET`
*   **Response:** বাজেট, রেভিনিউ, ট্যাগলাইন, জেনারের নামসহ সম্পূর্ণ বিস্তারিত ডেটা পাওয়া যাবে।

### খ. সিঙ্গেল টিভি শো ডিটেইলস (TV Show Details)
*   **Endpoint:** `/tv/{series_id}`
*   **Method:** `GET`
*   **Response:** সিজন এবং এপিসোডের তালিকা ও নেটওয়ার্কের বিস্তারিত তথ্য।

### গ. কাস্ট ও ক্রু (Credits - Actors, Directors)
*   **মুভির জন্য:** `/movie/{movie_id}/credits`
*   **টিভি শো-র জন্য:** `/tv/{series_id}/aggregate_credits`
*   **Response:** অভিনয়শিল্পীদের নাম, চরিত্র (Character) এবং প্রোফাইল পিকচার পাওয়া যাবে।

### ঘ. ট্রেইলার ও ভিডিও (Videos)
*   **মুভির জন্য:** `/movie/{movie_id}/videos`
*   **টিভি শো-র জন্য:** `/tv/{series_id}/videos`
*   **Response:** ইউটিউবের ভিডিও কী (`key`) পাওয়া যাবে, যা দিয়ে আইফ্রেম প্লেয়ার চালানো সম্ভব।
```json
{
  "results": [
    {
      "name": "Official Trailer",
      "key": "dQw4w9WgXcQ", // ইউটিউব ভিডিও কী
      "site": "YouTube",
      "type": "Trailer"
    }
  ]
}
```
**ইউটিউব ভিডিও ইউআরএল:** `https://www.youtube.com/watch?v=dQw4w9WgXcQ` অথবা এম্বেড ইউআরএল `https://www.youtube.com/embed/dQw4w9WgXcQ`

---

## ৬. সার্চ এবং ডিসকভারি (Search & Discover)

### ক. সার্চ বার (Search Movie/TV)
*   **মুভি সার্চ:** `/search/movie?query=Avatar&page=1`
*   **টিভি সার্চ:** `/search/tv?query=Squid Game&page=1`
*   **মাল্টি সার্চ (মুভি, টিভি, কাস্ট একসাথে):** `/search/multi?query=Christopher Nolan`

### খ. ডিসকভার / ফিল্টারিং (Discover - অত্যন্ত গুরুত্বপূর্ণ)
জেনার বা নির্দিষ্ট বছরের ওপর ভিত্তি করে মুভি/টিভি ফিল্টার করতে চাইলে এটি ব্যবহার করা হয়।
*   **Endpoint (Movie):** `/discover/movie`
*   **প্যারামিটার সমূহ:**
    *   `with_genres=28`: শুধুমাত্র অ্যাকশন মুভি (Action Genre ID = 28)।
    *   `sort_by=popularity.desc`: জনপ্রিয়তা অনুযায়ী সাজানো (অথবা `vote_average.desc`)।
    *   `primary_release_year=2024`: ২০২৪ সালের মুভি।
*   **উদাহরণ ইউআরএল:** `/discover/movie?with_genres=28&sort_by=popularity.desc` (অ্যাকশন ক্যাটাগরির জনপ্রিয় মুভিগুলো আনবে)।

---

## ৭. জাভাস্ক্রিপ্ট/টাইপস্ক্রিপ্ট ইন্টিগ্রেশন কোড (React/Next.js Example)

আপনার প্রজেক্টে এপিআই কল করার জন্য একটি হেল্পার ফাংশন তৈরি করতে পারেন:

```typescript
// lib/tmdb.ts

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_TOKEN = process.env.NEXT_PUBLIC_TMDB_TOKEN; // আপনার .env ফাইলে টোকেনটি রাখুন

const headers = {
  Authorization: `Bearer ${TMDB_TOKEN}`,
  accept: 'application/json',
};

export async function fetchFromTMDB(endpoint: string, queryParams: Record<string, string> = {}) {
  const urlParams = new URLSearchParams(queryParams).toString();
  const url = `${TMDB_BASE_URL}${endpoint}${urlParams ? `?${urlParams}` : ''}`;
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers,
      next: { revalidate: 3600 } // Next.js ক্যাশিং (১ ঘণ্টা পর রিভ্যালিডেট হবে)
    });
    
    if (!response.ok) {
      throw new Error(`TMDB Error: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch from TMDB:', error);
    return null;
  }
}

// ব্যবহার করার নিয়ম:
// const popularMovies = await fetchFromTMDB('/movie/popular', { page: '1' });
// const actionMovies = await fetchFromTMDB('/discover/movie', { with_genres: '28', page: '1' });
```
