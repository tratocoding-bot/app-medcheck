export interface ChecklistItem {
  id: string;
  text: string;
  profiles?: string[]; // if empty/undefined, applies to all
  urgent?: boolean;
  emoji?: string;
}

export interface ChecklistSection {
  id: string;
  title: string;
  badge: string;
  badgeColor: string;
  icon: string;
  items: ChecklistItem[];
}

export const checklistSections: ChecklistSection[] = [
  {
    id: "sec1",
    title: "Calendário e Datas Críticas",
    badge: "URGENTE",
    badgeColor: "destructive",
    icon: "Calendar",
    items: [
      { id: "sec1_1", text: "Publicação do Edital e início das inscrições (~Jul 2026)", urgent: true, emoji: "⚠" },
      { id: "sec1_2", text: "Prazo final de inscrição (~Ago 2026)", urgent: true, emoji: "⚠" },
      { id: "sec1_3", text: "Pagamento da taxa: R$330 (só p/ médicos e 4º ano)", emoji: "💲" },
      { id: "sec1_4", text: "Pedido de isenção: verificar critérios CadÚnico/renda" },
      { id: "sec1_5", text: "Período de atendimento especial (lactantes, PcD, nome social)" },
      { id: "sec1_6", text: "Cartão de Confirmação: local e horário de prova (~Set 2026)" },
      { id: "sec1_7", text: "DIA DA PROVA: 13 de setembro de 2026", urgent: true, emoji: "🔴" },
      { id: "sec1_8", text: "Divulgação dos resultados individuais (~Nov 2026)" },
      { id: "sec1_9", text: "Processo de recursos" },
    ],
  },
  {
    id: "sec2",
    title: "Inscrição e Documentação",
    badge: "PRIORITÁRIO",
    badgeColor: "warning",
    icon: "FileText",
    items: [
      // Concluintes
      { id: "sec2_c1", text: "Confirmar que sua IES fez o cadastro no sistema E-MEC junto ao INEP", profiles: ["concluinte"] },
      { id: "sec2_c2", text: "Verificar se seu nome consta na lista de habilitados pelo INEP", profiles: ["concluinte"] },
      { id: "sec2_c3", text: "Obter declaração da IES sobre conclusão/previsão de conclusão", profiles: ["concluinte"] },
      { id: "sec2_c4", text: "Conferir dados pessoais (CPF e nome correto no sistema)", profiles: ["concluinte"] },
      { id: "sec2_c5", text: "Ler atentamente o Edital completo no site do INEP", profiles: ["concluinte"] },
      // Médicos
      { id: "sec2_m1", text: "Acessar a Página do Participante (gov.br) e criar conta", profiles: ["medico"] },
      { id: "sec2_m2", text: "Preencher questionário do estudante (obrigatório)", profiles: ["medico"] },
      { id: "sec2_m3", text: "Pagar a taxa de inscrição R$330 via GRU", profiles: ["medico"] },
      { id: "sec2_m4", text: "Reunir documentos: diploma de graduação em Medicina ou certidão de colação", profiles: ["medico"] },
      { id: "sec2_m5", text: "CRM ativo e regular", profiles: ["medico"] },
      { id: "sec2_m6", text: "Verificar se é elegível a isenção de taxa (CadÚnico/renda)", profiles: ["medico"] },
      // 4º ano
      { id: "sec2_a1", text: "Confirmar que sua IES fez o cadastro no sistema E-MEC junto ao INEP", profiles: ["4ano"] },
      { id: "sec2_a2", text: "Verificar elegibilidade: matrícula ativa no 4º ano de medicina", profiles: ["4ano"] },
      { id: "sec2_a3", text: "Entender que a nota obtida equivalerá a 20% da nota do ENARE", profiles: ["4ano"] },
      { id: "sec2_a4", text: "Pagar a taxa de inscrição R$330", profiles: ["4ano"] },
      { id: "sec2_a5", text: "Ler atentamente o Edital completo", profiles: ["4ano"] },
    ],
  },
  {
    id: "sec3",
    title: "Conteúdo da Prova",
    badge: "ACADÊMICO",
    badgeColor: "accent",
    icon: "BookOpen",
    items: [
      { id: "sec3_1", text: "Estudar: Clínica Médica (Grandes Áreas)" },
      { id: "sec3_2", text: "Estudar: Cirurgia Geral e Especialidades Cirúrgicas" },
      { id: "sec3_3", text: "Estudar: Pediatria / Saúde da Criança e do Adolescente" },
      { id: "sec3_4", text: "Estudar: Ginecologia e Obstetrícia / Saúde da Mulher" },
      { id: "sec3_5", text: "Estudar: Medicina de Família e Comunidade / Atenção Primária" },
      { id: "sec3_6", text: "Estudar: Saúde Coletiva e Medicina Preventiva" },
      { id: "sec3_7", text: "Estudar: Saúde Mental / Psiquiatria básica" },
      { id: "sec3_8", text: "Estudar: Urgência e Emergência" },
      { id: "sec3_9", text: "Estudar: Ética Médica e Bioética" },
      { id: "sec3_10", text: "Estudar: Medicina Legal (noções)" },
      { id: "sec3_11", text: "Estudar: Gestão em Saúde e SUS (políticas públicas)" },
      { id: "sec3_12", text: "Entender o formato da prova: questões objetivas + discursivas + habilidades clínicas" },
      { id: "sec3_13", text: "Resolver provas anteriores do ENADE de Medicina (2016, 2019, 2022)" },
      { id: "sec3_14", text: "Simular provas completas em tempo real (5h de duração)" },
      { id: "sec3_15", text: "Estudar Formação Geral (25% da prova): Ética, Sustentabilidade, Diversidade, Legislação" },
      { id: "sec3_16", text: "Revisar Diretrizes Curriculares Nacionais (DCN) de Medicina (2014, atualizada)" },
    ],
  },
  {
    id: "sec4",
    title: "Logística do Dia da Prova",
    badge: "OPERACIONAL",
    badgeColor: "secondary",
    icon: "MapPin",
    items: [
      { id: "sec4_1", text: "Conferir local de prova no Cartão de Confirmação" },
      { id: "sec4_2", text: "Fazer trajeto de teste até o local de prova com antecedência" },
      { id: "sec4_3", text: "Separar documento de identidade original com foto (obrigatório)" },
      { id: "sec4_4", text: "Preparar kit de prova: caneta esferográfica preta, tubo transparente, lápis nº 2, borracha" },
      { id: "sec4_5", text: "Verificar itens proibidos: celular, smartwatch, fones, bonés, etc." },
      { id: "sec4_6", text: "Planejar alimentação leve e hidratação para o dia" },
      { id: "sec4_7", text: "Chegar com pelo menos 1 hora de antecedência (portões fecham pontualmente)" },
      { id: "sec4_8", text: "Ler as instruções do caderno de prova antes de começar" },
      { id: "sec4_9", text: "Distribuir tempo: máx. 3 min por questão objetiva" },
      { id: "sec4_10", text: "Preencher o cartão-resposta com calma e sem rasuras" },
      { id: "sec4_11", text: "Guardar caderno de questões (só pode levar após 2h de prova)" },
    ],
  },
  {
    id: "sec5",
    title: "Pós-Prova e ENARE",
    badge: "ESTRATÉGICO",
    badgeColor: "accent",
    icon: "TrendingUp",
    items: [
      { id: "sec5_1", text: "Aguardar gabarito preliminar e conferir respostas" },
      { id: "sec5_2", text: "Entrar com recurso se houver questão incorreta (prazo do edital)" },
      { id: "sec5_3", text: "Acompanhar publicação do resultado individual no site do INEP" },
      { id: "sec5_4", text: "Entender a composição da nota: Formação Geral (25%) + Componente Específico (75%)" },
      { id: "sec5_5", text: "Saber que a nota do ENAMED substitui a nota do antigo ENADE Medicina" },
      { id: "sec5_6", text: "Para ENARE: verificar pesos da nota do ENAMED na seleção de residência" },
      { id: "sec5_7", text: "Verificar como a nota do ENAMED influencia a avaliação da sua IES pelo MEC" },
      { id: "sec5_8", text: "Acompanhar publicação do ENARE e calendário de inscrição de residência" },
      { id: "sec5_9", text: "(4º Ano) Lembrar que a nota vale 20% na futura composição do ENARE", profiles: ["4ano"] },
    ],
  },
  {
    id: "sec6",
    title: "Direitos, Acessibilidade e Recursos",
    badge: "INFORMATIVO",
    badgeColor: "secondary",
    icon: "Shield",
    items: [
      { id: "sec6_1", text: "Verificar direito a atendimento especial (PcD, gestante, lactante)" },
      { id: "sec6_2", text: "Solicitar atendimento pelo nome social (se aplicável)" },
      { id: "sec6_3", text: "Conferir prazos de requerimento de condições especiais" },
      { id: "sec6_4", text: "Solicitar sala de amamentação (se lactante com bebê até 6 meses)" },
      { id: "sec6_5", text: "Verificar direito a tempo adicional de prova (laudos médicos)" },
      { id: "sec6_6", text: "Conhecer canais de ouvidoria e SAC do INEP" },
      { id: "sec6_7", text: "Verificar política de isenção de taxa para baixa renda / CadÚnico" },
      { id: "sec6_8", text: "Ler FAQ oficial no site do INEP/ENAMED" },
    ],
  },
];

export function getAllItems() {
  return checklistSections.flatMap((s) => s.items);
}

export function getSectionItems(sectionId: string) {
  return checklistSections.find((s) => s.id === sectionId)?.items ?? [];
}
