import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import db,{uploadDir} from '../server/db.mjs';

const catalog={
 'Mandala Bonus Bundle':{handle:'mandala-bonus-bundle-yarn',weight:'3 Light / DK',fiber:'Acrylic',fiber_detail:'100% Acrylic',yardage:1181,skein_weight_g:300,knit_gauge:'22 sts x 30 rows / 4 in',crochet_gauge:'16 sc x 20 rows / 4 in',needle_size:'US 5 / 3.75 mm',hook_size:'H-8 / 5 mm',care:'Machine wash, machine dry'},
 Heartland:{handle:'heartland-yarn',weight:'4 Medium / Worsted',fiber:'Acrylic',fiber_detail:'100% Acrylic',yardage:251,skein_weight_g:142,knit_gauge:'16 sts x 22 rows / 4 in',crochet_gauge:'12 sc x 15 rows / 4 in',needle_size:'US 9 / 5.5 mm',hook_size:'J-10 / 6 mm',care:'Machine wash, machine dry'},
 Naptime:{handle:'a-star-is-born-naptime-yarn',weight:'4 Medium / Worsted',fiber:'Polyester',fiber_detail:'100% Polyester',yardage:306,skein_weight_g:100,knit_gauge:'18 sts x 26 rows / 4 in',crochet_gauge:'14 sc x 18 rows / 4 in',needle_size:'US 7 / 4.5 mm',hook_size:'H-8 / 5 mm',care:'Machine wash, machine dry'},
 'Basic Stitch Anti Pilling':{handle:'basic-stitch-anti-pilling-yarn',weight:'4 Medium / Worsted',fiber:'Acrylic',fiber_detail:'100% Acrylic',yardage:185,skein_weight_g:100,knit_gauge:'18 sts x 26 rows / 4 in',crochet_gauge:'16 sc x 18 rows / 4 in',needle_size:'US 8 / 5 mm',hook_size:'H-8 / 5 mm',care:'Machine wash, machine dry'},
 'Feels Like Butta':{handle:'feels-like-butta',weight:'4 Medium / Worsted',fiber:'Polyester',fiber_detail:'100% Polyester',yardage:218,skein_weight_g:100,knit_gauge:'18 sts x 26 rows / 4 in',crochet_gauge:'16 sc x 19 rows / 4 in',needle_size:'US 7 / 4.5 mm',hook_size:'G-6 / 4 mm',care:'Machine wash, machine dry'},
 'Ferris Wheel':{handle:'ferris-wheel-yarn',weight:'4 Medium / Worsted',fiber:'Acrylic',fiber_detail:'100% Acrylic',yardage:270,skein_weight_g:85,knit_gauge:'20 sts x 20 rows / 4 in',crochet_gauge:'14 sc x 20 rows / 4 in',needle_size:'US 7 / 4.5 mm',hook_size:'H-8 / 5 mm',care:'Machine wash, machine dry'},
 Mandala:{handle:'mandala-yarn',weight:'3 Light / DK',fiber:'Acrylic',fiber_detail:'100% Acrylic',yardage:590,skein_weight_g:150,knit_gauge:'22 sts x 30 rows / 4 in',crochet_gauge:'16 sc x 20 rows / 4 in',needle_size:'US 5 / 3.75 mm',hook_size:'H-8 / 5 mm',care:'Machine wash, machine dry'},
 'Landscapes Renewed':{handle:'landscapes-renewed',weight:'4 Medium / Worsted',fiber:'Polyester',fiber_detail:'75% Polyester, 25% Recycled Polyester',yardage:232,skein_weight_g:150,knit_gauge:'16 sts x 24 rows / 4 in',crochet_gauge:'12 sc x 16 rows / 4 in',needle_size:'US 9 / 5.5 mm',hook_size:'I-9 / 5.5 mm',care:'Machine wash gentle, tumble dry low'},
 'Mandala Ombre':{handle:'mandala-ombre-yarn',weight:'4 Medium / Worsted',fiber:'Acrylic',fiber_detail:'100% Acrylic',yardage:344,skein_weight_g:150,knit_gauge:'20 sts x 27 rows / 4 in',crochet_gauge:'14 sc x 20 rows / 4 in',needle_size:'US 7 / 4.5 mm',hook_size:'I-9 / 5.5 mm',care:'Machine wash, machine dry'},
 'Color Theory':{handle:'color-theory-yarn',weight:'4 Medium / Worsted',fiber:'Acrylic',fiber_detail:'100% Acrylic',yardage:246,skein_weight_g:100,knit_gauge:'20 sts x 27 rows / 4 in',crochet_gauge:'14 sc x 20 rows / 4 in',needle_size:'US 7 / 4.5 mm',hook_size:'I-9 / 5.5 mm',care:'Machine wash, machine dry'},
 'Wool-Ease':{handle:'wool-ease-yarn',weight:'4 Medium / Worsted',fiber:'Acrylic, Wool',fiber_detail:'80% Acrylic, 20% Wool',yardage:197,skein_weight_g:85,knit_gauge:'18 sts x 24 rows / 4 in',crochet_gauge:'13.2 sc x 16 rows / 4 in',needle_size:'US 8 / 5 mm',hook_size:'J-10 / 6 mm',care:'Machine wash, machine dry'},
 '24/7 Cotton':{handle:'24-7-cotton',weight:'4 Medium / Worsted',fiber:'Cotton',fiber_detail:'100% Mercerized Cotton',yardage:185,skein_weight_g:100,knit_gauge:'20 sts x 28 rows / 4 in',crochet_gauge:'14 sc x 19 rows / 4 in',needle_size:'US 6 / 4 mm',hook_size:'G-6 / 4 mm',care:'Machine wash, machine dry'},
 'Pima Cotton':{handle:'lion-brand-r-pima-cotton-yarn',weight:'4 Medium / Worsted',fiber:'Cotton',fiber_detail:'100% Pima Cotton',yardage:186,skein_weight_g:100,knit_gauge:'19 sts x 26 rows / 4 in',crochet_gauge:'16 sc x 18 rows / 4 in',needle_size:'US 8 / 5 mm',hook_size:'I-9 / 5.5 mm',care:'Machine wash, machine dry'},
 '24/7 Cotton DK':{handle:'24-7-cotton-dk-yarn',weight:'3 Light / DK',fiber:'Cotton',fiber_detail:'100% Cotton',yardage:273,skein_weight_g:100,knit_gauge:'24 sts x 28 rows / 4 in',crochet_gauge:'16 sts x 20 rows / 4 in',needle_size:'US 6 / 4 mm',hook_size:'G-6 / 4 mm',care:'Machine wash gentle, tumble dry low'},
 Truboo:{handle:'truboo-yarn',weight:'3 Light / DK',fiber:'Bamboo, Rayon',fiber_detail:'100% Rayon from Bamboo',yardage:241,skein_weight_g:100,knit_gauge:'23 sts x 32 rows / 4 in',crochet_gauge:'18 sc x 20 rows / 4 in',needle_size:'US 6 / 4 mm',hook_size:'G-6 / 4 mm',care:'Machine wash, lay flat to dry'}
};

const yarns=db.prepare('SELECT id,line,color_name,color_code FROM yarns ORDER BY id').all();
const update=db.prepare(`UPDATE yarns SET weight=@weight,fiber=@fiber,fiber_detail=@fiber_detail,yardage=@yardage,skein_weight_g=@skein_weight_g,knit_gauge=@knit_gauge,crochet_gauge=@crochet_gauge,needle_size=@needle_size,hook_size=@hook_size,care=@care,source_url=@source_url,source_checked_at=@source_checked_at,official_image_url=@official_image_url,updated_at=CURRENT_TIMESTAMP WHERE id=@id`);
const addFile=db.prepare(`INSERT OR IGNORE INTO files(stored_name,original_name,mime_type,size,sha256,kind,yarn_id,ocr_status) VALUES(?,?,?,?,?,'yarn_photo',?,'not_requested')`);
let completed=0;
for(const [line,spec] of Object.entries(catalog)){
 const sourceUrl=`https://www.lionbrand.com/products/${spec.handle}`;
 const response=await fetch(`${sourceUrl}.js`);if(!response.ok)throw new Error(`${line}: ${response.status}`);
 const product=await response.json();
 for(const yarn of yarns.filter(y=>y.line===line)){
   const variant=product.variants.find(v=>v.title.toLowerCase()===yarn.color_name.toLowerCase());
   if(!variant)throw new Error(`${line}: color ${yarn.color_name} was not found in the official catalog`);
   const imageUrl=variant.featured_image?.src||variant.featured_media?.preview_image?.src||product.featured_image;
   let storedName=null;
   if(imageUrl){const image=await fetch(imageUrl);if(!image.ok)throw new Error(`${line}/${yarn.color_name}: image ${image.status}`);const bytes=Buffer.from(await image.arrayBuffer());const ext=(new URL(imageUrl).pathname.match(/\.(png|webp|jpe?g)$/i)?.[1]||'jpg').replace('jpeg','jpg').toLowerCase();storedName=`lionbrand-yarn-${yarn.id}.${ext}`;fs.writeFileSync(path.join(uploadDir,storedName),bytes);addFile.run(storedName,`${line} - ${yarn.color_name}.${ext}`,image.headers.get('content-type')||`image/${ext}`,bytes.length,crypto.createHash('sha256').update(bytes).digest('hex'),yarn.id)}
   const tailored={...spec};if(line==='Basic Stitch Anti Pilling'&&yarn.color_name==='Almond Tweed'){tailored.yardage=159;tailored.skein_weight_g=85}if(line==='Pima Cotton'&&yarn.color_name==='Pink Mist'){tailored.yardage=157;tailored.skein_weight_g=85}
   update.run({...tailored,id:yarn.id,source_url:sourceUrl,source_checked_at:new Date().toISOString(),official_image_url:imageUrl||null});completed++;
 }
}
console.log(`Enriched ${completed} yarn variants from Lion Brand product data.`);
