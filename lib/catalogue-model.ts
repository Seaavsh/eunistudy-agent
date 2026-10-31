export type EvidenceField<T>={value:T|null;source:string|null;checkedAt:string|null;status:'verified'|'unknown'|'stale'};
export type ProgrammeRecord={id:string;university:EvidenceField<string>;country:EvidenceField<string>;title:EvidenceField<string>;degree:EvidenceField<string>;subject:EvidenceField<string>;language:EvidenceField<string>;intake:EvidenceField<string>;tuition:EvidenceField<string>;requirements:EvidenceField<string>;scholarships:EvidenceField<string>;deadline:EvidenceField<string>;applicationStatus:EvidenceField<string>};
type OfficialRecord={id:string;university?:string;country?:string;title?:string;degree?:string;subject?:string;language?:string;intake?:string;tuition?:string|null;requirements?:string|null;scholarships?:string|null;deadline?:string;applicationStatus?:string;source?:string;checked?:string};
export function evidence(value:string|null|undefined,source:string|undefined,checkedAt:string|undefined,asOf=new Date(),maxAgeDays=180):EvidenceField<string>{
 if(!value||value.trim().toLowerCase()==='unknown'||!source||!checkedAt)return {value:null,source:null,checkedAt:null,status:'unknown'};
 const checked=new Date(`${checkedAt}T00:00:00Z`);if(!Number.isFinite(checked.getTime())||checked>asOf)return {value:null,source:null,checkedAt:null,status:'unknown'};
 return {value,source,checkedAt,status:(asOf.getTime()-checked.getTime())/86400000>maxAgeDays?'stale':'verified'};
}
export function normaliseOfficial(record:OfficialRecord,asOf=new Date()):ProgrammeRecord{
 const field=(v:string|null|undefined)=>evidence(v,record.source,record.checked,asOf);
 return {id:record.id,university:field(record.university),country:field(record.country),title:field(record.title),degree:field(record.degree),subject:field(record.subject),language:field(record.language),intake:field(record.intake),tuition:field(record.tuition),requirements:field(record.requirements),scholarships:field(record.scholarships),deadline:field(record.deadline),applicationStatus:field(record.applicationStatus)};
}
