/* Original adult-learning material. Uploaded books inform topic coverage only;
   no scanned pages, publisher audio, or copied exercise collections are served. */
(()=>{
  'use strict';
  const lessons=[];const questions=[];
  function add(id,level,title,titleAr,summary,formula,examples,mistake,tip,task,items){
    lessons.push({id,level,track:level==='A1'?'Foundations':'Sentence Lab',title,titleAr,summary,formula,uses:[summary,tip],examples,mistake,tip,task,quiz:[items[0][0],items[0][1],items[0][2]]});
    items.forEach(([prompt,answer,...wrong],i)=>questions.push({id:`supplement:${id}:${i+1}`,topic:id,prompt,answer,options:[answer,...wrong],explanation:summary+' '+mistake}));
  }
  add('sentence-parts','A1','Subject, verb and object','مكونات الجملة',
    'الفاعل هو من يقوم بالفعل، والفعل يصف الحدث أو الحالة. بعض الأفعال تحتاج مفعولًا، وأخرى تكتفي بالفاعل.',
    'Subject + verb (+ object) | Subject + be + complement',
    ['The client approved the proposal.','The meeting ended.','The proposal is clear.'],
    'الصفة وحدها ليست فعلًا: The proposal clear تحتاج is. وليس كل فعل يحتاج مفعولًا.',
    'اسأل: مين؟ عمل إيه؟ وإيه اللي استقبل الفعل؟','حلّل جملة من رسالة شغل إلى فاعل وفعل ومفعول.',[
      ['In “The manager approved the budget”, what is the subject?','The manager','approved','the budget'],
      ['Complete the sentence: The instructions ___ clear.','are','clear','very'],
      ['Which sentence is complete?','The meeting ended.','The meeting.','Ended the.'],
      ['In “We sent the invoice”, what is the object?','the invoice','We','sent']]);
  add('be-basics','A1','Be: am, is, are','فعل be في الجملة والسؤال والنفي',
    'نستخدم be مع الهوية والصفة والمكان. am مع I، وis مع المفرد الغائب، وare مع you/we/they والجمع.',
    'I am | he/she/it is | you/we/they are | Be + subject? | subject + be + not',
    ['I am a designer.','The files are ready.','Is your colleague at work?'],
    'لا تضف do إلى سؤال be: Are you ready? وليس Do you are ready?',
    'لو الخبر صفة أو اسم أو مكان، غالبًا تحتاج be.','اكتب تعريفًا بنفسك، نفيًا وسؤالًا باستخدام be.',[
      ['The two offices ___ open today.','are','is','am'],
      ['I ___ available after lunch.','am','is','are'],
      ['Which question is correct?','Are you ready?','Do you are ready?','Is you ready?'],
      ['Choose the correct negative.','She is not at home.','She does not is at home.','She not at home.']]);
  add('subject-object-pronouns','A1','Subject and object pronouns','ضمائر الفاعل والمفعول',
    'I/he/she/we/they في موقع الفاعل. me/him/her/us/them بعد الفعل أو حرف الجر.',
    'I → me | he → him | she → her | we → us | they → them',
    ['They called me yesterday.','I sent it to her.','We invited them to the meeting.'],
    'بعد to/for/with نستخدم ضمير المفعول: with me، وليس with I.',
    'افصل بين من قام بالفعل ومن استقبل الفعل.','حوّل أسماء أشخاص في 3 جمل إلى الضمائر المناسبة.',[
      ['Please send the link to ___.','me','I','my'],
      ['___ are joining the call at ten.','They','Them','Their'],
      ['We invited Sara. We invited ___.','her','she','hers'],
      ['The client spoke with Omar and ___.','me','I','my']]);
  add('possessives','A1','Possessives','الملكية: my وmine وapostrophe',
    'my/your/his/her/our/their تأتي قبل اسم. mine/yours/hers/ours/theirs تحل محل الاسم. نضيف ’s للمفرد و’ بعد جمع ينتهي بـs.',
    'my file / the file is mine | the client’s request | the clients’ requests',
    ['This is my notebook. That one is yours.','The client’s feedback is helpful.','The clients’ files are ready.'],
    'its للملكية، وit’s اختصار it is أو it has. لا تقل mine notebook.',
    'هل الاسم موجود بعد الكلمة؟ my notebook. هل محذوف؟ It is mine.','اكتب ملكية شيء لك وشيء لشخص وآخر لمجموعة.',[
      ['This folder belongs to me. It is ___.','mine','my','me'],
      ['___ presentation is ready.','Their','Theirs','Them'],
      ['Choose “the feedback from one client”.','the client’s feedback','the clients’ feedback','the clients feedback'],
      ['The company updated ___ website.','its','it’s','it']]);
  add('demonstratives','A1','This, that, these, those','الإشارة: القرب والعدد',
    'this/that للمفرد وthese/those للجمع. this/these غالبًا للقريب وthat/those للبعيد؛ وقد نشير بها لفكرة أو شيء سبق ذكره.',
    'this is / that is | these are / those are',
    ['This file here is the final version.','Those boxes over there are empty.','That sounds useful.'],
    'these وthose تحتاجان اسمًا جمعًا وفعل are عند وصفهما.',
    'اختار العدد أولًا، ثم القرب أو البعد.','صف شيئًا أمامك وآخر بعيدًا ومجموعة أشياء.',[
      ['___ files here are ready.','These','This','That'],
      ['___ building over there is our office.','That','These','Those'],
      ['Choose the correct sentence.','These ideas are useful.','These idea is useful.','This ideas are useful.'],
      ['I like ___ notebook in my hand.','this','those','these']]);
  add('there-is-are','A1','There is / there are','وجود الأشياء',
    'there is لوجود مفرد أو غير معدود، وthere are لوجود جمع. السؤال يبدأ بـIs there أوAre there.',
    'There is + singular/uncountable | There are + plural',
    ['There is a meeting at two.','There are three attachments.','Is there any water?'],
    'لا تستخدم there is مع جمع في الكتابة المعيارية. there ليست ضمير الملكية their.',
    'نستخدمها لتقديم شيء موجود، ثم it/they للإشارة إليه.','صف مكتبك بجملتين وسؤال عن شيء ناقص.',[
      ['There ___ three messages in my inbox.','are','is','am'],
      ['There ___ some information on the website.','is','are','have'],
      ['___ a printer in the office?','Is there','Are there','Does there'],
      ['There ___ any chairs in this room.','are not','is not','not are']]);
  add('have-has','A1','Have, has and had','الامتلاك: have وhas وhad',
    'للملكية نستخدم have مع I/you/we/they وhas مع he/she/it؛ had للماضي. بعد does/did يرجع الفعل إلى have.',
    'have/has + noun | Do/Does + subject + have? | did not have',
    ['She has a new laptop.','Do you have the brief?','We had a problem yesterday.'],
    'Does she have? وليس Does she has? وdid not have وليس did not had.',
    'فرّق بين have للملكية وhave + V3 لبناء الزمن التام.','اكتب ما تمتلكه وسؤالًا لزميلك وجملة عن الماضي.',[
      ['My colleague ___ two monitors.','has','have','having'],
      ['Does the office ___ a meeting room?','have','has','had'],
      ['We did not ___ enough time yesterday.','have','had','has'],
      ['Last year, I ___ an older computer.','had','has','have']]);
  add('imperatives','A1','Imperatives and requests','الأمر والطلب المهذب',
    'الأمر يبدأ بالمصدر دون فاعل ظاهر. النهي يبدأ بـDon’t. في الشغل الطلب بـCould you…? غالبًا ألطف.',
    'Base verb + object | Don’t + base | Could you + base?',
    ['Save a copy first.','Don’t close the document.','Could you send the original file, please?'],
    'بعد Don’t نستخدم المصدر. صيغة الأمر قد تبدو مباشرة جدًا حسب العلاقة والسياق.',
    'استخدم الأمر للتعليمات والطلب المهذب عند مخاطبة شخص.','حوّل تعليمات مباشرة إلى طلب مهذب.',[
      ['___ the attachment before replying.','Read','Reads','Reading'],
      ['Don’t ___ the backup folder.','delete','deletes','deleted'],
      ['Which request is polite and grammatical?','Could you send the brief, please?','Could you sent the brief?','You sends the brief.'],
      ['Choose a negative instruction.','Don’t share the password.','Not share the password.','Don’t shared the password.']]);
  add('frequency-adverbs','A2','Adverbs of frequency','التكرار وترتيب الظرف',
    'usually/often/sometimes/never تصف التكرار. تأتي عادة قبل الفعل الرئيسي، وبعد be، وبين المساعد والفعل الرئيسي.',
    'subject + usually + verb | subject + be + usually + adjective',
    ['I usually check my email at nine.','She is always punctual.','We have often discussed this issue.'],
    'never نفي في المعنى؛ لا تجمعها مع don’t في الجملة القياسية.',
    'be ثم الظرف، لكن الظرف ثم الفعل العادي.','صف 3 عادات بدرجات تكرار مختلفة.',[
      ['Choose the natural word order.','She is always on time.','She always is on time all.','She on time is always.'],
      ['I ___ check the brief before starting.','usually','usual','every'],
      ['Choose the correct negative meaning.','I never miss the deadline.','I don’t never miss the deadline.','I never misses the deadline.'],
      ['He usually ___ the bus to work.','takes','take','taking']]);
  add('linking-action-verbs','A2','Linking and action verbs','فعل يربط وصفًا أم فعل حركة؟',
    'be/seem/become قد تربط الفاعل بوصف. look/taste/feel/smell قد تكون رابطة أو فعلًا حسب المعنى. الصفة تصف الفاعل بعد الفعل الرابط.',
    'subject + linking verb + adjective | action verb + adverb',
    ['The layout looks clean.','She checked the layout carefully.','The room smells fresh.'],
    'The layout looks clean، وليس cleanly، لأن الوصف للتصميم. لكن She looked carefully تصف فعل النظر.',
    'اسأل: الكلمة تصف الفاعل أم طريقة أداء الفعل؟','اكتب وصفًا لمظهر ملف ثم طريقة مراجعته.',[
      ['The new design looks ___.','professional','professionally','profession'],
      ['She reviewed the document ___.','carefully','careful','care'],
      ['The soup tastes ___.','good','well','goodness'],
      ['After the break, he felt ___.','relaxed','relaxedly','relaxing him']]);
  add('sentence-boundaries','A2','Fragments and run-on sentences','الجملة الناقصة وربط الجمل',
    'الجملة المستقلة تحتاج فكرة كاملة وفاعلًا وفعلًا عادة. الجملة التابعة مثل Because I was busy تحتاج جملة رئيسية. لا تربط جملتين مستقلتين بفاصلة وحدها.',
    'Independent clause. | clause, and/but/so + clause | dependent clause, main clause',
    ['Because I was busy, I replied later.','The draft was ready, but the client requested changes.','I finished the report. I sent it immediately.'],
    'I was tired, I went home خطأ comma splice؛ استخدم نقطة أو رابطًا مناسبًا.',
    'اختبر كل جزء: هل يستطيع الوقوف وحده؟','اكتب جملتين مستقلتين ثم اربطهما بسبب أو نتيجة.',[
      ['Which sentence is complete?','Although it was late, we continued.','Although it was late.','Because the deadline.'],
      ['Choose the correct punctuation.','I checked the file, and I sent it.','I checked the file, I sent it.','I checked, the file I sent it.'],
      ['We were tired, ___ we took a break.','so','although','because of'],
      ['Choose a complete sentence.','The team completed the project.','After completing the project.','The completed project on the desk.']]);
  add('contrast-cause-linkers','B1','Cause, contrast and result','السبب والتضاد والنتيجة',
    'because يتبعها جملة؛ because of يتبعها اسم أوing. although تربط تضادًا مع جملة. however تربط فكرتين مستقلتين بعلامات ترقيم مناسبة.',
    'because + clause | because of + noun/-ing | although + clause | sentence; however, sentence',
    ['We postponed the trip because it was raining.','We postponed the trip because of the rain.','It was expensive; however, it was reliable.'],
    'لا تجمع although وbut لربط نفس الجملتين. despite يتبعها اسم أوing، وليس جملة مباشرة.',
    'حدّد العلاقة ثم نوع ما بعد الرابط: اسم أم جملة؟','اشرح قرارًا بسبب، ثم اذكر ميزة وعيبًا بتضاد.',[
      ['The event was cancelled because ___ heavy rain.','of','that','although'],
      ['___ the service was expensive, it was useful.','Although','Despite','Because of'],
      ['Choose the correct sentence.','Despite being tired, I finished.','Despite I was tired, I finished.','Although I was tired, but I finished.'],
      ['The file was too large. ___, I compressed it.','Therefore','Although','Because of']]);
  add('paraphrase-meaning','B1','Paraphrasing without changing meaning','إعادة الصياغة مع الحفاظ على المعنى',
    'غيّر البناء أو الكلمات مع الحفاظ على الفكرة والكمية والزمن ودرجة التأكيد. ليست كل المرادفات قابلة للتبديل في أي سياق.',
    'Meaning check: who + action + time + amount + certainty',
    ['Sales rose slightly. → There was a small increase in sales.','Some people prefer remote work. → Remote work is preferred by some people.','It may improve results. → It could lead to better results.'],
    'may لا تعني will، وsome لا تعني all. اختار التركيب الطبيعي ولا تستبدل الكلمات عشوائيًا.',
    'بعد إعادة الصياغة، قارن الادعاء الأصلي والجديد بندًا بندًا.','أعد صياغة فكرة من رسالة شغل دون تغيير درجة التأكيد.',[
      ['Which keeps the meaning of “Sales rose slightly”?','There was a small increase in sales.','Sales doubled.','Sales fell sharply.'],
      ['Which keeps the meaning of “Some workers prefer remote work”?','Remote work is preferred by some workers.','All workers prefer remote work.','No workers prefer remote work.'],
      ['“The change may help” expresses ___.','possibility','certainty','an order'],
      ['Which keeps the meaning of “The task was completed by the team”?','The team completed the task.','The team will complete the task.','The team has not completed the task.']]);
  add('trend-language','B1','Describing changes and data','وصف التغيرات والأرقام',
    'rise/fall تصف تغيرًا. by للمقدار الذي تغير، وto للقيمة النهائية، وfrom للقيمة الأولى. استخدم الماضي للبيانات الماضية والفعل المناسب لاتجاه التغير.',
    'rose from A to B | increased by N | a sharp increase | increased sharply',
    ['Sales rose from 100 to 150.','Sales increased by 50.','There was a sharp increase in demand.'],
    'زيادة من 100 إلى150 = 50 وحدة أو50%، وليس150%. لا تضف سببًا للرسم إذا لم يقدمه.',
    'فرّق بين مقدار التغير ونقطة النهاية قبل الكتابة.','صف قيمة بدأت بـ80 وانتهت بـ100 باستخدام from/to/by.',[
      ['Sales rose from 80 to 100. They increased ___ 20.','by','to','from'],
      ['Sales rose ___ 100, starting at 80.','to','by','of'],
      ['There was a ___ increase in demand.','sharp','sharply','rise'],
      ['Demand increased ___.','steadily','steady','steadiness']]);

  add('word-order','A1','Word order and punctuation','ترتيب الكلمات والحروف وعلامات الترقيم',
    'الترتيب المعتاد للجملة الخبرية: فاعل ثم فعل ثم مفعول وتفاصيل. نبدأ الجملة بحرف كبير، ونكتب I وأسماء الأشخاص والأماكن بحروف كبيرة، وننهي الجملة بعلامة مناسبة.',
    'Subject + verb + object (+ place/time) | Capital letter … . / ?',
    ['I sent the file this morning.','Sara lives in Cairo.','Where does the meeting take place?'],
    'لا تنقل ترتيب العربية حرفيًا. الصفة عادة قبل الاسم: a useful idea، وليس an idea useful.',
    'رتّب الجملة أولًا ثم افحص البداية والنهاية.','اكتب رسالة قصيرة ثم راجع ترتيب الكلمات وI والأسماء.',[
      ['Choose the normal word order.','We sent the file yesterday.','We the file sent yesterday.','Yesterday the file we sent it.'],
      ['Choose the correctly written sentence.','I live in Cairo.','i live in cairo.','I live in cairo.'],
      ['Choose the correct noun phrase.','a useful idea','an idea useful','a idea useful'],
      ['Choose the correctly punctuated question.','Are you available?','Are you available.','are you available?']]);
  add('contractions','A1','Contractions and full forms','الاختصارات ومعناها',
    'الاختصار يجمع كلمات ويحذف حروفًا بعلامة apostrophe. I’m = I am، don’t = do not، won’t = will not. ’s قد تعني is أوhas، و’d قد تعني had أوwould حسب ما بعدها.',
    'I’m / isn’t / don’t / won’t | she’s ready / she’s finished | I’d left / I’d like',
    ['I’m available tomorrow.','She’s finished the task.','I’d like more information.'],
    'its للملكية وit’s اختصار. في الكتابة الرسمية جدًا قد يكون الشكل الكامل أنسب.',
    'انظر للكلمة التالية لتفهم has أمis، had أمwould.','حوّل 3 اختصارات إلى الصيغة الكاملة.',[
      ['“I’m” means ___.','I am','I have','I will'],
      ['“won’t” means ___.','will not','would not','was not'],
      ['In “She’s finished the report”, she’s means ___.','she has','she is','she was'],
      ['In “I’d like a copy”, I’d means ___.','I would','I had','I did']]);
  add('indefinite-pronouns','A2','Someone, anyone and everyone','ضمائر غير محددة',
    'someone/everyone/no one تشير لشخص غير محدد وتُعامل كمفرد. anyone شائعة في السؤال والنفي، وقد تعني أي شخص في الإثبات. nobody نفي في المعنى.',
    'everyone/someone/nobody + singular verb | not … anyone',
    ['Everyone is ready.','Has anyone called?','Nobody knows the answer.'],
    'Everyone are خطأ. لا تجمع didn’t وnobody في النفي المعياري: I didn’t see anyone.',
    'الضمير قد يشير لناس كثيرين، لكن الفعل معه مفرد.','اكتب سؤالًا عن شخص مجهول وجملة عن كل الفريق.',[
      ['Everyone ___ ready for the call.','is','are','be'],
      ['I didn’t see ___ at reception.','anyone','nobody','no one'],
      ['Nobody ___ the password.','knows','know','knowing'],
      ['Has ___ called while I was away?','anyone','everyone are','nobody are']]);
  add('stative-verbs','B1','State and action meanings','أفعال الحالة والفعل حسب المعنى',
    'know/believe/own تصف حالة ولا تُستخدم عادة في المستمر. أفعال مثل think/have/see قد تكون حالة أو نشاطًا حسب المعنى.',
    'I know / I own | I think (= believe) / I am thinking (= considering)',
    ['I know the answer.','I think the idea is useful.','I am thinking about a new approach.'],
    'I am knowing غير معتادة. I have a car ملكية، لكن I am having lunch نشاط.',
    'اختار الزمن من معنى الفعل في هذه الجملة، وليس من اسمه وحده.','اكتب جملتين بـthink بمعنيين مختلفين.',[
      ['I ___ the answer to this question.','know','am knowing','knowing'],
      ['I ___ a small apartment; it belongs to me.','own','am owning','owning'],
      ['Please wait. We ___ lunch right now.','are having','have had yesterday','are have'],
      ['I ___ this is a good idea; that is my opinion.','think','am think','thinking']]);

  // Broaden existing topics with independently written contextual questions.
  const rows=[
    ['articles','She works at ___ university.','a','an','the an','a حسب صوت /y/ في university.'],
    ['articles','We waited for ___ hour.','an','a','any a','hour تبدأ بصوت متحرك؛ h لا تُنطق.'],
    ['articles','___ advice you gave me was helpful.','The','An','A','advice غير معدود، لكن هنا نصيحة محددة بالمعلومة التالية.'],
    ['countable','We don’t have ___ time before the meeting.','much','many','a few','time هنا غير معدود؛ much مناسبة في النفي.'],
    ['countable','I have ___ questions about the contract.','a few','a little','much','questions جمع معدود.'],
    ['countable','There is ___ water left, enough for one cup.','a little','a few','many','water غير معدود وa little كمية صغيرة موجودة.'],
    ['present-simple','Sara normally ___ the train to work.','takes','take','is take','عادة، ومع Sara نضيف s.'],
    ['present-simple','He ___ work on Fridays.','does not','do not','is not','نفي المضارع البسيط مع he هو does not + المصدر.'],
    ['present-simple','Water ___ at 100°C at standard atmospheric pressure.','boils','boil','is boil','حقيقة عامة: المضارع البسيط.'],
    ['present-continuous','Please be quiet. I ___ a client right now.','am calling','call','called','نشاط يحدث الآن: am + ing.'],
    ['present-continuous','This month, we ___ in a temporary office.','are working','have worked yesterday','is working','وضع مؤقت وفاعل جمع: are working.'],
    ['present-continuous','___ you waiting for the bus now?','Are','Do','Have','سؤال المضارع المستمر يبدأ بـbe.'],
    ['past-simple','We ___ the invoice last Monday.','paid','have paid','pay','وقت ماضٍ منتهٍ مع فعل شاذ paid.'],
    ['past-simple','I did not ___ the notification yesterday.','see','saw','seen','بعد did not المصدر.'],
    ['past-simple','___ you attend the meeting yesterday?','Did','Have','Were','سؤال فعل عادي في الماضي: Did + المصدر.'],
    ['past-continuous','At eight last night, I ___ home.','was driving','have driven','drive','نشاط مستمر في لحظة ماضية.'],
    ['past-continuous','They ___ dinner when the power went out.','were having','was having','have','they تحتاج were، وحدث جارٍ وقت المقاطعة.'],
    ['past-continuous','While I was cooking, she ___ the table.','was setting','has set','is setting','حدثان مستمران بالتوازي في الماضي.'],
    ['present-perfect','I ___ my keys, so I cannot open the door now.','have lost','lose','have lose','حدث ماضٍ له نتيجة الآن: have + lost.'],
    ['present-perfect','She has ___ visited Australia.','never','yesterday','last year','never تناسب خبرة حتى الآن دون وقت ماضٍ منتهٍ.'],
    ['present-perfect','Have you ___ the email yet?','sent','send','sending','have + التصريف الثالث sent.'],
    ['present-perfect-continuous','I ___ English for two hours and I am still studying.','have been studying','had studied','am study','نشاط ومدة مستمران حتى الآن.'],
    ['present-perfect-continuous','She ___ for the bus since seven and is still at the stop.','has been waiting','had waited','wait','since تحدد بداية نشاط ممتد للحاضر.'],
    ['past-perfect','When I arrived, the train ___ already left.','had','has','was','المغادرة سبقت نقطة وصول ماضية.'],
    ['past-perfect','I could not pay because I ___ my wallet at home.','had left','have left','leave','نسيان المحفظة سبق عدم القدرة على الدفع.'],
    ['future-forms','Look at those dark clouds. It ___.','is going to rain','rained yesterday','has raining','توقع مبني على دليل حاضر.'],
    ['future-forms','“The phone is ringing.” “I ___ it.”','will answer','answered','have answered','قرار في لحظة الكلام.'],
    ['questions','Where ___ your sister live?','does','is','has','فعل live في المضارع مع she: does + live.'],
    ['questions','Which question asks about the person who called?','Who called you?','Who did called you?','Who you called?','Who هنا فاعل السؤال، فلا نضيف did.'],
    ['modals','You ___ wear a seat belt; it is required.','must','might','can’t','ضرورة: must + المصدر.'],
    ['modals','You ___ smoke here; it is forbidden.','must not','don’t have to','might','must not منع؛ don’t have to عدم ضرورة.'],
    ['modals','The deadline is next week. You ___ finish today.','don’t have to','must not','can’t','الفعل غير ضروري اليوم، وليس ممنوعًا.'],
    ['passive','The invoices ___ checked every week.','are','is','have','Present Simple Passive مع جمع: are + V3.'],
    ['passive','The document was ___ yesterday.','signed','sign','signing','المبني للمجهول: was + V3.'],
    ['relative-clauses','The colleague ___ helped me is on leave.','who','where','when','who لشخص في موقع الفاعل.'],
    ['relative-clauses','This is the office ___ we work.','where','who','whose','where لربط المكان بالجملة.'],
    ['gerund-infinitive','I enjoy ___ new skills.','learning','to learn','learn','enjoy يتبعها ing.'],
    ['gerund-infinitive','We decided ___ the proposal.','to revise','revising','revise','decide يتبعها to + المصدر.'],
    ['comparatives','This route is ___ than the other one.','shorter','shortest','more short','مقارنة بين اثنين: shorter than.'],
    ['comparatives','This is the ___ option of the three.','best','better','gooder','تفضيل داخل مجموعة: the best.'],
    ['adjective-adverb','Please explain the steps ___.','clearly','clear','clarity','ظرف يصف فعل الشرح.'],
    ['ed-ing-adjectives','I felt ___ during the long lecture.','bored','boring','bore','الشعور للشخص: bored؛ سبب الشعور boring.'],
    ['time-prepositions','Our call is ___ Tuesday morning.','on','in','at','يوم محدد حتى مع morning: on.'],
    ['time-prepositions','The meeting starts ___ nine.','at','on','in','وقت محدد: at nine.'],
    ['place-prepositions','The keys are ___ the drawer, under the papers.','in','at','to','داخل الدرج: in.'],
    ['reported-speech','She told ___ that she was busy.','me','to me','I','tell + مفعول شخص دون to.'],
    ['do-make','We need to ___ a decision.','make','do','have doing','التركيب make a decision.'],
    ['adjective-prepositions','I am interested ___ learning more.','in','on','for','interested in + noun/ing.']
  ];
  rows.forEach(([topic,prompt,answer,w1,w2,explanation],i)=>questions.push({id:`supplement:context:${i+1}`,topic,prompt,answer,options:[answer,w1,w2],explanation}));
  window.SERAG_GRAMMAR_V10=[...(window.SERAG_GRAMMAR_V10||[]),...lessons];
  const maps={
    foundations:{name:'خريطة تأسيس الجملة',root:'من الفكرة إلى جملة صحيحة: هوية → فعل → تفاصيل',branches:[
      ['Sentence core · قلب الجملة',[['sentence-parts','مين؟ عمل إيه؟ وإيه استقبل الفعل؟','The team completed the task.'],['be-basics','هوية / وصف / مكان','I am ready. / She is at work.'],['have-has','امتلاك في الحاضر والماضي','She has a laptop. / Did you have time?']]],
      ['Reference · الإشارة والملكية',[['subject-object-pronouns','فاعل أم مفعول؟','They invited us.'],['possessives','اسم بعدها أم الاسم محذوف؟','my file / the file is mine'],['demonstratives','عدد ثم قرب أو بعد','this/that is · these/those are']]],
      ['Extend · أضف تفاصيل',[['there-is-are','قدم شيئًا موجودًا','There are two options.'],['frequency-adverbs','كم مرة؟ ومكان الظرف؟','I usually work. / I am usually busy.'],['imperatives','تعليمات أم طلب مهذب؟','Save it. / Could you save it?']]]],tip:'هذه أساسيات للبالغين. لو جزء سهل عليك، اختبره وانتقل لما يحتاج تثبيت.'},
    writing:{name:'خريطة الكتابة',root:'حافظ على المعنى → كوّن جملًا كاملة → اربط الأفكار',branches:[
      ['Clarity · الوضوح',[['sentence-boundaries','هل الجملة كاملة؟','Because I was busy, I replied later.'],['linking-action-verbs','هل الوصف للفاعل أم لطريقة الفعل؟','looks clear / explains clearly'],['paraphrase-meaning','غيّر الصياغة وحافظ على الادعاء','some ≠ all · may ≠ will']]],
      ['Connection · الربط',[['contrast-cause-linkers','سبب: جملة أم اسم؟','because it rained / because of the rain'],['contrast-cause-linkers','تضاد بين فكرتين','Although… / However,…'],['relative-clauses','أضف وصفًا دون تكرار الاسم','a colleague who…']]],
      ['Data · وصف المعلومات',[['trend-language','البداية / النهاية / المقدار','from 80 to 100 / by 20'],['adjective-adverb','اسم للتغير أم فعل؟','a sharp rise / rose sharply'],['past-simple','اربط الزمن بوقت البيانات','Sales increased in 2025.']]]],tip:'تعبير معقد خاطئ لا يقوّي الكتابة. ابدأ بفكرة واضحة، ثم حسّن الربط والدقة.'}
  };
  window.SERAG_SUPPLEMENT_V13={lessons,questions,maps};
})();
