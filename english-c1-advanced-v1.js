/* C1 advanced grammar topics 26-35.
 * Source records retain their supplied field names; adapter fields keep the existing Academy schema.
 * Batch 1 (topics 1-5 / Q1-50) is intentionally not generated here.
 */
(()=> {
  'use strict';
  const sourceTopics = [
  {
    "topic_id": 26,
    "topic_name": "Inversion after Negative and Restrictive Adverbials (C1)",
    "cefr_level": "C1",
    "cefr_level_status": "Advanced grammar target",
    "english_explanation": "In formal and emphatic English, when a negative or restrictive adverbial (e.g., Not only, Never, Rarely, Seldom, Hardly, No sooner, Under no circumstances, At no point, Little, Only after, Only by) is placed at the beginning of a clause, the subject and auxiliary verb invert. This creates a question-like word order in a declarative sentence. The construction is common in academic writing, journalism, and formal speech.",
    "arabic_explanation": "في الإنجليزية الرسمية والتأكيدية، عند وضع ظرف نفي أو تقييد (مثل Not only, Never, Rarely, Under no circumstances) في بداية الجملة، يحدث انعكاس بين الفاعل والفعل المساعد. هذا ينتج ترتيبًا يشبه ترتيب السؤال داخل جملة خبرية. يُستخدم هذا الأسلوب بكثرة في الكتابة الأكاديمية والصحافة والخطابة الرسمية.",
    "grammar_structure_and_formulas": {
      "negative_adverb_inversion": "Negative Adverbial + Auxiliary + Subject + Main Verb + ...",
      "only_after_inversion": "Only after + Clause + Auxiliary + Subject + Main Verb + ...",
      "hardly_no_sooner": "Hardly / No sooner + had + Subject + Past Participle + when / than + Simple Past"
    },
    "forms": {
      "positive_form": "Not only did she meet the deadline, but she also delivered a flawless presentation.",
      "negative_form": "Under no circumstances should you share your password with anyone.",
      "question_form": "Rarely do we see such dedication in a junior employee."
    },
    "when_and_how_to_use": [
      "Use inversion after negative adverbs for emphasis in formal writing or speech.",
      "Use 'Hardly...when' and 'No sooner...than' with past perfect inversion for dramatic narrative effect.",
      "Use 'Only after / Only by' + inversion to highlight a condition or method.",
      "Avoid inversion in informal conversation unless you intend a rhetorical or humorous tone."
    ],
    "common_mistakes": [
      "Forgetting to invert: 'Not only she met the deadline...' instead of 'Not only did she meet the deadline...'.",
      "Using 'Hardly...than' instead of 'Hardly...when'.",
      "Inverting the wrong auxiliary: 'Rarely does she has...' instead of 'Rarely does she have...'."
    ],
    "examples": [
      "Never have I seen such a compelling argument.",
      "Little did we suspect that the quiet intern would end up leading the project.",
      "At no point did the manager admit responsibility for the error.",
      "No sooner had the lawyer signed the contract than the client demanded new terms.",
      "Only by working weekends could the team keep the launch on schedule."
    ],
    "practice_questions": [
      {
        "question_id": 251,
        "question": "Choose the correct inversion: 'Not only ___ late, but he also forgot the report.'",
        "options": [
          "A) he was",
          "B) was he",
          "C) he is",
          "D) is he"
        ],
        "correct_answer": "B) was he",
        "explanation": "After 'Not only' at the beginning of a clause, the auxiliary 'was' must precede the subject 'he'."
      },
      {
        "question_id": 252,
        "question": "Complete with the correct inversion: 'Hardly ___ the announcement when the phones started ringing.'",
        "options": [
          "A) she had finished",
          "B) had she finished",
          "C) she finished",
          "D) did she finish"
        ],
        "correct_answer": "B) had she finished",
        "explanation": "'Hardly' before a past event requires past perfect inversion: 'Hardly had she finished...'."
      },
      {
        "question_id": 253,
        "question": "Which sentence correctly uses 'Under no circumstances'?",
        "options": [
          "A) Under no circumstances you should store personal data on a shared drive.",
          "B) Under no circumstances should you store personal data on a shared drive.",
          "C) Under no circumstances you store personal data on a shared drive.",
          "D) Under no circumstances store you should personal data on a shared drive."
        ],
        "correct_answer": "B) Under no circumstances should you store personal data on a shared drive.",
        "explanation": "The modal auxiliary 'should' must invert with the subject 'you' after the negative adverbial."
      },
      {
        "question_id": 254,
        "question": "Choose the correct completion: 'No sooner ___ the contract than the client demanded new terms.'",
        "options": [
          "A) the lawyer had signed",
          "B) had the lawyer signed",
          "C) did the lawyer sign",
          "D) the lawyer signed"
        ],
        "correct_answer": "B) had the lawyer signed",
        "explanation": "'No sooner' triggers past perfect inversion: 'No sooner had the lawyer signed...'."
      },
      {
        "question_id": 255,
        "question": "Identify the sentence with correct inversion after 'Little':",
        "options": [
          "A) Little we suspected that the plan would fail.",
          "B) Little did we suspect that the plan would fail.",
          "C) Little we did suspect that the plan would fail.",
          "D) Little suspected we that the plan would fail."
        ],
        "correct_answer": "B) Little did we suspect that the plan would fail.",
        "explanation": "'Little' meaning 'not at all' at the start of a sentence requires auxiliary inversion ('did we suspect')."
      },
      {
        "question_id": 256,
        "question": "Complete the sentence: 'Only after the audit ___ how serious the errors were.'",
        "options": [
          "A) we realised",
          "B) did we realise",
          "C) we did realise",
          "D) realised we"
        ],
        "correct_answer": "B) did we realise",
        "explanation": "'Only after' + clause requires inversion in the main clause: 'did we realise'."
      },
      {
        "question_id": 257,
        "question": "Which sentence is grammatically correct?",
        "options": [
          "A) Seldom I have heard such a compelling argument.",
          "B) Seldom have I heard such a compelling argument.",
          "C) Seldom I heard have such a compelling argument.",
          "D) Seldom heard I have such a compelling argument."
        ],
        "correct_answer": "B) Seldom have I heard such a compelling argument.",
        "explanation": "'Seldom' at the beginning triggers inversion of the auxiliary 'have' and subject 'I'."
      },
      {
        "question_id": 258,
        "question": "Choose the correct inversion: 'At no point ___ that the figures had been manipulated.'",
        "options": [
          "A) he suggested",
          "B) did he suggest",
          "C) he did suggest",
          "D) suggested he"
        ],
        "correct_answer": "B) did he suggest",
        "explanation": "'At no point' requires auxiliary inversion with 'did'."
      },
      {
        "question_id": 259,
        "question": "Complete: 'Not until the final rehearsal ___ comfortable with the choreography.'",
        "options": [
          "A) the cast felt",
          "B) did the cast feel",
          "C) the cast did feel",
          "D) felt the cast"
        ],
        "correct_answer": "B) did the cast feel",
        "explanation": "'Not until' at the beginning of a sentence triggers inversion in the main clause."
      },
      {
        "question_id": 260,
        "question": "Which sentence correctly uses 'In no way'?",
        "options": [
          "A) In no way the company is responsible for the delays.",
          "B) In no way is the company responsible for the delays.",
          "C) In no way the company responsible is for the delays.",
          "D) In no way responsible the company is for the delays."
        ],
        "correct_answer": "B) In no way is the company responsible for the delays.",
        "explanation": "After 'In no way', the verb 'be' inverts with the subject: 'is the company'."
      }
    ],
    "source_book_and_page": [
      "EnglishGrammar.org – Advanced Inversion Exercises (C1-C2)",
      "Original Educational Content (C1 Advanced)"
    ]
  },
  {
    "topic_id": 27,
    "topic_name": "Cleft Sentences & Emphasis (C1)",
    "cefr_level": "C1",
    "cefr_level_status": "Advanced grammar target",
    "english_explanation": "Cleft sentences split a single idea into two clauses to emphasise a particular element (the focus). Common types include it-clefts ('It was John who broke the vase'), wh-clefts ('What I need is a holiday'), and reversed wh-clefts ('A holiday is what I need'). Clefts are powerful tools for guiding the reader's attention in formal writing and persuasive speech.",
    "arabic_explanation": "الجمل المشقوقة (Cleft Sentences) تقسم فكرة واحدة إلى جملتين لتأكيد عنصر معين (البؤرة). الأنواع الشائعة تشمل: it-cleft (مثل: It was John who broke the vase)، وwh-cleft (مثل: What I need is a holiday)، والمعكوسة (A holiday is what I need). تُستخدم لتوجيه انتباه القارئ أو المستمع في الكتابة الرسمية والخطابة الإقناعية.",
    "grammar_structure_and_formulas": {
      "it_cleft": "It + be + Focus + that/who + Clause",
      "wh_cleft": "What + Clause + be + Focus",
      "reversed_wh_cleft": "Focus + be + what + Clause"
    },
    "forms": {
      "positive_form": "It was in 2010 that the company was founded.",
      "negative_form": "It was not the manager who approved the budget, but the director.",
      "question_form": "Was it John who broke the vase?"
    },
    "when_and_how_to_use": [
      "Use it-clefts to highlight a noun phrase, time, or place.",
      "Use wh-clefts to spotlight an action or a thing ('What she did was...').",
      "Use reversed wh-clefts for dramatic emphasis at the end of a sentence.",
      "Clefts are common in academic writing to introduce contrast or correction."
    ],
    "common_mistakes": [
      "Omitting the relative pronoun: 'It was John broke the vase' instead of 'It was John who broke the vase'.",
      "Using 'that' after a person in a formal it-cleft when 'who' is preferred: 'It was the doctor that...' is acceptable but 'who' is more formal.",
      "Misplacing the focus: 'What I need a holiday is' instead of 'What I need is a holiday'."
    ],
    "examples": [
      "It was the lack of funding that ultimately doomed the project.",
      "What the committee failed to anticipate was the scale of the public backlash.",
      "A reliable laptop is exactly what the student needed.",
      "It was not until 2015 that the policy was finally revised.",
      "What made the apology convincing was the CEO's willingness to accept responsibility."
    ],
    "practice_questions": [
      {
        "question_id": 261,
        "question": "Choose the correct word to complete the cleft sentence: 'It was in 2010 ___ the company was founded.'",
        "options": [
          "A) when",
          "B) that",
          "C) which",
          "D) where"
        ],
        "correct_answer": "B) that",
        "explanation": "In an it-cleft focusing on a time expression, 'that' is the standard relative word."
      },
      {
        "question_id": 262,
        "question": "Which sentence is a correct wh-cleft?",
        "options": [
          "A) What I need a holiday is.",
          "B) What I need is a holiday.",
          "C) What I need is holiday.",
          "D) What is I need a holiday."
        ],
        "correct_answer": "B) What I need is a holiday.",
        "explanation": "Wh-cleft structure: 'What + clause + be + focus'."
      },
      {
        "question_id": 263,
        "question": "Identify the focus of the cleft: 'It was the lack of funding that doomed the project.'",
        "options": [
          "A) the project",
          "B) doomed",
          "C) the lack of funding",
          "D) that"
        ],
        "correct_answer": "C) the lack of funding",
        "explanation": "The element placed immediately after 'It was' is the focus of the it-cleft."
      },
      {
        "question_id": 264,
        "question": "Choose the correct completion: 'What the committee failed to anticipate ___ the scale of the backlash.'",
        "options": [
          "A) was",
          "B) were",
          "C) is",
          "D) have been"
        ],
        "correct_answer": "A) was",
        "explanation": "In a wh-cleft, the verb 'be' agrees with the focus ('the scale'), which is singular, so 'was' is correct."
      },
      {
        "question_id": 265,
        "question": "Which sentence uses a reversed wh-cleft?",
        "options": [
          "A) It was a holiday that I needed.",
          "B) What I needed was a holiday.",
          "C) A holiday was what I needed.",
          "D) I needed a holiday."
        ],
        "correct_answer": "C) A holiday was what I needed.",
        "explanation": "A reversed wh-cleft places the focus first: 'Focus + be + what + clause'."
      },
      {
        "question_id": 266,
        "question": "Choose the correct pronoun: 'It was Sarah ___ submitted the final report.'",
        "options": [
          "A) which",
          "B) who",
          "C) what",
          "D) whose"
        ],
        "correct_answer": "B) who",
        "explanation": "For a person in an it-cleft, 'who' is the preferred relative pronoun."
      },
      {
        "question_id": 267,
        "question": "What does the cleft sentence emphasise? 'It was not until 2015 that the policy was revised.'",
        "options": [
          "A) the policy",
          "B) the year 2015",
          "C) the revision",
          "D) the government"
        ],
        "correct_answer": "B) the year 2015",
        "explanation": "The it-cleft places emphasis on the time adverbial 'not until 2015'."
      },
      {
        "question_id": 268,
        "question": "Which is a grammatically correct it-cleft?",
        "options": [
          "A) It was the CEO who approved the budget.",
          "B) It was the CEO approved the budget.",
          "C) It was approved the budget by the CEO.",
          "D) It the CEO was who approved the budget."
        ],
        "correct_answer": "A) It was the CEO who approved the budget.",
        "explanation": "The structure requires 'It + be + focus + who/that + clause'."
      },
      {
        "question_id": 269,
        "question": "Complete: '___ made the apology convincing was the CEO's sincerity.'",
        "options": [
          "A) It",
          "B) What",
          "C) That",
          "D) Which"
        ],
        "correct_answer": "B) What",
        "explanation": "'What' introduces a wh-cleft that highlights the thing that made the apology convincing."
      },
      {
        "question_id": 270,
        "question": "Which sentence is NOT a cleft sentence?",
        "options": [
          "A) It was the rain that ruined the picnic.",
          "B) What we need is more time.",
          "C) The rain ruined the picnic.",
          "D) A reliable laptop is what she bought."
        ],
        "correct_answer": "C) The rain ruined the picnic.",
        "explanation": "Option C is a simple declarative sentence without a cleft structure."
      }
    ],
    "source_book_and_page": [
      "EnglishGrammar.org – Advanced Emphasis: Clefts, Fronting, and Inversion",
      "Original Educational Content (C1 Advanced)"
    ]
  },
  {
    "topic_id": 28,
    "topic_name": "The Subjunctive & Formal Structures (C1)",
    "cefr_level": "C1",
    "cefr_level_status": "Advanced grammar target",
    "english_explanation": "The subjunctive mood is used in formal English after certain verbs (recommend, suggest, demand, insist, propose), adjectives (essential, vital, crucial, necessary), and expressions (It is important that...) to express necessity, demand, or hypothetical situations. The present subjunctive uses the base form of the verb for all persons (e.g., 'It is essential that he be informed'). The past subjunctive appears in 'If I were you' and 'wish' structures.",
    "arabic_explanation": "يُستخدم صيغة الشرط/الوجوب (Subjunctive) في الإنجليزية الرسمية بعد أفعال معينة (recommend, suggest, demand, insist) وصفات (essential, vital, necessary) وتعبيرات (It is important that) للتعبير عن الضرورة أو الطلب أو المواقف الافتراضية. الصيغة الحاضرة تستخدم الفعل المجرد لجميع الضمائر (مثل: It is essential that he be informed). أما الصيغة الماضية فتظهر في تراكيب مثل 'If I were you' و 'wish'.",
    "grammar_structure_and_formulas": {
      "present_subjunctive": "Subject + Verb (recommend/demand/insist) + that + Subject + Base Verb",
      "adjective_subjunctive": "It is + Adjective (essential/vital) + that + Subject + Base Verb",
      "past_subjunctive_were": "If + Subject + were + ... (formal hypothetical)"
    },
    "forms": {
      "positive_form": "The board recommended that he accept the offer.",
      "negative_form": "It is essential that she not be late.",
      "question_form": "Is it necessary that he attend the meeting?"
    },
    "when_and_how_to_use": [
      "Use the present subjunctive after verbs of demand, suggestion, and recommendation in formal contexts.",
      "Use 'It is + adjective + that + subject + base verb' for impersonal formal statements.",
      "Use 'were' instead of 'was' in formal hypothetical 'if' clauses and after 'wish'.",
      "Avoid the subjunctive in informal conversation; use 'should + base verb' instead (e.g., 'The board recommended that he should accept...')."
    ],
    "common_mistakes": [
      "Adding '-s' to the third person singular: 'The board recommended that he accepts the offer' instead of 'accept'.",
      "Using 'was' instead of 'were' in formal hypotheticals: 'If I was you' instead of 'If I were you'.",
      "Using 'to' after the subjunctive verb: 'It is essential that he to be informed'."
    ],
    "examples": [
      "The committee insisted that the report be submitted by Friday.",
      "It is vital that every employee understand the new safety protocol.",
      "If I were the manager, I would implement the policy immediately.",
      "She demanded that he leave the premises at once.",
      "It is crucial that the data not be shared with unauthorised personnel."
    ],
    "practice_questions": [
      {
        "question_id": 271,
        "question": "Choose the correct subjunctive form: 'The board recommended that he ___ the offer.'",
        "options": [
          "A) accepts",
          "B) accept",
          "C) accepted",
          "D) to accept"
        ],
        "correct_answer": "B) accept",
        "explanation": "After 'recommended that', the present subjunctive uses the base verb 'accept' for all persons."
      },
      {
        "question_id": 272,
        "question": "Complete the formal subjunctive: 'It is essential that every employee ___ the new protocol.'",
        "options": [
          "A) understands",
          "B) understand",
          "C) understood",
          "D) to understand"
        ],
        "correct_answer": "B) understand",
        "explanation": "The impersonal construction 'It is essential that' triggers the base subjunctive 'understand'."
      },
      {
        "question_id": 273,
        "question": "Which sentence uses the past subjunctive correctly?",
        "options": [
          "A) If I was you, I would apologise.",
          "B) If I were you, I would apologise.",
          "C) If I am you, I would apologise.",
          "D) If I be you, I would apologise."
        ],
        "correct_answer": "B) If I were you, I would apologise.",
        "explanation": "In formal hypothetical conditionals, 'were' is used for all persons."
      },
      {
        "question_id": 274,
        "question": "Choose the correct negative subjunctive: 'It is vital that she ___ late.'",
        "options": [
          "A) is not",
          "B) not be",
          "C) does not be",
          "D) not is"
        ],
        "correct_answer": "B) not be",
        "explanation": "The negative present subjunctive is formed with 'not + base verb': 'not be'."
      },
      {
        "question_id": 275,
        "question": "Which verb triggers the subjunctive in formal English?",
        "options": [
          "A) hope",
          "B) demand",
          "C) think",
          "D) say"
        ],
        "correct_answer": "B) demand",
        "explanation": "'Demand' is a verb of insistence that triggers the subjunctive in a 'that' clause."
      },
      {
        "question_id": 276,
        "question": "Complete: 'The manager insisted that the meeting ___ postponed.'",
        "options": [
          "A) is",
          "B) be",
          "C) was",
          "D) will be"
        ],
        "correct_answer": "B) be",
        "explanation": "After 'insisted that', the present subjunctive 'be' is required in formal style."
      },
      {
        "question_id": 277,
        "question": "Choose the formal alternative to 'It is important that he goes':",
        "options": [
          "A) It is important that he go.",
          "B) It is important that he going.",
          "C) It is important that he to go.",
          "D) It is important that he gone."
        ],
        "correct_answer": "A) It is important that he go.",
        "explanation": "The formal subjunctive uses the base verb 'go' after 'It is important that'."
      },
      {
        "question_id": 278,
        "question": "Which sentence contains a subjunctive error?",
        "options": [
          "A) She suggested that he take a break.",
          "B) It is necessary that they be informed.",
          "C) He demanded that she leaves immediately.",
          "D) If I were rich, I would travel."
        ],
        "correct_answer": "C) He demanded that she leaves immediately.",
        "explanation": "'Leaves' should be the base form 'leave' in the subjunctive clause after 'demanded that'."
      },
      {
        "question_id": 279,
        "question": "Complete: 'It is crucial that the data ___ shared with unauthorised personnel.'",
        "options": [
          "A) is not",
          "B) not be",
          "C) are not",
          "D) not are"
        ],
        "correct_answer": "B) not be",
        "explanation": "The negative subjunctive after 'It is crucial that' is 'not be'."
      },
      {
        "question_id": 280,
        "question": "Which structure correctly uses the subjunctive after 'wish'?",
        "options": [
          "A) I wish I was taller.",
          "B) I wish I were taller.",
          "C) I wish I am taller.",
          "D) I wish I be taller."
        ],
        "correct_answer": "B) I wish I were taller.",
        "explanation": "After 'wish' referring to an unreal present, 'were' is the correct subjunctive form."
      }
    ],
    "source_book_and_page": [
      "EnglishGrammar.org – Subjunctive Exercises",
      "Original Educational Content (C1 Advanced)"
    ]
  },
  {
    "topic_id": 29,
    "topic_name": "Mixed Conditionals & Inverted Conditionals (C1)",
    "cefr_level": "C1",
    "cefr_level_status": "Advanced grammar target",
    "english_explanation": "Mixed conditionals combine different time frames: past condition + present result ('If I had studied medicine, I would be a doctor now') or present condition + past result ('If I were more organised, I would have finished the project yesterday'). Inverted conditionals omit 'if' and invert the subject and auxiliary for formal effect: 'Had I known...' (= If I had known), 'Were I to...' (= If I were to), 'Should you need...' (= If you should need).",
    "arabic_explanation": "الشروط المختلطة (Mixed Conditionals) تمزج بين أزمنة مختلفة: شرط في الماضي ونتيجة في الحاضر (مثل: If I had studied medicine, I would be a doctor now)، أو شرط في الحاضر ونتيجة في الماضي (مثل: If I were more organised, I would have finished the project yesterday). أما الشروط المقلوبة (Inverted Conditionals) فتحذف 'if' وتُقدّم الفعل المساعد على الفاعل لأسلوب رسمي: Had I known بدلاً من If I had known، وWere I to بدلاً من If I were to، وShould you need بدلاً من If you should need.",
    "grammar_structure_and_formulas": {
      "past_condition_present_result": "If + Past Perfect + , + would + Base Verb (present result)",
      "present_condition_past_result": "If + Simple Past + , + would have + Past Participle",
      "inverted_third_conditional": "Had + Subject + Past Participle + , + would have + Past Participle",
      "inverted_second_conditional": "Were + Subject + to + Base Verb + , + would + Base Verb"
    },
    "forms": {
      "positive_form": "If she had studied medicine, she would be a doctor now.",
      "negative_form": "Had I not known the truth, I would have acted differently.",
      "question_form": "Would you have accepted the offer if you had known the conditions?"
    },
    "when_and_how_to_use": [
      "Use mixed conditionals when the condition and result refer to different time periods.",
      "Use inverted conditionals in formal writing or rhetoric to sound more sophisticated.",
      "Use 'Were I to' for a hypothetical future action with a formal tone.",
      "Use 'Should you need' for polite formal offers or conditions."
    ],
    "common_mistakes": [
      "Mixing tenses incorrectly: 'If I would have known, I would have told you' instead of 'If I had known, I would have told you'.",
      "Using 'was' instead of 'were' in inverted conditionals: 'Was I to accept' instead of 'Were I to accept'.",
      "Forgetting the past participle after 'Had': 'Had I know' instead of 'Had I known'."
    ],
    "examples": [
      "If I had invested in that company, I would be wealthy now.",
      "Were I to accept the offer, I would have to relocate.",
      "Had it not been for her assistance, we would have missed the deadline.",
      "Should you require further information, please contact my assistant.",
      "If he were more careful, he wouldn't have made that mistake."
    ],
    "practice_questions": [
      {
        "question_id": 281,
        "question": "Choose the correct mixed conditional: 'If she had studied medicine, she ___ a doctor now.'",
        "options": [
          "A) would be",
          "B) would have been",
          "C) will be",
          "D) is"
        ],
        "correct_answer": "A) would be",
        "explanation": "Past condition ('had studied') + present result ('now') requires 'would + base verb' ('would be')."
      },
      {
        "question_id": 282,
        "question": "Complete the inverted conditional: '___ I known the committee would interpret my silence as consent, I would have objected.'",
        "options": [
          "A) If",
          "B) Had",
          "C) Were",
          "D) Should"
        ],
        "correct_answer": "B) Had",
        "explanation": "The formal inverted third conditional uses 'Had + subject + past participle': 'Had I known'."
      },
      {
        "question_id": 283,
        "question": "Which sentence is a correct present-condition/past-result mixed conditional?",
        "options": [
          "A) If I were more organised, I would have finished yesterday.",
          "B) If I had been more organised, I would finish yesterday.",
          "C) If I am more organised, I would have finished yesterday.",
          "D) If I were more organised, I will finish yesterday."
        ],
        "correct_answer": "A) If I were more organised, I would have finished yesterday.",
        "explanation": "Present condition ('were') + past result ('would have finished') forms a valid mixed conditional."
      },
      {
        "question_id": 284,
        "question": "Choose the correct inverted form: '___ you to retract the allegation, the matter could be settled.'",
        "options": [
          "A) If",
          "B) Were",
          "C) Had",
          "D) Should"
        ],
        "correct_answer": "B) Were",
        "explanation": "'Were you to' is the inverted form of 'If you were to' for a formal hypothetical future."
      },
      {
        "question_id": 285,
        "question": "Complete: 'Should the deadline slip again, we ___ the penalty clause.'",
        "options": [
          "A) will trigger",
          "B) would trigger",
          "C) would have triggered",
          "D) triggered"
        ],
        "correct_answer": "A) will trigger",
        "explanation": "'Should' + subject + base verb expresses a possible future condition, so the result uses 'will'."
      },
      {
        "question_id": 286,
        "question": "Which sentence contains a conditional error?",
        "options": [
          "A) Had I known, I would have acted differently.",
          "B) If I would have known, I would have told you.",
          "C) Were I to accept, I would need time.",
          "D) Should you need help, call me."
        ],
        "correct_answer": "B) If I would have known, I would have told you.",
        "explanation": "The correct form is 'If I had known', not 'If I would have known'."
      },
      {
        "question_id": 287,
        "question": "Choose the correct completion: 'Had it not been for her notes, we ___ the case.'",
        "options": [
          "A) would lose",
          "B) would have lost",
          "C) will lose",
          "D) lost"
        ],
        "correct_answer": "B) would have lost",
        "explanation": "'Had it not been for' is a past unreal condition, so the result requires 'would have + past participle'."
      },
      {
        "question_id": 288,
        "question": "Identify the type of conditional: 'Were I to win the lottery, I would travel the world.'",
        "options": [
          "A) Zero conditional",
          "B) First conditional",
          "C) Second conditional (inverted)",
          "D) Third conditional (inverted)"
        ],
        "correct_answer": "C) Second conditional (inverted)",
        "explanation": "'Were I to' is the inverted form of the second conditional 'If I were to'."
      },
      {
        "question_id": 289,
        "question": "Complete the mixed conditional: 'If he ___ more attention in class, he would have passed the exam.'",
        "options": [
          "A) pays",
          "B) paid",
          "C) had paid",
          "D) would pay"
        ],
        "correct_answer": "C) had paid",
        "explanation": "This is a past condition ('had paid') + past result ('would have passed'), a standard third conditional."
      },
      {
        "question_id": 290,
        "question": "Which inverted conditional is used for a polite formal offer?",
        "options": [
          "A) Had you need help...",
          "B) Should you need help...",
          "C) Were you need help...",
          "D) If you should need help..."
        ],
        "correct_answer": "B) Should you need help...",
        "explanation": "'Should you need' is the standard inverted formal offer."
      }
    ],
    "source_book_and_page": [
      "EnglishGrammar.org – Tricky Inverted Conditionals",
      "Original Educational Content (C1 Advanced)"
    ]
  },
  {
    "topic_id": 30,
    "topic_name": "Advanced Idioms (C1) – Part 1",
    "cefr_level": "C1",
    "cefr_level_status": "Advanced vocabulary target",
    "english_explanation": "Idioms are fixed expressions whose meaning is not deducible from the individual words. At C1 level, learners must recognise and use a wide range of idioms in context. This set covers high-frequency idioms such as 'bite the bullet', 'hit the nail on the head', 'let the cat out of the bag', 'burn the candle at both ends', 'cut corners', 'a blessing in disguise', 'put all one's eggs in one basket', 'read between the lines', 'keep someone at arm's length', and 'pull the wool over someone's eyes'.",
    "arabic_explanation": "التعابير الاصطلاحية (Idioms) عبارة عن تراكيب ثابتة لا يمكن استنتاج معناها من الكلمات المفردة. في مستوى C1، يجب على المتعلم التعرف على مجموعة واسعة من الأيديومات واستخدامها في السياق. تشمل هذه المجموعة تعابير شائعة مثل: bite the bullet (يتحمل بصبر)، hit the nail on the head (يصف المشكلة بدقة)، let the cat out of the bag (يفشي السر)، burn the candle at both ends (يعمل بجهد مرهق)، cut corners (يختصر الطريق بإهمال)، a blessing in disguise (نعمة مستورة)، put all eggs in one basket (يجازف بكل شيء)، read between the lines (يقرأ ما بين السطور)، keep at arm's length (يبقي على مسافة)، pull the wool over someone's eyes (يخدع شخصًا).",
    "grammar_structure_and_formulas": {
      "idiom_usage": "Idioms function as fixed phrases; the verb tense can change but the wording remains fixed."
    },
    "forms": {
      "positive_form": "She decided to bite the bullet and confront her boss.",
      "negative_form": "He didn't let the cat out of the bag about the surprise party.",
      "question_form": "Did she really hit the nail on the head with her analysis?"
    },
    "when_and_how_to_use": [
      "Use idioms to sound more natural and fluent in informal and semi-formal contexts.",
      "Be careful with register: some idioms are informal and inappropriate in academic writing.",
      "Learn the fixed wording; do not alter articles or prepositions arbitrarily."
    ],
    "common_mistakes": [
      "Changing the fixed wording: 'bite a bullet' instead of 'bite the bullet'.",
      "Using an idiom in the wrong context (e.g., 'kick the bucket' in a formal condolence letter).",
      "Confusing similar idioms: 'hit the nail on the head' vs 'hit the road'."
    ],
    "examples": [
      "Despite dreading the negotiations, she decided to bite the bullet and confront her partners.",
      "His insightful analysis hit the nail on the head, identifying the real issue behind the decline.",
      "She inadvertently let the cat out of the bag about the surprise party.",
      "Losing her job turned out to be a blessing in disguise, as it allowed her to pursue entrepreneurship.",
      "The professor always called a spade a spade, even if his bluntness ruffled feathers."
    ],
    "practice_questions": [
      {
        "question_id": 291,
        "question": "What does 'bite the bullet' mean?",
        "options": [
          "A) To eat something hard",
          "B) To endure a difficult situation bravely",
          "C) To avoid a problem",
          "D) To make a quick decision"
        ],
        "correct_answer": "B) To endure a difficult situation bravely",
        "explanation": "'Bite the bullet' means to face a painful or unpleasant situation with courage."
      },
      {
        "question_id": 292,
        "question": "Choose the idiom that means 'to describe exactly the cause of a problem'.",
        "options": [
          "A) let the cat out of the bag",
          "B) hit the nail on the head",
          "C) cut corners",
          "D) burn the candle at both ends"
        ],
        "correct_answer": "B) hit the nail on the head",
        "explanation": "'Hit the nail on the head' means to be exactly right about something."
      },
      {
        "question_id": 293,
        "question": "Complete: 'She ___ about the surprise party, ruining the plan.'",
        "options": [
          "A) bit the bullet",
          "B) let the cat out of the bag",
          "C) hit the nail on the head",
          "D) cut corners"
        ],
        "correct_answer": "B) let the cat out of the bag",
        "explanation": "'Let the cat out of the bag' means to reveal a secret unintentionally."
      },
      {
        "question_id": 294,
        "question": "What does 'burn the candle at both ends' mean?",
        "options": [
          "A) To work excessively hard",
          "B) To waste money",
          "C) To light a candle",
          "D) To sleep too much"
        ],
        "correct_answer": "A) To work excessively hard",
        "explanation": "The idiom describes overworking oneself, often leading to exhaustion."
      },
      {
        "question_id": 295,
        "question": "Choose the idiom meaning 'to do something in the easiest or cheapest way, often neglecting rules'.",
        "options": [
          "A) cut corners",
          "B) read between the lines",
          "C) keep at arm's length",
          "D) pull the wool over someone's eyes"
        ],
        "correct_answer": "A) cut corners",
        "explanation": "'Cut corners' means to take shortcuts, often compromising quality or safety."
      },
      {
        "question_id": 296,
        "question": "What does 'a blessing in disguise' mean?",
        "options": [
          "A) A hidden curse",
          "B) Something good that initially seemed bad",
          "C) A religious ceremony",
          "D) A pleasant surprise"
        ],
        "correct_answer": "B) Something good that initially seemed bad",
        "explanation": "The idiom refers to a fortunate outcome that was not apparent at first."
      },
      {
        "question_id": 297,
        "question": "Complete: 'Investing all your savings in one company is like ___.'",
        "options": [
          "A) putting all your eggs in one basket",
          "B) biting the bullet",
          "C) hitting the nail on the head",
          "D) reading between the lines"
        ],
        "correct_answer": "A) putting all your eggs in one basket",
        "explanation": "The idiom warns against risking everything on a single venture."
      },
      {
        "question_id": 298,
        "question": "What does 'read between the lines' mean?",
        "options": [
          "A) To read a book quickly",
          "B) To infer meaning from indirect cues",
          "C) To skip lines while reading",
          "D) To write between lines"
        ],
        "correct_answer": "B) To infer meaning from indirect cues",
        "explanation": "The idiom means to understand a hidden or implied meaning."
      },
      {
        "question_id": 299,
        "question": "Choose the idiom meaning 'to keep someone at a distance emotionally'.",
        "options": [
          "A) keep someone at arm's length",
          "B) pull the wool over someone's eyes",
          "C) let the cat out of the bag",
          "D) hit the nail on the head"
        ],
        "correct_answer": "A) keep someone at arm's length",
        "explanation": "The idiom means to maintain emotional or physical distance from someone."
      },
      {
        "question_id": 300,
        "question": "What does 'pull the wool over someone's eyes' mean?",
        "options": [
          "A) To deceive or trick someone",
          "B) To help someone see clearly",
          "C) To cover someone's eyes",
          "D) To surprise someone"
        ],
        "correct_answer": "A) To deceive or trick someone",
        "explanation": "The idiom means to deliberately mislead or deceive someone."
      }
    ],
    "source_book_and_page": [
      "EnglishGrammar.org – Idioms Exercise (C1)",
      "Advanced Idioms C1-C2 (Scribd)"
    ]
  },
  {
    "topic_id": 31,
    "topic_name": "Collocations & Tricky Word Pairs (C1)",
    "cefr_level": "C1",
    "cefr_level_status": "Advanced vocabulary target",
    "english_explanation": "Collocations are natural word combinations that native speakers use together (e.g., 'strongly recommend', 'highly unlikely', 'deeply concerned'). Tricky word pairs are words that are often confused because they look or sound similar (e.g., 'affect' vs 'effect', 'complement' vs 'compliment', 'principal' vs 'principle'). At C1 level, mastering these distinctions is essential for precision and natural fluency.",
    "arabic_explanation": "المتلازمات اللفظية (Collocations) هي ارتباطات طبيعية بين الكلمات يستخدمها المتحدثون الأصليون معًا (مثل: strongly recommend, highly unlikely, deeply concerned). أما أزواج الكلمات المربكة (Tricky Word Pairs) فهي كلمات يختلط استخدامها بسبب التشابه في الشكل أو الصوت (مثل: affect/effect، complement/compliment، principal/principle). في مستوى C1، إتقان هذه الفروق ضروري للدقة والطلاقة.",
    "grammar_structure_and_formulas": {
      "collocation_patterns": "Adverb + Adjective (highly unlikely) | Verb + Noun (make a decision) | Adjective + Noun (strong coffee)"
    },
    "forms": {
      "positive_form": "She strongly recommended the restaurant.",
      "negative_form": "It is highly unlikely that he will attend.",
      "question_form": "Did you make a decision about the offer?"
    },
    "when_and_how_to_use": [
      "Use collocations to make your English sound more natural and less translated.",
      "Learn tricky word pairs through example sentences rather than isolated definitions.",
      "Pay attention to preposition collocations (e.g., 'depend on', 'interested in', 'good at')."
    ],
    "common_mistakes": [
      "Using 'do a decision' instead of 'make a decision'.",
      "Confusing 'affect' (verb) and 'effect' (noun).",
      "Writing 'compliment' when you mean 'complement' (to complete or enhance)."
    ],
    "examples": [
      "The committee strongly recommended that the policy be revised.",
      "The weather is highly unlikely to improve before the weekend.",
      "The new evidence will affect the outcome of the trial.",
      "The wine perfectly complements the cheese.",
      "She is deeply concerned about the environmental impact."
    ],
    "practice_questions": [
      {
        "question_id": 301,
        "question": "Choose the correct collocation: 'The doctor ___ recommended the treatment.'",
        "options": [
          "A) strongly",
          "B) hardly",
          "C) roughly",
          "D) barely"
        ],
        "correct_answer": "A) strongly",
        "explanation": "'Strongly recommend' is a standard collocation."
      },
      {
        "question_id": 302,
        "question": "Which word correctly completes the sentence? 'The scandal had a serious ___ on the company's reputation.'",
        "options": [
          "A) affect",
          "B) effect",
          "C) affection",
          "D) effectiveness"
        ],
        "correct_answer": "B) effect",
        "explanation": "'Effect' is the noun meaning 'result or impact'; 'affect' is the verb."
      },
      {
        "question_id": 303,
        "question": "Choose the correct word: 'The sauce perfectly ___ the flavour of the fish.'",
        "options": [
          "A) compliments",
          "B) complements",
          "C) complains",
          "D) completes"
        ],
        "correct_answer": "B) complements",
        "explanation": "'Complement' means to complete or enhance; 'compliment' means to praise."
      },
      {
        "question_id": 304,
        "question": "Which collocation is correct?",
        "options": [
          "A) make a decision",
          "B) do a decision",
          "C) take a decision",
          "D) have a decision"
        ],
        "correct_answer": "A) make a decision",
        "explanation": "'Make a decision' is the standard English collocation."
      },
      {
        "question_id": 305,
        "question": "Choose the correct word: 'The school's ___ is a former teacher.'",
        "options": [
          "A) principle",
          "B) principal",
          "C) principles",
          "D) principally"
        ],
        "correct_answer": "B) principal",
        "explanation": "'Principal' means the head of a school; 'principle' means a rule or belief."
      },
      {
        "question_id": 306,
        "question": "Which adverb correctly collocates with 'unlikely'?",
        "options": [
          "A) highly",
          "B) deeply",
          "C) strongly",
          "D) absolutely"
        ],
        "correct_answer": "A) highly",
        "explanation": "'Highly unlikely' is a standard collocation."
      },
      {
        "question_id": 307,
        "question": "Choose the correct word: 'She was deeply ___ about the welfare of the animals.'",
        "options": [
          "A) concerned",
          "B) concerning",
          "C) concern",
          "D) concerns"
        ],
        "correct_answer": "A) concerned",
        "explanation": "'Deeply concerned' is a common collocation meaning very worried."
      },
      {
        "question_id": 308,
        "question": "Which sentence uses 'affect' correctly?",
        "options": [
          "A) The affect of the policy was immediate.",
          "B) The policy will affect the economy.",
          "C) The policy had a positive affect.",
          "D) The affect was difficult to measure."
        ],
        "correct_answer": "B) The policy will affect the economy.",
        "explanation": "'Affect' is a verb meaning to influence."
      },
      {
        "question_id": 309,
        "question": "Choose the correct collocation: 'The team ___ a significant breakthrough.'",
        "options": [
          "A) made",
          "B) did",
          "C) took",
          "D) had"
        ],
        "correct_answer": "A) made",
        "explanation": "'Make a breakthrough' is the standard collocation."
      },
      {
        "question_id": 310,
        "question": "Which word correctly completes the sentence? 'The two colours ___ each other beautifully.'",
        "options": [
          "A) compliment",
          "B) complement",
          "C) complain",
          "D) complete"
        ],
        "correct_answer": "B) complement",
        "explanation": "'Complement' means to go well together or enhance each other."
      }
    ],
    "source_book_and_page": [
      "Original Educational Content (C1 Advanced)",
      "English Collocations in Use (Advanced)"
    ]
  },
  {
    "topic_id": 32,
    "topic_name": "Ellipsis & Substitution (C1)",
    "cefr_level": "C1",
    "cefr_level_status": "Advanced grammar target",
    "english_explanation": "Ellipsis is the omission of words that are understood from context (e.g., 'She can play the piano, and he can [play the piano] too'). Substitution replaces a word or phrase with a substitute (e.g., 'do so', 'one', 'so', 'not'). These devices avoid repetition and create cohesion in formal and informal writing. Common substitution words include 'so', 'not', 'one', 'ones', 'do so', 'such', and 'the same'.",
    "arabic_explanation": "الحذف (Ellipsis) هو حذف كلمات مفهومة من السياق (مثل: She can play the piano, and he can too). أما الاستبدال (Substitution) فيستبدل كلمة أو عبارة بكلمة بديلة (مثل: do so, one, so, not). تُستخدم هذه الأدوات لتجنب التكرار وخلق التماسك في الكتابة الرسمية وغير الرسمية. تشمل كلمات الاستبدال الشائعة: so, not, one, ones, do so, such, the same.",
    "grammar_structure_and_formulas": {
      "ellipsis": "Omit repeated auxiliary or verb phrase: 'She can swim, and he can too.'",
      "substitution_so": "Use 'so' after verbs like think, hope, believe, expect: 'I think so.'",
      "substitution_do_so": "Use 'do so' to replace a verb phrase formally: 'He agreed to do so.'"
    },
    "forms": {
      "positive_form": "The committee endorsed the policy, and the board did so as well.",
      "negative_form": "Several departments submitted their reports, but the legal team did not.",
      "question_form": "Will the minister address the issue? He has yet to do so."
    },
    "when_and_how_to_use": [
      "Use ellipsis to avoid repeating auxiliary verbs or whole verb phrases.",
      "Use 'do so' in formal writing to replace an action verb phrase.",
      "Use 'so' and 'not' after verbs of thinking and hoping (think so, hope not).",
      "Use 'one/ones' to replace countable nouns."
    ],
    "common_mistakes": [
      "Repeating the full verb phrase unnecessarily: 'She can swim, and he can swim too' instead of 'he can too'.",
      "Using 'do' instead of 'do so' in formal contexts where a full verb phrase is replaced.",
      "Misusing 'so' after verbs that do not take it: 'I want so' instead of 'I want to'."
    ],
    "examples": [
      "The committee endorsed the revised policy, and the board did so as well.",
      "Several departments submitted their reports on time, but the legal team did not.",
      "The first draft was concise; the second was so.",
      "The auditors requested additional documentation, and the finance director agreed to do so immediately.",
      "Some reviewers found the methodology robust; others found it less so."
    ],
    "practice_questions": [
      {
        "question_id": 311,
        "question": "Complete with the correct substitution: 'The committee endorsed the policy, and the board ___ as well.'",
        "options": [
          "A) did so",
          "B) did it",
          "C) did",
          "D) so did"
        ],
        "correct_answer": "A) did so",
        "explanation": "'Did so' formally replaces the verb phrase 'endorsed the policy'."
      },
      {
        "question_id": 312,
        "question": "Choose the correct ellipsis: 'She can play the piano, and her brother ___ too.'",
        "options": [
          "A) can play",
          "B) can",
          "C) plays",
          "D) does"
        ],
        "correct_answer": "B) can",
        "explanation": "Ellipsis omits the repeated main verb 'play', leaving the auxiliary 'can'."
      },
      {
        "question_id": 313,
        "question": "Complete: 'The first draft was concise; the second was ___.'",
        "options": [
          "A) so",
          "B) such",
          "C) it",
          "D) one"
        ],
        "correct_answer": "A) so",
        "explanation": "'So' substitutes for the adjective 'concise' after 'was'."
      },
      {
        "question_id": 314,
        "question": "Which sentence uses substitution correctly?",
        "options": [
          "A) I think so.",
          "B) I think it.",
          "C) I think.",
          "D) I think such."
        ],
        "correct_answer": "A) I think so.",
        "explanation": "'Think so' is a standard substitution for a previously mentioned idea."
      },
      {
        "question_id": 315,
        "question": "Complete formally: 'The auditors requested documentation, and the director agreed to ___.'",
        "options": [
          "A) do so",
          "B) do it",
          "C) do",
          "D) so do"
        ],
        "correct_answer": "A) do so",
        "explanation": "'Do so' formally replaces 'provide documentation'."
      },
      {
        "question_id": 316,
        "question": "Choose the correct negative substitution: 'Will he attend? I hope ___.'",
        "options": [
          "A) not",
          "B) no",
          "C) don't",
          "D) so not"
        ],
        "correct_answer": "A) not",
        "explanation": "'Hope not' is the standard negative substitution."
      },
      {
        "question_id": 317,
        "question": "Identify the ellipsis in: 'Some reviewers found the methodology robust; others found it less so.'",
        "options": [
          "A) 'less so' substitutes for 'less robust'",
          "B) 'others' substitutes for 'other reviewers'",
          "C) 'found' is omitted",
          "D) 'methodology' is omitted"
        ],
        "correct_answer": "A) 'less so' substitutes for 'less robust'",
        "explanation": "'So' substitutes for the adjective 'robust'."
      },
      {
        "question_id": 318,
        "question": "Complete: 'The guidelines are clear, and those ___ not should be revised.'",
        "options": [
          "A) that are",
          "B) which are",
          "C) they are",
          "D) are"
        ],
        "correct_answer": "A) that are",
        "explanation": "'Those that are not' uses 'that are' as a relative clause with ellipsis of 'clear'."
      },
      {
        "question_id": 319,
        "question": "Which sentence avoids repetition correctly?",
        "options": [
          "A) She asked if I was ready, and I said I was.",
          "B) She asked if I was ready, and I said I was ready.",
          "C) She asked if I was ready, and I said ready.",
          "D) She asked if I was ready, and I said am."
        ],
        "correct_answer": "A) She asked if I was ready, and I said I was.",
        "explanation": "Ellipsis omits 'ready' after 'I was'."
      },
      {
        "question_id": 320,
        "question": "Choose the correct substitution for 'the data were not anonymised': 'The author claims the data were anonymised, but the appendix suggests ___.'",
        "options": [
          "A) otherwise",
          "B) so",
          "C) not",
          "D) such"
        ],
        "correct_answer": "A) otherwise",
        "explanation": "'Otherwise' means 'the opposite' and substitutes for the negative proposition."
      }
    ],
    "source_book_and_page": [
      "EnglishGrammar.org – Challenging Ellipsis and Substitution",
      "Original Educational Content (C1 Advanced)"
    ]
  },
  {
    "topic_id": 33,
    "topic_name": "Reduced Relative Clauses & Participle Clauses (C1)",
    "cefr_level": "C1",
    "cefr_level_status": "Advanced grammar target",
    "english_explanation": "Reduced relative clauses omit the relative pronoun and auxiliary verb, using a participle instead. Active relative clauses reduce to present participles (-ing): 'The man who is standing there' → 'The man standing there'. Passive relative clauses reduce to past participles (-ed/-en): 'The car that was stolen' → 'The car stolen'. Perfect participles ('Having + past participle') are used for actions completed before the main clause. These structures are common in formal and academic writing.",
    "arabic_explanation": "الجمل الوصلية المختصرة (Reduced Relative Clauses) تحذف ضمير الوصل والفعل المساعد، وتستخدم اسم الفاعل بدلاً منهما. الجمل النشطة تُختصر إلى اسم فاعل حالي (-ing): The man who is standing → The man standing. الجمل المبنية للمجهول تُختصر إلى اسم مفعول (-ed/-en): The car that was stolen → The car stolen. وتُستخدم صيغة (Having + past participle) للأحداث المكتملة قبل الجملة الرئيسية. هذه التراكيب شائعة في الكتابة الرسمية والأكاديمية.",
    "grammar_structure_and_formulas": {
      "active_reduction": "Noun + -ing phrase (The man standing there)",
      "passive_reduction": "Noun + Past Participle (The car stolen yesterday)",
      "perfect_participle": "Having + Past Participle + , + Main Clause"
    },
    "forms": {
      "positive_form": "The researchers conducting the experiment reported unexpected results.",
      "negative_form": "The proposal not approved by the board was revised.",
      "question_form": "Did you see the man wearing a blue hat?"
    },
    "when_and_how_to_use": [
      "Use reduced relative clauses to make writing more concise and formal.",
      "Use -ing reduction when the original relative clause is active.",
      "Use past participle reduction when the original relative clause is passive.",
      "Use 'Having + past participle' to show that one action was completed before another."
    ],
    "common_mistakes": [
      "Using the wrong participle: 'The car stealing yesterday' instead of 'The car stolen yesterday'.",
      "Reducing a relative clause that needs a subject: 'The man is standing there is my uncle' instead of 'The man standing there is my uncle'.",
      "Misusing perfect participles for simultaneous actions."
    ],
    "examples": [
      "The scientists working on the vaccine published their findings.",
      "The documents signed by the director are legally binding.",
      "Having completed the audit, the team submitted the report.",
      "The issues discussed at the meeting remain unresolved.",
      "Anyone wishing to attend should register in advance."
    ],
    "practice_questions": [
      {
        "question_id": 321,
        "question": "Reduce the relative clause: 'The man who is standing in the corner is my uncle.'",
        "options": [
          "A) The man standing in the corner is my uncle.",
          "B) The man who standing in the corner is my uncle.",
          "C) The man stood in the corner is my uncle.",
          "D) The man is standing in the corner is my uncle."
        ],
        "correct_answer": "A) The man standing in the corner is my uncle.",
        "explanation": "Active relative clause reduces to a present participle (-ing)."
      },
      {
        "question_id": 322,
        "question": "Reduce the passive relative clause: 'The car that was stolen was found yesterday.'",
        "options": [
          "A) The car stealing was found yesterday.",
          "B) The car stolen was found yesterday.",
          "C) The car was stolen found yesterday.",
          "D) The car that stolen was found yesterday."
        ],
        "correct_answer": "B) The car stolen was found yesterday.",
        "explanation": "Passive relative clause reduces to a past participle ('stolen')."
      },
      {
        "question_id": 323,
        "question": "Choose the correct perfect participle clause: '___ the audit, the team submitted the report.'",
        "options": [
          "A) Having completed",
          "B) Completing",
          "C) Completed",
          "D) To complete"
        ],
        "correct_answer": "A) Having completed",
        "explanation": "'Having completed' shows the audit was finished before the report was submitted."
      },
      {
        "question_id": 324,
        "question": "Which sentence contains a correctly reduced relative clause?",
        "options": [
          "A) The researchers conducted the experiment reported unexpected results.",
          "B) The researchers conducting the experiment reported unexpected results.",
          "C) The researchers who conducting the experiment reported unexpected results.",
          "D) The researchers conduct the experiment reported unexpected results."
        ],
        "correct_answer": "B) The researchers conducting the experiment reported unexpected results.",
        "explanation": "Active reduction uses the present participle 'conducting'."
      },
      {
        "question_id": 325,
        "question": "Reduce: 'Anyone who wishes to attend should register.'",
        "options": [
          "A) Anyone wishing to attend should register.",
          "B) Anyone wished to attend should register.",
          "C) Anyone who wishing to attend should register.",
          "D) Anyone wish to attend should register."
        ],
        "correct_answer": "A) Anyone wishing to attend should register.",
        "explanation": "The active relative clause reduces to 'wishing'."
      },
      {
        "question_id": 326,
        "question": "Choose the correct passive reduction: 'The issues that were discussed at the meeting remain unresolved.'",
        "options": [
          "A) The issues discussing at the meeting remain unresolved.",
          "B) The issues discussed at the meeting remain unresolved.",
          "C) The issues were discussed at the meeting remain unresolved.",
          "D) The issues that discussed at the meeting remain unresolved."
        ],
        "correct_answer": "B) The issues discussed at the meeting remain unresolved.",
        "explanation": "Passive relative clause reduces to the past participle 'discussed'."
      },
      {
        "question_id": 327,
        "question": "Which sentence is NOT a correctly reduced relative clause?",
        "options": [
          "A) The documents signed by the director are binding.",
          "B) The woman wearing a red coat is my aunt.",
          "C) The child played in the garden is my son.",
          "D) The proposal rejected by the board was revised."
        ],
        "correct_answer": "C) The child played in the garden is my son.",
        "explanation": "The correct form is 'The child playing in the garden...' (active) or 'The child who played...'."
      },
      {
        "question_id": 328,
        "question": "Complete: '___ the warning, the pilot would have entered restricted airspace.'",
        "options": [
          "A) Ignoring",
          "B) Having ignored",
          "C) Ignored",
          "D) To ignore"
        ],
        "correct_answer": "B) Having ignored",
        "explanation": "'Having ignored' shows the action of ignoring happened before the conditional result."
      },
      {
        "question_id": 329,
        "question": "Which reduction is correct for 'the letter that was written by Mary'?",
        "options": [
          "A) the letter writing by Mary",
          "B) the letter written by Mary",
          "C) the letter was written by Mary",
          "D) the letter that written by Mary"
        ],
        "correct_answer": "B) the letter written by Mary",
        "explanation": "Passive relative clause reduces to the past participle 'written'."
      },
      {
        "question_id": 330,
        "question": "Choose the sentence with a perfect participle clause:",
        "options": [
          "A) Having finished the report, she went home.",
          "B) Finishing the report, she went home.",
          "C) Finished the report, she went home.",
          "D) To finish the report, she went home."
        ],
        "correct_answer": "A) Having finished the report, she went home.",
        "explanation": "'Having finished' indicates the report was completed before she went home."
      }
    ],
    "source_book_and_page": [
      "EGYANKOSH – Reduced Relative Clauses",
      "Original Educational Content (C1 Advanced)"
    ]
  },
  {
    "topic_id": 34,
    "topic_name": "Future in the Past (C1)",
    "cefr_level": "C1",
    "cefr_level_status": "Advanced grammar target",
    "english_explanation": "Future in the past refers to future events as seen from a past perspective. It is formed with 'would + base verb', 'was/were going to + base verb', 'was/were to + base verb', 'was/were due to + base verb', 'was/were about to + base verb', or 'would have + past participle' for expected completions. It is common in narrative writing, reported speech, and expressions of past expectations.",
    "arabic_explanation": "المستقبل في الماضي (Future in the Past) يشير إلى أحداث مستقبلية تُرى من منظور الماضي. يُصاغ باستخدام would + الفعل المجرد، أو was/were going to + الفعل المجرد، أو was/were to + الفعل المجرد، أو was/were due to + الفعل المجرد، أو was/were about to + الفعل المجرد، أو would have + التصريف الثالث للتعبير عن اكتمال متوقع. يُستخدم بكثرة في السرد، والكلام المنقول، والتعبير عن توقعات الماضي.",
    "grammar_structure_and_formulas": {
      "would_future_in_past": "Subject + would + Base Verb",
      "going_to_future_in_past": "Subject + was/were going to + Base Verb",
      "was_to": "Subject + was/were to + Base Verb (formal arrangement)",
      "was_about_to": "Subject + was/were about to + Base Verb (imminent action)",
      "would_have_done": "Subject + would have + Past Participle (expected completion)"
    },
    "forms": {
      "positive_form": "I thought the meeting would be quick.",
      "negative_form": "She was not going to accept the offer.",
      "question_form": "Were they due to arrive at noon?"
    },
    "when_and_how_to_use": [
      "Use 'would' to report past expectations or intentions.",
      "Use 'was/were going to' for plans that were made in the past but may not have happened.",
      "Use 'was/were to' for formal arrangements or destiny.",
      "Use 'was/were about to' for actions that were imminent in the past.",
      "Use 'would have + past participle' for something expected to be completed before a past future time."
    ],
    "common_mistakes": [
      "Using 'will' instead of 'would' when reporting from a past perspective.",
      "Confusing 'was to' (formal arrangement) with 'was about to' (imminent action).",
      "Forgetting the past participle after 'would have'."
    ],
    "examples": [
      "I thought the meeting would be quick, but it dragged on for three hours.",
      "She was about to leave when she realised she had forgotten her passport.",
      "He promised that by Friday he would have finished the report.",
      "We were told the software would update automatically overnight.",
      "They were due to arrive at noon, so the staff started setting up early."
    ],
    "practice_questions": [
      {
        "question_id": 331,
        "question": "Choose the correct future in the past: 'I thought the meeting ___ quick.'",
        "options": [
          "A) will be",
          "B) would be",
          "C) is",
          "D) was"
        ],
        "correct_answer": "B) would be",
        "explanation": "'Would be' expresses a past expectation about a later state."
      },
      {
        "question_id": 332,
        "question": "Complete: 'She ___ when she realised she had left her passport at home.'",
        "options": [
          "A) was about to leave",
          "B) is about to leave",
          "C) will leave",
          "D) leaves"
        ],
        "correct_answer": "A) was about to leave",
        "explanation": "'Was about to leave' indicates an action that was imminent in the past."
      },
      {
        "question_id": 333,
        "question": "Choose the correct form: 'He promised that by Friday he ___ the report.'",
        "options": [
          "A) will have finished",
          "B) would have finished",
          "C) has finished",
          "D) finished"
        ],
        "correct_answer": "B) would have finished",
        "explanation": "'Would have finished' expresses an expected completion before a past future time."
      },
      {
        "question_id": 334,
        "question": "Which sentence uses 'was to' correctly for a formal arrangement?",
        "options": [
          "A) We were to meet the client at 6.",
          "B) We were about to meet the client at 6.",
          "C) We would meet the client at 6.",
          "D) We will meet the client at 6."
        ],
        "correct_answer": "A) We were to meet the client at 6.",
        "explanation": "'Were to' indicates a formal arrangement in the past."
      },
      {
        "question_id": 335,
        "question": "Complete: 'They were due to ___ at noon.'",
        "options": [
          "A) arriving",
          "B) arrive",
          "C) arrived",
          "D) have arrived"
        ],
        "correct_answer": "B) arrive",
        "explanation": "'Due to' is followed by the base verb 'arrive'."
      },
      {
        "question_id": 336,
        "question": "Choose the correct future in the past for a past intention: 'He said he ___ call me.'",
        "options": [
          "A) will",
          "B) would",
          "C) is going to",
          "D) shall"
        ],
        "correct_answer": "B) would",
        "explanation": "'Would' reports a future intention from a past viewpoint."
      },
      {
        "question_id": 337,
        "question": "Which sentence is NOT an example of future in the past?",
        "options": [
          "A) I knew the email would cause trouble.",
          "B) She was going to travel to Spain.",
          "C) We will visit the museum tomorrow.",
          "D) They were about to announce the winner."
        ],
        "correct_answer": "C) We will visit the museum tomorrow.",
        "explanation": "Option C refers to a future event from a present perspective, not from the past."
      },
      {
        "question_id": 338,
        "question": "Complete: 'I didn't realise at the time that this mistake ___ me my job.'",
        "options": [
          "A) will cost",
          "B) would cost",
          "C) costs",
          "D) has cost"
        ],
        "correct_answer": "B) would cost",
        "explanation": "'Would cost' expresses a later consequence seen from a past moment."
      },
      {
        "question_id": 339,
        "question": "Choose the correct completion: 'She was on the verge of ___ the truth.'",
        "options": [
          "A) tell",
          "B) telling",
          "C) told",
          "D) to tell"
        ],
        "correct_answer": "B) telling",
        "explanation": "'On the verge of' is followed by a gerund ('telling')."
      },
      {
        "question_id": 340,
        "question": "Which option correctly reports a past assumption? 'I assumed the flight ___ delayed.'",
        "options": [
          "A) will be",
          "B) would be",
          "C) is",
          "D) has been"
        ],
        "correct_answer": "B) would be",
        "explanation": "'Would be' expresses a past assumption about a later state."
      }
    ],
    "source_book_and_page": [
      "EnglishGrammar.org – Tricky Future in the Past",
      "Original Educational Content (C1 Advanced)"
    ]
  },
  {
    "topic_id": 35,
    "topic_name": "Advanced Modal Deduction (Past & Present) (C1)",
    "cefr_level": "C1",
    "cefr_level_status": "Advanced grammar target",
    "english_explanation": "Modal deduction expresses degrees of certainty about present or past situations. Present deduction: 'must' (strong certainty), 'can't' (impossibility), 'may/might/could' (possibility). Past deduction: 'must have + past participle' (certain), 'can't have + past participle' (impossible), 'might/could have + past participle' (possible). 'Should have + past participle' expresses regret or criticism. 'Needn't have + past participle' means an action was done but unnecessary. These structures are essential for nuanced C1-level speculation.",
    "arabic_explanation": "الاستنتاج بالأفعال الناقصة (Modal Deduction) يعبر عن درجات اليقين بشأن مواقف حاضرة أو ماضية. الاستنتاج في الحاضر: must (يقين قوي)، can't (استحالة)، may/might/could (احتمال). الاستنتاج في الماضي: must have + التصريف الثالث (مؤكد)، can't have + التصريف الثالث (مستحيل)، might/could have + التصريف الثالث (محتمل). وتُستخدم should have + التصريف الثالث للندم أو اللوم، وneedn't have + التصريف الثالث للدلالة على أن الفعل تم دون ضرورة. هذه التراكيب أساسية للتعبير الدقيق في مستوى C1.",
    "grammar_structure_and_formulas": {
      "present_certainty": "must + Base Verb",
      "present_impossibility": "can't + Base Verb",
      "past_certainty": "must have + Past Participle",
      "past_impossibility": "can't have + Past Participle",
      "past_regret": "should have + Past Participle",
      "unnecessary_past_action": "needn't have + Past Participle"
    },
    "forms": {
      "positive_form": "He must be exhausted after the marathon.",
      "negative_form": "She can't have received the email; otherwise, she would have replied.",
      "question_form": "Could he have left his keys at home?"
    },
    "when_and_how_to_use": [
      "Use 'must' for strong logical deduction based on evidence.",
      "Use 'can't' for logical impossibility (never 'mustn't' for deduction).",
      "Use 'must have + past participle' for strong conclusions about past events.",
      "Use 'should have + past participle' to express regret or criticise a past action.",
      "Use 'needn't have + past participle' when an action was done but was unnecessary."
    ],
    "common_mistakes": [
      "Using 'mustn't' for negative deduction instead of 'can't'.",
      "Using the simple past after modals for past deduction: 'He must went' instead of 'He must have gone'.",
      "Confusing 'didn't need to' (unnecessary, possibly not done) with 'needn't have done' (unnecessary but done)."
    ],
    "examples": [
      "Look at the heavy snow; it must be freezing outside.",
      "He just ate a huge lunch; he can't be hungry already.",
      "The streets are wet; it must have rained during the night.",
      "She can't have received the message; otherwise, she would have replied.",
      "You needn't have bought milk; we already had plenty."
    ],
    "practice_questions": [
      {
        "question_id": 341,
        "question": "Choose the correct present deduction: 'The lights are off and no one answers; they ___ be at home.'",
        "options": [
          "A) must",
          "B) can't",
          "C) should",
          "D) mustn't"
        ],
        "correct_answer": "B) can't",
        "explanation": "'Can't' expresses logical impossibility based on the evidence."
      },
      {
        "question_id": 342,
        "question": "Complete the past deduction: 'He scored 100% on the exam; he ___ hard.'",
        "options": [
          "A) must study",
          "B) should study",
          "C) must have studied",
          "D) could study"
        ],
        "correct_answer": "C) must have studied",
        "explanation": "'Must have studied' forms a strong logical deduction about a past action."
      },
      {
        "question_id": 343,
        "question": "Which sentence expresses past regret?",
        "options": [
          "A) I must have arrived earlier.",
          "B) I should have arrived earlier.",
          "C) I might have arrived earlier.",
          "D) I can't have arrived earlier."
        ],
        "correct_answer": "B) I should have arrived earlier.",
        "explanation": "'Should have + past participle' expresses regret about an unfulfilled action."
      },
      {
        "question_id": 344,
        "question": "Choose the correct past impossibility: 'She ___ the email; otherwise, she would have replied.'",
        "options": [
          "A) can't receive",
          "B) shouldn't receive",
          "C) can't have received",
          "D) mustn't receive"
        ],
        "correct_answer": "C) can't have received",
        "explanation": "'Can't have + past participle' expresses logical impossibility in the past."
      },
      {
        "question_id": 345,
        "question": "What does 'needn't have bought' mean? 'You needn't have bought milk.'",
        "options": [
          "A) You didn't buy milk because it wasn't necessary.",
          "B) You bought milk, but it wasn't necessary.",
          "C) You must buy milk.",
          "D) You should buy milk."
        ],
        "correct_answer": "B) You bought milk, but it wasn't necessary.",
        "explanation": "'Needn't have + past participle' means an action was performed but was unnecessary."
      },
      {
        "question_id": 346,
        "question": "Choose the correct modal for present possibility: 'Take an umbrella; it ___ rain later.'",
        "options": [
          "A) must",
          "B) might",
          "C) can't",
          "D) should"
        ],
        "correct_answer": "B) might",
        "explanation": "'Might' expresses present or future possibility."
      },
      {
        "question_id": 347,
        "question": "Identify the error: 'You mustn't to bring food into the lab.'",
        "options": [
          "A) 'mustn't' should be 'don't have to'",
          "B) 'to' after 'mustn't' should be omitted",
          "C) 'bring' should be 'brought'",
          "D) 'food' should be plural"
        ],
        "correct_answer": "B) 'to' after 'mustn't' should be omitted",
        "explanation": "Modal verbs are followed directly by the bare infinitive without 'to'."
      },
      {
        "question_id": 348,
        "question": "Complete the past deduction: 'The ground is wet; it ___ last night.'",
        "options": [
          "A) must rain",
          "B) must have rained",
          "C) should rain",
          "D) can't rain"
        ],
        "correct_answer": "B) must have rained",
        "explanation": "'Must have rained' is a strong deduction about a past event."
      },
      {
        "question_id": 349,
        "question": "Which sentence correctly expresses strong present certainty?",
        "options": [
          "A) She has won ten medals; she must be an extraordinary athlete.",
          "B) She has won ten medals; she might be an extraordinary athlete.",
          "C) She has won ten medals; she should be an extraordinary athlete.",
          "D) She has won ten medals; she can be an extraordinary athlete."
        ],
        "correct_answer": "A) She has won ten medals; she must be an extraordinary athlete.",
        "explanation": "'Must be' indicates near-certain logical deduction based on evidence."
      },
      {
        "question_id": 350,
        "question": "Complete: 'The museum ticket was free, so we ___ pay anything.'",
        "options": [
          "A) mustn't",
          "B) didn't have to",
          "C) shouldn't have",
          "D) couldn't"
        ],
        "correct_answer": "B) didn't have to",
        "explanation": "'Didn't have to' expresses lack of necessity in the past."
      }
    ],
    "source_book_and_page": [
      "EnglishGrammar.org – Advanced Speculation and Deduction",
      "Original Educational Content (C1 Advanced)"
    ]
  }
];
  const lessons = sourceTopics.map(topic => {
    const first = topic.practice_questions?.[0];
    const formula = Object.entries(topic.grammar_structure_and_formulas || {})
      .map(([name, value]) => name + ': ' + value).join(' | ');
    return {
      ...topic,
      id: 'c1-topic-' + topic.topic_id,
      level: topic.cefr_level,
      track: 'C1 Advanced Grammar',
      title: topic.topic_name,
      titleAr: topic.topic_name,
      summary: topic.english_explanation,
      formula,
      uses: topic.when_and_how_to_use || [],
      examples: topic.examples || [],
      mistake: (topic.common_mistakes || []).join(' '),
      tip: formula || topic.english_explanation,
      quiz: first ? [first.question, first.correct_answer, first.options.find(option => option !== first.correct_answer) || ''] : ['', '', ''],
      task: 'Complete the practice questions for ' + topic.topic_name + '.'
    };
  });
  const questions = sourceTopics.flatMap(topic => (topic.practice_questions || []).map(item => ({
    ...item,
    id: 'c1:' + item.question_id,
    topic: 'c1-topic-' + topic.topic_id,
    level: topic.cefr_level,
    prompt: item.question,
    answer: item.correct_answer,
    explanation: item.explanation,
    arabic_explanation: topic.arabic_explanation,
    topic_name: topic.topic_name
  })));
  window.SERAG_C1_ADVANCED_V1 = { topics: sourceTopics, lessons, questions };
  if (Array.isArray(window.SERAG_GRAMMAR_V10)) {
    const existing = new Set(window.SERAG_GRAMMAR_V10.map(lesson => lesson.id));
    window.SERAG_GRAMMAR_V10.push(...lessons.filter(lesson => !existing.has(lesson.id)));
  }
})();
