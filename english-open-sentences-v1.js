/* Open English sentence practice for Serag OS and EngoPlay.
   Original learning examples; no copied Duolingo content.
   Additive + idempotent: preserves existing question and grammar data. */
(() => {
  'use strict';
  const rows = [
    ['I usually review my notes before a meeting.','عادةً أراجع ملاحظاتي قبل الاجتماع.',['عادةً أراجع ملاحظاتي قبل الاجتماع.','أنا راجعت ملاحظاتي أثناء الاجتماع.','سأكتب ملاحظاتي بعد الاجتماع.'],'B1','open-sentences-b1'],
    ['Could you explain what you mean?','هل يمكنك توضيح ما تقصده؟',['هل يمكنك توضيح ما تقصده؟','هل يمكنك إرسال الملف؟','هل تعرف متى سيصل؟'],'B1','open-sentences-b1'],
    ['I have been working on this project since Monday.','أعمل على هذا المشروع منذ يوم الاثنين.',['أنهيت هذا المشروع يوم الاثنين.','أعمل على هذا المشروع منذ يوم الاثنين.','سأبدأ هذا المشروع يوم الاثنين.'],'B1','open-sentences-b1'],
    ['We had already left when the rain started.','كنا قد غادرنا بالفعل عندما بدأ المطر.',['غادرنا بعد توقف المطر.','سنغادر عندما يبدأ المطر.','كنا قد غادرنا بالفعل عندما بدأ المطر.'],'B1','open-sentences-b1'],
    ['If I have enough time, I will practise speaking tonight.','إذا كان لدي وقت كافٍ، فسأتدرب على التحدث الليلة.',['إذا كان لدي وقت كافٍ، فسأتدرب على التحدث الليلة.','لو كان لدي وقت أمس، لتدربت.','أتدرب على التحدث كل ليلة دون استثناء.'],'B1','open-sentences-b1'],
    ['I am not used to speaking English at work yet.','لم أعتد التحدث بالإنجليزية في العمل بعد.',['أتحدث الإنجليزية في العمل بطلاقة.','لم أعتد التحدث بالإنجليزية في العمل بعد.','لن أستخدم الإنجليزية في العمل.'],'B1','open-sentences-b1'],
    ['The instructions were clear enough for everyone to follow.','كانت التعليمات واضحة بما يكفي ليتبعها الجميع.',['كانت التعليمات غامضة بالنسبة للجميع.','غيّر الجميع التعليمات.','كانت التعليمات واضحة بما يكفي ليتبعها الجميع.'],'B1','open-sentences-b1'],
    ['Although the task was difficult, we finished it on time.','على الرغم من أن المهمة كانت صعبة، فإننا أنجزناها في الموعد.',['أنجزنا المهمة مبكرًا لأنها كانت سهلة.','على الرغم من أن المهمة كانت صعبة، فإننا أنجزناها في الموعد.','لم نبدأ المهمة بسبب ضيق الوقت.'],'B1','open-sentences-b1'],
    ['I would rather ask than make the same mistake again.','أفضل أن أسأل بدلًا من ارتكاب الخطأ نفسه مرة أخرى.',['أفضل أن أسأل بدلًا من ارتكاب الخطأ نفسه مرة أخرى.','أفضّل تكرار الخطأ دون سؤال.','سألت بعد أن كررت الخطأ مرات كثيرة.'],'B1','open-sentences-b1'],
    ['She suggested taking a short break before continuing.','اقترحت أخذ استراحة قصيرة قبل المتابعة.',['طلبت إلغاء العمل نهائيًا.','اقترحت أخذ استراحة قصيرة قبل المتابعة.','قالت إن الاستراحة غير ضرورية.'],'B1','open-sentences-b1'],
    ['I could not find the file that you sent yesterday.','لم أتمكن من العثور على الملف الذي أرسلته أمس.',['لم أتمكن من العثور على الملف الذي أرسلته أمس.','سأرسل الملف إليك غدًا.','وجدت الملف قبل أن ترسله.'],'B1','open-sentences-b1'],
    ['Please let me know if anything changes.','من فضلك أخبرني إذا طرأ أي تغيير.',['من فضلك أخبرني إذا طرأ أي تغيير.','لا تخبرني بأي تغييرات.','أخبرتك بالتغيير الأسبوع الماضي.'],'B1','open-sentences-b1'],
    ['I have not decided whether to accept the offer.','لم أقرر بعد ما إذا كنت سأقبل العرض.',['قبلت العرض بالفعل.','رفضت كل العروض السابقة.','لم أقرر بعد ما إذا كنت سأقبل العرض.'],'B1','open-sentences-b1'],
    ['The sooner we start, the earlier we can finish.','كلما بدأنا مبكرًا، استطعنا الانتهاء في وقت أبكر.',['إذا بدأنا متأخرًا، فلن نعمل.','كلما بدأنا مبكرًا، استطعنا الانتهاء في وقت أبكر.','انتهينا قبل أن نبدأ.'],'B1','open-sentences-b1'],
    ['I was about to call you when your message arrived.','كنت على وشك الاتصال بك عندما وصلت رسالتك.',['كنت على وشك الاتصال بك عندما وصلت رسالتك.','اتصلت بك بعد أن حذفت رسالتك.','سأتصل بك عندما أقرأ الرسالة غدًا.'],'B1','open-sentences-b1'],
    ['He explained the problem without blaming anyone.','شرح المشكلة دون أن يلوم أحدًا.',['حمّل الجميع مسؤولية المشكلة.','شرح المشكلة دون أن يلوم أحدًا.','رفض الحديث عن المشكلة.'],'B1','open-sentences-b1'],
    ['We need to agree on the main priorities first.','نحتاج إلى الاتفاق على الأولويات الرئيسية أولًا.',['نحتاج إلى الاتفاق على الأولويات الرئيسية أولًا.','يجب أن ننهي كل المهام في الوقت نفسه.','اتفقنا على إلغاء الأولويات.'],'B1','open-sentences-b1'],
    ['The final decision depends on the client’s feedback.','يعتمد القرار النهائي على ملاحظات العميل.',['العميل لا يشارك في القرار.','يعتمد القرار النهائي على ملاحظات العميل.','اتخذنا القرار قبل بدء المشروع ولا يمكن مراجعته.'],'B1','open-sentences-work'],
    ['I will send you an updated version by the end of the day.','سأرسل إليك نسخة محدّثة قبل نهاية اليوم.',['أرسلت النسخة القديمة الأسبوع الماضي.','سأرسل إليك نسخة محدّثة قبل نهاية اليوم.','لن أشارك أي نسخة.'],'B1','open-sentences-work'],
    ['Could you clarify which format the team needs?','هل يمكنك توضيح التنسيق الذي يحتاجه الفريق؟',['هل يمكنك توضيح التنسيق الذي يحتاجه الفريق؟','هل يمكنك حذف كل الملفات؟','هل انتهى الفريق من الاجتماع؟'],'B1','open-sentences-work'],
    ['We may need to move the deadline if the brief changes.','قد نحتاج إلى تأجيل الموعد النهائي إذا تغيّر موجز المشروع.',['سنلغي المشروع إذا تغيّر التصميم.','قد نحتاج إلى تأجيل الموعد النهائي إذا تغيّر موجز المشروع.','الموعد النهائي تغيّر بالفعل إلى الأمس.'],'B1','open-sentences-work'],
    ['I will keep you posted as soon as I hear back.','سأبقيك على اطلاع بمجرد أن أتلقى ردًا.',['سأبقيك على اطلاع بمجرد أن أتلقى ردًا.','لن أشارك معك أي تحديثات.','تلقيت ردك قبل أن أرسل الرسالة.'],'B1','open-sentences-work'],
    ['The new layout is easier to read on a mobile screen.','التصميم الجديد أسهل في القراءة على شاشة الهاتف.',['التصميم الجديد أسهل في القراءة على شاشة الهاتف.','التصميم الجديد لا يعمل على الهاتف.','الشاشة أصغر من أن تعرض أي نص.'],'B1','open-sentences-work'],
    ['Let us review the changes before exporting the video.','دعونا نراجع التعديلات قبل تصدير الفيديو.',['صدّرنا الفيديو قبل إجراء أي تعديلات.','دعونا نراجع التعديلات قبل تصدير الفيديو.','لن نراجع الفيديو بعد تصديره.'],'B1','open-sentences-work'],
    ['The headline should communicate the main benefit clearly.','ينبغي أن يوضّح العنوان الفائدة الرئيسية بوضوح.',['ينبغي أن يوضّح العنوان الفائدة الرئيسية بوضوح.','يجب أن يخفي العنوان هدف الحملة.','العنوان لا علاقة له بالمحتوى.'],'B1','open-sentences-work'],
    ['We need a consistent style across all campaign assets.','نحتاج إلى أسلوب متّسق في جميع مواد الحملة.',['نحتاج إلى أسلوب متّسق في جميع مواد الحملة.','يجب أن يختلف كل تصميم عن الآخر تمامًا.','سنستخدم لونًا مختلفًا في كل كلمة.'],'B1','open-sentences-work'],
    ['The first draft is ready, but it still needs a few adjustments.','المسودة الأولى جاهزة، لكنها لا تزال تحتاج إلى بعض التعديلات.',['المسودة الأولى جاهزة، لكنها لا تزال تحتاج إلى بعض التعديلات.','النسخة النهائية نُشرت ولا يمكن تعديلها.','لم نبدأ المسودة الأولى بعد.'],'B1','open-sentences-work'],
    ['The team postponed the launch until the issue was resolved.','أجّل الفريق الإطلاق حتى تم حل المشكلة.',['أطلق الفريق المنتج قبل اكتشاف المشكلة.','أجّل الفريق الإطلاق حتى تم حل المشكلة.','ألغى الفريق المشروع دون مناقشة المشكلة.'],'B2','open-sentences-b2'],
    ['Had we checked the links, we would have noticed the error earlier.','لو كنا قد فحصنا الروابط، لاكتشفنا الخطأ في وقت أبكر.',['لو كنا قد فحصنا الروابط، لاكتشفنا الخطأ في وقت أبكر.','سنفحص الروابط بعد اكتشاف كل الأخطاء.','فحصنا الروابط ولم نجد أي خطأ.'],'B2','open-sentences-b2'],
    ['Despite the limited budget, the team delivered a polished result.','على الرغم من الميزانية المحدودة، قدّم الفريق نتيجة متقنة.',['بسبب الميزانية المحدودة، لم يقدّم الفريق أي نتيجة.','على الرغم من الميزانية المحدودة، قدّم الفريق نتيجة متقنة.','كانت الميزانية غير محدودة، لذلك لم نخطط.'],'B2','open-sentences-b2'],
    ['The proposal was revised to address the concerns raised by the client.','عُدّل المقترح لمعالجة المخاوف التي أثارها العميل.',['العميل عدّل مخاوف الفريق دون قراءة المقترح.','عُدّل المقترح لمعالجة المخاوف التي أثارها العميل.','رفض الفريق تعديل المقترح رغم موافقة العميل.'],'B2','open-sentences-b2'],
    ['What matters most is whether the message reaches the intended audience.','الأهم هو ما إذا كانت الرسالة تصل إلى الجمهور المستهدف.',['الأهم هو ما إذا كانت الرسالة تصل إلى الجمهور المستهدف.','الأهم هو استخدام أكبر عدد من الكلمات.','الجمهور المستهدف لا يؤثر في الرسالة.'],'B2','open-sentences-b2'],
    ['The design looks minimal without feeling empty.','يبدو التصميم بسيطًا دون أن يبدو فارغًا.',['التصميم مزدحم بعناصر غير ضرورية.','يبدو التصميم بسيطًا دون أن يبدو فارغًا.','التصميم فارغ تمامًا ولا يحتوي على مساحة.'],'B2','open-sentences-b2'],
    ['Unless we receive approval today, the schedule will have to change.','ما لم نحصل على الموافقة اليوم، سيتعين تغيير الجدول.',['إذا حصلنا على الموافقة اليوم، سنغيّر الجدول حتمًا.','ما لم نحصل على الموافقة اليوم، سيتعين تغيير الجدول.','حصلنا على الموافقة أمس، لذا لا يوجد جدول.'],'B2','open-sentences-b2'],
    ['Having reviewed the feedback, I made the opening more concise.','بعد مراجعة الملاحظات، جعلت المقدمة أكثر إيجازًا.',['بعد مراجعة الملاحظات، جعلت المقدمة أكثر إيجازًا.','راجعت المقدمة قبل أن أتلقى أي ملاحظات.','طلبت من العميل كتابة المقدمة من جديد.'],'B2','open-sentences-b2'],
    ['The clearer the brief, the less time we spend guessing.','كلما كان موجز المشروع أوضح، قلّ الوقت الذي نقضيه في التخمين.',['كلما كان موجز المشروع أوضح، قلّ الوقت الذي نقضيه في التخمين.','كلما كان الموجز أقصر، زادت التخمينات دائمًا.','نقضي الوقت نفسه مهما كانت التعليمات.'],'B2','open-sentences-b2'],
    ['Rather than adding more effects, we simplified the transition.','بدلًا من إضافة المزيد من المؤثرات، بسّطنا الانتقال.',['أضفنا كل المؤثرات الممكنة إلى الانتقال.','بدلًا من إضافة المزيد من المؤثرات، بسّطنا الانتقال.','حذفنا الفيديو بدلًا من تعديل الانتقال.'],'B2','open-sentences-b2']
  ];
  const lessons = [
    {id:'open-sentences-b1',level:'B1',title:'Meaning in everyday sentences',titleAr:'فهم المعنى في الجمل اليومية',summary:'تدرّب على فهم الجملة كاملة من السياق، لا على ترجمة الكلمات منفردة فقط.',formula:'Read the whole sentence → identify the situation → choose the closest meaning.',uses:['ركّز على الزمن وعلاقة الأفكار.','اختر المعنى الأقرب للجملة كاملة.'],examples:['Could you explain what you mean?','Please let me know if anything changes.'],mistake:'تجنّب اختيار إجابة لمجرد أنها تحتوي على كلمة مألوفة؛ افحص معنى الجملة كلها.',tip:'Original EngoPlay starter set. Additional reviewed Tatoeba data is prepared separately by the import script.',quiz:['Choose the closest meaning','Understand the whole sentence','Check context and tense'],task:'اكتب جملة جديدة تستخدم فيها تعبيرًا تعلمته.'},
    {id:'open-sentences-work',level:'B1',title:'English for creative work',titleAr:'الإنجليزية في شغل التصميم والتسويق',summary:'جمل أصلية عن المراجعات والمواعيد والتصميم والتواصل مع الفريق والعميل.',formula:'Clear request + useful context + next action.',uses:['استخدم صياغة مهذبة لتوضيح المطلوب.','تدرّب على مواعيد التسليم والملاحظات والتعديلات.'],examples:['Could you clarify which format the team needs?','I will keep you posted as soon as I hear back.'],mistake:'لا تترجم التعبيرات المهنية حرفيًا؛ تعلّم معناها داخل الموقف.',tip:'Original EngoPlay starter set tailored to design and marketing work.',quiz:['Clarify the required format','Keep a colleague updated','Confirm the next action'],task:'اكتب تحديثًا قصيرًا بالإنجليزية عن حالة مشروع.'},
    {id:'open-sentences-b2',level:'B2',title:'Nuance and complex sentences',titleAr:'الدقة والجمل المركبة',summary:'تدرّب على علاقات السبب والتضاد والشرط والتراكيب التي تغيّر المعنى الدقيق للجملة.',formula:'Identify the logical relationship before choosing a translation.',uses:['لاحظ أدوات الربط والجمل الشرطية.','اقرأ العبارة التابعة مع الجملة الرئيسية.'],examples:['Despite the limited budget, the team delivered a polished result.','Unless we receive approval today, the schedule will have to change.'],mistake:'لا تتجاهل أدوات الربط؛ فقد تقلب العلاقة بين السبب والنتيجة أو الشرط.',tip:'Original EngoPlay starter set.',quiz:['Identify contrast','Identify the condition','Preserve the full meaning'],task:'أعد صياغة جملة مركبة باستخدام أداة ربط مختلفة مع الحفاظ على المعنى.'}
  ];
  const questions = rows.map((r, i) => ({
    id:'open-sentence-'+String(i+1).padStart(3,'0'),
    type:'translation-choice',
    level:r[3],
    topic:r[4],
    prompt:'Choose the closest Arabic meaning: “'+r[0]+'”',
    options:r[2],
    answer:r[1],
    explanation:'Original practice sentence. Read the complete sentence and compare the meaning, tense, and relationship between ideas.',
    source:'original-engoplay'
  }));
  const existing = window.SERAG_OPEN_SENTENCES_V1;
  if (existing) return;
  window.SERAG_OPEN_SENTENCES_V1 = {version:1, attribution:'Original EngoPlay examples; not copied from Duolingo or a commercial course.', lessons, questions};
  if (Array.isArray(window.SERAG_GRAMMAR_V10)) {
    const ids = new Set(window.SERAG_GRAMMAR_V10.map(x => x.id));
    window.SERAG_GRAMMAR_V10.push(...lessons.filter(x => !ids.has(x.id)));
  }
  if (window.SERAG_SUPPLEMENT_V13 && Array.isArray(window.SERAG_SUPPLEMENT_V13.questions)) {
    const ids = new Set(window.SERAG_SUPPLEMENT_V13.questions.map(x => x.id));
    window.SERAG_SUPPLEMENT_V13.questions.push(...questions.filter(x => !ids.has(x.id)));
  }
})();
