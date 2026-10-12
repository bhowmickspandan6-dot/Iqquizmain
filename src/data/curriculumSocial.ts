import { SubjectDefinition, ch } from './curriculumTypes';

const TB_EVS_5 = {
  en: 'Amader Paribesh (Class V — WBBPE)',
  bn: 'আমাদের পরিবেশ (পঞ্চম শ্রেণি — WBBPE)',
  hi: 'आमादेर परिवेश (कक्षा 5 — WBBPE)',
};
const TB_HIST_6 = {
  en: 'Atit o Aitihya (Class VI — WBBSE)',
  bn: 'অতীত ও ঐতিহ্য (ষষ্ঠ শ্রেণি — WBBSE)',
  hi: 'अतीत ओ ऐतिह्य (कक्षा 6 — WBBSE)',
};
const TB_HIST_7 = {
  en: 'Atit o Aitihya (Class VII — WBBSE)',
  bn: 'অতীত ও ঐতিহ্য (সপ্তম শ্রেণি — WBBSE)',
  hi: 'अतीत ओ ऐतिह्य (कक्षा 7 — WBBSE)',
};
const TB_HIST_8 = {
  en: 'Atit o Aitihya (Class VIII — WBBSE)',
  bn: 'অতীত ও ঐতিহ্য (অষ্টম শ্রেণি — WBBSE)',
  hi: 'अतीत ओ ऐतिह्य (कक्षा 8 — WBBSE)',
};
const TB_HIST_9 = {
  en: 'Itihas o Paribesh (Class IX — WBBSE)',
  bn: 'ইতিহাস ও পরিবেশ (নবম শ্রেণি — WBBSE)',
  hi: 'इतिहास ओ परिवेश (कक्षा 9 — WBBSE)',
};
const TB_HIST_10 = {
  en: 'Itihas o Paribesh (Class X — WBBSE Madhyamik)',
  bn: 'ইতিহাস ও পরিবেশ (দশম শ্রেণি — WBBSE মাধ্যমিক)',
  hi: 'इतिहास ओ परिवेश (कक्षा 10 — WBBSE माध्यमिक)',
};

const TB_GEO_6 = {
  en: 'Amader Prithibi (Class VI — WBBSE)',
  bn: 'আমাদের পৃথিবী (ষষ্ঠ শ্রেণি — WBBSE)',
  hi: 'आमादेर पृथिवी (कक्षा 6 — WBBSE)',
};
const TB_GEO_7 = {
  en: 'Amader Prithibi (Class VII — WBBSE)',
  bn: 'আমাদের পৃথিবী (সপ্তম শ্রেণি — WBBSE)',
  hi: 'आमादेर पृथिवी (कक्षा 7 — WBBSE)',
};
const TB_GEO_8 = {
  en: 'Amader Prithibi (Class VIII — WBBSE)',
  bn: 'আমাদের পৃথিবী (অষ্টম শ্রেণি — WBBSE)',
  hi: 'आमादेर पृथिवी (कक्षा 8 — WBBSE)',
};
const TB_GEO_9 = {
  en: 'Bhugol o Paribesh (Class IX — WBBSE)',
  bn: 'ভূগোল ও পরিবেশ (নবম শ্রেণি — WBBSE)',
  hi: 'भूगोल ओ परिवेश (कक्षा 9 — WBBSE)',
};
const TB_GEO_10 = {
  en: 'Bhugol o Paribesh (Class X — WBBSE Madhyamik)',
  bn: 'ভূগোল ও পরিবেশ (দশম শ্রেণি — WBBSE মাধ্যমিক)',
  hi: 'भूगोल ओ परिवेश (कक्षा 10 — WBBSE माध्यमिक)',
};

export const HISTORY_SUBJECT: SubjectDefinition = {
  id: 'history',
  name: {
    en: 'History',
    bn: 'ইতিহাস (History)',
    hi: 'इतिहास (History)',
  },
  shortDesc: {
    en: 'Ancient, medieval, modern Indian & European history from official WBBSE Atit o Aitihya and Itihas o Paribesh textbooks.',
    bn: 'পশ্চিমবঙ্গ মধ্যশিক্ষা পর্ষদের অতীত ও ঐতিহ্য এবং ইতিহাস ও পরিবেশ পাঠ্যপুস্তকের প্রাচীন, মধ্যযুগীয় ও আধুনিক ভারতের এবং ইউরোপের ইতিহাস।',
    hi: 'WBBSE की अतीत ओ ऐतिह्य और इतिहास ओ परिवेश पाठ्यपुस्तकों से प्राचीन, मध्यकालीन और आधुनिक भारतीय एवं यूरोपीय इतिहास।',
  },
  domainGuardKeywords: [
    'history', 'civilization', 'harappa', 'vedic', 'maurya', 'gupta', 'sultanate', 'mughal', 'colonial', 'revolt', 'nationalism', 'renaissance', 'revolution',
  ],
  curriculumByClass: {
    5: {
      status: 'integrated_evs',
      verificationStatus: 'verified',
      applicableToClass: false,
      textbookName: TB_EVS_5,
      syllabusVersion: 'WBBPE Primary Syllabus',
      officialSource: 'WBBPE — Amader Paribesh Class V (Heritage & Freedom Struggle Units)',
      boardNote: {
        en: 'In Class 5, History & Heritage are integrated into Amader Paribesh.',
        bn: 'পঞ্চম শ্রেণিতে ইতিহাস ও ঐতিহ্য আমাদের পরিবেশ পাঠ্যপুস্তকের অন্তর্ভুক্ত।',
        hi: 'कक्षा 5 में इतिहास और विरासत आमादेर परिवेश पाठ्यपुस्तक में समाहित हैं।',
      },
      chapters: [
        ch('h5_c1', 1, 'Ch 7: Evolution of Wheel, Boats, Steam Engine & Early Railways in Bengal', 'অধ্যায় ৭: চাকা, নৌকা, বাষ্পীয় ইঞ্জিন ও বাংলার প্রথম রেলপথের ইতিহাস', 'अध्याय 7: पहिया, नाव, भाप इंजन और बंगाल में प्रथम रेलवे का इतिहास', ['Invention of wheel', 'Howrah to Hooghly first train in Eastern India (1854)', 'Historic architecture & monuments of Bengal'], TB_EVS_5),
        ch('h5_c2', 2, 'Ch 9: Bengal Renaissance, Social Reformers & Freedom Struggle Martyrs', 'অধ্যায় ৯: বাংলার নবজাগরণ, সমাজ সংস্কারক ও স্বাধীনতা সংগ্রামের শহিদগণ', 'अध्याय 9: बंगाल पुनर्जागरण, समाज सुधारक और स्वतंत्रता संग्राम के शहीद', ['Raja Rammohan Roy, Ishwar Chandra Vidyasagar, Rabindranath Tagore, Begum Rokeya, Swami Vivekananda', 'Sidhu-Kanhu (Santhal Hul), Birsa Munda, Khudiram Bose, Surya Sen (Masterda), Pritilata Waddedar, Matangini Hazra, Netaji Subhas Chandra Bose'], TB_EVS_5),
      ],
    },
    6: {
      status: 'prescribed',
      verificationStatus: 'verified',
      applicableToClass: true,
      textbookName: TB_HIST_6,
      syllabusVersion: 'WBBSE Upper Primary Syllabus (Current Edition)',
      officialSource: 'WBBSE — Atit o Aitihya Class VI (Chapters 1–9)',
      boardNote: {
        en: 'Official WBBSE Class VI Atit o Aitihya (History) — All 9 Verified Chapters.',
        bn: 'পশ্চিমবঙ্গ মধ্যশিক্ষা পর্ষদ (WBBSE) ষষ্ঠ শ্রেণি অতীত ও ঐতিহ্য (ইতিহাস) — সম্পূর্ণ ৯টি অধ্যায়।',
        hi: 'WBBSE कक्षा 6 अतीत ओ ऐतिह्य (इतिहास) — सभी 9 सत्यापित अध्याय।',
      },
      chapters: [
        ch('h6_c1', 1, 'Ch 1: Introductory Concept of History (Geography of Indian Subcontinent & Sources)', 'অধ্যায় ১: ইতিহাসের ধারণা', 'अध्याय 1: इतिहास की प्रारंभिक अवधारणा', ['Bharata-varsha and Jambudvipa', 'BCE and CE timeline, Saka & Vikrama eras', 'Archaeological inscriptions, coins, monuments & literary sources'], TB_HIST_6),
        ch('h6_c2', 2, 'Ch 2: Primitive Humans in the Indian Subcontinent (Nomadic Life to Permanent Settlement)', 'অধ্যায় ২: ভারতীয় উপমহাদেশে আদিম মানুষ (যাযাবর জীবন থেকে স্থায়ী বসতি গড়ে ওঠা)', 'अध्याय 2: भारतीय उपमहाद्वीप में आदिम मानव (खानाबदोश जीवन से स्थायी बस्ती तक)', ['Hominid evolution', 'Palaeolithic, Mesolithic, Neolithic stone tools', 'Bhimbetka cave paintings, discovery of fire, wheel & Mehrgarh agriculture'], TB_HIST_6),
        ch('h6_c3', 3, 'Ch 3: Ancient Urban Civilization in the Indian Subcontinent (Mehrgarh & Harappa)', 'অধ্যায় ৩: ভারতীয় উপমহাদেশের প্রাচীন নগরের কথা (মেহেরগড় ও হরপ্পা সভ্যতা)', 'अध्याय 3: भारतीय उपमहाद्वीप की प्राचीन नगरीय सभ्यता (मेहरगढ़ और हड़प्पा सभ्यता)', ['Discovery of Harappa (Dayaram Sahni, 1921) & Mohenjo-daro (Rakhaldas Bandyopadhyay, 1922)', 'Citadel, Great Bath, Granary, Lothal dockyard, drainage, seals, decline'], TB_HIST_6),
        ch('h6_c4', 4, 'Ch 4: Early Phase of State Formation in the Indian Subcontinent (Vedic Age & Janapadas)', 'অধ্যায় ৪: ভারতীয় উপমহাদেশের প্রাচীন ইতিহাসের ধারা (বৈদিক সভ্যতা)', 'अध्याय 4: प्राचीन भारतीय इतिहास की धारा (वैदिक सभ्यता)', ['Rigveda, Samaveda, Yajurveda, Atharvaveda', 'Sabha & Samiti, Four Ashramas, Varna system', 'Megalithic culture'], TB_HIST_6),
        ch('h6_c5', 5, 'Ch 5: c. 6th Century BCE Indian Subcontinent — Janapadas, Mahajanapadas & New Religions', 'অধ্যায় ৫: খ্রিস্টপূর্ব ষষ্ঠ শতকের ভারতীয় উপমহাদেশ (জনপদ, মহাজনপদ ও প্রতিবাদী ধর্মীয় আন্দোলন)', 'अध्याय 5: छठी शताब्दी ईसा पूर्व का भारतीय उपमहाद्वीप (महाजनपद, जैन और बौद्ध धर्म)', ['16 Mahajanapadas & rise of Magadha', 'Gana-sanghas (Vajji)', 'Vardhamana Mahavira (Jainism, Triratna) & Gautama Buddha (Four Noble Truths, Eightfold Path, Tripitaka)'], TB_HIST_6),
        ch('h6_c6', 6, 'Ch 6: Expansion of Empire — Mauryas, Kushanas, Satavahanas, Guptas & Harshavardhana', 'অধ্যায় ৬: সাম্রাজ্য বিস্তার ও শাসন (মৌর্য, কুষাণ, সাতবাহন, গুপ্ত ও হর্ষবর্ধন)', 'अध्याय 6: साम्राज्य विस्तार और शासन (मौर्य, कुषाण, सातवाहन, गुप्त और हर्षवर्धन)', ['Chandragupta Maurya, Kautilya Arthashastra, Ashoka & Kalinga War, Dhamma', 'Kanishka, Gautamiputra Satakarni', 'Samudragupta (Allahabad Pillar), Chandragupta II, Shashanka of Gauda, Harshavardhana'], TB_HIST_6),
        ch('h6_c7', 7, 'Ch 7: Economy and Public Life (Ancient Agriculture, Crafts, Guilds & Trade Routes)', 'অধ্যায় ৭: অর্থনীতি ও জনজীবন', 'अध्याय 7: अर्थव्यवस्था और जनजीवन', ['Sudarshana Lake irrigation, Agrahara land grants', 'Shreni/Guilds, Uttarapatha & Dakshinapatha, Indo-Roman trade', 'Fa-Hien and Hiuen Tsang (Xuanzang) accounts'], TB_HIST_6),
        ch('h6_c8', 8, 'Ch 8: Ancient Indian Culture — Literature, Science, Art & Architecture', 'অধ্যায় ৮: প্রাচীন ভারতীয় উপমহাদেশের সংস্কৃতি চর্চার নানা দিক', 'अध्याय 8: प्राचीन भारतीय उपमहाद्वीप में संस्कृति, साहित्य, विज्ञान और स्थापत्य', ['Nalanda, Taxila, Vikramashila universities', 'Kalidasa, Shudraka, Banabhatta, Sangam literature', 'Aryabhatta, Varahamihira, Charaka, Sushruta', 'Gandhara & Mathura art, Sanchi Stupa, Ajanta cave paintings'], TB_HIST_6),
        ch('h6_c9', 9, 'Ch 9: India and the Contemporary World (Cultural & Commercial Contacts)', 'অধ্যায় ৯: ভারত ও সমকালীন বহির্বিশ্ব', 'अध्याय 9: भारत और समकालीन बाह्य विश्व', ['Persian & Alexander invasions', 'Silk Route & Kushana trade', 'Spread of Buddhism to Sri Lanka, Central Asia, China, and Southeast Asia'], TB_HIST_6),
      ],
    },
    7: {
      status: 'prescribed',
      verificationStatus: 'verified',
      applicableToClass: true,
      textbookName: TB_HIST_7,
      syllabusVersion: 'WBBSE Upper Primary Syllabus (Current Edition)',
      officialSource: 'WBBSE — Atit o Aitihya Class VII (Chapters 1–9)',
      boardNote: {
        en: 'Official WBBSE Class VII Atit o Aitihya (History) — All 9 Verified Chapters.',
        bn: 'পশ্চিমবঙ্গ মধ্যশিক্ষা পর্ষদ (WBBSE) সপ্তম শ্রেণি অতীত ও ঐতিহ্য (ইতিহাস) — সম্পূর্ণ ৯টি অধ্যায়।',
        hi: 'WBBSE कक्षा 7 अतीत ओ ऐतिह्य (इतिहास) — सभी 9 सत्यापित अध्याय।',
      },
      chapters: [
        ch('h7_c1', 1, 'Ch 1: Introductory Concept of History', 'অধ্যায় ১: ইতিহাসের ধারণা', 'अध्याय 1: इतिहास की अवधारणा', ['Chronology and transition from Ancient to Early Medieval India'], TB_HIST_7),
        ch('h7_c2', 2, 'Ch 2: Several Aspects of Political History of India (c. 7th–12th Century CE)', 'অধ্যায় ২: ভারতের রাজনৈতিক ইতিহাসের কয়েকটি ধারা (খ্রিস্টীয় সপ্তম থেকে দ্বাদশ শতক)', 'अध्याय 2: भारत के राजनीतिक इतिहास की कुछ धाराएँ (7वीं से 12वीं शताब्दी ईस्वी)', ['Shashanka of Gauda, Matsyanyaya, Pala dynasty (Gopala, Dharmapala, Devapala, Ramapala & Kaivarta rebellion)', 'Sena dynasty (Vijayasena, Ballalasena, Lakshmanasena)', 'Tripartite struggle for Kannauj (Palas, Gurjara-Pratiharas, Rashtrakutas)', 'Chola administration (Rajaraja I, Rajendra Chola I, Ur & Nadu), Mahmud of Ghazni & Muhammad Ghori'], TB_HIST_7),
        ch('h7_c3', 3, 'Ch 3: Some Aspects of Society, Economy and Culture of India (c. 7th–12th Century CE)', 'অধ্যায় ৩: ভারতের সমাজ, অর্থনীতি ও সংস্কৃতির কয়েকটি ধারা', 'अध्याय 3: भारत के समाज, अर्थव्यवस्था और संस्कृति के कुछ पहलू (7वीं–12वीं शताब्दी)', ['Feudalism (Samanta system)', 'Vikramashila & Nalanda, Dipankara Srijnana (Atisha)', 'Jayadeva (Gitagovinda), Sandhyakar Nandi (Ramacharitam), Chakrapani Datta, Charyapada', 'Angkor Wat & Borobudur'], TB_HIST_7),
        ch('h7_c4', 4, 'Ch 4: The Delhi Sultanate (Turko-Afghan Rule: 1206–1526 CE)', 'অধ্যায় ৪: দিল্লি সুলতানি (তুর্কি-আফগান শাসন)', 'अध्याय 4: दिल्ली सल्तनत (तुर्क-अफ़गान शासन: 1206–1526 ई.)', ['Mamluk/Ilbari dynasty (Qutbuddin Aibak, Iltutmish, Razia, Balban)', 'Khalji dynasty (Alauddin Khalji market reforms), Tughlaq dynasty (Muhammad bin Tughlaq, Firuz Shah), Sayyid & Lodi', 'Iqta system, Kharaj, Jizya, Ilyas Shahi & Husain Shahi dynasties in Bengal, Vijayanagara & Bahmani kingdoms'], TB_HIST_7),
        ch('h7_c5', 5, 'Ch 5: The Mughal Empire (1526–1707 CE)', 'অধ্যায় ৫: মুঘল সাম্রাজ্য', 'अध्याय 5: मुग़ल साम्राज्य', ['Babur (First Battle of Panipat, 1526; Khanwa), Humayun & Sher Shah Suri (Sarai, Sadak-i-Azam, Patta & Qabuliyat)', 'Akbar (Second Battle of Panipat, Haldighati, Baro Bhuiyans of Bengal, Mansabdari & Jagirdari, Zabti/Todar Mal, Sulh-i-Kul)', 'Jahangir, Shah Jahan, Aurangzeb'], TB_HIST_7),
        ch('h7_c6', 6, 'Ch 6: Towns, Traders and Trade in Medieval India', 'অধ্যায় ৬: নগর, বণিক ও বাণিজ্য', 'अध्याय 6: नगर, व्यापारी और व्यापार', ['Urbanization in Delhi, Agra, Fatehpur Sikri, Hampi, Surat, Masulipatnam, Saptagram, Hooghly', 'Banjara traders, Hundi (bills of exchange), arrival of Portuguese, Dutch, English & French traders'], TB_HIST_7),
        ch('h7_c7', 7, 'Ch 7: Lifestyle and Culture (Bhakti, Sufi, Architecture, Painting & Music)', 'অধ্যায় ৭: জীবনযাত্রা ও সংস্কৃতি (সুলতানি ও মুঘল যুগ)', 'अध्याय 7: जीवनशैली और संस्कृति (भक्ति, सूफ़ी, स्थापत्य, चित्रकला और संगीत)', ['Bhakti movement: Kabir, Guru Nanak, Mirabai, Sri Chaitanya Mahaprabhu', 'Sufi Chishti & Suhrawardi orders (Moinuddin Chishti, Nizamuddin Auliya)', 'Indo-Islamic & Mughal architecture (Qutb Minar, Taj Mahal, Red Fort), Bengal terracotta temples (Bishnupur), Persian translations & Dara Shikoh'], TB_HIST_7),
        ch('h7_c8', 8, 'Ch 8: Crisis of the Mughal Empire (Marathas, Sikhs, Jats & Regional Powers)', 'অধ্যায় ৮: মুঘল সাম্রাজ্যের সংকট', 'अध्याय 8: मुग़ल साम्राज्य का संकट', ['Jagirdari crisis', 'Chhatrapati Shivaji Maharaj (Ashtapradhan, Chauth & Sardeshmukhi)', 'Sikh Gurus & Khalsa (Guru Gobind Singh), Satnami & Jat revolts'], TB_HIST_7),
        ch('h7_c9', 9, 'Ch 9: India Today — Government, Democracy, Constitution & Local Self-Government', 'অধ্যায় ৯: আজকের ভারত (সরকার, গণতন্ত্র ও স্বায়ত্তশাসন)', 'अध्याय 9: आज का भारत (सरकार, लोकतंत्र, संविधान और स्थानीय स्वशासन)', ['Indian Constitution (26 Nov 1949 / 26 Jan 1950)', 'Sovereign, Socialist, Secular, Democratic Republic', 'Separation of powers (Legislature, Executive, Judiciary), Three-tier Panchayati Raj & Municipalities'], TB_HIST_7),
      ],
    },
    8: {
      status: 'prescribed',
      verificationStatus: 'verified',
      applicableToClass: true,
      textbookName: TB_HIST_8,
      syllabusVersion: 'WBBSE Upper Primary Syllabus (Current Edition)',
      officialSource: 'WBBSE — Atit o Aitihya Class VIII (Chapters 1–9)',
      boardNote: {
        en: 'Official WBBSE Class VIII Atit o Aitihya (History) — All 9 Verified Chapters.',
        bn: 'পশ্চিমবঙ্গ মধ্যশিক্ষা পর্ষদ (WBBSE) অষ্টম শ্রেণি অতীত ও ঐতিহ্য (ইতিহাস) — সম্পূর্ণ ৯টি অধ্যায়।',
        hi: 'WBBSE कक्षा 8 अतीत ओ ऐतिह्य (इतिहास) — सभी 9 सत्यापित अध्याय।',
      },
      chapters: [
        ch('h8_c1', 1, 'Ch 1: Concept of Modern History', 'অধ্যায় ১: ইতিহাসের ধারণা (আধুনিক ভারতের ইতিহাস)', 'अध्याय 1: आधुनिक इतिहास की अवधारणा', ['Periodization of Indian history (James Mill vs modern historians)', 'Primary and archival sources of modern India'], TB_HIST_8),
        ch('h8_c2', 2, 'Ch 2: Rise of Regional Powers (Bengal, Awadh, Hyderabad, Mysore & Marathas; Plassey & Buxar)', 'অধ্যায় ২: আঞ্চলিক শক্তির উত্থান', 'अध्याय 2: क्षेत्रीय शक्तियों का उदय (बंगाल, अवध, हैदराबाद, मैसूर, प्लासी और बक्सर)', ['Murshid Quli Khan, Alivardi Khan, Siraj-ud-Daulah', 'Farrukhsiyar Farman (1717), Battle of Plassey (1757), Mir Jafar & Mir Qasim', 'Battle of Buxar (1764), Grant of Diwani (1765), Dual Government & Famine of 1770 (Chhiyattarer Manvantar)', 'Subsidiary Alliance (Wellesley) & Doctrine of Lapse (Dalhousie)'], TB_HIST_8),
        ch('h8_c3', 3, 'Ch 3: Establishment of Colonial Authority (Civil Service, Police, Army, Judiciary & Education)', 'অধ্যায় ৩: ঔপনিবেশিক কর্তৃত্ব প্রতিষ্ঠা', 'अध्याय 3: औपनिवेशिक सत्ता की स्थापना', ['Regulating Act (1773), Pitt India Act (1784), Charter Acts (1813, 1833)', 'Cornwallis Code, Fort William College (1800)', 'Asiatic Society (William Jones, 1784), Macaulay Minute (1835), Wood Despatch (1854)'], TB_HIST_8),
        ch('h8_c4', 4, 'Ch 4: Character of Colonial Economy (Land Revenue, Commercialization, Deindustrialization, Railways & Drain of Wealth)', 'অধ্যায় ৪: ঔপনিবেশিক অর্থনীতির চরিত্র', 'अध्याय 4: औपनिवेशिक अर्थव्यवस्था का चरित्र', ['Permanent Settlement (1793), Ryotwari, Mahalwari systems', 'Deindustrialization of Indian textiles', 'Introduction of Railways (1853) & Telegraph', 'Dadabhai Naoroji Drain of Wealth theory'], TB_HIST_8),
        ch('h8_c5', 5, 'Ch 5: Reactions to Colonial Rule — Social Reform & The Great Revolt of 1857', 'অধ্যায় ৫: ঔপনিবেশিক শাসনের প্রতিক্রিয়া: সহযোগিতা ও বিদ্রোহ', 'अध्याय 5: औपनिवेशिक शासन की प्रतिक्रिया: समाज सुधार और 1857 का महाविद्रोह', ['Raja Rammohan Roy (Abolition of Sati, 1829), Vidyasagar (Widow Remarriage Act, 1856), Young Bengal (Derozio), Swami Vivekananda, Aligarh Movement (Sir Syed Ahmad Khan)', 'Santhal Hul (1855), Munda Ulgulan, Indigo Revolt (1859)', 'Great Revolt of 1857 (Mangal Pandey, Bahadur Shah Zafar, Rani Lakshmibai, Nana Saheb, Kunwar Singh) & Queen Victoria Proclamation (1858)'], TB_HIST_8),
        ch('h8_c6', 6, 'Ch 6: Initial Phase of Nationalism (Early Associations, INC, Swadeshi & Revolutionary Movement)', 'অধ্যায় ৬: জাতীয়তাবাদের প্রাথমিক বিকাশ', 'अध्याय 6: राष्ट्रवाद का प्रारंभिक विकास (कांग्रेस की स्थापना और स्वदेशी आंदोलन)', ['Indian Association (Surendranath Banerjea, 1876), Ilbert Bill controversy, Founding of INC (1885, Hume & W.C. Bonnerjee)', 'Moderates vs Extremists (Lal-Bal-Pal, Aurobindo Ghosh)', 'Partition of Bengal (1905) & Swadeshi-Boycott Movement, Anushilan Samiti & Jugantar'], TB_HIST_8),
        ch('h8_c7', 7, 'Ch 7: Character and Practices of Indian National Movement (Gandhian Era, Subhas Chandra Bose & INA)', 'অধ্যায় ৭: ভারতের জাতীয় আন্দোলনের আদর্শ ও বিবর্তন', 'अध्याय 7: भारतीय राष्ट्रीय आंदोलन के आदर्श और विकास (गांधीवादी युग और आज़ाद हिंद फ़ौज)', ['Champaran, Kheda, Ahmedabad satyagrahas, Rowlatt Act & Jallianwala Bagh (1919)', 'Khilafat & Non-Cooperation Movement (1920–22), Civil Disobedience & Dandi March (1930), Quit India Movement (1942)', 'Bhagat Singh (HSRA), Surya Sen (Chittagong Armoury Raid, 1930), Netaji Subhas Chandra Bose & Azad Hind Fauj (INA), RIN Mutiny (1946)'], TB_HIST_8),
        ch('h8_c8', 8, 'Ch 8: From Communalism to Partition (Two-Nation Theory, 1947 Independence & Refugee Crisis)', 'অধ্যায় ৮: সাম্প্রদায়িকতা থেকে দেশভাগ', 'अध्याय 8: सांप्रदायिकता से देश के विभाजन तक', ['Muslim League (1906), Lucknow Pact (1916), Lahore Resolution (1940)', 'Cripps Mission, Cabinet Mission (1946), Mountbatten Plan & Indian Independence Act (1947)'], TB_HIST_8),
        ch('h8_c9', 9, 'Ch 9: Indian Constitution — Democracy, Fundamental Rights, Directive Principles & Citizen Duties', 'অধ্যায় ৯: ভারতীয় সংবিধান: গণতন্ত্রের কাঠামো ও জনগণের অধিকার', 'अध्याय 9: भारतीय संविधान: लोकतंत्र का ढाँचा और नागरिकों के अधिकार', ['Constituent Assembly (Dr. Rajendra Prasad, Dr. B.R. Ambedkar)', 'Parliamentary system, President, Prime Minister, Chief Minister', 'Fundamental Rights (Articles 14–32), Directive Principles of State Policy, Fundamental Duties'], TB_HIST_8),
      ],
    },
    9: {
      status: 'prescribed',
      verificationStatus: 'verified',
      applicableToClass: true,
      textbookName: TB_HIST_9,
      syllabusVersion: 'WBBSE Secondary Curriculum (Current Edition)',
      officialSource: 'WBBSE — Itihas o Paribesh Class IX (Chapters 1–7)',
      boardNote: {
        en: 'Official WBBSE Class IX Itihas o Paribesh (European & World History) — All 7 Verified Chapters.',
        bn: 'পশ্চিমবঙ্গ মধ্যশিক্ষা পর্ষদ (WBBSE) নবম শ্রেণি ইতিহাস ও পরিবেশ — সম্পূর্ণ ৭টি অধ্যায়।',
        hi: 'WBBSE कक्षा 9 इतिहास ओ परिवेश (यूरोपीय एवं विश्व इतिहास) — सभी 7 सत्यापित अध्याय।',
      },
      chapters: [
        ch('h9_c1', 1, 'Ch 1: Some Aspects of the French Revolution (1789)', 'অধ্যায় ১: ফরাসি বিপ্লবের কয়েকটি দিক', 'अध्याय 1: फ़्रांसीसी क्रांति के कुछ पहलू (1789)', ['Ancien Régime, Three Estates, Bourgeoisie', 'Montesquieu, Voltaire, Rousseau, Physiocrats', 'Tennis Court Oath, Fall of Bastille (14 July 1789), Declaration of Rights of Man and Citizen, Reign of Terror (Robespierre)'], TB_HIST_9),
        ch('h9_c2', 2, 'Ch 2: Revolutionary Ideals, Napoleonic Empire and the Idea of Nationalism', 'অধ্যায় ২: বিপ্লবী আদর্শ, নেপোলিয়নীয় সাম্রাজ্য ও জাতীয়তাবাদ', 'अध्याय 2: क्रांतिकारी आदर्श, नेपोलियन का साम्राज्य और राष्ट्रवाद', ['Code Napoléon (1804), Confederation of the Rhine', 'Continental System, Peninsular War, Moscow Campaign (1812), Battle of Nations (Leipzig, 1813), Battle of Waterloo (1815)'], TB_HIST_9),
        ch('h9_c3', 3, 'Ch 3: Europe in the 19th Century — Conflict of Monarchical and Nationalist Ideas', 'অধ্যায় ৩: উনবিংশ শতকের ইউরোপ: রাজতান্ত্রিক ও জাতীয়তাবাদী ভাবধারার সংঘাত', 'अध्याय 3: 19वीं शताब्दी का यूरोप: राजतंत्रीय और राष्ट्रवादी विचारों का संघर्ष', ['Vienna Congress (1815, Metternich System, Legitimacy, Balance of Power)', 'July Revolution (1830) & February Revolution (1848)', 'Unification of Italy (Mazzini, Young Italy, Cavour, Garibaldi) & Unification of Germany (Zollverein, Bismarck Blood and Iron policy, 1871)', 'Emancipation of Serfs in Russia (Tsar Alexander II, 1861), Balkan nationalism & Crimean War'], TB_HIST_9),
        ch('h9_c4', 4, 'Ch 4: Industrial Revolution, Colonialism and Imperialism', 'অধ্যায় ৪: শিল্পবিপ্লব, উপনিবেশবাদ ও সাম্রাজ্যবাদ', 'अध्याय 4: औद्योगिक क्रांति, उपनिवेशवाद और साम्राज्यवाद', ['Why Industrial Revolution began in England first, factory system & Ghetto', 'Utopian and Scientific Socialism (Saint-Simon, Robert Owen, Karl Marx & Friedrich Engels, Communist Manifesto 1848)', 'Scramble for Africa, Partition of China, Triple Alliance (1882) & Triple Entente (1907), Sarajevo assassination & outbreak of WWI (1914)'], TB_HIST_9),
        ch('h9_c5', 5, 'Ch 5: Europe in the 20th Century (Russian Revolution, Treaty of Versailles, Fascism, Nazism & Great Depression)', 'অধ্যায় ৫: বিংশ শতকে ইউরোপ', 'अध्याय 5: 20वीं शताब्दी में यूरोप (रूसी क्रांति, वर्साय की संधि, फासीवाद और नाज़ीवाद)', ['1905 Bloody Sunday, March & November 1917 Bolshevik Revolution (Lenin, April Theses, NEP)', 'Woodrow Wilson 14 Points, Treaty of Versailles (1919), League of Nations', 'Great Depression (1929), Rise of Fascism in Italy (Mussolini) & Nazism in Germany (Hitler), Spanish Civil War (Guernica)'], TB_HIST_9),
        ch('h9_c6', 6, 'Ch 6: The Second World War and Its Aftermath (1939–1945)', 'অধ্যায় ৬: দ্বিতীয় বিশ্বযুদ্ধ এবং তার পরবর্তী পর্যায়', 'अध्याय 6: द्वितीय विश्व युद्ध और उसके परिणाम (1939–1945)', ['Policy of Appeasement, Munich Pact (1938), Rome-Berlin-Tokyo Axis, Invasion of Poland (1 Sept 1939)', 'Operation Barbarossa, Pearl Harbor (7 Dec 1941), Battle of Stalingrad, D-Day (Normandy), Hiroshima & Nagasaki', 'Impact of WWII and decolonization'], TB_HIST_9),
        ch('h9_c7', 7, 'Ch 7: League of Nations and the United Nations Organization (UNO)', 'অধ্যায় ৭: জাতিসংঘ এবং সম্মিলিত জাতিপুঞ্জ', 'अध्याय 7: राष्ट्र संघ और संयुक्त राष्ट्र संघ (UNO)', ['Atlantic Charter (1941), San Francisco Conference (1945), UN Charter (24 Oct 1945)', '6 Principal Organs of UNO: General Assembly, Security Council (5 Permanent Veto members), ECOSOC, Trusteeship Council, ICJ (The Hague), Secretariat'], TB_HIST_9),
      ],
    },
    10: {
      status: 'prescribed',
      verificationStatus: 'verified',
      applicableToClass: true,
      textbookName: TB_HIST_10,
      syllabusVersion: 'WBBSE Madhyamik Pariksha Syllabus (Current Edition)',
      officialSource: 'WBBSE — Itihas o Paribesh Class X (Chapters 1–8)',
      boardNote: {
        en: 'Official WBBSE Class X Itihas o Paribesh (Madhyamik Pariksha) — All 8 Verified Chapters.',
        bn: 'পশ্চিমবঙ্গ মধ্যশিক্ষা পর্ষদ (WBBSE) দশম শ্রেণি ইতিহাস ও পরিবেশ (মাধ্যমিক) — সম্পূর্ণ ৮টি অধ্যায়।',
        hi: 'WBBSE कक्षा 10 इतिहास ओ परिवेश (माध्यमिक परीक्षा) — सभी 8 सत्यापित अध्याय।',
      },
      chapters: [
        ch('h10_c1', 1, 'Ch 1: Ideas of History (New Social History, Historiography & Sources)', 'অধ্যায় ১: ইতিহাসের ধারণা', 'अध्याय 1: इतिहास की अवधारणा', ['New Social History, History of Sports, Food, Clothing, Performing Arts, Photography, Local, Urban, Military & Environmental History, Women History', 'Autobiographies: Sattar Batsar (Bipin Chandra Pal), Jibansmriti (Rabindranath Tagore), Jibaner Jharapata (Sarala Devi Chaudhurani)', 'Letters of Nehru to Indira, Periodicals: Bangadarshan (Bankimchandra) & Somprakash (Dwarakanath Vidyabhushan)'], TB_HIST_10),
        ch('h10_c2', 2, 'Ch 2: Reform — Characteristics and Observations (19th Century Bengal Renaissance)', 'অধ্যায় ২: সংস্কার: বৈশিষ্ট্য ও পর্যালোচনা', 'अध्याय 2: सुधार: विशेषताएँ और अवलोकन (19वीं शताब्दी का बंगाल)', ['Bamabodhini Patrika, Hindoo Patriot (Harish Chandra Mukherjee), Hutom Pyanchar Naksha (Kaliprasanna Singha), Neel Darpan (Dinabandhu Mitra), Grambarta Prakashika (Kangal Harinath)', 'Orientalist-Anglicist debate, Macaulay Minute (1835), Wood Despatch (1854), Calcutta Medical College (1835, Madhusudan Gupta), Calcutta University (1857)', 'Brahmo Samaj divisions, Young Bengal, Vidyasagar, Sri Ramakrishna (Sarvadharma Samanwaya), Swami Vivekananda (Navavedanta), Lalon Fakir'], TB_HIST_10),
        ch('h10_c3', 3, 'Ch 3: Resistance and Rebellion — Characteristics and Analyses', 'অধ্যায় ৩: প্রতিরোধ ও বিদ্রোহ: বৈশিষ্ট্য ও বিশ্লেষণ', 'अध्याय 3: प्रतिरोध और विद्रोह: विशेषताएँ और विश्लेषण', ['Colonial Forest Acts (1865, 1878) & Dietrich Brandis', 'Chuar Rebellion, Kol Rebellion (1831–32), Santhal Hul (1855–56, Sidhu-Kanhu), Munda Ulgulan (1899–1900, Birsa Munda), Sannyasi-Fakir Rebellion, Wahabi (Titu Mir & Barasat Bamboo Fort) & Faraizi (Haji Shariatullah, Dudu Miyan) movements, Pagal Panthi', 'Indigo Revolt (1859–60, Bishnucharan & Digambar Biswas) & Pabna Peasant Uprising'], TB_HIST_10),
        ch('h10_c4', 4, 'Ch 4: Early Stages of Collective Action — Characteristics and Analyses', 'অধ্যায় ৪: সংঘবদ্ধতার গোড়ার কথা: বৈশিষ্ট্য ও বিশ্লেষণ', 'अध्याय 4: सामूहिक कार्रवाई के प्रारंभिक चरण: विशेषताएँ और विश्लेषण', ['1857 Revolt: nature (Marx, Savarkar, S.N. Sen, R.C. Majumdar) & Queen Proclamation (1858)', 'Bangabhasha Prakashika Sabha (1836), Zamindari Association (1838), Hindu Mela (Nabagopal Mitra, 1867), Indian Association (Surendranath Banerjea, 1876)', 'Vernacular Press Act (1878), Arms Act, Ilbert Bill (1883)', 'Anandamath, Bharatbarsher Itihas, Bartaman Bharat, Gora, Bharat Mata painting (Abanindranath Tagore) & Gaganendranath Tagore cartoons'], TB_HIST_10),
        ch('h10_c5', 5, 'Ch 5: Alternative Ideas and Initiatives (From Mid-19th Century to Early 20th Century)', 'অধ্যায় ৫: বিকল্প চিন্তা ও উদ্যোগ (উনবিংশ শতকের মধ্যভাগ থেকে বিংশ শতকের প্রথমভাগ পর্যন্ত)', 'अध्याय 5: वैकल्पिक विचार और पहल (19वीं शताब्दी के मध्य से 20वीं शताब्दी के प्रारंभ तक)', ['Serampore Mission Press, Upendrakishore Raychaudhuri (U.N. Ray & Sons halftone block printing)', 'IACS (Mahendralal Sircar, 1876), Bose Institute (Acharya Jagadish Chandra Bose, 1917), Bengal Technical Institute (Taraknath Palit, 1906), National Council of Education (1906)', 'Rabindranath Tagore educational philosophy: Brahmacharyashrama (Santiniketan, 1901) & Visva-Bharati (1921)'], TB_HIST_10),
        ch('h10_c6', 6, 'Ch 6: Peasant, Working Class and Leftist Movements in 20th Century India', 'অধ্যায় ৬: বিংশ শতকের ভারতে কৃষক, শ্রমিক ও বামপন্থী আন্দোলন', 'अध्याय 6: 20वीं शताब्दी के भारत में किसान, मज़दूर और वामपंथी आंदोलन', ['Eka Movement (Madari Pasi), Bardoli Satyagraha (Vallabhbhai Patel, 1928), All India Kisan Sabha (1936), Tebhaga Movement (1946–47), Telangana Uprising', 'AITUC (1920, Lala Lajpat Rai), Meerut Conspiracy Case (1929), CPI (M.N. Roy), Congress Socialist Party (1934), Tripuri Congress & Forward Bloc (1939), Workers & Peasants Party'], TB_HIST_10),
        ch('h10_c7', 7, 'Ch 7: Movements Organized by Women, Students and Marginalized Groups in 20th Century India', 'অধ্যায় ৭: বিংশ শতকের ভারতে নারী, ছাত্র ও প্রান্তিক জনগোষ্ঠীর আন্দোলন', 'अध्याय 7: 20वीं शताब्दी के भारत में महिला, छात्र और सीमांत समूहों के आंदोलन', ['Women in Swadeshi (Sarala Devi, Sister Nivedita), Non-Cooperation (Basanti Devi), Civil Disobedience, Quit India (Matangini Hazra, Kanaklata Barua)', 'Revolutionary women: Dipali Sangha (Leela Nag), Pritilata Waddedar, Kalpana Datta, Bina Das, Rani Jhansi Regiment (Lakshmi Swaminathan)', 'Anti-Circular Society (Sachindraprasad Bose, 1905), Rashid Ali Day (1946)', 'Namasudra Movement (Harichand & Guruchand Thakur), Dalit Movement (Jyotirao Phule Satyashodhak Samaj, Periyar Self-Respect Movement, Dr. B.R. Ambedkar & Poona Pact 1932)'], TB_HIST_10),
        ch('h10_c8', 8, 'Ch 8: Post-Colonial India — Second Half of the 20th Century (1947–1964)', 'অধ্যায় ৮: উত্তর-ঔপনিবেশিক ভারত: বিংশ শতকের দ্বিতীয় পর্ব (১৯৪৭–১৯৬৪)', 'अध्याय 8: उत्तर-औपनिवेशिक भारत: 20वीं शताब्दी का उत्तरार्ध (1947–1964)', ['Integration of Princely States (Sardar Vallabhbhai Patel, V.P. Menon, Instrument of Accession)', 'Junagadh (plebiscite), Hyderabad (Operation Polo, 1948), Jammu & Kashmir (Hari Singh & Article 370)', 'Refugee crisis in Punjab & Bengal, Nehru-Liaquat Pact (1950)', 'Linguistic reorganization of states: Potti Sreeramulu, JVP Committee, Fazl Ali States Reorganization Commission (1953) & Act (1956)'], TB_HIST_10),
      ],
    },
  },
};

export const GEOGRAPHY_SUBJECT: SubjectDefinition = {
  id: 'geography',
  name: {
    en: 'Geography',
    bn: 'ভূগোল (Geography)',
    hi: 'भूगोल (Geography)',
  },
  shortDesc: {
    en: 'Physical, environmental, astronomical, regional, and Indian/West Bengal geography from official WBBSE Amader Prithibi and Bhugol o Paribesh textbooks.',
    bn: 'পশ্চিমবঙ্গ মধ্যশিক্ষা পর্ষদের আমাদের পৃথিবী এবং ভূগোল ও পরিবেশ পাঠ্যপুস্তকের প্রাকৃতিক, আঞ্চলিক এবং ভারত ও পশ্চিমবঙ্গের ভূগোল।',
    hi: 'WBBSE की आमादेर पृथिवी और भूगोल ओ परिवेश पाठ्यपुस्तकों से भौतिक, क्षेत्रीय तथा भारत और पश्चिम बंगाल का भूगोल।',
  },
  domainGuardKeywords: [
    'geography', 'earth', 'latitude', 'longitude', 'rotation', 'revolution', 'landform', 'glacier', 'river', 'wind', 'atmosphere', 'hydrosphere', 'climate', 'soil', 'agriculture', 'industry', 'map', 'west bengal', 'india',
  ],
  curriculumByClass: {
    5: {
      status: 'integrated_evs',
      verificationStatus: 'verified',
      applicableToClass: false,
      textbookName: TB_EVS_5,
      syllabusVersion: 'WBBPE Primary Syllabus',
      officialSource: 'WBBPE — Amader Paribesh Class V (Geography & Resources Units)',
      boardNote: {
        en: 'In Class 5, Geography of West Bengal, Soil, Rivers & Sky are taught in Amader Paribesh.',
        bn: 'পঞ্চম শ্রেণিতে পশ্চিমবঙ্গের ভূপ্রকৃতি, নদনদী, কৃষিজ ও খনিজ সম্পদ আমাদের পরিবেশ পাঠ্যপুস্তকের অন্তর্ভুক্ত।',
        hi: 'कक्षा 5 में पश्चिम बंगाल का भूगोल, नदियाँ, कृषि और खनिज संसाधन आमादेर परिवेश में समाहित हैं।',
      },
      chapters: [
        ch('g5_c1', 1, 'Ch 3: Physiography & Rivers of West Bengal (Darjeeling Himalayas, Rarh Plateau, Sundarbans Delta)', 'অধ্যায় ৩: পশ্চিমবঙ্গের ভূপ্রকৃতি ও নদনদী (হিমালয়, রাঢ় মালভূমি ও সুন্দরবন বদ্বীপ)', 'अध्याय 3: पश्चिम बंगाल की भू-आकृति और नदियाँ (दार्जिलिंग हिमालय, राढ़ पठार और सुंदरबन डेल्टा)', ['Sandakphu (highest peak of WB)', 'Teesta, Torsha, Jaldhaka, Mahananda, Damodar, Rupnarayan, Bhagirathi-Hooghly, Matla, Bidyadhari'], TB_EVS_5),
        ch('g5_c2', 2, 'Ch 5 & 6: Agriculture, Fisheries, Coalfields & Power Plants of West Bengal', 'অধ্যায় ৫ ও ৬: পশ্চিমবঙ্গের কৃষি, মৎস্যচাষ, খনিজ সম্পদ ও তাপবিদ্যুৎ কেন্দ্র', 'अध्याय 5 व 6: पश्चिम बंगाल की कृषि, मत्स्य पालन, कोयला क्षेत्र और ताप विद्युत केंद्र', ['Aus, Aman, Boro paddy, Darjeeling tea, jute', 'Raniganj coalfield, Kolaghat, Bakreswar, Farakka thermal power plants'], TB_EVS_5),
        ch('g5_c3', 3, 'Ch 10: Sky, Solar System, Phases of Moon, Eclipses & Tides', 'অধ্যায় ১০: আকাশ, সৌরজগৎ, চন্দ্রকলা, গ্রহণ ও জোয়ার-ভাটা', 'अध्याय 10: आकाश, सौरमंडल, चंद्र कलाएँ, ग्रहण और ज्वार-भाटा', ['8 planets of Solar System', 'Solar and Lunar eclipses', 'High tide and low tide'], TB_EVS_5),
      ],
    },
    6: {
      status: 'prescribed',
      verificationStatus: 'verified',
      applicableToClass: true,
      textbookName: TB_GEO_6,
      syllabusVersion: 'WBBSE Upper Primary Syllabus (Current Edition)',
      officialSource: 'WBBSE — Amader Prithibi Class VI (Chapters 1–11)',
      boardNote: {
        en: 'Official WBBSE Class VI Amader Prithibi (Geography) — All 11 Verified Chapters.',
        bn: 'পশ্চিমবঙ্গ মধ্যশিক্ষা পর্ষদ (WBBSE) ষষ্ঠ শ্রেণি আমাদের পৃথিবী (ভূগোল) — সম্পূর্ণ ১১টি অধ্যায়।',
        hi: 'WBBSE कक्षा 6 आमादेर पृथिवी (भूगोल) — सभी 11 सत्यापित अध्याय।',
      },
      chapters: [
        ch('g6_c1', 1, 'Ch 1: The Sky Full of Stars (Universe, Galaxies, Solar System, Planets, Satellites, Asteroids & Comets)', 'অধ্যায় ১: আকাশ ভরা সূর্য তারা', 'अध्याय 1: तारों भरा आकाश (ब्रह्मांड, आकाशगंगा और सौरमंडल)', ['Big Bang, Milky Way (Akashganga), Light Year', 'Inner and outer planets, Moon phases, ISRO & NASA missions'], TB_GEO_6),
        ch('g6_c2', 2, 'Ch 2: Is the Earth Round? (Geoid Shape, Horizon, Proofs & Eratosthenes)', 'অধ্যায় ২: পৃথিবী কি গোল?', 'अध्याय 2: क्या पृथ्वी गोल है? (भू-आभ आकृति)', ['Oblate spheroid / Geoid shape of Earth', 'Magellan circumnavigation, Bedford Level experiment, Equatorial (12,757 km) vs Polar diameter (12,714 km)'], TB_GEO_6),
        ch('g6_c3', 3, 'Ch 3: Where Are You? (Parallels of Latitude, Meridians of Longitude, Equator & Prime Meridian)', 'অধ্যায় ৩: তুমি কোথায় আছ? (অক্ষরেখা ও দ্রাঘিমারেখা)', 'अध्याय 3: आप कहाँ हैं? (अक्षांश और देशांतर रेखाएँ)', ['Equator (0°), Tropics of Cancer & Capricorn (23½° N/S), Arctic & Antarctic Circles (66½° N/S)', 'Prime Meridian (0° Greenwich), Great Circles, Geographic Grid'], TB_GEO_6),
        ch('g6_c4', 4, 'Ch 4: Rotation of the Earth (Daily Motion, Coriolis Effect, Circle of Illumination & Dawn/Dusk)', 'অধ্যায় ৪: পৃথিবীর আবর্তন', 'अध्याय 4: पृथ्वी का घूर्णन (दैनिक गति)', ['West-to-East rotation in 23h 56m 4s', 'Circle of Illumination, Dawn & Dusk, Coriolis force (Ferrel Law), International Date Line (180°)'], TB_GEO_6),
        ch('g6_c5', 5, 'Ch 5: Land, Water and Air (Lithosphere, Hydrosphere, Atmosphere, Biosphere & Continental Drift)', 'অধ্যায় ৫: জল-স্থল-বাতাস', 'अध्याय 5: जल, थल और वायु (स्थलमंडल, जलमंडल, वायुमंडल और जीवमंडल)', ['Wegener Pangaea & Panthalassa continental drift', '7 Continents & 5 Oceans', 'Atmospheric layers (Troposphere to Exosphere)'], TB_GEO_6),
        ch('g6_c6', 6, 'Ch 6: Ice Covered Continent — Antarctica', 'অধ্যায় ৬: বরফে ঢাকা মহাদেশ (আন্টার্কটিকা)', 'अध्याय 6: बर्फ़ से ढका महाद्वीप (अंटार्कटिका)', ['White Continent, Mt. Vinson Massif, Mt. Erebus, Lambert Glacier, Aurora Australis', ' Penguins & Krill, Antarctic Treaty (1959), Indian research stations: Dakshin Gangotri, Maitri, Bharati'], TB_GEO_6),
        ch('g6_c7', 7, 'Ch 7: Weather and Climate', 'অধ্যায় ৭: আবহাওয়া ও জলবায়ু', 'अध्याय 7: मौसम और जलवायु', ['Thermometer, Barometer, Hygrometer, Anemometer, Wind Vane, Rain Gauge', 'Torrid, Temperate, and Frigid heat zones, Isotherms'], TB_GEO_6),
        ch('g6_c8', 8, 'Ch 8: Air Pollution', 'অধ্যায় ৮: বায়ুদূষণ', 'अध्याय 8: वायु प्रदूषण', ['Greenhouse gases, Acid rain (SO2, NOx), Smog, Ozone depletion'], TB_GEO_6),
        ch('g6_c9', 9, 'Ch 9: Noise Pollution', 'অধ্যায় ৯: শব্দদূষণ', 'अध्याय 9: ध्वनि प्रदूषण', ['Decibel (dB) unit, WHO safe noise limits (65 dB), Green muffler'], TB_GEO_6),
        ch('g6_c10', 10, 'Ch 10: Our Country India (Physiographic Divisions, Rivers, Climate, Soils, Forests & Tribes)', 'অধ্যায় ১০: আমাদের দেশ ভারত', 'अध्याय 10: हमारा देश भारत (भौतिक विभाग, नदियाँ, जलवायु, मिट्टी और वन)', ['28 States & 8 Union Territories, IST (82°30′E)', 'Northern Mountains (Himadri, Himachal, Siwalik), Northern Plains, Peninsular Plateau, Coastal Plains & Islands', 'Himalayan vs Peninsular rivers, Monsoon seasons, Alluvial/Black/Red/Laterite soils, Natural vegetation'], TB_GEO_6),
        ch('g6_c11', 11, 'Ch 11: Maps (Scale, Globe vs Map, Thematic Maps & Conventional Symbols)', 'অধ্যায় ১১: মানচিত্র', 'अध्याय 11: मानचित्र (मापनी, प्रकार और रूढ़ चिह्न)', ['Physical, Political, Thematic, Topographical, and Cadastral (Mouza) maps', 'Statement, Graphical, and Representative Fraction (RF) scales'], TB_GEO_6),
      ],
    },
    7: {
      status: 'prescribed',
      verificationStatus: 'verified',
      applicableToClass: true,
      textbookName: TB_GEO_7,
      syllabusVersion: 'WBBSE Upper Primary Syllabus (Current Edition)',
      officialSource: 'WBBSE — Amader Prithibi Class VII (Chapters 1–11)',
      boardNote: {
        en: 'Official WBBSE Class VII Amader Prithibi (Geography) — All 11 Verified Chapters.',
        bn: 'পশ্চিমবঙ্গ মধ্যশিক্ষা পর্ষদ (WBBSE) সপ্তম শ্রেণি আমাদের পৃথিবী (ভূগোল) — সম্পূর্ণ ১১টি অধ্যায়।',
        hi: 'WBBSE कक्षा 7 आमादेर पृथिवी (भूगोल) — सभी 11 सत्यापित अध्याय।',
      },
      chapters: [
        ch('g7_c1', 1, 'Ch 1: Annual Motion of the Earth (Revolution, Perihelion, Aphelion, Solstices, Equinoxes & Change of Seasons)', 'অধ্যায় ১: পৃথিবীর পরিক্রমণ', 'अध्याय 1: पृथ्वी की परिक्रमण गति (उपसौर, अपसौर, अयनांत, विषुव और ऋतु परिवर्तन)', ['365 days 5h 48m 46s orbit, Leap year', 'Perihelion (3 Jan, 14.7 crore km) & Aphelion (4 July, 15.2 crore km)', 'Summer Solstice (21 June), Winter Solstice (22 Dec), Vernal & Autumnal Equinoxes (21 March, 23 Sept), Midnight Sun'], TB_GEO_7),
        ch('g7_c2', 2, 'Ch 2: Determination of Location of a Place on the Earth Surface (Latitude, Longitude & Time Calculation)', 'অধ্যায় ২: ভূপৃষ্ঠে কোনো স্থানের অবস্থান নির্ণয়', 'अध्याय 2: पृथ्वी की सतह पर किसी स्थान की स्थिति का निर्धारण (समय और देशांतर गणना)', ['1° longitude = 4 minutes time difference', 'Local Time, Standard Time (IST 82°30′E = GMT + 5:30), Antipodes, Sextant & Chronometer'], TB_GEO_7),
        ch('g7_c3', 3, 'Ch 3: Air Pressure (Pressure Belts, Isobars & Winds)', 'অধ্যায় ৩: বায়ুচাপ', 'अध्याय 3: वायुदाब (वायुदाब पेटियाँ और समदाब रेखाएँ)', ['Normal sea-level pressure (1013.25 mb)', '7 permanent pressure belts of the world, Fortin & Aneroid barometers'], TB_GEO_7),
        ch('g7_c4', 4, 'Ch 4: Landforms (Mountains, Plateaus and Plains)', 'অধ্যায় ৪: ভূমিরূপ (পর্বত, মালভূমি ও সমভূমি)', 'अध्याय 4: स्थलरूप (पर्वत, पठार और मैदान)', ['Fold (Himalayas, Andes), Block (Satpura, Vosges), Volcanic (Fujiyama, Vesuvius), Residual (Aravalli) mountains', 'Intermontane (Tibet, Pamir), Dissected, and Lava (Deccan Trap) plateaus', 'Alluvial, Loess, and Erosional plains'], TB_GEO_7),
        ch('g7_c5', 5, 'Ch 5: River (Course of a River, Erosional & Depositional Landforms)', 'অধ্যায় ৫: নদী', 'अध्याय 5: नदी (नदी के तीन चरण और स्थलरूप)', ['Catchment area, Watershed, Tributary & Distributary, Inland river (Luni)', 'Upper course (I/V-shaped valley, gorge, canyon, waterfall, pothole)', 'Middle course (meander, ox-bow lake, flood plain, natural levee)', 'Lower course (delta & estuary)'], TB_GEO_7),
        ch('g7_c6', 6, 'Ch 6: Rocks and Soil (Igneous, Sedimentary & Metamorphic Rocks; Regolith & Soil Profile)', 'অধ্যায় ৬: শিলা ও মাটি', 'अध्याय 6: चट्टानें और मिट्टी (आग्नेय, अवसादी और कायांतरित चट्टानें; मृदा परिच्छेदिका)', ['Granite & Basalt (Igneous), Sandstone, Limestone, Shale (Sedimentary), Marble, Slate, Quartzite, Gneiss (Metamorphic)', 'Rock cycle, Weathering, Humus, Soil horizons'], TB_GEO_7),
        ch('g7_c7', 7, 'Ch 7: Water Pollution', 'অধ্যায় ৭: জলদূষণ', 'अध्याय 7: जल प्रदूषण', ['Arsenic (Blackfoot disease), Fluoride (Fluorosis), Mercury (Minamata), Cadmium (Itai-Itai), Eutrophication'], TB_GEO_7),
        ch('g7_c8', 8, 'Ch 8: Soil Pollution', 'অধ্যায় ৮: মাটিদূষণ', 'अध्याय 8: मृदा प्रदूषण', ['Plastic waste, chemical fertilizers, pesticides, industrial effluents, bio-remediation'], TB_GEO_7),
        ch('g7_c9', 9, 'Ch 9: Continent of Asia (Physiography, Rivers, Climate, Vegetation & Regional Study)', 'অধ্যায় ৯: এশিয়া মহাদেশ', 'अध्याय 9: एशिया महाद्वीप (भू-आकृति, नदियाँ, जलवायु और क्षेत्रीय अध्ययन)', ['Pamir Knot, Tibetan Plateau, Ob, Yenisei, Lena, Hwang-Ho, Yangtze, Mekong, Tigris-Euphrates', 'Equatorial to Tundra climate & vegetation belts', 'Yangtze Basin, Tokyo-Yokohama Industrial Region, SW Asia Oil-Rich Region'], TB_GEO_7),
        ch('g7_c10', 10, 'Ch 10: Continent of Africa (Physiography, Great Rift Valley, Nile Basin & Sahara Desert)', 'অধ্যায় ১০: আফ্রিকা মহাদেশ', 'अध्याय 10: अफ़्रीका महाद्वीप (नील नदी बेसिन और सहारा मरुस्थल)', ['Atlas Mountains, Mt. Kilimanjaro, Great Rift Valley, Lake Victoria', 'White Nile & Blue Nile (Khartoum confluence), Aswan High Dam, Sahara oases & nomadic tribes (Tuareg, Bedouin)'], TB_GEO_7),
        ch('g7_c11', 11, 'Ch 11: Continent of Europe (Physiography, Ruhr Industrial Region, London Basin & Polder Land)', 'অধ্যায় ১১: ইউরোপ মহাদেশ', 'अध्याय 11: यूरोप महाद्वीप (रूर औद्योगिक क्षेत्र, लंदन बेसिन और पोल्डर भूमि)', ['Alps (Mont Blanc), Caucasus (Mt. Elbrus), Fjords of Norway, Volga, Danube, Rhine', 'Ruhr Coalfield & Industrial Region (Germany), London Basin, Polder land reclamation in the Netherlands (Zuiderzee)'], TB_GEO_7),
      ],
    },
    8: {
      status: 'prescribed',
      verificationStatus: 'verified',
      applicableToClass: true,
      textbookName: TB_GEO_8,
      syllabusVersion: 'WBBSE Upper Primary Syllabus (Current Edition)',
      officialSource: 'WBBSE — Amader Prithibi Class VIII (Chapters 1–11)',
      boardNote: {
        en: 'Official WBBSE Class VIII Amader Prithibi (Geography) — All 11 Verified Chapters.',
        bn: 'পশ্চিমবঙ্গ মধ্যশিক্ষা পর্ষদ (WBBSE) অষ্টম শ্রেণি আমাদের পৃথিবী (ভূগোল) — সম্পূর্ণ ১১টি অধ্যায়।',
        hi: 'WBBSE कक्षा 8 आमादेर पृथिवी (भूगोल) — सभी 11 सत्यापित अध्याय।',
      },
      chapters: [
        ch('g8_c1', 1, 'Ch 1: Interior of the Earth (Crust, Mantle, Core, Discontinuities, Magma & Geothermal Energy)', 'অধ্যায় ১: পৃথিবীর অন্দরমহল', 'अध्याय 1: पृथ्वी का आंतरिक भाग (भूपर्पटी, मैंटल और क्रोड)', ['SIAL and SIMA, Mohorovicic, Conrad, Repetti, Gutenberg & Lehmann discontinuities', 'NIFE (Inner & Outer Core), P, S, and L seismic waves'], TB_GEO_8),
        ch('g8_c2', 2, 'Ch 2: Unstable Earth (Plate Tectonics, Fold & Fault, Volcanoes & Earthquakes)', 'অধ্যায় ২: অস্থিত পৃথিবী (পাত সংস্থান তত্ত্ব, অগ্ন্যুৎপাত ও ভূমিকম্প)', 'अध्याय 2: अस्थिर पृथ्वी (प्लेट विवर्तनिकी, ज्वालामुखी और भूकंप)', ['Convergent, Divergent, and Transform plate boundaries', 'Active, Dormant, and Extinct volcanoes, Pacific Ring of Fire', 'Focus (Hypocentre) & Epicentre, Seismograph, Richter & Mercalli scales'], TB_GEO_8),
        ch('g8_c3', 3, 'Ch 3: Rocks (Detailed Petrology, Caves — Stalactite & Stalagmite, Rock Cycle)', 'অধ্যায় ৩: শিলা', 'अध्याय 3: चट्टानें (शैल चक्र और कार्स्ट स्थलाकृति)', ['Intrusive (Plutonic/Hypabyssal) and Extrusive igneous rocks', 'Karst limestone caves: Stalactite, Stalagmite & Pillar'], TB_GEO_8),
        ch('g8_c4', 4, 'Ch 4: Pressure Belts and Winds (Planetary, Periodic, Local Winds, Cyclones & Anticyclones)', 'অধ্যায় ৪: চাপবলয় ও বায়ুপ্রবাহ', 'अध्याय 4: वायुदाब पेटियाँ और पवनें (ग्रहीय, सामयिक और स्थानीय पवनें)', ['ITCZ & Doldrums, Horse Latitudes', 'Trade Winds, Westerlies (Roaring Forties, Furious Fifties, Screaming Sixties), Polar Winds', 'Land & Sea breezes, Monsoon, Loo, Foehn, Chinook, Sirocco, Mistral; Jet Stream'], TB_GEO_8),
        ch('g8_c5', 5, 'Ch 5: Clouds and Rain (Evaporation, Humidity, Clouds & Orographic, Convectional, Cyclonic Rainfall)', 'অধ্যায় ৫: মেঘ-বৃষ্টি', 'अध्याय 5: बादल और वर्षा (संवहनीय, पर्वतीय और चक्रवाती वर्षा)', ['Relative Humidity, Dew point', 'Cirrus, Cumulus, Stratus, Cumulonimbus clouds', 'Convectional (4 o clock rain), Orographic (Windward vs Rain-shadow slope), and Frontal/Cyclonic rain'], TB_GEO_8),
        ch('g8_c6', 6, 'Ch 6: Climate Regions of the World (Equatorial, Monsoon, Mediterranean & Tundra Biomes)', 'অধ্যায় ৬: জলবায়ু অঞ্চল', 'अध्याय 6: विश्व के जलवायु प्रदेश (भूमध्यरेखीय, मानसूनी, भूमध्यसागरीय और टुंड्रा)', ['Selvas tropical rainforest (Amazon/Zaire)', 'Mediterranean winter rainfall & citrus orchards', 'Tundra permafrost, blizzards, Aurora, Inuit/Eskimo igloo & kayak'], TB_GEO_8),
        ch('g8_c7', 7, 'Ch 7: Human Activities and Environmental Degradation', 'অধ্যায় ৭: মানুষের কার্যাবলি ও পরিবেশের অবনমন', 'अध्याय 7: मानवीय क्रियाकलाप और पर्यावरणीय अवनयन', ['Greenhouse effect, Chernobyl & Bhopal gas tragedy, Chipko movement, Sustainable development'], TB_GEO_8),
        ch('g8_c8', 8, 'Ch 8: India’s Neighbouring Countries and Their Relationship with India', 'অধ্যায় ৮: ভারতের প্রতিবেশী দেশসমূহ ও তাদের সাথে সম্পর্ক', 'अध्याय 8: भारत के पड़ोसी देश और उनके साथ संबंध', ['Nepal, Bhutan, Bangladesh, Myanmar, Sri Lanka, Pakistan, Maldives, Afghanistan, China — capitals, highest peaks, longest rivers & main products, SAARC'], TB_GEO_8),
        ch('g8_c9', 9, 'Ch 9: Continent of North America (Physiography, Great Lakes, St. Lawrence, Prairie & Canadian Shield)', 'অধ্যায় ৯: উত্তর আমেরিকা মহাদেশ', 'अध्याय 9: उत्तरी अमेरिका महाद्वीप (महान झीलें, प्रेयरी और कनाडाई शील्ड)', ['Rocky & Appalachian Mountains, Grand Canyon, Mississippi-Missouri', '5 Great Lakes (HOMES: Huron, Ontario, Michigan, Erie, Superior), Niagara Falls', 'Canadian Shield fur & paper industry, Prairie wheat basket & meat packing (Chicago)'], TB_GEO_8),
        ch('g8_c10', 10, 'Ch 10: Continent of South America (Andes, Amazon Basin, Pampas & Lake Titicaca)', 'অধ্যায় ১০: দক্ষিণ আমেরিকা মহাদেশ', 'अध्याय 10: दक्षिण अमेरिका महाद्वीप (एंडीज, अमेज़न बेसिन और पम्पास)', ['Andes Mountains (Mt. Aconcagua), Lake Titicaca, Atacama & Patagonia deserts', 'Amazon Selvas rainforest (Lungs of the World) & Pampas grasslands (Estancia, Alfalfa, Wheat & Cattle)'], TB_GEO_8),
        ch('g8_c11', 11, 'Ch 11: Oceania (Australia, New Zealand, Great Barrier Reef, Murray-Darling Basin & Artesian Wells)', 'অধ্যায় ১১: ওশিয়ানিয়া মহাদেশ', 'अध्याय 11: ओशिनिया (ऑस्ट्रेलिया, न्यूज़ीलैंड, ग्रेट बैरियर रीफ़ और मरे-डार्लिंग बेसिन)', ['Australasia, Melanesia, Micronesia, Polynesia', 'Great Dividing Range (Mt. Kosciuszko), Great Artesian Basin, Great Barrier Reef', 'Downs temperate grassland, Merino sheep rearing (Jackaroo), Kiwi & Kangaroo'], TB_GEO_8),
      ],
    },
    9: {
      status: 'prescribed',
      verificationStatus: 'verified',
      applicableToClass: true,
      textbookName: TB_GEO_9,
      syllabusVersion: 'WBBSE Secondary Curriculum (Current Edition)',
      officialSource: 'WBBSE — Bhugol o Paribesh Class IX (Chapters 1–9)',
      boardNote: {
        en: 'Official WBBSE Class IX Bhugol o Paribesh — All 9 Verified Chapters (including complete West Bengal Geography).',
        bn: 'পশ্চিমবঙ্গ মধ্যশিক্ষা পর্ষদ (WBBSE) নবম শ্রেণি ভূগোল ও পরিবেশ — সম্পূর্ণ ৯টি অধ্যায় (পশ্চিমবঙ্গের ভূগোল সহ)।',
        hi: 'WBBSE कक्षा 9 भूगोल ओ परिवेश — सभी 9 सत्यापित अध्याय (पश्चिम बंगाल के भूगोल सहित)।',
      },
      chapters: [
        ch('g9_c1', 1, 'Ch 1: Earth as a Planet (Geoid Shape, Unique Habitability & GPS)', 'অধ্যায় ১: গ্রহরূপে পৃথিবী', 'अध्याय 1: एक ग्रह के रूप में पृथ्वी (भू-आभ आकृति और GPS)', ['Proofs of spherical shape, Oblate Spheroid / Geoid (Johann Benedict Listing)', 'Circumference calculation by Eratosthenes, Global Positioning System (GPS)'], TB_GEO_9),
        ch('g9_c2', 2, 'Ch 2: Movements of the Earth (Rotation, Coriolis Effect, Revolution, Seasons & Eclipses)', 'অধ্যায় ২: পৃথিবীর গতিসমূহ', 'अध्याय 2: पृथ्वी की गतियाँ (घूर्णन और परिक्रमण)', ['Rotational speed variation from Equator (1670 km/h) to Poles (0 km/h)', 'Foucault Pendulum, Ferrel Law, Perihelion/Aphelion, Solstices & Equinoxes'], TB_GEO_9),
        ch('g9_c3', 3, 'Ch 3: Determination of Location of a Place on the Earth Surface (Latitude, Longitude & Time Calculation)', 'অধ্যায় ৩: ভূপৃষ্ঠে কোনো স্থানের অবস্থান নির্ণয়', 'अध्याय 3: पृथ्वी की सतह पर स्थान का निर्धारण (अक्षांश, देशांतर और समय गणना)', ['Properties of Parallels & Meridians, Great Circles', 'Local Time vs Standard Time numerical problems, GMT, IST (82°30′E), Antipodes & International Date Line (180°)'], TB_GEO_9),
        ch('g9_c4', 4, 'Ch 4: Geomorphic Processes and Landforms of the Earth (Endogenic/Exogenic, Mountains, Plateaus & Plains)', 'অধ্যায় ৪: ভূমিরূপ গঠনকারী প্রক্রিয়া ও পৃথিবীর বিভিন্ন ভূমিরূপ', 'अध्याय 4: भू-आकृतिक प्रक्रियाएँ और पृथ्वी के विभिन्न स्थलरूप', ['Endogenic (diastrophic: epeirogenic & orogenic; sudden) and Exogenic (gradation: degradation & aggradation) processes', 'Plate Tectonics & Fold, Block, Volcanic, Residual mountains; Intermontane, Piedmont, Continental, Lava plateaus; Structural, Erosional & Depositional plains'], TB_GEO_9),
        ch('g9_c5', 5, 'Ch 5: Weathering (Mechanical, Chemical & Biological Weathering, Mass Wasting & Soil Conservation)', 'অধ্যায় ৫: আবহবিকার', 'अध्याय 5: अपक्षय (भौतिक, रासायनिक और जैविक अपक्षय एवं मृदा अपरदन)', ['Weathering vs Erosion vs Denudation vs Mass Wasting', 'Exfoliation (onion-peeling), Block disintegration, Granular disintegration, Frost shattering', 'Oxidation, Carbonation, Hydration, Hydrolysis; Regolith, Laterization & Soil conservation'], TB_GEO_9),
        ch('g9_c6', 6, 'Ch 6: Hazards and Disasters (Floods, Droughts, Cyclones, Earthquakes, Tsunamis, Landslides & Avalanches)', 'অধ্যায় ৬: দুর্যোগ ও বিপর্যয়', 'अध्याय 6: आपदा और संकट (बाढ़, सूखा, चक्रवात, भूकंप, सुनामी और भूस्खलन)', ['Difference between Hazard (Duryog) and Disaster (Biparjay)', 'Natural, Quasi-natural, and Man-made disasters', 'Pre-disaster, During-disaster, and Post-disaster management in West Bengal'], TB_GEO_9),
        ch('g9_c7', 7, 'Ch 7: Resources of India (Renewable/Non-Renewable, Iron Ore, Coal, Petroleum, Hydel, Thermal, Nuclear & Non-Conventional Energy)', 'অধ্যায় ৭: ভারতের সম্পদ', 'अध्याय 7: भारत के संसाधन (लौह अयस्क, कोयला, पेट्रोलियम और ऊर्जा संसाधन)', ["Zimmermann's functional theory of resources", 'Magnetite, Haematite, Limonite, Siderite iron ores; Anthracite, Bituminous (Gondwana), Lignite, Peat coal', 'Bombay High, Digboi, Ankleshwar oilfields; Nuclear power plants (Tarapur, Kalpakkam, Kudankulam, Narora, Kakrapar, Rawatbhata, Kaiga); Solar, Wind, Geothermal & Tidal energy'], TB_GEO_9),
        ch('g9_c8', 8, 'Ch 8: West Bengal (Location, Administrative Divisions, Physiography, Rivers, Climate, Soil, Vegetation, Agriculture, Industry, Population & Tourism)', 'অধ্যায় ৮: পশ্চিমবঙ্গ (অবস্থান, প্রশাসনিক বিভাগ, ভূপ্রকৃতি, নদনদী, জলবায়ু, মৃত্তিকা, স্বাভাবিক উদ্ভিদ, কৃষি, শিল্প ও জনসংখ্যা)', 'अध्याय 8: पश्चिम बंगाल (प्रशासनिक विभाग, भू-आकृति, नदियाँ, जलवायु, मिट्टी, वन, कृषि और उद्योग)', ['5 Administrative Divisions & 23 Districts of West Bengal', 'Northern Mountains (Singalila & Darjeeling ranges, Sandakphu 3636 m, Buxa-Jayanti)', 'Western Plateau (Gorgaburu in Ayodhya hills, Susunia, Mama-Bhagne)', 'Plains (Terai-Dooars, Barind, Diara, Tal, Rarh, Sandy Coastal, Active/Mature/Moribund Sundarbans Delta)', 'Tea (Darjeeling), Jute (Hooghly basin), Iron & Steel (Durgapur, Burnpur-Kulti), Petrochemicals (Haldia), IT (Salt Lake Sector V & New Town)'], TB_GEO_9),
        ch('g9_c9', 9, 'Ch 9: Maps and Scale (Classification of Maps, RF, Linear Scale & Cartographic Uses)', 'অধ্যায় ৯: মানচিত্র ও স্কেল', 'अध्याय 9: मानचित्र और मापनी (प्रदर्शक भिन्न RF और रैखिक मापनी)', ['Small-scale (Wall, Atlas) vs Large-scale (Topographical, Cadastral/Mouza) maps', 'Statement scale, Graphical/Linear scale (Primary & Secondary divisions), Vernier scale, and Representative Fraction (RF = Map Distance / Ground Distance)'], TB_GEO_9),
      ],
    },
    10: {
      status: 'prescribed',
      verificationStatus: 'verified',
      applicableToClass: true,
      textbookName: TB_GEO_10,
      syllabusVersion: 'WBBSE Madhyamik Pariksha Syllabus (Current Edition)',
      officialSource: 'WBBSE — Bhugol o Paribesh Class X (Chapters 1–6)',
      boardNote: {
        en: 'Official WBBSE Class X Bhugol o Paribesh (Madhyamik Pariksha) — All 6 Verified Chapters.',
        bn: 'পশ্চিমবঙ্গ মধ্যশিক্ষা পর্ষদ (WBBSE) দশম শ্রেণি ভূগোল ও পরিবেশ (মাধ্যমিক) — সম্পূর্ণ ৬টি অধ্যায়।',
        hi: 'WBBSE कक्षा 10 भूगोल ओ परिवेश (माध्यमिक परीक्षा) — सभी 6 सत्यापित अध्याय।',
      },
      chapters: [
        ch('g10_c1', 1, 'Ch 1: Exogenetic Processes and Resultant Landforms (Fluvial, Glacial & Aeolian Work)', 'অধ্যায় ১: বহির্জাত প্রক্রিয়া ও তাদের দ্বারা সৃষ্ট ভূমিরূপ', 'अध्याय 1: बहिर्जात प्रक्रियाएँ और उनसे निर्मित स्थलरूप (नदी, हिमनद और पवन के कार्य)', ['Degradation, Aggradation & Gradation; Six-power law of river velocity', 'River landforms: Gorge, Canyon, Waterfall, Pothole, Alluvial Cone/Fan, Meander, Ox-bow Lake, Floodplain, Natural Levee, Delta (Arcuate, Bird-foot, Cuspate)', 'Glacial landforms: Cirque/Corrie, Arête, Pyramidal Peak (Horn), U-shaped Valley, Hanging Valley, Fjord, Roche Moutonnée, Crag & Tail, Moraines, Drumlin (Basket of Egg topography), Esker, Kame, Outwash Plain', 'Wind (Aeolian) landforms: Deflation Hollow, Gour/Mushroom Rock, Zeugen, Yardang, Inselberg, Sand Dunes (Barchan & Seif), Loess, Wadis, Pediment, Bajada, Playa'], TB_GEO_10),
        ch('g10_c2', 2, 'Ch 2: Atmosphere (Layers, Insolation, Heat Budget, Temperature, Pressure Belts, Winds, Humidity & Rainfall)', 'অধ্যায় ২: বায়ুমণ্ডল', 'अध्याय 2: वायुमंडल (संरचना, सूर्यातप, ऊष्मा बजट, वायुदाब पेटियाँ, पवनें और वर्षण)', ['Gaseous composition & Aerosols; Troposphere, Stratosphere, Mesosphere, Thermosphere/Ionosphere, Exosphere, Magnetosphere', 'Insolation & Heat Budget (Albedo 35% + 65% absorbed & re-radiated); Conduction, Convection, Radiation, Advection; Inversion of Temperature (Katabatic/Anabatic winds)', '7 Pressure Belts, Coriolis force, Geostrophic wind, Jet Stream, Tropical Cyclones vs Temperate Mid-latitude Cyclones, Anticyclones, El Niño & La Niña', 'Absolute, Specific & Relative Humidity; Orographic, Convectional & Cyclonic rainfall; Köppen climate classification'], TB_GEO_10),
        ch('g10_c3', 3, 'Ch 3: Hydrosphere (Ocean Currents & Tides)', 'অধ্যায় ৩: বারিমণ্ডল', 'अध्याय 3: जलमंडल (महासागरीय धाराएँ और ज्वार-भाटा)', ['Warm and Cold Ocean Currents of Pacific (Kuroshio, Oyashio, Peru/Humboldt), Atlantic (Gulf Stream, Labrador, Canary, Benguela, Brazil, Falkland) & Indian Oceans', 'Grand Banks & Dogger Bank fishing grounds, Sargasso Sea', 'Primary (Lunar/Solar gravity) & Secondary (Centrifugal force) causes of Tides; Spring Tide (Syzygy: Conjunction & Opposition), Neap Tide, Apogean & Perigean Tides, Time interval between two high tides (12h 26m), Tidal Bore (Ban daka in Hooghly)'], TB_GEO_10),
        ch('g10_c4', 4, 'Ch 4: Waste Management', 'অধ্যায় ৪: বর্জ্য ব্যবস্থাপনা', 'अध्याय 4: अपशिष्ट प्रबंधन', ['Solid, Liquid, Gaseous, Toxic & Non-toxic, Biodegradable & Non-biodegradable, E-waste & Biomedical waste', 'Effects of waste on Ganga River, agriculture & human health', '4R Principle (Reduce, Refuse, Reuse, Recycle), Segregation, Landfill, Composting/Vermicomposting, Scrubber (gaseous waste) & Sewage treatment'], TB_GEO_10),
        ch('g10_c5', 5, 'Ch 5: India — Physical and Economic Geography', 'অধ্যায় ৫: ভারত (প্রাকৃতিক ও অর্থনৈতিক ভূগোল)', 'अध्याय 5: भारत (भौतिक और आर्थिक भूगोल)', ['States reorganization (Telangana 2014, J&K and Ladakh UTs 2019), Indira Point & Indira Col', 'Himalayan syntaxial bends, Passes, Karelis of Kashmir, Dun & Kayals (Malabar backwaters), Western vs Eastern Ghats', 'Ganga, Indus, Brahmaputra & Peninsular rivers; Rainwater harvesting (Tamil Nadu mandatory)', 'Monsoon burst, Western Disturbances, Mango Showers, Kalbaisakhi, Loo, October Heat (Ashwiner Jhar)', 'Soils (Bhangar/Khadar, Regur/Black soil, Laterite) & Forests (Mangroves, Tropical Evergreen, Deciduous)', 'Agriculture: Paddy, Wheat, Millet (Jowar, Bajra, Ragi), Sugarcane, Cotton, Tea, Coffee & Green Revolution', 'Industries: Iron & Steel (TISCO, Bhilai, Rourkela, Durgapur, Bokaro, Salem), Cotton Textile (Ahmedabad Manchester of India), Automobile, Petrochemical & IT (Bengaluru Silicon Valley)', '2011 Census Population density, Golden Quadrilateral, North-South & East-West Corridors, Major Ports'], TB_GEO_10),
        ch('g10_c6', 6, 'Ch 6: Satellite Imagery and Topographical Map', 'অধ্যায় ৬: উপগ্রহ চিত্র ও ভূ-বৈচিত্র্যসূচক মানচিত্র', 'अध्याय 6: उपग्रह चित्र और स्थलाकृतिक मानचित्र', ['Remote Sensing (Active vs Passive sensors), Geostationary (INSAT) vs Sun-Synchronous Polar (IRS) satellites', 'False Colour Composite (FCC) bands & Spatial/Spectral/Radiometric/Temporal resolution', 'Survey of India (SOI) Topographical sheets: Million sheet (1:1,000,000), Degree sheet (1:250,000), Fifteen-minute sheet (1:50,000, e.g., 73 J/10), Contour lines & Conventional Signs'], TB_GEO_10),
      ],
    },
  },
};

// Legacy combined entry preserved for backward compatibility with older stored attempts
export const HISTORY_GEOGRAPHY_LEGACY_SUBJECT: SubjectDefinition = {
  id: 'history_geography',
  name: {
    en: 'History & Geography',
    bn: 'ইতিহাস ও ভূগোল (History & Geography)',
    hi: 'इतिहास और भूगोल (History & Geography)',
  },
  shortDesc: {
    en: 'Combined History & Geography curriculum archive.',
    bn: 'ইতিহাস ও ভূগোল সমন্বিত পাঠ্যক্রম।',
    hi: 'इतिहास और भूगोल संयुक्त पाठ्यक्रम।',
  },
  domainGuardKeywords: [
    ...HISTORY_SUBJECT.domainGuardKeywords,
    ...GEOGRAPHY_SUBJECT.domainGuardKeywords,
  ],
  curriculumByClass: {
    5: {
      ...HISTORY_SUBJECT.curriculumByClass[5],
      applicableToClass: false,
      chapters: [
        ...HISTORY_SUBJECT.curriculumByClass[5].chapters,
        ...GEOGRAPHY_SUBJECT.curriculumByClass[5].chapters,
      ],
    },
    6: {
      ...HISTORY_SUBJECT.curriculumByClass[6],
      applicableToClass: false,
      chapters: [
        ...HISTORY_SUBJECT.curriculumByClass[6].chapters,
        ...GEOGRAPHY_SUBJECT.curriculumByClass[6].chapters,
      ],
    },
    7: {
      ...HISTORY_SUBJECT.curriculumByClass[7],
      applicableToClass: false,
      chapters: [
        ...HISTORY_SUBJECT.curriculumByClass[7].chapters,
        ...GEOGRAPHY_SUBJECT.curriculumByClass[7].chapters,
      ],
    },
    8: {
      ...HISTORY_SUBJECT.curriculumByClass[8],
      applicableToClass: false,
      chapters: [
        ...HISTORY_SUBJECT.curriculumByClass[8].chapters,
        ...GEOGRAPHY_SUBJECT.curriculumByClass[8].chapters,
      ],
    },
    9: {
      ...HISTORY_SUBJECT.curriculumByClass[9],
      applicableToClass: false,
      chapters: [
        ...HISTORY_SUBJECT.curriculumByClass[9].chapters,
        ...GEOGRAPHY_SUBJECT.curriculumByClass[9].chapters,
      ],
    },
    10: {
      ...HISTORY_SUBJECT.curriculumByClass[10],
      applicableToClass: false,
      chapters: [
        ...HISTORY_SUBJECT.curriculumByClass[10].chapters,
        ...GEOGRAPHY_SUBJECT.curriculumByClass[10].chapters,
      ],
    },
  },
};
