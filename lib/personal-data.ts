import type {DatabaseSync} from 'node:sqlite';
export const personalStateKeys=['profile','messages','shortlist','realShortlist','studentArchives'] as const;
export function deletePersonalState(db:DatabaseSync){
 db.exec('BEGIN IMMEDIATE');try{const del=db.prepare('DELETE FROM state WHERE key=?');for(const key of personalStateKeys)del.run(key);db.exec('COMMIT')}catch(e){db.exec('ROLLBACK');throw e}
}
