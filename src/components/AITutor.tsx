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
  theme: string;
}

export function AITutor({ questionId, explanation, theme }: AITutorProps) {
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
      // Motor de analogias contextuais baseado primordialmente no Tema + palavras-chave
      const generateTailoredAnalogy = (text: string, qTheme: string) => {
        const lowerText = text.toLowerCase();
        
        switch (qTheme) {
          case 'clinica_medica':
            if (lowerText.includes('coração') || lowerText.includes('cardí') || lowerText.includes('infarto') || lowerText.includes('pressão')) {
              return "Pense no sistema cardiovascular como o encanamento de uma casa e o coração sendo a bomba d'água mecânica. Se a pressão nos canos sobe demais (HAS) ou entope (IAM), focar em dar banho na casa não resolve; precisamos arrumar o vazamento antes da bomba pifar.";
            }
            if (lowerText.includes('pulm') || lowerText.includes('respirat') || lowerText.includes('oxigênio')) {
              return "Imagine os pulmões como o carburador de um carro. Se o filtro está encharcado de água ou secreção, o motor engasga por falta de oxigênio. A conduta serve justamente para secar ou abrir as vias do ar.";
            }
            if (lowerText.includes('infec') || lowerText.includes('bactér') || lowerText.includes('vírus')) {
              return "Na infecção, seu sistema imune é como a Tropa de Choque. O invasor (bactéria) está no prédio. Às vezes a resposta inflamatória joga tantas granadas que quebra o prédio junto. O diagnóstico e antibiótico precisos ajudam a prender o invasor sem explodir tudo.";
            }
            return "Na Clínica Médica, a correlação fisiopatológica é como um 'efeito dominó'. A doença altera a primeira peça (órgão), que vai derrubando as funções vitais seguintes. A intervenção médica serve como a barreira que para a queda.";

          case 'cirurgia':
            return "Em cenários cirúrgicos e no trauma, pense como um encanador lutando contra um alagamento: se há um cano estourado inundando a sala com sangue ou fezes, a prioridade máxima é usar um torniquete metafórico (ou real) e fechar o registro principal antes que a casa afunde.";

          case 'pediatria':
            if (lowerText.includes('aleit') || lowerText.includes('mama') || lowerText.includes('nutri')) return "Nutrição pediátrica precoce é como aplicar a fundação primária num prédio recém desenhado. Qualquer tijolo faltando nos primeiros meses causa rachaduras graves na estrutura a longo prazo.";
            return "A grande pegadinha da pediatria! Não trate crianças apenas como 'pequenos adultos'. O metabolismo deles é uma Ferrari acelerada: perde água e eletrólitos de forma ultra-rápida. A reposição e condutas devem ser sempre instantâneas pelas vias imaturas.";

          case 'ginecologia':
            return "O raciocínio da obstetrícia e ginecologia é muitas vezes como transportar uma carga valiosa dupla numa estrada sinuosa. Qualquer desvio brusco de conduta afeta mãe e recém-nascido. As diretrizes visam estabilizar o 'carro' para proteger ambos simultaneamente, sempre considerando a idade gestacional.";

          case 'saude_mental':
            return "Na saúde mental, os transtornos são semelhantes ao alarme central de segurança de uma casa. Ele dispara ensurdecedoramente (ansiedade, psicose) mesmo quando não há perigo real (estímulo nulo). A classe medicamentosa age para regular a fiação neuroquímica hipersensível que causa os curtos-circuitos.";

          case 'medicina_familia':
            return "A saúde da família atua como o alicerce de manutenção preventiva. Em vez de consertar o motor depois de fundir, ela acompanha a troca de óleo constante do paciente. A conduta correta aqui reflete longitudinalidade: prevenir agravos custa muito menos pro organismo (e pro Estado).";

          case 'saude_coletiva':
            return "Olhando pelo retrovisor da Saúde Coletiva: focar no indivíduo aqui é como limpar uma gota num piso chovendo. A Epidemiologia atua fechando a janela por onde a chuva está entrando na população. Os índices norteiam em que janela atuar primeiro.";

          default:
            return "Trazendo para a vida real: a medicina tenta sempre atacar a causa base do problema. Pense numa goteira; ficar enxugando o chão não adianta até subir no telhado e consertar a telha quebrada pela fisiopatologia descrita.";
        }
      };

      const tailoredAnalogy = generateTailoredAnalogy(explanation, theme);
      
      let replyContent = "Excelente dúvida! Deixa eu te dar uma analogia focada nessa exata situação clínica para você entender de vez:\n\n";
      
      const lowerInput = userMessage.content.toLowerCase();

      // Personaliza minimamente baseado no input
      if (lowerInput.includes('por que') || lowerInput.includes('pq') || lowerInput.includes('motivo') || lowerInput.includes('explic')) {
        replyContent += tailoredAnalogy + "\n\nCruzando isso com a explicação da resposta: a intervenção que marcamos como certa ataca exatamente o núcleo desse processo.";
      } else if (lowerInput.includes('medicamento') || lowerInput.includes('remédio') || lowerInput.includes('droga')) {
        replyContent += "Sobre a conduta medicamentosa, " + tailoredAnalogy + "\n\nO medicamento gabaritado é a ferramenta perfeita para frear isso com segurança baseada na Diretriz do Ministério da Saúde.";
      } else if (lowerInput.includes('diagnóstico') || lowerInput.includes('exame') || lowerInput.includes('teste')) {
        replyContent += "A dúvida se pedir ou não exames pega muita gente. Pense da seguinte forma:\n" + tailoredAnalogy + "\n\nNeste momento do caso clínico o diagnóstico já está dado, e atrasar a conduta só piora nosso doente.";
      } else {
        replyContent += tailoredAnalogy + "\n\nAcredito que vendo por esse lado de uma 'situação real', a conduta clínica ou diagnóstico cobrado pela banca faz muito mais sentido!";
      }

      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: replyContent }]);
      setIsTyping(false);
    }, 1500);
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
            <span className="text-blue-100 text-[11px] font-medium">MedCheck Pro Beta</span>
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
            <div className={`rounded-2xl px-4 py-2.5 max-w-[80%] text-sm shadow-sm whitespace-pre-wrap ${
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
