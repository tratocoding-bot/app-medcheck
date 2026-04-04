import React, { useState, useRef, useEffect } from 'react';
import { Bot, User, Send, Loader2, Sparkles } from 'lucide-react';
import { Button } from './ui/button';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface AITutorProps {
  questionId: string;
  explanation: string;
}

export function AITutor({ questionId, explanation }: AITutorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'greeting',
      role: 'assistant',
      content: 'Olá! Sou o seu Tutor Médico da IA. Sei tudo sobre esta questão. O que você não entendeu na explicação?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // MOCK RESPONSE
    setTimeout(() => {
      let replyContent = "Excelente dúvida clínico-teórica! ";
      
      const lowerInput = userMessage.content.toLowerCase();
      if (lowerInput.includes('por que') || lowerInput.includes('pq')) {
        replyContent += "O motivo principal é que a conduta correta deve mitigar o risco iminente de mortalidade do paciente antes de exames confirmatórios complexos. Avaliando a explicação que vimos: " + explanation.substring(0, 50) + "...";
      } else if (lowerInput.includes('medicamento') || lowerInput.includes('remédio') || lowerInput.includes('droga')) {
        replyContent += "A classe medicamentosa escolhida tem impacto direto no desfecho em protocolos SUS. Não usamos a outra alternativa porque aumentaria o risco de efeitos adversos severos neste paciente específico.";
      } else {
        replyContent += "No contexto do ENAMED e ENARE, questões com este padrão cobram o reconhecimento da 'Red Flag'. Sempre que você notar os comemorativos expostos no caso, foque na diretriz brasileira mais recente.";
      }

      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: replyContent }]);
      setIsTyping(false);
    }, 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) {
    return (
      <div className="mt-4 flex justify-center">
        <Button 
          onClick={() => setIsOpen(true)}
          variant="outline"
          className="border-blue-500/30 bg-blue-500/5 text-blue-500 hover:bg-blue-500/10 hover:text-blue-600 transition-all font-semibold gap-2 border-dashed"
        >
          <Sparkles className="w-4 h-4" />
          Ainda com dúvida? Pergunte ao Tutor de IA
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-6 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm flex flex-col transition-all">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-white">
          <div className="bg-white/20 p-1.5 rounded-lg">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-sm leading-tight">Tutor de IA Integrado</h3>
            <span className="text-blue-100 text-[11px] font-medium">ENAMED Check Beta</span>
          </div>
        </div>
        <button 
          onClick={() => setIsOpen(false)}
          className="text-white/70 hover:text-white transition-colors"
        >
          <span className="text-xl leading-none">&times;</span>
        </button>
      </div>

      {/* Chat Area */}
      <div className="p-4 h-[250px] overflow-y-auto space-y-4 bg-slate-50 dark:bg-slate-900/50">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
              msg.role === 'user' ? 'bg-slate-200 dark:bg-slate-700' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400'
            }`}>
              {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-5 h-5" />}
            </div>
            <div className={`rounded-2xl px-4 py-2.5 max-w-[80%] text-sm shadow-sm ${
              msg.role === 'user' 
                ? 'bg-slate-800 text-white dark:bg-slate-700 rounded-tr-none' 
                : 'bg-white border border-slate-100 text-slate-800 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 rounded-tl-none'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400">
              <Bot className="w-5 h-5" />
            </div>
            <div className="bg-white border border-slate-100 dark:bg-slate-800 dark:border-slate-700 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-1 shadow-sm">
              <div className="w-1.5 h-1.5 bg-blue-500/60 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-1.5 h-1.5 bg-blue-500/60 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-1.5 h-1.5 bg-blue-500/60 rounded-full animate-bounce"></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex gap-2">
        <textarea 
          placeholder="Digite sua dúvida sobre esta questão..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 resize-none h-11 py-2.5 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm dark:text-slate-200"
          rows={1}
        />
        <Button 
          onClick={handleSend}
          disabled={!input.trim() || isTyping}
          className="h-11 px-4 bg-blue-600 hover:bg-blue-700 text-white shadow-sm flex items-center gap-2"
        >
          {isTyping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          <span className="hidden sm:inline">Enviar</span>
        </Button>
      </div>
    </div>
  );
}
