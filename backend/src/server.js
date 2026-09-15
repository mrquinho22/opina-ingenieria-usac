import {app} from './app.js';
import {config} from './config.js';
import {pool} from './db.js';
import express from 'express';
import {fileURLToPath} from 'node:url';
import {existsSync} from 'node:fs';
const web=fileURLToPath(new URL('../../frontend/dist/frontend/browser',import.meta.url));
if(existsSync(web)){app.use(express.static(web));app.get('/{*path}',(req,res)=>res.sendFile(web+'/index.html'));}
await pool.query('SELECT 1');
const server=app.listen(config.port,'127.0.0.1',()=>console.log(`Opina: http://127.0.0.1:${config.port}`));
for(const sig of ['SIGINT','SIGTERM'])process.on(sig,()=>server.close(async()=>{await pool.end();process.exit(0);}));
