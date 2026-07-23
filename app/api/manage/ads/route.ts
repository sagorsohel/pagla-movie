import { NextResponse } from "next/server"
import { db } from "@/db"
import { ads } from "@/db/schema"
import { eq } from "drizzle-orm"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    let adsData = await db.select().from(ads).where(eq(ads.id, "global")).then((r: any) => r[0])
    if (!adsData) {
      await db.insert(ads).values({ 
        id: "global", 
        heroAds: "", 
        hero2Ads: "",
        modalAds: "", 
        headerAds: "",
        membershipRefLink: "",
        signinRefLink: "",
        globalBg: "",
        floatingAds: "",
        floatingAdsStatus: "on",
        floatingDesktopAds: "",
        floatingDesktopAdsStatus: "on",
        layoutOrder: '["top-ad", "hero", "ad-middle", "tabs", "ad-bottom"]',
        footerAds: ""
      })
      adsData = { 
        id: "global", 
        heroAds: "", 
        hero2Ads: "",
        modalAds: "", 
        headerAds: "",
        membershipRefLink: "",
        signinRefLink: "",
        globalBg: "",
        floatingAds: "",
        floatingAdsStatus: "on",
        floatingDesktopAds: "",
        floatingDesktopAdsStatus: "on",
        layoutOrder: '["top-ad", "hero", "ad-middle", "tabs", "ad-bottom"]',
        footerAds: ""
      }
    }
    return NextResponse.json(
      { success: true, ads: adsData },
      {
        headers: {
          "Cache-Control": "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400",
        },
      }
    )
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    let { 
      heroAds, 
      hero2Ads, 
      modalAds, 
      headerAds, 
      membershipRefLink, 
      signinRefLink, 
      globalBg, 
      floatingAds, 
      floatingAdsStatus,
      floatingDesktopAds,
      floatingDesktopAdsStatus,
      layoutOrder,
      footerAds
    } = await request.json()

    const isBase64 = request.headers.get("x-encoded-payload") === "base64"
    if (isBase64) {
      const safeDecode = (str?: string) => {
        if (!str) return ""
        try {
          return Buffer.from(str, "base64").toString("utf-8")
        } catch {
          return str
        }
      }
      heroAds = safeDecode(heroAds)
      hero2Ads = safeDecode(hero2Ads)
      modalAds = safeDecode(modalAds)
      headerAds = safeDecode(headerAds)
      membershipRefLink = safeDecode(membershipRefLink)
      signinRefLink = safeDecode(signinRefLink)
      globalBg = safeDecode(globalBg)
      floatingAds = safeDecode(floatingAds)
      floatingAdsStatus = safeDecode(floatingAdsStatus)
      floatingDesktopAds = safeDecode(floatingDesktopAds)
      floatingDesktopAdsStatus = safeDecode(floatingDesktopAdsStatus)
      layoutOrder = safeDecode(layoutOrder)
      footerAds = safeDecode(footerAds)
    }

    await db.update(ads)
      .set({
        heroAds: heroAds ?? "",
        hero2Ads: hero2Ads ?? "",
        modalAds: modalAds ?? "",
        headerAds: headerAds ?? "",
        membershipRefLink: membershipRefLink ?? "",
        signinRefLink: signinRefLink ?? "",
        globalBg: globalBg ?? "",
        floatingAds: floatingAds ?? "",
        floatingAdsStatus: floatingAdsStatus ?? "on",
        floatingDesktopAds: floatingDesktopAds ?? "",
        floatingDesktopAdsStatus: floatingDesktopAdsStatus ?? "on",
        layoutOrder: layoutOrder ?? '["top-ad", "hero", "ad-middle", "tabs", "ad-bottom"]',
        footerAds: footerAds ?? ""
      })
      .where(eq(ads.id, "global"))

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
