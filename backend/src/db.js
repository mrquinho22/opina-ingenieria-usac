import mysql from 'mysql2/promise';
import {config} from './config.js';
export const pool=mysql.createPool({...config.db,connectionLimit:10});
export async function query(sql,params=[]) {const [rows]=await pool.execute(sql,params);return rows;}
