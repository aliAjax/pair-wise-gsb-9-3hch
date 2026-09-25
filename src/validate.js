// 校验层：日期计算与台账规则，全部为纯函数，不碰存储和界面
export const todayStr=()=>{const t=new Date();return `${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,'0')}-${String(t.getDate()).padStart(2,'0')}`};
export const daysBetween=(a,b)=>Math.round((new Date(b)-new Date(a))/86400000);

// 某篇文献当前未到货的互借单（规则：同时最多一张）
export const pendingOrderOf=(orders,paperId)=>orders.find(o=>o.paperId===paperId&&!o.arrivedDate)||null;

export const isOverdue=(o,today=todayStr())=>!!o&&!o.arrivedDate&&!!o.expectedDate&&o.expectedDate<today;
export const overdueDays=(o,today=todayStr())=>isOverdue(o,today)?daysBetween(o.expectedDate,today):0;

// 全库逾期清单：文献、申请日期、逾期天数，按逾期天数降序
export const overdueList=(orders,papers,today=todayStr())=>orders
 .filter(o=>isOverdue(o,today))
 .map(o=>({order:o,paper:papers.find(p=>p.id===o.paperId),days:overdueDays(o,today)}))
 .filter(x=>x.paper)
 .sort((a,b)=>b.days-a.days);

// 互借申请校验：日期必填、到货不早于申请、同篇不得重复挂在途单
export function validateOrderDraft(draft,orders,paperId){
 const errs={};
 if(!draft.requestDate)errs.requestDate='请填写申请日期';
 if(!draft.expectedDate)errs.expectedDate='请填写预计到货日期';
 if(draft.requestDate&&draft.expectedDate&&draft.expectedDate<draft.requestDate)errs.expectedDate='预计到货日期不能早于申请日期';
 if(pendingOrderOf(orders,paperId))errs.paper='该文献已有一张未到货的互借单，到货后才能再次申请';
 return errs;
}

export const activeLoansOf=(loans,paperId)=>loans.filter(l=>l.paperId===paperId&&!l.returnDate);

// 移出文献前的清点：还在路上的互借单 + 未归还的借出记录
export const removalChecklist=(paperId,orders,loans)=>({
 pending:orders.filter(o=>o.paperId===paperId&&!o.arrivedDate),
 lending:activeLoansOf(loans,paperId)
});
