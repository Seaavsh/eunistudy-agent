const {DatabaseSync}=require('node:sqlite');
const fs=require('node:fs');
const records=JSON.parse(fs.readFileSync('vendor/official-programmes.json','utf8'));
const db=new DatabaseSync('data/eunistud.sqlite');
const insert=db.prepare('INSERT OR REPLACE INTO records(id,kind,content) VALUES(?,?,?)');
const remove=db.prepare('DELETE FROM knowledge WHERE id=?');
const index=db.prepare('INSERT INTO knowledge(id,content) VALUES(?,?)');
db.exec('BEGIN');try{for(const row of records){const content=JSON.stringify(row);insert.run(row.id,'verified_program',content);remove.run(row.id);index.run(row.id,content)}db.exec('COMMIT')}catch(e){db.exec('ROLLBACK');throw e}finally{db.close()}
console.log(`Imported ${records.length} official programme records.`);
