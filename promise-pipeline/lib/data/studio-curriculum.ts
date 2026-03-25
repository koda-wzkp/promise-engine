export interface StudioModule {
  id: string;
  number: number;
  title: string;
  shortTitle: string;
  time: number; // minutes
  body: string;
  description: string;
  domain: string;
  verification: {
    method: "self-report" | "audit" | "sensor";
    source: string;
  };
  depends_on: string[];
  learnerDoes: string[];
  learnerLearns: string[];
  completionText: string;
  teachingContent?: string;
}

export const studioModules: StudioModule[] = [
  {
    id: "STUDIO-001",
    number: 1,
    title: "Your First Promise",
    shortTitle: "First Promise",
    time: 10,
    body: "Create one promise in Promise Pipeline with all fields populated",
    description:
      "Create a real promise — something you've actually committed to someone. Fill in every field: who, what, to whom, by when, verified how.",
    domain: "Learning",
    verification: { method: "self-report", source: "learner attestation" },
    depends_on: [],
    learnerDoes: [
      "Open Promise Pipeline personal tracker",
      "Create one promise about something real",
      "Fill in every field: promiser, promisee, body, domain, target date, verification method",
    ],
    learnerLearns: [
      "The promise schema: every commitment decomposes into the same fields",
      "The difference between an aspiration and a promise (specificity + verification)",
      "That verification method is a required field — someone has to decide HOW this gets checked",
    ],
    completionText:
      "You just created a promise. Every commitment tracked in Promise Pipeline — from Oregon climate legislation to the Iran nuclear deal to the International Space Station — uses the same fields you just filled in. The schema is universal.",
  },
  {
    id: "STUDIO-002",
    number: 2,
    title: "Your First Dependency",
    shortTitle: "First Dependency",
    time: 10,
    body: "Connect one dependency edge between two promises",
    description:
      "Your promise depends on something. Find it, create it, connect them. Now you have a network.",
    domain: "Learning",
    verification: { method: "self-report", source: "learner attestation" },
    depends_on: ["STUDIO-001"],
    learnerDoes: [
      "Look at the promise from Module 1",
      "Ask: what does this depend on?",
      "Create a second promise representing the upstream dependency",
      "Connect them with a depends_on edge",
    ],
    learnerLearns: [
      "Promises form networks — they don't exist in isolation",
      "The depends_on relationship is structural",
      "Upstream failures affect downstream promises",
    ],
    completionText:
      "You now have a network. Two promises, one edge. The simplest possible promise graph. Every network we analyze — from 20-promise climate bills to 27-promise space station operations — is built from exactly this: promises and dependency edges.",
  },
  {
    id: "STUDIO-003",
    number: 3,
    title: "Your First What If",
    shortTitle: "First What If",
    time: 10,
    body: "Run one cascade simulation on my network",
    description:
      "Click your upstream promise. Set it to violated. Click simulate. Watch what happens downstream.",
    domain: "Learning",
    verification: {
      method: "audit",
      source: "system log — simulation executed",
    },
    depends_on: ["STUDIO-002"],
    learnerDoes: [
      "Go to the Network tab",
      "Click the upstream promise from Module 2",
      "Set its status to violated",
      "Click Simulate",
      "Watch the cascade propagate",
      "Read the cascade result",
      "Click Reset",
    ],
    learnerLearns: [
      "The What If interaction — the core product mechanic",
      "Cascade propagation: failure travels through dependency edges",
      "Network health score: one number summarizing the network's state",
      "The difference between actual and simulated state",
    ],
    completionText:
      "You just ran a cascade simulation. The same engine powers every dashboard on Promise Pipeline — from modeling what happens when a utility's clean energy plan is rejected to what happens when a space station crew transport provider fails. You used it on your own commitments.",
  },
  {
    id: "STUDIO-004",
    number: 4,
    title: "The Verification Gap",
    shortTitle: "Verification Gap",
    time: 15,
    body: "Identify the verification gap in own network",
    description:
      "Which of your promises has the strongest verification? Which has the weakest? The gap between them is the central finding of Promise Pipeline.",
    domain: "Learning",
    verification: { method: "self-report", source: "learner attestation" },
    depends_on: ["STUDIO-003"],
    learnerDoes: [
      "Check the verification method on each promise",
      "Identify which has stronger and weaker verification",
      "Look at the curriculum graph — notice Modules 1-2 are self-report while Module 3 is audit",
      "Answer: which curriculum module has the weakest verification?",
    ],
    learnerLearns: [
      "The verification gap: the central structural finding",
      "Verification strength hierarchy: sensor > audit > filing > benchmark > self-report > none",
      "The curriculum itself has a verification gap — and you just found it",
      "The equity verification gap: the promises that matter most are verified least",
    ],
    completionText:
      "You just found a verification gap — in your own promises AND in this curriculum. The question isn't whether your promises are being kept. It's whether anyone can tell.",
    teachingContent:
      "This pattern appears in every network we've studied. In Oregon's climate law, emissions promises have DEQ audit verification while equity promises have no verification mechanism at all. In the JCPOA, nuclear enrichment limits had IAEA sensor verification while political commitments had none. The highest-stakes promises consistently have the weakest verification infrastructure.",
  },
  {
    id: "STUDIO-005",
    number: 5,
    title: "Map a Real Network",
    shortTitle: "Real Network",
    time: 30,
    body: "Create a promise network with 5+ promises, dependency edges, and verification methods",
    description:
      "Pick something real — your team's sprint, a contract, a project. Extract the promises. Connect the dependencies. This is the bottleneck module: everything after it builds on what you create here.",
    domain: "Learning",
    verification: {
      method: "audit",
      source: "system — 5+ promises with 3+ edges confirmed",
    },
    depends_on: ["STUDIO-004"],
    learnerDoes: [
      "Pick a real context",
      "Extract 5-10 promises",
      "Fill in all fields for each",
      "Connect dependency edges",
      "Run the health score",
      "View the network visualization",
    ],
    learnerLearns: [
      "Promise extraction: the core analytical skill",
      "Dependency inference: seeing structural relationships",
      "Every real context is a promise network",
      "The health score: one number, immediately meaningful",
    ],
    completionText:
      "You just built a promise graph. This is what Promise Pipeline produces for clients — and you did it yourself in 30 minutes. The network you built is real, it's yours, and everything that follows builds on it.",
  },
  {
    id: "STUDIO-006",
    number: 6,
    title: "Read the Dynamics",
    shortTitle: "Dynamics",
    time: 15,
    body: "Interpret the verification dynamics of my network",
    description:
      "Your network has a regime distribution. How many promises are computing? Composting? Where's the Zeno risk? The dynamics tell you what's going to happen.",
    domain: "Learning",
    verification: {
      method: "self-report",
      source: "learner identifies regime of riskiest promise",
    },
    depends_on: ["STUDIO-005"],
    learnerDoes: [
      "Open the Summary tab",
      "Read the Verification Dynamics section",
      "Count computing vs composting vs transitional promises",
      "Find the highest composting risk promise",
      "Check for Zeno freeze warnings",
    ],
    learnerLearns: [
      "k regimes: computing, composting, transitional, pressure",
      "The Zeno effect: too-frequent observation freezes state",
      "How to read Verification Dynamics",
      "Verification structure determines dynamics, not domain or content",
    ],
    completionText:
      "You can now read the dynamics of any promise network. The regime distribution tells you which promises are self-correcting and which are stagnating — and why.",
    teachingContent:
      'Computing regime (k ≈ 1): Promises with numeric, periodic verification. They self-correct under observation.\n\nComposting regime (k < 0.5): Promises with weak or absent verification. They stagnate.\n\nZeno effect: Across 69,847 institutional commitments, promises reviewed too frequently transition SLOWER (ρ = −0.191). Watching the pot prevents it from boiling.\n\nThe insight: Computing-regime promises benefit from frequent review. Composting-regime promises need less frequent but more decisive intervention.',
  },
  {
    id: "STUDIO-007",
    number: 7,
    title: "Understand the Projection",
    shortTitle: "Projection",
    time: 15,
    body: "Explain the Lindblad crossover direction for one promise",
    description:
      "The Lindblad sparkline shows three futures at once: still declared, met, or not met. The crossover point is where fate tips. Which direction is your riskiest promise heading?",
    domain: "Learning",
    verification: {
      method: "self-report",
      source: "learner states crossover direction",
    },
    depends_on: ["STUDIO-006"],
    learnerDoes: [
      "Find the Lindblad sparkline on the highest-priority promise",
      "Read the three lines: blue (declared), green (met), red (not met)",
      "Identify the crossover point",
      "Determine: met-rising or not-met-rising?",
      "Read the recommended review interval",
    ],
    learnerLearns: [
      "The Lindblad projection and crossover concept",
      "Met-rising = resolution trending (monitor) vs not-met-rising = failure trending (intervene)",
      "The 5:1 ratio: legibility resolves commitments 5× more often than it surfaces failures",
      "How to read the sparkline",
    ],
    completionText:
      "Weibull tells you when. Lindblad tells you what. You can now read the full projection for any promise in any network.",
    teachingContent:
      "The Lindblad master equation — the same equation used to model quantum systems interacting with their environment — tells you what a promise BECOMES: the probability of being met, not met, or still declared at every point in time.\n\nThe crossover point is the decision boundary. Met-rising: the system is working, just slowly. Not-met-rising: intervene before the crossover.\n\nThe 5:1 ratio: Across 67,000 institutional commitments, making promises trackable resolves them 5× more often than it surfaces failures.",
  },
  {
    id: "STUDIO-008",
    number: 8,
    title: "Share It",
    shortTitle: "Share",
    time: 10,
    body: "Share promise graph with at least one other person",
    description:
      "Generate a link. Send it to someone. The moment your commitments are visible to another person, the verification dynamics change.",
    domain: "Learning",
    verification: {
      method: "sensor",
      source: "system — share link generated and accessed",
    },
    depends_on: ["STUDIO-005"],
    learnerDoes: [
      "Generate a share link for the promise graph",
      "Send it to one person",
    ],
    learnerLearns: [
      "Sharing is what turns a personal tool into an accountability structure",
      "The act of making commitments legible changes their dynamics",
      "This is what Promise Pipeline does at every scale",
    ],
    completionText:
      "You mapped 8 promises. Connected 7 dependencies. Ran a cascade simulation. Found a verification gap. Built a real network. Read the dynamics. Understood the projection. Shared it.\n\nYour curriculum graph is a verified promise network with a health score of 100. Every module kept. Every dependency satisfied.\n\nThe same schema. The same engine. The same interaction pattern — from your personal commitments to state climate legislation to international arms control. One trust primitive at every scale.\n\nWelcome to Promise Pipeline.",
  },
];
