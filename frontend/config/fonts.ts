import { Almarai, Noto_Sans } from "next/font/google";

export const almarai = Almarai({
  subsets: ["latin"], 
  variable: "--font-almarai",
  weight: ["300", "400", "700", "800"],
});

export const notoSans = Noto_Sans({
  subsets: ["latin"],
  variable: "--font-notoSans",
  weight: ["400", "700"],
});