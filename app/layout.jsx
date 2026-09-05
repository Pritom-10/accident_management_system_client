import './globals.css';

export const metadata = {
  title: "ResQ | Accident & Emergency Response",
  description:
    "Real-time accident, missing person and emergency information for Bangladesh.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="font-body">{children}</body>
    </html>
  );
}
