(function(root){
 'use strict';
 function normaliseURL(value){try{const u=new URL(value);u.hash='';u.pathname=u.pathname.replace(/\/$/,'');return u.href.replace(/\/$/,'');}catch{return value;}}
 function filterRecords(rows,f={}){return rows.filter(r=>{
  const q=(f.q||'').trim().toLowerCase();
  return (!q||[r.id,r.url,r.title,r.publisher,r.summary,r.note,r.indicator,r.scope,r.period,r.value,r.usage?.supports,r.usage?.action,...(r.usage?.chapters||[]),...(r.aliases||[])].join(' ').toLowerCase().includes(q))
   &&(!f.region||r.region===f.region)&&(!f.topic||r.topic===f.topic)&&(!f.status||r.status===f.status)
   &&(!f.chapter||(r.usage?.chapters||[]).includes(f.chapter))
   &&(!f.year||(f.timeMode==='period'?(r.periodYears||[]).includes(f.year):String(r.published||'').startsWith(f.year)));
 });}
 function toCSV(rows){return '\ufeff'+rows.map(row=>row.map(value=>{let s=String(value??'');if(/^[=+\-@]/.test(s)&&!/^[-+]?\d+(\.\d+)?$/.test(s))s="'"+s;return /[",\r\n]/.test(s)?'"'+s.replace(/"/g,'""')+'"':s;}).join(',')).join('\r\n');}
 const api={normaliseURL,filterRecords,toCSV};
 if(typeof module!=='undefined')module.exports=api;
 root.EvidenceDashboard=api;
 if(typeof document==='undefined')return;
 const data=JSON.parse(document.getElementById('evidence-data').textContent);
 const collaboration=root.EvidenceUsage;
 for(const key of ['sources','metrics','literature'])for(const r of data[key])if(collaboration)r.usage=collaboration.usageFor(r);
 const $=s=>document.querySelector(s);
 const state={tab:'sources',page:1,pageSize:12};
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const local=p=>'../'+p.split('/').map(encodeURIComponent).join('/');
 const listFor=()=>data[state.tab]||[];
 const query=()=>({q:$('#search').value,region:$('#region').value,topic:$('#topic').value,status:$('#status').value,year:$('#year').value,timeMode:$('#time-mode').value,chapter:$('#chapter')?.value||''});
 function usageBlock(r){const u=r.usage;if(!u)return '';return `<div class="usage-block"><span class="usage-caption">研究使用建议</span><p>${esc(u.supports)}</p><div class="chapter-chips">${u.chapters.map(c=>`<button type="button" data-chapter="${esc(c)}">${esc(c)}</button>`).join('')}</div><p class="usage-next"><b>下一步</b> ${esc(u.action)}</p></div>`;}
 function options(id,key,rows,label){const current=$(id).value;const values=[...new Set(rows.map(r=>r[key]).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'zh-CN'));$(id).innerHTML='<option value="">'+label+'</option>'+values.map(v=>`<option value="${esc(v)}">${esc(v)}</option>`).join('');if(values.includes(current))$(id).value=current;}
 function yearOptions(rows){const years=[...new Set(rows.flatMap(r=>[...(String(r.published||'').match(/^(?:19|20)\d{2}/)||[]),...(r.periodYears||[])]))].sort().reverse();$('#year').innerHTML='<option value="">所有年份</option>'+years.map(y=>`<option>${y}</option>`).join('');}
 function counts(){for(const k of ['sources','metrics','literature','gaps'])$('#count-'+k).textContent=data[k].length;const totals={};data.sources.forEach(r=>totals[r.topic]=(totals[r.topic]||0)+1);const max=Math.max(...Object.values(totals));$('#coverage').innerHTML=Object.entries(totals).sort((a,b)=>b[1]-a[1]).map(([name,n])=>`<button type="button" class="coverage-item" data-topic="${esc(name)}" aria-label="筛选${esc(name)} ${n}条原页记录"><span>${esc(name)}</span><span class="bar"><i style="width:${n/max*100}%"></i></span><b>${n}</b></button>`).join('');}
 function sourceCard(r){return `<article class="record-card"><div class="record-top"><span class="badge">${esc(r.topic)}</span><span class="status ${r.status.includes('疑点')?'warn':''}">${esc(r.status)}</span></div><h3>${esc(r.title)}</h3><p class="byline">${esc(r.publisher)}</p><div class="record-meta"><span>${esc(r.region)}</span><span>${esc(r.published||(r.observed?'页面观察 '+r.observed:'发布日期未核'))}</span></div><p class="summary">${esc(r.summary||'原页已纳入资料库，具体采用字段需要结合原文核查。')}</p>${usageBlock(r)}<div class="boundary"><b>原资料采用边界</b><p>${esc(r.note)}</p></div><div class="record-bottom"><span>${esc(r.id)}${r.metrics.length?' · '+r.metrics.length+' 项指标':''}</span><button type="button" class="detail" data-record="${esc(r.id)}">查看依据 <span aria-hidden="true">↗</span></button></div></article>`;}
 function metricTable(rows){return `<div class="table-scroll" tabindex="0" aria-label="可横向滚动的指标清单"><table><thead><tr><th>地区与对象</th><th>统计期</th><th>指标</th><th>数值</th><th>单位</th><th>采用边界</th><th>来源</th></tr></thead><tbody>${rows.map(r=>`<tr><td>${esc(r.scope)}</td><td>${esc(r.period)}</td><td>${esc(r.indicator)}</td><td class="value">${esc(r.value)}</td><td>${esc(r.unit)}</td><td>${esc(r.use_limit)}</td><td><button type="button" class="detail" data-record="${r.id}">原页与口径 ↗</button></td></tr>`).join('')}</tbody></table></div>`;}
 function literatureCard(r){return `<article class="record-card paper"><div class="record-top"><span class="badge">${esc(r.id)} · ${esc(r.published)}</span><span class="status">${esc(r.status)}</span></div><h3>${esc(r.title)}</h3><p class="byline">${esc(r.publisher)}</p><p class="summary">${esc(r.context)}</p>${usageBlock(r)}<div class="boundary"><b>方法与适用范围</b><p>${esc(r.method)}</p></div><div class="record-bottom"><span>外部研究依据</span><button type="button" class="detail" data-record="${r.id}">查看文献 ↗</button></div></article>`;}
 function gapCard(r){return `<article class="gap-card"><div class="gap-index">${r.id.replace('G','')}</div><div><span class="badge">${esc(r.stage)} · 待采集</span><h3>${esc(r.title)}</h3><p>${esc(r.need)}</p><div class="gap-action"><b>怎样取得</b><span>${esc(r.via)}</span></div><p class="gap-limit">${esc(r.limit)}</p></div></article>`;}
 function render(){
  const rows=filterRecords(listFor(),query());const pages=Math.max(1,Math.ceil(rows.length/state.pageSize));state.page=Math.min(state.page,pages);
  const visible=rows.slice((state.page-1)*state.pageSize,state.page*state.pageSize);
  $('#results').className=state.tab==='metrics'?'':'records'+(state.tab==='gaps'?' gap-grid':'');
  $('#results').innerHTML=!rows.length?'<div class="empty"><h3>没有匹配的资料</h3><p>可以更换关键词或清除筛选条件。</p><button type="button" class="soft-button" id="empty-reset">清除筛选</button></div>':state.tab==='metrics'?metricTable(visible):visible.map(state.tab==='gaps'?gapCard:state.tab==='literature'?literatureCard:sourceCard).join('');
  $('#result-count').textContent=rows.length+' / '+listFor().length+' 条';$('#pagination').hidden=rows.length<=state.pageSize;$('#page-label').textContent=state.page+' / '+pages;$('#prev-page').disabled=state.page===1;$('#next-page').disabled=state.page===pages;
  $('#export').disabled=!rows.length;$('#filters').hidden=state.tab==='gaps';$('#pager-note').textContent=state.tab==='sources'?'按原页网址合并的资料记录；不同网址仍可能是同一统计或转载。':state.tab==='metrics'?'保留原统计期、单位与来源；不同地域和时期不直接汇总或混比。':state.tab==='literature'?'32篇历史文献索引，访问等级保留；较新补查见详情里的配套核查记录。':'五类优先一手数据目前仍待取得；空表和拟定工作量不计作调查结果。';
 }
 function chapterOptions(){if(!$('#chapter'))return;const current=$('#chapter').value;const values=[...new Set(listFor().flatMap(r=>r.usage?.chapters||[]))];$('#chapter').innerHTML='<option value="">所有采用位置</option>'+values.map(v=>`<option>${esc(v)}</option>`).join('');if(values.includes(current))$('#chapter').value=current;}
 function switchTab(tab){state.tab=tab;state.page=1;$('#search').value='';['region','topic','status','year','chapter'].forEach(id=>{if($('#'+id))$('#'+id).value='';});$('#time-mode').value='published';document.querySelectorAll('[data-tab]').forEach(b=>{const active=b.dataset.tab===tab;b.setAttribute('aria-selected',active);b.classList.toggle('active',active);});options('#region','region',listFor(),'所有地区');options('#topic','topic',listFor(),'所有主题');options('#status','status',listFor(),'所有核查状态');yearOptions(listFor());chapterOptions();$('#section-title').textContent={sources:'公开资料库',metrics:'公开指标清单',literature:'核心文献依据',gaps:'下一步补什么'}[tab];render();}
 function reset(){['search','region','topic','status','year','chapter'].forEach(id=>{if($('#'+id))$('#'+id).value='';});state.page=1;render();}
 function detail(id){const r=[...data.sources,...data.metrics,...data.literature].find(x=>x.id===id);if(!r)return;
  $('#detail-title').textContent=r.title;const details=[['来源',r.publisher||r.source_role],['地区与对象',r.scope||r.region],['发布日期',r.published||'未核发布日期'],['统计期',r.period||'未注明／不适用'],['核查状态',r.verification||r.status],['采用边界',r.note],['原文摘要',r.summary]];
  if(r.observed)details.splice(3,0,['页面观察日',r.observed]);
  if(r.method)details.push(['研究方法',r.method],['原研究样本',r.sample],['作者',r.authors]);
  if(r.usage)details.push(['研究使用建议',r.usage.supports],['适合写在哪',r.usage.chapters.join('、')],['下一步怎么用',r.usage.action],['建议的使用限制',r.usage.limit]);
  $('#detail-body').innerHTML='<dl>'+details.filter(([k,v])=>v).map(([k,v])=>`<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')+'</dl>'+
  (r.aliases?.length?`<p class="detail-note">原登记编号：${esc(r.aliases.join('、'))}。编号来自不同批次，请结合登记文件理解。</p>`:'')+
  `<a class="primary-link" target="_blank" rel="noopener noreferrer" href="${esc(r.url)}">打开原始来源 ↗</a>`+
  ((r.archives||[]).length?'<h3>本地归档</h3>'+r.archives.map(p=>`<a class="file-link" target="_blank" rel="noopener" href="${esc(local(p))}">${esc(p.split('/').pop())} ↗</a>`).join(''):'')+
  ((r.documents||[]).length?'<h3>核查与采用记录</h3>'+r.documents.map(p=>`<a class="file-link" target="_blank" rel="noopener" href="${esc(local(p))}">${esc(p.split('/').pop())} ↗</a>`).join(''):'')+
  '<p class="detail-note">研究使用建议由团队整理，不是原文直接结论。资料快照日期：'+esc(data.updated)+'；来源网页可能更新。本轮未重新核验全部远端链接。</p>';
  $('#detail-dialog').showModal();
 }
 function exportRows(){const rows=filterRecords(listFor(),query());let matrix;
  if(state.tab==='metrics')matrix=[['指标编号','原来源编号','地区与对象','统计期','发布日期','指标','数值','单位','核查状态','采用边界','原页','本地归档'],...rows.map(r=>[r.id,r.source_id,r.scope,r.period,r.published,r.indicator,r.value,r.unit,r.verification,r.use_limit,r.url,r.archive])];
  else if(state.tab==='gaps')matrix=[['编号','待补证据','所需数据','获取方式','采用边界'],...rows.map(r=>[r.id,r.title,r.need,r.via,r.limit])];
  else matrix=[['编号','标题','发布主体或站点','地区','主题','发布日期','页面观察日','统计期','核查状态','摘要','采用边界','原页','归档','核查记录','研究使用建议','写作位置','下一步'],...rows.map(r=>[r.id,r.title,r.publisher,r.region,r.topic,r.published,r.observed,r.period,r.status,r.summary,r.note,r.url,(r.archives||[]).join(' | '),(r.documents||[]).join(' | '),r.usage?.supports,(r.usage?.chapters||[]).join('、'),r.usage?.action])];
  const blob=new Blob([toCSV(matrix)],{type:'text/csv;charset=utf-8;'}),u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download='2026-10-04-'+{sources:'筛选公开资料',metrics:'筛选公开指标',literature:'筛选核心文献',gaps:'优先证据缺口'}[state.tab]+'.csv';a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);$('#export-status').textContent='已导出当前 '+rows.length+' 条记录';
 }
 document.querySelectorAll('[data-tab]').forEach(b=>b.addEventListener('click',()=>switchTab(b.dataset.tab)));
 $('#filters').addEventListener('input',()=>{state.page=1;render();});$('#filters').addEventListener('submit',e=>e.preventDefault());$('#reset').addEventListener('click',reset);
 $('#prev-page').addEventListener('click',()=>{state.page--;render();});$('#next-page').addEventListener('click',()=>{state.page++;render();});$('#export').addEventListener('click',exportRows);
 $('#results').addEventListener('click',e=>{const b=e.target.closest('[data-record]');if(b)detail(b.dataset.record);const c=e.target.closest('[data-chapter]');if(c&&$('#chapter')){$('#chapter').value=c.dataset.chapter;state.page=1;render();}if(e.target.closest('#empty-reset'))reset();});
 $('#coverage').addEventListener('click',e=>{const b=e.target.closest('[data-topic]');if(!b)return;switchTab('sources');$('#topic').value=b.dataset.topic;render();$('#library').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});});
 $('#close-detail').addEventListener('click',()=>$('#detail-dialog').close());$('#detail-dialog').addEventListener('click',e=>{if(e.target===$('#detail-dialog')){const b=e.target.getBoundingClientRect();if(e.clientX<b.left||e.clientX>b.right||e.clientY<b.top||e.clientY>b.bottom)e.target.close();}});
 $('#count-note').textContent=data.countNote;counts();switchTab('sources');
 const questions=[
  {no:'01',title:'为什么值得研究？',answer:'已有政策与旅游、农品市场背景。可以写研究缘起，不能据规模推算农场购买率。',chapter:'绪论与背景',topics:['政策依据','统计数据','地方背景'],button:'看背景与口径'},
  {no:'02',title:'饶河可以从哪里切入？',answer:'已有黑蜂商品、研学与G331触点线索。先核现在谁接待、卖什么、谁供货。',chapter:'案例与商品界定',topics:['场景与接触','品牌与商品'],button:'看点位与商品'},
  {no:'03',title:'游客为什么买或没买？',answer:'文献支持候选问题与解释线索。真实购买、未买事件和旅后消费仍要调查。',chapter:'文献与变量依据',tab:'literature',button:'看文献与调查依据'},
  {no:'04',title:'消费怎样连到本地供给？',answer:'已有渠道和经营背景。净增收与守边固疆效果仍没有直接证据，须补结算、成本和基线。',chapter:'供给与结算分析',topics:['渠道与经营'],button:'看供给与结算'}
 ];
 function story(){if(!$('#research-map'))return;$('#research-map').innerHTML=questions.map(q=>`<article class="research-question"><div class="question-top"><span>${q.no}</span><small>${esc(q.chapter)}</small></div><h3>${esc(q.title)}</h3><p>${esc(q.answer)}</p><button type="button" data-question="${q.no}">${esc(q.button)} <span>↗</span></button></article>`).join('');}
 $('#research-map')?.addEventListener('click',e=>{const b=e.target.closest('[data-question]');if(!b)return;const q=questions.find(x=>x.no===b.dataset.question);switchTab(q.tab||'sources');if($('#chapter'))$('#chapter').value=q.chapter;render();$('#library').scrollIntoView({behavior:'smooth'});});
 root.EvidenceDashboardUI={data,switchTab,render};
 story();
})(typeof globalThis!=='undefined'?globalThis:this);
