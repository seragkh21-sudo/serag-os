/* Source-traceable, manually checked English questions from the user's Telegram export.
 * Unanswered, ambiguous and media-dependent posts are not included in live practice.
 */
(()=>{
'use strict';
const pack=window.SERAG_ENGLISH_EXPANSION_V1;
if(!pack||!Array.isArray(pack.questions))return;
const rows=[
  {
    "id": "telegram:message17150",
    "level": "B1",
    "topic": "vocabulary",
    "prompt": "Complete the phrase: \"We need to look at the big ________.\"",
    "options": [
      "photo",
      "picture",
      "painting",
      "drawing"
    ],
    "answer": "picture",
    "explanation": "Learn the expression and its meaning in context. Answer: picture.",
    "source": "telegram-english-courses",
    "sourceMessageId": "message17150",
    "sourceFile": "messages17.html",
    "answerReview": "independently-checked"
  },
  {
    "id": "telegram:message12493",
    "level": "B2",
    "topic": "vocabulary",
    "prompt": "Which word is similar to «Lousy»? (B2)",
    "options": [
      "Honest",
      "Inferior",
      "Awesome",
      "Inappropriate"
    ],
    "answer": "Inferior",
    "explanation": "Learn the expression and its meaning in context. Answer: Inferior.",
    "source": "telegram-english-courses",
    "sourceMessageId": "message12493",
    "sourceFile": "messages12.html",
    "answerReview": "independently-checked"
  },
  {
    "id": "telegram:message17005",
    "level": "B1",
    "topic": "questions",
    "prompt": "\"While I was reading a book, the phone ________.\"",
    "options": [
      "ring",
      "rang",
      "rung",
      "is ringing"
    ],
    "answer": "rang",
    "explanation": "Compare the grammar, meaning, and natural usage of each option. Answer: rang.",
    "source": "telegram-english-courses",
    "sourceMessageId": "message17005",
    "sourceFile": "messages17.html",
    "answerReview": "independently-checked"
  },
  {
    "id": "telegram:message3039",
    "level": "B1",
    "topic": "questions",
    "prompt": "I adopted a ........outlook on life.",
    "options": [
      "hoped",
      "negative",
      "positive"
    ],
    "answer": "positive",
    "explanation": "Compare the grammar, meaning, and natural usage of each option. Answer: positive.",
    "source": "telegram-english-courses",
    "sourceMessageId": "message3039",
    "sourceFile": "messages3.html",
    "answerReview": "independently-checked"
  },
  {
    "id": "telegram:message17795",
    "level": "B2",
    "topic": "questions",
    "prompt": "A/An _____ is a detailed outline of what students will learn in a course.",
    "options": [
      "curriculum",
      "syllabus",
      "assessment",
      "evaluation"
    ],
    "answer": "syllabus",
    "explanation": "Compare the grammar, meaning, and natural usage of each option. Answer: syllabus.",
    "source": "telegram-english-courses",
    "sourceMessageId": "message17795",
    "sourceFile": "messages17.html",
    "answerReview": "independently-checked"
  },
  {
    "id": "telegram:message3054",
    "level": "B1",
    "topic": "questions",
    "prompt": ".......the brothers has a different personality.",
    "options": [
      "All",
      "Both",
      "Each of"
    ],
    "answer": "Each of",
    "explanation": "Compare the grammar, meaning, and natural usage of each option. Answer: Each of.",
    "source": "telegram-english-courses",
    "sourceMessageId": "message3054",
    "sourceFile": "messages3.html",
    "answerReview": "independently-checked"
  },
  {
    "id": "telegram:message6722",
    "level": "B1",
    "topic": "conditionals",
    "prompt": "If I find the key I …………………….. it to you.",
    "options": [
      "will give",
      "would give",
      "would have given"
    ],
    "answer": "will give",
    "explanation": "Use the appropriate conditional tense for the hypothetical or real situation. Answer: will give.",
    "source": "telegram-english-courses",
    "sourceMessageId": "message6722",
    "sourceFile": "messages7.html",
    "answerReview": "independently-checked"
  },
  {
    "id": "telegram:message11607",
    "level": "B1",
    "topic": "questions",
    "prompt": "By this time next year, I ....... finished my degree.",
    "options": [
      "have",
      "will",
      "will have"
    ],
    "answer": "will have",
    "explanation": "Compare the grammar, meaning, and natural usage of each option. Answer: will have.",
    "source": "telegram-english-courses",
    "sourceMessageId": "message11607",
    "sourceFile": "messages11.html",
    "answerReview": "independently-checked"
  },
  {
    "id": "telegram:message16920",
    "level": "B1",
    "topic": "questions",
    "prompt": "5. Sima ________ the digital organization of our team's tasks already.",
    "options": [
      "have handled",
      "has handled",
      "handle",
      "was handle"
    ],
    "answer": "has handled",
    "explanation": "Compare the grammar, meaning, and natural usage of each option. Answer: has handled.",
    "source": "telegram-english-courses",
    "sourceMessageId": "message16920",
    "sourceFile": "messages17.html",
    "answerReview": "independently-checked"
  },
  {
    "id": "telegram:message17133",
    "level": "B2",
    "topic": "vocabulary",
    "prompt": "Which word means 'to grow or multiply rapidly'?",
    "options": [
      "Decrease",
      "Proliferate",
      "Shrink",
      "Stagnate"
    ],
    "answer": "Proliferate",
    "explanation": "Learn the expression and its meaning in context. Answer: Proliferate.",
    "source": "telegram-english-courses",
    "sourceMessageId": "message17133",
    "sourceFile": "messages17.html",
    "answerReview": "independently-checked"
  },
  {
    "id": "telegram:message11398",
    "level": "B1",
    "topic": "questions",
    "prompt": "Could you deal ________ this problem later, please?",
    "options": [
      "against",
      "with",
      "onto",
      "versus"
    ],
    "answer": "with",
    "explanation": "Compare the grammar, meaning, and natural usage of each option. Answer: with.",
    "source": "telegram-english-courses",
    "sourceMessageId": "message11398",
    "sourceFile": "messages11.html",
    "answerReview": "independently-checked"
  },
  {
    "id": "telegram:message17322",
    "level": "B1",
    "topic": "adjective-prepositions",
    "prompt": "Choose the correct preposition: She is very jealous ________ her best friend's success.",
    "options": [
      "from",
      "with",
      "of",
      "for"
    ],
    "answer": "of",
    "explanation": "Learn the collocation with its fixed preposition. Answer: of.",
    "source": "telegram-english-courses",
    "sourceMessageId": "message17322",
    "sourceFile": "messages17.html",
    "answerReview": "independently-checked"
  },
  {
    "id": "telegram:message12341",
    "level": "B1",
    "topic": "questions",
    "prompt": "What is the past tense of the regular verb \"walk\"?",
    "options": [
      "Walks",
      "Walked",
      "Walking",
      "Walk"
    ],
    "answer": "Walked",
    "explanation": "Compare the grammar, meaning, and natural usage of each option. Answer: Walked.",
    "source": "telegram-english-courses",
    "sourceMessageId": "message12341",
    "sourceFile": "messages12.html",
    "answerReview": "independently-checked"
  },
  {
    "id": "telegram:message3359",
    "level": "B1",
    "topic": "comparatives",
    "prompt": "Which is the corect comparative and superlative form of \"little\".",
    "options": [
      "littler, littlest",
      "less, least",
      "Both"
    ],
    "answer": "less, least",
    "explanation": "Compare the grammar, meaning, and natural usage of each option. Answer: less, least.",
    "source": "telegram-english-courses",
    "sourceMessageId": "message3359",
    "sourceFile": "messages3.html",
    "answerReview": "independently-checked"
  },
  {
    "id": "telegram:message6651",
    "level": "B1",
    "topic": "questions",
    "prompt": "1⃣The young girl drunk a glass of milk.",
    "options": [
      "Correct",
      "Incorrect"
    ],
    "answer": "Incorrect",
    "explanation": "Compare the grammar, meaning, and natural usage of each option. Answer: Incorrect.",
    "source": "telegram-english-courses",
    "sourceMessageId": "message6651",
    "sourceFile": "messages7.html",
    "answerReview": "independently-checked"
  },
  {
    "id": "telegram:message12462",
    "level": "B1",
    "topic": "questions",
    "prompt": "✅ I sent ___ some chocolate.",
    "options": [
      "she",
      "her",
      "her’s",
      "she’s"
    ],
    "answer": "her",
    "explanation": "Compare the grammar, meaning, and natural usage of each option. Answer: her.",
    "source": "telegram-english-courses",
    "sourceMessageId": "message12462",
    "sourceFile": "messages12.html",
    "answerReview": "independently-checked"
  },
  {
    "id": "telegram:message8727",
    "level": "B1",
    "topic": "questions",
    "prompt": "I .......... think we are going to win the match tonight.",
    "options": [
      "Strongly",
      "Honestly"
    ],
    "answer": "Honestly",
    "explanation": "Compare the grammar, meaning, and natural usage of each option. Answer: Honestly.",
    "source": "telegram-english-courses",
    "sourceMessageId": "message8727",
    "sourceFile": "messages9.html",
    "answerReview": "independently-checked"
  },
  {
    "id": "telegram:message8608",
    "level": "B1",
    "topic": "questions",
    "prompt": "At the peak of her .......... she was managing a sales force of 200 people.",
    "options": [
      "Work",
      "Career",
      "Job"
    ],
    "answer": "Career",
    "explanation": "Compare the grammar, meaning, and natural usage of each option. Answer: Career.",
    "source": "telegram-english-courses",
    "sourceMessageId": "message8608",
    "sourceFile": "messages9.html",
    "answerReview": "independently-checked"
  },
  {
    "id": "telegram:message17737",
    "level": "B2",
    "topic": "vocabulary",
    "prompt": "What does the idiom \"hit the books\" mean?",
    "options": [
      "To damage books",
      "To start studying hard",
      "To write a book",
      "To organize a library"
    ],
    "answer": "To start studying hard",
    "explanation": "Learn the expression and its meaning in context. Answer: To start studying hard.",
    "source": "telegram-english-courses",
    "sourceMessageId": "message17737",
    "sourceFile": "messages17.html",
    "answerReview": "independently-checked"
  },
  {
    "id": "telegram:message17218",
    "level": "B1",
    "topic": "questions",
    "prompt": "You ________ smoke inside the hospital. It is strictly forbidden.",
    "options": [
      "must",
      "should",
      "mustn't",
      "needn't"
    ],
    "answer": "mustn't",
    "explanation": "Compare the grammar, meaning, and natural usage of each option. Answer: mustn't.",
    "source": "telegram-english-courses",
    "sourceMessageId": "message17218",
    "sourceFile": "messages17.html",
    "answerReview": "independently-checked"
  },
  {
    "id": "telegram:message15589",
    "level": "B1",
    "topic": "passive",
    "prompt": "Which of the following sentences is in the passive voice?",
    "options": [
      "The dog chased the cat.",
      "The cat was chased by the dog.",
      "They are building a new house.",
      "She has written a letter."
    ],
    "answer": "The cat was chased by the dog.",
    "explanation": "The passive voice focuses on the person or thing receiving the action. Answer: The cat was chased by the dog..",
    "source": "telegram-english-courses",
    "sourceMessageId": "message15589",
    "sourceFile": "messages15.html",
    "answerReview": "independently-checked"
  },
  {
    "id": "telegram:message3866",
    "level": "B1",
    "topic": "present-perfect",
    "prompt": "I __________ him since 2016.",
    "options": [
      "a- know",
      "b- am knowing",
      "c- have known"
    ],
    "answer": "c- have known",
    "explanation": "Check whether the tense connects a past action with the present. Answer: c- have known.",
    "source": "telegram-english-courses",
    "sourceMessageId": "message3866",
    "sourceFile": "messages4.html",
    "answerReview": "independently-checked"
  },
  {
    "id": "telegram:message17238",
    "level": "B1",
    "topic": "questions",
    "prompt": "They are ________ for their final exams now.",
    "options": [
      "prepare",
      "prepared",
      "prepares",
      "preparing"
    ],
    "answer": "preparing",
    "explanation": "Compare the grammar, meaning, and natural usage of each option. Answer: preparing.",
    "source": "telegram-english-courses",
    "sourceMessageId": "message17238",
    "sourceFile": "messages17.html",
    "answerReview": "independently-checked"
  },
  {
    "id": "telegram:message15866",
    "level": "B1",
    "topic": "conditionals",
    "prompt": "If someone is in a \"good mood\", they feel:",
    "options": [
      "Sad",
      "Happy",
      "Tired",
      "Angry"
    ],
    "answer": "Happy",
    "explanation": "Use the appropriate conditional tense for the hypothetical or real situation. Answer: Happy.",
    "source": "telegram-english-courses",
    "sourceMessageId": "message15866",
    "sourceFile": "messages16.html",
    "answerReview": "independently-checked"
  },
  {
    "id": "telegram:message17759",
    "level": "B2",
    "topic": "questions",
    "prompt": "An official printed record of a student's university grades is called a _____.",
    "options": [
      "certificate",
      "transcript",
      "diploma",
      "resume"
    ],
    "answer": "transcript",
    "explanation": "Compare the grammar, meaning, and natural usage of each option. Answer: transcript.",
    "source": "telegram-english-courses",
    "sourceMessageId": "message17759",
    "sourceFile": "messages17.html",
    "answerReview": "independently-checked"
  },
  {
    "id": "telegram:message16855",
    "level": "B2",
    "topic": "vocabulary",
    "prompt": "Select the correct phrasal verb or expression related to temperature change: \"After the thunderstorm, the temperature finally started to __, making the evening very pleasant.\"",
    "options": [
      "cool off",
      "rain later",
      "get really cold",
      "look nice"
    ],
    "answer": "cool off",
    "explanation": "Learn the expression and its meaning in context. Answer: cool off.",
    "source": "telegram-english-courses",
    "sourceMessageId": "message16855",
    "sourceFile": "messages17.html",
    "answerReview": "independently-checked"
  },
  {
    "id": "telegram:message17410",
    "level": "B2",
    "topic": "questions",
    "prompt": "When you have the same opinion as someone else, you see ________.",
    "options": [
      "face to face",
      "eye to eye",
      "head to head",
      "mind to mind"
    ],
    "answer": "eye to eye",
    "explanation": "Compare the grammar, meaning, and natural usage of each option. Answer: eye to eye.",
    "source": "telegram-english-courses",
    "sourceMessageId": "message17410",
    "sourceFile": "messages17.html",
    "answerReview": "independently-checked"
  },
  {
    "id": "telegram:message17722",
    "level": "B2",
    "topic": "vocabulary",
    "prompt": "What does the idiom \"a piece of cake\" mean?",
    "options": [
      "A delicious dessert",
      "Something very easy",
      "A difficult task",
      "A part of a problem"
    ],
    "answer": "Something very easy",
    "explanation": "Learn the expression and its meaning in context. Answer: Something very easy.",
    "source": "telegram-english-courses",
    "sourceMessageId": "message17722",
    "sourceFile": "messages17.html",
    "answerReview": "independently-checked"
  },
  {
    "id": "telegram:message15582",
    "level": "B1",
    "topic": "questions",
    "prompt": "Choose the correct form of the verb to complete the sentence: > She ___ (go) to the market yesterday.",
    "options": [
      "goes",
      "is going",
      "went",
      "has gone"
    ],
    "answer": "went",
    "explanation": "Compare the grammar, meaning, and natural usage of each option. Answer: went.",
    "source": "telegram-english-courses",
    "sourceMessageId": "message15582",
    "sourceFile": "messages15.html",
    "answerReview": "independently-checked"
  },
  {
    "id": "telegram:message3316",
    "level": "B2",
    "topic": "questions",
    "prompt": "WHICH ONE IS INCORRECT?",
    "options": [
      "She said that she was happy.",
      "She told me that she was happy.",
      "She said me that she was happy."
    ],
    "answer": "She said me that she was happy.",
    "explanation": "Compare the grammar, meaning, and natural usage of each option. Answer: She said me that she was happy..",
    "source": "telegram-english-courses",
    "sourceMessageId": "message3316",
    "sourceFile": "messages3.html",
    "answerReview": "independently-checked"
  },
  {
    "id": "telegram:message16852",
    "level": "B2",
    "topic": "present-perfect",
    "prompt": "Which phrase best expresses strong agreement in this context? Speaker A: \"The weather this week has been completely unpredictable.\" Speaker B: \"__! I never know whether to carry an umbrella or wear sunglasses.\"",
    "options": [
      "I wish",
      "That wouldn't seem right",
      "Exactly",
      "It shouldn't be"
    ],
    "answer": "Exactly",
    "explanation": "Check whether the tense connects a past action with the present. Answer: Exactly.",
    "source": "telegram-english-courses",
    "sourceMessageId": "message16852",
    "sourceFile": "messages17.html",
    "answerReview": "independently-checked"
  },
  {
    "id": "telegram:message12175",
    "level": "B1",
    "topic": "questions",
    "prompt": "We have to ...... this point at the meeting tomorrow.",
    "options": [
      "Rise",
      "Raise",
      "Arouse",
      "يا عم ايه اللخبطة دي 😰 مش هروح الاجتماع"
    ],
    "answer": "Raise",
    "explanation": "Compare the grammar, meaning, and natural usage of each option. Answer: Raise.",
    "source": "telegram-english-courses",
    "sourceMessageId": "message12175",
    "sourceFile": "messages12.html",
    "answerReview": "independently-checked"
  },
  {
    "id": "telegram:message17185",
    "level": "B2",
    "topic": "questions",
    "prompt": "Which option is the most professional way to ask for an update?",
    "options": [
      "Why haven't you finished yet?",
      "Could you please provide a brief update on the project status?",
      "Give me the updates now.",
      "Is the work done or what?"
    ],
    "answer": "Could you please provide a brief update on the project status?",
    "explanation": "Compare the grammar, meaning, and natural usage of each option. Answer: Could you please provide a brief update on the project status?.",
    "source": "telegram-english-courses",
    "sourceMessageId": "message17185",
    "sourceFile": "messages17.html",
    "answerReview": "independently-checked"
  },
  {
    "id": "telegram:message17169",
    "level": "B2",
    "topic": "questions",
    "prompt": "Choose the sentence with the correct punctuation:",
    "options": [
      "Wow that is a beautiful building.",
      "Wow, that is a beautiful building!",
      "Wow! that is a beautiful building",
      "Wow that, is a beautiful building."
    ],
    "answer": "Wow, that is a beautiful building!",
    "explanation": "Compare the grammar, meaning, and natural usage of each option. Answer: Wow, that is a beautiful building!.",
    "source": "telegram-english-courses",
    "sourceMessageId": "message17169",
    "sourceFile": "messages17.html",
    "answerReview": "independently-checked"
  },
  {
    "id": "telegram:message12343",
    "level": "B1",
    "topic": "present-perfect",
    "prompt": "Fill in the blank with the correct form of \"good\": \"This is the ___ movie I have ever seen.\"",
    "options": [
      "good",
      "better",
      "best",
      "well"
    ],
    "answer": "best",
    "explanation": "Check whether the tense connects a past action with the present. Answer: best.",
    "source": "telegram-english-courses",
    "sourceMessageId": "message12343",
    "sourceFile": "messages12.html",
    "answerReview": "independently-checked"
  },
  {
    "id": "telegram:message17656",
    "level": "B2",
    "topic": "conditionals",
    "prompt": "If I _____ the university dean, I would reduce the tuition fees.",
    "options": [
      "am",
      "was",
      "were",
      "had been"
    ],
    "answer": "were",
    "explanation": "Use the appropriate conditional tense for the hypothetical or real situation. Answer: were.",
    "source": "telegram-english-courses",
    "sourceMessageId": "message17656",
    "sourceFile": "messages17.html",
    "answerReview": "independently-checked"
  },
  {
    "id": "telegram:message16989",
    "level": "B2",
    "topic": "conditionals",
    "prompt": "If I _____ you, I would apply for that job immediately.",
    "options": [
      "am",
      "was",
      "were",
      "be"
    ],
    "answer": "were",
    "explanation": "Use the appropriate conditional tense for the hypothetical or real situation. Answer: were.",
    "source": "telegram-english-courses",
    "sourceMessageId": "message16989",
    "sourceFile": "messages17.html",
    "answerReview": "independently-checked"
  },
  {
    "id": "telegram:message16917",
    "level": "B1",
    "topic": "present-perfect",
    "prompt": "2. Hera ________ the administrative tasks efficiently since the beginning of the month.",
    "options": [
      "have managed",
      "has managed",
      "managed",
      "manages"
    ],
    "answer": "has managed",
    "explanation": "Check whether the tense connects a past action with the present. Answer: has managed.",
    "source": "telegram-english-courses",
    "sourceMessageId": "message16917",
    "sourceFile": "messages17.html",
    "answerReview": "independently-checked"
  },
  {
    "id": "telegram:message8939",
    "level": "B1",
    "topic": "present-perfect",
    "prompt": "I have been studying English",
    "options": [
      "Present simple",
      "Past continuous",
      "Present perfect continuous"
    ],
    "answer": "Present perfect continuous",
    "explanation": "Check whether the tense connects a past action with the present. Answer: Present perfect continuous.",
    "source": "telegram-english-courses",
    "sourceMessageId": "message8939",
    "sourceFile": "messages9.html",
    "answerReview": "independently-checked"
  },
  {
    "id": "telegram:message17217",
    "level": "B2",
    "topic": "questions",
    "prompt": "Which sentence is grammatically correct regarding order of adjectives?",
    "options": [
      "He bought a beautiful black leather jacket.",
      "He bought a leather black beautiful jacket.",
      "He bought a black beautiful leather jacket.",
      "He bought a beautiful leather black jacket."
    ],
    "answer": "He bought a beautiful black leather jacket.",
    "explanation": "Compare the grammar, meaning, and natural usage of each option. Answer: He bought a beautiful black leather jacket..",
    "source": "telegram-english-courses",
    "sourceMessageId": "message17217",
    "sourceFile": "messages17.html",
    "answerReview": "independently-checked"
  },
  {
    "id": "telegram:message3358",
    "level": "B1",
    "topic": "questions",
    "prompt": "Which is another way to say \"wait\"?",
    "options": [
      "join in",
      "give up",
      "hold on"
    ],
    "answer": "hold on",
    "explanation": "Compare the grammar, meaning, and natural usage of each option. Answer: hold on.",
    "source": "telegram-english-courses",
    "sourceMessageId": "message3358",
    "sourceFile": "messages3.html",
    "answerReview": "independently-checked"
  },
  {
    "id": "telegram:message16960",
    "level": "B1",
    "topic": "questions",
    "prompt": "Q6. What should you say to someone who made a great effort but unfortunately failed?",
    "options": [
      "Keep up the good work!",
      "That was a nice try.",
      "You’re on the right track."
    ],
    "answer": "That was a nice try.",
    "explanation": "Compare the grammar, meaning, and natural usage of each option. Answer: That was a nice try..",
    "source": "telegram-english-courses",
    "sourceMessageId": "message16960",
    "sourceFile": "messages17.html",
    "answerReview": "independently-checked"
  },
  {
    "id": "telegram:message8617",
    "level": "B1",
    "topic": "questions",
    "prompt": "Phone me when you .................... time.",
    "options": [
      "would have",
      "will have",
      "have"
    ],
    "answer": "have",
    "explanation": "Compare the grammar, meaning, and natural usage of each option. Answer: have.",
    "source": "telegram-english-courses",
    "sourceMessageId": "message8617",
    "sourceFile": "messages9.html",
    "answerReview": "independently-checked"
  },
  {
    "id": "telegram:message17178",
    "level": "B2",
    "topic": "questions",
    "prompt": "Choose the correct option: \"Neither the manager nor the employees ________ present.\"",
    "options": [
      "was",
      "were",
      "is",
      "am"
    ],
    "answer": "were",
    "explanation": "Compare the grammar, meaning, and natural usage of each option. Answer: were.",
    "source": "telegram-english-courses",
    "sourceMessageId": "message17178",
    "sourceFile": "messages17.html",
    "answerReview": "independently-checked"
  },
  {
    "id": "telegram:message17516",
    "level": "B2",
    "topic": "questions",
    "prompt": "Choose the grammatically CORRECT sentence:",
    "options": [
      "She is a good friend of me.",
      "She is a good friend of mine.",
      "She is a good friend to my.",
      "She is a good friend mine."
    ],
    "answer": "She is a good friend of mine.",
    "explanation": "Compare the grammar, meaning, and natural usage of each option. Answer: She is a good friend of mine..",
    "source": "telegram-english-courses",
    "sourceMessageId": "message17516",
    "sourceFile": "messages17.html",
    "answerReview": "independently-checked"
  },
  {
    "id": "telegram:message17305",
    "level": "B2",
    "topic": "vocabulary",
    "prompt": "To \"stand someone up\" means to ________.",
    "options": [
      "support someone",
      "help someone stand",
      "fail to meet someone for an appointment",
      "applaud someone"
    ],
    "answer": "fail to meet someone for an appointment",
    "explanation": "Learn the expression and its meaning in context. Answer: fail to meet someone for an appointment.",
    "source": "telegram-english-courses",
    "sourceMessageId": "message17305",
    "sourceFile": "messages17.html",
    "answerReview": "independently-checked"
  },
  {
    "id": "telegram:message16854",
    "level": "B2",
    "topic": "vocabulary",
    "prompt": "Choose the best word to describe an unexpected weather situation: \"It’s snowing in the middle of April! Considering the season, that __ be happening.\"",
    "options": [
      "wouldn't",
      "shouldn't",
      "won't",
      "hasn't"
    ],
    "answer": "shouldn't",
    "explanation": "Learn the expression and its meaning in context. Answer: shouldn't.",
    "source": "telegram-english-courses",
    "sourceMessageId": "message16854",
    "sourceFile": "messages17.html",
    "answerReview": "independently-checked"
  },
  {
    "id": "telegram:message17607",
    "level": "B1",
    "topic": "questions",
    "prompt": "I'll ________ you up from the airport when you arrive.",
    "options": [
      "take",
      "pick",
      "bring",
      "get"
    ],
    "answer": "pick",
    "explanation": "Compare the grammar, meaning, and natural usage of each option. Answer: pick.",
    "source": "telegram-english-courses",
    "sourceMessageId": "message17607",
    "sourceFile": "messages17.html",
    "answerReview": "independently-checked"
  },
  {
    "id": "telegram:message15591",
    "level": "B1",
    "topic": "present-perfect",
    "prompt": "Identify the correct form of the verb in the present perfect tense: > They ___ (live) here for ten years.",
    "options": [
      "live",
      "lived",
      "Have lived",
      "are living"
    ],
    "answer": "Have lived",
    "explanation": "Check whether the tense connects a past action with the present. Answer: Have lived.",
    "source": "telegram-english-courses",
    "sourceMessageId": "message15591",
    "sourceFile": "messages15.html",
    "answerReview": "independently-checked"
  },
  {
    "id": "telegram:message16985",
    "level": "B1",
    "topic": "present-perfect",
    "prompt": "I _____ him since we were in high school.",
    "options": [
      "know",
      "knew",
      "have known",
      "am knowing"
    ],
    "answer": "have known",
    "explanation": "Check whether the tense connects a past action with the present. Answer: have known.",
    "source": "telegram-english-courses",
    "sourceMessageId": "message16985",
    "sourceFile": "messages17.html",
    "answerReview": "independently-checked"
  },
  {
    "id": "telegram:message17152",
    "level": "B1",
    "topic": "questions",
    "prompt": "I would rather ________ at home tonight than go out.",
    "options": [
      "stay",
      "to stay",
      "staying",
      "stayed"
    ],
    "answer": "stay",
    "explanation": "Compare the grammar, meaning, and natural usage of each option. Answer: stay.",
    "source": "telegram-english-courses",
    "sourceMessageId": "message17152",
    "sourceFile": "messages17.html",
    "answerReview": "independently-checked"
  },
  {
    "id": "telegram:message9660",
    "level": "B1",
    "topic": "questions",
    "prompt": "Would you . . . . . . . the window?",
    "options": [
      "close",
      "to close",
      "closed",
      "closing"
    ],
    "answer": "close",
    "explanation": "Compare the grammar, meaning, and natural usage of each option. Answer: close.",
    "source": "telegram-english-courses",
    "sourceMessageId": "message9660",
    "sourceFile": "messages10.html",
    "answerReview": "independently-checked"
  },
  {
    "id": "telegram:message16853",
    "level": "B2",
    "topic": "conditionals",
    "prompt": "Complete the sentence using the correct form for a hypothetical wish: \"The heatwave has lasted for ten days now. I __ it would cool off so we could enjoy the weekend.\"",
    "options": [
      "hope",
      "want",
      "wish",
      "think"
    ],
    "answer": "wish",
    "explanation": "Use the appropriate conditional tense for the hypothetical or real situation. Answer: wish.",
    "source": "telegram-english-courses",
    "sourceMessageId": "message16853",
    "sourceFile": "messages17.html",
    "answerReview": "independently-checked"
  },
  {
    "id": "telegram:message17182",
    "level": "B2",
    "topic": "questions",
    "prompt": "The project was completed on time ________ the limited budget.",
    "options": [
      "because",
      "due to",
      "although",
      "despite"
    ],
    "answer": "despite",
    "explanation": "Compare the grammar, meaning, and natural usage of each option. Answer: despite.",
    "source": "telegram-english-courses",
    "sourceMessageId": "message17182",
    "sourceFile": "messages17.html",
    "answerReview": "independently-checked"
  },
  {
    "id": "telegram:message6731",
    "level": "B1",
    "topic": "conditionals",
    "prompt": "If you ……………………… hard, you would get the first rank.",
    "options": [
      "study",
      "studied",
      "had studied"
    ],
    "answer": "studied",
    "explanation": "Use the appropriate conditional tense for the hypothetical or real situation. Answer: studied.",
    "source": "telegram-english-courses",
    "sourceMessageId": "message6731",
    "sourceFile": "messages7.html",
    "answerReview": "independently-checked"
  },
  {
    "id": "telegram:message17225",
    "level": "B1",
    "topic": "questions",
    "prompt": "She speaks English ________; you would think it's her native language.",
    "options": [
      "fluent",
      "fluently",
      "fluency",
      "more fluent"
    ],
    "answer": "fluently",
    "explanation": "Compare the grammar, meaning, and natural usage of each option. Answer: fluently.",
    "source": "telegram-english-courses",
    "sourceMessageId": "message17225",
    "sourceFile": "messages17.html",
    "answerReview": "independently-checked"
  },
  {
    "id": "telegram:message17261",
    "level": "B1",
    "topic": "vocabulary",
    "prompt": "Which word is spelled CORRECTLY?",
    "options": [
      "Dictionery",
      "Dictionry",
      "Dictionary",
      "Dictionari"
    ],
    "answer": "Dictionary",
    "explanation": "Learn the expression and its meaning in context. Answer: Dictionary.",
    "source": "telegram-english-courses",
    "sourceMessageId": "message17261",
    "sourceFile": "messages17.html",
    "answerReview": "independently-checked"
  },
  {
    "id": "telegram:message11936",
    "level": "B1",
    "topic": "conditionals",
    "prompt": "If I ...... money, I (would) help you ☹",
    "options": [
      "have",
      "had",
      "having"
    ],
    "answer": "had",
    "explanation": "Use the appropriate conditional tense for the hypothetical or real situation. Answer: had.",
    "source": "telegram-english-courses",
    "sourceMessageId": "message11936",
    "sourceFile": "messages12.html",
    "answerReview": "independently-checked"
  },
  {
    "id": "telegram:message17203",
    "level": "B1",
    "topic": "passive",
    "prompt": "Which sentence is written in the passive voice?",
    "options": [
      "The team launched the new application yesterday.",
      "The new application was launched by the team yesterday.",
      "The team is launching the application now.",
      "The team will launch the application tomorrow."
    ],
    "answer": "The new application was launched by the team yesterday.",
    "explanation": "The passive voice focuses on the person or thing receiving the action. Answer: The new application was launched by the team yesterday..",
    "source": "telegram-english-courses",
    "sourceMessageId": "message17203",
    "sourceFile": "messages17.html",
    "answerReview": "independently-checked"
  },
  {
    "id": "telegram:message6948",
    "level": "B1",
    "topic": "conditionals",
    "prompt": "If you ………………………. non-stop, your health will suffer.",
    "options": [
      "work",
      "worked",
      "had worked"
    ],
    "answer": "work",
    "explanation": "Use the appropriate conditional tense for the hypothetical or real situation. Answer: work.",
    "source": "telegram-english-courses",
    "sourceMessageId": "message6948",
    "sourceFile": "messages7.html",
    "answerReview": "independently-checked"
  },
  {
    "id": "telegram:message15864",
    "level": "B1",
    "topic": "conditionals",
    "prompt": "If the weather is \"mild\", it means:",
    "options": [
      "Very hot",
      "Very cold",
      "Not too hot or cold",
      "Windy and rainy"
    ],
    "answer": "Not too hot or cold",
    "explanation": "Use the appropriate conditional tense for the hypothetical or real situation. Answer: Not too hot or cold.",
    "source": "telegram-english-courses",
    "sourceMessageId": "message15864",
    "sourceFile": "messages16.html",
    "answerReview": "independently-checked"
  },
  {
    "id": "telegram:message6937",
    "level": "B1",
    "topic": "conditionals",
    "prompt": "If you ……………………….. that dog alone, it wouldn’t have bitten you.",
    "options": [
      "leave",
      "had left",
      "left"
    ],
    "answer": "had left",
    "explanation": "Use the appropriate conditional tense for the hypothetical or real situation. Answer: had left.",
    "source": "telegram-english-courses",
    "sourceMessageId": "message6937",
    "sourceFile": "messages7.html",
    "answerReview": "independently-checked"
  },
  {
    "id": "telegram:message12424",
    "level": "B1",
    "topic": "questions",
    "prompt": "✅ Choose the correct question",
    "options": [
      "How much it costs?",
      "How much costs it?",
      "How much does it cost?"
    ],
    "answer": "How much does it cost?",
    "explanation": "Compare the grammar, meaning, and natural usage of each option. Answer: How much does it cost?.",
    "source": "telegram-english-courses",
    "sourceMessageId": "message12424",
    "sourceFile": "messages12.html",
    "answerReview": "independently-checked"
  },
  {
    "id": "telegram:message2961",
    "level": "B1",
    "topic": "questions",
    "prompt": "Which of the following sentences is punctuated correctly?",
    "options": [
      "The bookstore had to move its collection of children’s books.",
      "The bookstore had to move it’s collection of childrens’ books.",
      "The bookstore had to move its’ collection of children’s books.",
      "The bookstore had to move its’ collectionof childrens’ books."
    ],
    "answer": "The bookstore had to move its collection of children’s books.",
    "explanation": "Compare the grammar, meaning, and natural usage of each option. Answer: The bookstore had to move its collection of children’s books..",
    "source": "telegram-english-courses",
    "sourceMessageId": "message2961",
    "sourceFile": "messages3.html",
    "answerReview": "independently-checked"
  },
  {
    "id": "telegram:message17163",
    "level": "B1",
    "topic": "conditionals",
    "prompt": "If it rains tomorrow, we ________ the football match.",
    "options": [
      "cancel",
      "will cancel",
      "canceled",
      "would cancel"
    ],
    "answer": "will cancel",
    "explanation": "Use the appropriate conditional tense for the hypothetical or real situation. Answer: will cancel.",
    "source": "telegram-english-courses",
    "sourceMessageId": "message17163",
    "sourceFile": "messages17.html",
    "answerReview": "independently-checked"
  },
  {
    "id": "telegram:message17673",
    "level": "B2",
    "topic": "questions",
    "prompt": "_____ having technical issues, the webinar was highly successful.",
    "options": [
      "Although",
      "In spite",
      "Despite",
      "Even though"
    ],
    "answer": "Despite",
    "explanation": "Compare the grammar, meaning, and natural usage of each option. Answer: Despite.",
    "source": "telegram-english-courses",
    "sourceMessageId": "message17673",
    "sourceFile": "messages17.html",
    "answerReview": "independently-checked"
  },
  {
    "id": "telegram:message6794",
    "level": "B1",
    "topic": "questions",
    "prompt": "8) Could you give me some sort of _______ ?",
    "options": [
      "deal",
      "haggle",
      "haggling"
    ],
    "answer": "deal",
    "explanation": "Compare the grammar, meaning, and natural usage of each option. Answer: deal.",
    "source": "telegram-english-courses",
    "sourceMessageId": "message6794",
    "sourceFile": "messages7.html",
    "answerReview": "independently-checked"
  },
  {
    "id": "telegram:message12492",
    "level": "B2",
    "topic": "vocabulary",
    "prompt": "The word «Toss» is closest in meaning to ____________ . (B2)",
    "options": [
      "Fall",
      "Find",
      "Throw",
      "Bury"
    ],
    "answer": "Throw",
    "explanation": "Learn the expression and its meaning in context. Answer: Throw.",
    "source": "telegram-english-courses",
    "sourceMessageId": "message12492",
    "sourceFile": "messages12.html",
    "answerReview": "independently-checked"
  },
  {
    "id": "telegram:message12342",
    "level": "B1",
    "topic": "questions",
    "prompt": "Choose the sentence that is a question:",
    "options": [
      "She likes ice cream.",
      "Does she like ice cream?",
      "She is liking ice cream.",
      "She liked ice cream."
    ],
    "answer": "Does she like ice cream?",
    "explanation": "Compare the grammar, meaning, and natural usage of each option. Answer: Does she like ice cream?.",
    "source": "telegram-english-courses",
    "sourceMessageId": "message12342",
    "sourceFile": "messages12.html",
    "answerReview": "independently-checked"
  },
  {
    "id": "telegram:message17006",
    "level": "B1",
    "topic": "questions",
    "prompt": "\"We ________ football when it started to rain.\"",
    "options": [
      "were playing",
      "are playing",
      "played",
      "was playing"
    ],
    "answer": "were playing",
    "explanation": "Compare the grammar, meaning, and natural usage of each option. Answer: were playing.",
    "source": "telegram-english-courses",
    "sourceMessageId": "message17006",
    "sourceFile": "messages17.html",
    "answerReview": "independently-checked"
  },
  {
    "id": "telegram:message11609",
    "level": "B1",
    "topic": "conditionals",
    "prompt": "If I win the lottery, I ..... around the world.",
    "options": [
      "have traveled",
      "will travel",
      "travel"
    ],
    "answer": "will travel",
    "explanation": "Use the appropriate conditional tense for the hypothetical or real situation. Answer: will travel.",
    "source": "telegram-english-courses",
    "sourceMessageId": "message11609",
    "sourceFile": "messages11.html",
    "answerReview": "independently-checked"
  },
  {
    "id": "telegram:message11393",
    "level": "B1",
    "topic": "present-perfect",
    "prompt": "— John, have you ever _____ to Hawaii? — Yes. I _____ there five years ago.",
    "options": [
      "been, went",
      "went, 've gone",
      "be, went",
      "were, were"
    ],
    "answer": "been, went",
    "explanation": "Check whether the tense connects a past action with the present. Answer: been, went.",
    "source": "telegram-english-courses",
    "sourceMessageId": "message11393",
    "sourceFile": "messages11.html",
    "answerReview": "independently-checked"
  },
  {
    "id": "telegram:message11934",
    "level": "B1",
    "topic": "conditionals",
    "prompt": "If I ........ early, I (would) wake up early ☀️",
    "options": [
      "sleep",
      "slept",
      "sleeping"
    ],
    "answer": "slept",
    "explanation": "Use the appropriate conditional tense for the hypothetical or real situation. Answer: slept.",
    "source": "telegram-english-courses",
    "sourceMessageId": "message11934",
    "sourceFile": "messages12.html",
    "answerReview": "independently-checked"
  },
  {
    "id": "telegram:message16955",
    "level": "B1",
    "topic": "vocabulary",
    "prompt": "Q1. Which phrase is considered an informal way to say \"I don't know\"?",
    "options": [
      "I have no idea.",
      "Beats me.",
      "I’m not really sure."
    ],
    "answer": "Beats me.",
    "explanation": "Learn the expression and its meaning in context. Answer: Beats me..",
    "source": "telegram-english-courses",
    "sourceMessageId": "message16955",
    "sourceFile": "messages17.html",
    "answerReview": "independently-checked"
  },
  {
    "id": "telegram:message10946",
    "level": "B1",
    "topic": "present-perfect",
    "prompt": "④▸ Have you ever ..... a car🚗.",
    "options": [
      "drive",
      "drove",
      "driven"
    ],
    "answer": "driven",
    "explanation": "Check whether the tense connects a past action with the present. Answer: driven.",
    "source": "telegram-english-courses",
    "sourceMessageId": "message10946",
    "sourceFile": "messages11.html",
    "answerReview": "independently-checked"
  },
  {
    "id": "telegram:message17801",
    "level": "B2",
    "topic": "vocabulary",
    "prompt": "\"To learn the ropes\" is an idiom that means:",
    "options": [
      "To climb a mountain",
      "To understand how to do a particular job or task",
      "To tie things together",
      "To fail a test"
    ],
    "answer": "To understand how to do a particular job or task",
    "explanation": "Learn the expression and its meaning in context. Answer: To understand how to do a particular job or task.",
    "source": "telegram-english-courses",
    "sourceMessageId": "message17801",
    "sourceFile": "messages17.html",
    "answerReview": "independently-checked"
  },
  {
    "id": "telegram:message11933",
    "level": "B1",
    "topic": "conditionals",
    "prompt": "If I ....... early, I (will) wake up early ☀️",
    "options": [
      "sleep",
      "slept",
      "sleeping"
    ],
    "answer": "sleep",
    "explanation": "Use the appropriate conditional tense for the hypothetical or real situation. Answer: sleep.",
    "source": "telegram-english-courses",
    "sourceMessageId": "message11933",
    "sourceFile": "messages12.html",
    "answerReview": "independently-checked"
  },
  {
    "id": "telegram:message17153",
    "level": "B2",
    "topic": "questions",
    "prompt": "Which sentence is correct?",
    "options": [
      "There is too many traffic on the highway.",
      "There is too much traffic on the highway.",
      "There are too much traffic on the highway.",
      "There are too many traffic on the highway."
    ],
    "answer": "There is too much traffic on the highway.",
    "explanation": "Compare the grammar, meaning, and natural usage of each option. Answer: There is too much traffic on the highway..",
    "source": "telegram-english-courses",
    "sourceMessageId": "message17153",
    "sourceFile": "messages17.html",
    "answerReview": "independently-checked"
  },
  {
    "id": "telegram:message17762",
    "level": "B1",
    "topic": "questions",
    "prompt": "The students were working on their assignments when the internet _____ down.",
    "options": [
      "goes",
      "was going",
      "went",
      "had gone"
    ],
    "answer": "went",
    "explanation": "Compare the grammar, meaning, and natural usage of each option. Answer: went.",
    "source": "telegram-english-courses",
    "sourceMessageId": "message17762",
    "sourceFile": "messages17.html",
    "answerReview": "independently-checked"
  },
  {
    "id": "telegram:message17084",
    "level": "B1",
    "topic": "questions",
    "prompt": "Could you please pass me ________ water?",
    "options": [
      "a",
      "an",
      "any",
      "some"
    ],
    "answer": "some",
    "explanation": "Compare the grammar, meaning, and natural usage of each option. Answer: some.",
    "source": "telegram-english-courses",
    "sourceMessageId": "message17084",
    "sourceFile": "messages17.html",
    "answerReview": "independently-checked"
  },
  {
    "id": "telegram:message17635",
    "level": "B2",
    "topic": "conditionals",
    "prompt": "If a student \"passes with flying colors\", it means they passed the exam _____.",
    "options": [
      "with exceptionally high marks",
      "by cheating",
      "barely passing",
      "failing completely"
    ],
    "answer": "with exceptionally high marks",
    "explanation": "Use the appropriate conditional tense for the hypothetical or real situation. Answer: with exceptionally high marks.",
    "source": "telegram-english-courses",
    "sourceMessageId": "message17635",
    "sourceFile": "messages17.html",
    "answerReview": "independently-checked"
  },
  {
    "id": "telegram:message6751",
    "level": "B1",
    "topic": "conditionals",
    "prompt": "If she finds out we ………………………. in trouble.",
    "options": [
      "will be",
      "would be",
      "would have been"
    ],
    "answer": "will be",
    "explanation": "Use the appropriate conditional tense for the hypothetical or real situation. Answer: will be.",
    "source": "telegram-english-courses",
    "sourceMessageId": "message6751",
    "sourceFile": "messages7.html",
    "answerReview": "independently-checked"
  },
  {
    "id": "telegram:message17132",
    "level": "B2",
    "topic": "questions",
    "prompt": "Which option is the most polite way to disagree in a meeting?",
    "options": [
      "You are totally wrong.",
      "I strongly disagree with that.",
      "I see your point, but I have a different view.",
      "That makes no sense."
    ],
    "answer": "I see your point, but I have a different view.",
    "explanation": "Compare the grammar, meaning, and natural usage of each option. Answer: I see your point, but I have a different view..",
    "source": "telegram-english-courses",
    "sourceMessageId": "message17132",
    "sourceFile": "messages17.html",
    "answerReview": "independently-checked"
  },
  {
    "id": "telegram:message17227",
    "level": "B2",
    "topic": "questions",
    "prompt": "Which sentence is best for setting up an interview via email?",
    "options": [
      "Come tomorrow for an interview.",
      "We would like to invite you for an interview to discuss your application.",
      "I want to see you tomorrow.",
      "Be there at 10 AM for the interview."
    ],
    "answer": "We would like to invite you for an interview to discuss your application.",
    "explanation": "Compare the grammar, meaning, and natural usage of each option. Answer: We would like to invite you for an interview to discuss your application..",
    "source": "telegram-english-courses",
    "sourceMessageId": "message17227",
    "sourceFile": "messages17.html",
    "answerReview": "independently-checked"
  },
  {
    "id": "telegram:message6788",
    "level": "B1",
    "topic": "questions",
    "prompt": "2) Could you ____ me your pen, please?",
    "options": [
      "lend",
      "make",
      "borrow"
    ],
    "answer": "lend",
    "explanation": "Compare the grammar, meaning, and natural usage of each option. Answer: lend.",
    "source": "telegram-english-courses",
    "sourceMessageId": "message6788",
    "sourceFile": "messages7.html",
    "answerReview": "independently-checked"
  },
  {
    "id": "telegram:message17424",
    "level": "B2",
    "topic": "conditionals",
    "prompt": "If I ________ you were sick, I would have visited you in the hospital.",
    "options": [
      "know",
      "knew",
      "had known",
      "have known"
    ],
    "answer": "had known",
    "explanation": "Use the appropriate conditional tense for the hypothetical or real situation. Answer: had known.",
    "source": "telegram-english-courses",
    "sourceMessageId": "message17424",
    "sourceFile": "messages17.html",
    "answerReview": "independently-checked"
  },
  {
    "id": "telegram:message12501",
    "level": "B1",
    "topic": "questions",
    "prompt": "You have to take _ of your younger brother. (A2)",
    "options": [
      "look after",
      "care",
      "watch",
      "know"
    ],
    "answer": "care",
    "explanation": "Compare the grammar, meaning, and natural usage of each option. Answer: care.",
    "source": "telegram-english-courses",
    "sourceMessageId": "message12501",
    "sourceFile": "messages12.html",
    "answerReview": "independently-checked"
  },
  {
    "id": "telegram:message3046",
    "level": "B2",
    "topic": "questions",
    "prompt": "Some plastics are designed to ......when their useful life is over.",
    "options": [
      "die out",
      "dehydrate",
      "biodegrade"
    ],
    "answer": "biodegrade",
    "explanation": "Compare the grammar, meaning, and natural usage of each option. Answer: biodegrade.",
    "source": "telegram-english-courses",
    "sourceMessageId": "message3046",
    "sourceFile": "messages3.html",
    "answerReview": "independently-checked"
  },
  {
    "id": "telegram:message15585",
    "level": "B1",
    "topic": "questions",
    "prompt": "Which of the following is a countable noun?",
    "options": [
      "Water",
      "Sand",
      "Idea",
      "information"
    ],
    "answer": "Idea",
    "explanation": "Compare the grammar, meaning, and natural usage of each option. Answer: Idea.",
    "source": "telegram-english-courses",
    "sourceMessageId": "message15585",
    "sourceFile": "messages15.html",
    "answerReview": "independently-checked"
  },
  {
    "id": "telegram:message2897",
    "level": "B1",
    "topic": "questions",
    "prompt": "I'll have finished doing my homework......9o'clock PM tomorrow",
    "options": [
      "by",
      "at",
      "for",
      "On"
    ],
    "answer": "by",
    "explanation": "Compare the grammar, meaning, and natural usage of each option. Answer: by.",
    "source": "telegram-english-courses",
    "sourceMessageId": "message2897",
    "sourceFile": "messages3.html",
    "answerReview": "independently-checked"
  },
  {
    "id": "telegram:message17665",
    "level": "B1",
    "topic": "conditionals",
    "prompt": "If I _____ you, I would apply for that job.",
    "options": [
      "am",
      "was",
      "were",
      "had been"
    ],
    "answer": "were",
    "explanation": "Use the appropriate conditional tense for the hypothetical or real situation. Answer: were.",
    "source": "telegram-english-courses",
    "sourceMessageId": "message17665",
    "sourceFile": "messages17.html",
    "answerReview": "independently-checked"
  },
  {
    "id": "telegram:message17076",
    "level": "B1",
    "topic": "questions",
    "prompt": "I have ___ my homework.",
    "options": [
      "do",
      "does",
      "did",
      "done"
    ],
    "answer": "done",
    "explanation": "Compare the grammar, meaning, and natural usage of each option. Answer: done.",
    "source": "telegram-english-courses",
    "sourceMessageId": "message17076",
    "sourceFile": "messages17.html",
    "answerReview": "independently-checked"
  },
  {
    "id": "telegram:message17008",
    "level": "B1",
    "topic": "conditionals",
    "prompt": "\"If she studies hard, she ________ the exam.\"",
    "options": [
      "passed",
      "will pass",
      "passes",
      "would pass"
    ],
    "answer": "will pass",
    "explanation": "Use the appropriate conditional tense for the hypothetical or real situation. Answer: will pass.",
    "source": "telegram-english-courses",
    "sourceMessageId": "message17008",
    "sourceFile": "messages17.html",
    "answerReview": "independently-checked"
  },
  {
    "id": "telegram:message17802",
    "level": "B2",
    "topic": "questions",
    "prompt": "Choose the most polite way to suggest a new teaching method in a meeting:",
    "options": [
      "We must use this method.",
      "I propose we explore this new teaching strategy.",
      "My method is the best.",
      "Use this strategy now."
    ],
    "answer": "I propose we explore this new teaching strategy.",
    "explanation": "Compare the grammar, meaning, and natural usage of each option. Answer: I propose we explore this new teaching strategy..",
    "source": "telegram-english-courses",
    "sourceMessageId": "message17802",
    "sourceFile": "messages17.html",
    "answerReview": "independently-checked"
  },
  {
    "id": "telegram:message17560",
    "level": "B2",
    "topic": "vocabulary",
    "prompt": "Which of the following means \"to end a romantic relationship\"?",
    "options": [
      "Make up",
      "Break up",
      "Look up",
      "Give up"
    ],
    "answer": "Break up",
    "explanation": "Learn the expression and its meaning in context. Answer: Break up.",
    "source": "telegram-english-courses",
    "sourceMessageId": "message17560",
    "sourceFile": "messages17.html",
    "answerReview": "independently-checked"
  },
  {
    "id": "telegram:message11394",
    "level": "B1",
    "topic": "present-perfect",
    "prompt": "Have you ever _____ on a camel? I have. I _____ on one when I was in Egypt.",
    "options": [
      "rode / rode",
      "ride / ride",
      "ridden / ride",
      "ridden / rode"
    ],
    "answer": "ridden / rode",
    "explanation": "Check whether the tense connects a past action with the present. Answer: ridden / rode.",
    "source": "telegram-english-courses",
    "sourceMessageId": "message11394",
    "sourceFile": "messages11.html",
    "answerReview": "independently-checked"
  },
  {
    "id": "telegram:message17637",
    "level": "B2",
    "topic": "vocabulary",
    "prompt": "In digital education, _____ means adjusting content to fit each student's needs.",
    "options": [
      "evaluation",
      "assessment",
      "personalization",
      "participation"
    ],
    "answer": "personalization",
    "explanation": "Learn the expression and its meaning in context. Answer: personalization.",
    "source": "telegram-english-courses",
    "sourceMessageId": "message17637",
    "sourceFile": "messages17.html",
    "answerReview": "independently-checked"
  },
  {
    "id": "telegram:message10248",
    "level": "B2",
    "topic": "vocabulary",
    "prompt": "Which is the best antonym for rare?",
    "options": [
      "colorful",
      "strange",
      "common",
      "infrequent"
    ],
    "answer": "common",
    "explanation": "Learn the expression and its meaning in context. Answer: common.",
    "source": "telegram-english-courses",
    "sourceMessageId": "message10248",
    "sourceFile": "messages10.html",
    "answerReview": "independently-checked"
  },
  {
    "id": "telegram:message12535",
    "level": "B1",
    "topic": "conditionals",
    "prompt": "I would __ it if you help my sister unconditionally. (B1)",
    "options": [
      "appear",
      "attend",
      "appreciate",
      "attentive"
    ],
    "answer": "appreciate",
    "explanation": "Use the appropriate conditional tense for the hypothetical or real situation. Answer: appreciate.",
    "source": "telegram-english-courses",
    "sourceMessageId": "message12535",
    "sourceFile": "messages12.html",
    "answerReview": "independently-checked"
  },
  {
    "id": "telegram:message17545",
    "level": "B2",
    "topic": "vocabulary",
    "prompt": "Sarah is a \"shoulder to cry on\". This means she is ________.",
    "options": [
      "always crying",
      "physically strong",
      "a supportive person who listens",
      "sad all the time"
    ],
    "answer": "a supportive person who listens",
    "explanation": "Learn the expression and its meaning in context. Answer: a supportive person who listens.",
    "source": "telegram-english-courses",
    "sourceMessageId": "message17545",
    "sourceFile": "messages17.html",
    "answerReview": "independently-checked"
  },
  {
    "id": "telegram:message17598",
    "level": "B1",
    "topic": "questions",
    "prompt": "I was very disappointed when my best friend let me ________.",
    "options": [
      "down",
      "up",
      "out",
      "off"
    ],
    "answer": "down",
    "explanation": "Compare the grammar, meaning, and natural usage of each option. Answer: down.",
    "source": "telegram-english-courses",
    "sourceMessageId": "message17598",
    "sourceFile": "messages17.html",
    "answerReview": "independently-checked"
  },
  {
    "id": "telegram:message9039",
    "level": "B1",
    "topic": "questions",
    "prompt": "- I would rather ----- London than Paris.",
    "options": [
      "visit",
      "visiting",
      "visits"
    ],
    "answer": "visit",
    "explanation": "Compare the grammar, meaning, and natural usage of each option. Answer: visit.",
    "source": "telegram-english-courses",
    "sourceMessageId": "message9039",
    "sourceFile": "messages9.html",
    "answerReview": "independently-checked"
  },
  {
    "id": "telegram:message8620",
    "level": "B1",
    "topic": "present-perfect",
    "prompt": "I have been here _______ 2 hours.",
    "options": [
      "for",
      "since",
      "about",
      "while"
    ],
    "answer": "for",
    "explanation": "Check whether the tense connects a past action with the present. Answer: for.",
    "source": "telegram-english-courses",
    "sourceMessageId": "message8620",
    "sourceFile": "messages9.html",
    "answerReview": "independently-checked"
  },
  {
    "id": "telegram:message17695",
    "level": "B2",
    "topic": "vocabulary",
    "prompt": "Which phrase is best to ask a professor for a recommendation letter?",
    "options": [
      "Write a letter for me, please.",
      "I am writing to kindly request a letter of recommendation.",
      "I want a recommendation letter now.",
      "Give me a good recommendation."
    ],
    "answer": "I am writing to kindly request a letter of recommendation.",
    "explanation": "Learn the expression and its meaning in context. Answer: I am writing to kindly request a letter of recommendation..",
    "source": "telegram-english-courses",
    "sourceMessageId": "message17695",
    "sourceFile": "messages17.html",
    "answerReview": "independently-checked"
  },
  {
    "id": "telegram:message12495",
    "level": "B1",
    "topic": "questions",
    "prompt": "I was thinking about what we discussed _______ you arrived. (A2)",
    "options": [
      "While",
      "However",
      "When",
      "Neither"
    ],
    "answer": "When",
    "explanation": "Compare the grammar, meaning, and natural usage of each option. Answer: When.",
    "source": "telegram-english-courses",
    "sourceMessageId": "message12495",
    "sourceFile": "messages12.html",
    "answerReview": "independently-checked"
  },
  {
    "id": "telegram:message11396",
    "level": "B1",
    "topic": "questions",
    "prompt": "Which sentences has the correct punctuation mark?",
    "options": [
      "We had coffee and cheese, chicken.",
      "We had coffee, cheese, chicken.",
      "We had coffee, cheese and chicken.",
      "We had coffee and cheese and chicken."
    ],
    "answer": "We had coffee, cheese and chicken.",
    "explanation": "Compare the grammar, meaning, and natural usage of each option. Answer: We had coffee, cheese and chicken..",
    "source": "telegram-english-courses",
    "sourceMessageId": "message11396",
    "sourceFile": "messages11.html",
    "answerReview": "independently-checked"
  },
  {
    "id": "telegram:message17167",
    "level": "B2",
    "topic": "vocabulary",
    "prompt": "Which word is a synonym for 'Innovative'?",
    "options": [
      "Traditional",
      "Creative",
      "Boring",
      "Old"
    ],
    "answer": "Creative",
    "explanation": "Learn the expression and its meaning in context. Answer: Creative.",
    "source": "telegram-english-courses",
    "sourceMessageId": "message17167",
    "sourceFile": "messages17.html",
    "answerReview": "independently-checked"
  },
  {
    "id": "telegram:message17749",
    "level": "B2",
    "topic": "vocabulary",
    "prompt": "To \"hand in\" an assignment means to:",
    "options": [
      "Delete it",
      "Submit it to the teacher",
      "Write it clearly",
      "Copy it from a friend"
    ],
    "answer": "Submit it to the teacher",
    "explanation": "Learn the expression and its meaning in context. Answer: Submit it to the teacher.",
    "source": "telegram-english-courses",
    "sourceMessageId": "message17749",
    "sourceFile": "messages17.html",
    "answerReview": "independently-checked"
  },
  {
    "id": "telegram:message17334",
    "level": "B1",
    "topic": "questions",
    "prompt": "Despite ________ an argument, they forgave each other quickly.",
    "options": [
      "have",
      "had",
      "having",
      "has"
    ],
    "answer": "having",
    "explanation": "Compare the grammar, meaning, and natural usage of each option. Answer: having.",
    "source": "telegram-english-courses",
    "sourceMessageId": "message17334",
    "sourceFile": "messages17.html",
    "answerReview": "independently-checked"
  },
  {
    "id": "telegram:message16961",
    "level": "B2",
    "topic": "vocabulary",
    "prompt": "Q7. Which expression means to put on warm clothes to protect yourself from the cold?",
    "options": [
      "Freeze up.",
      "Bundle up.",
      "Drop the temperature."
    ],
    "answer": "Bundle up.",
    "explanation": "Learn the expression and its meaning in context. Answer: Bundle up..",
    "source": "telegram-english-courses",
    "sourceMessageId": "message16961",
    "sourceFile": "messages17.html",
    "answerReview": "independently-checked"
  },
  {
    "id": "telegram:message17036",
    "level": "B1",
    "topic": "vocabulary",
    "prompt": "What is the synonym of 'happy'?",
    "options": [
      "Sad",
      "Joyful",
      "Angry",
      "Tired"
    ],
    "answer": "Joyful",
    "explanation": "Learn the expression and its meaning in context. Answer: Joyful.",
    "source": "telegram-english-courses",
    "sourceMessageId": "message17036",
    "sourceFile": "messages17.html",
    "answerReview": "independently-checked"
  },
  {
    "id": "telegram:message12393",
    "level": "B1",
    "topic": "adjective-prepositions",
    "prompt": "✅ He didn't seem very interested ___ what I was saying.",
    "options": [
      "in",
      "on",
      "for",
      "of"
    ],
    "answer": "in",
    "explanation": "Learn the collocation with its fixed preposition. Answer: in.",
    "source": "telegram-english-courses",
    "sourceMessageId": "message12393",
    "sourceFile": "messages12.html",
    "answerReview": "independently-checked"
  }
];
const normalize=s=>String(s||'').normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();
const knownIds=new Set(pack.questions.map(q=>String(q.id||'')));
const knownQuestions=new Set(pack.questions.map(q=>normalize(q.prompt)));
const added=[];
for(const q of rows){
 if(!q||!q.id||!q.answer||!q.options.includes(q.answer))continue;
 const key=normalize(q.prompt);
 if(knownIds.has(q.id)||knownQuestions.has(key))continue;
 knownIds.add(q.id);knownQuestions.add(key);
 pack.questions.push(q);added.push(q.id);
}
window.SERAG_TELEGRAM_IMPORT_V1=Object.freeze({source:'English courses Telegram HTML export',version:1,reviewed:rows.length,added:added.length,pendingExcluded:true});
})();