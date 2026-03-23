export interface ChecklistItem {
  id: string;
  text: string;
  profiles?: string[]; // if empty/undefined, applies to all
  urgent?: boolean;
  emoji?: string;
  tags?: string[]; // 'obrig' | 'enare' | 'novo2026' | 'alerta' | 'aceita'
  detail?: string; // extra info shown below item
}

export interface ChecklistSubsection {
  title: string;
  alert?: { type: "blue" | "yellow" | "green"; text: string };
  items: ChecklistItem[];
}

export interface ChecklistSection {
  id: string;
  title: string;
  badge: string;
  badgeColor: string;
  icon: string;
  alert?: { type: "blue" | "yellow" | "green"; text: string };
  subsections: ChecklistSubsection[];
  hasNotes?: boolean;
  notesPlaceholder?: string;
}

export const checklistSections: ChecklistSection[] = [
  {
    id: "sec1",
    title: "Calendário e Datas Críticas",
    badge: "URGENTE",
    badgeColor: "destructive",
    icon: "Calendar",
    alert: {
      type: "blue",
      text: 'Datas marcadas com * são propostas no ofício SEI/INEP de dezembro/2025 e ainda aguardam confirmação oficial pelo INEP. Acompanhe: enamed.inep.gov.br',
    },
    subsections: [
      {
        title: "Cronograma Oficial ENAMED 2026",
        items: [
          { id: "sec1_1", text: "Salvar o site oficial nos favoritos: enamed.inep.gov.br", tags: ["obrig"] },
          { id: "sec1_2", text: "Configurar lembrete no celular para ~Jun 2026 (publicação do edital)" },
          { id: "sec1_3", text: "Configurar lembrete para ~Jul 2026 (abertura das inscrições)" },
          { id: "sec1_4", text: "Confirmar com a coordenação o calendário da instituição", profiles: ["concluinte"] },
          { id: "sec1_5", text: "Verificar isenção da taxa do ENARE antes do período de inscrição", detail: "A isenção da taxa do ENARE só pode ser solicitada dentro do próprio período do edital, junto com a inscrição. Você precisa preencher o formulário de inscrição e marcar a opção de isenção, anexando os documentos comprobatórios. Existe um prazo específico (curto) só para isso — normalmente nos primeiros dias da inscrição.", tags: ["alerta"] },
        ],
      },
    ],
    hasNotes: true,
  },
  {
    id: "sec2",
    title: "Documentação: Carteiras Médicas e Documentos",
    badge: "OBRIGATÓRIO",
    badgeColor: "warning",
    icon: "FileText",
    subsections: [
      {
        title: "Cadastro e Acesso Digital",
        items: [
          { id: "sec2_d1", text: "Cadastro ativo no Gov.br com nível Prata ou Ouro", tags: ["obrig"], detail: "Necessário para acessar o Sistema ENAMED. Acesse: gov.br" },
          { id: "sec2_d2", text: "CPF válido e regularizado na Receita Federal", tags: ["obrig"] },
          { id: "sec2_d3", text: "E-mail válido e telefone atualizados", tags: ["obrig"] },
        ],
      },
      {
        title: "Carteira / Registro Médico (CRM)",
        items: [
          { id: "sec2_crm1", text: "Carteira do CRM — Inscrição definitiva ou provisória no CRM", profiles: ["medico"], detail: "Aceita como documento de identificação no dia da prova" },
          { id: "sec2_crm2", text: "Verificar validade e situação ativa do CRM no portal CFM", profiles: ["medico"], detail: "portalmedico.cfm.org.br" },
          { id: "sec2_crm3", text: "Diploma de Medicina ou declaração de conclusão do curso", profiles: ["medico"], detail: "Médicos graduados no exterior: diploma revalidado (Revalida INEP)" },
          { id: "sec2_crm4", text: "Declaração de matrícula no último ano (6º ano) de Medicina", profiles: ["concluinte"] },
          { id: "sec2_crm5", text: "Confirmação de matrícula no 4º ano do curso de Medicina", profiles: ["4ano"], tags: ["novo2026"], detail: "A partir de 2026, o ENAMED também é obrigatório para o 4º ano. Nota vale 20% no ENARE." },
        ],
      },
      {
        title: "Documentos de Identificação — Dia da Prova",
        alert: { type: "blue", text: "Leve documento original, com foto, emitido por órgão brasileiro. Documentos digitais são aceitos via aplicativo oficial do Gov.br." },
        items: [
          { id: "sec2_doc1", text: "RG — Cédula de Identidade (Secretarias de Segurança Pública)" },
          { id: "sec2_doc2", text: "CIN — Carteira de Identidade Nacional (novo modelo)" },
          { id: "sec2_doc3", text: "CNH — Carteira Nacional de Habilitação" },
          { id: "sec2_doc4", text: "Passaporte brasileiro" },
          { id: "sec2_doc5", text: "Carteira do CRM — identificação do Conselho Regional de Medicina", tags: ["aceita"] },
          { id: "sec2_doc6", text: "RG ou CNH digital via aplicativo Gov.br" },
        ],
      },
      {
        title: "Materiais para o Dia da Prova",
        items: [
          { id: "sec2_mat1", text: "Caneta esferográfica de tinta preta, tubo transparente", tags: ["obrig"] },
          { id: "sec2_mat2", text: "Cartão de confirmação de inscrição (local e horário da prova)" },
          { id: "sec2_mat3", text: "⛔ Celulares, relógios inteligentes e fones de ouvido são proibidos", emoji: "⛔" },
        ],
      },
    ],
    hasNotes: true,
  },
  {
    id: "sec3",
    title: "Inscrição no ENAMED e ENARE",
    badge: "PASSO A PASSO",
    badgeColor: "accent",
    icon: "ClipboardList",
    subsections: [
      {
        title: "Concluintes 6º Ano — Via Instituição de Ensino",
        alert: { type: "blue", text: "Concluintes são inscritos automaticamente pela instituição de ensino via Sistema Enade/Enamed. Mas precisam acessar o sistema para completar o cadastro." },
        items: [
          { id: "sec3_c1", text: "Confirmar com a coordenação que a IES realizou a inscrição no Sistema Enade", profiles: ["concluinte"] },
          { id: "sec3_c2", text: "Acessar o Sistema ENAMED (enamed.inep.gov.br) no período de inscrições para completar o cadastro", profiles: ["concluinte"], tags: ["obrig"] },
          { id: "sec3_c3", text: "Informar CPF, data de nascimento, e-mail e telefone de contato no Sistema ENAMED", profiles: ["concluinte"] },
          { id: "sec3_c4", text: "Escolher município e UF de realização da prova", profiles: ["concluinte"] },
          { id: "sec3_c5", text: "Preencher o Questionário do Estudante no sistema (obrigatório para colação de grau)", profiles: ["concluinte"] },
          { id: "sec3_c6", text: "Caso queira participar do ENARE: optar pela utilização dos resultados no ENARE", profiles: ["concluinte"] },
          { id: "sec3_c7", text: "Acessar a plataforma do ENARE (enare.ebserh.gov.br) e completar inscrição + taxa R$330", profiles: ["concluinte"], tags: ["enare"] },
        ],
      },
      {
        title: "Médicos Formados — Acesso Direto ao ENARE",
        alert: { type: "blue", text: "Enamed é gratuito. A taxa de R$330 é somente para quem quer concorrer a vagas no ENARE." },
        items: [
          { id: "sec3_m1", text: "Acessar o Sistema ENAMED no período de inscrições (~Jul 2026)", profiles: ["medico"], tags: ["obrig"] },
          { id: "sec3_m2", text: "Preencher dados: CPF, data de nascimento, e-mail, telefone, CRM", profiles: ["medico"] },
          { id: "sec3_m3", text: "Escolher opção de utilização dos resultados no ENARE (se desejar)", profiles: ["medico"] },
          { id: "sec3_m4", text: "Verificar elegibilidade para isenção da taxa (renda, dependentes)", profiles: ["medico"], detail: "Critérios: taxa > 30% da renda mensal (sem dependentes); > 20% (até 2 dependentes); > 10% (mais de 2 dependentes); renda familiar até 3 salários mínimos" },
          { id: "sec3_m5", text: "Efetuar o pagamento da taxa do ENARE (R$330) até a data limite", profiles: ["medico"], tags: ["enare"] },
          { id: "sec3_m6", text: "Confirmar inscrição no ENARE e escolher a especialidade/vagas de interesse", profiles: ["medico"] },
        ],
      },
      {
        title: "Estudantes do 4º Ano — Novidade 2026",
        alert: { type: "yellow", text: "A partir de 2026, o ENAMED também é obrigatório para estudantes do 4º ano de Medicina. A nota valerá 20% da nota final no ENARE de forma permanente." },
        items: [
          { id: "sec3_a1", text: "Confirmar com a coordenação que a IES realizou a inscrição como estudante do 4º ano", profiles: ["4ano"], tags: ["novo2026"] },
          { id: "sec3_a2", text: "Acessar o Sistema ENAMED e completar cadastro no período informado", profiles: ["4ano"], tags: ["novo2026"] },
          { id: "sec3_a3", text: "Escolher município e UF de realização da prova", profiles: ["4ano"], tags: ["novo2026"] },
        ],
      },
    ],
    hasNotes: true,
  },
  {
    id: "sec4",
    title: "Conteúdo Programático e Estudo",
    badge: "RESIDÊNCIA",
    badgeColor: "accent",
    icon: "BookOpen",
    subsections: [
      {
        title: "Estrutura da Prova",
        items: [
          { id: "sec4_s1", text: "100 questões de múltipla escolha — 5 alternativas, 1 correta", detail: "Tempo: 5 horas (13h30–18h30). Raciocínio clínico + integração de conhecimentos." },
          { id: "sec4_s2", text: "Conteúdo baseado nas Diretrizes Curriculares Nacionais (DCN) do curso de Medicina" },
          { id: "sec4_s3", text: "Abordagem privilegia raciocínio clínico e tomada de decisão — não memorização pura" },
          { id: "sec4_s4", text: "Nota do ENAMED utilizada pelo ENARE como nota bruta (total de acertos, sem TRI para classificação)", detail: "O INEP utiliza TRI apenas para o Conceito Enade institucional; para o ENARE, vale a nota bruta." },
        ],
      },
      {
        title: "Áreas Temáticas — Cartões de Estudo",
        items: [
          { id: "sec4_t1", text: "Clínica Médica", emoji: "🫀", detail: "Cardiologia, Pneumologia, Endocrinologia, Nefrologia, Gastroenterologia, Reumatologia, Infectologia, Neurologia" },
          { id: "sec4_t2", text: "Cirurgia Geral", emoji: "🔪", detail: "Abdome agudo, trauma, pré e pós-operatório, hérnias, cirurgia vascular básica" },
          { id: "sec4_t3", text: "Ginecologia e Obstetrícia", emoji: "🤰", detail: "Pré-natal, parto normal, complicações, anticoncepção, doenças ginecológicas" },
          { id: "sec4_t4", text: "Pediatria", emoji: "👶", detail: "Desenvolvimento, imunização, doenças prevalentes, urgências pediátricas, neonatologia" },
          { id: "sec4_t5", text: "Saúde Coletiva / MFC", emoji: "🏥", detail: "Atenção primária, SUS, epidemiologia, vigilância em saúde, medicina de família" },
          { id: "sec4_t6", text: "Saúde Mental", emoji: "🧠", detail: "Transtornos do humor, psicoses, dependência química, psicofarmacologia básica" },
          { id: "sec4_t7", text: "Urgência e Emergência", emoji: "🚨", detail: "ACLS/BLS, politrauma, choque, AVC, IAM, intoxicações" },
          { id: "sec4_t8", text: "Ética Médica", emoji: "⚖️", detail: "Código de Ética Médica (CFM), relação médico-paciente, sigilo, documentos médicos" },
        ],
      },
      {
        title: "Questões da Edição 2025 (referência)",
        alert: { type: "yellow", text: "Na edição de 2025 (prova em 19/10/2025), 3 questões foram anuladas após o gabarito preliminar por serem idênticas a questões do Revalida aplicado no mesmo dia. Fique atento a possíveis recursos na edição 2026." },
        items: [
          { id: "sec4_q1", text: "Revisar gabarito e questões da edição ENAMED 2025 como material de estudo" },
          { id: "sec4_q2", text: "Resolver simulados com foco em raciocínio clínico integrado (não apenas conteúdo isolado)" },
          { id: "sec4_q3", text: "Organizar cronograma de estudos por área temática" },
        ],
      },
    ],
    hasNotes: true,
    notesPlaceholder: "Cronograma de estudos, materiais, anotações...",
  },
  {
    id: "sec5",
    title: "Dia da Prova",
    badge: "ATENÇÃO",
    badgeColor: "destructive",
    icon: "MapPin",
    subsections: [
      {
        title: "Antes de Sair de Casa",
        items: [
          { id: "sec5_b1", text: "Separar o documento oficial com foto na noite anterior" },
          { id: "sec5_b2", text: "Separar caneta esferográfica de tinta preta, tubo transparente" },
          { id: "sec5_b3", text: "Imprimir ou salvar o cartão de confirmação de inscrição (local + horário)" },
          { id: "sec5_b4", text: "Verificar o endereço do local de prova com antecedência no mapa" },
          { id: "sec5_b5", text: "Planejar o transporte com margem de segurança (trânsito, estacionamento)" },
        ],
      },
      {
        title: "Na Chegada ao Local",
        items: [
          { id: "sec5_c1", text: "Chegar com pelo menos 1 hora de antecedência — portões fecham no horário" },
          { id: "sec5_c2", text: "Guardar celular, relógio inteligente e fone de ouvido antes de entrar" },
          { id: "sec5_c3", text: "Assinar lista de presença e receber o caderno de questões" },
        ],
      },
      {
        title: "Durante a Prova",
        items: [
          { id: "sec5_d1", text: "100 questões de múltipla escolha — 5 alternativas, 1 correta", detail: "Tempo: 5 horas (13h30–18h30). Raciocínio clínico + integração de conhecimentos." },
          { id: "sec5_d2", text: "Responder ao Questionário do Estudante/Contextual + Questionário de Percepção da Prova", detail: "Obrigatório para todos — parte integrante da avaliação" },
          { id: "sec5_d3", text: "Atenção: não é possível sair antes do tempo mínimo estabelecido em edital" },
        ],
      },
    ],
    hasNotes: true,
  },
  {
    id: "sec6",
    title: "Pós-Prova: Resultado, Recursos e Escolha de Vagas",
    badge: "RESIDÊNCIA",
    badgeColor: "accent",
    icon: "TrendingUp",
    subsections: [
      {
        title: "Resultado e Recursos",
        items: [
          { id: "sec6_r1", text: "Conferir gabarito preliminar (~Out 2026) em enamed.inep.gov.br" },
          { id: "sec6_r2", text: "Interpor recursos contra gabarito ou questões se necessário (prazo geralmente de 2 dias)" },
          { id: "sec6_r3", text: "Aguardar resultado definitivo e Boletim de Desempenho Individual" },
        ],
      },
      {
        title: "Processo de Escolha de Vagas — ENARE",
        alert: { type: "green", text: "A nota do ENAMED tem validade de 3 anos para uso no ENARE. Se não ingressar em 2026/2027, pode usar a mesma nota nas edições 2027/2028 e 2028/2029." },
        items: [
          { id: "sec6_e1", text: "Verificar classificação no sistema ENARE (nota bruta do ENAMED usada para classificação)", detail: "A nota do 4º ano valerá 20% da nota final no ENARE a partir de 2026" },
          { id: "sec6_e2", text: "Participar da escolha de vagas (sistema online — plataforma EBSERH/ENARE)" },
          { id: "sec6_e3", text: "Apresentar documentação para matrícula na instituição escolhida", detail: "Documentos: RG, CRM, diploma, declaração de conclusão de pré-requisito (se aplicável)" },
          { id: "sec6_e4", text: "Início da residência médica (previsão: Março 2027)" },
        ],
      },
    ],
    hasNotes: true,
    notesPlaceholder: "Especialidade desejada, instituições de interesse...",
  },
];

export function getAllItems() {
  return checklistSections.flatMap((s) => s.subsections.flatMap((sub) => sub.items));
}

export function getSectionItems(sectionId: string) {
  const section = checklistSections.find((s) => s.id === sectionId);
  if (!section) return [];
  return section.subsections.flatMap((sub) => sub.items);
}
