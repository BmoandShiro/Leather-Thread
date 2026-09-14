import test,{after} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const dir=fs.mkdtempSync(path.join(os.tmpdir(),'leather-thread-test-'));
process.env.LEATHER_THREAD_DATA_DIR=dir;
process.env.OWNER_PASSWORD='test-only-password';
const {default:db,migrate,seed}=await import('../server/db.mjs');
after(()=>{db.close();fs.rmSync(dir,{recursive:true,force:true})});

test('migrations are repeatable and seed the complete supplied slip',()=>{
 migrate();seed();migrate();seed();
 assert.equal(db.prepare('SELECT COUNT(*) n FROM schema_migrations').get().n,1);
 assert.equal(db.prepare('SELECT COUNT(*) n FROM yarns').get().n,25);
 assert.equal(db.prepare('SELECT SUM(quantity_current) n FROM purchase_lots').get().n,25);
 assert.equal(db.prepare('SELECT COUNT(*) n FROM orders').get().n,1);
 assert.equal(db.prepare("SELECT COUNT(*) n FROM yarns WHERE verification_status='needs_review'").get().n,25);
 assert.equal(db.prepare("SELECT sku_upc FROM yarns WHERE line='Truboo' AND color_name='Thistle'").get().sku_upc,'32421798215773');
});

test('database enforces unique SKU and rating range',()=>{
 assert.throws(()=>db.prepare("INSERT INTO yarns(brand,line,color_name,sku_upc) VALUES('X','Y','Z','023032079851')").run());
 assert.throws(()=>db.prepare("INSERT INTO yarns(brand,line,color_name,rating) VALUES('X','Y','Z',6)").run());
});
