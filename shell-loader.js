(async()=>{
  try{
    const res=await fetch('/legacy.html?legacy=1',{cache:'no-store'});
    if(!res.ok)throw new Error('Legacy app failed to load');
    let html=await res.text();

    html=html.replace('</head>','<link rel="stylesheet" href="/dashboard-v2.css"/>\n</head>');

    const tasksNav='<button data-page="tasks" type="button">المهام</button>';
    html=html.replace(tasksNav,tasksNav+'\n      <button data-page="calendar" type="button">التقويم</button>');

    const tipCard='<section class="card span4"><h3>ملاحظة اليوم</h3><div id="homeTip" class="notice">سجّل أكلك ومياهك، والملخص هيتحدث تلقائيًا.</div></section>';
    const homeV2=`${tipCard}\n        <section class="card span8 weekly-card">\n          <div class="section-head v2-section-head">\n            <div><h3>تقدم الأسبوع</h3><p class="muted">آخر 7 أيام — شارت واحد بدل زحمة أرقام.</p></div>\n            <div id="weeklyMetricTabs" class="metric-tabs" aria-label="اختيار الشارت">\n              <button class="metric-tab active" data-metric="water" type="button">المياه</button>\n              <button class="metric-tab" data-metric="calories" type="button">السعرات</button>\n              <button class="metric-tab" data-metric="tasks" type="button">المهام</button>\n              <button class="metric-tab" data-metric="workouts" type="button">الجيم</button>\n            </div>\n          </div>\n          <div class="weekly-summary"><strong id="weeklyHeadline">—</strong><span id="weeklyInsight" class="muted">بيتحسب من بياناتك الفعلية.</span></div>\n          <div id="weeklyChartCanvas" class="weekly-chart" aria-label="شارت تقدم الأسبوع"></div>\n        </section>\n        <section class="card span4 mini-calendar-card">\n          <div class="section-head"><div><h3>الأيام الجاية</h3><p class="muted">المواعيد والـdeadlines في مكان واحد.</p></div><button id="openCalendarFromHome" class="text-btn" type="button">عرض الكل</button></div>\n          <div id="homeWeekStrip" class="week-strip"></div>\n          <div id="homeUpcomingList" class="home-upcoming"></div>\n        </section>`;
    html=html.replace(tipCard,homeV2);

    const calendarPage=`\n    <section id="page-calendar" class="page hidden">\n      <header class="top">\n        <div><h2>التقويم</h2><p class="muted">المهام، الجيم، الـdeadlines والتذكيرات في View واحدة.</p></div>\n        <button id="openGoogleCalendar" class="btn desktop-only" type="button">فتح Google Calendar ↗</button>\n      </header>\n      <div class="calendar-layout">\n        <section class="card calendar-main">\n          <div class="calendar-toolbar">\n            <button id="calendarPrev" class="icon-btn calendar-arrow" type="button" aria-label="الشهر السابق">›</button>\n            <div><h3 id="calendarMonthTitle">—</h3><button id="calendarToday" class="text-btn" type="button">اليوم</button></div>\n            <button id="calendarNext" class="icon-btn calendar-arrow" type="button" aria-label="الشهر التالي">‹</button>\n          </div>\n          <div class="calendar-weekdays"><span>السبت</span><span>الأحد</span><span>الاثنين</span><span>الثلاثاء</span><span>الأربعاء</span><span>الخميس</span><span>الجمعة</span></div>\n          <div id="calendarGrid" class="calendar-grid"></div>\n        </section>\n        <aside class="calendar-side">\n          <section class="card">\n            <div class="section-head"><div><h3>إضافة موعد</h3><p class="muted">هيتحفظ ويتزامن مع حسابك على كل الأجهزة.</p></div></div>\n            <form id="calendarEventForm" class="form">\n              <input id="calendarEventTitle" required placeholder="اسم الموعد"/>\n              <input id="calendarEventAt" type="datetime-local" required/>\n              <select id="calendarEventCategory"><option value="general">عام</option><option value="work">شغل</option><option value="english">English</option><option value="fitness">Gym</option><option value="creative">Creative</option></select>\n              <button class="btn primary" type="submit">إضافة للتقويم</button>\n            </form>\n          </section>\n          <section class="card">\n            <div class="section-head"><div><h3 id="selectedDayTitle">مواعيد اليوم</h3><p class="muted">اضغط على أي يوم في الشهر.</p></div></div>\n            <div id="selectedDayEvents" class="calendar-events-list"></div>\n          </section>\n          <section class="card google-lite-card">\n            <div class="google-lite-head"><span class="google-mark">G</span><div><strong>Google Calendar</strong><div class="muted">تقدر تضيف أي موعد إلى Google بنقرة واحدة. المزامنة التلقائية الكاملة محتاجة Google OAuth.</div></div></div>\n          </section>\n        </aside>\n      </div>\n    </section>`;

    const mainClose='\n  </main>\n</div>\n\n<button id="quickFab"';
    html=html.replace(mainClose,calendarPage+mainClose);
    html=html.replace('</body>','<script src="/dashboard-v2.js"></script>\n</body>');

    document.open();
    document.write(html);
    document.close();
  }catch(err){
    document.body.innerHTML='<div class="boot"><div class="boot-card"><div class="boot-logo">Serag OS</div><div class="boot-sub">حصلت مشكلة في تحميل الواجهة. جرّب Refresh.</div></div></div>';
    console.error(err);
  }
})();
