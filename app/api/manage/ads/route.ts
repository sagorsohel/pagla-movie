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
        footerAds: "",
        signupRedirectUrl: "",
        signupRedirectTime: 5,
        signupRedirectTimeUnit: "sec"
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
        footerAds: "",
        signupRedirectUrl: "",
        signupRedirectTime: 5,
        signupRedirectTimeUnit: "sec"
      }
    }
    return NextResponse.json(
      { success: true, ads: adsData },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      }
    )
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json()
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
      footerAds,
      signupRedirectUrl,
      signupRedirectTime,
      signupRedirectTimeUnit
    } = payload

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
      signupRedirectUrl = safeDecode(signupRedirectUrl)
    }

    const updateObj: Record<string, any> = {}
    if (heroAds !== undefined) updateObj.heroAds = heroAds
    if (hero2Ads !== undefined) updateObj.hero2Ads = hero2Ads
    if (modalAds !== undefined) updateObj.modalAds = modalAds
    if (headerAds !== undefined) updateObj.headerAds = headerAds
    if (membershipRefLink !== undefined) updateObj.membershipRefLink = membershipRefLink
    if (signinRefLink !== undefined) updateObj.signinRefLink = signinRefLink
    if (globalBg !== undefined) updateObj.globalBg = globalBg
    if (floatingAds !== undefined) updateObj.floatingAds = floatingAds
    if (floatingAdsStatus !== undefined) updateObj.floatingAdsStatus = floatingAdsStatus
    if (floatingDesktopAds !== undefined) updateObj.floatingDesktopAds = floatingDesktopAds
    if (floatingDesktopAdsStatus !== undefined) updateObj.floatingDesktopAdsStatus = floatingDesktopAdsStatus
    if (layoutOrder !== undefined) updateObj.layoutOrder = layoutOrder
    if (footerAds !== undefined) updateObj.footerAds = footerAds
    if (signupRedirectUrl !== undefined) updateObj.signupRedirectUrl = signupRedirectUrl
    if (signupRedirectTime !== undefined) updateObj.signupRedirectTime = Number(signupRedirectTime)
    if (signupRedirectTimeUnit !== undefined) updateObj.signupRedirectTimeUnit = signupRedirectTimeUnit

    const existing = await db.select().from(ads).where(eq(ads.id, "global")).then((r: any) => r[0])
    if (!existing) {
      await db.insert(ads).values({
        id: "global",
        ...updateObj,
      })
    } else {
      await db.update(ads)
        .set(updateObj)
        .where(eq(ads.id, "global"))
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

