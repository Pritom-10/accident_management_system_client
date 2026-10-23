import './globals.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SosFab from '../components/SosFab';
import ToasterProvider from '../components/ToasterProvider';
import MotionProvider from '../components/MotionProvider';
import { AuthProvider } from '../components/AuthProvider';

export const metadata = {
  title: 'Sahayota | Accident & Emergency Response',
  description: 'Accident news, SOS alerts, blood donors, treatment fundraising and hospital information for Bangladesh.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="font-body">
        <MotionProvider>
          <AuthProvider>
            <Navbar />
            {children}
            <Footer />
            <SosFab />
          </AuthProvider>
        </MotionProvider>
        <ToasterProvider />
      </body>
    </html>
  );
}