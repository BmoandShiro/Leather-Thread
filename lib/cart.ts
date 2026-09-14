import {findProduct} from './catalog';
export type CartLine={productId:string;colorId:string;quantity:number};
export const CART_KEY='leather-thread-bag-v1';
export const lineKey=(line:CartLine)=>`${line.productId}:${line.colorId}`;
export function validLine(line:unknown):line is CartLine {
 if(!line||typeof line!=='object') return false;
 const l=line as CartLine,p=findProduct(l.productId);
 return !!p&&p.colors.some(c=>c.id===l.colorId)&&Number.isInteger(l.quantity)&&l.quantity>=1&&l.quantity<=99;
}
export function readCart(raw:string|null):CartLine[]{
 try{const parsed=JSON.parse(raw||'[]');if(!Array.isArray(parsed))return [];return parsed.filter(validLine).reduce((a:CartLine[],l:CartLine)=>addLine(a,l),[])}catch{return []}
}
export function addLine(cart:CartLine[],line:CartLine):CartLine[]{
 if(!validLine(line)) throw new Error('Choose a valid product, color and quantity from 1 to 99.');
 const key=lineKey(line);return cart.some(l=>lineKey(l)===key)?cart.map(l=>lineKey(l)===key?{...l,quantity:Math.min(99,l.quantity+line.quantity)}:l):[...cart,{...line}];
}
export function changeQuantity(cart:CartLine[],key:string,quantity:number):CartLine[]{
 if(!Number.isInteger(quantity)||quantity<0||quantity>99)throw new Error('Quantity must be between 0 and 99.');
 return quantity===0?cart.filter(l=>lineKey(l)!==key):cart.map(l=>lineKey(l)===key?{...l,quantity}:l);
}
export const subtotal=(cart:CartLine[])=>cart.reduce((sum,l)=>sum+(findProduct(l.productId)?.price||0)*l.quantity,0);
