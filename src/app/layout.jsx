import './globals.css';
import { LanguageProvider } from '@/components/LanguageContext';
import { AuthProvider } from '@/components/AuthContext';
import { ThemeProvider } from '@/components/ThemeContext';
import Nav from '@/components/Nav';

export const metadata = {
    title: 'AgroConnect',
    description: 'Farmer-to-Consumer Direct Marketplace',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <head>
                <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />
            </head>
            <body>
                <ThemeProvider>
                    <AuthProvider>
                        <LanguageProvider>
                            <Nav />
                            <main>{children}</main>
                        </LanguageProvider>
                    </AuthProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
