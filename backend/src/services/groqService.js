const Groq = require('groq-sdk');

const MODEL = process.env.GROQ_CHAT_MODEL || 'llama-3.3-70b-versatile';
const REQUIRED_MOM_ARRAYS = [
  'keyDiscussionPoints',
  'decisionsTaken',
  'actionItems',
  'risks',
  'nextMeetingAgenda',
];

let groq = null;

function getGroqClient() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey === 'your_groq_api_key_here') {
    const err = new Error('GROQ_API_KEY is not configured. Add a valid key in backend/.env.');
    err.statusCode = 503;
    throw err;
  }

  if (!groq) {
    groq = new Groq({ apiKey });
  }
  return groq;
}

function extractJsonObject(content) {
  const cleaned = String(content || '')
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start === -1 || end === -1 || end <= start) {
      throw new Error('AI response did not contain a JSON object.');
    }
    return JSON.parse(cleaned.slice(start, end + 1));
  }
}

function normalizeMOM(raw) {
  const mom = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};

  const normalized = {
    summary: typeof mom.summary === 'string' && mom.summary.trim()
      ? mom.summary.trim()
      : 'No summary was generated.',
    keyDiscussionPoints: [],
    decisionsTaken: [],
    actionItems: [],
    risks: [],
    nextMeetingAgenda: [],
  };

  for (const key of REQUIRED_MOM_ARRAYS) {
    normalized[key] = Array.isArray(mom[key]) ? mom[key] : [];
  }

  normalized.actionItems = normalized.actionItems
    .filter(item => item && typeof item === 'object')
    .map(item => ({
      task: typeof item.task === 'string' && item.task.trim() ? item.task.trim() : 'Untitled task',
      responsible: typeof item.responsible === 'string' && item.responsible.trim()
        ? item.responsible.trim()
        : 'Not specified',
      deadline: typeof item.deadline === 'string' && item.deadline.trim()
        ? item.deadline.trim()
        : 'Not specified',
    }));

  return normalized;
}

async function createChatCompletion(options) {
  const client = getGroqClient();
  return client.chat.completions.create(options);
}

// ── MOM Generation ────────────────────────────────────────

async function generateMOM(transcript) {
  if (!transcript || !transcript.trim()) {
    const err = new Error('Transcript is required for MOM generation.');
    err.statusCode = 400;
    throw err;
  }

  const prompt = `You are an expert meeting secretary with exceptional attention to detail. Analyze the following meeting transcript and generate a comprehensive, detailed Minutes of Meeting (MOM) in JSON format.

TRANSCRIPT:
${transcript}

INSTRUCTIONS:
1. Be VERY DETAILED and DESCRIPTIVE in every section
2. Extract ALL important points - don't summarize too much
3. Include context, reasoning, and background for decisions
4. Capture who said what when relevant
5. Include specific numbers, dates, and technical details mentioned
6. Write in complete, clear sentences
7. Each discussion point should be at least 1-2 sentences explaining the topic thoroughly
8. Each decision should include WHY it was made and WHAT impact it will have
9. Action items should be specific and actionable with full context

Return ONLY a valid JSON object with this exact structure (no markdown, no explanation):
{
  "summary": "A comprehensive 4-6 sentence summary covering: main purpose of meeting, key topics discussed, major outcomes, important decisions made, and next steps. Be specific and detailed.",
  "keyDiscussionPoints": [
    "Detailed discussion point 1 with context and background (2-3 sentences minimum)",
    "Detailed discussion point 2 explaining what was discussed, why it matters, and what perspectives were shared",
    "Continue with all major discussion topics, including technical details, concerns raised, and solutions proposed"
  ],
  "decisionsTaken": [
    "Decision 1: Explain what was decided, WHY this decision was made, WHO will be affected, and WHAT the expected outcome/impact is",
    "Decision 2: Include the full context - what problem this solves, alternatives considered, and implementation approach",
    "Continue with all decisions made, ensuring each includes rationale and implications"
  ],
  "actionItems": [
    {
      "task": "Very specific, detailed description of the task including what needs to be done, how it should be done, expected deliverables, and any dependencies or prerequisites",
      "responsible": "Full name or role of person responsible (extract from transcript)",
      "deadline": "Specific date/time if mentioned, or 'Not specified'"
    }
  ],
  "risks": [
    "Risk/Concern 1: Explain the risk in detail, why it's a concern, potential impact, and any mitigation strategies discussed",
    "Risk/Concern 2: Include severity, likelihood, affected areas, and proposed solutions or monitoring approach",
    "Continue with all risks, blockers, challenges, or concerns mentioned"
  ],
  "nextMeetingAgenda": [
    "Detailed agenda item 1 - explain what will be discussed and why it's important",
    "Detailed agenda item 2 - include specific topics, questions to address, and expected outcomes",
    "Continue with all topics to be covered in next meeting"
  ]
}

REMEMBER: BE DETAILED, DESCRIPTIVE, AND COMPREHENSIVE. Extract MAXIMUM information from the transcript. Each section should provide complete context and understanding. If a section has no items, use an empty array.`;

  const response = await createChatCompletion({
    model: MODEL,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.4,
    max_tokens: 4096,
  });

  const content = response.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('AI service returned an empty MOM response.');
  }

  try {
    return normalizeMOM(extractJsonObject(content));
  } catch (err) {
    err.message = `Could not parse MOM JSON from AI response: ${err.message}`;
    err.statusCode = 502;
    throw err;
  }
}

// ── Meeting-Level Chat ────────────────────────────────────

async function chatWithMeeting(transcript, mom, history, question) {
  const momText = mom ? JSON.stringify(mom, null, 2) : 'MOM not yet generated.';

  const systemPrompt = `You are an intelligent meeting assistant. You have access to a meeting transcript and its Minutes of Meeting (MOM). Answer questions accurately based on this context.

MEETING TRANSCRIPT:
${transcript}

MINUTES OF MEETING (MOM):
${momText}

Instructions:
- Answer based only on the meeting content above
- Be concise and specific
- If information is not in the transcript, say so
- Format lists with bullet points when appropriate`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...history.map(h => ({ role: h.role, content: h.content })),
    { role: 'user', content: question },
  ];

  const response = await createChatCompletion({
    model: MODEL,
    messages,
    temperature: 0.5,
    max_tokens: 1024,
  });

  return response.choices[0].message.content;
}

// ── Event-Level Chat ──────────────────────────────────────

async function chatWithEvent(meetings, history, question) {
  const meetingsContext = meetings
    .map((m, i) => `--- MEETING ${i + 1}: ${m.title} (${new Date(m.date).toLocaleDateString()}) ---\n${m.transcript}\n\nMOM Summary: ${m.mom?.summary || 'Not generated'}`)
    .join('\n\n');

  const systemPrompt = `You are an intelligent event-level meeting assistant. You have access to ALL meetings under this event. Answer questions by searching across all meetings.

${meetingsContext}

Instructions:
- Search across all meetings to find relevant information
- When referencing a meeting, mention its title
- Identify patterns and connections across meetings
- Be comprehensive but concise
- Format lists with bullet points when appropriate`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...history.map(h => ({ role: h.role, content: h.content })),
    { role: 'user', content: question },
  ];

  const response = await createChatCompletion({
    model: MODEL,
    messages,
    temperature: 0.5,
    max_tokens: 1500,
  });

  return response.choices[0].message.content;
}

// ── Event Final Summary ───────────────────────────────────

async function generateEventSummary(eventName, meetings) {
  const meetingsContext = meetings
    .map((m, i) => `Meeting ${i + 1}: ${m.title}\nDate: ${new Date(m.date).toLocaleDateString()}\nSummary: ${m.mom?.summary || 'No MOM'}\nDecisions: ${(m.mom?.decisionsTaken || []).join('; ')}\nAction Items: ${(m.mom?.actionItems || []).map(a => a.task).join('; ')}`)
    .join('\n\n');

  const prompt = `You are an expert meeting analyst. Generate a comprehensive final summary report for the event "${eventName}" based on all its meetings.

MEETINGS DATA:
${meetingsContext}

Write a detailed, well-structured report covering:
1. **Event Overview** - What this event was about
2. **Journey & Progress** - How the planning evolved across meetings
3. **Key Decisions Made** - Major decisions taken throughout
4. **Completed Action Items** - Tasks that were assigned
5. **Recurring Themes** - Topics that came up multiple times
6. **Overall Status Assessment** - Current state of the event
7. **Recommendations** - What still needs attention

Use markdown formatting with headers and bullet points.`;

  const response = await createChatCompletion({
    model: MODEL,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.6,
    max_tokens: 2000,
  });

  return response.choices[0].message.content;
}

module.exports = {
  generateMOM,
  chatWithMeeting,
  chatWithEvent,
  generateEventSummary,
  getGroqClient,
};
