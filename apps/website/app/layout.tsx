import '../styles/globals.css';
import { Inter } from 'next/font/google';
import React from 'react';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'LMStory - Modern LMS',
  description: 'The Next-Generation Learning Management System',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.className} bg-gray-900 text-white min-h-screen flex flex-col antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
