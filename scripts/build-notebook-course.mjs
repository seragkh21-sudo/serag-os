/* Deterministic shared publication; keep archived batches and history IDs unchanged. */
import fs from 'node:fs';
const batches=['batch-001','batch-002','batch-003','batch-004','batch-005','batch-006','batch-007'].map(id=>JSON.parse(fs.readFileSync(`curriculum-data/${id}.json`,'utf8')));
const course={batch_id:'course-v1',review:{language_review_status:'editorially_reviewed',source_verification_status:'unverified_original_pdfs_unavailable'},batches:batches.map(b=>({batch_id:b.batch_id,sources:b.sources})),units:[],questions:[],writing_tasks:[]};
for(const batch of batches){
 if(batch.review?.language_review_status!=='editorially_reviewed')throw Error('Unreviewed batch');
 course.units.push(...batch.units.map(u=>({...u,batch_id:batch.batch_id,lessons:u.lessons.map(l=>({...l,batch_id:batch.batch_id}))})));
 course.questions.push(...batch.questions.map(q=>({...q,batch_id:batch.batch_id})));
 course.writing_tasks.push(...batch.writing_tasks.map(t=>({...t,batch_id:batch.batch_id,word_range:t.word_range||(batch.batch_id==='batch-001'?'50–80':'60–90')})));
}
for(const [name,rows,key] of [['unit',course.units,'id'],['lesson',course.units.flatMap(u=>u.lessons),'id'],['question',course.questions,'canonical_id']])if(new Set(rows.map(r=>r[key])).size!==rows.length)throw Error(`Duplicate ${name} ID`);
fs.writeFileSync('curriculum-data/course-v1.json',JSON.stringify(course,null,2)+'\n');
console.log(`Shared Foundations course: ${course.units.flatMap(u=>u.lessons).length} lessons, ${course.questions.length} questions.`);
