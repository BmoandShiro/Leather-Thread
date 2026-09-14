import {DatabaseSync} from 'node:sqlite';
import bcrypt from 'bcryptjs';
import fs from 'node:fs';
import path from 'node:path';

export const rootDir=path.resolve(import.meta.dirname,'..');
export const dataDir=path.resolve(rootDir,process.env.LEATHER_THREAD_DATA_DIR||'data');
export const uploadDir=path.join(dataDir,'uploads');
fs.mkdirSync(uploadDir,{recursive:true});
const raw=new DatabaseSync(path.join(dataDir,'leather-thread.sqlite'));
export const dbFile=path.join(dataDir,'leather-thread.sqlite');
const db={
 prepare:(sql)=>raw.prepare(sql),exec:(sql)=>raw.exec(sql),close:()=>raw.close(),
 pragma:(sql)=>raw.exec(`PRAGMA ${sql}`),
 transaction:(fn)=>()=>{raw.exec('BEGIN IMMEDIATE');try{const result=fn();raw.exec('COMMIT');return result}catch(error){raw.exec('ROLLBACK');throw error}},
 backup:async destination=>{const escaped=destination.replaceAll("'","''");raw.exec(`VACUUM INTO '${escaped}'`)}
};
db.pragma('journal_mode = WAL'); db.pragma('foreign_keys = ON'); db.pragma('busy_timeout = 5000');

const migrations=[String.raw`
CREATE TABLE IF NOT EXISTS schema_migrations(version INTEGER PRIMARY KEY, applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS owner_users(id INTEGER PRIMARY KEY, username TEXT NOT NULL UNIQUE COLLATE NOCASE, password_hash TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS sessions(id TEXT PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES owner_users(id) ON DELETE CASCADE, expires_at TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS login_attempts(ip TEXT NOT NULL, attempted_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS product_categories(id INTEGER PRIMARY KEY, name TEXT NOT NULL UNIQUE COLLATE NOCASE);
CREATE TABLE IF NOT EXISTS yarns(id INTEGER PRIMARY KEY, brand TEXT NOT NULL, line TEXT NOT NULL, article TEXT, color_name TEXT NOT NULL, color_code TEXT, sku_upc TEXT UNIQUE, fiber TEXT, weight TEXT, yardage REAL, notes TEXT, rating INTEGER CHECK(rating BETWEEN 0 AND 5), verification_status TEXT NOT NULL DEFAULT 'verified' CHECK(verification_status IN ('verified','needs_review')), created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS yarn_categories(yarn_id INTEGER NOT NULL REFERENCES yarns(id) ON DELETE CASCADE, category_id INTEGER NOT NULL REFERENCES product_categories(id) ON DELETE CASCADE, PRIMARY KEY(yarn_id,category_id));
CREATE TABLE IF NOT EXISTS orders(id INTEGER PRIMARY KEY, vendor TEXT NOT NULL, order_number TEXT, pick_number TEXT, alt_po TEXT, order_date TEXT, start_date TEXT, end_date TEXT, total_cents INTEGER, notes TEXT, verification_status TEXT NOT NULL DEFAULT 'verified' CHECK(verification_status IN ('verified','needs_review')), created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS purchase_lots(id INTEGER PRIMARY KEY, yarn_id INTEGER NOT NULL REFERENCES yarns(id), order_id INTEGER REFERENCES orders(id), order_line INTEGER, quantity_ordered INTEGER NOT NULL DEFAULT 0, quantity_received INTEGER NOT NULL DEFAULT 0, quantity_current INTEGER NOT NULL DEFAULT 0, unit_cost_cents INTEGER, dye_lot TEXT, purchase_date TEXT, package_value INTEGER, notes TEXT, verification_status TEXT NOT NULL DEFAULT 'verified' CHECK(verification_status IN ('verified','needs_review')), created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS designs(id INTEGER PRIMARY KEY, name TEXT NOT NULL, architecture TEXT NOT NULL, instructions TEXT NOT NULL DEFAULT '', tools TEXT, sizing TEXT, gauge TEXT, yardage_requirement TEXT, material_requirements TEXT, status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','tested','active','archived')), created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS design_yarns(design_id INTEGER NOT NULL REFERENCES designs(id) ON DELETE CASCADE, yarn_id INTEGER NOT NULL REFERENCES yarns(id) ON DELETE CASCADE, PRIMARY KEY(design_id,yarn_id));
CREATE TABLE IF NOT EXISTS files(id INTEGER PRIMARY KEY, stored_name TEXT NOT NULL UNIQUE, original_name TEXT NOT NULL, mime_type TEXT NOT NULL, size INTEGER NOT NULL, sha256 TEXT NOT NULL, kind TEXT NOT NULL CHECK(kind IN ('receipt','yarn_photo','design_file')), yarn_id INTEGER REFERENCES yarns(id) ON DELETE CASCADE, design_id INTEGER REFERENCES designs(id) ON DELETE CASCADE, order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE, ocr_status TEXT NOT NULL DEFAULT 'not_requested' CHECK(ocr_status IN ('not_requested','pending','complete','failed','unsupported')), ocr_text TEXT, ocr_draft TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE INDEX IF NOT EXISTS idx_yarns_brand_line_color ON yarns(brand,line,color_name);
CREATE INDEX IF NOT EXISTS idx_yarns_article_color_code ON yarns(article,color_code);
CREATE INDEX IF NOT EXISTS idx_lots_yarn ON purchase_lots(yarn_id);
CREATE INDEX IF NOT EXISTS idx_lots_order ON purchase_lots(order_id);
CREATE INDEX IF NOT EXISTS idx_files_order ON files(order_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);
`,String.raw`
ALTER TABLE yarns ADD COLUMN fiber_detail TEXT;
ALTER TABLE yarns ADD COLUMN skein_weight_g REAL;
ALTER TABLE yarns ADD COLUMN knit_gauge TEXT;
ALTER TABLE yarns ADD COLUMN crochet_gauge TEXT;
ALTER TABLE yarns ADD COLUMN needle_size TEXT;
ALTER TABLE yarns ADD COLUMN hook_size TEXT;
ALTER TABLE yarns ADD COLUMN care TEXT;
ALTER TABLE yarns ADD COLUMN source_url TEXT;
ALTER TABLE yarns ADD COLUMN source_checked_at TEXT;
ALTER TABLE yarns ADD COLUMN official_image_url TEXT;
CREATE INDEX IF NOT EXISTS idx_yarns_weight ON yarns(weight);
CREATE INDEX IF NOT EXISTS idx_yarns_fiber ON yarns(fiber);
`];

export function migrate(){
 db.exec('CREATE TABLE IF NOT EXISTS schema_migrations(version INTEGER PRIMARY KEY, applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)');
 const applied=new Set(db.prepare('SELECT version FROM schema_migrations').all().map(r=>r.version));
 migrations.forEach((sql,i)=>{const version=i+1;if(!applied.has(version))db.transaction(()=>{db.exec(sql);db.prepare('INSERT INTO schema_migrations(version) VALUES(?)').run(version)})();});
 db.pragma('optimize');
}

const seedYarns=[
['125','210Z','Mandala Bonus Bundle','Pegasus','023032079851',24],['125','267H','Mandala Bonus Bundle','Sinestro','023032191362',24],['136','147N','Heartland','Hot Springs','32420919246941',60],['171','110','Naptime','Navy','32643997007965',90],['171','146B','Naptime','Lilac','32643997597789',90],['202','147B','Basic Stitch Anti Pilling','Purple','32421735891037',96],['202','407K','Basic Stitch Anti Pilling','Pine Heather','023032080963',96],['202','500X','Basic Stitch Anti Pilling','Almond Tweed','023032080949',120],['215','134AB','Feels Like Butta','Peach','023032133133',90],['215','145S','Feels Like Butta','Periwinkle','023032080765',90],['215','172Q','Feels Like Butta','Seagreen','023032080772',90],['217','609H','Ferris Wheel','Morning Java','32421655412829',108],['525','279F','Mandala','Sandman','023032137711',48],['542','206AQ','Landscapes Renewed','Marble','023032133713',60],['542','212AK','Landscapes Renewed',"Tiger's Eye",'023032133775',60],['551','201CM','Mandala Ombre','Cool','32421728485469',60],['619','173AE','Color Theory','Caper','023032116310',96],['620','006B','Wool-Ease','Icicle','32691681787997',120],['620','139','Wool-Ease','Dark Rose Heather','32420966891613',120],['761','098C','24/7 Cotton','Ecru','32420981211229',105],['761','132EF','24/7 Cotton','Creamsicle','32990474240093',105],['762','148AB','Pima Cotton','Rain Cloud','32657094180957',60],['762','503X','Pima Cotton','Pink Mist','023032078625',78],['769','504J','24/7 Cotton DK','Azul','023032127354',90],['837','146AG','Truboo','Thistle','32421798215773',90]
];
export function seed(){
 const owner=process.env.OWNER_USERNAME||'owner', password=process.env.OWNER_PASSWORD||'change-this-before-network-access';
 if(!db.prepare('SELECT 1 FROM owner_users').get())db.prepare('INSERT INTO owner_users(username,password_hash) VALUES(?,?)').run(owner,bcrypt.hashSync(password,12));
 db.prepare("INSERT OR IGNORE INTO product_categories(name) VALUES('Hat')").run();
 if(db.prepare('SELECT COUNT(*) count FROM yarns').get().count===0)db.transaction(()=>{
   const orderId=Number(db.prepare("INSERT INTO orders(vendor,order_number,pick_number,alt_po,order_date,start_date,end_date,notes,verification_status) VALUES('Lion Brand Yarn Company','7438894','10377721','7654587400285','2026-09-05','2026-09-05','2026-09-12','Seeded from supplied packing slip; all transcribed fields require owner verification.','needs_review')").run().lastInsertRowid);
   const addYarn=db.prepare("INSERT INTO yarns(brand,line,article,color_name,color_code,sku_upc,verification_status) VALUES('Lion Brand',?,?,?,?,?,'needs_review')");
   const addLot=db.prepare("INSERT INTO purchase_lots(yarn_id,order_id,order_line,quantity_ordered,quantity_received,quantity_current,purchase_date,package_value,verification_status) VALUES(?,?,?,?,?,?,?,?,'needs_review')");
   const addCat=db.prepare('INSERT INTO yarn_categories(yarn_id,category_id) VALUES(?,1)');
   seedYarns.forEach(([article,colorCode,line,color,sku,pkg],i)=>{const id=Number(addYarn.run(line,article,color,colorCode,sku).lastInsertRowid);addLot.run(id,orderId,i+1,1,1,1,'2026-09-05',pkg);addCat.run(id);});
 })();
}
migrate(); seed();
export default db;
