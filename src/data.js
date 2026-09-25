// 资料层：示例数据与字段规范化
export const seed=[
{id:1,title:'The Extended Mind',authors:'Clark, A. & Chalmers, D.',year:1998,venue:'Analysis',tags:['具身认知','经典'],abstract:'本文提出心智延展论：当外部环境稳定地承担认知功能时，心智边界可以超越头脑与身体。',status:'阅读中',cite:'Clark, A. & Chalmers, D. (1998). The Extended Mind. Analysis.',method:'开放获取',location:'出版社官网 OA 全文',ill:[],loans:[]},
{id:2,title:'Situated Learning',authors:'Lave, J. & Wenger, E.',year:1991,venue:'Cambridge University Press',tags:['学习科学','社会'],abstract:'学习发生在真实情境的参与过程中，知识与共同体实践不可分割。',status:'待读',cite:'Lave, J. & Wenger, E. (1991). Situated Learning.',method:'馆际互借',location:'',ill:[{id:21,requested:'2026-08-20',expected:'2026-09-10',arrived:null,location:''}],loans:[]},
{id:3,title:'Designing with Data',authors:'Miller, S.',year:2022,venue:'MIT Press',tags:['设计研究','方法'],abstract:'一套面向设计师的数据研究方法，讨论如何把定性洞察转化为可行动的设计决策。',status:'已读',cite:'Miller, S. (2022). Designing with Data.',method:'馆际互借',location:'本馆三楼西架 B-12',ill:[{id:31,requested:'2026-07-02',expected:'2026-07-20',arrived:'2026-07-18',location:'本馆三楼西架 B-12'}],loans:[{id:32,borrower:'王同学',lent:'2026-09-12',returned:null}]}
];
// 旧版本地数据缺少台账字段，读取时补齐默认值
export const normalize=p=>({notes:'',method:'待定',location:'',...p,tags:p.tags||[],ill:(p.ill||[]).map(o=>({location:'',arrived:null,...o})),loans:(p.loans||[]).map(l=>({returned:null,...l}))});
