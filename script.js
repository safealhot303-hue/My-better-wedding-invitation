const EVENT_DATE=new Date("2026-09-25T20:00:00+03:00");
const RSVP_EMAIL="Safe.alhot303@gmail.com"; // استبدلها ببريد استقبال RSVP
function updateCountdown(){const d=EVENT_DATE-Date.now();const v=d<=0?[0,0,0,0]:[Math.floor(d/86400000),Math.floor(d/3600000)%24,Math.floor(d/60000)%60,Math.floor(d/1000)%60];["days","hours","minutes","seconds"].forEach((id,i)=>document.getElementById(id).textContent=String(v[i]).padStart(2,"0"))}updateCountdown();setInterval(updateCountdown,1000);
document.getElementById("calendarBtn").href="https://calendar.google.com/calendar/render?action=TEMPLATE&text="+encodeURIComponent("حفل خطوبة خالد وندى")+"&dates=20260925T170000Z/20260925T190000Z&location="+encodeURIComponent("نادي اليخت ببورفؤاد - بورسعيد");
const audio=document.getElementById("bgMusic"),btn=document.getElementById("musicBtn");let on=false;
async function playMusic(){try{await audio.play();on=true;btn.classList.add("playing");btn.innerHTML="♫ <span>كتم الموسيقى</span>"}catch(e){on=false;btn.classList.remove("playing");btn.innerHTML="♫ <span>تشغيل الموسيقى</span>"}}
function stopMusic(){audio.pause();on=false;btn.classList.remove("playing");btn.innerHTML="♫ <span>تشغيل الموسيقى</span>"}
btn.addEventListener("click",()=>on?stopMusic():playMusic());window.addEventListener("load",playMusic);
const interaction=()=>{if(!on)playMusic();["pointerdown","touchstart","keydown"].forEach(e=>window.removeEventListener(e,interaction))};["pointerdown","touchstart","keydown"].forEach(e=>window.addEventListener(e,interaction,{passive:true}));
const form=document.getElementById("rsvpForm"),msg=document.getElementById("formMessage");form.addEventListener("submit",e=>{if(!RSVP_EMAIL || RSVP_EMAIL==="YOUR_EMAIL_HERE"){e.preventDefault();msg.textContent="ضع بريد استقبال RSVP في script.js أولًا.";return}form.action="https://formsubmit.co/"+encodeURIComponent(RSVP_EMAIL);msg.textContent="جاري إرسال التأكيد..."});

/* Smooth reveal animations inspired by the reference site's gentle section transitions. */
const revealItems = document.querySelectorAll(".section, .count-card, .detail-card, .rsvp-card, footer, .heading");
revealItems.forEach((el,i)=>{
  el.classList.add("reveal");
  if(el.classList.contains("count-card")) el.style.setProperty("--delay",(i%4)*90+"ms");
  else if(el.classList.contains("detail-card")) el.style.setProperty("--delay",(i%2)*120+"ms");
});
const observer = new IntersectionObserver((entries)=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    }
  });
},{threshold:.12, rootMargin:"0px 0px -50px 0px"});
revealItems.forEach(el=>observer.observe(el));
