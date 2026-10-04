(function(root){
 'use strict';
 const usageMap={
  '政策依据':{chapters:['绪论与背景'],supports:'说明为什么关注边境旅游、农文旅和地方供给',action:'摘录具体政策任务，注明发布主体与适用范围',limit:'政策任务不等于已经形成消费转化或守边固疆效果'},
  '统计数据':{chapters:['绪论与背景','研究范围与口径'],supports:'提供旅游需求、农品市场或地区规模的背景',action:'保留年份、统计期、地区、单位和分母，核对原表后引用',limit:'全国或县域规模不证明农场购买率；阶段数据不写成全年'},
  '地方背景':{chapters:['绪论与背景','案例与商品界定'],supports:'说明研究地区的条件和案例选择理由',action:'区分县域、农场与具体点位，补现时经营信息',limit:'地方介绍不是游客行为或产品销售证据'},
  '场景与接触':{chapters:['案例与商品界定','调查工具与招募'],supports:'定位游客可能接触产品的点位与联系对象',action:'联系实际经营者，核当前接待、商品、游客类型和招募路径',limit:'活动或展会报道不证明当前常态经营或游客已付款'},
  '品牌与商品':{chapters:['案例与商品界定','调查工具与招募'],supports:'界定候选商品、品牌主体及游客可能关注的产品线索',action:'核具体商品、产地、标签、规格、时点价格及购买条件',limit:'品牌授权、产品名录和商品页面不等于当前点位在售或实际成交'},
  '渠道与经营':{chapters:['供给与结算分析','调查工具与招募'],supports:'识别购买、寄送、供货和经营收益核查的接口',action:'按同商品、同点位、同时间核供货、收款、成本和匿名到账',limit:'项目投入、渠道能力与营业收入不等于农户所得或地方净增收'},
  '研究与方法':{chapters:['文献与变量依据','分析模型与条件'],supports:'提供题目设计、解释线索和条件性分析方法的依据',action:'核原研究对象和测量，结合预调查再确定本项目题项与模型',limit:'外部方法或显著结果不能替代本项目样本与估计'},
  '学术文献':{chapters:['文献与变量依据','调查工具与招募'],supports:'提供购买决策、地方信任或消费行为的候选解释',action:'区分全文与摘要，核对象和题项语义，不直接照搬量表',limit:'外部研究关联不证明本项目因果，摘要记录不能冒充全文核查'}
 };
 function usageFor(r){let u=usageMap[r.topic]||(r.method?usageMap['学术文献']:null)||{chapters:['研究范围与口径'],supports:'作为待分类的公开线索',action:'先核原文、时间和对象，再决定是否采用',limit:'未明确的线索暂不用于核心结论'};
  if(/预算|决算/.test(r.title||''))u={chapters:['绪论与背景','研究范围与口径'],supports:'说明公共投入或财政项目背景',action:'保留财政口径；商品销售、供货到账和成本另行取证',limit:'财政支出和部门决算不等于游客购买、商品营业收入或经营所得'};
  else if(/采购|监理|成交公告/.test(r.title||''))u={chapters:['案例与商品界定','研究范围与口径'],supports:'定位建设内容和项目阶段，帮助核查案例条件',action:'区分采购、施工、验收与正式运行，再核当前接待和实际营业',limit:'采购或监理成交金额不等于工程验收、游客付款或地方收益'};
  else if(r.topic==='品牌与商品'&&/名录|授权|专用标志|注销公告/.test(r.title||''))u={chapters:['案例与商品界定','调查工具与招募'],supports:'核对特定商品和指定经营主体的名录、资格或登记状态',action:'核文件指定主体、时期和状态，再确认当前点位与实际商品',limit:'指定企业登记状态不代表产品整体或其他经营者的状态；名录不证明游客已购买'};
  return {...u,...(r.usage||{})};}
 const publicKeys=['id','url','title','publisher','region','topic','published','period','periodYears','observed','retrieved','status','note','summary','aliases','metrics','context','method','sample','authors','verification','scope','indicator','value','unit','use_limit','source_id','sourceKey','stage','need','via','limit','usage'];
 function publicRecord(r){const o={};for(const k of publicKeys)if(r[k]!==undefined)o[k]=r[k];o.archives=[];o.documents=[];o.aliases=[];if(!r.need)o.usage=usageFor(r);return o;}
 function publicPayload(raw){return {updated:raw.updated,countNote:raw.countNote,publicMode:true,sources:(raw.sources||[]).map(publicRecord),metrics:(raw.metrics||[]).map(publicRecord),literature:(raw.literature||[]).map(publicRecord),gaps:(raw.gaps||[]).map(publicRecord)};}
 const api={usageFor,publicPayload};if(typeof module!=='undefined')module.exports=api;root.EvidenceUsage=api;
})(typeof globalThis!=='undefined'?globalThis:this);
