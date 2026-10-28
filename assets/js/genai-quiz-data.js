/* =====================================================================
   GenAI Lab – questionnaire content
   ---------------------------------------------------------------------
   Edit this file to change the scenarios. No other file needs changing.

   Each scenario has:
     id        short unique code
     topic     short label shown above the scenario
     text      the situation the teacher reads
     answer    the recommended verdict: "ok" | "caution" | "avoid"
     why       explanation shown after answering
     instead   list of safer alternatives; "type" is one of
               "local" | "institutional" | "european" | "practice"

   Verdict labels shown to the teacher are defined in VERDICTS below.
   ===================================================================== */
window.GENAI_QUIZ = {
  verdicts: {
    ok: "Fine to do",
    caution: "Only with precautions",
    avoid: "Don't do it"
  },
  alternatives: {
    local: {
      label: "Local LLM",
      text: "An open-weight model running on your own computer (for example with Ollama, LM Studio or GPT4All). Data never leaves your device."
    },
    institutional: {
      label: "Institutional LLM",
      text: "A service provided or contracted by your university, covered by a data processing agreement. Ask your IT department or Data Protection Officer which one you may use."
    },
    european: {
      label: "European LLM",
      text: "A provider based and hosting data in the EU, under the GDPR (for example Mistral AI's Le Chat, or open European models such as EuroLLM and those from the OpenEuroLLM project)."
    },
    practice: {
      label: "Better practice",
      text: ""
    }
  },
  scenarios: [
    {
      id: "grading-names",
      topic: "Assessment · personal data",
      text: "You paste 40 student essays, with names and student numbers, into a free public chatbot and ask it to suggest grades.",
      answer: "avoid",
      why: "Student work linked to names is personal data. A free consumer chatbot usually has no data processing agreement with your university, may store the text outside the EU and may use it for training. The GDPR requires a legal basis and safeguards that you cannot guarantee here.",
      instead: [
        { type: "institutional", text: "Use your institution's approved tool, and only with pseudonymised essays." },
        { type: "local", text: "Run a local model if you need help drafting feedback on many texts." },
        { type: "practice", text: "Keep the grade a human decision; use AI at most for draft feedback that you review." }
      ]
    },
    {
      id: "patient-letters",
      topic: "Clinical data",
      text: "To build a realistic case study, you upload real discharge letters after deleting the patients' names.",
      answer: "avoid",
      why: "Health data is a special category under Article 9 of the GDPR. Removing names is not anonymisation: dates, rare diagnoses, places and free text can re-identify a patient. You also need the data controller's (hospital's) permission.",
      instead: [
        { type: "practice", text: "Use synthetic patients (for example generated with Synthea) or published teaching cases." },
        { type: "local", text: "If you must work with real clinical text under an approved protocol, only use a local model inside the hospital network." }
      ]
    },
    {
      id: "auto-grade-exam",
      topic: "Assessment · AI Act",
      text: "You let an AI system mark the final exam automatically and publish the grades without reviewing them.",
      answer: "avoid",
      why: "Under the EU AI Act, AI systems used to evaluate learning outcomes are classified as high-risk. Automatic grading without human oversight is also hard to explain or appeal, and models make systematic errors.",
      instead: [
        { type: "practice", text: "Use AI as a second reader or to check consistency; a teacher signs off every grade." },
        { type: "institutional", text: "If your institution adopts an AI grading tool, it must document risk management and human oversight." }
      ]
    },
    {
      id: "ai-detector",
      topic: "Academic integrity",
      text: "An AI-text detector says a student's report is \"87% AI-generated\", so you report the student for misconduct.",
      answer: "avoid",
      why: "AI detectors are unreliable, produce false positives and are biased against non-native English writers. A score is not evidence.",
      instead: [
        { type: "practice", text: "Talk to the student, ask about their process, and use drafts, version history or a short oral defence." },
        { type: "practice", text: "Design assessments that show the process (portfolios, in-class work, reflections)." }
      ]
    },
    {
      id: "mcq-fhir",
      topic: "Teaching materials",
      text: "You ask a chatbot to write 20 multiple-choice questions on HL7 FHIR resources and put them straight into the exam.",
      answer: "caution",
      why: "Generating draft questions is a good use of GenAI, but models invent facts, mix FHIR versions and write ambiguous distractors. Unchecked questions may be wrong.",
      instead: [
        { type: "practice", text: "Check every question against the official specification and pilot it before use." },
        { type: "european", text: "No personal data is involved, so any reputable model will do; a European one keeps your prompts under EU law." }
      ]
    },
    {
      id: "mandatory-account",
      topic: "Student rights",
      text: "Your assignment requires every student to create a personal account on a US consumer chatbot.",
      answer: "avoid",
      why: "Students would have to accept third-party terms and transfer personal data to get their grade. Consent is not free if the assignment is mandatory, and not all students can or want to use that service.",
      instead: [
        { type: "institutional", text: "Use the tool your institution provides under its licence." },
        { type: "local", text: "Or offer a local model in the computer lab, and always provide a non-AI route to complete the task." }
      ]
    },
    {
      id: "copyright-textbook",
      topic: "Copyright",
      text: "You upload full PDF chapters of a copyrighted textbook to a cloud chatbot to create summaries for your students.",
      answer: "avoid",
      why: "Uploading and redistributing copyrighted works to a third-party service usually goes beyond your licence, and some services keep uploaded files. Summaries closely derived from the text can also infringe.",
      instead: [
        { type: "practice", text: "Work from open educational resources (OER) or your own materials, and link to the original text." },
        { type: "local", text: "For your own study of a licensed text, a local model avoids uploading the file." }
      ]
    },
    {
      id: "own-notes",
      topic: "Course design",
      text: "You give a chatbot your own lecture notes (no personal data) and ask for a new structure and learning outcomes.",
      answer: "ok",
      why: "This is a low-risk, useful application. The content is yours and contains no personal data. Keep your professional judgement on the result and say that you used AI where your institution asks for it.",
      instead: [
        { type: "european", text: "A European provider keeps your unpublished teaching material under EU law." },
        { type: "practice", text: "Check the outcomes against the IMIA recommendations (see Guidelines)." }
      ]
    },
    {
      id: "fake-references",
      topic: "Reading lists",
      text: "You ask a chatbot for ten key references on clinical decision support and copy them into the syllabus.",
      answer: "avoid",
      why: "Language models often invent plausible references with wrong authors, years or DOIs. A reading list with fake papers damages your credibility and confuses students.",
      instead: [
        { type: "practice", text: "Search PubMed, Europe PMC or OpenAIRE Explore, and check that every DOI resolves." },
        { type: "practice", text: "Use AI only to suggest search terms, not sources." }
      ]
    },
    {
      id: "browser-extension",
      topic: "Tools · security",
      text: "You install a free \"AI assistant\" browser extension that can read every page you open, including the LMS gradebook.",
      answer: "avoid",
      why: "Such extensions can send whatever is on screen, including student records and grades, to unknown servers. This is a data breach risk your institution would have to report.",
      instead: [
        { type: "institutional", text: "Only use extensions approved by your IT department." },
        { type: "practice", text: "Use AI tools in a separate browser profile without access to institutional systems." }
      ]
    },
    {
      id: "no-policy",
      topic: "Course rules",
      text: "Students may use GenAI in an assignment, but the course guide doesn't say how or whether they must declare it.",
      answer: "caution",
      why: "Without a clear rule, students make different assumptions and integrity cases become hard to judge fairly.",
      instead: [
        { type: "practice", text: "State the allowed level of AI use for each task (for example using the AI Assessment Scale) and how to declare it." },
        { type: "practice", text: "Teach students to cite and critically check AI output." }
      ]
    },
    {
      id: "meeting-transcripts",
      topic: "Confidential meetings",
      text: "You record the exam board's deliberations and upload the audio to an online transcription and summary service.",
      answer: "avoid",
      why: "The recording contains confidential discussion of named students' results. It should not leave institutional control.",
      instead: [
        { type: "local", text: "Use a local speech-to-text model (for example Whisper running on your computer)." },
        { type: "institutional", text: "Or the transcription service included in your institution's contract." }
      ]
    },
    {
      id: "simulated-patient",
      topic: "Simulation",
      text: "You set up a chatbot to role-play a fictional patient so students can practise taking a history before meeting real patients.",
      answer: "caution",
      why: "A good, safe use of GenAI with fictional data. The model may still give medically wrong or stereotyped answers, and students may take them as fact.",
      instead: [
        { type: "practice", text: "Write a clear patient script, test it, and debrief students on what the model got wrong." },
        { type: "practice", text: "Tell students not to type their own personal or health information into the tool." }
      ]
    }
  ]
};
