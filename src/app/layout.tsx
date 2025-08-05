import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: 'swap', // Improve font loading performance
  preload: true,
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: 'swap', // Improve font loading performance
  preload: true,
});

export const metadata: Metadata = {
  title: "Shipping Cost Analyzer | Ecommerce Fulfillment - Save $1000s Per Month",
  description: "Free Shipping Cost Analyzer finds your cheapest fulfillment option instantly. We analyzed 1,000+ eCommerce brands across Australia & China to create an AI that finds the most cost-effective shipping strategy for YOUR business.",
  keywords: [
    "shipping cost analyzer",
    "ecommerce fulfillment",
    "shipping optimization",
    "fulfillment costs",
    "shipping strategy",
    "ecommerce shipping",
    "logistics optimization",
    "shipping calculator",
    "fulfillment analyzer",
    "shipping savings"
  ],
  authors: [{ name: "Future Fulfillment" }],
  creator: "Future Fulfillment",
  publisher: "Future Fulfillment",
  category: "Business Tools",
  
  // Open Graph metadata for social sharing
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.ecommercefulfilment.ai/",
    title: "Free Shipping Cost Analyzer | Save $1000s on Ecommerce Fulfillment",
    description: "This Free \"Shipping Cost Analyzer\" Will Find Your Cheapest Fulfillment Option & Save You $1000s Per Month. AI-powered analysis of 1,000+ eCommerce brands.",
    siteName: "Future Fulfillment",
    images: [
      {
        url: "/future-share.jpg",
        width: 1200,
        height: 630,
        alt: "Free Shipping Cost Analyzer - Save $1000s Per Month on Ecommerce Fulfillment",
      },
    ],
  },
  
  // Twitter Card metadata
  twitter: {
    card: "summary_large_image",
    title: "Free Shipping Cost Analyzer | Save $1000s on Ecommerce Fulfillment",
    description: "AI-powered shipping cost analyzer finds your cheapest fulfillment option instantly. Analyzed 1,000+ eCommerce brands to optimize YOUR shipping strategy.",
    images: ["/future-share.jpg"],
    creator: "@futurefulfillment",
    site: "@futurefulfillment",
  },
  
  // Additional metadata
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  
  // Verification and analytics
  verification: {
    google: "your-google-verification-code",
    yandex: "your-yandex-verification-code",
    yahoo: "your-yahoo-verification-code",
  },
  
  // App-specific metadata
  applicationName: "Shipping Cost Analyzer",
  referrer: "origin-when-cross-origin",
  
  // Additional structured data
  other: {
    "application-name": "Shipping Cost Analyzer",
    "msapplication-TileColor": "#000000",
    "theme-color": "#000000",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Preload critical resources */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://prod.spline.design" />
        <link rel="dns-prefetch" href="https://prod.spline.design" />
        
        {/* Optimize resource loading */}
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        
        {/* Facebook Pixel noscript fallback */}
        <noscript>
          <img height="1" width="1" style={{display:'none'}}
          src="https://www.facebook.com/tr?id=551398842600934&ev=PageView&noscript=1"/>
        </noscript>
      </head>
      <body
        className={`${jakarta.variable} ${inter.variable} antialiased bg-neutral-950 text-white`}
      >
        {/* Facebook Pixel */}
        <Script
          id="facebook-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              
              fbq('init', '551398842600934');
              fbq('track', 'PageView');
            `,
          }}
        />
        
        {children}
      </body>
    </html>
  );
}
