import React,{useEffect,useMemo,useState}from'react';
import{createRoot}from'react-dom/client';
import{METHODS}from'./data.js';
import{load,save}from'./storage.js';
import{todayStr,pendingOrderOf,isOverdue,overdueDays,overdueList,validateOrderDraft,removalChecklist}from'./validate.js';
import'./styles.css';

function App(){
 const[state,setState]=useState(load);
 const{papers,orders,loans}=state;
 const[selected,setSelected]=useState(null);
 const[query,setQuery]=useState('');
 const[tag,setTag]=useState('全部');
 const[show,setShow]=useState(false);
 const[notice,setNotice]=useState('');
 const[form,setForm]=useState({title:'',authors:'',year:'2026',venue:'',abstract:'',tags:''});
 const[ill,setIll]=useState({requestDate:todayStr(),expectedDate:''});
 const[illErr,setIllErr]=useState({});
 const[arr,setArr]=useState({date:todayStr(),location:''});
 const[borrower,setBorrower]=useState('');
 const[removing,setRemoving]=useState(null);

 useEffect(()=>save(state),[state]);
 const tags=['全部',...new Set(papers.flatMap(x=>x.tags))];
 const filtered=useMemo(()=>papers.filter(x=>(tag==='全部'||x.tags.includes(tag))&&(`${x.title}${x.authors}${x.abstract}`.toLowerCase().includes(query.toLowerCase()))),[papers,tag,query]);
 const cur=papers.find(x=>x.id===selected)||papers[0];
 const curId=cur?.id;
 useEffect(()=>{setIll({requestDate:todayStr(),expectedDate:''});setIllErr({});setArr({date:todayStr(),location:''});setBorrower('')},[curId]);

 const overdue=overdueList(orders,papers);
 const pending=cur?pendingOrderOf(orders,cur.id):null;
 const history=cur?orders.filter(o=>o.paperId===cur.id&&o.arrivedDate):[];
 const curLoans=cur?loans.filter(l=>l.paperId===cur.id):[];
 const method=cur?.acquisition?.method||'未登记';

 const patchPaper=(id,k,v)=>setState(s=>({...s,papers:s.papers.map(x=>x.id===id?{...x,[k]:v}:x)}));
 const setMethod=m=>patchPaper(cur.id,'acquisition',{method:m});

 const add=()=>{
  if(!form.title)return;
  const p={...form,id:Date.now(),year:+form.year,tags:form.tags.split(',').map(x=>x.trim()).filter(Boolean),status:'待读',cite:`${form.authors} (${form.year}). ${form.title}. ${form.venue}.`,acquisition:{method:'未登记'}};
  setState(s=>({...s,papers:[...s.papers,p]}));setSelected(p.id);
  setForm({title:'',authors:'',year:'2026',venue:'',abstract:'',tags:''});setShow(false);setNotice('文献已加入研究库');
 };

 const submitOrder=()=>{
  const errs=validateOrderDraft(ill,orders,cur.id);
  setIllErr(errs);
  if(Object.keys(errs).length)return;
  setState(s=>({...s,orders:[...s.orders,{id:Date.now(),paperId:cur.id,requestDate:ill.requestDate,expectedDate:ill.expectedDate,arrivedDate:null,location:''}]}));
  setIll({requestDate:todayStr(),expectedDate:''});
  setNotice('馆际互借申请已登记');
 };

 const arrive=()=>{
  if(!arr.location.trim()){setNotice('到货登记需要填写馆藏位置');return}
  setState(s=>({...s,orders:s.orders.map(o=>o.id===pending.id?{...o,arrivedDate:arr.date||todayStr(),location:arr.location.trim()}:o)}));
  setNotice('已登记到货，馆藏位置已入档');
 };

 const lend=()=>{
  if(!borrower.trim())return;
  setState(s=>({...s,loans:[...s.loans,{id:Date.now(),paperId:cur.id,borrower:borrower.trim(),lendDate:todayStr(),returnDate:null}]}));
  setBorrower('');setNotice('借出已登记');
 };
 const giveBack=id=>setState(s=>({...s,loans:s.loans.map(l=>l.id===id?{...l,returnDate:todayStr()}:l)}));

 const confirmRemove=()=>{
  setState(s=>({papers:s.papers.filter(p=>p.id!==removing),orders:s.orders.filter(o=>o.paperId!==removing),loans:s.loans.filter(l=>l.paperId!==removing)}));
  setRemoving(null);setSelected(null);setNotice('文献已移出研究库，相关互借与借出记录已一并清除');
 };

 const bib=()=>{navigator.clipboard?.writeText(cur.cite);setNotice('引用文本已复制')};
 const download=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([papers.map(x=>x.cite).join('\n')],{type:'text/plain'}));a.download='references.txt';a.click();setNotice('引用列表已导出')};

 const chk=removing?removalChecklist(removing,orders,loans):null;
 const removingPaper=removing?papers.find(x=>x.id===removing):null;

 return <div className="app">
 <aside>
  <div className="logo"><span>∴</span> LITERATURE</div>
  <div className="library-head"><span>我的研究库</span><strong>{papers.length}<small> 篇文献</small></strong></div>
  <nav>
   <button className="active">▤ <span>所有文献</span><b>{papers.length}</b></button>
   <button>▥ <span>待读</span><b>{papers.filter(x=>x.status==='待读').length}</b></button>
   <button>⇄ <span>互借在途</span><b>{orders.filter(o=>!o.arrivedDate).length}</b></button>
   <button className={overdue.length?'warn':''}>⚠ <span>互借逾期</span><b>{overdue.length}</b></button>
  </nav>
  <div className="side-tags"><small>标签</small>{tags.slice(1,5).map(t=><button onClick={()=>setTag(t)} key={t}># {t}</button>)}</div>
  <div className="side-foot"><button>⚙ 偏好设置</button><small>本地数据库 · 已同步</small></div>
 </aside>
 <main>
  <header>
   <div><span className="crumb">RESEARCH / LIBRARY</span><h1>所有文献</h1></div>
   <div className="actions"><button className="outline" onClick={download}>↓ 导出引用</button><button className="primary" onClick={()=>setShow(true)}>＋ 添加文献</button></div>
  </header>
  <div className="toolbar">
   <div className="search">⌕<input placeholder="搜索标题、作者或摘要…" value={query} onChange={e=>setQuery(e.target.value)}/>{query&&<button onClick={()=>setQuery('')}>×</button>}</div>
   <div className="tag-filter">{tags.map(t=><button className={tag===t?'on':''} onClick={()=>setTag(t)} key={t}>{t}</button>)}</div>
  </div>
  {overdue.length>0&&<div className="overdue-wrap"><div className="overdue-panel">
   <strong>⚠ {overdue.length} 张馆际互借单已逾期，请尽快催办</strong>
   {overdue.map(({order,paper,days})=><div className="overdue-row" key={order.id}>
    <span className="t">{paper.title}</span><span>申请日期 {order.requestDate}</span><span className="red-tag">逾期 {days} 天</span>
    <button onClick={()=>setSelected(paper.id)}>查看</button>
   </div>)}
  </div></div>}
  <div className="body">
  <section className="paper-list">
   {filtered.map(p=>{const od=isOverdue(pendingOrderOf(orders,p.id));return <button className={'paper '+(curId===p.id?'selected':'')} onClick={()=>setSelected(p.id)} key={p.id}>
    <div className="paper-year">{p.year}</div>
    <div className="paper-copy"><h3>{p.title}</h3><p>{p.authors}</p><div>{p.tags.map(t=><span key={t}>#{t}</span>)}</div>{od&&<span className="badge-ill">互借逾期</span>}</div>
    <small className={'status '+p.status}>{p.status}</small>
   </button>})}
   {!filtered.length&&<div className="no-result">没有找到匹配的文献</div>}
  </section>
  <section className="detail">{cur&&<>
   <div className="detail-top"><span className="status reading">{cur.status}</span><button onClick={()=>setNotice('已加入收藏')}>☆ 收藏</button></div>
   <h2>{cur.title}</h2>
   <p className="authors">{cur.authors}</p>
   <div className="cite-actions"><button onClick={bib}>▣ 复制引用</button><button onClick={()=>patchPaper(cur.id,'status',cur.status==='已读'?'待读':'已读')}>{cur.status==='已读'?'标记为待读':'标记为已读'}</button></div>
   <div className="detail-section"><h4>摘要 <span>ABSTRACT</span></h4><p>{cur.abstract}</p></div>
   <div className="detail-section"><h4>出版信息 <span>PUBLICATION</span></h4>
    <div className="pub-grid"><div><small>出版物</small><strong>{cur.venue}</strong></div><div><small>年份</small><strong>{cur.year}</strong></div></div>
   </div>
   <div className="detail-section"><h4>全文获取 <span>ACQUISITION</span></h4>
    <label className="field">获取方式
     <select value={method} onChange={e=>setMethod(e.target.value)}>{METHODS.map(m=><option key={m}>{m}</option>)}</select>
    </label>
    {method==='馆际互借'&&(pending?<div className={'ill'+(isOverdue(pending)?' overdue':'')}>
      <div className="ill-head"><strong>互借单 #{pending.id}</strong>{isOverdue(pending)?<span className="red-tag">已逾期 {overdueDays(pending)} 天</span>:<span className="ok-tag">在途</span>}</div>
      <div className="ill-dates"><div><small>申请日期</small><b>{pending.requestDate}</b></div><div><small>预计到货</small><b>{pending.expectedDate}</b></div></div>
      <div className="two">
       <label className="field">到货日期<input type="date" value={arr.date} onChange={e=>setArr({...arr,date:e.target.value})}/></label>
       <label className="field">馆藏位置<input value={arr.location} placeholder="如：总馆 A区 3架 2层" onChange={e=>setArr({...arr,location:e.target.value})}/></label>
      </div>
      <button className="primary full" onClick={arrive}>登记到货并入藏</button>
     </div>:<div className="ill">
      <div className="ill-head"><strong>新建互借申请</strong><span className="ok-tag">无在途单</span></div>
      <div className="two">
       <label className="field">申请日期<input type="date" value={ill.requestDate} onChange={e=>setIll({...ill,requestDate:e.target.value})}/>{illErr.requestDate&&<span className="err">{illErr.requestDate}</span>}</label>
       <label className="field">预计到货日期<input type="date" value={ill.expectedDate} onChange={e=>setIll({...ill,expectedDate:e.target.value})}/>{illErr.expectedDate&&<span className="err">{illErr.expectedDate}</span>}</label>
      </div>
      {illErr.paper&&<span className="err">{illErr.paper}</span>}
      <button className="primary full" onClick={submitOrder}>提交互借申请</button>
     </div>)}
    {history.length>0&&<div className="ill-history"><small>到馆记录</small>{history.map(o=><div className="loan" key={o.id}><span>#{o.id} · {o.requestDate} 申请 · {o.arrivedDate} 到馆</span><b>{o.location}</b></div>)}</div>}
   </div>
   <div className="detail-section"><h4>借出记录 <span>LENDING</span></h4>
    <div className="lend-form"><input value={borrower} placeholder="借阅人姓名" onChange={e=>setBorrower(e.target.value)}/><button className="outline" onClick={lend}>登记借出</button></div>
    {curLoans.map(l=><div className="loan" key={l.id}><span>{l.borrower} · {l.lendDate} 借出{l.returnDate?` · ${l.returnDate} 归还`:''}</span>{l.returnDate?<span className="ok-tag">已归还</span>:<button onClick={()=>giveBack(l.id)}>登记归还</button>}</div>)}
    {!curLoans.length&&<p className="muted">暂无借出记录</p>}
   </div>
   <div className="detail-section"><h4>引用文本 <span>BIBTEX / TEXT</span></h4>
    <div className="cite-box">{cur.cite}<button onClick={bib}>复制</button></div>
   </div>
   <div className="detail-section"><h4>我的笔记 <span>PRIVATE</span></h4>
    <textarea className="notes" placeholder="记录你的阅读想法…" value={cur.notes||''} onChange={e=>patchPaper(cur.id,'notes',e.target.value)}/>
   </div>
   <div className="detail-section"><h4>移出文献 <span>REMOVE</span></h4>
    <button className="danger" onClick={()=>setRemoving(cur.id)}>从研究库移出这篇文献…</button>
   </div>
  </>}</section>
  </div>
 </main>
 {show&&<div className="modal-bg"><div className="modal">
  <button className="close" onClick={()=>setShow(false)}>×</button>
  <span className="crumb">NEW REFERENCE</span><h2>添加一篇文献</h2>
  <label>标题<input value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="论文或书籍标题"/></label>
  <label>作者<input value={form.authors} onChange={e=>setForm({...form,authors:e.target.value})}/></label>
  <div className="two"><label>年份<input type="number" value={form.year} onChange={e=>setForm({...form,year:e.target.value})}/></label><label>出版物<input value={form.venue} onChange={e=>setForm({...form,venue:e.target.value})}/></label></div>
  <label>关键词<input value={form.tags} onChange={e=>setForm({...form,tags:e.target.value})} placeholder="用逗号分隔"/></label>
  <label>摘要<textarea rows="3" value={form.abstract} onChange={e=>setForm({...form,abstract:e.target.value})}/></label>
  <button className="primary full" onClick={add}>保存文献</button>
 </div></div>}
 {removing&&removingPaper&&<div className="modal-bg"><div className="modal">
  <button className="close" onClick={()=>setRemoving(null)}>×</button>
  <span className="crumb">REMOVE REFERENCE</span><h2>移出《{removingPaper.title}》</h2>
  <p className="muted">移出前请核对以下尚未了结的记录：</p>
  <div className="check-block"><small>还在路上的互借单（{chk.pending.length}）</small>
   {chk.pending.map(o=><div className="loan" key={o.id}><span>#{o.id} · {o.requestDate} 申请 · 预计 {o.expectedDate}</span>{isOverdue(o)&&<span className="red-tag">逾期 {overdueDays(o)} 天</span>}</div>)}
   {!chk.pending.length&&<p className="muted">无</p>}
  </div>
  <div className="check-block"><small>未归还的借出记录（{chk.lending.length}）</small>
   {chk.lending.map(l=><div className="loan" key={l.id}><span>{l.borrower} · {l.lendDate} 借出</span></div>)}
   {!chk.lending.length&&<p className="muted">无</p>}
  </div>
  <button className="danger full" onClick={confirmRemove}>确认移出（相关互借与借出记录一并清除）</button>
 </div></div>}
 {notice&&<div className="toast" onClick={()=>setNotice('')}>{notice}</div>}
 </div>
}
createRoot(document.getElementById('root')).render(<App/>);
