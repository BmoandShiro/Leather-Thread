import {notFound} from 'next/navigation';
import {findProduct,products} from '@/lib/catalog';
import {ProductDetail} from '@/components/product-detail';
export function generateStaticParams(){return products.map(p=>({slug:p.id}))}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const p=findProduct(slug);return {title:p?`${p.name} — Leather & Thread`:'Product not found — Leather & Thread'}}
export default async function ProductPage({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const product=findProduct(slug);if(!product)notFound();return <ProductDetail key={product.id} product={product}/>}
