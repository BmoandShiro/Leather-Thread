import fs from 'node:fs'; import path from 'node:path'; import db,{dataDir,uploadDir} from './db.mjs';
const stamp=new Date().toISOString().replaceAll(':','-').replaceAll('.','-'); const dir=path.join(dataDir,'backups',stamp); fs.mkdirSync(dir,{recursive:true});
await db.backup(path.join(dir,'leather-thread.sqlite')); if(fs.existsSync(uploadDir))fs.cpSync(uploadDir,path.join(dir,'uploads'),{recursive:true}); console.log(`Backup created: ${dir}`);
