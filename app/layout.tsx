import type { Metadata } from 'next';
import './globals.css';
import {ShopProvider} from '@/components/shop-provider';
export const metadata: Metadata = {title:'Leather & Thread — A little warmth. A lot of character.',description:'Discover the first Leather & Thread beanie collection. An early look at everyday warmth with a little more character.'};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="en" className="dark"><body><ShopProvider>{children}</ShopProvider></body></html>}
