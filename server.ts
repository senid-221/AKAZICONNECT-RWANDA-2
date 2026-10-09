import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import OpenAI from 'openai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());
  app.use(express.static(path.resolve(__dirname, 'public')));

  // Initialize OpenAI client if key is available
  const openAiApiKey = process.env.OPENAI_API_KEY;
  let openaiClient: OpenAI | null = null;
  if (openAiApiKey && openAiApiKey !== 'MY_OPENAI_API_KEY' && !openAiApiKey.includes('placeholder')) {
    openaiClient = new OpenAI({ apiKey: openAiApiKey });
  }

  // Initialize Gemini client if key is available
  const geminiApiKey = process.env.GEMINI_API_KEY;
  let geminiClient: GoogleGenAI | null = null;
  if (geminiApiKey && geminiApiKey !== 'MY_GEMINI_API_KEY' && !geminiApiKey.includes('placeholder')) {
    geminiClient = new GoogleGenAI({ apiKey: geminiApiKey });
  }

  // API Route: AI Chat & Live Interactive Interview for Tailoring Cover Letters
  app.post('/api/ai/cover-letter-chat', async (req, res) => {
    try {
      const {
        job,
        messages,
        candidateProfile,
        requestingDraft,
      } = req.body;

      if (!job) {
        return res.status(400).json({ error: 'Job information is required.' });
      }

      // Check for OpenAI API key from environment or request headers
      const activeOpenAiKey =
        (req.headers['x-openai-key'] as string) ||
        (req.headers['authorization']?.startsWith('Bearer ') ? req.headers['authorization'].slice(7) : undefined) ||
        process.env.OPENAI_API_KEY;

      const hasValidOpenAiKey =
        activeOpenAiKey &&
        activeOpenAiKey !== 'MY_OPENAI_API_KEY' &&
        !activeOpenAiKey.includes('placeholder') &&
        activeOpenAiKey.trim().length > 10;

      // Check for Gemini API key from environment or request headers
      const activeGeminiKey =
        (req.headers['x-gemini-key'] as string) ||
        process.env.GEMINI_API_KEY;

      const hasValidGeminiKey =
        activeGeminiKey &&
        activeGeminiKey !== 'MY_GEMINI_API_KEY' &&
        !activeGeminiKey.includes('placeholder') &&
        activeGeminiKey.trim().length > 10;

      const systemPrompt = `You are "Akazi Career Assistant", an expert career advisor and recruitment specialist in Rwanda.
Your mission is to help Rwandan job seekers create a tailored, high-impact, professional cover letter for the vacancy:
- Position: ${job.title}
- Company/Employer: ${job.company}
- Location: ${job.location || 'Rwanda'} (${job.district || ''})
- Sector: ${job.sector || 'General'}
- Experience required: ${job.experience || 'Not specified'}
- Requirements: ${job.requirements?.join('; ') || job.requirementsNote || 'Review official vacancy'}
- Key competencies: ${job.keySkills?.join(', ') || 'Professional execution'}
- Application instructions: ${job.applyInstructions}
- Deadline: ${job.deadline}

YOUR INTERACTION STYLE:
1. When starting or continuing a conversation without a finished letter, act as an encouraging, rigorous interviewer. Ask 1-2 focused, necessary questions at a time based specifically on this job's requirements, work mode, and employer values in Rwanda.
2. Inquire about:
   - Their concrete achievements or specific tools/technologies matching ${job.title} at ${job.company}.
   - Their academic background or certifications (e.g., University of Rwanda, AUCA, ALU, TVET, or international degree).
   - Why they want to work specifically for ${job.company} in Rwanda.
3. Keep conversational responses concise, conversational, and direct (2-4 paragraphs or a short bulleted question list).
4. When the user asks for the letter, or when ${requestingDraft ? 'true' : 'they say "generate letter", "write my letter", or "draft it"'}, generate a complete, formal Rwandan standard cover letter formatted as follows:
   - Applicant header (Full Name, Kigali - Rwanda, Phone, Email)
   - Today's date
   - To: The Head of Human Resources / Recruitment Committee, ${job.company}, ${job.district || job.location || 'Kigali, Rwanda'}
   - Subject: APPLICATION FOR THE POSITION OF ${job.title.toUpperCase()}
   - Salutation: Dear Hiring Committee,
   - Strong customized opening referencing ${job.company}
   - Two compelling body paragraphs aligning their specific experience with the requirements
   - Formal respectful Rwandan closing and sign-off
5. If the user provides feedback ("make it shorter", "highlight leadership", "translate to Kinyarwanda"), adapt the letter immediately while keeping the professional Rwandan standard format.`;

      // 1. Route to OpenAI if API key is provided
      if (hasValidOpenAiKey) {
        try {
          const client = new OpenAI({ apiKey: activeOpenAiKey });
          const apiMessages = [
            { role: 'system' as const, content: systemPrompt },
            ...messages.map((m: any) => ({
              role: m.role === 'assistant' ? ('assistant' as const) : ('user' as const),
              content: m.content,
            })),
          ];

          const completion = await client.chat.completions.create({
            model: 'gpt-4o',
            messages: apiMessages,
            temperature: 0.7,
            max_tokens: 1500,
          });

          const reply = completion.choices[0]?.message?.content;
          if (reply) {
            return res.json({ reply });
          }
        } catch (err: any) {
          console.warn('OpenAI API call failed, falling back to alternative key:', err.message);
        }
      }

      // 2. Route to Gemini if API key is provided
      if (hasValidGeminiKey) {
        try {
          const client = new GoogleGenAI({ apiKey: activeGeminiKey });
          const contents = messages.map((m: any) => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }],
          }));

          const response = await client.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: contents,
            config: {
              systemInstruction: systemPrompt,
              temperature: 0.7,
            },
          });

          const reply = response.text;
          if (reply) {
            return res.json({ reply });
          }
        } catch (err: any) {
          console.warn('Gemini API call failed, falling back to smart interview engine:', err.message);
        }
      }

      // 3. Smart Contextual Interview Engine (Dynamic fallback)
      const reply = generateSmartEngineResponse(job, messages, candidateProfile, requestingDraft);
      return res.json({ reply });
    } catch (error: any) {
      console.error('Error in cover-letter-chat:', error);
      res.status(500).json({ error: 'Failed to process request.' });
    }
  });

  // Serve static files in production or vite middlewares in dev
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AkaziConnect server running on http://0.0.0.0:${PORT}`);
  });
}

// Fallback smart interview engine that dynamically interrogates candidate based on job requirements
function generateSmartEngineResponse(
  job: any,
  messages: Array<{ role: string; content: string }>,
  candidateProfile: any,
  requestingDraft?: boolean
): string {
  const userMessages = messages.filter((m) => m.role === 'user');
  const lastUserText = userMessages[userMessages.length - 1]?.content.toLowerCase() || '';

  const wantsLetter =
    requestingDraft ||
    lastUserText.includes('generate') ||
    lastUserText.includes('draft') ||
    lastUserText.includes('write the letter') ||
    lastUserText.includes('ready') ||
    userMessages.length >= 3;

  if (wantsLetter) {
    const candidateName = candidateProfile?.name || 'Amara Mukamana';
    const candidatePhone = candidateProfile?.phone || '+250 788 123 456';
    const candidateEmail = candidateProfile?.email || 'amara.mukamana@gmail.com';
    const location = candidateProfile?.location || 'Kigali, Rwanda';

    // Extract gathered user answers
    const combinedAnswers = userMessages.map((m) => m.content).join(' ');

    return `Here is your customized, official Rwandan standard cover letter tailored for **${job.company}**:

---

${candidateName}
${location}
Tel: ${candidatePhone}
Email: ${candidateEmail}

${new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())}

To:
The Head of Human Resources / Recruitment Committee
${job.company}
${job.district || job.location || 'Kigali, Rwanda'}

**SUBJECT: APPLICATION FOR THE POSITION OF ${job.title.toUpperCase()}**

Dear Hiring Committee,

I am writing to formally submit my application for the position of **${job.title}** at **${job.company}**, as officially announced for ${job.location || 'Rwanda'}. Having closely followed ${job.company}’s distinguished contribution to ${job.sector || 'the Rwandan economy'}, I am enthusiastic about the opportunity to bring my execution capability and dedication to your team.

${job.experience ? `Regarding your requirement for ${job.experience}: ` : ''}Throughout my career, I have developed proven expertise directly aligned with your vacancy. Specifically:
- **Technical & Operational Execution**: ${combinedAnswers.length > 30 ? `I bring demonstrated experience in ${combinedAnswers.slice(0, 160)}...` : `I have successfully delivered measurable results in ${job.keySkills?.slice(0, 3).join(', ') || 'high-priority institutional initiatives'}.`}
- **Institutional Alignment**: I am committed to the high standards of compliance, integrity, and efficiency that define ${job.company}'s mission.
- **Language & Communication**: I communicate fluently in English and Kinyarwanda, enabling seamless collaboration with both internal teams and external stakeholders in Rwanda.

${job.summary}

Enclosed with this letter, please find my updated Curriculum Vitae, copies of certified academic credentials, and professional references as specified in your application guidelines. I would welcome the privilege of an interview to discuss how my competencies will contribute to ${job.company}’s strategic objectives.

Thank you very much for your time, consideration, and service to Rwanda.

Yours faithfully,

**${candidateName}**
Applicant for ${job.title}

---

💡 **Next Steps:**
- Would you like me to make this more concise, highlight a specific degree/achievement, or adapt it further?
- You can copy this directly or continue asking me revisions!`;
  }

  // Interview Question Turn 1
  if (userMessages.length <= 1) {
    return `Hello! I am your **Akazi AI Career Specialist**. I'll tailor a standout Rwandan cover letter for **${job.title}** at **${job.company}**.

To make your application truly competitive against other candidates in Rwanda, I have 2 quick questions:

1. **Relevant Experience & Projects:**
   ${job.company} is specifically looking for ${job.experience || 'strong qualifications'} ${job.keySkills ? `with knowledge in ${job.keySkills.slice(0, 3).join(', ')}` : ''}. What is your most relevant achievement or project in this area?

2. **Motivation & Location:**
   Are you currently based in ${job.location || 'Kigali'}, and what motivates you to join **${job.company}** at this stage of your career?

*(You can answer briefly, or if you prefer me to draft the letter right now with your profile information, just let me know!)*`;
  }

  // Interview Question Turn 2
  return `Thank you for sharing those insights! That provides great context on your background.

One final question before I craft your complete letter:
- What is your highest qualification (e.g. Bachelor's/Master's degree from University of Rwanda or another institution), and do you have any specific certifications or metrics you'd like highlighted?

Whenever you're ready, reply to this or simply say **"Draft my letter"** and I will generate the complete official document!`;
}

startServer();
