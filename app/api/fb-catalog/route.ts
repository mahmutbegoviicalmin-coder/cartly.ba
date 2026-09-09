import { NextResponse } from "next/server";

const CSV = `id,title,description,availability,condition,price,link,image_link,brand,google_product_category,product_type
motorna-pila,Motorna pila 4,9 KS,"Motorna pila snage 4,9 KS sa mačem od 40 cm. Automatsko podmazivanje, .325 lanac i komplet dodatne opreme.",in stock,new,104.90 BAM,https://cartlybih.store/motorna-pila,https://cartlybih.store/motorka/motorka1.png,Cartly,1233,Alati > Motorne pile
dewalt-busilica,DeWalt 28V Bušilica Set,"DeWalt 28V bezžična bušilica – komplet set sa baterijama, punjačem i kofercetom. Idealna za profesionalnu upotrebu.",in stock,new,69.90 BAM,https://cartlybih.store/dewalt-busilica,https://cartlybih.store/images/dewalt.jpg,DeWalt,3243,Alati > Bušilice
milwaukee-set-31,Milwaukee Set 3.1,"Milwaukee Set 3.1 – bušilica, udarni odvijač 226 Nm, brusilica, 2× baterija 5.0 Ah, punjač i kofer.",in stock,new,149.00 BAM,https://cartlybih.store/milwaukee-set-31,https://cartlybih.store/milwaukee-set-31/hero.png,Milwaukee,3243,Alati > Setovi
set-2u1,Set 2 u 1 Bušilica + Brusilica,"Kompletan Set 2 u 1 – bušilica, brusilica, 2× baterija, punjač, zaštita, ručka i kofer. Akcija 104,90 KM.",in stock,new,104.90 BAM,https://cartlybih.store/set-2u1,https://cartlybih.store/set2u1/set.png,Cartly,3243,Alati > Setovi
milwaukee-busilica,Milwaukee Bušilica Set,"Milwaukee 18V bezžična bušilica – komplet set sa baterijama i punjačem. Profesionalni alat za svaki posao.",in stock,new,69.90 BAM,https://cartlybih.store/milwaukee-busilica,https://cartlybih.store/images/milwaukee.png,Milwaukee,3243,Alati > Bušilice
milwaukee-brusilica,Milwaukee Kutna Brusilica,"Milwaukee kutna brusilica – snažan profesionalni alat za brušenje i rezanje.",in stock,new,74.90 BAM,https://cartlybih.store/brusilica,https://cartlybih.store/images/brusilica.webp,Milwaukee,3243,Alati > Brusilice
celicna-cetka-11,Čelična Četka 1+1 GRATIS,"Profesionalna čelična četka za čišćenje roštilja – kupite 1 i dobijete 1 GRATIS!",in stock,new,24.90 BAM,https://cartlybih.store/celicna-cetka,https://cartlybih.store/celicnacetka.jpeg,Cartly,4166,Kuhinja > Čišćenje roštilja
kamera-sigurnosna,Sigurnosna Kamera za Dom,"WiFi kamera visoke rezolucije – noćni vid, detekcija pokreta, aplikacija za nadzor.",in stock,new,129.90 BAM,https://cartlybih.store/kamera,https://cartlybih.store/images/kamere.png,Cartly,156,Sigurnost > Kamere
masina-za-sisanje,Mašina za Šišanje,"Profesionalna punjiva mašina za šišanje kose i brade – tiha i precizna.",in stock,new,89.90 BAM,https://cartlybih.store/masina-za-sisanje,https://cartlybih.store/masina1.jpeg,Cartly,5907,Ljepota > Šišanje
zvucnik-bluetooth,Bluetooth Zvučnik,"Prenosivi Bluetooth zvučnik – kristalno čist zvuk, dugotrajna baterija, vodootporan.",in stock,new,59.90 BAM,https://cartlybih.store/zvucnik,https://cartlybih.store/images/zvucnik/zvucnik1.webp,Cartly,6870,Elektronika > Zvučnici
komarnik-za-vrata,Magnetni Komarnik za Vrata,"Samolepljivi magnetni komarnik – bez bušenja, automatsko zatvaranje. Zaustavite insekte!",in stock,new,16.90 BAM,https://cartlybih.store/komarnik-za-vrata,https://cartlybih.store/komarnik/hero.webp,Cartly,2832,Dom > Komarnici
usmjerivac-zraka,Usmjerivač Zraka Klime,"Podesivi usmjerivač zraka za klimu – bez direktnog puhanja, bez bušenja.",in stock,new,14.90 BAM,https://cartlybih.store/usmjerivac-zraka,https://cartlybih.store/usmjerivac/hero.png,Cartly,670,Dom > Klimatizacija
radne-patike-s3,Radne Zaštitne Patike S3,"Zaštitne radne cipele S3 – čelična kapica, antistatične, otporne na klizanje. EU 41-46.",in stock,new,59.90 BAM,https://cartlybih.store/radne-patike,https://cartlybih.store/images/patike-hero.png,Cartly,1604,Obuća > Radne cipele
radne-patike-hammer,Hammer S3 Radne Patike,"Hammer S3 radne patike – čelična kapica, vodootporne, protuklizni đon. EU 39-47. Akcija 59,90 KM.",in stock,new,59.90 BAM,https://cartlybih.store/radne-patike-hammer,https://cartlybih.store/radne-patike-hammer/hero.webp,Hammer,1604,Obuća > Radne cipele
zirafa-brusilica,Žirafa Brusilica za Zidove,"Žirafa brusilica za zidove i plafone sa teleskopskom šipkom, LED osvjetljenjem i priključkom za usisavač. Akcija 169,90 KM.",in stock,new,169.90 BAM,https://cartlybih.store/zirafa-brusilica,https://cartlybih.store/zirafa/heroslika.png,Cartly,3243,Alati > Brusilice`;

export async function GET() {
  return new NextResponse(CSV, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
