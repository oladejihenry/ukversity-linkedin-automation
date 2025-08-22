'use client'

import * as React from 'react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import TanstackProviders from './tanstack-provider'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TanstackProviders>
      <NextThemesProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
        enableColorScheme
      >
        {children}
      </NextThemesProvider>
    </TanstackProviders>
  )
}
