const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, getDocs } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

const kbData = [
  {
    question: "What is Wasilah?",
    answer: "Wasilah is a community service organization dedicated to creating positive change through education, healthcare, environmental initiatives, and community development projects.",
    keywords: ["wasilah", "organization", "about", "who", "what"],
    tags: ["general", "about"]
  },
  {
    question: "How can I volunteer?",
    answer: "You can volunteer by visiting our 'Join Us' page and filling out the volunteer application form. Our team will review your application and contact you within 3-5 business days with available opportunities.",
    keywords: ["volunteer", "join", "help", "participate", "contribute"],
    tags: ["volunteer", "join"]
  },
  {
    question: "What types of projects do you run?",
    answer: "We run various projects including education programs, healthcare initiatives, environmental conservation efforts, and community development projects. Each project is designed to create lasting positive impact in communities.",
    keywords: ["projects", "programs", "initiatives", "types", "work"],
    tags: ["projects", "general"]
  },
  {
    question: "How can I donate or support?",
    answer: "You can support Wasilah through volunteering, spreading awareness, or contributing resources. Please visit our Contact page to discuss specific ways you can help make a difference.",
    keywords: ["donate", "support", "help", "contribute", "give"],
    tags: ["support", "donate"]
  },
  {
    question: "Where are you located?",
    answer: "We have offices in Karachi, Lahore, and Islamabad. Our projects span across multiple cities in Pakistan. Visit our Contact page for detailed addresses and contact information.",
    keywords: ["location", "office", "address", "where", "city"],
    tags: ["contact", "location"]
  },
  {
    question: "What events do you organize?",
    answer: "We organize various community events including health fairs, educational workshops, environmental initiatives, and community gatherings. Check our Events page for upcoming activities and registration details.",
    keywords: ["events", "activities", "workshops", "programs", "calendar"],
    tags: ["events", "programs"]
  },
  {
    question: "How do I contact you?",
    answer: "You can reach us through our Contact page where you'll find our email, phone numbers, and office locations. Our team typically responds within 24 hours.",
    keywords: ["contact", "email", "phone", "reach", "communicate"],
    tags: ["contact", "support"]
  },
  {
    question: "Can I submit a project idea?",
    answer: "Yes! We welcome community-driven project ideas. You can submit your proposal through our chat widget on the Events or Projects page, or contact us directly through our Contact page.",
    keywords: ["submit", "idea", "proposal", "suggest", "pitch"],
    tags: ["projects", "submit"]
  }
];

async function seedKnowledgeBase() {
  try {
    console.log('Initializing Firebase...');
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    console.log('Checking existing FAQs...');
    const kbRef = collection(db, 'kb/faqs');
    const existingDocs = await getDocs(kbRef);

    if (existingDocs.size > 0) {
      console.log(`Found ${existingDocs.size} existing FAQs. Skipping seed.`);
      console.log('To re-seed, delete existing FAQs first.');
      return;
    }

    console.log('Seeding knowledge base...');
    let count = 0;

    for (const faq of kbData) {
      await addDoc(collection(db, 'kb/faqs'), {
        question: faq.question,
        answer: faq.answer,
        keywords: faq.keywords,
        tags: faq.tags,
        createdAt: new Date()
      });
      count++;
      console.log(`Added FAQ ${count}/${kbData.length}: ${faq.question}`);
    }

    console.log(`\nSuccessfully seeded ${count} FAQs!`);
  } catch (error) {
    console.error('Error seeding knowledge base:', error);
    process.exit(1);
  }
}

seedKnowledgeBase();
