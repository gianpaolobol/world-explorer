// Copyright 2026 Gian Paolo Franceschini. All rights reserved.
export function review(previous={}, correct, now=Date.now()) {
 const streak=correct?(previous.streak||0)+1:0;
 const days=correct?Math.min(180,2**(streak-1)):0;
 return {...previous,streak,correct:(previous.correct||0)+Number(correct),wrong:(previous.wrong||0)+Number(!correct),due:now+(correct?days*86400000:600000)};
}
export function nextReview(items,memory,now=Date.now()){
 return [...items].sort((a,b)=>(memory[a.code]?.due||0)-(memory[b.code]?.due||0)).find(x=>(memory[x.code]?.due||0)<=now)||null;
}
export function exportMemory(memory){return JSON.stringify({version:1,memory});}
