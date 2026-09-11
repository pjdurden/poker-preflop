const fs=require('fs');
const ORDER="AA KK QQ AKs JJ AQs KQs AJs KJs TT AKo ATs QJs KTs QTs JTs 99 AQo A9s KQo 88 K9s T9s A8s Q9s J9s AJo A5s 77 A7s KJo A4s A3s A6s QJo 66 K8s T8s A2s 98s J8s ATo Q8s K7s KTo 55 JTo 87s QTo 44 22 33 K6s 97s K5s 76s T7s K4s K3s K2s Q7s 86s 65s J7s 54s Q6s 75s 96s Q5s 64s Q4s Q3s T9o T6s Q2s A9o 53s 85s J6s J9o K9o J5s Q9o 43s 74s J4s J3s 95s J2s 63s A8o 52s T5s 84s T4s T3s 42s T2s 98o T8o A5o A7o 73s A4o 32s 94s 93s J8o A3o 62s 92s K8o A6o 87o Q8o 83s A2o 82s 97o 72s 76o K7o 65o T7o K6o 86o 54o K5o J7o 75o Q7o K4o K3o K2o 96o 95o 64o Q6o 53o 85o T6o Q5o 43o Q4o Q3o Q2o 74o J6o 63o J5o 52o J4o J3o 42o J2o 84o T5o T4o T3o T2o 32o 73o 62o 94o 93o 92o 83o 82o 72o".split(" ");
const RANK={}; ORDER.forEach((h,i)=>RANK[h]=i+1);
const R="AKQJT98765432".split("");
const hand=(i,j)=> i===j ? R[i]+R[i] : (i<j ? R[i]+R[j]+"s" : R[j]+R[i]+"o");

const BASE=[[100,4],[60,6],[40,11],[25,17],[15,23],[10,31],[6,41],[4,52],[2,66],[1,92]];
const CMAP={100:"#c92a2a",60:"#e03131",40:"#e8590c",25:"#f08c00",15:"#c9a227",
            10:"#2f9e44",6:"#1f7a6e",4:"#2f5d8a",2:"#2f5d8a",1:"#3a4350"};
const DAMP={100:0.05,60:0.12,40:0.20,25:0.32,15:0.48,10:0.62,6:0.80,4:1.00,2:1.00,1:1.00};
const SIZE={2:2.90,3:2.00,4:1.50,5:1.20,6:1.00,7:0.85,8:0.72,9:0.62};
const POSBASE=0.85;

/* ---- the two games ---- */
const ANTE={
  file:"index.html", tag:"ANTE", other:["standard.html","Standard $1/$2 blinds"],
  title:"Preflop Max $ — forced-ante game",
  sub:'$100 stacks &middot; $1 blind &middot; <b>everyone else forced in for $2</b> &middot; numbers are your TOTAL in before the flop, forced $2 included',
  tiers:BASE.filter(t=>t[0]>=4), floor:2, floorCol:"#3a4350", floorLbl:"$2 = check only",
  pot:n=>1+2*(n-1), open:n=>Math.max(3,Math.round(0.65*(1+2*(n-1)))), ante:true
};
const STD={
  file:"standard.html", tag:"STANDARD", other:["index.html","Forced-ante game ($2 each)"],
  title:"Preflop Max $ — standard blinds",
  sub:'$100 stacks &middot; $1/$2 blinds &middot; nobody is forced in &middot; numbers are the most you should ever put in before the flop',
  tiers:BASE, floor:0, floorCol:"#2b323c", floorLbl:"&middot; = fold",
  pot:n=>3, open:n=>3, ante:false
};

function maxIn(G,h,n){
  const r=RANK[h]; if(!r) return G.floor;
  const pair=h.length===2, suited=h.slice(-1)==="s";
  let m=SIZE[n]*POSBASE;
  if(n>=5)      m*= suited?1.12 : (pair?1.10:(r<=11?1.00:0.88));
  else if(n<=3) m*= suited?0.95 : (pair?1.00:1.10);
  const W = G.ante ? 1+0.55*(G.pot(n)/G.pot(2)-1) : 1;
  let v=G.floor;
  for(const [amt,cut] of G.tiers){
    if(r<=Math.max(1,Math.round(cut*m*(1+DAMP[amt]*(W-1))))){v=amt;break;}
  }
  if(r<=3) v=100;
  else if(h==="AKs"&&v<60) v=60;
  else if(h==="AKo"&&v<40) v=40;
  else if((h==="JJ"||h==="AQs")&&v<25) v=25;
  return v;
}
const color=(G,v)=> v===G.floor ? G.floorCol : (CMAP[v]||G.floorCol);

function matrix(G,n){
  let h=`<table class="m"><tr><th class="c"></th>`;
  R.forEach(x=>h+=`<th class="c">${x}</th>`); h+=`</tr>`;
  for(let i=0;i<13;i++){
    h+=`<tr><th class="c">${R[i]}</th>`;
    for(let j=0;j<13;j++){
      const v=maxIn(G,hand(i,j),n);
      h+=`<td style="background:${color(G,v)}"${v===G.floor?' class="f"':''}>${v===0?"·":v}</td>`;
    }
    h+=`</tr>`;
  }
  return h+`</table>`;
}

const CSS=`*{box-sizing:border-box}
body{margin:0 auto;padding:10px 8px 40px;background:#0b0f14;color:#e8eef5;max-width:780px;
 font:14px/1.4 ui-sans-serif,-apple-system,"Segoe UI",Roboto,sans-serif}
h1{font-size:18px;margin:0 0 2px}
.sub{color:#8fa0b3;font-size:12px;margin-bottom:10px}
h2{font-size:13px;letter-spacing:2px;margin:20px 0 6px;color:#b9c6d4;border-bottom:1px solid #26313f;padding-bottom:4px}
h2 em{color:#6fb3ff;font-style:normal;letter-spacing:0;font-size:11px;float:right;font-weight:400}
table.m{border-collapse:collapse;width:100%;table-layout:fixed;clear:both}
table.m td,table.m th{text-align:center;padding:0;height:26px;border:1px solid rgba(0,0,0,.4);
 font-size:12px;font-weight:700;color:#fff}
table.m th.c{background:#0b0f14;color:#8fa0b3;border-color:#0b0f14}
table.m td.f{color:#69737f;font-weight:400}
.lg{display:flex;gap:3px;flex-wrap:wrap;margin:8px 0 4px;font-size:10px}
.lg span{padding:3px 7px;border-radius:4px;color:#fff;font-weight:700}
.box{background:#141b24;border:1px solid #26313f;border-radius:10px;padding:11px;margin:12px 0;font-size:12.5px;line-height:1.65;color:#a8b6c6}
.box b{color:#e8eef5}
.box h3{font-size:11px;letter-spacing:1.5px;color:#8fa0b3;margin:0 0 6px;text-transform:uppercase}
.warn{border-color:#5c3b1e;background:#1d1710}
.nav{display:flex;gap:4px;flex-wrap:wrap;margin-bottom:6px}
.nav a{background:#1b2431;border:1px solid #26313f;border-radius:6px;padding:5px 9px;
 color:#e8eef5;text-decoration:none;font-size:12px;font-weight:700}
.switch{display:flex;gap:6px;margin-bottom:10px}
.switch a,.switch span{flex:1;text-align:center;padding:8px 6px;border-radius:8px;font-size:12px;font-weight:700;text-decoration:none;border:1px solid #26313f}
.switch span{background:#2b6cb0;border-color:#4a9eff;color:#fff}
.switch a{background:#1b2431;color:#8fa0b3}
table.adj{border-collapse:collapse;width:100%;font-size:12px;margin-top:4px}
table.adj td,table.adj th{border:1px solid #26313f;padding:4px 6px;text-align:left}
table.adj th{color:#8fa0b3;font-weight:600;font-size:11px;text-transform:uppercase}
@media print{
 body{background:#fff;color:#000;max-width:none;padding:0;font-size:9px}
 h1,.sub,h2{color:#000} .nav,.switch{display:none}
 h2{page-break-after:avoid;margin:8px 0 3px;font-size:10px}
 section{page-break-inside:avoid}
 table.m td,table.m th{height:15px;font-size:8px;-webkit-print-color-adjust:exact;print-color-adjust:exact}
 table.m th.c{background:#fff;color:#000}
 .box{background:#fff;border:1px solid #999;color:#000;font-size:8px}
}`;

const GRIDHELP=`<div class="box">
<b>Read the grid:</b> row = high card, column = low card. <b>Above the diagonal = suited</b>, below = offsuit, diagonal = pairs.
Row A / column K in the upper half is AKs. Row K / column A in the lower half is AKo.<br>
<b>Suited (s)</b> = both cards the same suit. <b>Offsuit (o)</b> = different suits.</div>`;

const FACTS=`<div class="box"><h3>Numbers worth memorising</h3>
AA vs one random hand <b>85%</b> &middot; AA vs eight <b>~31%</b><br>
99 vs AK <b>~55/45</b>, a coinflip &middot; AK vs QQ <b>43%</b> &middot; AK vs AQ <b>74%</b><br>
Pair flops a set <b>12%</b> (1 in 8.5) &middot; Suited cards make a flush <b>6.5%</b><br>
Unpaired cards miss the flop entirely <b>67%</b> of the time<br>
Dealt AA <b>1 in 221</b> &middot; dealt any pair <b>1 in 17</b></div>`;

const SRC=`Sources: <a style="color:#6fb3ff" href="https://en.wikipedia.org/wiki/Texas_hold_%27em_starting_hands">Wikipedia</a> &middot;
<a style="color:#6fb3ff" href="https://www.gamblingnerd.com/poker/texas-holdem/starting-hand-rankings/">GamblingNerd</a> &middot;
<a style="color:#6fb3ff" href="https://www.pokernews.com/strategy/on-starting-hand-charts-ranking-the-169-hands-in-hold-em-21325.htm">PokerNews</a>`;

const INTRO={
ANTE:`<div class="box warn"><h3>Read this first</h3>
<b>You already paid $2. You cannot fold it back.</b> So if nobody bets, you see the flop with <b>every single hand</b>, including 72o. There is no folding for free here.<br>
<b>The grid number is your ceiling</b>, total, counting the forced $2. A cell showing <b>$2 means: check if it is free, fold to any bet.</b><br>
<b>The dead money is the whole game.</b> At 6 players there is $11 out there before anyone acts, 5x what a normal $1/$2 pot starts with. Correct play is far looser and far more aggressive than any normal chart.</div>`,
STANDARD:`<div class="box"><h3>Read this first</h3>
<b>Nobody is forced in.</b> Folding costs you nothing unless you are in a blind, so the bottom of the chart is a genuine fold.<br>
<b>The grid number is your ceiling</b>, not a target. If the betting goes past it, fold, even with money already in.<br>
<b>Open to $3</b>, plus $1 for every limper already in. Same size with every hand you open.</div>`};

const TIPS={
ANTE:`<div class="box"><h3>What actually wins money in a forced-ante game</h3>
<b>Never fold when checking is free.</b> Biggest leak by far. You paid, so take the flop.<br>
<b>Raise big or not at all.</b> $2 into $11 gives the table 6.5-to-1 and everyone calls. If you raise, make it near pot.<br>
<b>Suited and connected cards go up.</b> Big multiway pots are won by flushes and straights, not top pair.<br>
<b>Offsuit high cards go down.</b> AJo six-way is a trap. It flops top pair and loses to two pair.<br>
<b>Small pairs get much better.</b> Set-mining with $11 already out there is close to free money.<br>
<b>The trap:</b> being forced in with 83o does not make 83o worth another dollar. Most of your losses will come from calling one bet too many with a hand you never chose.</div>`,
STANDARD:`<div class="box"><h3>Where the money leaks</h3>
<b>Offsuit trash is a fold at any price.</b> K7o, Q8o, J6o, anything 9-high offsuit. Cheap is not a reason.<br>
<b>Small pairs and suited connectors want a crowd.</b> Over ~$6 without 3+ callers, fold them.<br>
<b>Multiway kills big offsuit cards</b> and helps suited/connected ones. Already baked into each grid.<br>
<b>AKo and AQs are draws, not made hands.</b> Unpaired cards miss the flop 67% of the time.<br>
<b>Set-mining needs 15x behind.</b> Calling $6 with 44 only works if someone has ~$90 left.</div>`};

const SEAT={
ANTE:`<tr><td>The $1 blind</td><td>As printed. You are $1 cheaper in, the best price at the table.</td></tr>`,
STANDARD:`<tr><td>Small blind</td><td>Drop one band. You act first for the rest of the hand.</td></tr>
<tr><td>Big blind</td><td>As printed, but you may check for free. Never fold a free look.</td></tr>`};

function page(G){
  let sheets="";
  for(let n=9;n>=2;n--){
    const meta = G.ante ? `pot starts at $${G.pot(n)} &middot; open to $${G.open(n)}`
                        : `pot starts at $3 &middot; open to $3 +$1/limper`;
    sheets+=`<section id="p${n}"><h2>${n} PLAYERS <em>${meta}</em></h2>${matrix(G,n)}</section>`;
  }
  const legend=G.tiers.filter(t=>t[0]!==G.floor).map(t=>`<span style="background:${CMAP[t[0]]}">$${t[0]}</span>`).join("")
    +`<span style="background:${G.floorCol}">${G.floorLbl}</span>`;
  const cur=G.tag, oth=G.other;
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>${G.title}</title>
<style>${CSS}</style></head><body>
<h1>Preflop Max $</h1><div class="sub">${G.sub}</div>
<div class="switch"><span>${cur==="ANTE"?"Forced-ante game ($2 each)":"Standard $1/$2 blinds"}</span><a href="${oth[0]}">${oth[1]} &rarr;</a></div>
${INTRO[cur]}
<div class="lg">${legend}</div>
${GRIDHELP}
<div class="nav">${[9,8,7,6,5,4,3,2].map(n=>`<a href="#p${n}">${n}p</a>`).join("")}</div>
${sheets}
<div class="box"><h3>Adjust for your seat</h3>Grids assume a middle seat. Shift one colour band:
<table class="adj"><tr><th>Seat</th><th>Do this</th></tr>
<tr><td>First to act</td><td>Drop <b>one</b> band.</td></tr>
<tr><td>Middle</td><td>As printed.</td></tr>
<tr><td>Last to act / button</td><td>Bump <b>one</b> band.</td></tr>
${SEAT[cur]}</table></div>
${TIPS[cur]}
${FACTS}
<div class="box" style="font-size:11px">Built from the standard published 169-hand starting-hand order plus standard 100BB commitment ranges${G.ante?", then widened for the dead money your ante structure creates. The widening is deliberately non-uniform: cheap calls loosen a lot, stacking off for $100 barely moves, because $11 of overlay changes a $2 decision enormously and a $98 decision hardly at all":""}. Tuned for a loose live home game, not a GTO solver.<br>${SRC}</div>
</body></html>`;
}

for(const G of [ANTE,STD]) fs.writeFileSync(__dirname+"/"+G.file, page(G));

const hs=["AA","AKs","AKo","JJ","TT","KQs","99","JTs","A5s","76s","44","K7o","83o","72o"];
for(const G of [ANTE,STD]){
  console.log("\n== "+G.tag+" ("+G.file+") ==");
  console.log("n  pot open | "+hs.map(h=>h.padStart(4)).join(""));
  for(const n of [9,6,4,2]) console.log(String(n).padEnd(2),String(G.pot(n)).padStart(3),
    String(G.open(n)).padStart(4),"|", hs.map(h=>String(maxIn(G,h,n)).padStart(4)).join(""));
}
