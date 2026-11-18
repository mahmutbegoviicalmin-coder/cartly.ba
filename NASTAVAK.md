# Cartly: šta je ostalo da se uradi (nastavak u novoj sesiji)

## ✅ Urađeno 18.11.2026 (druga sesija, NIJE commitano)
- `lib/quick-order.ts` + `components/store/QuickOrder.tsx`: plutajuća traka (telefon) / kartica (desktop) + pop-up za starije na svih 22 proizvoda. Ubačeno u `app/layout.tsx` (`QuickOrderGate`). Bilo koje dugme može otvoriti pop-up preko `openQuickOrder()`.
- `UrgencyPanel` (prsten do stvarnog kraja Black Novembera, "Akcija završava uskoro" ispod 48 h) i `StockMeter` (samo ako je `stock` upisan u `lib/catalog.ts`).
- Stara plutajuća dugmad uklonjena sa svih stranica (fajlovi `FloatingCTA.tsx` su ostali, ali se više ne koriste). Makita: stari popup bio je dostupan samo kroz plutajuće dugme, pa je uklonjen.
- Izmišljene zalihe ("Preostalo još X · Y% prodano") i lažni tajmer od 8 h na DeWalt, Brusilica i ProductLanding zamijenjeni pravim podacima.
- Usmjerivač u katalogu: 13,90 KM (kao API).
- SEO: `app/sitemap.ts`, `app/robots.ts`, `lib/seo.ts` (canonical + OG po proizvodu, JSON-LD Product i OnlineStore kroz `components/store/StructuredData.tsx`), metadata za `/brusilica` i `/proizvodi`, `verification.google` iz `GOOGLE_SITE_VERIFICATION`, `app/api/admin/seo/route.ts` (GET statistika, POST slanje sitemapa).
- `lib/campaign-dates.ts`: konstante kampanje bez Reacta (za server kod).
- Provjereno: tsc, `next lint`, `next build` prolaze, a pop-up je testiran u pregledniku sa lažnim API odgovorom.

## Još otvoreno
- **Env u Vercelu:** `NEXT_PUBLIC_SITE_URL` (feed `public/fb-catalog.csv` koristi `cartlybih.store`, a kod `cartly.ba`, pa treba potvrditi pravi domen), `GOOGLE_SITE_VERIFICATION`, `GSC_CLIENT_EMAIL`, `GSC_PRIVATE_KEY`, `GSC_SITE_URL`, a po želji `NEXT_PUBLIC_CONTACT_PHONE` i `NEXT_PUBLIC_CONTACT_EMAIL`.
- **Upisati stvarne zalihe** (`stock`) u `lib/catalog.ts`.
- Druge stranice i dalje imaju **izmišljene brojeve**: Makita "stock" i "viewers" (nasumični), Hammer i Richeng "66 gleda", Aeox `remaining` / promo tajmer, toastovi "upravo naručio". Odluka je na vlasniku.
- UI u adminu za `/api/admin/seo` (ruta postoji, ali tab nije napravljen).
- Ručno testirati jednu pravu narudžbu po API-ju (testirano je samo sa lažnim odgovorom).

---

Stanje na dan 18.11.2026. **Ništa od ovoga što je urađeno danas nije commitano.** Sve izmjene su lokalno u `main` radnom folderu (redizajn početne, Black November, admin, landing stranice, slike).

---

## Zadatak koji je u toku

Na **svih 22 stranica proizvoda** treba:

1. **Vizuelni prikaz vremena i zaliha** (ne klasični indikator):
   - "Cijena završava za …"
   - "Ostalo na stanju: …"
   - "Akcija završava ubrzo"
   - Princip: ne tjerati na kupovinu, nego jasno pokazati koliko je vremena ili zaliha ostalo.
2. **Plutajuće dugme (floating CTA)** na svakom proizvodu. Klik otvara **pop-up za narudžbu prilagođen starijima**:
   - polja: ime, prezime, adresa, grad, broj telefona
   - opcija: poklon paket +5 KM
   - poruka: "Black November cijena je već uračunata"
3. **SEO:** integracija s Google Search Console, proizvodi i podaci o firmi, bolje pozicije u pretrazi.

---

## Plan (dogovoreni pristup)

### A. Jedan globalni sistem, a ne 22 ručne izmjene
- `components/store/QuickOrder.tsx` (novo): plutajuća traka i pop-up.
  - Ubaciti ga u `app/layout.tsx` kroz "gate" po uzoru na `CampaignBarGate` iz `components/store/BlackNovember.tsx`. Prikazuje se samo na stranicama proizvoda, a ne na `/`, `/proizvodi`, `/admin` i `/dobavljac`.
  - Na telefonu: traka na dnu ekrana. Lijevo je prikaz vremena i zaliha, desno veliko dugme "Naruči".
  - Na desktopu: plutajuća kartica dolje desno.
- `lib/quick-order.ts` (novo): **registar po slugu** s API rutom, cijenom, varijantama, dostavom i tim da li API traži poštanski broj. Svi podaci su ispod.
- Pop-up za starije:
  - font od 18 px i više, polja visine oko 60 px, jedna kolona
  - velika dugmad za varijante (veličina, paket, boja)
  - jasno prikazano "Ukupno"
  - veliki checkbox za poklon, crvene poruke o grešci
- Pop-up mora slati **honeypot i `formStartedAt`**, inače `lib/order-guard.ts` narudžbu tiho odbaci (pogledati `lib/order-protection.tsx`, hook `useOrderProtection`).
- Nakon uspjeha poslati Meta `Purchase` s `orderNumber` kao eventID (kao na postojećim stranicama). `InitiateCheckout` ide pri otvaranju pop-upa.

### B. Prikaz vremena i zaliha (`UrgencyPanel`)
- **Vrijeme:** stvarni kraj Black Novembera iz `lib/campaign.ts` (`BLACK_NOVEMBER_END`, `useBlackNovember`). Vizuelno kao prsten (SVG krug koji se prazni), a ne obična traka. Ispod 48 h ide tekst "Akcija završava uskoro". Nakon 1.12. se sam gasi.
- **Zalihe:** NE izmišljati brojeve (to bi bila lažna oskudica, suprotno principu iz zadatka).
  - Dodati u `lib/catalog.ts` polje `stock?: number` koje vlasnik upisuje stvarnim brojem.
  - Bez broja se prikaz zaliha ne pokazuje (ili samo "Ograničene količine").
  - Vizuelno: niz tačkica ili segmenata.
- **Treba ispraviti:** u `components/landing/ProductLanding.tsx` (`stockLeft` i `soldPct` u configu Milwaukee Set 3.1, Milwaukee bušilice i Set 2u1) i na DeWalt stranici ("Preostalo još 12 komada · 82% prodano") su **fiksni brojevi**. Prebaciti ih na `catalog.stock`.

### C. Stara plutajuća dugmad ugasiti, da ne budu dva
Stranice koje već imaju svoje plutajuće dugme ili traku na dnu:

| Stranica | Gdje |
|---|---|
| dewalt-busilica | `app/dewalt-busilica/page.tsx` (sticky traka na dnu) |
| brusilica | `app/brusilica/page.tsx`, `app/brusilica/FloatingCTA.tsx` |
| motorna-pila | `app/motorna-pila/MotornaPilaClient.tsx`, `components/FloatingCTA.tsx` |
| zirafa-brusilica | `FloatingCTA.tsx`, `ZirafaClient.tsx` |
| makita-brusilica | `FloatingCTA.tsx`, `MakitaClient.tsx` |
| makita-brusilica-1500w | `FloatingCTA.tsx`, `MakitaClient.tsx` |
| masina-za-sisanje | `page.tsx`, `FloatingCTA.tsx` |
| celicna-cetka | `FloatingCTA.tsx`, `CetkaClient.tsx` |
| radne-patike-aeox | `AeoxPage.tsx` (`FloatingBar`, klasa `.ae-floating-cta`) |
| radne-patike | `PatikePage.tsx` |
| radne-patike-hammer | `HammerPage.tsx` |
| radne-patike-richeng | `RichengPage.tsx` |
| kamera | `KameraClient.tsx` |
| airpods-pro | `AirPodsClient.tsx`, `FloatingCTA.tsx` |
| zvucnik | `page.tsx`, `FloatingCTA.tsx` |
| komarnik-za-vrata | `page.tsx`, `FloatingCTA.tsx`, `KomarnikClient.tsx` |
| usmjerivac-zraka | `FloatingCTA.tsx`, `UsmjerivacClient.tsx` |
| prsluk-za-spasavanje | `PrslukPage.tsx`, `components/FloatingCTA.tsx` |
| milwaukee-set-31, milwaukee-busilica, set-2u1 | sticky traka u `components/landing/ProductLanding.tsx` |

Lezaljke nema plutajuće dugme. Za svaku stranicu provjeriti i `padding-bottom` koji je rezervisan za staru traku.

---

## Registar narudžbi (sve provjereno u kodu)

Svi API-ji koriste `guardCustomerOrder` iz `lib/order-guard.ts`:
- `ime` i `prezime` se spajaju, pa je **slanje odvojenog imena i prezimena uvijek ispravno**.
- Poštanski broj nije obavezan, osim gdje piše `requirePostal`. Ako se šalje, mora imati tačno 5 cifara.
- Honeypot polja su `website`, `company`, `url` i `fax`, a uz njih ide `formStartedAt`.
- Svi API-ji čitaju `poklon` (true/false) za poklon od 5 KM.

| Slug | API | Obavezno dodatno | Payload pored ime/prezime/adresa/grad/telefon/poklon | Cijena (KM) | Dostava |
|---|---|---|---|---|---|
| milwaukee-set-31 | `/api/milwaukee-set-order` | prezime + **poštanski** | `postanski_broj`, `kolicina`, `externalId` | 149 | 10 |
| dewalt-busilica | `/api/dewalt-order` | — | — | 69,90 | 10 |
| brusilica | `/api/brusilica-order` | — | (`napomena`, `externalId` opcionalno) | 74,90 | 10 |
| motorna-pila | `/api/orders` | prezime + **poštanski** | `postanski_broj`, `productId`, `externalId` | 104,90 | 10 |
| milwaukee-busilica | `/api/narudzba` | — | — | 69,90 | 10 |
| set-2u1 | `/api/set2u1-order` | prezime + **poštanski** | `postanski_broj`, `kolicina` | 104,90 | 10 |
| zirafa-brusilica | `/api/zirafa-order` | — | `externalId` | 169,90 | 10 |
| makita-brusilica | `/api/makita-order` | prezime + **poštanski** | `postanski_broj`, `externalId`, `sourceUrl` | 84,90 | **0** |
| makita-brusilica-1500w | `/api/makita-1500-order` | prezime + **poštanski** | `postanski_broj`, `externalId`, `sourceUrl` | 57,90 | **0** |
| masina-za-sisanje | `/api/masina-order` | — | `kolicina`, `externalId` | 89,90 | 10 |
| celicna-cetka | `/api/cetka-order` | — | — (1+1 gratis) | 24,90 | 10 |
| radne-patike-aeox | `/api/aeox-order` | — | `velicina`, `kolicina` (ili `velicine: [{velicina,kolicina}]`) | 59,90 | **0** |
| radne-patike (Tactical) | `/api/order` | — | `velicine: [{velicina, kolicina}]` | 59,90 | 10 |
| radne-patike-hammer | `/api/hammer-order` | — | `velicina`, `kolicina` | 59,90 | 10 |
| radne-patike-richeng | `/api/richeng-order` | — | `velicina`, `kolicina` | 49,90 | 10 |
| kamera | `/api/kamera-order` | — | `kolicina`, `sdCard` (može izostati, tj. bez SD kartice) | 44,90 | 10 |
| airpods-pro | `/api/airpods-order` | — | `kolicina`, `externalId` | 49,90 | 10 |
| zvucnik | `/api/order-zvucnik` | — | `kolicina` | 59,90 | 10 |
| lezaljke | `/api/lezaljka-order` | — | `boja: "maslinasto-siva"`, `kolicina`, `postanski_broj` (opc.), `externalId` | 59,90 | 10 |
| komarnik-za-vrata | `/api/komarnik-order` | — | `bundle` (1, 2 ili 3), `externalId` | paketi ispod | 10 |
| usmjerivac-zraka | `/api/usmjerivac-order` | — | `bundle` (1–4), `externalId` | paketi ispod | 10 |
| prsluk-za-spasavanje | `/api/prsluk-order` | — | `velicina` (S/M/3XL/PORODICNI), `boja` (naziv boje), `externalId` | prema veličini | 10 |

**Varijante:**
- **Aeox** veličine: 41–47, rasprodano 41, 46, 47 (`OUT_OF_STOCK` u `AeoxPage.tsx`).
- **Tactical (radne-patike)** veličine: 39–47, rasprodano 47 (`components/OrderForm.tsx`).
- **Hammer** veličine: 39–47. **Richeng**: 36–47.
- **Prsluk**:
  - S 42 KM (djeca do 9 godina)
  - M 45 KM (djeca do 15 godina)
  - 3XL 49 KM (odrasli)
  - PORODICNI 154,90 KM (S + M + 2XL + 2XL)
  - Boje: "Narandžasta", "Fluorescentno zelena". Postojeći modal šalje `adresa` kao `"adresa, poštanski"`.
- **Komarnik** paketi: 1 kom 16,90 · 2 kom 24,90 · 3 kom 33,90.
- **Usmjerivač** paketi: 1 kom 13,90 · 2 kom 21,90 · 3 kom 28,90 · 4 kom 34,90. Katalog kaže 14,90, a pop-up stranice kaže 13,90, pa treba provjeriti koja je tačna.
- **Poštanski broj:** zadatak kaže bez njega, ali 5 API-ja ga traži (milwaukee-set-31, set-2u1, motorna-pila, makita ×2). Za njih pop-up mora prikazati i to polje.

---

## SEO (dio C zadatka)

**Šta se može uraditi u kodu:**
1. `app/sitemap.ts`: svi proizvodi iz `lib/catalog.ts`, plus `/` i `/proizvodi`.
2. `app/robots.ts`: zabrana za `/admin`, `/dobavljac` i `/api`. Uključiti link na sitemap.
3. **JSON-LD `Product` na svakoj stranici proizvoda:** name, image, description, brand, offers (price, priceCurrency "BAM", availability, priceValidUntil = kraj akcije, shippingDetails 10 KM BiH, hasMerchantReturnPolicy 14 dana). Od ovoga se prave Google rich rezultati i besplatni listinzi proizvoda.
4. **JSON-LD `Organization` i `OnlineStore`** na početnoj: naziv, logo, kontakt, područje BiH, plaćanje pouzećem.
5. Popraviti metadata:
   - `brusilica` i `milwaukee-busilica` (dodano) su ranije imale opšti naslov sajta
   - provjeriti `title`, `description`, `openGraph` i `canonical` za svaki proizvod
6. **Verifikacija za Search Console:** `metadata.verification.google` iz env varijable `GOOGLE_SITE_VERIFICATION` u `app/layout.tsx`.

**Search Console API:**
- Može se napraviti ruta `app/api/admin/seo/route.ts` koja preko service accounta (JWT potpisan s Node `crypto`, bez novih paketa) šalje sitemap:
  `PUT https://www.googleapis.com/webmasters/v3/sites/{site}/sitemaps/{feedpath}`
- Ta ruta može čitati i statistiku pretrage (`searchanalytics.query`) za prikaz u adminu.
- **Vlasnik mora sam:**
  - verifikovati domen `cartly.ba` u Search Consoleu
  - napraviti service account u Google Cloudu
  - dodati ga kao korisnika u Search Console
  - ključ staviti u env (`GSC_CLIENT_EMAIL`, `GSC_PRIVATE_KEY`, `GSC_SITE_URL`)
- **Važno:** Search Console ne prima "proizvode i poslovne podatke" direktno.
  - Proizvodi idu preko JSON-LD na stranicama i (po želji) kroz **Google Merchant Center**. Feed `public/fb-catalog.csv` / `app/api/fb-catalog` se može prilagoditi.
  - Poslovni podaci idu preko **Google Business Profile**.
  - Indexing API važi samo za oglase za posao i prenose, ne za proizvode.
- "Biti među prvim rezultatima" se ne može garantovati. Kod može pokriti tehnički SEO: brzinu, strukturirane podatke, sitemap, naslove i interne linkove.

---

## Gdje je šta (za orijentaciju)
- Boje i brend: narandžasta `#F45B39` je naglasna boja prodavnice; svaka stranica proizvoda ima svoju boju u `lib/campaign-themes.ts`.
- Black November: `lib/campaign.ts` i `components/store/BlackNovember.tsx` (traka, `BlackNovemberCartNote` za forme, `Countdown`).
- Maskota Lisko: `public/lisko/lisko-{160,320,640}.webp`, `components/store/Mascot.tsx` i `components/store/Lisko.tsx` (interaktivni).
- Slike proizvoda (izrezane): `public/shop/{sm,md,}/<slug>.webp`, dimenzije u `lib/product-images.json`. Prikaz kroz `components/store/ProductOnFloor.tsx`.
- Predložak landing stranice: `components/landing/ProductLanding.tsx` (koriste ga milwaukee-set-31, milwaukee-busilica i set-2u1).

## Napomene za rad
- `--font-manrope` u `app/layout.tsx` zapravo učitava font **Sora**. Nove stranice koriste sistemski font (SF Pro / Inter).
- U istom folderu ponekad radi još jedan `next dev` (port 3000), pa dev server na 3005 zna vraćati lažne 404. Rješenje je restart servera.
- Prije deploya obavezno pokrenuti `next lint` i `next build`, jer je jednom lint greška rušila build.
- `images.unoptimized: true` u `next.config.mjs`: slike su ručno pripremljene u 480/800/1200 px.
- Recenzije na novim landing stranicama su primjeri, pa ih treba zamijeniti pravim.
