import './globals.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ToasterProvider from '../components/ToasterProvider';
import { AuthProvider } from '../components/AuthProvider';

export const metadata = {
  title: 'Sahayota | Accident & Emergency Response',
  description: 'Real-time accident, hospital and emergency information for Bangladesh.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="font-body">
        <AuthProvider>
          <Navbar />
          {children}
          <Footer />
        </AuthProvider>
        <ToasterProvider />
      </body>
    </html>
  );
}