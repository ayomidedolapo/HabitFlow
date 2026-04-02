import { Plus_Jakarta_Sans } from "next/font/google"
import "./globals.css"
import Providers from "./providers"

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-jakarta",
})

export const metadata = {
  title: "HabitFlow - Build Better Habits",
  description: "Track your habits, build streaks, and achieve your goals",
   manifest: "/manifest.webmanifest",
   themeColor: "#6366f1", // 🔥 add this
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-192.png",
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={jakarta.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}

