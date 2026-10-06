import React,{useEffect,useMemo,useState} from 'react';
import {createRoot} from 'react-dom/client';
import './style.css';

const API=((import.meta.env.VITE_API_URL||'http://localhost:8080').replace(/\/$/,'')+'/api');

async function api(path,opt={}){
  const r=await fetch(API+path,opt);
  const t=await r.text();
  if(!r.ok) throw new Error(t||`HTTP ${r.status}`);
  return t?JSON.parse(t):{};
}

const demo={
 STUDENT:{username:'student@college.edu',password:'Student@123'},
 FACULTY:{username:'faculty@college.edu',password:'Faculty@123'}
};

function Login({onDone}){
 const [role,setRole]=useState('STUDENT');
 const [form,setForm]=useState(demo.STUDENT);
 const [error,setError]=useState('');
 const choose=r=>{setRole(r);setForm(demo[r]);setError('')};
 const login=async e=>{e.preventDefault();setError('');try{
   const u=await api('/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)});
   if(u.role!==role) throw new Error(`Please use the ${role==='FACULTY'?'Faculty':'Student'} login.`);
   localStorage.setItem('af_user',JSON.stringify(u)); onDone(u);
 }catch(err){setError(err.message.includes('Please use')?err.message:'Login failed. Make sure Spring Boot backend is running and credentials are correct.');}};
 return <div className="login"><form className="loginCard" onSubmit={login}>
   <div className="flower">🌸</div><h1>Academia Flora</h1><p>Assignment Management Portal</p>
   <div className="roleSwitch"><button type="button" className={role==='STUDENT'?'selected':''} onClick={()=>choose('STUDENT')}>🎓 Student Login</button><button type="button" className={role==='FACULTY'?'selected':''} onClick={()=>choose('FACULTY')}>👩‍🏫 Faculty Login</button></div>
   <div className="loginRole">Login as <b>{role==='FACULTY'?'Faculty':'Student'}</b></div>
   <input value={form.username} onChange={e=>setForm({...form,username:e.target.value})} placeholder="Username" required/>
   <input type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} placeholder="Password" required/>
   <button className="primary full">Login as {role==='FACULTY'?'Faculty':'Student'}</button>
   {error&&<div className="error">{error}</div>}
   <div className="credentials"><b>Faculty:</b> faculty@college.edu / Faculty@123<br/><b>Student:</b> student@college.edu / Student@123</div>
 </form></div>
}

function DueAlert({a,submitted=false}){
 if(submitted) return null;
 const deadline=new Date(a.deadline);
 const ms=deadline.getTime()-Date.now();
 if(Number.isNaN(deadline.getTime())) return <div className="alert warning">⚠️ <b>Reminder:</b> {a.title} has a deadline that could not be read.</div>;
 const h=ms/3600000;
 if(ms<=0) return <div className="alert danger">🚨 <b>Deadline passed:</b> {a.title}. Any submission now is late.</div>;
 if(h<=6) return <div className="alert danger">🔴 <b>Urgent alert:</b> {a.title} is due in {Math.max(1,Math.ceil(h))} hour(s).</div>;
 if(h<=24) return <div className="alert warning">⏰ <b>Reminder:</b> {a.title} is due within 24 hours.</div>;
 const days=Math.ceil(h/24);
 return <div className="alert info">🔔 <b>Upcoming:</b> {a.title} is due in {days} day(s), on {deadline.toLocaleString()}.</div>;
}

function App(){
 const [user,setUser]=useState(()=>JSON.parse(localStorage.getItem('af_user')||'null'));
 const [page,setPage]=useState('Dashboard'),[menu,setMenu]=useState(false);
 const [assignments,setAssignments]=useState([]),[subs,setSubs]=useState([]),[allSubs,setAllSubs]=useState([]);
 const [notice,setNotice]=useState(''),[connected,setConnected]=useState(false),[file,setFile]=useState(null);
 const [form,setForm]=useState({title:'',description:'',deadline:''});
 const [now,setNow]=useState(Date.now());
 const pending=useMemo(()=>user?.role==='STUDENT'?assignments.filter(a=>!subs.some(s=>s.assignmentId===a.id)):[],[assignments,subs,user?.role]);
 const alertAssignments=useMemo(()=>{
   if(user?.role!=='STUDENT') return [];
   // Show every pending assignment in Notifications. DueAlert decides whether
   // it is urgent, within 24 hours, overdue, or simply upcoming.
   return pending;
 },[pending]);
 const load=async()=>{if(!user)return;try{
   const a=await api('/assignments');setAssignments(a);setConnected(true);
   if(user.role==='STUDENT') setSubs(await api('/submissions/student/'+user.id));
   if(user.role==='FACULTY') setAllSubs(await api('/submissions'));
 }catch(e){setConnected(false);}};
 useEffect(()=>{load();},[user?.id]);
 useEffect(()=>{if(!user)return;const t=setInterval(load,30000);return()=>clearInterval(t)},[user?.id]);
 useEffect(()=>{const t=setInterval(()=>setNow(Date.now()),30000);return()=>clearInterval(t)},[]);
 if(!user)return <Login onDone={setUser}/>;
 const logout=()=>{localStorage.removeItem('af_user');setUser(null)};
 const go=p=>{setPage(p);setMenu(false)};
 async function submit(a){if(!file){setNotice('Please choose a file first.');return}const fd=new FormData();fd.append('studentId',user.id);fd.append('file',file);try{await api('/submissions/'+a.id,{method:'POST',body:fd});setFile(null);setNotice('✓ Assignment submitted successfully.');load()}catch(e){setNotice('Submission failed. Check backend connection.')}}
 async function create(e){e.preventDefault();const fd=new FormData();fd.append('title',form.title);fd.append('description',form.description);fd.append('deadline',form.deadline);try{await api('/assignments',{method:'POST',body:fd});setForm({title:'',description:'',deadline:''});setNotice('✓ Assignment created in database.');load()}catch(e){setNotice('Could not create assignment. Check backend connection.')}}
 async function grade(id){const marks=prompt('Enter marks:');if(marks===null)return;const remarks=prompt('Enter remarks:')||'';try{await api('/submissions/'+id+'/grade',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({marks:Number(marks),remarks})});setNotice('✓ Grade saved in database.');load()}catch(e){setNotice('Could not save grade.')}}
 const studentNav=['Dashboard','Assignments','Submissions','Notifications','Feedback','Profile'];
 const facultyNav=['Dashboard','Assignments','Submissions','Notifications','Feedback','Profile'];
 const nav= user.role==='FACULTY'?facultyNav:studentNav;
 return <div>
  <nav><div className="brand">🌸 <b>Academia Flora</b><small>Assignment Management Portal</small></div>
   <button className="hamburger" onClick={()=>setMenu(!menu)} aria-label="Menu">☰</button>
   <div className={'navlinks '+(menu?'open':'')}>{nav.map(x=><button key={x} className={page===x?'active':''} onClick={()=>go(x)}>{x}{x==='Notifications'&&alertAssignments.length>0?<em>{alertAssignments.length}</em>:null}</button>)}</div>
   <button className="logout" onClick={logout}>Logout</button>
  </nav>
  <main>
   {!connected&&<div className="offline">● Backend is not connected. Start Spring Boot at <b>http://localhost:8080</b> or set <b>VITE_API_URL</b> to your deployed backend URL.</div>}
   {notice&&<div className="notice">{notice}<button onClick={()=>setNotice('')}>×</button></div>}
   <header className="hero"><div><span>● LIVE ASSIGNMENT & GRADING SYSTEM</span><h2>{page==='Dashboard'?<>Seamless Assignment Submissions,<br/>Timely Grading & Insights</>:page}</h2><p>Eliminate missed deadlines with automatic due-date alerts.</p></div><div className="user"><b>{user.name}</b><small>{user.role}</small></div></header>
   {page==='Dashboard'&&<><div className="stats"><div><b>{assignments.length}</b><span>Total Assignments</span></div><div><b>{user.role==='STUDENT'?subs.length:allSubs.length}</b><span>Submissions</span></div><div><b>{alertAssignments.length}</b><span>Notifications</span></div></div><h3>🔔 Upcoming Alerts</h3>{alertAssignments.map(a=><DueAlert key={a.id} a={a}/>)}{!alertAssignments.length&&<div className="card">🎉 No pending assignment alerts.</div>}</>}
   {page==='Notifications'&&<><h3>🔔 Notifications</h3>{alertAssignments.map(a=><DueAlert key={a.id} a={a}/>)}{!alertAssignments.length&&<div className="card">🎉 No pending assignment alerts.</div>}</>}
   {page==='Assignments'&&<><h3>📚 Assignments</h3>{user.role==='FACULTY'&&<form className="card form" onSubmit={create}><h3>Create Assignment</h3><input required placeholder="Assignment title" value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/><textarea required placeholder="Description" value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/><input required type="datetime-local" value={form.deadline} onChange={e=>setForm({...form,deadline:e.target.value})}/><button className="primary">Create Assignment</button></form>}
   {assignments.map(a=>{const s=subs.find(x=>x.assignmentId===a.id);return <div className="card" key={a.id}><div className="row"><h3>{a.title}</h3><span>{new Date(a.deadline).toLocaleString()}</span></div><p>{a.description}</p><DueAlert a={a} submitted={!!s}/>{user.role==='STUDENT'?(s?<p className="success">✓ Submitted {s.late?'Late':'On time'} {s.marks!=null?`• Marks: ${s.marks}`:''}</p>:<><input type="file" onChange={e=>setFile(e.target.files[0])}/><button className="primary" onClick={()=>submit(a)}>Submit Assignment</button></>):null}</div>})}</>}
   {page==='Submissions'&&<><h3>📤 Submissions</h3>{user.role==='STUDENT'?(subs.length?subs.map(s=><div className="card" key={s.id}>Assignment #{s.assignmentId} — {s.fileName} — <b>{s.late?'Late':'On time'}</b> {s.marks!=null&&<>— Marks: {s.marks}</>}</div>):<div className="card">No submissions yet.</div>):(allSubs.length?allSubs.map(s=><div className="card" key={s.id}>Student #{s.studentId} — Assignment #{s.assignmentId} — {s.fileName} — <b>{s.late?'Late':'On time'}</b> <button className="primary small" onClick={()=>grade(s.id)}>Grade</button>{s.marks!=null&&<span> Marks: {s.marks}</span>}</div>):<div className="card">No submissions yet.</div>)}</>}
   {page==='Feedback'&&<div className="card"><h3>💬 Feedback</h3><p>{user.role==='FACULTY'?'Use Submissions → Grade to save marks and remarks.':'Marks and faculty remarks appear here after grading.'}</p>{user.role==='STUDENT'&&subs.filter(s=>s.remarks).map(s=><div className="feedback" key={s.id}><b>Assignment #{s.assignmentId}</b><p>Marks: {s.marks}</p><p>{s.remarks}</p></div>)}</div>}
   {page==='Profile'&&<div className="card"><h3>👤 Profile</h3><p><b>Name:</b> {user.name}</p><p><b>Username:</b> {user.username}</p><p><b>Role:</b> {user.role}</p></div>}
  </main>
 </div>
}
createRoot(document.getElementById('root')).render(<App/>);
