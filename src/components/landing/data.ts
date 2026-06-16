// ── Serviços ──────────────────────────────────────────────────────────
export const services = [
  {
    id: "fisioterapia",
    icon: "Activity",
    title: "Fisioterapia",
    description: "Tratamento especializado de lesões musculoesqueléticas com técnicas avançadas e equipamentos de última geração.",
    color: "from-blue-500/10 to-blue-600/5",
    accent: "text-blue-600",
    border: "border-blue-100",
  },
  {
    id: "pilates",
    icon: "Dumbbell",
    title: "Pilates Clínico",
    description: "Programa individualizado focado no fortalecimento do core, postura e reequilíbrio muscular supervisionado por fisioterapeutas.",
    color: "from-emerald-500/10 to-emerald-600/5",
    accent: "text-emerald-600",
    border: "border-emerald-100",
  },
  {
    id: "massagem",
    icon: "Waves",
    title: "Massagem Terapêutica",
    description: "Técnicas de relaxamento e alívio de tensões musculares profundas adaptadas às necessidades de cada paciente.",
    color: "from-violet-500/10 to-violet-600/5",
    accent: "text-violet-600",
    border: "border-violet-100",
  },
  {
    id: "reabilitacao",
    icon: "Heart",
    title: "Reabilitação",
    description: "Programas de recuperação pós-cirúrgica e pós-lesão com acompanhamento contínuo e protocolos personalizados.",
    color: "from-rose-500/10 to-rose-600/5",
    accent: "text-rose-600",
    border: "border-rose-100",
  },
  {
    id: "desportiva",
    icon: "Zap",
    title: "Recuperação Desportiva",
    description: "Tratamentos específicos para atletas com foco no retorno rápido e seguro à atividade física de alta performance.",
    color: "from-amber-500/10 to-amber-600/5",
    accent: "text-amber-600",
    border: "border-amber-100",
  },
  {
    id: "postural",
    icon: "Scan",
    title: "Avaliação Postural",
    description: "Análise biomecânica completa para identificar desequilíbrios posturais e traçar o plano de tratamento ideal.",
    color: "from-sky-500/10 to-sky-600/5",
    accent: "text-sky-600",
    border: "border-sky-100",
  },
] as const;

// ── Benefícios ────────────────────────────────────────────────────────
export const benefits = [
  {
    icon: "UserCheck",
    title: "Atendimento Personalizado",
    description: "Cada paciente recebe um plano de tratamento único, desenhado especificamente para as suas necessidades e objetivos.",
  },
  {
    icon: "Award",
    title: "Profissionais Certificados",
    description: "Equipa com formação especializada em Portugal e no estrangeiro, em constante atualização científica.",
  },
  {
    icon: "Cpu",
    title: "Tecnologia Avançada",
    description: "Equipamentos de última geração e técnicas baseadas em evidência científica para resultados superiores.",
  },
  {
    icon: "LayoutGrid",
    title: "Planos Adaptados",
    description: "Programas flexíveis que se ajustam à sua agenda, orçamento e objetivos de saúde a longo prazo.",
  },
  {
    icon: "RefreshCw",
    title: "Acompanhamento Contínuo",
    description: "Monitorização permanente da evolução com ajustes regulares ao plano de tratamento para máxima eficácia.",
  },
  {
    icon: "Shield",
    title: "Ambiente Seguro e Higienizado",
    description: "Instalações modernas com os mais altos padrões de higiene e segurança para o seu conforto e tranquilidade.",
  },
] as const;

// ── Passos "Como funciona" ────────────────────────────────────────────
export const steps = [
  {
    number: "01",
    title: "Marcação",
    description: "Agende a sua consulta online, por telefone ou WhatsApp em menos de 2 minutos. Escolha o horário que melhor se adapta à sua rotina.",
    icon: "CalendarCheck",
  },
  {
    number: "02",
    title: "Avaliação",
    description: "Na primeira consulta realizamos uma avaliação clínica completa para compreender a sua condição e definir os objetivos do tratamento.",
    icon: "ClipboardList",
  },
  {
    number: "03",
    title: "Tratamento",
    description: "Iniciamos o plano terapêutico personalizado com técnicas avançadas e acompanhamento próximo do seu fisioterapeuta dedicado.",
    icon: "Stethoscope",
  },
  {
    number: "04",
    title: "Acompanhamento",
    description: "Monitorizamos continuamente a sua evolução, ajustando o plano conforme necessário até atingir os seus objetivos de saúde.",
    icon: "TrendingUp",
  },
] as const;

// ── Equipa ────────────────────────────────────────────────────────────
export const team = [
  {
    name: "Dr. João Ferreira",
    role: "Fisioterapeuta Principal",
    bio: "Especialista em fisioterapia musculoesquelética com mais de 15 anos de experiência e formação em biomecânica clínica.",
    initials: "JF",
    gradient: "from-blue-400 to-blue-600",
  },
  {
    name: "Dra. Ana Costa",
    role: "Pilates Clínico",
    bio: "Fisioterapeuta especializada em Pilates Clínico e reabilitação pélvica, com pós-graduação em Terapia Manual.",
    initials: "AC",
    gradient: "from-emerald-400 to-emerald-600",
  },
  {
    name: "Dr. Miguel Santos",
    role: "Fisioterapia Desportiva",
    bio: "Especialista em recuperação desportiva, tendo trabalhado com atletas de elite em clubes nacionais e internacionais.",
    initials: "MS",
    gradient: "from-violet-400 to-violet-600",
  },
  {
    name: "Dra. Sofia Lopes",
    role: "Massagem Terapêutica",
    bio: "Terapeuta certificada em múltiplas modalidades de massagem, com abordagem holística centrada no bem-estar integral.",
    initials: "SL",
    gradient: "from-rose-400 to-rose-600",
  },
] as const;

// ── Depoimentos ───────────────────────────────────────────────────────
export const testimonials = [
  {
    name: "Maria Oliveira",
    role: "Paciente — Fisioterapia",
    comment: "Depois de meses com dores crónicas nas costas, a equipa da GlobalFisio conseguiu o que parecia impossível. Em 8 semanas recuperei completamente a minha mobilidade. O acompanhamento é excecional.",
    rating: 5,
    initials: "MO",
    gradient: "from-blue-400 to-blue-600",
  },
  {
    name: "Carlos Mendes",
    role: "Atleta — Recuperação Desportiva",
    comment: "Lesionei-me a um mês de uma competição importante. Com o protocolo de recuperação intensiva da GlobalFisio consegui competir e ainda fiz recorde pessoal. Profissionalismo exemplar.",
    rating: 5,
    initials: "CM",
    gradient: "from-emerald-400 to-emerald-600",
  },
  {
    name: "Inês Rodrigues",
    role: "Paciente — Pilates Clínico",
    comment: "Comecei o pilates clínico para corrigir a minha postura e os resultados foram surpreendentes. Para além de melhorar a postura, deixei de ter dores de cabeça tensionais que me afetavam há anos.",
    rating: 5,
    initials: "IR",
    gradient: "from-violet-400 to-violet-600",
  },
  {
    name: "Pedro Alves",
    role: "Paciente — Reabilitação Pós-cirúrgica",
    comment: "Após a minha cirurgia ao joelho, a recuperação com a GlobalFisio superou todas as expectativas do meu médico. Voltei a correr em 4 meses, quando a previsão era de 6 a 8.",
    rating: 5,
    initials: "PA",
    gradient: "from-amber-400 to-amber-600",
  },
] as const;

// ── FAQ ───────────────────────────────────────────────────────────────
export const faqs = [
  {
    question: "Como posso marcar uma consulta?",
    answer: "Pode marcar a sua consulta diretamente no nosso site clicando em 'Marcar Consulta', por telefone no +351 210 000 000, por WhatsApp ou por email. Respondemos em menos de 2 horas em dias úteis.",
  },
  {
    question: "Aceitam seguros de saúde?",
    answer: "Sim, trabalhamos com os principais seguros de saúde em Portugal: Médis, Multicare, AdvanceCare, Medicare e outros. Contacte-nos para confirmar a cobertura do seu plano específico.",
  },
  {
    question: "Quanto tempo dura uma sessão?",
    answer: "A duração varia consoante o tratamento: sessões de fisioterapia têm tipicamente 45–60 minutos, pilates clínico entre 50–60 minutos, e massagens terapêuticas entre 45–90 minutos, conforme o plano escolhido.",
  },
  {
    question: "Onde está a clínica localizada?",
    answer: "Estamos situados em Av. da Liberdade, 150, Lisboa. Temos estacionamento disponível nas imediações e acesso fácil por metro (Marquês de Pombal, linha azul e amarela) e autocarros.",
  },
  {
    question: "Como funciona o pilates clínico?",
    answer: "Ao contrário do pilates convencional, o pilates clínico é supervisionado por fisioterapeutas e adaptado às necessidades terapêuticas de cada paciente. Começa com uma avaliação postural completa e o programa é desenhado especificamente para os seus objetivos e condição física.",
  },
  {
    question: "É necessário ter indicação médica?",
    answer: "Não é obrigatória indicação médica para a maioria dos tratamentos. No entanto, se tiver uma patologia específica ou estiver em período pós-cirúrgico, recomendamos que traga a documentação médica disponível para que os nossos fisioterapeutas possam adequar o tratamento.",
  },
] as const;

// ── Stats ─────────────────────────────────────────────────────────────
export const stats = [
  { value: "+2000", label: "Pacientes satisfeitos" },
  { value: "+10", label: "Profissionais especializados" },
  { value: "98%", label: "Taxa de satisfação" },
  { value: "+8", label: "Anos de experiência" },
] as const;

