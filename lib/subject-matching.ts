export function subjectMatches(title:string,requested=''):boolean {
 if(!requested)return true;
 const t=title.toLowerCase(),r=requested.toLowerCase();
 if(/computer engineering|ingegneria informatica/.test(r))return /computer engineering|ingegneria informatica/.test(t);
 if(r==='computing')return /comput|informat|software|artificial intelligence|data science/.test(t);
 if(r==='engineering')return /engineer|ingegner/.test(t);
 if(r==='business')return /business|econom|management|finance/.test(t);
 return t.includes(r);
}

export function subjectRelation(title:string,requested:string):'exact'|'related'|'none' {
 const t=title.toLowerCase().trim(),r=requested.toLowerCase().trim();
 if(r==='computer engineering'){
  if(/lehramt|berufspädagogik|berufliche und betriebliche bildung|bioinformatik|medizinische|biomedizinische/.test(t))return 'none';
  if(/^(computer engineering|ingegneria informatica)(?:\s*\(.*\))?$/i.test(t))return 'exact';
  return /computer engineering|informatik|computer science|embedded systems|informationstechnik|elektrotechnik/.test(t)?'related':'none';
 }
 if(r==='computer science'){
  if(/^(computer science|informatik)(?:\s*\(.*\))?$/i.test(t))return 'exact';
  return /computer science|informatik|software engineering/.test(t)?'related':'none';
 }
 return subjectMatches(title,requested)?'exact':'none';
}
