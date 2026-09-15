import {z} from 'zod';
export const personal={first_name:z.string().trim().min(1).max(80),last_name:z.string().trim().min(1).max(80),email:z.email().max(254).transform(v=>v.toLowerCase())};
export const record=z.string().regex(/^\d{5,20}$/,'El registro debe contener entre 5 y 20 dígitos.');
export const password=z.string().min(8,'La contraseña requiere al menos 8 caracteres.').refine(v=>Buffer.byteLength(v,'utf8')<=72,'La contraseña no puede superar 72 bytes.');
export const registration=z.strictObject({...personal,academic_record:record,password});
export const login=z.strictObject({academic_record:record,password:z.string().min(1)});
export const recovery=z.strictObject({academic_record:record,email:personal.email,password});
export const profile=z.strictObject(personal);
export const post=z.strictObject({course_id:z.number().int().positive().nullable().optional(),teacher_id:z.number().int().positive().nullable().optional(),message:z.string().trim().min(1).max(3000)}).refine(v=>Boolean(v.course_id)!==Boolean(v.teacher_id),'Selecciona exactamente un curso o un docente.');
export const comment=z.strictObject({message:z.string().trim().min(1).max(2000)});
export const approved=z.strictObject({course_id:z.number().int().positive()});
export function id(value){const n=Number(value);if(!Number.isSafeInteger(n)||n<=0)throw Object.assign(new Error('Identificador inválido.'),{status:400});return n;}
export function fail(status,message){throw Object.assign(new Error(message),{status});}
