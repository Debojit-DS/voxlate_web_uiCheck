import localFont from "next/font/local";
import {
  Newsreader,
  Noto_Sans_Bengali,
  Noto_Sans_Devanagari,
  Noto_Sans_Gujarati,
  Noto_Sans_Kannada,
  Noto_Sans_Tamil,
  Noto_Sans_Telugu,
} from "next/font/google";
import { WaitlistModalProvider } from "@/components/waitlist/WaitlistModalProvider";
import { WaitlistModal } from "@/components/waitlist/WaitlistModal";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { AuthPromptProvider } from "@/components/auth/AuthPromptProvider";
import { AuthPromptModal } from "@/components/auth/AuthPromptModal";
import "./globals.css";

const dmSans = localFont({
  src: [
    { path: "./fonts/dm-sans/DMSans-Variable.ttf", weight: "100 900", style: "normal" },
    { path: "./fonts/dm-sans/DMSans-Italic-Variable.ttf", weight: "100 900", style: "italic" },
  ],
  variable: "--font-dm-sans",
  display: "swap",
});
const newsreader = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-newsreader",
  display: "swap",
});

// Script fallbacks for the hero's multilingual words. Not preloaded: the
// browser fetches each one only when its script actually appears on the page.
const notoDeva = Noto_Sans_Devanagari({ weight: "500", preload: false, display: "swap", variable: "--font-noto-deva" });
const notoBeng = Noto_Sans_Bengali({ weight: "500", preload: false, display: "swap", variable: "--font-noto-beng" });
const notoTaml = Noto_Sans_Tamil({ weight: "500", preload: false, display: "swap", variable: "--font-noto-taml" });
const notoTelu = Noto_Sans_Telugu({ weight: "500", preload: false, display: "swap", variable: "--font-noto-telu" });
const notoGujr = Noto_Sans_Gujarati({ weight: "500", preload: false, display: "swap", variable: "--font-noto-gujr" });
const notoKnda = Noto_Sans_Kannada({ weight: "500", preload: false, display: "swap", variable: "--font-noto-knda" });

const notoArabic = localFont({ src: "./fonts/ribbon/arabic.woff2", weight: "400", preload: false, display: "swap", variable: "--font-noto-arabic" });
const notoJapanese = localFont({ src: "./fonts/ribbon/japanese.woff2", weight: "400", preload: false, display: "swap", variable: "--font-noto-japanese" });
const notoChinese = localFont({ src: "./fonts/ribbon/chinese.woff2", weight: "400", preload: false, display: "swap", variable: "--font-noto-chinese" });

const fontVariables = [dmSans, newsreader, notoDeva, notoBeng, notoTaml, notoTelu, notoGujr, notoKnda, notoArabic, notoJapanese, notoChinese]
  .map((f) => f.variable)
  .join(" ");

export const metadata = {
  title: "Voxlate",
  description: "Breaking Language Barriers",
  icons: {
    icon: [
      { url: "/favicon/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon/favicon.ico" },
    ],
    apple: [{ url: "/favicon/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    other: [{ rel: "manifest", url: "/favicon/site.webmanifest" }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={fontVariables}>
      <body>
        <script src="https://accounts.google.com/gsi/client" async defer></script>
        <AuthProvider>
          <AuthPromptProvider>
            <WaitlistModalProvider>
              {children}
              <WaitlistModal />
              <AuthPromptModal />
            </WaitlistModalProvider>
          </AuthPromptProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
