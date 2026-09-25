// 本机保存层：localStorage 读写与旧数据兜底，是唯一接触 localStorage 的地方
import{seed}from'./data.js';
const KEY='research-library-ledger';

export function load(){
 try{
  const s=JSON.parse(localStorage.getItem(KEY));
  if(s&&Array.isArray(s.papers)&&Array.isArray(s.orders)&&Array.isArray(s.loans))
   return{...s,papers:s.papers.map(p=>({...p,acquisition:{method:'未登记',...(p.acquisition||{})}}))};
 }catch{}
 return seed();
}

export function save(state){
 try{localStorage.setItem(KEY,JSON.stringify(state))}catch{}
}
