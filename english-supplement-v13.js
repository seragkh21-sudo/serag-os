/* Original adult-learning material. Uploaded books inform topic coverage only;
   no scanned pages, publisher audio, or copied exercise collections are served. */
(()=>{
  'use strict';
  const lessons=[];const questions=[];
  function add(id,level,title,titleAr,summary,formula,examples,mistake,tip,task,items){
    lessons.push({id,level,track:level==='A1'?'Foundations':'Sentence Lab',title,titleAr,summary,formula,uses:[summary,tip],examples,mistake,tip,task,quiz:[items[0][0],items[0][1],items[0][2]]});
    items.forEach(([prompt,answer,...wrong],i)=>questions.push({id:`supplement:${id}:${i+1}`,topic:id,prompt,answer,options:[answer,...wrong],explanation:summary+' '+mistake}));
  }
  add('sentence-parts','A1','Subject, verb and object','Sentence components',
    'The subject performs the action. The verb describes an action or state. Some verbs need an object, while others do not.',
    'Subject + verb (+ object) | Subject + be + complement',
    ['The client approved the proposal.','The meeting ended.','The proposal is clear.'],
    'An adjective alone is not a verb: The proposal clear needs is. Not every verb requires an object.',
    'Ask: Who performs the action? What do they do? What receives the action?','Analyse a sentence from a work email into its subject, verb and object.',[
      ['In “The manager approved the budget”, what is the subject?','The manager','approved','the budget'],
      ['Complete the sentence: The instructions ___ clear.','are','clear','very'],
      ['Which sentence is complete?','The meeting ended.','The meeting.','Ended the.'],
      ['In “We sent the invoice”, what is the object?','the invoice','We','sent']]);
  add('be-basics','A1','Be: am, is, are','Be: statements, questions and negatives',
    'Use be for identity, descriptions and location. Use am with I, is with third-person singular subjects, and are with you, we, they and plural subjects.',
    'I am | he/she/it is | you/we/they are | Be + subject? | subject + be + not',
    ['I am a designer.','The files are ready.','Is your colleague at work?'],
    'Do not add do to a question with be: say Are you ready?, not Do you are ready?',
    'If the complement is an adjective, noun or location, you usually need be.','Write an introduction, a negative statement and a question using be.',[
      ['The two offices ___ open today.','are','is','am'],
      ['I ___ available after lunch.','am','is','are'],
      ['Which question is correct?','Are you ready?','Do you are ready?','Is you ready?'],
      ['Choose the correct negative.','She is not at home.','She does not is at home.','She not at home.']]);
  add('subject-object-pronouns','A1','Subject and object pronouns','Subject and object pronouns',
    'Use I/he/she/we/they as subjects. Use me/him/her/us/them after a verb or preposition.',
    'I → me | he → him | she → her | we → us | they → them',
    ['They called me yesterday.','I sent it to her.','We invited them to the meeting.'],
    'Use an object pronoun after to, for and with: with me, not with I.',
    'Distinguish between the person performing the action and the person receiving it.','Replace people’s names with the correct pronouns in three sentences.',[
      ['Please send the link to ___.','me','I','my'],
      ['___ are joining the call at ten.','They','Them','Their'],
      ['We invited Sara. We invited ___.','her','she','hers'],
      ['The client spoke with Omar and ___.','me','I','my']]);
  add('possessives','A1','Possessives','Possessives: my, mine and the apostrophe',
    'Use my/your/his/her/our/their before a noun. Mine/yours/hers/ours/theirs replace the noun. Add ’s to a singular owner and an apostrophe after a plural noun ending in s.',
    'my file / the file is mine | the client’s request | the clients’ requests',
    ['This is my notebook. That one is yours.','The client’s feedback is helpful.','The clients’ files are ready.'],
    'Its shows possession; it’s is short for it is or it has. Do not say mine notebook.',
    'Is the noun after the word? Use my notebook. Is the noun omitted? Use It is mine.','Write about something belonging to you, something belonging to one person and something belonging to a group.',[
      ['This folder belongs to me. It is ___.','mine','my','me'],
      ['___ presentation is ready.','Their','Theirs','Them'],
      ['Choose “the feedback from one client”.','the client’s feedback','the clients’ feedback','the clients feedback'],
      ['The company updated ___ website.','its','it’s','it']]);
  add('demonstratives','A1','This, that, these, those','Demonstratives: distance and number',
    'Use this/that for singular nouns and these/those for plural nouns. This/these usually refer to nearby things, while that/those refer to things farther away. They can also refer to an idea or item mentioned earlier.',
    'this is / that is | these are / those are',
    ['This file here is the final version.','Those boxes over there are empty.','That sounds useful.'],
    'These and those take plural nouns and the verb are when used in a description.',
    'Choose the number first, then consider distance.','Describe something near you, something farther away and a group of objects.',[
      ['___ files here are ready.','These','This','That'],
      ['___ building over there is our office.','That','These','Those'],
      ['Choose the correct sentence.','These ideas are useful.','These idea is useful.','This ideas are useful.'],
      ['I like ___ notebook in my hand.','this','those','these']]);
  add('there-is-are','A1','There is / there are','Describing existence',
    'Use there is with singular or uncountable nouns and there are with plural nouns. Questions begin with Is there or Are there.',
    'There is + singular/uncountable | There are + plural',
    ['There is a meeting at two.','There are three attachments.','Is there any water?'],
    'Do not use there is with plural nouns in standard English. There is not the possessive pronoun their.',
    'Use this structure to introduce something, then use it or they to refer to it.','Describe your desk in two sentences and ask a question about something missing.',[
      ['There ___ three messages in my inbox.','are','is','am'],
      ['There ___ some information on the website.','is','are','have'],
      ['___ a printer in the office?','Is there','Are there','Does there'],
      ['There ___ any chairs in this room.','are not','is not','not are']]);
  add('have-has','A1','Have, has and had','Possession: have, has and had',
    'For possession, use have with I/you/we/they and has with he/she/it. Use had for the past. After does or did, use have.',
    'have/has + noun | Do/Does + subject + have? | did not have',
    ['She has a new laptop.','Do you have the brief?','We had a problem yesterday.'],
    'Say Does she have?, not Does she has? Say did not have, not did not had.',
    'Distinguish have for possession from have + past participle in perfect tenses.','Write about something you own, ask a colleague a question and write one sentence about the past.',[
      ['My colleague ___ two monitors.','has','have','having'],
      ['Does the office ___ a meeting room?','have','has','had'],
      ['We did not ___ enough time yesterday.','have','had','has'],
      ['Last year, I ___ an older computer.','had','has','have']]);
  add('imperatives','A1','Imperatives and requests','Imperatives and polite requests',
    'An imperative starts with the base verb without an expressed subject. Negative imperatives start with Don’t. At work, Could you…? is usually more polite.',
    'Base verb + object | Don’t + base | Could you + base?',
    ['Save a copy first.','Don’t close the document.','Could you send the original file, please?'],
    'Use the base verb after Don’t. An imperative may sound too direct depending on the relationship and context.',
    'Use imperatives for instructions and polite request forms when addressing someone.','Turn direct instructions into polite requests.',[
      ['___ the attachment before replying.','Read','Reads','Reading'],
      ['Don’t ___ the backup folder.','delete','deletes','deleted'],
      ['Which request is polite and grammatical?','Could you send the brief, please?','Could you sent the brief?','You sends the brief.'],
      ['Choose a negative instruction.','Don’t share the password.','Not share the password.','Don’t shared the password.']]);
  add('frequency-adverbs','A2','Adverbs of frequency','Frequency and adverb position',
    'Usually, often, sometimes and never describe frequency. They normally come before the main verb, after be, or between an auxiliary and the main verb.',
    'subject + usually + verb | subject + be + usually + adjective',
    ['I usually check my email at nine.','She is always punctual.','We have often discussed this issue.'],
    'Never is negative in meaning; do not combine it with don’t in standard sentences.',
    'Place the adverb after be, but before an ordinary main verb.','Describe three habits using different frequency adverbs.',[
      ['Choose the natural word order.','She is always on time.','She always is on time all.','She on time is always.'],
      ['I ___ check the brief before starting.','usually','usual','every'],
      ['Choose the correct negative meaning.','I never miss the deadline.','I don’t never miss the deadline.','I never misses the deadline.'],
      ['He usually ___ the bus to work.','takes','take','taking']]);
  add('linking-action-verbs','A2','Linking and action verbs','Linking verbs or action verbs?',
    'Be, seem and become can link the subject to a description. Look, taste, feel and smell can be linking or action verbs depending on meaning. An adjective describes the subject after a linking verb.',
    'subject + linking verb + adjective | action verb + adverb',
    ['The layout looks clean.','She checked the layout carefully.','The room smells fresh.'],
    'The layout looks clean, not cleanly, because clean describes the design. In She looked carefully, carefully describes the action of looking.',
    'Ask whether the word describes the subject or the way an action is performed.','Describe how a file looks, then explain how it was reviewed.',[
      ['The new design looks ___.','professional','professionally','profession'],
      ['She reviewed the document ___.','carefully','careful','care'],
      ['The soup tastes ___.','good','well','goodness'],
      ['After the break, he felt ___.','relaxed','relaxedly','relaxing him']]);
  add('sentence-boundaries','A2','Fragments and run-on sentences','Sentence fragments and run-on sentences',
    'An independent clause usually needs a complete idea, a subject and a verb. A dependent clause such as Because I was busy needs a main clause. Do not join two independent clauses with only a comma.',
    'Independent clause. | clause, and/but/so + clause | dependent clause, main clause',
    ['Because I was busy, I replied later.','The draft was ready, but the client requested changes.','I finished the report. I sent it immediately.'],
    'I was tired, I went home is a comma splice. Use a full stop or an appropriate conjunction.',
    'Check each clause: can it stand alone?','Write two independent clauses, then connect them to show a reason or result.',[
      ['Which sentence is complete?','Although it was late, we continued.','Although it was late.','Because the deadline.'],
      ['Choose the correct punctuation.','I checked the file, and I sent it.','I checked the file, I sent it.','I checked, the file I sent it.'],
      ['We were tired, ___ we took a break.','so','although','because of'],
      ['Choose a complete sentence.','The team completed the project.','After completing the project.','The completed project on the desk.']]);
  add('contrast-cause-linkers','B1','Cause, contrast and result','Cause, contrast and result',
    'Because is followed by a clause; because of is followed by a noun or -ing form. Although introduces a contrast clause. However connects independent ideas with appropriate punctuation.',
    'because + clause | because of + noun/-ing | although + clause | sentence; however, sentence',
    ['We postponed the trip because it was raining.','We postponed the trip because of the rain.','It was expensive; however, it was reliable.'],
    'Do not use although and but together to connect the same clauses. Despite is followed by a noun or -ing form, not a full clause.',
    'Identify the relationship, then check whether the linker is followed by a noun or a clause.','Explain a decision using a reason, then present an advantage and a disadvantage in contrast.',[
      ['The event was cancelled because ___ heavy rain.','of','that','although'],
      ['___ the service was expensive, it was useful.','Although','Despite','Because of'],
      ['Choose the correct sentence.','Despite being tired, I finished.','Despite I was tired, I finished.','Although I was tired, but I finished.'],
      ['The file was too large. ___, I compressed it.','Therefore','Although','Because of']]);
  add('paraphrase-meaning','B1','Paraphrasing without changing meaning','Paraphrasing without changing meaning',
    'Change the structure or wording while preserving the idea, quantity, time reference and level of certainty. Synonyms are not interchangeable in every context.',
    'Meaning check: who + action + time + amount + certainty',
    ['Sales rose slightly. → There was a small increase in sales.','Some people prefer remote work. → Remote work is preferred by some people.','It may improve results. → It could lead to better results.'],
    'May does not mean will, and some does not mean all. Choose natural phrasing instead of replacing words randomly.',
    'After paraphrasing, compare the original and new claims point by point.','Paraphrase an idea from a work email without changing its level of certainty.',[
      ['Which keeps the meaning of “Sales rose slightly”?','There was a small increase in sales.','Sales doubled.','Sales fell sharply.'],
      ['Which keeps the meaning of “Some workers prefer remote work”?','Remote work is preferred by some workers.','All workers prefer remote work.','No workers prefer remote work.'],
      ['“The change may help” expresses ___.','possibility','certainty','an order'],
      ['Which keeps the meaning of “The task was completed by the team”?','The team completed the task.','The team will complete the task.','The team has not completed the task.']]);
  add('trend-language','B1','Describing changes and data','Describing changes and data',
    'Rise and fall describe changes. Use by for the amount of change, to for the final value and from for the starting value. Use past forms for past data and choose a verb that matches the direction of change.',
    'rose from A to B | increased by N | a sharp increase | increased sharply',
    ['Sales rose from 100 to 150.','Sales increased by 50.','There was a sharp increase in demand.'],
    'An increase from 100 to 150 is 50 units or 50%, not 150%. Do not invent a reason for a chart if none is provided.',
    'Distinguish the amount of change from the final value before writing.','Describe a value that started at 80 and ended at 100 using from, to and by.',[
      ['Sales rose from 80 to 100. They increased ___ 20.','by','to','from'],
      ['Sales rose ___ 100, starting at 80.','to','by','of'],
      ['There was a ___ increase in demand.','sharp','sharply','rise'],
      ['Demand increased ___.','steadily','steady','steadiness']]);

  add('word-order','A1','Word order and punctuation','Word order, capitalisation and punctuation',
    'The usual statement order is subject, verb, object and then additional details. Start sentences with a capital letter, capitalise I and proper names, and end each sentence with appropriate punctuation.',
    'Subject + verb + object (+ place/time) | Capital letter … . / ?',
    ['I sent the file this morning.','Sara lives in Cairo.','Where does the meeting take place?'],
    'Do not transfer Arabic word order directly. Adjectives usually come before nouns: a useful idea, not an idea useful.',
    'Arrange the sentence first, then check its beginning and ending.','Write a short message, then review word order, capitalisation of I and proper names.',[
      ['Choose the normal word order.','We sent the file yesterday.','We the file sent yesterday.','Yesterday the file we sent it.'],
      ['Choose the correctly written sentence.','I live in Cairo.','i live in cairo.','I live in cairo.'],
      ['Choose the correct noun phrase.','a useful idea','an idea useful','a idea useful'],
      ['Choose the correctly punctuated question.','Are you available?','Are you available.','are you available?']]);
  add('contractions','A1','Contractions and full forms','Contractions and their full forms',
    'A contraction combines words and omits letters using an apostrophe. I’m = I am, don’t = do not and won’t = will not. ’s can mean is or has, while ’d can mean had or would depending on what follows.',
    'I’m / isn’t / don’t / won’t | she’s ready / she’s finished | I’d left / I’d like',
    ['I’m available tomorrow.','She’s finished the task.','I’d like more information.'],
    'Its shows possession, while it’s is a contraction. In very formal writing, the full form may be more appropriate.',
    'Look at the following word to determine whether ’s means has or is, and whether ’d means had or would.','Expand three contractions into their full forms.',[
      ['“I’m” means ___.','I am','I have','I will'],
      ['“won’t” means ___.','will not','would not','was not'],
      ['In “She’s finished the report”, she’s means ___.','she has','she is','she was'],
      ['In “I’d like a copy”, I’d means ___.','I would','I had','I did']]);
  add('indefinite-pronouns','A2','Someone, anyone and everyone','Indefinite pronouns',
    'Someone, everyone and no one refer to non-specific people and take singular verbs. Anyone is common in questions and negatives, and can mean any person in affirmative statements. Nobody is negative in meaning.',
    'everyone/someone/nobody + singular verb | not … anyone',
    ['Everyone is ready.','Has anyone called?','Nobody knows the answer.'],
    'Everyone are is incorrect. Do not combine didn’t and nobody in standard negative sentences: say I didn’t see anyone.',
    'A pronoun may refer to many people, but it still takes a singular verb.','Write a question about an unknown person and a sentence about the whole team.',[
      ['Everyone ___ ready for the call.','is','are','be'],
      ['I didn’t see ___ at reception.','anyone','nobody','no one'],
      ['Nobody ___ the password.','knows','know','knowing'],
      ['Has ___ called while I was away?','anyone','everyone are','nobody are']]);
  add('stative-verbs','B1','State and action meanings','Stative and action meanings',
    'Know, believe and own describe states and are not usually used in continuous forms. Think, have and see can describe either a state or an action depending on meaning.',
    'I know / I own | I think (= believe) / I am thinking (= considering)',
    ['I know the answer.','I think the idea is useful.','I am thinking about a new approach.'],
    'I am knowing is not normally used. I have a car describes possession, while I am having lunch describes an activity.',
    'Choose the tense based on the verb’s meaning in the sentence, not its form alone.','Write two sentences using think with two different meanings.',[
      ['I ___ the answer to this question.','know','am knowing','knowing'],
      ['I ___ a small apartment; it belongs to me.','own','am owning','owning'],
      ['Please wait. We ___ lunch right now.','are having','have had yesterday','are have'],
      ['I ___ this is a good idea; that is my opinion.','think','am think','thinking']]);

  // Broaden existing topics with independently written contextual questions.
  const rows=[
    ['articles','She works at ___ university.','a','an','the an','Use a because university begins with the /y/ consonant sound.'],
    ['articles','We waited for ___ hour.','an','a','any a','Hour begins with a vowel sound because h is silent.'],
    ['articles','___ advice you gave me was helpful.','The','An','A','Advice is uncountable, but this refers to a specific piece of advice identified by the following information.'],
    ['countable','We don’t have ___ time before the meeting.','much','many','a few','Time is uncountable here, so much is appropriate in a negative sentence.'],
    ['countable','I have ___ questions about the contract.','a few','a little','much','Questions is a plural countable noun.'],
    ['countable','There is ___ water left, enough for one cup.','a little','a few','many','Water is uncountable, and a little indicates that a small amount remains.'],
    ['present-simple','Sara normally ___ the train to work.','takes','take','is take','This describes a habit; add -s for the third-person singular subject Sara.'],
    ['present-simple','He ___ work on Fridays.','does not','do not','is not','The Present Simple negative with he is does not + the base verb.'],
    ['present-simple','Water ___ at 100°C at standard atmospheric pressure.','boils','boil','is boil','This is a general truth, so use the Present Simple.'],
    ['present-continuous','Please be quiet. I ___ a client right now.','am calling','call','called','This action is happening now: use am + -ing.'],
    ['present-continuous','This month, we ___ in a temporary office.','are working','have worked yesterday','is working','This is a temporary situation with a plural subject: are working.'],
    ['present-continuous','___ you waiting for the bus now?','Are','Do','Have','A Present Continuous question begins with be.'],
    ['past-simple','We ___ the invoice last Monday.','paid','have paid','pay','This is a finished past time; paid is the irregular past form.'],
    ['past-simple','I did not ___ the notification yesterday.','see','saw','seen','Use the base verb after did not.'],
    ['past-simple','___ you attend the meeting yesterday?','Did','Have','Were','For a question with an ordinary verb in the past, use Did + the base verb.'],
    ['past-continuous','At eight last night, I ___ home.','was driving','have driven','drive','This describes an action in progress at a specific moment in the past.'],
    ['past-continuous','They ___ dinner when the power went out.','were having','was having','have','Use were with they; the action was in progress when another event interrupted it.'],
    ['past-continuous','While I was cooking, she ___ the table.','was setting','has set','is setting','These are two actions happening in parallel in the past.'],
    ['present-perfect','I ___ my keys, so I cannot open the door now.','have lost','lose','have lose','A past event has a result now: use have + lost.'],
    ['present-perfect','She has ___ visited Australia.','never','yesterday','last year','Never describes experience up to now without referring to a finished past time.'],
    ['present-perfect','Have you ___ the email yet?','sent','send','sending','Use have + the past participle sent.'],
    ['present-perfect-continuous','I ___ English for two hours and I am still studying.','have been studying','had studied','am study','The activity and its duration continue up to now.'],
    ['present-perfect-continuous','She ___ for the bus since seven and is still at the stop.','has been waiting','had waited','wait','Since identifies the starting point of an activity that continues into the present.'],
    ['past-perfect','When I arrived, the train ___ already left.','had','has','was','The departure happened before another past reference point.'],
    ['past-perfect','I could not pay because I ___ my wallet at home.','had left','have left','leave','Leaving the wallet at home happened before the inability to pay.'],
    ['future-forms','Look at those dark clouds. It ___.','is going to rain','rained yesterday','has raining','This is a prediction based on present evidence.'],
    ['future-forms','“The phone is ringing.” “I ___ it.”','will answer','answered','have answered','This is a decision made at the moment of speaking.'],
    ['questions','Where ___ your sister live?','does','is','has','For live in the Present Simple with she, use does + the base verb.'],
    ['questions','Which question asks about the person who called?','Who called you?','Who did called you?','Who you called?','Who is the subject of the question here, so do not add did.'],
    ['modals','You ___ wear a seat belt; it is required.','must','might','can’t','This expresses necessity: must + the base verb.'],
    ['modals','You ___ smoke here; it is forbidden.','must not','don’t have to','might','Must not expresses prohibition; do not have to expresses lack of necessity.'],
    ['modals','The deadline is next week. You ___ finish today.','don’t have to','must not','can’t','Finishing today is not necessary; it is not prohibited.'],
    ['passive','The invoices ___ checked every week.','are','is','have','Use the Present Simple Passive with a plural subject: are + past participle.'],
    ['passive','The document was ___ yesterday.','signed','sign','signing','The passive form here is was + past participle.'],
    ['relative-clauses','The colleague ___ helped me is on leave.','who','where','when','Use who for a person acting as the subject.'],
    ['relative-clauses','This is the office ___ we work.','where','who','whose','Use where to connect a place with the clause.'],
    ['gerund-infinitive','I enjoy ___ new skills.','learning','to learn','learn','Enjoy is followed by the -ing form.'],
    ['gerund-infinitive','We decided ___ the proposal.','to revise','revising','revise','Decide is followed by to + the base verb.'],
    ['comparatives','This route is ___ than the other one.','shorter','shortest','more short','This compares two things: shorter than.'],
    ['comparatives','This is the ___ option of the three.','best','better','gooder','This is a superlative within a group: the best.'],
    ['adjective-adverb','Please explain the steps ___.','clearly','clear','clarity','An adverb describes how the action of explaining is performed.'],
    ['ed-ing-adjectives','I felt ___ during the long lecture.','bored','boring','bore','Bored describes the person’s feeling; boring describes what causes the feeling.'],
    ['time-prepositions','Our call is ___ Tuesday morning.','on','in','at','Use on with a specific day, even when it is followed by morning.'],
    ['time-prepositions','The meeting starts ___ nine.','at','on','in','Use at with a precise time: at nine.'],
    ['place-prepositions','The keys are ___ the drawer, under the papers.','in','at','to','Use in because the keys are inside the drawer.'],
    ['reported-speech','She told ___ that she was busy.','me','to me','I','Tell takes a personal object directly, without to.'],
    ['do-make','We need to ___ a decision.','make','do','have doing','The correct collocation is make a decision.'],
    ['adjective-prepositions','I am interested ___ learning more.','in','on','for','Use interested in + a noun or -ing form.']
  ];
  rows.forEach(([topic,prompt,answer,w1,w2,explanation],i)=>questions.push({id:`supplement:context:${i+1}`,topic,prompt,answer,options:[answer,w1,w2],explanation}));
  window.SERAG_GRAMMAR_V10=[...(window.SERAG_GRAMMAR_V10||[]),...lessons];
  const maps={
    foundations:{name:'Sentence foundations map',root:'From an idea to a correct sentence: identity → verb → details',branches:[
      ['Sentence core',[['sentence-parts','Who performs the action? What do they do? What receives the action?','The team completed the task.'],['be-basics','Identity / description / location','I am ready. / She is at work.'],['have-has','Possession in the present and past','She has a laptop. / Did you have time?']]],
      ['Reference',[['subject-object-pronouns','Subject or object?','They invited us.'],['possessives','Is a noun stated or replaced by the possessive pronoun?','my file / the file is mine'],['demonstratives','Choose number, then distance','this/that is · these/those are']]],
      ['Add details',[['there-is-are','Introduce something that exists','There are two options.'],['frequency-adverbs','How often? Where does the adverb go?','I usually work. / I am usually busy.'],['imperatives','An instruction or a polite request?','Save it. / Could you save it?']]]],tip:'These foundations are designed for adult learners. If a topic feels easy, test yourself and move on to areas that need more practice.'},
    writing:{name:'Writing map',root:'Preserve meaning → write complete sentences → connect ideas',branches:[
      ['Clarity',[['sentence-boundaries','Is the sentence complete?','Because I was busy, I replied later.'],['linking-action-verbs','Does the description refer to the subject or the action?','looks clear / explains clearly'],['paraphrase-meaning','Change the wording while preserving the claim','some ≠ all · may ≠ will']]],
      ['Connection',[['contrast-cause-linkers','Reason: clause or noun phrase?','because it rained / because of the rain'],['contrast-cause-linkers','Contrast between two ideas','Although… / However,…'],['relative-clauses','Add a description without repeating the noun','a colleague who…']]],
      ['Data',[['trend-language','Starting value / ending value / amount of change','from 80 to 100 / by 20'],['adjective-adverb','Noun for the change or verb for the action?','a sharp rise / rose sharply'],['past-simple','Match the tense to the time period of the data','Sales increased in 2025.']]]],tip:'Incorrect complex phrasing does not improve writing. Start with a clear idea, then improve cohesion and accuracy.'}
  };
  window.SERAG_SUPPLEMENT_V13={lessons,questions,maps};
})();
