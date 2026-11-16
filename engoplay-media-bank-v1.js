/* EngoPlay media curriculum v1.
   Original learning prompts inspired by the user's liked Spotify tracks and selected films.
   No lyrics, scripts, or transcript text is stored here. */
(()=>{
'use strict';
const tracks=[
 {title:'Here Comes The Sun',artist:'The Beatles',url:'https://open.spotify.com/track/6dGnYIeXmHdcikdzNNDMm2',focus:['hope','future forms','phrasal verbs']},
 {title:'Careless Whisper',artist:'George Michael',url:'https://open.spotify.com/track/5ac3D4hNLW7NFhYFCThXgh',focus:['regret','past narrative','collocations']},
 {title:'Every Breath You Take',artist:'The Police',url:'https://open.spotify.com/track/1JSTJqkT5qHq8MDJnJbRE1',focus:['present simple','frequency','point of view']},
 {title:'I Will Survive',artist:'Gloria Gaynor',url:'https://open.spotify.com/track/7rIovIsXE6kMn629b7kDig',focus:['will','resilience idioms','contrast']},
 {title:'Wicked Game',artist:'Chris Isaak',url:'https://open.spotify.com/track/2y42xAsl6dfMeVXQgOYsUw',focus:['conditionals','emotion vocabulary','adjectives']},
 {title:'As the World Caves In',artist:'Matt Maltese',url:'https://open.spotify.com/track/3NM41PVVUr0ceootKAtkAj',focus:['metaphor','future perfect','concession']},
 {title:'Sign of the Times',artist:'Harry Styles',url:'https://open.spotify.com/track/5Ohxk2dO5COHF1krpoPigN',focus:['imperatives','social vocabulary','advice']},
 {title:'Skyfall',artist:'Adele',url:'https://open.spotify.com/track/6VObnIkLVruX4UVyxWhlqm',focus:['zero conditional','imagery','strong verbs']},
 {title:'Until I Found You',artist:'Stephen Sanchez',url:'https://open.spotify.com/track/0T5iIrXA4p5GsubkhuBIKV',focus:['past perfect','time clauses','romantic vocabulary']},
 {title:'What I’ve Done',artist:'Linkin Park',url:'https://open.spotify.com/track/4wfyFIRnxdIN0v4OGtXcX3',focus:['present perfect','accountability','self-reflection']},
 {title:'No. 1 Party Anthem',artist:'Arctic Monkeys',url:'https://open.spotify.com/track/5TTGoX70AFrTvuEtqHK37S',focus:['informal register','modals','social situations']},
 {title:'Die With A Smile',artist:'Lady Gaga & Bruno Mars',url:'https://open.spotify.com/track/2plbrEY59IikOBgBGLjaoe',focus:['second conditional','commitment','time expressions']}
];
const films=[
 {title:'The Intern',year:2015,focus:['polite requests','workplace English','present perfect']},
 {title:'The Devil Wears Prada',year:2006,focus:['reported speech','tone','workplace vocabulary']},
 {title:'The Social Network',year:2010,focus:['argumentation','hedging','legal/work vocabulary']},
 {title:'The Pursuit of Happyness',year:2006,focus:['narrative tenses','resilience','goal language']},
 {title:'The Martian',year:2015,focus:['problem solving','conditionals','technical explanations']},
 {title:'The Shawshank Redemption',year:1994,focus:['contrast','passive voice','hope vocabulary']},
 {title:'Forrest Gump',year:1994,focus:['past simple','used to','storytelling']},
 {title:'Inside Out',year:2015,focus:['feelings','cause and effect','adjectives']},
 {title:'Spider-Man: Into the Spider-Verse',year:2018,focus:['identity','can/could','informal phrases']},
 {title:'Hidden Figures',year:2016,focus:['formal requests','passive voice','achievement language']}
];
const q=(id,level,prompt,options,answer,explanation,source,skill)=>({id,level,topic:'media:'+source.type,sourceQuestionType:'single_select',prompt,options,answer,explanation,source,skill});
const questions=[
 q('media:music:01','B1','A song about recovery uses the most natural future form: “I ___ keep going.”',['will','am','have','did'],'will','Use will + base verb for a decision, promise, or prediction about the future.',{type:'song',title:'I Will Survive',artist:'Gloria Gaynor',url:tracks[3].url},'future forms'),
 q('media:music:02','B1','Choose the correct collocation: “I need to ___ responsibility for my mistake.”',['take','do','make','put'],'take','The fixed collocation is take responsibility.',{type:'song',title:'What I’ve Done',artist:'Linkin Park',url:tracks[9].url},'collocations'),
 q('media:music:03','B1','Complete the time clause: “When the difficult season ___, things will feel lighter.”',['ends','will end','ended','has end'],'ends','After when, use present simple for a future time clause.',{type:'song',title:'Here Comes The Sun',artist:'The Beatles',url:tracks[0].url},'time clauses'),
 q('media:music:04','B2','Choose the natural conditional: “If the pressure gets worse, we ___ a break.”',['will take','take','would took','have taken'],'will take','First conditional: if + present simple, then will + base verb.',{type:'song',title:'Skyfall',artist:'Adele',url:tracks[7].url},'first conditional'),
 q('media:music:05','B2','Which phrase means “continue despite difficulty”?',['keep going','turn in','run out','look up'],'keep going','Keep going is a useful resilience phrase meaning continue.',{type:'song',title:'I Will Survive',artist:'Gloria Gaynor',url:tracks[3].url},'idioms'),
 q('media:music:06','B2','Choose the best contrast linker: “The plan was risky; ___, it worked.”',['however','because','unless','so that'],'however','However introduces a contrast between two ideas.',{type:'song',title:'Wicked Game',artist:'Chris Isaak',url:tracks[4].url},'linkers'),
 q('media:music:07','B2','Choose the correct tense: “By the time the tour started, the band ___ three rehearsals.”',['had completed','completes','has complete','was complete'],'had completed','Past perfect shows an earlier past action before another past event.',{type:'song',title:'Until I Found You',artist:'Stephen Sanchez',url:tracks[8].url},'past perfect'),
 q('media:music:08','C1','Choose the best hedge for a thoughtful opinion: “The song ___ be read as a comment on modern pressure.”',['could','must to','is can','would to'],'could','Could be read is a cautious interpretation, useful in analysis.',{type:'song',title:'Sign of the Times',artist:'Harry Styles',url:tracks[6].url},'hedging'),
 q('media:music:09','C1','Select the natural metaphor explanation: “The world caves in” suggests that life ___.',['feels as if it is collapsing','is literally underground','has become quieter','is being repaired'],'feels as if it is collapsing','A metaphor compares an emotional or social situation to a physical image.',{type:'song',title:'As the World Caves In',artist:'Matt Maltese',url:tracks[5].url},'metaphor'),
 q('media:music:10','C1','Choose the best formal sentence for a review: “The arrangement ___ a strong sense of tension.”',['creates','does','puts','takes'],'creates','Create a sense of + noun is a natural review collocation.',{type:'song',title:'Careless Whisper',artist:'George Michael',url:tracks[1].url},'review language'),
 q('media:film:01','B1','At work, choose the polite request: “___ you send me the file when you have a moment?”',['Could','Must','Should to','Did'],'Could','Could you…? is a polite request.',{type:'film',title:'The Intern',year:2015},'polite requests'),
 q('media:film:02','B1','Choose the correct narrative tense: “She ___ at the office when the call arrived.”',['was working','works','has worked','is work'],'was working','Past continuous describes an action in progress when another past event happened.',{type:'film',title:'The Devil Wears Prada',year:2006},'narrative tenses'),
 q('media:film:03','B1','Complete the sentence: “He ___ used to working under pressure.”',['is','does','has','will'],'is','The pattern is be used to + noun or -ing form.',{type:'film',title:'The Social Network',year:2010},'be used to'),
 q('media:film:04','B2','Choose the reported speech form: “She said that she ___ the deadline.”',['had met','meets','has meet','will met'],'had met','Reported past perfect can describe an action completed before the reporting time.',{type:'film',title:'Hidden Figures',year:2016},'reported speech'),
 q('media:film:05','B2','Choose the best problem-solving conditional: “If the system fails, we ___ the backup plan.”',['will use','used','would used','have use'],'will use','This is a realistic first conditional.',{type:'film',title:'The Martian',year:2015},'first conditional'),
 q('media:film:06','B2','Choose the passive form: “The final decision ___ by the committee.”',['was made','made','has make','is making'],'was made','Past simple passive is was/were + past participle.',{type:'film',title:'The Shawshank Redemption',year:1994},'passive voice'),
 q('media:film:07','B2','Which phrase best means “try a different approach”?',['change tactics','break a leg','hit the roof','spill the beans'],'change tactics','Change tactics means adopt a different strategy.',{type:'film',title:'The Martian',year:2015},'idioms'),
 q('media:film:08','C1','Choose the cautious academic claim: “The scene ___ be interpreted as a critique of ambition.”',['can','must to','is can','has to be can'],'can','Can be interpreted presents an analysis without claiming certainty.',{type:'film',title:'The Social Network',year:2010},'analysis language'),
 q('media:film:09','C1','Choose the natural cause-and-effect sentence: “The pressure increased, ___ the team changed its strategy.”',['so','although','unless','whereas'],'so','So introduces a result.',{type:'film',title:'Hidden Figures',year:2016},'cause and effect'),
 q('media:film:10','C1','Choose the best sentence for a film review: “The character is shown ___ from failure.”',['learning','to learn','learned','learn'],'learning','Show + object + -ing highlights an action in progress.',{type:'film',title:'The Pursuit of Happyness',year:2006},'review grammar'),
 q('media:film:11','C2','Choose the precise concession: “___ the evidence is incomplete, the argument remains persuasive.”',['Although','Because','So','Unless'],'Although','Although introduces a concession: a point that does not cancel the main claim.',{type:'film',title:'The Shawshank Redemption',year:1994},'concession'),
 q('media:film:12','C2','Choose the strongest formal verb: “The film ___ the cost of unchecked ambition.”',['foregrounds','does','puts up','gets'],'foregrounds','Foreground means place an issue in a prominent position, common in advanced reviews.',{type:'film',title:'The Devil Wears Prada',year:2006},'advanced review language')
];
const getQuestions=level=>questions.filter(x=>x.level===level);
window.SERAG_ENGOPLAY_MEDIA_BANK_V1={version:'1.0.0',tracks,films,questions,getQuestions};
})();
