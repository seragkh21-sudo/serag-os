/* Deterministic shared publication; keep archived batches and history IDs unchanged. */
import fs from 'node:fs';
import { manifest } from '../curriculum-data/manifest-v1.mjs';
import { enrichment } from '../curriculum-data/enrichment-v1.mjs';
const batches=['batch-001','batch-002','batch-003','batch-004','batch-005','batch-006','batch-007','batch-008'].map(id=>JSON.parse(fs.readFileSync(`curriculum-data/${id}.json`,'utf8')));
const course={batch_id:'course-v1',review:{language_review_status:'editorially_reviewed',source_verification_status:'unverified_original_pdfs_unavailable'},batches:batches.map(b=>({batch_id:b.batch_id,sources:b.sources})),units:[],questions:[],writing_tasks:[]};
for(const batch of batches){
 if(batch.review?.language_review_status!=='editorially_reviewed')throw Error('Unreviewed batch');
 course.units.push(...batch.units.map(u=>({...u,batch_id:batch.batch_id,lessons:u.lessons.map(l=>({...l,batch_id:batch.batch_id}))})));
 course.questions.push(...batch.questions.map(q=>({...q,batch_id:batch.batch_id})));
 course.writing_tasks.push(...batch.writing_tasks.map(t=>({...t,batch_id:batch.batch_id,word_range:t.word_range||(batch.batch_id==='batch-001'?'50–80':'60–90')})));
}
// Editorial corrections retain the published canonical IDs and original batch files.
const subjectQuestion=course.questions.find(q=>q.id==='q01');
subjectQuestion.explanation="The simple subject is the head noun or pronoun of the subject phrase, without its modifiers. Here, 'instructor' is the simple subject.";
const movementQuestion=course.questions.find(q=>q.id==='q95');
movementQuestion.explanation='Into describes entry into the building, and to marks the floor as the destination. The answer needs two preposition tiles: one for the building and one for the floor.';
for(const [name,rows,key] of [['unit',course.units,'id'],['lesson',course.units.flatMap(u=>u.lessons),'id'],['question',course.questions,'canonical_id']])if(new Set(rows.map(r=>r[key])).size!==rows.length)throw Error(`Duplicate ${name} ID`);
const lessonIds=new Set(course.units.flatMap(u=>u.lessons.map(l=>l.id)));
if(manifest.lessons.length!==lessonIds.size||new Set(manifest.lessons.map(l=>l.id)).size!==lessonIds.size||manifest.lessons.some(l=>!lessonIds.has(l.id)||!l.topic||!l.objective))throw Error('Invalid curriculum manifest');
for(const q of enrichment.questions){
 if(!lessonIds.has(q.lesson_id)||course.questions.some(old=>old.canonical_id===q.canonical_id))throw Error('Invalid enrichment question identity');
 course.questions.push(q);
}
course.manifest=manifest;
fs.writeFileSync('curriculum-data/course-v1.json',JSON.stringify(course,null,2)+'\n');
console.log(`Shared Foundations course: ${course.units.flatMap(u=>u.lessons).length} lessons, ${course.questions.length} questions.`);
