import type React from "react"
import "@/app/globals.css"

import { Inter } from "next/font/google"
import type { Metadata } from "next"
import { cn } from "@/lib/utils"

import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/hooks/use-auth"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Financial Control App",
  description: "Controle suas finanças pessoais com gráficos e análises.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background font-sans antialiased", inter.className)}>
        {/* Mantém o tema (claro/escuro) e injeta o provedor de autenticação */}
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
