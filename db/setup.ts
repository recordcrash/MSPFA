import type {} from '../types/global';
import dotenv from 'dotenv';
dotenv.config({ path: `.env.${process.argv[2] || 'development'}` });
import { db } from './connect';

Promise.all([
	db.createCollection('users'),
	db.createCollection('comics'),
	db.createCollection('messages')
]).catch(() => {}).finally(() => {
	process.exit();
});

export {};