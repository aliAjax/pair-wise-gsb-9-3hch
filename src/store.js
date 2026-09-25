// 本机保存层：localStorage 读写
import{seed,normalize}from'./data';
const KEY='research-library';
export const load=()=>{
 try{
  const raw=JSON.parse(localStorage.getItem(KEY));
  if(Array.isArray(raw)&&raw.length)return raw.map(normalize);
 }catch(e){/* 本地数据损坏时回退到示例数据 */}
 return seed.map(normalize);
};
export const save=items=>{try{localStorage.setItem(KEY,JSON.stringify(items))}catch(e){}};
