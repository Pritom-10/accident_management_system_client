import './globals.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export const metadata = {
  title: 'Sahayota | Accident & Emergency Response',
  description: 'Real-time accident, missing person and emergency information for Bangladesh.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="font-body">
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
