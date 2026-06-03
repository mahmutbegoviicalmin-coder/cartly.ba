import type { Metadata } from "next";
import { Sora } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const sora = Sora({
  subsets:  ["latin"],
  weight:   ["400", "500", "600", "700", "800"],
  variable: "--font-manrope",
  display:  "swap",
});

export const metadata: Metadata = {
  title: "Cartly.ba — Online kupovina u Bosni i Hercegovini",
  description: "Kupuj online uz brzu dostavu, plaćanje pouzećem i provjeren kvalitet. Radne patike, kamere, alati i više — dostava po cijeloj BiH.",
};

const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bs" className={sora.variable}>
      <head>
        <Script
          id="fb-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              // 1. Manually capture fbclid → _fbc cookie (fallback before pixel.js loads)
              (function() {
                try {
                  var fbclid = new URLSearchParams(window.location.search).get('fbclid');
                  if (fbclid && !document.cookie.match(/(^|;)\s*_fbc=/)) {
                    var fbc = 'fb.1.' + Date.now() + '.' + fbclid;
                    document.cookie = '_fbc=' + fbc + '; path=/; max-age=7776000; SameSite=Lax';
                  }
                } catch(e) {}
              })();

              // 2. Stable external_id (per browser) — improves cross-session match quality
              var _eid = '';
              try {
                _eid = localStorage.getItem('_crt_eid') || '';
                if (!_eid) {
                  _eid = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
                  localStorage.setItem('_crt_eid', _eid);
                }
              } catch(e) {}

              // 3. Load pixel
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');

              // 4. Init with external_id for better match quality
              fbq('init', '${FB_PIXEL_ID}', _eid ? { external_id: _eid } : {});
              fbq('track', 'PageView');
            `,
          }}
        />
        <noscript>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src={`https://www.facebook.com/tr?id=${FB_PIXEL_ID}&ev=PageView&noscript=1`}
            alt=""
          />
        </noscript>
      </head>
      <body
        className={`${sora.className} antialiased bg-white text-black`}
      >
        {children}
      </body>
    </html>
  );
}
