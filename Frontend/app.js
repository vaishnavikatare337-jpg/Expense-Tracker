const KEY='expenses-v1';
let data=[];
try{data=JSON.parse(localStorage.getItem(KEY)||'[]')}catch(e){data=[]}
const $=id=>document.getElementById(id);
const fmt=n=>new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:2}).format(n);
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(data))}catch(e){}};
const today=()=>{const d=new Date();return new Date(d-d.getTimezoneOffset()*6e4).toISOString().slice(0,10)};
$('date').value=today();

function months(){
  const set=new Set([today().slice(0,7),...data.map(e=>e.date.slice(0,7))]);
  return [...set].sort().reverse();
}
function fillMonths(keep){
  const sel=$('month'),cur=keep||sel.value||today().slice(0,7);
  sel.innerHTML=months().map(m=>{
    const label=new Date(m+'-01T00:00').toLocaleDateString('en-IN',{month:'long',year:'numeric'});
    return `<option value="${m}">${label}</option>`}).join('');
  sel.value=cur;
}
function esc(s){return s.replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))}

function render(){
  const m=$('month').value;
  const rows=data.filter(e=>e.date.startsWith(m)).sort((a,b)=>b.date.localeCompare(a.date)||b.id-a.id);
  const sum=rows.reduce((s,e)=>s+e.amount,0);
  $('total').textContent=fmt(sum);
  $('sub').textContent=rows.length?`${rows.length} expense${rows.length>1?'s':''} this month`:'No expenses yet this month.';
  const by={};rows.forEach(e=>by[e.cat]=(by[e.cat]||0)+e.amount);
  const cats=Object.entries(by).sort((a,b)=>b[1]-a[1]);
  $('cats').innerHTML=cats.length?cats.map(([c,v])=>
    `<div class="cat"><span>${c}</span><div class="track"><div class="fill" style="width:${(v/sum*100).toFixed(1)}%"></div></div><span class="amt">${fmt(v)}</span></div>`).join('')
    :'<p class="empty">Add an expense to see where your money goes.</p>';
  $('list').innerHTML=rows.length?rows.map(e=>
    `<div class="item"><div class="m"><div class="n">${esc(e.note||e.cat)}</div><div class="d">${e.cat} · ${new Date(e.date+'T00:00').toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</div></div><span class="amt">${fmt(e.amount)}</span><button class="del" data-id="${e.id}" aria-label="Delete expense">✕</button></div>`).join('')
    :'<p class="empty">Nothing here yet.</p>';
}

$('add').onclick=()=>{
  const amount=parseFloat($('amount').value),date=$('date').value;
  if(!(amount>0)){$('err').textContent='Enter an amount greater than 0.';return}
  if(!date){$('err').textContent='Pick a date.';return}
  $('err').textContent='';
  data.push({id:Date.now(),amount,cat:$('cat').value,date,note:$('note').value.trim()});
  save();$('amount').value='';$('note').value='';
  fillMonths(date.slice(0,7));render();$('amount').focus();
};
$('list').onclick=e=>{
  const b=e.target.closest('.del');if(!b)return;
  data=data.filter(x=>x.id!==+b.dataset.id);save();fillMonths();render();
};
$('month').onchange=render;
fillMonths();render();