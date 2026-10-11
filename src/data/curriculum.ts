import { ClassLevel, LanguageCode, SubjectId } from '../types';

export interface SubjectChapterInfo {
  id: string;
  title: Record<LanguageCode, string>;
  boardAligned: boolean;
}

export interface ClassSubjectCurriculum {
  status: 'prescribed' | 'integrated_evs' | 'language_elective' | 'additional_practice';
  boardNote: Record<LanguageCode, string>;
  chapters: SubjectChapterInfo[];
}

export interface SubjectDefinition {
  id: SubjectId;
  name: Record<LanguageCode, string>;
  shortDesc: Record<LanguageCode, string>;
  curriculumByClass: Record<ClassLevel, ClassSubjectCurriculum>;
}

export const CLASS_LEVELS: ClassLevel[] = [5, 6, 7, 8, 9, 10];

export const SUBJECT_LIST: SubjectDefinition[] = [
  {
    id: 'bangla',
    name: {
      en: 'Bangla',
      bn: 'বাংলা (Bangla)',
      hi: 'बांग्ला (Bangla)',
    },
    shortDesc: {
      en: 'Grammar (Byakaran), spelling, vocabulary, comprehension, sentence construction & WBBSE/WBBPE literature.',
      bn: 'ব্যাকরণ, বানান, শব্দভাণ্ডার, বোধপরীক্ষণ, বাক্য গঠন এবং পশ্চিমবঙ্গ বোর্ড সাহিত্য।',
      hi: 'व्याकरण, वर्तनी, शब्दावली, अपठित बोध, वाक्य रचना और पश्चिम बंगाल बोर्ड साहित्य।',
    },
    curriculumByClass: {
      5: {
        status: 'prescribed',
        boardNote: {
          en: 'Verified WBBPE Class 5 Patabahar & Bhasha Path syllabus',
          bn: 'পশ্চিমবঙ্গ প্রাথমিক শিক্ষা পর্ষদ (WBBPE) পঞ্চম শ্রেণি পাতাবাহার ও ভাষা পাঠ',
          hi: 'WBBPE कक्षा 5 पाताबाहार एवं भाषा पाठ पाठ्यक्रम',
        },
        chapters: [
          { id: 'bn5_dhwani_barna', title: { en: 'Dhwani, Barna & Spelling (ধ্বনি, বর্ণ ও বানান)', bn: 'ধ্বনি, বর্ণ ও বানান বিধি', hi: 'ध्वनि, वर्ण और वर्तनी (ধ্বনি ও বর্ণ)' }, boardAligned: true },
          { id: 'bn5_pad_prakaran', title: { en: 'Parts of Speech / Pad Prakaran (পদ প্রকরণ)', bn: 'পদ প্রকরণ (বিশেষ্য, সর্বনাম, বিশেষণ, অব্যয়, ক্রিয়া)', hi: 'पद प्रकरण (संज्ञा, सर्वनाम, विशेषण, क्रिया)' }, boardAligned: true },
          { id: 'bn5_linga_bachan', title: { en: 'Gender & Number / Linga o Bachan (লিঙ্গ ও বচন)', bn: 'লিঙ্গ ও বচন পরিবর্তন', hi: 'लिंग और वचन परिवर्तन (লিঙ্গ ও বচন)' }, boardAligned: true },
          { id: 'bn5_patabahar', title: { en: 'Patabahar Literature & Comprehension (পাতাবাহার ও বোধপরীক্ষণ)', bn: 'পাতাবাহার গদ্য-পদ্য ও বোধপরীক্ষণ', hi: 'पाताबाहार साहित्य एवं अपठित बोध' }, boardAligned: true },
        ],
      },
      6: {
        status: 'prescribed',
        boardNote: {
          en: 'Verified WBBSE Class 6 Sahitya Mela & Bhashacharcha syllabus',
          bn: 'পশ্চিমবঙ্গ মধ্যশিক্ষা পর্ষদ (WBBSE) ষষ্ঠ শ্রেণি সাহিত্যমেলা ও ভাষাচর্চা',
          hi: 'WBBSE कक्षा 6 साहित्यमेला एवं भाषाचर्चा पाठ्यक्रम',
        },
        chapters: [
          { id: 'bn6_sandhi', title: { en: 'Sandhi — Vowel & Consonant (সন্ধি বিচ্ছেদ)', bn: 'স্বরসন্ধি ও ব্যঞ্জনসন্ধি', hi: 'स्वर संधि एवं व्यंजन संधि (সন্ধি)' }, boardAligned: true },
          { id: 'bn6_shabdabhandar', title: { en: 'Bengali Vocabulary & Tatsama/Tadbhava (শব্দভাণ্ডার)', bn: 'বাংলা শব্দভাণ্ডার (তৎসম, অর্ধতৎসম, তদ্ভব, দেশি, বিদেশি)', hi: 'बांग्ला शब्दभंडार (तत्सम, तद्भव, देशी, विदेशी)' }, boardAligned: true },
          { id: 'bn6_upasarga_anusarga', title: { en: 'Prefixes & Postpositions (উপসর্গ ও অনুসর্গ)', bn: 'উপসর্গ ও অনুসর্গ', hi: 'उपसर्ग और अनुसर्ग (উপসর্গ ও অনুসর্গ)' }, boardAligned: true },
          { id: 'bn6_sahityamela', title: { en: 'Sahitya Mela Prose, Poetry & Comprehension', bn: 'সাহিত্যমেলা ও বোধপরীক্ষণ', hi: 'साहित्यमेला एवं गद्यांश बोध' }, boardAligned: true },
        ],
      },
      7: {
        status: 'prescribed',
        boardNote: {
          en: 'Verified WBBSE Class 7 Sahitya Mela & Bhashacharcha syllabus',
          bn: 'পশ্চিমবঙ্গ মধ্যশিক্ষা পর্ষদ (WBBSE) সপ্তম শ্রেণি সাহিত্যমেলা ও ভাষাচর্চা',
          hi: 'WBBSE कक्षा 7 साहित्यमेला एवं भाषाचर्चा पाठ्यक्रम',
        },
        chapters: [
          { id: 'bn7_karak_vibhakti', title: { en: 'Karak & Vibhakti Fundamentals (কারক ও বিভক্তি)', bn: 'কারক ও বিভক্তি পরিচয়', hi: 'कारक और विभक्ति परिचय (কারক ও বিভক্তি)' }, boardAligned: true },
          { id: 'bn7_shabda_gathan', title: { en: 'Word Formation &Pratyay (শব্দ গঠন ও প্রত্যয়)', bn: 'শব্দ গঠন, প্রকৃতি ও প্রত্যয়', hi: 'शब्द गठन एवं प्रत्यय (প্রকৃতি ও প্রত্যয়)' }, boardAligned: true },
          { id: 'bn7_shuddharan', title: { en: 'Spelling Rules & Sentence Correction (বানান ও বাক্য শুদ্ধিকরণ)', bn: 'বানান বিধি ও বাক্য শুদ্ধিকরণ', hi: 'वर्तनी नियम और वाक्य शुद्धिकरण' }, boardAligned: true },
          { id: 'bn7_sahityamela', title: { en: 'Class 7 Sahitya Mela & Unseen Comprehension', bn: 'সপ্তম শ্রেণি সাহিত্যমেলা ও বোধপরীক্ষণ', hi: 'कक्षा 7 साहित्यमेला एवं अपठित बोध' }, boardAligned: true },
        ],
      },
      8: {
        status: 'prescribed',
        boardNote: {
          en: 'Verified WBBSE Class 8 Sahitya Mela & Bhashacharcha syllabus',
          bn: 'পশ্চিমবঙ্গ মধ্যশিক্ষা পর্ষদ (WBBSE) অষ্টম শ্রেণি সাহিত্যমেলা ও ভাষাচর্চা',
          hi: 'WBBSE कक्षा 8 साहित्यमेला एवं भाषाचर्चा पाठ्यक्रम',
        },
        chapters: [
          { id: 'bn8_samas', title: { en: 'Samas Introduction & Classification (সমাস পরিচয়)', bn: 'সমাস পরিচয় ও শ্রেণীবিভাগ', hi: 'समास परिचय और वर्गीकरण (সমাস)' }, boardAligned: true },
          { id: 'bn8_bakya_bhab', title: { en: 'Sentence Structure & Moods (বাক্যের ভাব ও রূপান্তর)', bn: 'বাক্যের ভাব, ক্রিয়ার কাল ও বাক্য রূপান্তর', hi: 'वाक्य के भाव, काल और रूपांतरण' }, boardAligned: true },
          { id: 'bn8_bagdhara_prabad', title: { en: 'Idioms, Proverbs & One-word Substitution (বাগধারা ও এককথায় প্রকাশ)', bn: 'বাগধারা, প্রবাদ-প্রবচন ও এককথায় প্রকাশ', hi: 'मुहावरे और एक शब्द में प्रकाशन (বাগধারা)' }, boardAligned: true },
          { id: 'bn8_sahityamela', title: { en: 'Class 8 Sahitya Mela & Comprehension', bn: 'অষ্টম শ্রেণি সাহিত্যমেলা ও বোধপরীক্ষণ', hi: 'कक्षा 8 साहित्यमेला एवं अपठित बोध' }, boardAligned: true },
        ],
      },
      9: {
        status: 'prescribed',
        boardNote: {
          en: 'Verified WBBSE Class 9 Sahitya Sanchayan & Bhasha Path syllabus',
          bn: 'পশ্চিমবঙ্গ মধ্যশিক্ষা পর্ষদ (WBBSE) নবম শ্রেণি সাহিত্য সঞ্চয়ন ও ব্যাকরণ',
          hi: 'WBBSE कक्षा 9 साहित्य संचयन एवं व्याकरण पाठ्यक्रम',
        },
        chapters: [
          { id: 'bn9_dhwani_paribartan', title: { en: 'Phonetic Changes / Dhwani Paribartan (ধ্বনি পরিবর্তন)', bn: 'ধ্বনি পরিবর্তনের রীতি ও কারণ', hi: 'ध्वनि परिवर्तन के नियम (ধ্বনি পরিবর্তন)' }, boardAligned: true },
          { id: 'bn9_shabder_gathan', title: { en: 'Morphology, Upasarga & Pratyay (শব্দ গঠন, উপসর্গ ও প্রত্যয়)', bn: 'শব্দ গঠন: উপসর্গ, অনুসর্গ, ধাতু ও প্রত্যয়', hi: 'शब्द गठन: उपसर्ग, धातु और प्रत्यय' }, boardAligned: true },
          { id: 'bn9_sahitya_sanchayan', title: { en: 'Sahitya Sanchayan (Koliang, Bithi, Prose & Poetry)', bn: 'সাহিত্য সঞ্চয়ন (গদ্য ও কবিতা)', hi: 'साहित्य संचयन (गद्य एवं पद्य)' }, boardAligned: true },
        ],
      },
      10: {
        status: 'prescribed',
        boardNote: {
          en: 'Verified WBBSE Class 10 (Madhyamik) Sahitya Sanchayan & Grammar syllabus',
          bn: 'পশ্চিমবঙ্গ মধ্যশিক্ষা পর্ষদ (WBBSE) দশম শ্রেণি (মাধ্যমিক) সাহিত্য সঞ্চয়ন ও ব্যাকরণ',
          hi: 'WBBSE कक्षा 10 (माध्यमिक) साहित्य संचयन एवं व्याकरण पाठ्यक्रम',
        },
        chapters: [
          { id: 'bn10_karak', title: { en: 'Karak & অকারক Relations (কারক ও অকারক সম্পর্ক)', bn: 'কারক ও অকারক সম্পর্ক (মাধ্যমিক ব্যাকরণ)', hi: 'कारक और अकारक संबंध (माध्यमिक व्याकरण)' }, boardAligned: true },
          { id: 'bn10_samas', title: { en: 'Samas in Detail (সমাস ও ব্যাসবাক্য)', bn: 'সমাস (তৎপুরুষ, কর্মধারয়, দ্বন্দ্ব, বহুব্রীহি, দ্বিগু, অব্যয়ীভাব)', hi: 'समास और विग्रह वाक्य (সমাস)' }, boardAligned: true },
          { id: 'bn10_bakya_bachya', title: { en: 'Bakya (Sentence Types) & Bachya (Voice) (বাক্য ও বাচ্য পরিবর্তন)', bn: 'বাক্য (সরল, জটিল, যৌগিক) ও বাচ্য পরিবর্তন', hi: 'वाक्य (सरल, जटिल, यौगिक) एवं वाच्य परिवर्तन' }, boardAligned: true },
          { id: 'bn10_sahitya', title: { en: 'Madhyamik Sahitya Sanchayan (Gyanachakshu, Bahurupi, etc.)', bn: 'মাধ্যমিক সাহিত্য সঞ্চয়ন (জ্ঞানচক্ষু, বহুরূপী, অসুখী একজন ইত্যাদি)', hi: 'माध्यमिक साहित्य संचयन (ज्ञानचक्षु, बहुरूपी आदि)' }, boardAligned: true },
        ],
      },
    },
  },
  {
    id: 'english',
    name: {
      en: 'English',
      bn: 'ইংরেজি (English)',
      hi: 'अंग्रेज़ी (English)',
    },
    shortDesc: {
      en: 'Grammar, tenses, articles, prepositions, voice/narration, vocabulary, comprehension & WBBSE Butterfly/Blossoms.',
      bn: 'ইংরেজি গ্রামার, টেন্স, আর্টিকেল, প্রিপোজিশন, ভয়েস, ন্যারেশন, শব্দভাণ্ডার ও বোধপরীক্ষণ।',
      hi: 'अंग्रेज़ी व्याकरण, काल (Tenses), आर्टिकल्स, प्रीपोजिशन, वॉइस, नरेशन, शब्दावली और बोध।',
    },
    curriculumByClass: {
      5: {
        status: 'prescribed',
        boardNote: {
          en: 'Verified WBBPE Class 5 Butterfly textbook & functional grammar syllabus',
          bn: 'WBBPE পঞ্চম শ্রেণি Butterfly পাঠ্যপুস্তক ও ইংরেজি ব্যাকরণ',
          hi: 'WBBPE कक्षा 5 Butterfly पाठ्यपुस्तक एवं अंग्रेज़ी व्याकरण',
        },
        chapters: [
          { id: 'en5_articles_prep', title: { en: 'Articles & Prepositions', bn: 'Articles ও Prepositions-এর ব্যবহার', hi: 'Articles और Prepositions का प्रयोग' }, boardAligned: true },
          { id: 'en5_nouns_pronouns', title: { en: 'Nouns, Pronouns, Gender & Number', bn: 'Nouns, Pronouns, Gender ও Number', hi: 'Nouns, Pronouns, लिंग और वचन' }, boardAligned: true },
          { id: 'en5_tenses_basic', title: { en: 'Simple Present & Simple Past Tenses', bn: 'Simple Present ও Simple Past Tense', hi: 'Simple Present और Simple Past Tense' }, boardAligned: true },
          { id: 'en5_comprehension', title: { en: 'Reading Comprehension & Vocabulary (Butterfly)', bn: 'বোধপরীক্ষণ ও শব্দভাণ্ডার (Butterfly)', hi: 'अपठित गद्यांश और शब्दावली (Butterfly)' }, boardAligned: true },
        ],
      },
      6: {
        status: 'prescribed',
        boardNote: {
          en: 'Verified WBBSE Class 6 Blossoms textbook & grammar syllabus',
          bn: 'WBBSE ষষ্ঠ শ্রেণি Blossoms ও ইংরেজি ব্যাকরণ',
          hi: 'WBBSE कक्षा 6 Blossoms एवं अंग्रेज़ी व्याकरण',
        },
        chapters: [
          { id: 'en6_tenses_cont', title: { en: 'Continuous & Perfect Tenses, Subject-Verb Agreement', bn: 'Continuous ও Perfect Tense এবং Subject-Verb Agreement', hi: 'Continuous एवं Perfect Tense और Subject-Verb Agreement' }, boardAligned: true },
          { id: 'en6_prefixes_suffixes', title: { en: 'Prefixes, Suffixes, Synonyms & Antonyms', bn: 'Prefixes, Suffixes, সমার্থক ও বিপরীত শব্দ', hi: 'Prefixes, Suffixes, पर्यायवाची और विलोम शब्द' }, boardAligned: true },
          { id: 'en6_sentence_types', title: { en: 'Kinds of Sentences & Punctuation', bn: 'বাক্যের প্রকারভেদ ও যতিচিহ্ন (Punctuation)', hi: 'वाक्य के प्रकार और विराम चिह्न' }, boardAligned: true },
          { id: 'en6_blossoms', title: { en: 'Class 6 Blossoms Prose, Poetry & Comprehension', bn: 'ষষ্ঠ শ্রেণি Blossoms ও বোধপরীক্ষণ', hi: 'कक्षा 6 Blossoms एवं गद्यांश बोध' }, boardAligned: true },
        ],
      },
      7: {
        status: 'prescribed',
        boardNote: {
          en: 'Verified WBBSE Class 7 Blossoms textbook & grammar syllabus',
          bn: 'WBBSE সপ্তম শ্রেণি Blossoms ও ইংরেজি ব্যাকরণ',
          hi: 'WBBSE कक्षा 7 Blossoms एवं अंग्रेज़ी व्याकरण',
        },
        chapters: [
          { id: 'en7_degrees_adjectives', title: { en: 'Adjectives & Degrees of Comparison', bn: 'Adjectives ও Degrees of Comparison', hi: 'Adjectives और Degrees of Comparison' }, boardAligned: true },
          { id: 'en7_modals_adverbs', title: { en: 'Modals, Adverbs & Prepositional Phrases', bn: 'Modals, Adverbs ও Prepositions', hi: 'Modals, Adverbs और Prepositions' }, boardAligned: true },
          { id: 'en7_voice_intro', title: { en: 'Active and Passive Voice Fundamentals', bn: 'Active ও Passive Voice পরিবর্তন', hi: 'Active और Passive Voice परिवर्तन' }, boardAligned: true },
          { id: 'en7_blossoms', title: { en: 'Class 7 Blossoms Literature & Unseen Passage', bn: 'সপ্তম শ্রেণি Blossoms ও Unseen বোধপরীক্ষণ', hi: 'कक्षा 7 Blossoms एवं अपठित बोध' }, boardAligned: true },
        ],
      },
      8: {
        status: 'prescribed',
        boardNote: {
          en: 'Verified WBBSE Class 8 Blossoms textbook & grammar syllabus',
          bn: 'WBBSE অষ্টম শ্রেণি Blossoms ও ইংরেজি ব্যাকরণ',
          hi: 'WBBSE कक्षा 8 Blossoms एवं अंग्रेज़ी व्याकरण',
        },
        chapters: [
          { id: 'en8_voice_narration', title: { en: 'Voice Change & Direct-Indirect Narration', bn: 'Voice Change ও Narration Change', hi: 'Voice Change और Direct-Indirect Narration' }, boardAligned: true },
          { id: 'en8_clauses_infinitives', title: { en: 'Clauses, Infinitives, Participles & Gerunds', bn: 'Clauses (Principal/Subordinate), Infinitives ও Participles', hi: 'Clauses, Infinitives, Participles और Gerunds' }, boardAligned: true },
          { id: 'en8_blossoms', title: { en: 'Class 8 Blossoms Prose, Poetry & Vocabulary', bn: 'অষ্টম শ্রেণি Blossoms সাহিত্য ও শব্দভাণ্ডার', hi: 'कक्षा 8 Blossoms साहित्य एवं शब्दावली' }, boardAligned: true },
        ],
      },
      9: {
        status: 'prescribed',
        boardNote: {
          en: 'Verified WBBSE Class 9 Bliss textbook & functional grammar syllabus',
          bn: 'WBBSE নবম শ্রেণি Bliss পাঠ্যপুস্তক ও ব্যাকরণ',
          hi: 'WBBSE कक्षा 9 Bliss पाठ्यपुस्तक एवं व्याकरण',
        },
        chapters: [
          { id: 'en9_transformation', title: { en: 'Transformation of Sentences (Simple, Complex, Compound)', bn: 'Transformation of Sentences (Simple, Complex, Compound)', hi: 'Transformation of Sentences (Simple, Complex, Compound)' }, boardAligned: true },
          { id: 'en9_phrasal_verbs', title: { en: 'Phrasal Verbs, Tenses & Error Correction', bn: 'Phrasal Verbs, সঠিক Verb Form ও বাক্য শুদ্ধিকরণ', hi: 'Phrasal Verbs, Tenses और वाक्य सुधार' }, boardAligned: true },
          { id: 'en9_bliss', title: { en: 'Class 9 Bliss (Tales of Bhola Grandpa, All About a Dog, etc.)', bn: 'নবম শ্রেণি Bliss গদ্য ও কবিতা', hi: 'कक्षा 9 Bliss गद्य एवं कविता' }, boardAligned: true },
        ],
      },
      10: {
        status: 'prescribed',
        boardNote: {
          en: 'Verified WBBSE Class 10 (Madhyamik) Bliss textbook & grammar syllabus',
          bn: 'WBBSE দশম শ্রেণি (মাধ্যমিক) Bliss পাঠ্যপুস্তক ও ব্যাকরণ',
          hi: 'WBBSE कक्षा 10 (माध्यमिक) Bliss पाठ्यपुस्तक एवं व्याकरण',
        },
        chapters: [
          { id: 'en10_grammar_synthesis', title: { en: 'Joining, Splitting, Voice, Narration & Phrasal Verbs', bn: 'Joining, Splitting, Voice, Narration ও Phrasal Verbs', hi: 'Joining, Splitting, Voice, Narration और Phrasal Verbs' }, boardAligned: true },
          { id: 'en10_verb_forms_prep', title: { en: 'Proper Forms of Verbs, Articles & Prepositions', bn: 'Proper Forms of Verbs, Articles ও Prepositions', hi: 'Proper Forms of Verbs, Articles और Prepositions' }, boardAligned: true },
          { id: 'en10_bliss', title: { en: 'Madhyamik Bliss (Father’s Help, Fable, Passing Away of Bapu, etc.)', bn: 'মাধ্যমিক Bliss (Father’s Help, Fable, The Passing Away of Bapu ইত্যাদি)', hi: 'माध्यमिक Bliss (Father’s Help, Fable आदि)' }, boardAligned: true },
        ],
      },
    },
  },
  {
    id: 'mathematics',
    name: {
      en: 'Mathematics',
      bn: 'গণিত (Mathematics)',
      hi: 'गणित (Mathematics)',
    },
    shortDesc: {
      en: 'Arithmetic, fractions, decimals, percentages, algebra, geometry, equations, mensuration & trigonometry.',
      bn: 'পাটিগণিত, ভগ্নাংশ, দশমিক, শতকরা, বীজগণিত, জ্যামিতি, সমীকরণ ও পরিমিতি।',
      hi: 'अंकगणित, भिन्न, दशमलव, प्रतिशत, बीजगणित, ज्यामिति, समीकरण और क्षेत्रमिति।',
    },
    curriculumByClass: {
      5: {
        status: 'prescribed',
        boardNote: {
          en: 'Verified WBBPE Class 5 Amar Ganit (আমার গণিত) syllabus',
          bn: 'WBBPE পঞ্চম শ্রেণি আমার গণিত পাঠ্যক্রম',
          hi: 'WBBPE कक्षा 5 आमार गणित पाठ्यक्रम',
        },
        chapters: [
          { id: 'math5_hcf_lcm', title: { en: 'HCF, LCM & Prime Factorization', bn: 'গ.সা.গু ও ল.সা.গু এবং মৌলিক উৎপাদক', hi: 'म.स.प. (HCF), ल.स.प. (LCM) और अभाज्य गुणनखंड' }, boardAligned: true },
          { id: 'math5_fractions_decimals', title: { en: 'Fractions & Decimals Operations', bn: 'ভগ্নাংশ ও দশমিক ভগ্নাংশের যোগ-বিয়োগ-গুণ-ভাগ', hi: 'भिन्न और दशमलव संख्याओं की संक्रियाएँ' }, boardAligned: true },
          { id: 'math5_geometry_perimeter', title: { en: 'Angles, Triangles, Perimeter & Area of Rectangles', bn: 'কোণ, ত্রিভুজ এবং আয়তক্ষেত্র ও বর্গক্ষেত্রের পরিসীমা-ক্ষেত্রফল', hi: 'कोण, त्रिभुज और आयत-वर्ग का परिमाप एवं क्षेत्रफल' }, boardAligned: true },
        ],
      },
      6: {
        status: 'prescribed',
        boardNote: {
          en: 'Verified WBBSE Class 6 Ganit Prabha (গণিত প্রভা) syllabus',
          bn: 'WBBSE ষষ্ঠ শ্রেণি গণিত প্রভা পাঠ্যক্রম',
          hi: 'WBBSE कक्षा 6 गणित प्रभा पाठ्यक्रम',
        },
        chapters: [
          { id: 'math6_integers_algebra', title: { en: 'Directed Numbers (Integers) & Introduction to Algebra', bn: 'নিয়ন্ত্রিত সংখ্যা (পূর্ণসংখ্যা) ও বীজগণিতের চলরাশি', hi: 'पूर्णांक (Integers) और बीजगणितीय चर का परिचय' }, boardAligned: true },
          { id: 'math6_ratio_percentage', title: { en: 'Ratio, Proportion & Percentages', bn: 'অনুপাত, সমানুপাত ও শতকরা', hi: 'अनुपात, समानुपात और प्रतिशत' }, boardAligned: true },
          { id: 'math6_geometry_solids', title: { en: 'Line Segments, Angles, Circles & Geometrical Solids', bn: 'রেখাংশ, কোণ, বৃত্ত ও ঘনবস্তু পরিচিতি', hi: 'रेखाखंड, कोण, वृत्त और ठोस ज्यामितीय आकृतियाँ' }, boardAligned: true },
        ],
      },
      7: {
        status: 'prescribed',
        boardNote: {
          en: 'Verified WBBSE Class 7 Ganit Prabha (গণিত প্রভা) syllabus',
          bn: 'WBBSE সপ্তম শ্রেণি গণিত প্রভা পাঠ্যক্রম',
          hi: 'WBBSE कक्षा 7 गणित प्रभा पाठ्यक्रम',
        },
        chapters: [
          { id: 'math7_exponents_identities', title: { en: 'Laws of Indices (Exponents) & Algebraic Identities', bn: 'সূচকের ধারণা ও বীজগাণিতিক সূত্রাবলি', hi: 'घातांक के नियम और बीजगणितीय सर्वसमिकाएँ' }, boardAligned: true },
          { id: 'math7_linear_equations', title: { en: 'Simple Linear Equations & Unitary Method / Time-Distance', bn: 'সমীকরণ গঠন ও সমাধান এবং সময় ও দূরত্ব', hi: 'रैखिक समीकरण और समय तथा दूरी' }, boardAligned: true },
          { id: 'math7_congruence_triangles', title: { en: 'Properties of Triangles & Congruence of Triangles', bn: 'ত্রিভুজের ধর্ম ও ত্রিভুজের সর্বসমতা', hi: 'त्रिभुजों के गुण और त्रिभुजों की सर्वांगसमता' }, boardAligned: true },
        ],
      },
      8: {
        status: 'prescribed',
        boardNote: {
          en: 'Verified WBBSE Class 8 Ganit Prabha (গণিত প্রভা) syllabus',
          bn: 'WBBSE অষ্টম শ্রেণি গণিত প্রভা পাঠ্যক্রম',
          hi: 'WBBSE कक्षा 8 गणित प्रभा पाठ्यक्रम',
        },
        chapters: [
          { id: 'math8_cubes_factorization', title: { en: 'Cubes, Factorization of Algebraic Expressions & HCF/LCM', bn: 'ঘনফল নির্ণয়, উৎপাদকে বিশ্লেষণ ও বীজগাণিতিক গ.সা.গু-ল.সা.গু', hi: 'घनफल, बीजगणितीय गुणनखंडन और म.स.प./ल.स.प.' }, boardAligned: true },
          { id: 'math8_percentage_mixture', title: { en: 'Percentages, Mixture, Time & Work', bn: 'শতকরা, মিশ্রণ এবং সময় ও কার্য', hi: 'प्रतिशत, मिश्रण और समय तथा कार्य' }, boardAligned: true },
          { id: 'math8_angles_parallelograms', title: { en: 'Parallel Lines, Interior Angles of Polygons & Parallelograms', bn: 'সমান্তরাল সরলরেখা, বহুভুজের কোণ ও সামান্তরিকের ধর্ম', hi: 'समांतर रेखाएँ, बहुभुज के कोण और समांतर चतुर्भुज के गुण' }, boardAligned: true },
        ],
      },
      9: {
        status: 'prescribed',
        boardNote: {
          en: 'Verified WBBSE Class 9 Ganit Prakash (গণিত প্রকাশ) syllabus',
          bn: 'WBBSE নবম শ্রেণি গণিত প্রকাশ পাঠ্যক্রম',
          hi: 'WBBSE कक्षा 9 गणित प्रकाश पाठ्यक्रम',
        },
        chapters: [
          { id: 'math9_real_numbers_poly', title: { en: 'Real Numbers, Laws of Indices & Polynomials', bn: 'বাস্তব সংখ্যা, সূচকের নিয়মাবলি ও বহুপদী সংখ্যামালা', hi: 'वास्तविक संख्याएँ, घातांक के नियम और बहुपद' }, boardAligned: true },
          { id: 'math9_profit_loss_linear', title: { en: 'Profit & Loss and Linear Simultaneous Equations', bn: 'লাভ ও ক্ষতি এবং রৈখিক সহসমীকরণ (দুই চলবিশিষ্ট)', hi: 'लाभ और हानि तथा दो चरों वाले रैखिक समीकरण' }, boardAligned: true },
          { id: 'math9_mensuration_coord', title: { en: 'Area/Perimeter of Triangles & Circles, Coordinate Geometry', bn: 'ত্রিভুজ ও বৃত্তের পরিসীমা-ক্ষেত্রফল এবং স্থানাঙ্ক জ্যামিতি (দূরত্ব সূত্র)', hi: 'त्रिभुज एवं वृत्त का क्षेत्रफल और निर्देशांक ज्यामिति' }, boardAligned: true },
        ],
      },
      10: {
        status: 'prescribed',
        boardNote: {
          en: 'Verified WBBSE Class 10 (Madhyamik) Ganit Prakash (গণিত প্রকাশ) syllabus',
          bn: 'WBBSE দশম শ্রেণি (মাধ্যমিক) গণিত প্রকাশ পাঠ্যক্রম',
          hi: 'WBBSE कक्षा 10 (माध्यमिक) गणित प्रकाश पाठ्यक्रम',
        },
        chapters: [
          { id: 'math10_interest_partnership', title: { en: 'Simple & Compound Interest and Partnership Business', bn: 'সরল ও চক্রবৃদ্ধি সুদ এবং অংশীদারি কারবার', hi: 'साधारण एवं चक्रवृद्धि ब्याज और साझेदारी व्यवसाय' }, boardAligned: true },
          { id: 'math10_quadratic_surds', title: { en: 'Quadratic Equations in One Variable, Variation & Quadratic Surds', bn: 'একচলবিশিষ্ট দ্বিঘাত সমীকরণ, ভেদ ও দ্বিঘাত করণী', hi: 'द्विघात समीकरण, विचरण (Variation) और द्विघात करणी' }, boardAligned: true },
          { id: 'math10_mensuration_trig', title: { en: '3D Mensuration (Sphere, Cone, Cylinder), Circle Theorems & Trigonometry', bn: 'পরিমিতি (গোলক, শঙ্কু, চোঙ), বৃত্ত সম্পর্কিত উপপাদ্য ও ত্রিকোণমিতি', hi: 'ठोस क्षेत्रमिति (गोला, शंकु, बेलन), वृत्त प्रमेय और त्रिकोणमिति' }, boardAligned: true },
        ],
      },
    },
  },
  {
    id: 'hindi',
    name: {
      en: 'Hindi',
      bn: 'হিন্দি (Hindi)',
      hi: 'हिन्दी (Hindi)',
    },
    shortDesc: {
      en: 'व्याकरण (Grammar), शब्दावली (Vocabulary), वर्तनी (Spelling), वाक्य रचना, अपठित गद्यांश & literature.',
      bn: 'হিন্দি ব্যাকরণ (व्याकरण), শব্দভাণ্ডার, বানান (वर्तनी), বাক্য গঠন, বোধপরীক্ষণ ও সাহিত্য।',
      hi: 'व्याकरण, शब्दावली, वर्तनी, वाक्य रचना, अपठित गद्यांश एवं साहित्य।',
    },
    curriculumByClass: {
      5: {
        status: 'language_elective',
        boardNote: {
          en: 'WBBPE Hindi Medium / Additional Language Practice (Foundational Grammar & Comprehension)',
          bn: 'WBBPE হিন্দি মাধ্যম / অতিরিক্ত ভাষা অনুশীলন (মৌলিক হিন্দি ব্যাকরণ ও বোধপরীক্ষণ)',
          hi: 'WBBPE हिन्दी माध्यम / अतिरिक्त भाषा अभ्यास (मौलिक व्याकरण एवं बोध)',
        },
        chapters: [
          { id: 'hi5_varnamala_matra', title: { en: 'Varnamala, Matra & Spelling (वर्णमाला और वर्तनी)', bn: 'বর্ণমালা, মাত্রা ও বানান (वर्णमाला और वर्तनी)', hi: 'वर्णमाला, स्वर-व्यंजन और वर्तनी शुद्धि' }, boardAligned: true },
          { id: 'hi5_sangya_sarvanam', title: { en: 'Sangya, Sarvanam, Ling & Vachan (संज्ञा, सर्वनाम, लिंग, वचन)', bn: 'বিশেষ্য, সর্বনাম, লিঙ্গ ও বচন (संज्ञा, सर्वनाम, लिंग, वचन)', hi: 'संज्ञा, सर्वनाम, लिंग और वचन' }, boardAligned: true },
          { id: 'hi5_vilom_paryay', title: { en: 'Synonyms, Antonyms & Unseen Passage (पर्यायवाची, विलोम, गद्यांश)', bn: 'সমার্থক শব্দ, বিপরীত শব্দ ও বোধপরীক্ষণ', hi: 'पर्यायवाची, विलोम शब्द और अपठित गद्यांश' }, boardAligned: true },
        ],
      },
      6: {
        status: 'language_elective',
        boardNote: {
          en: 'WBBSE Hindi First/Third Language Curriculum & Foundational Grammar',
          bn: 'WBBSE প্রথম/তৃতীয় ভাষা হিন্দি পাঠ্যক্রম ও ব্যাকরণ',
          hi: 'WBBSE प्रथम/तृतीय भाषा हिन्दी पाठ्यक्रम एवं व्याकरण',
        },
        chapters: [
          { id: 'hi6_visheshan_kriya', title: { en: 'Visheshan, Kriya & Kaal (विशेषण, क्रिया और काल)', bn: 'বিশেষণ, ক্রিয়া ও কাল (विशेषण, क्रिया और काल)', hi: 'विशेषण, क्रिया और काल के भेद' }, boardAligned: true },
          { id: 'hi6_upsarg_pratyay', title: { en: 'Upsarg, Pratyay & Shabda Bhandar (उपसर्ग, प्रत्यय और शब्द-भंडार)', bn: 'উপসর্গ, প্রত্যয় ও শব্দভাণ্ডার (उपसर्ग और प्रत्यय)', hi: 'उपसर्ग, प्रत्यय और तत्सम-तद्भव शब्द' }, boardAligned: true },
          { id: 'hi6_muhavare_gadyansh', title: { en: 'Idioms & Unseen Comprehension (मुहावरे और अपठित गद्यांश)', bn: 'বাগধারা ও বোধপরীক্ষণ (मुहावरे और अपठित गद्यांश)', hi: 'प्रमुख मुहावरे और अपठित गद्यांश' }, boardAligned: true },
        ],
      },
      7: {
        status: 'language_elective',
        boardNote: {
          en: 'WBBSE Class 7 Hindi First/Third Language Grammar & Literature Practice',
          bn: 'WBBSE সপ্তম শ্রেণি প্রথম/তৃতীয় ভাষা হিন্দি ব্যাকরণ ও সাহিত্য অনুশীলন',
          hi: 'WBBSE कक्षा 7 प्रथम/तृतीय भाषा हिन्दी व्याकरण एवं साहित्य',
        },
        chapters: [
          { id: 'hi7_sandhi_karak', title: { en: 'Sandhi & Karak Vibhakti (संधि और कारक)', bn: 'সন্ধি ও কারক বিভক্তি (संधि और कारक)', hi: 'संधि-विच्छेद और कारक के भेद' }, boardAligned: true },
          { id: 'hi7_vakya_shuddhi', title: { en: 'Sentence Construction & Error Correction (वाक्य रचना और अशुद्धि शोधन)', bn: 'বাক্য গঠন ও শুদ্ধিকরণ (वाक्य रचना और अशुद्धि शोधन)', hi: 'वाक्य रचना, वर्तनी और वाक्य अशुद्धि शोधन' }, boardAligned: true },
          { id: 'hi7_anek_shabdon', title: { en: 'One-word Substitution & Comprehension (अनेक शब्दों के लिए एक शब्द)', bn: 'এককথায় প্রকাশ ও বোধপরীক্ষণ', hi: 'अनेक शब्दों के लिए एक शब्द और अपठित बोध' }, boardAligned: true },
        ],
      },
      8: {
        status: 'language_elective',
        boardNote: {
          en: 'WBBSE Class 8 Hindi First/Third Language Grammar & Comprehension',
          bn: 'WBBSE অষ্টম শ্রেণি প্রথম/তৃতীয় ভাষা হিন্দি ব্যাকরণ ও বোধপরীক্ষণ',
          hi: 'WBBSE कक्षा 8 प्रथम/तृतीय भाषा हिन्दी व्याकरण एवं बोध',
        },
        chapters: [
          { id: 'hi8_samas_avyay', title: { en: 'Samas & Avyay / Indeclinables (समास और अव्यय)', bn: 'সমাস ও অব্যয় (समास और अव्यय)', hi: 'समास-विग्रह और अव्यय (अविकारी शब्द)' }, boardAligned: true },
          { id: 'hi8_vakya_bhed', title: { en: 'Arth ke Aadhar par Vakya Bhed & Muhavare', bn: 'অর্থ অনুসারে বাক্যের শ্রেণীবিভাগ ও প্রবাদ', hi: 'अर्थ के आधार पर वाक्य भेद एवं मुहावरे-लोकोक्तियाँ' }, boardAligned: true },
          { id: 'hi8_sahitya_gadyansh', title: { en: 'Hindi Prose/Poetry Appreciation & Unseen Comprehension', bn: 'হিন্দি গদ্য-পদ্য ও বোধপরীক্ষণ', hi: 'हिन्दी गद्य-पद्य एवं अपठित गद्यांश' }, boardAligned: true },
        ],
      },
      9: {
        status: 'language_elective',
        boardNote: {
          en: 'WBBSE Class 9 Hindi Sahitya Sanchayan & Vyakaran (First/Second Language)',
          bn: 'WBBSE নবম শ্রেণি হিন্দি সাহিত্য ও ব্যাকরণ (অতিরিক্ত অনুশীলন / প্রথম ভাষা)',
          hi: 'WBBSE कक्षा 9 हिन्दी साहित्य संचयन एवं व्याकरण',
        },
        chapters: [
          { id: 'hi9_alankar_chhand', title: { en: 'Shabda Nirman, Sandhi & Alankar Intro (शब्द निर्माण, संधि, अलंकार)', bn: 'শব্দ গঠন, সন্ধি ও অলঙ্কার পরিচয়', hi: 'शब्द निर्माण, संधि और अलंकार परिचय' }, boardAligned: true },
          { id: 'hi9_vakya_rupantaran', title: { en: 'Rachna ke Aadhar par Vakya & Shuddhi (रचना के आधार पर वाक्य भेद)', bn: 'গঠন অনুসারে বাক্যের শ্রেণীবিভাগ ও শুদ্ধিকরণ', hi: 'रचना के आधार पर वाक्य भेद और वाक्य शुद्धिकरण' }, boardAligned: true },
          { id: 'hi9_gadyansh_sahitya', title: { en: 'Premchand, Kabir & Unseen Literary Comprehension', bn: 'প্রেমচাঁদ, কবীর ও সাহিত্য বোধপরীক্ষণ', hi: 'प्रेमचंद, कबीर के दोहे एवं अपठित गद्यांश' }, boardAligned: true },
        ],
      },
      10: {
        status: 'language_elective',
        boardNote: {
          en: 'WBBSE Class 10 (Madhyamik) Hindi Vyakaran & Sahitya Sanchayan',
          bn: 'WBBSE দশম শ্রেণি (মাধ্যমিক) হিন্দি ব্যাকরণ ও সাহিত্য সঞ্চয়ন',
          hi: 'WBBSE कक्षा 10 (माध्यमिक) हिन्दी व्याकरण एवं साहित्य संचयन',
        },
        chapters: [
          { id: 'hi10_karak_samas_vachya', title: { en: 'Karak, Samas & Vachya Parivartan (कारक, समास और वाच्य परिवर्तन)', bn: 'কারক, সমাস ও বাচ্য পরিবর্তন (कारक, समास और वाच्य)', hi: 'कारक, समास और वाच्य परिवर्तन (कर्तृवाच्य, कर्मवाच्य, भाववाच्य)' }, boardAligned: true },
          { id: 'hi10_vakya_muhavare', title: { en: 'Vakya Rupantaran, Idioms & Vocabulary (वाक्य रूपांतरण और मुहावरे)', bn: 'বাক্য রূপান্তর, বাগধারা ও শব্দভাণ্ডার', hi: 'वाक्य रूपांतरण (सरल, संयुक्त, मिश्र) एवं मुहावरे' }, boardAligned: true },
          { id: 'hi10_sahitya_bodh', title: { en: 'Madhyamik Hindi Literature & Advanced Unseen Passage', bn: 'মাধ্যমিক হিন্দি সাহিত্য ও উন্নত বোধপরীক্ষণ', hi: 'माध्यमिक हिन्दी साहित्य एवं उच्च स्तरीय अपठित गद्यांश' }, boardAligned: true },
        ],
      },
    },
  },
  {
    id: 'physical_science',
    name: {
      en: 'Physical Science',
      bn: 'ভৌত বিজ্ঞান (Physical Science)',
      hi: 'भौतिक विज्ञान (Physical Science)',
    },
    shortDesc: {
      en: 'Physics & Chemistry concepts, units & measurements, force, energy, light, chemical reactions & numericals.',
      bn: 'পদার্থবিদ্যা ও রসায়নের ধারণা, একক ও পরিমাপ, বল, শক্তি, আলো, রাসায়নিক বিক্রিয়া ও গাণিতিক সমস্যা।',
      hi: 'भौतिकी एवं रसायन विज्ञान के सिद्धांत, मापन, बल, ऊर्जा, प्रकाश, रासायनिक अभिक्रियाएँ और आंकिक प्रश्न।',
    },
    curriculumByClass: {
      5: {
        status: 'integrated_evs',
        boardNote: {
          en: 'Additional Focused Practice: In WBBPE Class 5, Physical Science concepts are integrated within "Amader Poribesh" (Environmental Studies).',
          bn: 'অতিরিক্ত বিষয়ভিত্তিক অনুশীলন: WBBPE পঞ্চম শ্রেণিতে ভৌত বিজ্ঞানের ধারণাগুলি "আমাদের পরিবেশ" পাঠ্যবইয়ের অন্তর্ভুক্ত।',
          hi: 'अतिरिक्त विषय-आधारित अभ्यास: WBBPE कक्षा 5 में भौतिक विज्ञान के विषय "आमादेर परिवेश" (पर्यावरण अध्ययन) में समाहित हैं।',
        },
        chapters: [
          { id: 'ps5_matter_states', title: { en: 'States of Matter: Solid, Liquid & Gas (পদার্থের অবস্থা)', bn: 'পদার্থের তিন অবস্থা: কঠিন, তরল ও গ্যাসীয়', hi: 'पदार्थ की अवस्थाएँ: ठोस, द्रव और गैस' }, boardAligned: true },
          { id: 'ps5_shadow_light', title: { en: 'Light, Shadows, Eclipses & Sky Observation (আলো ও ছায়া)', bn: 'আলো, ছায়া এবং দিন-রাত্রি ও গ্রহণ', hi: 'प्रकाश, छाया और दिन-रात एवं ग्रहण' }, boardAligned: true },
          { id: 'ps5_water_energy', title: { en: 'Water Cycle, Resources & Simple Energy Sources', bn: 'জলচক্র, সম্পদ ও শক্তির প্রাথমিক উৎস', hi: 'जल चक्र, संसाधन और ऊर्जा के प्राथमिक स्रोत' }, boardAligned: true },
        ],
      },
      6: {
        status: 'prescribed',
        boardNote: {
          en: 'Verified WBBSE Class 6 Paribesh O Bigyan (পরিবেশ ও বিজ্ঞান) Physical Science units',
          bn: 'WBBSE ষষ্ঠ শ্রেণি পরিবেশ ও বিজ্ঞান (ভৌত বিজ্ঞান অংশ)',
          hi: 'WBBSE कक्षा 6 परिवेश ओ विज्ञान (भौतिक विज्ञान खंड)',
        },
        chapters: [
          { id: 'ps6_changes_elements', title: { en: 'Physical & Chemical Changes, Elements, Compounds & Mixtures', bn: 'ভৌত ও রাসায়নিক পরিবর্তন এবং মৌলিক, যৌগিক ও মিশ্র পদার্থ', hi: 'भौतिक एवं रासायनिक परिवर्तन तथा तत्व, यौगिक और मिश्रण' }, boardAligned: true },
          { id: 'ps6_measurement', title: { en: 'Measurement of Length, Mass, Area, Volume & Time (পরিমাপ)', bn: 'ভৌত রাশির পরিমাপ ও SI একক', hi: 'भौतिक राशियों का मापन और SI मात्रक' }, boardAligned: true },
          { id: 'ps6_force_machines', title: { en: 'Force, Energy & Simple Machines (বল, শক্তি ও সরল যন্ত্র)', bn: 'বল ও শক্তির প্রাথমিক ধারণা এবং সরল যন্ত্র (লিভার, নততল)', hi: 'बल, ऊर्जा की प्रारंभिक अवधारणा और सरल मशीनें' }, boardAligned: true },
        ],
      },
      7: {
        status: 'prescribed',
        boardNote: {
          en: 'Verified WBBSE Class 7 Paribesh O Bigyan (পরিবেশ ও বিজ্ঞান) Physical Science units',
          bn: 'WBBSE সপ্তম শ্রেণি পরিবেশ ও বিজ্ঞান (ভৌত বিজ্ঞান অংশ)',
          hi: 'WBBSE कक्षा 7 परिवेश ओ विज्ञान (भौतिक विज्ञान खंड)',
        },
        chapters: [
          { id: 'ps7_heat_light', title: { en: 'Heat (Temperature, Thermometry) & Light (Reflection, Dispersion)', bn: 'তাপ (উষ্ণতা ও ক্যালোরিমিতি) এবং আলো (প্রতিফলন ও বিচ্ছুরণ)', hi: 'ऊष्मा (तापमान) और प्रकाश (परावर्तन एवं वर्ण-विक्षेपण)' }, boardAligned: true },
          { id: 'ps7_time_motion_electricity', title: { en: 'Time & Motion (Speed, Velocity, Newton’s Laws) & Magnet/Electricity', bn: 'সময় ও গতি (দ্রুতি, বেগ, নিউটনের সূত্র) এবং চুম্বক ও তড়িৎ', hi: 'समय और गति (चाल, वेग, न्यूटन के नियम) तथा चुंबक एवं विद्युत' }, boardAligned: true },
          { id: 'ps7_atoms_valency', title: { en: 'Atoms, Molecules, Valency & Chemical Equations', bn: 'পরমাণু, অণু, যোজ্যতা ও রাসায়নিক সমীকরণ', hi: 'परमाणु, अणु, संयोजकता और रासायनिक समीकरण' }, boardAligned: true },
        ],
      },
      8: {
        status: 'prescribed',
        boardNote: {
          en: 'Verified WBBSE Class 8 Paribesh O Bigyan (পরিবেশ ও বিজ্ঞান) Physical Science units',
          bn: 'WBBSE অষ্টম শ্রেণি পরিবেশ ও বিজ্ঞান (ভৌত বিজ্ঞান অংশ)',
          hi: 'WBBSE कक्षा 8 परिवेश ओ विज्ञान (भौतिक विज्ञान खंड)',
        },
        chapters: [
          { id: 'ps8_force_pressure', title: { en: 'Force, Pressure, Buoyancy & Coulomb’s Law (বল ও চাপ)', bn: 'বল ও চাপ, প্লবতা এবং স্থির তড়িৎ (কুলম্বের সূত্র)', hi: 'बल, दाब, उत्प्लावकता और स्थिर विद्युत' }, boardAligned: true },
          { id: 'ps8_matter_structure', title: { en: 'Atomic Structure, Ionic/Covalent Bonding & Chemical Reactions', bn: 'পদার্থের গঠন (ইলেকট্রন, প্রোটন, নিউট্রন), তড়িৎযোজী-সমযোজী বন্ধন ও বিক্রিয়া', hi: 'परमाणु संरचना, आयनिक/सहसंयोजक बंधन और रासायनिक अभिक्रियाएँ' }, boardAligned: true },
          { id: 'ps8_heat_light_mirror', title: { en: 'Heat Transfer (Conduction, Convection, Radiation) & Refraction/Mirrors', bn: 'তাপ সঞ্চালন এবং আলোর প্রতিসরণ ও গোলীয় দর্পণ', hi: 'ऊष्मा संचरण और प्रकाश का अपवर्तन एवं दर्पण' }, boardAligned: true },
        ],
      },
      9: {
        status: 'prescribed',
        boardNote: {
          en: 'Verified WBBSE Class 9 Physical Science & Environment (ভৌত বিজ্ঞান ও পরিবেশ) syllabus',
          bn: 'WBBSE নবম শ্রেণি ভৌত বিজ্ঞান ও পরিবেশ পাঠ্যক্রম',
          hi: 'WBBSE कक्षा 9 भौतिक विज्ञान एवं पर्यावरण पाठ्यक्रम',
        },
        chapters: [
          { id: 'ps9_measurement_motion', title: { en: 'Measurement, Units, Force & Newton’s Laws of Motion', bn: 'পরিমাপ ও একক এবং বল ও গতি (নিউটনের গতিসূত্র ও রৈখিক ভরবেগ)', hi: 'मापन और मात्रक तथा बल एवं न्यूटन के गति नियम' }, boardAligned: true },
          { id: 'ps9_matter_structure_mole', title: { en: 'Atomic Structure, Mole Concept, Solutions & Acids-Bases-Salts', bn: 'পরমাণুর গঠন, মোল ধারণা, দ্রবণ এবং অ্যাসিড, ক্ষার ও লবণ', hi: 'परमाणु संरचना, मोल अवधारणा, विलयन और अम्ल, क्षार एवं लवण' }, boardAligned: true },
          { id: 'ps9_work_energy_sound', title: { en: 'Work, Power, Energy, Heat & Sound Waves', bn: 'কার্য, ক্ষমতা, শক্তি, তাপ এবং শব্দ তরঙ্গ', hi: 'कार्य, शक्ति, ऊर्जा, ऊष्मा और ध्वनि तरंगें' }, boardAligned: true },
        ],
      },
      10: {
        status: 'prescribed',
        boardNote: {
          en: 'Verified WBBSE Class 10 (Madhyamik) Physical Science (ভৌত বিজ্ঞান) syllabus',
          bn: 'WBBSE দশম শ্রেণি (মাধ্যমিক) ভৌত বিজ্ঞান পাঠ্যক্রম',
          hi: 'WBBSE कक्षा 10 (माध्यमिक) भौतिक विज्ञान पाठ्यक्रम',
        },
        chapters: [
          { id: 'ps10_gas_laws_light', title: { en: 'Behaviour of Gases (Boyle’s & Charles’s Laws) & Light (Lenses, Prism)', bn: 'গ্যাসের আচরণ (বয়েল ও চার্লসের সূত্র) এবং আলো (লেন্স ও প্রিজম)', hi: 'गैसों का व्यवहार (बॉयल एवं चार्ल्स के नियम) और प्रकाश (लेंस व प्रिज्म)' }, boardAligned: true },
          { id: 'ps10_electricity_nuclear', title: { en: 'Current Electricity (Ohm’s Law, Joule’s Law) & Atomic Nucleus', bn: 'চলতড়িৎ (ওহমের সূত্র, জুলের সূত্র, তড়িৎ ক্ষমতা) ও পরমাণুর নিউক্লিয়াস', hi: 'धारा विद्युत (ओम का नियम, जूल का नियम) और परमाणु नाभिक' }, boardAligned: true },
          { id: 'ps10_periodic_bonding_organic', title: { en: 'Periodic Table, Chemical Bonding, Electrolysis & Organic Chemistry', bn: 'পর্যায় সারণি, রাসায়নিক বন্ধন, তড়িৎ বিশ্লেষণ ও জৈব রসায়ন', hi: 'आवर्त सारणी, रासायनिक बंधन, विद्युत अपघटन और कार्बनिक रसायन' }, boardAligned: true },
        ],
      },
    },
  },
  {
    id: 'life_science',
    name: {
      en: 'Life Science',
      bn: 'জীবন বিজ্ঞান (Life Science)',
      hi: 'जीव विज्ञान (Life Science)',
    },
    shortDesc: {
      en: 'Cells, plant & animal physiology, human biology, genetics, evolution, biodiversity & ecology.',
      bn: 'কোষ, উদ্ভিদ ও প্রাণী শারীরবিদ্যা, মানবদেহ, বংশগতি, অভিব্যক্তি, জীববৈচিত্র্য ও বাস্তুসংস্থান।',
      hi: 'कोशिका, पादप एवं जंतु कार्यिकी, मानव शरीर क्रिया विज्ञान, आनुवंशिकी, विकास और पारिस्थितिकी।',
    },
    curriculumByClass: {
      5: {
        status: 'integrated_evs',
        boardNote: {
          en: 'Additional Focused Practice: In WBBPE Class 5, Life Science concepts are integrated within "Amader Poribesh" (Environmental Studies).',
          bn: 'অতিরিক্ত বিষয়ভিত্তিক অনুশীলন: WBBPE পঞ্চম শ্রেণিতে জীবন বিজ্ঞানের ধারণাগুলি "আমাদের পরিবেশ" পাঠ্যবইয়ের অন্তর্ভুক্ত।',
          hi: 'अतिरिक्त विषय-आधारित अभ्यास: WBBPE कक्षा 5 में जीव विज्ञान के विषय "आमादेर परिवेश" (पर्यावरण अध्ययन) में समाहित हैं।',
        },
        chapters: [
          { id: 'ls5_human_body', title: { en: 'Human Body: Skin, Muscles, Bones, Heart & Lungs (মানবদেহ)', bn: 'মানবদেহ: ত্বক, পেশি, অস্থি, হৃৎপিণ্ড ও ফুসফুস', hi: 'मानव शरीर: त्वचा, मांसपेशियाँ, अस्थियाँ, हृदय और फेफड़े' }, boardAligned: true },
          { id: 'ls5_plants_animals', title: { en: 'Plant Life, Medicinal Plants & Local Biodiversity', bn: 'উদ্ভিদ জগৎ, ভেষজ উদ্ভিদ ও স্থানীয় জীববৈচিত্র্য', hi: 'पादप जगत, औषधीय पौधे और स्थानीय जैव विविधता' }, boardAligned: true },
          { id: 'ls5_food_health', title: { en: 'Food, Safe Drinking Water & Healthy Habits', bn: 'খাদ্য, নিরাপদ পানীয় জল ও স্বাস্থ্যবিধি', hi: 'भोजन, सुरक्षित पेयजल और स्वास्थ्य नियम' }, boardAligned: true },
        ],
      },
      6: {
        status: 'prescribed',
        boardNote: {
          en: 'Verified WBBSE Class 6 Paribesh O Bigyan (পরিবেশ ও বিজ্ঞান) Life Science units',
          bn: 'WBBSE ষষ্ঠ শ্রেণি পরিবেশ ও বিজ্ঞান (জীবন বিজ্ঞান অংশ)',
          hi: 'WBBSE कक्षा 6 परिवेश ओ विज्ञान (जीव विज्ञान खंड)',
        },
        chapters: [
          { id: 'ls6_symbiosis_classification', title: { en: 'Interdependence of Organisms & Classification of Plants/Animals', bn: 'পরিবেশ ও জীবজগতের পারস্পরিক নির্ভরতা এবং জীবজগতের শ্রেণিবিন্যাস', hi: 'जीवों की पारस्परिक निर्भरता और पादप/जंतुओं का वर्गीकरण' }, boardAligned: true },
          { id: 'ls6_human_systems', title: { en: 'Human Body: Blood, Heart, Lungs, Bones & Joints', bn: 'মানুষের শরীর: রক্ত, হৃৎপিণ্ড, ফুসফুস, অস্থি ও অস্থিসন্ধি', hi: 'मानव शरीर: रक्त, हृदय, फेफड़े, अस्थियाँ और जोड़' }, boardAligned: true },
          { id: 'ls6_insects_waste', title: { en: 'Social Insects (Honeybee, Ants) & Waste Management', bn: 'সমাজবদ্ধ জীব (মৌমাছি, পিঁপড়ে) এবং বর্জ্য পদার্থ ও পরিবেশ', hi: 'सामाजिक कीट (मधुमक्खी, चींटी) और अपशिष्ट प्रबंधन' }, boardAligned: true },
        ],
      },
      7: {
        status: 'prescribed',
        boardNote: {
          en: 'Verified WBBSE Class 7 Paribesh O Bigyan (পরিবেশ ও বিজ্ঞান) Life Science units',
          bn: 'WBBSE সপ্তম শ্রেণি পরিবেশ ও বিজ্ঞান (জীবন বিজ্ঞান অংশ)',
          hi: 'WBBSE कक्षा 7 परिवेश ओ विज्ञान (जीव विज्ञान खंड)',
        },
        chapters: [
          { id: 'ls7_nutrition_vitamins', title: { en: 'Components of Food: Carbohydrates, Proteins, Lipids, Vitamins & Minerals', bn: 'মানুষের খাদ্য: শর্করা, প্রোটিন, লিপিড, ভিটামিন, খনিজ মৌল ও জল', hi: 'भोजन के घटक: कार्बोहाइड्रेट, प्रोटीन, वसा, विटामिन और खनिज' }, boardAligned: true },
          { id: 'ls7_plant_morphology', title: { en: 'Plant Morphology: Root, Stem, Leaf, Flower, Fruit & Seed (উদ্ভিদের অঙ্গ)', bn: 'উদ্ভিদের বিভিন্ন অংশের গঠন ও কাজ (মূল, কাণ্ড, পাতা, ফুল, ফল ও বীজ)', hi: 'पादप आकारिकी: जड़, तना, पत्ती, फूल, फल और बीज' }, boardAligned: true },
          { id: 'ls7_public_health', title: { en: 'Environment & Public Health, Communicable Diseases', bn: 'পরিবেশ ও জনস্বাস্থ্য এবং সংক্রামক রোগ', hi: 'पर्यावरण, जनस्वास्थ्य और संक्रामक रोग' }, boardAligned: true },
        ],
      },
      8: {
        status: 'prescribed',
        boardNote: {
          en: 'Verified WBBSE Class 8 Paribesh O Bigyan (পরিবেশ ও বিজ্ঞান) Life Science units',
          bn: 'WBBSE অষ্টম শ্রেণি পরিবেশ ও বিজ্ঞান (জীবন বিজ্ঞান অংশ)',
          hi: 'WBBSE कक्षा 8 परिवेश ओ विज्ञान (जीव विज्ञान खंड)',
        },
        chapters: [
          { id: 'ls8_cell_organelles', title: { en: 'Structure of Living Organisms: Cell, Organelles & Tissues (জীবদেহের গঠন)', bn: 'জীবদেহের গঠন: কোষ, কোষীয় অঙ্গাণু এবং উদ্ভিদ ও প্রাণী কলা', hi: 'जीवों की संरचना: कोशिका, कोशिकांग और पादप/जंतु ऊतक' }, boardAligned: true },
          { id: 'ls8_microbes_crop', title: { en: 'World of Microorganisms (Bacteria, Fungi, Viruses) & Crop Production', bn: 'অণুজীবের জগৎ (ব্যাকটেরিয়া, ছত্রাক, ভাইরাস) এবং শস্য উৎপাদন', hi: 'सूक्ष्मजीवों का संसार और फसल उत्पादन' }, boardAligned: true },
          { id: 'ls8_endocrine_biomes', title: { en: 'Human Endocrine System, Adolescence & Biomes/Forests', bn: 'অন্তঃক্ষরা গ্রন্থি ও বয়ঃসন্ধি এবং বিভিন্ন প্রাকৃতিক পরিবেশ ও বনভূমি', hi: 'मानव अंतःस्रावी तंत्र, किशोरावस्था और वन/बायोम' }, boardAligned: true },
        ],
      },
      9: {
        status: 'prescribed',
        boardNote: {
          en: 'Verified WBBSE Class 9 Life Science & Environment (জীবন বিজ্ঞান ও পরিবেশ) syllabus',
          bn: 'WBBSE নবম শ্রেণি জীবন বিজ্ঞান ও পরিবেশ পাঠ্যক্রম',
          hi: 'WBBSE कक्षा 9 जीव विज्ञान एवं पर्यावरण पाठ्यक्रम',
        },
        chapters: [
          { id: 'ls9_diversity_taxonomy', title: { en: 'Life & Its Diversity, Taxonomy & Five Kingdom Classification', bn: 'জীবন ও তার বৈচিত্র্য, বিন্যাসবিধি ও পাঁচ রাজ্য শ্রেণিবিন্যাস', hi: 'जीवन और उसकी विविधता, वर्गिकी एवं पाँच जगत वर्गीकरण' }, boardAligned: true },
          { id: 'ls9_biomolecules_cell_org', title: { en: 'Levels of Organization of Life: Biomolecules, Cell Organelles & Tissues', bn: 'জীবন সংগঠনের স্তর: জৈব অণু, কোষীয় অঙ্গাণু ও কলা', hi: 'जीवन संगठन के स्तर: जैव अणु, कोशिकांग और ऊतक' }, boardAligned: true },
          { id: 'ls9_physiological_processes', title: { en: 'Physiological Processes: Photosynthesis, Respiration, Nutrition, Circulation & Excretion', bn: 'জৈবনিক প্রক্রিয়া: সালোকসংশ্লেষ, শ্বসন, পুষ্টি, সংবহন ও রেচন', hi: 'जैविक प्रक्रियाएँ: प्रकाश संश्लेषण, श्वसन, पोषण, परिसंचरण और उत्सर्जन' }, boardAligned: true },
        ],
      },
      10: {
        status: 'prescribed',
        boardNote: {
          en: 'Verified WBBSE Class 10 (Madhyamik) Life Science (জীবন বিজ্ঞান) syllabus',
          bn: 'WBBSE দশম শ্রেণি (মাধ্যমিক) জীবন বিজ্ঞান পাঠ্যক্রম',
          hi: 'WBBSE कक्षा 10 (माध्यमिक) जीव विज्ञान पाठ्यक्रम',
        },
        chapters: [
          { id: 'ls10_control_coordination', title: { en: 'Control & Coordination in Living Organisms (Tropism, Hormones, Nervous System)', bn: 'জীবজগতে নিয়ন্ত্রণ ও সমন্বয় (চলন, হরমোন, স্নায়ুতন্ত্র ও গমন)', hi: 'जीवों में नियंत्रण और समन्वय (पादप/जंतु हार्मोन एवं तंत्रिका तंत्र)' }, boardAligned: true },
          { id: 'ls10_continuity_heredity', title: { en: 'Continuity of Life (Mitosis, Meiosis, Reproduction) & Heredity (Mendel’s Laws)', bn: 'জীবনের প্রবাহমানতা (কোষ বিভাজন, জনন) এবং বংশগতি ও জিনগত রোগ', hi: 'जीवन की निरंतरता (कोशिका विभाजन, प्रजनन) और आनुवंशिकी (मेंडल के नियम)' }, boardAligned: true },
          { id: 'ls10_evolution_environment', title: { en: 'Evolution & Adaptation and Environment, Nitrogen Cycle & Biodiversity Conservation', bn: 'অভিব্যক্তি ও অভিযোজন এবং পরিবেশ, নাইট্রোজেন চক্র ও জীববৈচিত্র্য সংরক্ষণ', hi: 'विकास एवं अनुकूलन तथा पर्यावरण, नाइट्रोजन चक्र और जैव विविधता संरक्षण' }, boardAligned: true },
        ],
      },
    },
  },
  {
    id: 'gk',
    name: {
      en: 'General Knowledge (GK)',
      bn: 'সাধারণ জ্ঞান (GK)',
      hi: 'सामान्य ज्ञान (GK)',
    },
    shortDesc: {
      en: 'Indian history, geography, culture, civics, constitution, science facts & sourced general awareness.',
      bn: 'ভারতের ইতিহাস, ভূগোল, সংস্কৃতি, পৌরনীতি, সংবিধান, বিজ্ঞান ও তথ্যসূত্রসহ সাধারণ জ্ঞান।',
      hi: 'भारतीय इतिहास, भूगोल, संस्कृति, नागरिक शास्त्र, संविधान, विज्ञान और सामान्य जागरूकता।',
    },
    curriculumByClass: {
      5: {
        status: 'additional_practice',
        boardNote: {
          en: 'Additional Enrichment Practice: General Knowledge is not a separate exam paper in WBBPE Class 5; draws on Amader Poribesh & national awareness.',
          bn: 'অতিরিক্ত অনুশীলন: WBBPE পঞ্চম শ্রেণিতে সাধারণ জ্ঞান পৃথক পরীক্ষার বিষয় নয়; আমাদের পরিবেশ ও জাতীয় তথ্যের ওপর ভিত্তি করে প্রস্তুত।',
          hi: 'अतिरिक्त संवर्धन अभ्यास: WBBPE कक्षा 5 में सामान्य ज्ञान एक अलग परीक्षा विषय नहीं है।',
        },
        chapters: [
          { id: 'gk5_india_wb_symbols', title: { en: 'National Symbols of India & West Bengal Heritage', bn: 'ভারতের জাতীয় প্রতীক ও পশ্চিমবঙ্গের ঐতিহ্য', hi: 'भारत के राष्ट्रीय प्रतीक और पश्चिम बंगाल की विरासत' }, boardAligned: false },
          { id: 'gk5_solar_earth', title: { en: 'Solar System, Continents, Oceans & Great Personalities', bn: 'সৌরজগৎ, মহাদেশ-মহাসাগর ও মনীষীদের জীবন', hi: 'सौरमंडल, महाद्वीप-महासागर और महान व्यक्तित्व' }, boardAligned: false },
        ],
      },
      6: {
        status: 'additional_practice',
        boardNote: {
          en: 'Additional Enrichment Practice beyond core WBBSE Class 6 subjects (History, Geography & General Awareness).',
          bn: 'অতিরিক্ত অনুশীলন: WBBSE ষষ্ঠ শ্রেণির ইতিহাস, ভূগোল ও সাধারণ সচেতনতার ওপর ভিত্তি করে অতিরিক্ত অনুশীলন।',
          hi: 'अतिरिक्त अभ्यास: WBBSE कक्षा 6 के मुख्य विषयों के अतिरिक्त सामान्य ज्ञान अभ्यास।',
        },
        chapters: [
          { id: 'gk6_ancient_india', title: { en: 'Ancient Indian Civilizations (Indus Valley, Vedic & Mauryan Era)', bn: 'প্রাচীন ভারতের সভ্যতা (হরপ্পা, বৈদিক ও মৌর্য যুগ)', hi: 'प्राचीन भारतीय सभ्यता (सिंधु घाटी, वैदिक और मौर्य काल)' }, boardAligned: false },
          { id: 'gk6_geography_india', title: { en: 'Physical Geography of India, Rivers & States', bn: 'ভারতের প্রাকৃতিক ভূগোল, নদনদী ও রাজ্যসমূহ', hi: 'भारत का भौतिक भूगोल, नदियाँ और राज्य' }, boardAligned: false },
        ],
      },
      7: {
        status: 'additional_practice',
        boardNote: {
          en: 'Additional Enrichment Practice beyond core WBBSE Class 7 subjects (History, Civics, Geography & Science GK).',
          bn: 'অতিরিক্ত অনুশীলন: WBBSE সপ্তম শ্রেণির পাঠ্যক্রমের বাইরে প্রতিযোগিতামূলক ও সাধারণ জ্ঞান অনুশীলন।',
          hi: 'अतिरिक्त अभ्यास: WBBSE कक्षा 7 के लिए सामान्य ज्ञान एवं नागरिक शास्त्र अभ्यास।',
        },
        chapters: [
          { id: 'gk7_medieval_india_civics', title: { en: 'Medieval Indian History, Indian Constitution & Democracy Basics', bn: 'মধ্যযুগের ভারতের ইতিহাস, ভারতীয় সংবিধান ও গণতন্ত্রের ধারণা', hi: 'मध्यकालीन भारतीय इतिहास, भारतीय संविधान और लोकतंत्र' }, boardAligned: false },
          { id: 'gk7_world_geography_science', title: { en: 'Continents (Asia, Europe, Africa) & Everyday Science Inventions', bn: 'এশিয়া, ইউরোপ ও আফ্রিকা মহাদেশ এবং বিজ্ঞানের আবিষ্কার', hi: 'महाद्वीप (एशिया, यूरोप, अफ्रीका) और वैज्ञानिक आविष्कार' }, boardAligned: false },
        ],
      },
      8: {
        status: 'additional_practice',
        boardNote: {
          en: 'Additional Enrichment Practice for Class 8 (Modern Indian History, Civics, Geography & Scientific Awareness).',
          bn: 'অতিরিক্ত অনুশীলন: অষ্টম শ্রেণির জন্য ভারতের আধুনিক ইতিহাস, সংবিধান ও বিজ্ঞান সচেতনতা।',
          hi: 'अतिरिक्त अभ्यास: कक्षा 8 के लिए आधुनिक भारतीय इतिहास, संविधान और विज्ञान जागरूकता।',
        },
        chapters: [
          { id: 'gk8_modern_india_freedom', title: { en: 'Indian Freedom Struggle, Reformers & Fundamental Rights/Duties', bn: 'ভারতের স্বাধীনতা সংগ্রাম, সমাজ সংস্কারক এবং মৌলিক অধিকার ও কর্তব্য', hi: 'भारतीय स्वतंत्रता संग्राम, समाज सुधारक और मौलिक अधिकार' }, boardAligned: false },
          { id: 'gk8_climate_resources', title: { en: 'Climate, Natural Resources, ISRO Space Milestones & Culture', bn: 'জলবায়ু, প্রাকৃতিক সম্পদ, ISRO মহাকাশ অভিযান ও সংস্কৃতি', hi: 'जलवायु, प्राकृतिक संसाधन, ISRO अंतरिक्ष मिशन और संस्कृति' }, boardAligned: false },
        ],
      },
      9: {
        status: 'additional_practice',
        boardNote: {
          en: 'Additional Enrichment Practice for Class 9 (West Bengal & World History, Geography, Polity & Sourced Current Awareness).',
          bn: 'অতিরিক্ত অনুশীলন: নবম শ্রেণির জন্য পশ্চিমবঙ্গের ভূগোল, বিশ্ব ইতিহাস, সংবিধান ও তথ্যসূত্রসহ সাম্প্রতিক জ্ঞান।',
          hi: 'अतिरिक्त अभ्यास: कक्षा 9 के लिए पश्चिम बंगाल का भूगोल, विश्व इतिहास और राजव्यवस्था।',
        },
        chapters: [
          { id: 'gk9_wb_geography_world', title: { en: 'Geography of West Bengal, Earth Movements & Modern World History', bn: 'পশ্চিমবঙ্গের ভূগোল, পৃথিবীর গতি ও আধুনিক বিশ্ব ইতিহাস', hi: 'पश्चिम बंगाल का भूगोल, पृथ्वी की गतियाँ और आधुनिक विश्व इतिहास' }, boardAligned: false },
          { id: 'gk9_indian_polity_science', title: { en: 'Indian Parliamentary System, Organizations (UN, SAARC) & Science GK', bn: 'ভারতীয় সংসদীয় ব্যবস্থা, আন্তর্জাতিক সংস্থা (UN, SAARC) ও বিজ্ঞান', hi: 'भारतीय संसदीय प्रणाली, अंतर्राष्ट्रीय संगठन (UN, SAARC) और विज्ञान' }, boardAligned: false },
        ],
      },
      10: {
        status: 'additional_practice',
        boardNote: {
          en: 'Additional Enrichment Practice for Class 10 (Indian National Movement, Economic Geography, Polity & Sourced Awareness).',
          bn: 'অতিরিক্ত অনুশীলন: দশম শ্রেণির জন্য জাতীয়তাবাদী আন্দোলন, ভারতের অর্থনৈতিক ভূগোল ও সাধারণ জ্ঞান।',
          hi: 'अतिरिक्त अभ्यास: कक्षा 10 के लिए भारतीय राष्ट्रीय आंदोलन, आर्थिक भूगोल और सामान्य ज्ञान।',
        },
        chapters: [
          { id: 'gk10_national_movement_culture', title: { en: '19th–20th Century Indian Renaissance, Freedom Movement & Cultural Heritage', bn: 'উনিশ-বিশ শতকের বাংলার নবজাগরণ, স্বাধীনতা আন্দোলন ও সাংস্কৃতিক ঐতিহ্য', hi: '19वीं-20वीं सदी का भारतीय पुनर्जागरण, स्वतंत्रता आंदोलन और सांस्कृतिक विरासत' }, boardAligned: false },
          { id: 'gk10_india_geo_polity_space', title: { en: 'Indian Agriculture, Industries, Remote Sensing, Constitution & ISRO Missions', bn: 'ভারতের কৃষি, শিল্প, উপগ্রহ চিত্র, সংবিধান ও ISRO মহাকাশ অভিযান', hi: 'भारतीय कृषि, उद्योग, सुदूर संवेदन, संविधान और ISRO मिशन' }, boardAligned: false },
        ],
      },
    },
  },
];

export function getSubjectDefinition(subjectId: SubjectId): SubjectDefinition {
  return SUBJECT_LIST.find((s) => s.id === subjectId) || SUBJECT_LIST[0];
}

export function getClassSubjectCurriculum(
  classLevel: ClassLevel,
  subjectId: SubjectId
): ClassSubjectCurriculum {
  const sub = getSubjectDefinition(subjectId);
  return sub.curriculumByClass[classLevel];
}

export function getSubjectsForClass(classLevel: ClassLevel): SubjectDefinition[] {
  return SUBJECT_LIST.filter((sub) => {
    const classCurr = sub.curriculumByClass[classLevel];
    return Boolean(classCurr && Array.isArray(classCurr.chapters) && classCurr.chapters.length > 0);
  });
}
