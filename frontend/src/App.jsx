import { useState } from 'react';
import axios from 'axios';
import { BookOpen, Loader2, RefreshCw, Briefcase, GraduationCap, ChevronRight, ChevronLeft, Menu, X, MapPin, Phone, Mail, Clock, MessageCircle, Play, Download, Sparkles } from 'lucide-react';
import './App.css';

// Complete 42-Question Professional RIASEC Assessment Dataset
const ALL_QUESTIONS = [
  // --- REALISTIC (1 to 7) ---
  { id: "1", text: "I like to build, install, or repair electrical appliances or hardware equipment.", type: "R" },
  { id: "2", text: "I enjoy assembling mechanical parts, working with machinery, or operating precision tools.", type: "R" },
  { id: "3", text: "I prefer practical, hands-on tasks over reading or theoretical discussions.", type: "R" },
  { id: "4", text: "I like working outdoors, doing physical activities, or handling technical equipment.", type: "R" },
  { id: "5", text: "I enjoy setting up networks, tinkering with computer hardware, or fixing mechanical issues.", type: "R" },
  { id: "6", text: "I would enjoy learning how to operate heavy industrial machinery or automated systems.", type: "R" },
  { id: "7", text: "I like fixing things around the house or building custom physical models.", type: "R" },

  // --- INVESTIGATIVE (8 to 14) ---
  { id: "8", text: "I enjoy studying complex data structures, statistics, or analytical charts.", type: "I" },
  { id: "9", text: "I like to explore how things work behind the scenes by analyzing scientific principles.", type: "I" },
  { id: "10", text: "I enjoy solving complicated puzzles, mathematical equations, or logical problems.", type: "I" },
  { id: "11", text: "I like conducting research, reading technical whitepapers, or performing lab experiments.", type: "I" },
  { id: "12", text: "I enjoy using logic and code to diagnose bugs or investigate system vulnerabilities.", type: "I" },
  { id: "13", text: "I am curious about advanced technology trends like artificial intelligence and data science.", type: "I" },
  { id: "14", text: "I prefer working on projects that require deep critical thinking and root-cause analysis.", type: "I" },

  // --- ARTISTIC (15 to 21) ---
  { id: "15", text: "I enjoy sketching, painting, or creating digital illustrations and visuals.", type: "A" },
  { id: "16", text: "I like designing user interfaces, creative layouts for websites, or logos.", type: "A" },
  { id: "17", text: "I love creative writing, storytelling, scriptwriting, or generating content ideas.", type: "A" },
  { id: "18", text: "I enjoy video editing, animations, color grading, or high-fidelity multimedia production.", type: "A" },
  { id: "19", text: "I like brainstorming out-of-the-box conceptual ideas without being bound by rigid rules.", type: "A" },
  { id: "20", text: "I appreciate architectural aesthetics, photography, or creative arts branding.", type: "A" },
  { id: "21", text: "I prefer expressing my thoughts through visual design rather than long data spreadsheets.", type: "A" },

  // --- SOCIAL (22 to 28) ---
  { id: "22", text: "I genuinely enjoy teaching, mentoring, or explaining educational concepts to others.", type: "S" },
  { id: "23", text: "I like counseling friends or helping people map out solutions to their personal/career problems.", type: "S" },
  { id: "24", text: "I prefer working in collaborative teams where human interaction is highly valued.", type: "S" },
  { id: "25", text: "I feel satisfied when I perform community service, volunteer, or support vulnerable groups.", type: "S" },
  { id: "26", text: "I enjoy hosting group discussions, conducting webinars, or public speaking.", type: "S" },
  { id: "27", text: "I am good at listening empathetically to people's issues and guiding them patiently.", type: "S" },
  { id: "28", text: "I find it easy to network, make new connections, and build meaningful relationships.", type: "S" },

  // --- ENTERPRISING (29 to 35) ---
  { id: "29", text: "I enjoy leading a team, assigning tasks, and managing group operations.", type: "E" },
  { id: "30", text: "I like pitching sales ideas, negotiation, or convincing people to agree with my perspective.", type: "E" },
  { id: "31", text: "I am highly interested in launching a startup, running a business, or e-commerce models.", type: "E" },
  { id: "32", text: "I like managing marketing campaigns, social media growth hacking, or digital advertising.", type: "E" },
  { id: "33", text: "I am comfortable taking calculated financial or strategic risks to achieve big goals.", type: "E" },
  { id: "34", text: "I enjoy organizing large events, managing budgets, and dealing with external vendors.", type: "E" },
  { id: "35", text: "I am motivated by competition, achieving key performance metrics, and career growth.", type: "E" },

  // --- CONVENTIONAL (36 to 42) ---
  { id: "36", text: "I like maintaining highly organized file structures, data backups, and documentation.", type: "C" },
  { id: "37", text: "I enjoy bookkeeping, managing financial ledgers, or auditing numbers systematically.", type: "C" },
  { id: "38", text: "I prefer clear guidelines, explicit instructions, and structured routines over ambiguity.", type: "C" },
  { id: "39", text: "I like double-checking details, proofreading reports, and ensuring operational accuracy.", type: "C" },
  { id: "40", text: "I enjoy scheduling timelines, building calendars, and tracking daily administrative checklists.", type: "C" },
  { id: "41", text: "I am comfortable handling database management, filling sheets, or inventory optimization.", type: "C" },
  { id: "42", text: "I like creating standard operating procedures (SOPs) to make workflows uniform.", type: "C" }
];

const QUESTIONS_PER_PAGE = 6; // Total 7 smooth steps (6 * 7 = 42)

// Question IDs and scoring stay the same in both languages; only the wording changes.
const ROMAN_URDU_QUESTIONS = {
  1: 'Mujhe electrical appliances ya hardware equipment banana, install karna, ya repair karna pasand hai.',
  2: 'Mujhe mechanical parts jorna, machinery ke saath kaam karna, ya precision tools chalana pasand hai.',
  3: 'Mujhe parhne ya sirf theory par baat karne ke bajaye practical kaam karna zyada pasand hai.',
  4: 'Mujhe outdoor kaam, physical activities, ya technical equipment handle karna pasand hai.',
  5: 'Mujhe networks set up karna, computer hardware samajhna, ya mechanical problems theek karna pasand hai.',
  6: 'Mujhe heavy industrial machinery ya automated systems chalana seekhna acha lagega.',
  7: 'Mujhe ghar ki cheezen theek karna ya apne haath se models banana pasand hai.',
  8: 'Mujhe complex data, statistics, ya analytical charts parhna aur samajhna pasand hai.',
  9: 'Mujhe scientific principles ka jaiza le kar samajhna pasand hai ke cheezen andar se kaise kaam karti hain.',
  10: 'Mujhe mushkil puzzles, mathematical equations, ya logical problems solve karna pasand hai.',
  11: 'Mujhe research karna, technical papers parhna, ya lab experiments karna pasand hai.',
  12: 'Mujhe logic aur code se bugs dhoondhna ya system security ke masail samajhna pasand hai.',
  13: 'Mujhe artificial intelligence aur data science jaisi nayi technology mein dilchaspi hai.',
  14: 'Mujhe aise projects pasand hain jin mein gehri soch aur maslay ki asal wajah dhoondhni ho.',
  15: 'Mujhe sketching, painting, ya digital tasveerain aur designs banana pasand hai.',
  16: 'Mujhe website ke layouts, user interfaces, ya logos design karna pasand hai.',
  17: 'Mujhe creative writing, kahani sunana, scripts likhna, ya content ideas banana pasand hai.',
  18: 'Mujhe videos edit karna, animation, color grading, ya multimedia content banana pasand hai.',
  19: 'Mujhe naye aur creative ideas sochna pasand hai, chahe un ke liye tay shuda rules na hon.',
  20: 'Mujhe architecture ki khoobsurti, photography, ya creative arts aur branding pasand hai.',
  21: 'Mujhe lambi spreadsheets ke bajaye visual design se apni baat samjhana pasand hai.',
  22: 'Mujhe doosron ko parhana, guide karna, ya taleemi concepts samjhana pasand hai.',
  23: 'Mujhe doston ko mashwara dena aur un ke personal ya career masail ka hal dhoondhne mein madad karna pasand hai.',
  24: 'Mujhe aisi team mein kaam karna pasand hai jahan logon se milna aur baat cheet aham ho.',
  25: 'Mujhe community service, volunteering, ya zarooratmand logon ki madad karne se khushi milti hai.',
  26: 'Mujhe group discussions karwana, webinars host karna, ya logon ke samne bolna pasand hai.',
  27: 'Main logon ki baat tawajjo se sun kar sabr ke saath un ki rehnumai kar sakta/sakti hoon.',
  28: 'Mujhe naye logon se milna, rabtay banana, aur achay talluqat qaim karna asaan lagta hai.',
  29: 'Mujhe team lead karna, kaam taqseem karna, aur group ke operations manage karna pasand hai.',
  30: 'Mujhe sales ideas pesh karna, negotiation karna, ya logon ko apni baat par razi karna pasand hai.',
  31: 'Mujhe startup shuru karne, business chalane, ya e-commerce mein dilchaspi hai.',
  32: 'Mujhe marketing campaigns, social media growth, ya digital advertising manage karna pasand hai.',
  33: 'Barray maqsad hasil karne ke liye main soch samajh kar financial ya strategic risk le sakta/sakti hoon.',
  34: 'Mujhe barray events arrange karna, budget manage karna, aur vendors se rabta rakhna pasand hai.',
  35: 'Mujhe competition, targets hasil karna, aur career mein taraqqi karna motivate karta hai.',
  36: 'Mujhe files ko munazzam rakhna, data backups banana, aur documentation maintain karna pasand hai.',
  37: 'Mujhe bookkeeping, financial records manage karna, ya numbers ka hisaab check karna pasand hai.',
  38: 'Mujhe wazeh rules, saaf instructions, aur munazzam routine pasand hain.',
  39: 'Mujhe details dobara check karna, reports proofread karna, aur kaam ki durusti yaqini banana pasand hai.',
  40: 'Mujhe schedule banana, calendar manage karna, aur rozana ke administrative kaam track karna pasand hai.',
  41: 'Mujhe databases manage karna, sheets bharna, ya inventory ko behtar banana theek lagta hai.',
  42: 'Mujhe kaam ko aik jaisa aur munazzam banane ke liye standard procedures (SOPs) banana pasand hai.',
};

const COPY = {
  en: {
    welcomeEyebrow: 'SKILL CRAFT INSTITUTE · CAREER GUIDANCE', welcomeTitle: 'Find your direction.', welcomeTitleEm: 'Build your future.',
    welcomeDescription: 'Get personalized career counseling to explore a suitable study path and a digital course recommendation from Skill Craft Institute.',
    start: 'Start Career Counseling', explore: 'Explore the institute',
    assessmentTitle: 'Career Counseling', assessmentDescription: 'Answer these questions honestly to receive study and digital course guidance.',
    progress: 'Progress', questions: 'Career Counseling Questions (English)', yes: 'Yes, I agree', no: "No, I don't",
    previous: 'Previous', next: 'Next Page', submit: 'Get My Career Guidance Report 🚀', loading: 'Preparing your guidance report...',
    answerPage: 'Please answer all questions on this screen before moving to the next page.',
    unanswered: (count) => `You have not answered ${count} of the 42 questions. Please select Yes or No for each question.`,
    modalTitle: 'Choose your language and qualification', modalDescription: 'We will use these details to personalize your career guidance.',
    qualification: 'Current qualification', chooseQualification: 'Select your qualification', language: 'Question language', chooseLanguage: 'Choose a language',
    english: 'English', romanUrdu: 'Urdu', other: 'Other', otherPlaceholder: 'Enter your qualification', continue: 'Continue', cancel: 'Cancel',
    chooseBoth: 'Please select your qualification and language to continue.', otherRequired: 'Please enter your qualification.',
    consultationError: 'Career report could not be generated. Please try again or contact Skill Craft Institute.',
    fallbackNotice: 'Gemini is temporarily unavailable, so this report uses local guidance based on your answers.',
    reportEyebrow: 'YOUR PERSONALIZED CAREER GUIDANCE', reportTitle: 'Your Career', reportTitleEm: 'Roadmap',
    reportIntro: 'A clear starting point for your education and skills journey.', profile: 'INTEREST PROFILE',
    personality: 'Your Personality Profile', recommendations: 'Two Paths to Explore', reasoning: 'Why These Recommendations Fit',
    actionPlan: 'A Practical Action Plan', academicTrack: 'ACADEMIC TRACK', suggestedStudy: 'Your suggested study direction',
    instituteCourse: 'SKILL CRAFT INSTITUTE COURSE', suggestedCourse: 'Your suggested digital skills course',
    yourNextStep: 'YOUR NEXT STEP', consultation: 'For further consultation, please visit Skill Craft Institute or contact us via the institute’s official WhatsApp number.',
    contactInstitute: 'Contact Institute', startAgain: 'Start Again',
  },
  ur: {
    welcomeEyebrow: 'SKILL CRAFT INSTITUTE · CAREER GUIDANCE', welcomeTitle: 'Apni simt dhoondein.', welcomeTitleEm: 'Apna mustaqbil banayein.',
    welcomeDescription: 'Skill Craft Institute se apni taleem aur digital course ke liye zaati career mashwara hasil karein.',
    start: 'Career Counseling Shuru Karein', explore: 'Institute dekhein',
    assessmentTitle: 'Career Counseling', assessmentDescription: 'Behtar taleemi aur digital course mashwaray ke liye in sawalon ke sachay jawab dein.',
    progress: 'Pesh raft', questions: 'Career Counseling ke Sawalat (Roman Urdu)', yes: 'Haan, main mutafiq hoon', no: 'Nahi, main mutafiq nahi hoon',
    previous: 'Pichla Safha', next: 'Agla Safha', submit: 'Meri Career Guidance Report Banayein 🚀', loading: 'Aap ki report tayyar ho rahi hai...',
    answerPage: 'Agley safhay par janay se pehle is safhay ke tamam sawalon ke jawab dein.',
    unanswered: (count) => `42 mein se ${count} sawalon ke jawab baqi hain. Har sawal ke liye haan ya nahi select karein.`,
    modalTitle: 'Apni zaban aur taleemi qabliyat chunein', modalDescription: 'In maloomat se aap ke liye behtar career mashwara tayyar hoga.',
    qualification: 'Aap ki mojooda taleemi qabliyat', chooseQualification: 'Apni qualification select karein', language: 'Sawal ki zaban', chooseLanguage: 'Zaban select karein',
    english: 'English', romanUrdu: 'Urdu', other: 'Koi aur', otherPlaceholder: 'Apni taleemi qabliyat likhein', continue: 'Jari Rakhein', cancel: 'Wapas',
    chooseBoth: 'Jari rakhne ke liye qualification aur zaban dono select karein.', otherRequired: 'Apni taleemi qabliyat likhna zaroori hai.',
    consultationError: 'Career report tayyar nahi ho saki. Dobara koshish karein ya Skill Craft Institute se rabta karein.',
    fallbackNotice: 'Gemini filhal dastiyab nahi, is liye yeh report aap ke jawabat ki bunyaad par tayyar ki gayi hai.',
    reportEyebrow: 'AAP KI ZAATI CAREER GUIDANCE', reportTitle: 'Aap ka Career', reportTitleEm: 'Roadmap',
    reportIntro: 'Taleem aur skills ke safar ke liye aik wazeh shuruat.', profile: 'DILCHASPI KA PROFILE',
    personality: 'Aap ki Shakhsiyati Salahiyatein', recommendations: 'Aap ke Liye Do Raaste', reasoning: 'Yeh Mashwaray Aap ke Liye Kyun Munasib Hain',
    actionPlan: 'Amli Action Plan', academicTrack: 'TALEEMI RAASTA', suggestedStudy: 'Aap ke liye tajweez shuda taleemi simt',
    instituteCourse: 'SKILL CRAFT INSTITUTE KA COURSE', suggestedCourse: 'Aap ke liye tajweez shuda digital skills course',
    yourNextStep: 'AAP KA AGLA QADAM', consultation: 'Mazeed mashwaray ke liye Skill Craft Institute tashreef le jayein ya institute ke official WhatsApp number par rabta karein.',
    contactInstitute: 'Institute se Rabta', startAgain: 'Dobara Shuru Karein',
  },
};

function App() {
  const [started, setStarted] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [educationLevel, setEducationLevel] = useState('');
  const [otherEducation, setOtherEducation] = useState('');
  const [language, setLanguage] = useState('');
  const [showPreferences, setShowPreferences] = useState(false);
  const [responses, setResponses] = useState({});
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const isRomanUrdu = language === 'ur';
  const t = COPY[isRomanUrdu ? 'ur' : 'en'];
  const landing = COPY.en;

  // Pagination bounds calculation
  const totalPages = Math.ceil(ALL_QUESTIONS.length / QUESTIONS_PER_PAGE);
  const startIndex = currentPage * QUESTIONS_PER_PAGE;
  const currentQuestions = ALL_QUESTIONS.slice(startIndex, startIndex + QUESTIONS_PER_PAGE);

  const handleRadioChange = (questionId, value) => {
    setResponses(prev => ({ ...prev, [questionId]: value }));
  };

  const handleNext = () => {
    setError('');
    // Check if all questions on current screen are answered
    const allAnswered = currentQuestions.every(q => responses[q.id] !== undefined);
    if (!allAnswered) {
      setError(t.answerPage);
      return;
    }
    if (currentPage < totalPages - 1) {
      setCurrentPage(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    setError('');
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const unansweredQuestions = ALL_QUESTIONS.filter((question) => responses[question.id] === undefined);
    if (unansweredQuestions.length > 0) {
      const firstUnanswered = unansweredQuestions[0];
      setError(t.unanswered(unansweredQuestions.length));
      setCurrentPage(Math.floor((Number(firstUnanswered.id) - 1) / QUESTIONS_PER_PAGE));
      window.setTimeout(() => {
        const questionElement = document.getElementById(`question-${firstUnanswered.id}`);
        questionElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        questionElement?.querySelector('input[type="radio"]')?.focus({ preventScroll: true });
      }, 0);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        education_level: educationLevel === 'Other' ? `Other: ${otherEducation.trim()}` : educationLevel,
        response_language: isRomanUrdu ? 'Roman Urdu' : 'English',
        responses,
      };
      
      const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000').replace(/\/+$/, '');
      const response = await axios.post(`${apiBaseUrl}/api/counsel/process`, payload);
      setResult(response.data);
    } catch (err) {
      const detail = err.response?.data?.detail;
      const message = Array.isArray(detail)
        ? detail.map((item) => item.msg).filter(Boolean).join(' ')
        : detail;
      setError(message || t.consultationError);
    } finally {
      setLoading(false);
    }
  };

  const continueWithPreferences = (event) => {
    event.preventDefault();
    setError('');
    if (!educationLevel || !language) {
      setError(t.chooseBoth);
      return;
    }
    if (educationLevel === 'Other' && !otherEducation.trim()) {
      setError(t.otherRequired);
      return;
    }
    setShowPreferences(false);
    setStarted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetTest = () => {
    setResponses({});
    setResult(null);
    setCurrentPage(0);
    setError('');
  };

  const downloadReportPdf = () => {
    const previousTitle = document.title;
    const restoreTitle = () => {
      document.title = previousTitle;
      window.removeEventListener('afterprint', restoreTitle);
    };
    window.addEventListener('afterprint', restoreTitle, { once: true });
    document.title = `Skill Craft Institute Career Guidance Report - ${result?.riasec_code || 'Student'}`;
    window.print();
  };

  return (
    <div className="brand-app">
      <header className="brand-header">
        <a className="brand-lockup" href="https://www.skillcraftinstitute.com/" aria-label="Skill Craft Institute home">
          <img className="brand-logo" src="https://www.skillcraftinstitute.com/wp-content/uploads/2026/01/Skill-craft-logo-scaled-150x150.png" alt="Skill Craft Institute logo" />
          <span className="brand-name">Skill Craft Institute<small>SUCCESS THROUGH SKILLS</small></span>
        </a>
        <button className="menu-toggle" type="button" aria-label={mobileNavOpen ? 'Close navigation menu' : 'Open navigation menu'} aria-expanded={mobileNavOpen} aria-controls="brand-navigation" onClick={() => setMobileNavOpen((open) => !open)}>
          {mobileNavOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <nav id="brand-navigation" className={`brand-nav${mobileNavOpen ? ' is-open' : ''}`} aria-label="Main navigation">
          <a href="https://www.skillcraftinstitute.com/" onClick={() => setMobileNavOpen(false)}>Home</a>
          <a href="https://www.skillcraftinstitute.com/courses/" onClick={() => setMobileNavOpen(false)}>Courses</a>
          <a href="https://www.skillcraftinstitute.com/about-skill-craft/" onClick={() => setMobileNavOpen(false)}>About</a>
          <a href="https://www.skillcraftinstitute.com/apply-now/" onClick={() => setMobileNavOpen(false)}>Enroll Now</a>
          <a href="https://www.skillcraftinstitute.com/contact-us/" onClick={() => setMobileNavOpen(false)}>Contact Us</a>
          <a href="https://www.skillcraftinstitute.com/certificate-verification-portal/" onClick={() => setMobileNavOpen(false)}>Verification Portal</a>
        </nav>
      </header>

      <main className="app-main">
      <div className="max-w-6xl mx-auto">

        {error && !showPreferences && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-lg shadow-sm font-medium">
            {error}
          </div>
        )}

        {!started ? (
          <section className="welcome-card" aria-labelledby="welcome-title">
            <div className="welcome-copy">
              <span className="eyebrow"><span className="eyebrow-dot" /> {landing.welcomeEyebrow}</span>
              <h1 id="welcome-title">{landing.welcomeTitle}<br /><em>{landing.welcomeTitleEm}</em></h1>
              <p className="welcome-description">{landing.welcomeDescription}</p>
              <div className="welcome-actions">
                <button type="button" className="primary-cta" onClick={() => { setError(''); setShowPreferences(true); }}>
                  {landing.start} <ChevronRight size={19} />
                </button>
                <a className="secondary-cta" href="https://www.skillcraftinstitute.com/">{landing.explore} <ChevronRight size={18} /></a>
              </div>
              <div className="welcome-meta"><span><strong>42</strong> short questions</span><i /> <span><strong>7</strong> simple steps</span><i /> <span>Personalized report</span></div>
            </div>
            <div className="welcome-art" aria-hidden="true">
              <div className="orbit orbit-one" /><div className="orbit orbit-two" />
              <div className="art-core"><img className="art-crest" src="https://www.skillcraftinstitute.com/wp-content/uploads/2026/01/Skill-craft-logo-scaled-150x150.png" alt="" /><span>YOUR<br />NEXT STEP</span></div>
              <span className="art-chip chip-top">CAREER CLARITY</span><span className="art-chip chip-bottom">SKILLS FOR TOMORROW</span>
              <span className="art-spark spark-one">✦</span><span className="art-spark spark-two">✦</span>
            </div>
            <div className="welcome-bottom" id="institute-courses">
              <div><span className="eyebrow">EXPLORE OUR DIGITAL SKILLS</span><p>Recommendations focus on courses offered at Skill Craft Institute.</p></div>
              <div className="course-pills">
                {['Office Management', 'Python Development', 'Agentic AI & AI Agents', 'Web Development & AI', 'Advanced Graphic Designing & AI', 'Digital Marketing & AI', 'Data Science and Analytics', 'Video Editing', 'AI Prompt Engineering', 'AI YouTube & TikTok Automation', 'Spoken English/ IELTS Preparation'].map((course) => <span key={course}>{course}</span>)}
              </div>
            </div>
          </section>
        ) : !result ? (
          <form onSubmit={handleSubmit} className="bg-white shadow-xl rounded-2xl p-6 sm:p-10 border border-slate-100">

            <div className="assessment-heading">
              <span className="eyebrow">SKILL CRAFT INSTITUTE · CAREER GUIDANCE</span>
              <h1>{t.assessmentTitle}</h1>
              <p>{t.assessmentDescription}</p>
            </div>
            
            {/* Step Banner Tracker */}
            <div className="mb-8 flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-100">
              <span className="text-sm font-bold text-indigo-700 uppercase tracking-wider">
                {t.progress}: Step {currentPage + 1} of {totalPages}
              </span>
              <div className="w-1/2 bg-slate-200 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-indigo-600 h-full transition-all duration-300"
                  style={{ width: `${((currentPage + 1) / totalPages) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Assessment Segment */}
            <div className="space-y-6">
              <label className="block text-lg font-semibold text-slate-800 mb-2 flex items-center gap-2">
                <BookOpen className="text-indigo-600" /> {t.questions}
              </label>
              
              {currentQuestions.map((q, index) => (
                <div id={`question-${q.id}`} key={q.id} className="p-5 bg-slate-50/50 rounded-xl border border-slate-100 hover:border-indigo-100/70 transition duration-200">
                  <p className="text-slate-800 font-semibold mb-3 leading-relaxed">
                    <span className="text-indigo-600 mr-2 font-black">Q{startIndex + index + 1}.</span> {isRomanUrdu ? ROMAN_URDU_QUESTIONS[q.id] : q.text}
                  </p>
                  <div className="flex gap-8">
                    <label className="flex items-center gap-2.5 cursor-pointer text-slate-700 font-medium select-none">
                      <input
                        type="radio"
                        name={`q-${q.id}`}
                        value={1}
                        checked={responses[q.id] === 1}
                        onChange={() => handleRadioChange(q.id, 1)}
                        className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-slate-300"
                      />
                      {t.yes}
                    </label>
                    <label className="flex items-center gap-2.5 cursor-pointer text-slate-700 font-medium select-none">
                      <input
                        type="radio"
                        name={`q-${q.id}`}
                        value={0}
                        checked={responses[q.id] === 0}
                        onChange={() => handleRadioChange(q.id, 0)}
                        className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-slate-300"
                      />
                      {t.no}
                    </label>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            <div className="mt-8 flex justify-between items-center pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={handlePrev}
                disabled={currentPage === 0}
                className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition disabled:opacity-40"
              >
                <ChevronLeft size={18} /> {t.previous}
              </button>

              {currentPage < totalPages - 1 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow transition"
                >
                  {t.next} <ChevronRight size={18} />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl shadow-lg transition disabled:opacity-50"
                >
                  {loading ? (
                    <>
                    <Loader2 className="animate-spin" /> {t.loading}
                    </>
                  ) : (
                    t.submit
                  )}
                </button>
              )}
            </div>
          </form>
        ) : (
          
          <div className="report-page">
            {result.roadmap?.is_fallback && <div className="report-fallback-notice" role="status">{t.fallbackNotice}</div>}
            <div className="report-toolbar">
              <button type="button" className="report-download" onClick={downloadReportPdf}>
                <Download size={18} /> Download Report as PDF
              </button>
              <button type="button" className="report-retake" onClick={resetTest}>
                <RefreshCw size={16} /> {t.startAgain}
              </button>
              <span className="report-download-hint">Choose “Save as PDF” in the print window.</span>
            </div>

            <article className="report-document" aria-labelledby="report-title">
              <header className="report-hero">
                <div className="report-brandline">
                  <img src="https://www.skillcraftinstitute.com/wp-content/uploads/2026/01/Skill-craft-logo-scaled-150x150.png" alt="" />
                  <span>SKILL CRAFT INSTITUTE<small>SUCCESS THROUGH SKILLS</small></span>
                </div>
                <div className="report-hero-content">
                  <span className="report-overline"><Sparkles size={14} /> {t.reportEyebrow}</span>
                  <h2 id="report-title">{t.reportTitle}<br /><em>{t.reportTitleEm}</em></h2>
                  <p>{t.reportIntro}</p>
                </div>
                <div className="report-profile-badge">
                  <span>{t.profile}</span>
                  <strong>{result.riasec_code}</strong>
                  <small>RIASEC</small>
                </div>
                <span className="report-hero-ornament" aria-hidden="true">✦</span>
              </header>

              <div className="report-content">
                <section className="report-section report-personality">
                  <div className="report-section-heading"><span>01</span><div><small>{isRomanUrdu ? 'AAP KO SAMJHEIN' : 'UNDERSTANDING YOU'}</small><h3>{t.personality}</h3></div></div>
                  <p>{result.roadmap?.personality_summary}</p>
                </section>

                <section className="report-section">
                  <div className="report-section-heading"><span>02</span><div><small>{isRomanUrdu ? 'AAP KE LIYE TAJWEZ' : 'YOUR RECOMMENDATIONS'}</small><h3>{t.recommendations}</h3></div></div>
                  <div className="report-recommendations">
                    <div className="recommendation-card academic-card">
                      <div className="recommendation-icon"><GraduationCap size={22} /></div>
                      <div><small>{t.academicTrack}</small><h4>{result.roadmap?.academic_track}</h4><p>{t.suggestedStudy}</p></div>
                    </div>
                    <div className="recommendation-card digital-card">
                      <div className="recommendation-icon"><Briefcase size={21} /></div>
                      <div><small>{t.instituteCourse}</small><h4>{result.roadmap?.digital_skill_track}</h4><p>{t.suggestedCourse}</p></div>
                    </div>
                  </div>
                </section>

                <section className="report-section report-fit">
                  <div className="report-section-heading"><span>03</span><div><small>{isRomanUrdu ? 'WAJAH' : 'THE REASONING'}</small><h3>{t.reasoning}</h3></div></div>
                  <p>{result.roadmap?.why_this_combination}</p>
                </section>

                <section className="report-section report-action-plan">
                  <div className="report-section-heading"><span>04</span><div><small>{isRomanUrdu ? 'AAP KE AGLE QADAM' : 'YOUR NEXT MOVES'}</small><h3>{t.actionPlan}</h3></div></div>
                  <ol>
                    {result.roadmap?.action_plan?.map((step, idx) => <li key={idx}><span>{String(idx + 1).padStart(2, '0')}</span><p>{step}</p></li>)}
                  </ol>
                </section>

                <footer className="report-consultation">
                  <div className="consultation-mark"><MessageCircle size={20} /></div>
                  <div><small>{t.yourNextStep}</small><p>{t.consultation}</p></div>
                  <a href="https://wa.me/923121497146" target="_blank" rel="noreferrer" aria-label={t.contactInstitute}>{t.contactInstitute} <ChevronRight size={16} /></a>
                </footer>
                <div className="report-document-footer"><span>SKILL CRAFT INSTITUTE</span><span>Success through skills</span></div>
              </div>
            </article>
          </div>
        )}
      </div>
      </main>
      <footer className="brand-footer">
        <div className="footer-main">
          <section className="footer-about">
            <a className="footer-logo" href="https://www.skillcraftinstitute.com/" aria-label="Skill Craft Institute home">
              <img src="https://www.skillcraftinstitute.com/wp-content/uploads/2026/01/Skill-craft-logo-scaled-150x150.png" alt="Skill Craft Institute logo" />
            </a>
            <p>Empowering futures through quality education and practical skills training in IT, AI and Digital Marketing.</p>
            <div className="footer-socials">
              <a href="https://wa.me/923121497146" target="_blank" rel="noreferrer" aria-label="WhatsApp"><MessageCircle size={18} /></a>
              <a href="https://www.youtube.com/@skillcraftInstitutesharaqpur" target="_blank" rel="noreferrer" aria-label="YouTube"><Play size={17} fill="currentColor" /></a>
            </div>
          </section>
          <section className="footer-column">
            <h2>Quick Links</h2>
            <a href="https://www.skillcraftinstitute.com/">Home</a>
            <a href="https://www.skillcraftinstitute.com/courses/">Courses</a>
            <a href="https://www.skillcraftinstitute.com/about-skill-craft/">About Us</a>
            <a href="https://www.skillcraftinstitute.com/apply-now/">Apply Now</a>
            <a href="https://www.skillcraftinstitute.com/certificate-verification-portal/">Verify Certificate</a>
            <a href="https://www.skillcraftinstitute.com/contact-us/">Contact</a>
          </section>
          <section className="footer-column">
            <h2>Featured Courses</h2>
            {['Digital Marketing & AI', 'Agentic AI & AI Agents', 'Web Development & AI', 'Advanced Graphic Designing & AI', 'Python Development'].map((course) => <a key={course} href="https://www.skillcraftinstitute.com/courses/">{course}</a>)}
          </section>
          <section className="footer-column footer-contact">
            <h2>Contact</h2>
            <p><MapPin size={17} /><span>Opposite Water Tank Near Town Committee Office, Tehsil Road, Sharaqpur</span></p>
            <a href="tel:+923121497146"><Phone size={17} /><span>+92 312 1497146</span></a>
            <a href="https://wa.me/923121497146" target="_blank" rel="noreferrer"><MessageCircle size={17} /><span>WhatsApp: +92 312 1497146</span></a>
            <a href="mailto:contact@skillcraftinstitute.com"><Mail size={17} /><span>contact@skillcraftinstitute.com</span></a>
            <p><Clock size={17} /><span>Monday–Saturday: 09:00 AM to 06:00 PM</span></p>
          </section>
        </div>
        <div className="footer-legal">
          <span>© 2026 Skill Craft Institute. All rights reserved.</span>
          <div>
            <a href="https://www.skillcraftinstitute.com/privacy-policy/">Privacy Policy</a><i />
            <a href="https://www.skillcraftinstitute.com/terms-of-courses/">Terms of Admission</a><i />
            <a href="https://www.skillcraftinstitute.com/terms-of-services/">Terms of Services</a>
          </div>
        </div>
      </footer>

      {showPreferences && (
        <div className="preferences-backdrop">
          <form className="preferences-dialog" onSubmit={continueWithPreferences} role="dialog" aria-modal="true" aria-labelledby="preferences-title">
            <span className="eyebrow"><span className="eyebrow-dot" /> SKILL CRAFT INSTITUTE</span>
            <h2 id="preferences-title">{t.modalTitle}</h2>
            <p>{t.modalDescription}</p>
            {error && <div className="preferences-error" role="alert">{error}</div>}
            <label htmlFor="qualification-select">{t.qualification}</label>
            <select id="qualification-select" value={educationLevel} onChange={(event) => { setEducationLevel(event.target.value); setError(''); }} required>
              <option value="">{t.chooseQualification}</option>
              <option value="Matric Science">Matric Science (BISE)</option>
              <option value="Matric Arts">Matric Arts (BISE)</option>
              <option value="O-Levels / IGCSE">O-Levels / IGCSE</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Intermediate Result Awaiting">{isRomanUrdu ? 'Intermediate (Result ka intezar)' : 'Intermediate (Result Awaiting)'}</option>
              <option value="Other">{t.other}</option>
            </select>
            {educationLevel === 'Other' && (
              <input
                type="text"
                value={otherEducation}
                onChange={(event) => { setOtherEducation(event.target.value); setError(''); }}
                placeholder={t.otherPlaceholder}
                aria-label={t.otherPlaceholder}
                maxLength={100}
                required
              />
            )}
            <label htmlFor="language-select">{t.language}</label>
            <select id="language-select" value={language} onChange={(event) => { setLanguage(event.target.value); setError(''); }} required>
              <option value="">{t.chooseLanguage}</option>
              <option value="en">{t.english}</option>
              <option value="ur">{t.romanUrdu}</option>
            </select>
            <div className="preferences-actions">
              <button type="button" className="preferences-cancel" onClick={() => { setShowPreferences(false); setError(''); }}>{t.cancel}</button>
              <button type="submit" className="primary-cta preferences-continue">{t.continue}<ChevronRight size={18} /></button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default App;
