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

  const prompt = `You are an expert meeting secretary. Analyze the following meeting transcript and generate a structured Minutes of Meeting (MOM) in JSON format.

TRANSCRIPT:
${transcript}

Return ONLY a valid JSON object with this exact structure (no markdown, no explanation):
{
  "summary": "A concise 2-3 sentence summary of the entire meeting",
  "keyDiscussionPoints": ["Point 1", "Point 2", "..."],
  "decisionsTaken": ["Decision 1", "Decision 2", "..."],
  "actionItems": [
    {
      "task": "Description of the task",
      "responsible": "Name or role of person responsible",
      "deadline": "Deadline if mentioned, or 'Not specified'"
    }
  ],
  "risks": ["Risk or concern 1", "Risk or concern 2"],
  "nextMeetingAgenda": ["Agenda item 1", "Agenda item 2"]
}

Be thorough and extract all information from the transcript. If a section has no items, use an empty array.`;

  const response = await createChatCompletion({
    model: MODEL,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3,
    max_tokens: 2048,
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
