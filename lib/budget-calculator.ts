export type CostInput={tuition:string;mandatoryFees:string;monthlyLiving:string;oneTime:string;scholarship:string;scholarshipConfirmed:boolean;budget:string;budgetCurrency:string;rates:{date:string;rates:Record<string,number>}|null};
function numberOrNull(value:string){if(value.trim()==='')return null;const n=Number(value);return Number.isFinite(n)&&n>=0?n:null}
export function calculateBudget(x:CostInput){
 const tuition=numberOrNull(x.tuition),fees=numberOrNull(x.mandatoryFees),living=numberOrNull(x.monthlyLiving),oneTime=numberOrNull(x.oneTime),scholarship=numberOrNull(x.scholarship),budget=numberOrNull(x.budget);
 const missing=[['tuition',tuition],['mandatory fees',fees],['monthly living costs',living],['one-time costs',oneTime]].filter(([,v])=>v===null).map(([k])=>k as string);
 if(x.scholarshipConfirmed&&scholarship===null)missing.push('confirmed scholarship amount');
 if(missing.length)return {missing,gross:null,scholarshipApplied:0,total:null,totalInBudgetCurrency:null,gap:null,rateDate:null};
 const gross=tuition!+fees!+living!*12+oneTime!;const scholarshipApplied=x.scholarshipConfirmed?Math.min(scholarship!,gross):0;const total=gross-scholarshipApplied;
 let converted:number|null=null;if(x.budgetCurrency==='EUR')converted=total;else if(x.rates?.rates.EUR&&x.rates.rates[x.budgetCurrency])converted=total/x.rates.rates.EUR*x.rates.rates[x.budgetCurrency];
 return {missing,gross,scholarshipApplied,total,totalInBudgetCurrency:converted,gap:budget===null||converted===null?null:Math.max(0,converted-budget),rateDate:x.budgetCurrency==='EUR'?null:converted===null?null:x.rates?.date||null};
}
