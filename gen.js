const fs=require('fs');
const ORDER="AA KK QQ AKs JJ AQs KQs AJs KJs TT AKo ATs QJs KTs QTs JTs 99 AQo A9s KQo 88 K9s T9s A8s Q9s J9s AJo A5s 77 A7s KJo A4s A3s A6s QJo 66 K8s T8s A2s 98s J8s ATo Q8s K7s KTo 55 JTo 87s QTo 44 22 33 K6s 97s K5s 76s T7s K4s K3s K2s Q7s 86s 65s J7s 54s Q6s 75s 96s Q5s 64s Q4s Q3s T9o T6s Q2s A9o 53s 85s J6s J9o K9o J5s Q9o 43s 74s J4s J3s 95s J2s 63s A8o 52s T5s 84s T4s T3s 42s T2s 98o T8o A5o A7o 73s A4o 32s 94s 93s J8o A3o 62s 92s K8o A6o 87o Q8o 83s A2o 82s 97o 72s 76o K7o 65o T7o K6o 86o 54o K5o J7o 75o Q7o K4o K3o K2o 96o 95o 64o Q6o 53o 85o T6o Q5o 43o Q4o Q3o Q2o 74o J6o 63o J5o 52o J4o J3o 42o J2o 84o T5o T4o T3o T2o 32o 73o 62o 94o 93o 92o 83o 82o 72o".split(" ");
const RANK={}; ORDER.forEach((h,i)=>RANK[h]=i+1);

const TIERS=[[100,4],[60,6],[40,11],[25,17],[15,23],[10,31],[6,41],[4,52],[2,66],[1,92]];
const COL  =["#c92a2a","#c92a2a","#e8590c","#e8590c","#c9a227","#2f9e44","#2f9e44","#1f7a6e","#2f5d8a","#2f5d8a"];
const SIZE={2:2.90,3:2.00,4:1.50,5:1.20,6:1.00,7:0.85,8:0.72,9:0.62};

// baseline seat for the printed sheet = middle position
const POSBASE=0.85;

function maxIn(h,n){
  const r=RANK[h]; if(!r) return 0;
  const pair=h.length===2, suited=h.slice(-1)==="s";
  let m=SIZE[n]*POSBASE;
  if(n>=5)      m*= suited?1.12 : (pair?1.10:(r<=11?1.00:0.88));
  else if(n<=3) m*= suited?0.95 : (pair?1.00:1.10);
  let v=0;
  for(const [amt,cut] of TIERS){ if(r<=Math.max(1,Math.round(cut*m))){v=amt;break;} }
  if(r<=3) v=100;
  else if(h==="AKs"&&v<60) v=60;
  else if(h==="AKo"&&v<40) v=40;
  else if((h==="JJ"||h==="AQs")&&v<25) v=25;
  return v;
}
const color=v=>{ for(let i=0;i<TIERS.length;i++) if(TIERS[i][0]===v) return COL[i]; return "#2b323c"; };

const R="AKQJT98765432".split("");
const hand=(i,j)=> i===j ? R[i]+R[i] : (i<j ? R[i]+R[j]+"s" : R[j]+R[i]+"o");

function matrix(n){
  let h=`<table class="m"><tr><th class="c"></th>`;
  R.forEach(x=>h+=`<th class="c">${x}</th>`);
  h+=`</tr>`;
  for(let i=0;i<13;i++){
    h+=`<tr><th class="c">${R[i]}</th>`;
    for(let j=0;j<13;j++){
      const v=maxIn(hand(i,j),n);
      h+=`<td style="background:${color(v)}"${v===0?' class="f"':''}>${v===0?"·":v}</td>`;
    }
    h+=`</tr>`;
  }
  return h+`</table>`;
}

let sheets="";
for(let n=9;n>=2;n--){
  sheets+=`<section id="p${n}"><h2>${n} PLAYERS${n===6?' <em>(most home games)</em>':''}</h2>${matrix(n)}</section>`;
}
let legend="";
TIERS.forEach((t,i)=>legend+=`<span style="background:${COL[i]}">$${t[0]}</span>`);
legend+=`<span style="background:#2b323c">· = fold</span>`;

const html=`<!DOCTYPE html><html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Preflop Max $ — cheatsheet</title><style>
*{box-sizing:border-box}
body{margin:0;padding:10px 8px 40px;background:#0b0f14;color:#e8eef5;max-width:780px;margin:0 auto;
 font:14px/1.4 ui-sans-serif,-apple-system,"Segoe UI",Roboto,sans-serif}
h1{font-size:18px;margin:0 0 2px}
.sub{color:#8fa0b3;font-size:12px;margin-bottom:10px}
h2{font-size:13px;letter-spacing:2px;margin:20px 0 6px;color:#b9c6d4;border-bottom:1px solid #26313f;padding-bottom:4px}
h2 em{color:#6fb3ff;font-style:normal;letter-spacing:0;font-size:11px}
table.m{border-collapse:collapse;width:100%;table-layout:fixed}
table.m td,table.m th{text-align:center;padding:0;height:26px;border:1px solid rgba(0,0,0,.4);
 font-size:12px;font-weight:700;color:#fff}
table.m th.c{background:#0b0f14;color:#8fa0b3;font-size:12px;border-color:#0b0f14}
table.m td.f{color:#69737f;font-weight:400}
.lg{display:flex;gap:3px;flex-wrap:wrap;margin:8px 0 4px;font-size:10px}
.lg span{padding:3px 7px;border-radius:4px;color:#fff;font-weight:700}
.box{background:#141b24;border:1px solid #26313f;border-radius:10px;padding:11px;margin:12px 0;font-size:12.5px;line-height:1.65;color:#a8b6c6}
.box b{color:#e8eef5}
.box h3{font-size:11px;letter-spacing:1.5px;color:#8fa0b3;margin:0 0 6px;text-transform:uppercase}
.nav{display:flex;gap:4px;flex-wrap:wrap;margin-bottom:6px}
.nav a{background:#1b2431;border:1px solid #26313f;border-radius:6px;padding:5px 9px;
 color:#e8eef5;text-decoration:none;font-size:12px;font-weight:700}
table.adj{border-collapse:collapse;width:100%;font-size:12px;margin-top:4px}
table.adj td,table.adj th{border:1px solid #26313f;padding:4px 6px;text-align:left}
table.adj th{color:#8fa0b3;font-weight:600;font-size:11px;text-transform:uppercase;letter-spacing:.5px}
@media print{
 body{background:#fff;color:#000;max-width:none;padding:0;font-size:9px}
 h1,.sub,h2{color:#000} .nav{display:none}
 h2{page-break-after:avoid;margin:8px 0 3px;font-size:10px}
 section{page-break-inside:avoid}
 table.m td,table.m th{height:15px;font-size:8px;-webkit-print-color-adjust:exact;print-color-adjust:exact}
 table.m th.c{background:#fff;color:#000}
 .box{background:#fff;border:1px solid #999;color:#000;font-size:8px}
}
</style></head><body>

<h1>Preflop Max $</h1>
<div class="sub">$100 stacks &middot; $1 blind &middot; the most you should ever put in <b>before the flop</b></div>

<div class="lg">${legend}</div>

<div class="box">
<b>Read it:</b> row = high card, column = low card. <b>Above the diagonal = suited</b>, below = offsuit, diagonal = pairs.
So row A / column K, upper half is AKs. Lower half is AKo.<br>
<b>The number is a ceiling, not a target.</b> Betting goes past it, you fold, even with money already in.<br>
<b>Open to $3</b>, plus $1 per limper already in. Same size with every hand you open.
</div>

<div class="nav">${[9,8,7,6,5,4,3,2].map(n=>`<a href="#p${n}">${n}p</a>`).join("")}</div>

${sheets}

<div class="box"><h3>Adjust for your seat</h3>
The grids above assume a middle seat. Shift by one step on the legend:
<table class="adj">
<tr><th>Seat</th><th>Do this</th></tr>
<tr><td>First to act (UTG/EP)</td><td>Drop <b>one</b> colour band. Fold anything already dark blue.</td></tr>
<tr><td>Middle</td><td>Use the grid as printed.</td></tr>
<tr><td>Cutoff / Button</td><td>Bump up <b>one</b> band. Steal wide if everyone folded to you.</td></tr>
<tr><td>Small blind</td><td>Drop one band. You act first for the rest of the hand.</td></tr>
<tr><td>Big blind</td><td>As printed, but you may check for free. Never fold a free look.</td></tr>
</table></div>

<div class="box"><h3>Where the money leaks</h3>
<b>Offsuit trash is a fold at any price.</b> K7o, Q8o, J6o, anything 9-high offsuit. Cheap is not a reason.<br>
<b>Small pairs and suited connectors want a crowd.</b> Over ~$6 without 3+ callers, fold them.<br>
<b>Multiway kills big offsuit cards</b> and helps suited/connected ones. Already baked into each grid.<br>
<b>AKo and AQs are draws, not made hands.</b> Unpaired cards miss the flop 67% of the time.<br>
<b>Set-mining needs 15x behind.</b> Calling $6 with 44 only works if someone has ~$90 left.
</div>

<div class="box"><h3>Numbers worth memorising</h3>
AA vs one random hand <b>85%</b> &middot; AA vs eight <b>~31%</b><br>
99 vs AK <b>~55/45</b>, a coinflip &middot; AK vs QQ <b>43%</b> &middot; AK vs AQ <b>74%</b><br>
Pair flops a set <b>12%</b> (1 in 8.5) &middot; Suited cards make a flush <b>6.5%</b><br>
Dealt AA <b>1 in 221</b> &middot; dealt any pair <b>1 in 17</b>
</div>

<div class="box" style="font-size:11px">
Built from the standard published 169-hand starting-hand order plus standard 100BB cash-game commitment ranges, shifted for table size and multiway texture. Tuned for a loose live home game, not a GTO solver.<br>
Sources: <a style="color:#6fb3ff" href="https://en.wikipedia.org/wiki/Texas_hold_%27em_starting_hands">Wikipedia</a> &middot;
<a style="color:#6fb3ff" href="https://www.gamblingnerd.com/poker/texas-holdem/starting-hand-rankings/">GamblingNerd</a> &middot;
<a style="color:#6fb3ff" href="https://www.pokernews.com/strategy/on-starting-hand-charts-ranking-the-169-hands-in-hold-em-21325.htm">PokerNews</a>
</div>
</body></html>`;
fs.writeFileSync(__dirname+"/index.html",html);

// sanity: spot-check a few cells at 6-handed
["AA","AKs","AKo","JJ","TT","KQs","99","A5s","76s","44","K7o","Q8o","72o","JTs"].forEach(h=>
  console.log(h.padEnd(4), "rank#"+String(RANK[h]).padStart(3), "6p=$"+maxIn(h,6), " 9p=$"+maxIn(h,9), " 2p=$"+maxIn(h,2)));
