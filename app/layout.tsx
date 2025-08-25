import type { Metadata } from "next";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import "./globals.css";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";

export const metadata: Metadata = {
  title: "Releasify",
  description: "New releases, one click away",
};
const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased`}>
        <AppRouterCacheProvider>{children}</AppRouterCacheProvider>
      </body>
    </html>
  );
}
