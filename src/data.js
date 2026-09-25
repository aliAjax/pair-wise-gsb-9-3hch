// 资料层：初始数据与常量，只放数据，不放逻辑
export const METHODS=['未登记','开放获取','机构数据库','馆际互借','自购','作者提供'];

const fmt=t=>`${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,'0')}-${String(t.getDate()).padStart(2,'0')}`;
const d=n=>{const t=new Date();t.setDate(t.getDate()+n);return fmt(t)};

export function seed(){return{
papers:[
 {id:1,title:'The Extended Mind',authors:'Clark, A. & Chalmers, D.',year:1998,venue:'Analysis',tags:['具身认知','经典'],abstract:'本文提出心智延展论：当外部环境稳定地承担认知功能时，心智边界可以超越头脑与身体。',status:'阅读中',cite:'Clark, A. & Chalmers, D. (1998). The Extended Mind. Analysis.',acquisition:{method:'馆际互借'}},
 {id:2,title:'Situated Learning',authors:'Lave, J. & Wenger, E.',year:1991,venue:'Cambridge University Press',tags:['学习科学','社会'],abstract:'学习发生在真实情境的参与过程中，知识与共同体实践不可分割。',status:'待读',cite:'Lave, J. & Wenger, E. (1991). Situated Learning.',acquisition:{method:'馆际互借'}},
 {id:3,title:'Designing with Data',authors:'Miller, S.',year:2022,venue:'MIT Press',tags:['设计研究','方法'],abstract:'一套面向设计师的数据研究方法，讨论如何把定性洞察转化为可行动的设计决策。',status:'已读',cite:'Miller, S. (2022). Designing with Data.',acquisition:{method:'开放获取'}}
],
// 互借单：arrivedDate 为空表示在途；同一篇文献同时只允许一张在途单（由校验层保证）
orders:[
 {id:101,paperId:1,requestDate:d(-60),expectedDate:d(-45),arrivedDate:d(-47),location:'总馆 A区 3架 2层'},
 {id:102,paperId:2,requestDate:d(-20),expectedDate:d(-3),arrivedDate:null,location:''}
],
// 借出记录：returnDate 为空表示未归还
loans:[
 {id:201,paperId:1,borrower:'王同学',lendDate:d(-10),returnDate:null}
]
}}
