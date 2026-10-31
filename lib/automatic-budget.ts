export function automaticBudget(university:string,knownTuition:number|null,budget:string,currency:string,rates:{date:string;rates:Record<string,number>}|null){
 const paderborn=/paderborn/i.test(university);
 const livingLow=paderborn?1160:900,livingHigh=paderborn?1160:1200;
 const feesLow=paderborn?702.30:140,feesHigh=paderborn?702.30:860;
 const reserveLow=600,reserveHigh=1200; // EUnistud planning assumption, not a university charge.
 const low=Math.round(((knownTuition??0)+12*livingLow+feesLow+reserveLow)*100)/100;
 const high=Math.round(((knownTuition??0)+12*livingHigh+feesHigh+reserveHigh)*100)/100;
 const rate=currency==='EUR'?1:rates?.rates[currency];
 const convertedLow=rate?Math.round(low*rate*100)/100:null,convertedHigh=rate?Math.round(high*rate*100)/100:null;
 return {low,high,livingLow,livingHigh,feesLow,feesHigh,reserveLow,reserveHigh,tuitionIncluded:knownTuition!==null,convertedLow,convertedHigh,gapLow:budget&&convertedLow!==null?Math.max(0,Math.round((convertedLow-Number(budget))*100)/100):null,gapHigh:budget&&convertedHigh!==null?Math.max(0,Math.round((convertedHigh-Number(budget))*100)/100):null,paderborn};
}
