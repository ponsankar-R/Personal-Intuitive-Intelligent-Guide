export interface Question {
  id: number;
  question: string;
  multiSelect: boolean;
  options: {
    id: string;
    text: string;
  }[];
}

export const ONBOARDING_QUESTIONS: Question[] = [
  {
    id: 1,
    question: "The Suitcase Test (Core Values): Your home is perfectly safe, but you are forced to pack your life into a single suitcase and move to the other side of the world tomorrow. Beyond basic clothing and essentials, what takes up the remaining space?",
    multiSelect: true,
    options: [
      { id: "A", text: "Photo albums, journals, and sentimental keepsakes from people you love." },
      { id: "B", text: "Your laptop, notebooks, blueprints, or tools of your trade/craft." },
      { id: "C", text: "Your passport, hiking boots, and items that remind you of freedom and open roads." },
      { id: "D", text: "Practical, high-quality gear and emergency savings that guarantee your security anywhere." }
    ]
  },
  {
    id: 2,
    question: "The Foggy City (Risk Tolerance): You are exploring an unfamiliar, beautiful foreign city at night. Your phone suddenly dies, you have no map, and you are completely lost. What is your immediate instinct?",
    multiSelect: true,
    options: [
      { id: "A", text: "This is where the adventure actually begins. I’ll keep walking and see where I end up." },
      { id: "B", text: "I feel a spike of anxiety. I need to find a recognizable landmark or a safe hotel immediately to regroup." },
      { id: "C", text: "I’ll stop at the nearest café, buy a drink, look around, and logically figure out a step-by-step way back." },
      { id: "D", text: "I'll instantly find a local, strike up a conversation, and ask them to guide or help me." }
    ]
  },
  {
    id: 3,
    question: "The Coffee Spill (Stress Response): You accidentally knock a full cup of coffee directly onto your laptop right before an incredibly important, high-stakes presentation. What happens inside your head?",
    multiSelect: false,
    options: [
      { id: "A", text: "Total paralysis. I freeze up, panic, and feel like the world is crashing down for a few minutes." },
      { id: "B", text: "Fixer mode. The adrenaline hits, my emotions switch off, and I immediately start drying it or looking for a backup device." },
      { id: "C", text: "Self-blame. I immediately start berating myself: \"How could you be so stupid? You always ruin things.\"" },
      { id: "D", text: "Deflection/Humor. I laugh bitterly, accept the chaos, and figure out how to wing the presentation without the slides." }
    ]
  },
  {
    id: 4,
    question: "The Menu Dilemma (Decision-Making): You are at a highly rated, completely new restaurant. How do you choose what to order?",
    multiSelect: false,
    options: [
      { id: "A", text: "I look up reviews and photos online beforehand to find the statistically most popular dish." },
      { id: "B", text: "I ask the server what they recommend and go with their vibe." },
      { id: "C", text: "I look for the most unusual, unique item on the menu that I’ve never tried before." },
      { id: "D", text: "I scan the menu for exactly 30 seconds and go entirely with whatever my gut instinct points to first." }
    ]
  },
  {
    id: 5,
    question: "The Superpower (Definition of Success): If a cosmic entity offered you one of these four passive superpowers for the rest of your life, which one would you choose?",
    multiSelect: false,
    options: [
      { id: "A", text: "The ability to immediately put anyone at ease and heal their emotional pain." },
      { id: "B", text: "Boundless, tireless focus and energy to master any skill or build any project perfectly." },
      { id: "C", text: "Complete immunity to fear, anxiety, and the opinions of other people." },
      { id: "D", text: "Absolute financial abundance that magically scales to cover whatever you or your family need." }
    ]
  },
  {
    id: 6,
    question: "The Movie Critic (Blind Spots): If your life was a movie and the audience was watching you handle a difficult situation, what would they be yelling at the screen for you to stop doing?",
    multiSelect: false,
    options: [
      { id: "A", text: "\"Stop overthinking every single detail and just make a move already!\"" },
      { id: "B", text: "\"Stop trying to make everyone else happy at the expense of your own sanity!\"" },
      { id: "C", text: "\"Stop pushing people away and trying to do literally everything by yourself!\"" },
      { id: "D", text: "\"Stop rushing into things without thinking about the consequences!\"" }
    ]
  },
  {
    id: 7,
    question: "The Plot Twist (Relationship to Change): Your life is suddenly disrupted by a massive, unpreventable change. What is your baseline state during the first week?",
    multiSelect: true,
    options: [
      { id: "A", text: "Shocked and mourning. I deeply miss the way things used to be and struggle to let go." },
      { id: "B", text: "Motivated. I see it as a clean slate and immediately start plotting how to maximize the new situation." },
      { id: "C", text: "Exhausted. The sheer amount of new data and lack of routine drains my battery completely." },
      { id: "D", text: "Adaptable. I don't love it, but I quietly bend with the wind and find my footing without making a scene." }
    ]
  },
  {
    id: 8,
    question: "The Unfamiliar Party (Energy Dynamics): You arrive at a party where you only know the host, and the host is incredibly busy running around. How do you spend your evening?",
    multiSelect: true,
    options: [
      { id: "A", text: "I find a quiet corner, pet the dog/cat, or look at the bookshelf until it’s socially acceptable to leave." },
      { id: "B", text: "I float around, introduce myself to random groups, and try to make new connections." },
      { id: "C", text: "I find one or two deep-looking people, sit down, and get into an intense, meaningful conversation." },
      { id: "D", text: "I offer to help the host in the kitchen or mix drinks so I have a functional task to keep me occupied." }
    ]
  },
  {
    id: 9,
    question: "The Quiet Slush (Conflict Style): A close friend or colleague does something small that genuinely hurts or irritates you. What happens next?",
    multiSelect: false,
    options: [
      { id: "A", text: "Nothing. I keep it to myself, convince myself it's not a big deal, and let it slowly simmer inside." },
      { id: "B", text: "I immediately and directly bring it up to them in a calm, matter-of-fact way to clear the air." },
      { id: "C", text: "I pull back significantly, becoming emotionally distant or passive-aggressive until they ask me what's wrong." },
      { id: "D", text: "I vent to a third party to process my feelings before deciding if it's even worth addressing." }
    ]
  },
  {
    id: 10,
    question: "The Broken Machine (Agency / Control): You spent weeks planning a flawless project, trip, or event, but due to bad weather and logistical failures, it completely falls apart. What is your immediate subconscious thought?",
    multiSelect: true,
    options: [
      { id: "A", text: "\"Of course this happened. The universe loves throwing a wrench in my plans.\"" },
      { id: "B", text: "\"I should have anticipated this and had a better backup plan. This is on me.\"" },
      { id: "C", text: "\"Everything happens for a reason. Let's see what alternative path this opens up.\"" },
      { id: "D", text: "\"Who is responsible for this mistake, and how do we hold them accountable/fix it right now?\"" }
    ]
  }
];
