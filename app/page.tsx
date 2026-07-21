"use client";

import { useMemo, useState } from "react";

const nav = ["Overview", "Revenue", "Customers", "Product", "Forecasts", "Scenarios", "Alerts", "Data sources"];
const revenue = [43, 46, 45, 52, 55, 59, 61, 67, 70, 74, 79, 86];

export default function Home() {
  const [active, setActive] = useState("Overview");
  const [brief, setBrief] = useState(false);
  const [studio, setStudio] = useState(false);
  const [price, setPrice] = useState(8);
  const [churn, setChurn] = useState(2.8);
  const [hires, setHires] = useState(6);
  const result = useMemo(() => ({
    arr: 24.8 * (1 + price / 100) * (1 + (3.4 - churn) * .035),
    margin: 76.4 + price * .18 - hires * .12,
    runway: 21.4 - hires * .42 + price * .16,
  }), [price, churn, hires]);

  return <main className="shell">
    <aside>
      <div className="brand"><b>S</b><span>SignalBoard <em>AI</em></span></div>
      <div className="workspace"><i>N</i><span><small>WORKSPACE</small><strong>Northstar Labs</strong></span><b>⌄</b></div>
      <label>COMMAND CENTER</label>
      <nav>{nav.map((item, i) => <button className={active === item ? "active" : ""} onClick={() => setActive(item)} key={item}><i>{["⌂","↗","◎","◇","⌁","◈","△","⊞"][i]}</i><span>{item}</span>{item === "Alerts" && <b>3</b>}</button>)}</nav>
      <div className="sidefoot"><p><i/> <span><strong>All systems synced</strong><small>Updated 2 min ago</small></span></p><p><b>NK</b><span><strong>Nikhil Kumar</strong><small>Administrator</small></span></p></div>
    </aside>

    <section className="content">
      <header><div><small>TUESDAY, JULY 21</small><h1>{active === "Overview" ? "Good morning, Nikhil." : active}</h1><p>Here’s what’s happening across Northstar Labs today.</p></div><div className="actions"><button>⌕</button><button>♢</button><button className="primary" onClick={() => setBrief(true)}>✦ Generate briefing</button></div></header>

      <div className="intelligence"><b>✦</b><div><small>SIGNALBOARD INTELLIGENCE</small><strong>Expansion revenue is accelerating.</strong><span>Enterprise upgrades contributed $184K in new MRR this month—32% above forecast.</span></div><button onClick={() => setBrief(true)}>View analysis →</button></div>

      <div className="section-title"><div><h2>Company pulse</h2><p>Key metrics compared to the previous period</p></div><select aria-label="Reporting period"><option>Last 12 months</option><option>This quarter</option><option>Last 30 days</option></select></div>
      <div className="metrics"><Metric label="ANNUAL RECURRING REVENUE" value="$24.8M" delta="18.4%"/><Metric label="NET REVENUE RETENTION" value="118.6%" delta="4.2%"/><Metric label="GROSS MARGIN" value="76.4%" delta="1.8%"/><Metric label="CASH RUNWAY" value="21.4 mo" delta="2.1 mo"/></div>

      <div className="grid">
        <article className="card chart-card"><CardHead kicker="REVENUE PERFORMANCE" title="Monthly recurring revenue" tag="● On track"/><div className="chart-value"><strong>$2.31M</strong><span>↑ 4.5% this month</span></div><div className="chart"><div className="bars">{revenue.map((h,i)=><i key={i} style={{height:`${h}%`}} className={i===11?"last":""}/>)}</div><div className="months">{["Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar","Apr","May","Jun","Jul"].map(x=><span key={x}>{x}</span>)}</div></div></article>
        <article className="card alerts"><CardHead kicker="ATTENTION REQUIRED" title="Risks & opportunities"/><Signal tone="red" icon="!" title="Churn risk increased" text="14 accounts show declining usage" value="$286K ARR at risk"/><Signal tone="green" icon="↗" title="Expansion opportunity" text="8 teams near plan limits" value="$142K potential ARR"/><Signal tone="amber" icon="△" title="Cloud costs trending high" text="Compute spend 12% above plan" value="$38K monthly impact"/><button className="link">View all signals →</button></article>
        <article className="card forecast"><CardHead kicker="AI FORECAST" title="ARR trajectory" tag="92% confidence"/><div className="forecast-main"><div><small>PROJECTED ARR · DEC 2026</small><strong>$29.6M</strong><span>+$4.8M from today</span></div><div className="mini">{[36,45,52,60,69,78,87,96].map((h,i)=><i key={i} className={i>5?"future":""} style={{height:`${h}%`}}/>)}</div></div><button className="link" onClick={()=>setStudio(true)}>Explore forecast →</button></article>
        <article className="card scenario"><small>STRATEGIC PLANNING</small><h3>Model your next move</h3><p>Test pricing, hiring, and retention decisions against your growth plan.</p><div className="bubbles"><b>+8%<small>Pricing</small></b><b>2.8%<small>Churn</small></b><b>+6<small>Hires</small></b></div><button onClick={()=>setStudio(true)}>Open scenario studio →</button></article>
      </div>
    </section>

    {studio && <Modal close={()=>setStudio(false)}><small className="kicker">SCENARIO STUDIO</small><h2>Model your next move</h2><p>Adjust assumptions to see their projected effect on the company plan.</p><Range label="Pricing increase" value={price} min={0} max={20} step={1} suffix="%" set={setPrice}/><Range label="Monthly churn" value={churn} min={1} max={6} step={.1} suffix="%" set={setChurn}/><Range label="New hires" value={hires} min={0} max={20} step={1} suffix="" set={setHires}/><div className="results"><span><small>PROJECTED ARR</small><strong>${result.arr.toFixed(1)}M</strong></span><span><small>GROSS MARGIN</small><strong>{result.margin.toFixed(1)}%</strong></span><span><small>RUNWAY</small><strong>{result.runway.toFixed(1)} mo</strong></span></div><button className="save" onClick={()=>setStudio(false)}>Save scenario</button></Modal>}
    {brief && <Modal close={()=>setBrief(false)}><div className="ai">✦</div><small className="kicker">AI EXECUTIVE BRIEFING</small><h2>Northstar is ahead of plan.</h2><p className="lead">Growth remains efficient, led by enterprise expansion and improving retention.</p><div className="brief"><Brief n="01" title="Revenue momentum strengthened">MRR reached $2.31M, with enterprise upgrades driving 41% of net new revenue.</Brief><Brief n="02" title="Retention is outperforming">NRR improved to 118.6% as expansion offset a modest increase in SMB churn.</Brief><Brief n="03" title="One area needs attention">Cloud compute is 12% above plan. Rightsizing could recover $21K monthly.</Brief></div><button className="save" onClick={()=>setBrief(false)}>Done</button></Modal>}
  </main>
}

function Metric({label,value,delta}:{label:string,value:string,delta:string}){return <article className="metric"><span>{label}</span><strong>{value}</strong><p><b>↑ {delta}</b> vs. previous period</p><div>{[3,5,4,7,8,10,9,13,15,16].map((n,i)=><i style={{height:n}} key={i}/>)}</div></article>}
function CardHead({kicker,title,tag}:{kicker:string,title:string,tag?:string}){return <div className="card-head"><div><small>{kicker}</small><h3>{title}</h3></div>{tag&&<b>{tag}</b>}</div>}
function Signal({tone,icon,title,text,value}:{tone:string,icon:string,title:string,text:string,value:string}){return <div className="signal"><b className={tone}>{icon}</b><span><strong>{title}</strong><small>{text}</small></span><em>{value}</em></div>}
function Modal({children,close}:{children:React.ReactNode,close:()=>void}){return <div className="backdrop" onMouseDown={close}><section className="modal" onMouseDown={e=>e.stopPropagation()}><button className="close" onClick={close}>×</button>{children}</section></div>}
function Range({label,value,min,max,step,suffix,set}:{label:string,value:number,min:number,max:number,step:number,suffix:string,set:(n:number)=>void}){return <label className="range"><span>{label}<b>{value}{suffix}</b></span><input type="range" value={value} min={min} max={max} step={step} onChange={e=>set(Number(e.target.value))}/></label>}
function Brief({n,title,children}:{n:string,title:string,children:React.ReactNode}){return <p><b>{n}</b><span><strong>{title}</strong>{children}</span></p>}
