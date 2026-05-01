import './globals.css';
import { GeistSans } from 'geist/font/sans';
import Providers from './providers';

export const metadata = {
  title: 'SmartShop AI - Mua sắm thông minh',
  description: 'Hệ thống thương mại điện tử thông minh tích hợp AI',
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi" className={GeistSans.variable}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
