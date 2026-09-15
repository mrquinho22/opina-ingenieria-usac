import {Router} from 'express';
import {query} from './db.js';
import {fields} from './auth.js';
import * as v from './validation.js';
export const userRoutes=Router();
function owner(req){const userId=v.id(req.params.id);if(userId!==req.user.id)v.fail(403,'Solo puedes modificar tu propio perfil.');return userId;}
userRoutes.get('/by-record/:record',async(req,res)=>{const record=v.record.parse(req.params.record);const [u]=await query(`SELECT ${fields} FROM users WHERE academic_record=?`,[record]);if(!u)v.fail(404,'No existe un usuario con ese registro académico.');res.json(u);});
userRoutes.get('/:id',async(req,res)=>{const userId=v.id(req.params.id);const [u]=await query(`SELECT ${fields} FROM users WHERE id=?`,[userId]);if(!u)v.fail(404,'El usuario no existe.');const courses=await query('SELECT c.id,c.code,c.name,c.credits FROM approved_courses a JOIN courses c ON c.id=a.course_id WHERE a.user_id=? ORDER BY c.code',[userId]);res.json({...u,courses,total_credits:courses.reduce((s,c)=>s+c.credits,0)});});
userRoutes.patch('/:id',async(req,res)=>{const userId=owner(req),b=v.profile.parse(req.body);await query('UPDATE users SET first_name=?,last_name=?,email=? WHERE id=?',[b.first_name,b.last_name,b.email,userId]);res.json((await query(`SELECT ${fields} FROM users WHERE id=?`,[userId]))[0]);});
userRoutes.post('/:id/approved-courses',async(req,res)=>{const userId=owner(req),b=v.approved.parse(req.body);if(!(await query('SELECT id FROM courses WHERE id=?',[b.course_id])).length)v.fail(400,'El curso no existe.');await query('INSERT INTO approved_courses(user_id,course_id) VALUES(?,?)',[userId,b.course_id]);res.status(201).json({message:'Curso aprobado agregado.'});});
