import React, { useState, useEffect, useRef } from 'react';
import { Job } from '../types';
import { Language } from '../utils/translations';
import { formatDateLabel } from '../utils/dateUtils';
import { CompanyLogo } from './CompanyLogo';
import {
  X,
  Send,
  Sparkles,
  Copy,
  Check,
  Download,
  RotateCcw,
  FileText,
  MessageSquare,
  Zap,
  Key,
} from 'lucide-react';

interface CoverLetterModalProps {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

interface ChatMessage {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  timestamp: string;
}

export const CoverLetterModal: React.FC<CoverLetterModalProps> = ({
  job,
  isOpen,
  onClose,
  lang,
}) => {
  if (!isOpen || !job) return null;

  const [activeView, setActiveView] = useState<'interview' | 'document'>('interview');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [extractedLetter, setExtractedLetter] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [showKeyPrompt, setShowKeyPrompt] = useState(false);
  const [customKey, setCustomKey] = useState<string>(() => {
    try {
      return localStorage.getItem('akazi_openai_key') || '';
    } catch {
      return '';
    }
  });
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Helper to get active stored API key
  const getStoredApiKey = () => {
    try {
      return localStorage.getItem('akazi_openai_key') || '';
    } catch {
      return '';
    }
  };

  // Live Initiation: Fetch genuine live interview questions tailored specifically to this vacancy
  useEffect(() => {
    if (!job) return;

    let isMounted = true;
    setIsLoading(true);
    setMessages([]);
    setExtractedLetter('');
    setActiveView('interview');

    const initiateInterview = async () => {
      const apiKey = getStoredApiKey();
      const initialPrompt = `Hello, I want to apply for the position of "${job.title}" at "${job.company}". Please analyze this role, its requirements (${job.experience || 'qualifications'}, ${job.requirements?.join(', ') || 'as listed'}), its location in ${job.district || job.location || 'Rwanda'}, and deadline (${formatDateLabel(job.deadline)}). Start our interview by introducing yourself as the Akazi Career Specialist and ask me 2 necessary, focused questions to tailor my cover letter according to this specific job.`;

      try {
        const response = await fetch('/api/ai/cover-letter-chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(apiKey ? { 'x-openai-key': apiKey } : {}),
          },
          body: JSON.stringify({
            job,
            messages: [{ role: 'user', content: initialPrompt }],
            candidateProfile: {
              name: 'Amara Mukamana',
              email: 'amara.mukamana@gmail.com',
              phone: '+250 788 123 456',
              location: 'Kigali, Rwanda',
            },
            requestingDraft: false,
          }),
        });

        const data = await response.json();
        if (isMounted) {
          const aiReply = data.reply || `Hello! I am your Akazi Career Specialist. I will help you craft a tailored Rwandan cover letter for ${job.title} at ${job.company}. What relevant experience or achievements matching this vacancy should we highlight?`;
          setMessages([
            {
              id: 'init-msg',
              role: 'assistant',
              content: aiReply,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
          ]);
        }
      } catch (err) {
        if (isMounted) {
          setMessages([
            {
              id: 'init-msg',
              role: 'assistant',
              content: `Hello! I am your Akazi Career Specialist. Let's tailor your Rwandan cover letter for **${job.title}** at **${job.company}**.\n\n1. What is your most relevant experience matching ${job.company}'s requirements (${job.experience || 'qualifications'})?\n2. What is your highest degree or certification, and why do you want to join ${job.company} in Rwanda?`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
          ]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initiateInterview();

    return () => {
      isMounted = false;
    };
  }, [job]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Send message to server AI endpoint
  const sendMessage = async (userText: string, forceDraft = false) => {
    if (!userText.trim() && !forceDraft) return;

    const textToSend = userText.trim() || 'Please draft my complete tailored cover letter now based on my details.';

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInputText('');
    setIsLoading(true);

    try {
      const apiKey = getStoredApiKey();
      const response = await fetch('/api/ai/cover-letter-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(apiKey ? { 'x-openai-key': apiKey } : {}),
        },
        body: JSON.stringify({
          job,
          messages: newHistory.map((m) => ({ role: m.role, content: m.content })),
          candidateProfile: {
            name: 'Amara Mukamana',
            email: 'amara.mukamana@gmail.com',
            phone: '+250 788 123 456',
            location: 'Kigali, Rwanda',
          },
          requestingDraft: forceDraft,
        }),
      });

      const data = await response.json();
      const replyContent = data.reply || 'I have processed your response. Let me know if you would like me to draft your official cover letter now.';

      // If reply contains cover letter structure, extract it for document preview
      if (
        replyContent.includes('SUBJECT: APPLICATION') ||
        replyContent.includes('Dear Hiring') ||
        replyContent.includes('Yours faithfully') ||
        replyContent.includes('To:\n')
      ) {
        setExtractedLetter(replyContent);
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: replyContent,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err) {
      console.error('Failed to communicate with AI endpoint:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: 'I encountered a brief connection issue. Please try submitting again.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveKey = () => {
    try {
      if (customKey.trim()) {
        localStorage.setItem('akazi_openai_key', customKey.trim());
      } else {
        localStorage.removeItem('akazi_openai_key');
      }
      setShowKeyPrompt(false);
    } catch {}
  };

  const handleCopy = () => {
    const textToCopy = extractedLetter || messages[messages.length - 1]?.content || '';
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const handleDownload = () => {
    const textToDownload = extractedLetter || messages[messages.length - 1]?.content || '';
    const blob = new Blob([textToDownload], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Cover_Letter_${job.company.replace(/\s+/g, '_')}_${job.title.replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const quickPrompts = [
    `I have 3+ years experience in this domain and live in Kigali. Draft my letter!`,
    `Focus on my bachelor's degree & key technical skills in ${job.keySkills ? job.keySkills[0] : 'this field'}.`,
    `Highlight my bilingual fluency in English & Kinyarwanda and strong work ethic.`,
    `Draft my official Rwandan cover letter now!`,
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div
        className="relative w-full max-w-4xl bg-[#fffdf7] border border-[#d9ded4] rounded-3xl shadow-2xl overflow-hidden my-auto h-[95vh] sm:h-[90vh] max-h-[840px] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 bg-[#174332] text-white shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <CompanyLogo company={job.company} size="sm" />
            <div className="min-w-0">
              <h2 className="font-display text-sm sm:text-base font-bold leading-tight truncate">
                Tailor Cover Letter
              </h2>
              <p className="text-[11px] sm:text-xs text-[#fae09b]/90 truncate max-w-xs sm:max-w-md">
                {job.title} · <span className="text-white font-medium">{job.company}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* View Switcher Desktop */}
            <div className="hidden sm:flex items-center bg-white/10 p-0.5 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveView('interview')}
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                  activeView === 'interview' ? 'bg-[#efbd43] text-[#173b2d]' : 'text-white/80 hover:text-white'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Interview</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveView('document')}
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                  activeView === 'document' ? 'bg-[#efbd43] text-[#173b2d]' : 'text-white/80 hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Letter Document</span>
              </button>
            </div>

            {/* Optional API Key Button */}
            <button
              type="button"
              onClick={() => setShowKeyPrompt(!showKeyPrompt)}
              title="Connect custom API Key"
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-white"
            >
              <Key className="w-4 h-4 text-[#efbd43]" />
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close modal"
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Optional Custom API Key Drawer */}
        {showKeyPrompt && (
          <div className="px-4 py-3 bg-[#e9eee4] border-b border-[#d9ded4] flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs">
            <div className="w-full sm:flex-1">
              <label className="block text-[11px] font-bold text-[#174332] mb-1">
                Custom API Key (Optional):
              </label>
              <input
                type="password"
                value={customKey}
                onChange={(e) => setCustomKey(e.target.value)}
                placeholder="sk-..."
                className="w-full p-2 bg-white border border-[#cbd5c8] rounded-lg text-xs text-[#173b2d] focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto pt-1 sm:pt-4">
              <button
                type="button"
                onClick={handleSaveKey}
                className="bg-[#174332] text-white px-3 py-1.5 rounded-lg font-bold hover:bg-[#102e24]"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setShowKeyPrompt(false)}
                className="text-[#596b5e] hover:text-[#174332] font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Mobile View Switcher Tab Bar */}
        <div className="sm:hidden flex border-b border-[#e4e5d9] bg-[#e9eee4] text-xs font-bold shrink-0">
          <button
            onClick={() => setActiveView('interview')}
            className={`flex-1 py-2 text-center border-b-2 flex items-center justify-center gap-1.5 ${
              activeView === 'interview' ? 'border-[#174332] text-[#174332] bg-white' : 'border-transparent text-[#596b5e]'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>AI Interview</span>
          </button>
          <button
            onClick={() => setActiveView('document')}
            className={`flex-1 py-2 text-center border-b-2 flex items-center justify-center gap-1.5 ${
              activeView === 'document' ? 'border-[#174332] text-[#174332] bg-white' : 'border-transparent text-[#596b5e]'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Letter Document</span>
          </button>
        </div>

        {/* VIEW 1: INTERVIEW & CHAT */}
        {activeView === 'interview' && (
          <div className="flex-1 flex flex-col justify-between overflow-hidden bg-[#f5f2e9]">
            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-3.5 sm:p-6 space-y-3.5">
              {/* Job Vacancy Summary Card */}
              <div className="p-3 bg-[#e9eee4] border border-[#d9ded4] rounded-2xl text-xs space-y-1">
                <div className="flex items-center justify-between font-bold text-[#174332]">
                  <span>{job.company} Vacancy Brief</span>
                  <span className="text-[10px] text-[#596b5e]">Deadline: {formatDateLabel(job.deadline)}</span>
                </div>
                <p className="text-[#596b5e] leading-snug">
                  <strong>Requirements:</strong> {job.experience ? `${job.experience} · ` : ''}
                  {job.requirements?.slice(0, 2).join('; ') || job.summary}
                </p>
              </div>

              {/* Chat Messages */}
              {messages.map((m) => {
                const isAI = m.role === 'assistant';
                return (
                  <div
                    key={m.id}
                    className={`flex gap-2.5 sm:gap-3 ${isAI ? 'justify-start' : 'justify-end'}`}
                  >
                    {isAI && <CompanyLogo company={job.company} size="sm" />}

                    <div
                      className={`max-w-[88%] sm:max-w-[80%] rounded-2xl p-3.5 sm:p-4 text-xs sm:text-[13px] leading-relaxed shadow-2xs ${
                        isAI
                          ? 'bg-white border border-[#d9ded4] text-[#173b2d]'
                          : 'bg-[#174332] text-white rounded-tr-xs'
                      }`}
                    >
                      <div className="whitespace-pre-line">{m.content}</div>

                      {/* If AI output contains cover letter, show quick action button */}
                      {isAI && (m.content.includes('SUBJECT: APPLICATION') || m.content.includes('Yours faithfully') || m.content.includes('Dear Hiring')) && (
                        <div className="mt-3 pt-3 border-t border-[#e4e5d9] flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setExtractedLetter(m.content);
                              setActiveView('document');
                            }}
                            className="bg-[#efbd43] text-[#173b2d] font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-[#e0b03a] transition-colors"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Open in Document Preview</span>
                          </button>
                          <button
                            type="button"
                            onClick={handleCopy}
                            className="bg-[#e9eee4] text-[#174332] font-bold text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-1 hover:bg-[#dfe6da] transition-colors"
                          >
                            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copied ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                      )}

                      <span
                        className={`block text-[9px] mt-2 font-medium ${
                          isAI ? 'text-[#829084]' : 'text-white/70 text-right'
                        }`}
                      >
                        {m.timestamp}
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* Typing indicator */}
              {isLoading && (
                <div className="flex gap-2.5 items-center text-[#596b5e]">
                  <CompanyLogo company={job.company} size="sm" />
                  <div className="bg-white border border-[#d9ded4] rounded-2xl p-3 flex items-center gap-1.5 shadow-2xs">
                    <span className="w-2 h-2 rounded-full bg-[#174332] animate-bounce" />
                    <span className="w-2 h-2 rounded-full bg-[#174332] animate-bounce [animation-delay:0.2s]" />
                    <span className="w-2 h-2 rounded-full bg-[#174332] animate-bounce [animation-delay:0.4s]" />
                    <span className="ml-1 text-[11px] font-semibold">Analyzing {job.company} criteria & crafting reply...</span>
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Quick Answer Suggestion Chips */}
            <div className="p-2 sm:px-6 bg-[#fffdf7] border-t border-[#e4e5d9] space-y-2 shrink-0">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                <span className="text-[10px] font-extrabold uppercase text-[#714f15] shrink-0 mr-1 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-[#efbd43]" /> Suggested:
                </span>
                {quickPrompts.map((prompt, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => sendMessage(prompt)}
                    disabled={isLoading}
                    className="shrink-0 text-[11px] px-2.5 py-1 bg-[#e9eee4] hover:bg-[#d8e4d2] text-[#174332] font-semibold rounded-lg border border-[#d9ded4] transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              {/* Chat Input Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  sendMessage(inputText);
                }}
                className="flex items-center gap-1.5 sm:gap-2"
              >
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Answer questions or ask revisions..."
                  disabled={isLoading}
                  className="min-w-0 flex-1 text-xs sm:text-sm p-2.5 sm:p-3 bg-white border border-[#d9ded4] rounded-xl text-[#173b2d] focus:outline-none focus:ring-2 focus:ring-[#174332]"
                />

                <button
                  type="submit"
                  disabled={isLoading || !inputText.trim()}
                  className="bg-[#174332] hover:bg-[#102e24] disabled:opacity-50 text-white font-bold text-xs p-2.5 sm:p-3 px-3 sm:px-4 rounded-xl flex items-center justify-center gap-1 transition-colors shrink-0"
                >
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">Send</span>
                </button>

                <button
                  type="button"
                  onClick={() => sendMessage('', true)}
                  disabled={isLoading}
                  className="bg-[#efbd43] hover:bg-[#e0b03a] disabled:opacity-50 text-[#173b2d] font-bold text-xs p-2.5 sm:p-3 px-2.5 sm:px-3.5 rounded-xl flex items-center justify-center gap-1 transition-colors shrink-0"
                  title="Generate final cover letter immediately"
                >
                  <Sparkles className="w-4 h-4" />
                  <span className="hidden sm:inline">Draft Letter</span>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* VIEW 2: DOCUMENT PREVIEW */}
        {activeView === 'document' && (
          <div className="flex-1 flex flex-col justify-between overflow-hidden bg-[#f5f2e9]">
            <div className="p-3.5 sm:p-6 overflow-y-auto space-y-3.5 flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-[#e9eee4] rounded-2xl border border-[#d9ded4]">
                <div>
                  <h3 className="font-display font-bold text-sm text-[#174332]">
                    Official Rwandan Cover Letter for {job.company}
                  </h3>
                  <p className="text-[11px] text-[#596b5e]">
                    Formatted according to Rwandan public and private sector standards.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="bg-[#174332] hover:bg-[#102e24] text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-[#efbd43]" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied!' : 'Copy Letter'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownload}
                    className="bg-white hover:bg-[#f0f0e9] text-[#174332] border border-[#d9ded4] text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Save .txt</span>
                  </button>
                </div>
              </div>

              {/* Editable Document Textarea */}
              <div className="bg-white border border-[#d9ded4] rounded-2xl p-4 sm:p-6 shadow-xs h-[calc(100%-70px)]">
                <textarea
                  value={extractedLetter || messages[messages.length - 1]?.content || ''}
                  onChange={(e) => setExtractedLetter(e.target.value)}
                  className="w-full h-full min-h-[360px] font-mono text-xs sm:text-[13px] leading-relaxed text-[#102e24] focus:outline-none resize-none"
                  placeholder="Your generated letter will appear here..."
                />
              </div>
            </div>

            <div className="p-3 sm:px-6 bg-[#fffdf7] border-t border-[#e4e5d9] flex items-center justify-between gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setActiveView('interview')}
                className="text-xs font-bold text-[#174332] hover:underline flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Return to AI Interview to request revisions</span>
              </button>

              <button
                type="button"
                onClick={handleCopy}
                className="bg-[#174332] text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-[#102e24] transition-colors"
              >
                {copied ? 'Copied to Clipboard!' : 'Copy Formatted Letter'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
