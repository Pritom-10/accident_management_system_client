import './globals.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SosFab from '../components/SosFab';
import ToasterProvider from '../components/ToasterProvider';
import MotionProvider from '../components/MotionProvider';
import { AuthProvider } from '../components/AuthProvider';
import { PwaProvider } from '../components/pwa/PwaProvider';
import NetworkBanner from '../components/pwa/NetworkBanner';
import InstallBanner from '../components/pwa/InstallBanner';

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  openGraph: { siteName: 'Sahayota', type: 'website' },
  title: 'Sahayota | Accident & Emergency Response',
  description: 'Accident news, SOS alerts, blood donors, treatment fundraising and hospital information for Bangladesh.',
  applicationName: 'Sahayota',
  appleWebApp: { capable: true, title: 'Sahayota', statusBarStyle: 'default' },
  icons: { apple: '/pwa-icon/180' },
};

export const viewport = {
  themeColor: '#F4F6FB',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="font-body">
        <MotionProvider>
          <PwaProvider>
            <AuthProvider>
              <Navbar />
              {children}
              <Footer />
              <SosFab />
              <NetworkBanner />
              <InstallBanner />
            </AuthProvider>
          </PwaProvider>
        </MotionProvider>
        <ToasterProvider />
      </body>
    </html>
  );
}