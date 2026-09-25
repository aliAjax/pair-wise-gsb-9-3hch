// 校验层：获取方式、互借单与借出记录的规则和派生数据
export const METHODS=['待定','开放获取','机构订阅','馆际互借','作者索取','其他'];
const DAY=86400000;
const ts=s=>new Date(s+'T00:00:00').getTime();
// 同一篇同时只允许一张没到货的互借单
export const pendingOrder=p=>(p.ill||[]).find(o=>!o.arrived)||null;
export const validateRequest=({requested,expected})=>{
 if(!requested)return'请填写互借申请日期';
 if(!expected)return'请填写预计到货日期';
 if(expected<requested)return'预计到货日期不能早于申请日期';
 return null;
};
export const validateLocation=loc=>loc&&loc.trim()?null:'到货登记需要填写馆藏位置';
// 未到货且今天已过预计到货日期即为逾期，返回逾期天数
export const overdueDays=(order,today)=>{
 if(!order||order.arrived)return 0;
 const d=Math.floor((ts(today)-ts(order.expected))/DAY);
 return d>0?d:0;
};
export const overdueList=(items,today)=>items.flatMap(p=>(p.ill||[]).filter(o=>overdueDays(o,today)>0).map(o=>({paper:p,order:o,days:overdueDays(o,today)})));
export const activeLoans=p=>(p.loans||[]).filter(l=>!l.returned);
// 移出文献前需要结清的在途互借单与未归还借出
export const removalCheck=p=>({orders:(p.ill||[]).filter(o=>!o.arrived),loans:activeLoans(p)});
