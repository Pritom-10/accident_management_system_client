import './globals.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ToasterProvider from '../components/ToasterProvider';

export const metadata = {
  title: 'ResQ',
  description: 'Real-time accident, missing person and emergency information for Bangladesh.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="font-body">
        <Navbar />
        {children}
        <Footer />
        <ToasterProvider />
      </body>
    </html>
  );
}
