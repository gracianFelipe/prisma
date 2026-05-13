import type { Article, CourseSlug } from "../types";

const HOURS = 1000 * 60 * 60;
const now = Date.UTC(2026, 4, 13, 12, 0, 0); // 2026-05-13T12:00Z

function iso(hoursAgo: number): string {
  return new Date(now - hoursAgo * HOURS).toISOString();
}

export const ARTICLES: Article[] = [
  // --- Direito ---
  {
    id: "dir-001",
    slug: "stf-fixa-tese-sobre-prazo-de-protocolo-eletronico-e-redefine-praxe-forense",
    courseSlug: "direito",
    title: "STF fixa tese sobre prazo de protocolo eletrônico e redefine práxe forense",
    subtitle:
      "Decisão unifica o entendimento sobre o término do expediente forense em meio digital e atinge milhares de processos pendentes.",
    body: "Em julgamento concluído nesta semana, o Supremo Tribunal Federal estabeleceu nova tese sobre a contagem do prazo final de protocolo eletrônico nos tribunais brasileiros. A medida pacifica controvérsia que se arrastava há mais de uma década e impacta diretamente a rotina de escritórios de advocacia, varas judiciais e departamentos jurídicos. O voto vencedor destacou a necessidade de previsibilidade processual e isonomia entre as partes, e fixou critérios objetivos que deverão ser observados em todas as instâncias.",
    source: "Conjur",
    publishedAt: iso(6),
    externalUrl: "https://example.com/stf-protocolo-eletronico",
    featured: true,
    imageSeed: "dir-001",
  },
  {
    id: "dir-002",
    slug: "anpd-publica-guia-de-boas-praticas-em-lgpd-para-empresas-de-pequeno-porte",
    courseSlug: "direito",
    title: "ANPD publica guia de boas práticas em LGPD para empresas de pequeno porte",
    subtitle:
      "Documento simplifica obrigações e cria caminho prático para conformidade em negócios com até 50 funcionários.",
    body: "A Autoridade Nacional de Proteção de Dados divulgou um guia voltado para empresas de pequeno porte, com orientações práticas sobre tratamento de dados, base legal, encarregado e resposta a incidentes. O documento traz exemplos aplicados a contextos comuns como atendimento ao cliente, e-commerce e folha de pagamento.",
    source: "JOTA",
    publishedAt: iso(20),
    externalUrl: "https://example.com/anpd-guia-lgpd",
    featured: false,
    imageSeed: "dir-002",
  },
  {
    id: "dir-003",
    slug: "reforma-tributaria-define-regulamentacao-do-ibs-e-cbs",
    courseSlug: "direito",
    title: "Reforma tributária define regulamentação do IBS e da CBS",
    subtitle:
      "Lei complementar detalha alíquotas, regime de transição e ajustes para setores específicos como saúde, educação e transporte.",
    body: "O Congresso aprovou o texto que regulamenta os novos tributos sobre o consumo previstos na reforma tributária. A lei complementar define como serão calculados o IBS e a CBS, estabelece o regime de transição entre o sistema atual e o novo, e cria regras específicas para setores que receberam tratamento diferenciado.",
    source: "Valor Econômico",
    publishedAt: iso(38),
    externalUrl: "https://example.com/reforma-tributaria-ibs-cbs",
    featured: false,
    imageSeed: "dir-003",
  },
  {
    id: "dir-004",
    slug: "cnj-aprova-resolucao-sobre-uso-de-ia-em-decisoes-judiciais",
    courseSlug: "direito",
    title: "CNJ aprova resolução sobre uso de IA em decisões judiciais",
    subtitle:
      "Norma exige supervisão humana, transparência sobre o modelo utilizado e cria comitê permanente de avaliação ética.",
    body: "O Conselho Nacional de Justiça publicou resolução que regulamenta o uso de inteligência artificial no Judiciário. O texto exige supervisão humana em decisões finais, transparência sobre os modelos empregados e a criação de um comitê permanente para avaliar riscos e impactos.",
    source: "Migalhas",
    publishedAt: iso(60),
    externalUrl: "https://example.com/cnj-ia-judiciario",
    featured: false,
    imageSeed: "dir-004",
  },

  // --- Administração ---
  {
    id: "adm-001",
    slug: "estudo-aponta-que-empresas-com-governanca-formal-crescem-23-mais",
    courseSlug: "administracao",
    title: "Estudo aponta que empresas com governança formal crescem 23% mais",
    subtitle:
      "Pesquisa com 1.200 empresas brasileiras revela ligação direta entre práticas de governança e desempenho de longo prazo.",
    body: "Pesquisa conduzida em parceria entre uma escola de negócios e uma associação setorial analisou 1.200 empresas brasileiras de médio porte ao longo de cinco anos. Os resultados mostram que organizações com práticas formais de governança corporativa cresceram, em média, 23% mais que as concorrentes sem essas práticas estabelecidas.",
    source: "Exame",
    publishedAt: iso(10),
    externalUrl: "https://example.com/governanca-crescimento",
    featured: true,
    imageSeed: "adm-001",
  },
  {
    id: "adm-002",
    slug: "people-analytics-deixa-de-ser-tendencia-e-vira-pratica-comum-no-rh",
    courseSlug: "administracao",
    title: "People analytics deixa de ser tendência e vira prática comum no RH",
    subtitle:
      "Quase metade das empresas brasileiras já usa dados estruturados para decidir contratação, promoção e retenção.",
    body: "Levantamento recente indica que 47% das médias e grandes empresas no Brasil adotam alguma forma estruturada de people analytics. A prática deixou de ser exclusiva de gigantes de tecnologia e se espalhou por setores como varejo, serviços financeiros e saúde.",
    source: "Você S/A",
    publishedAt: iso(28),
    externalUrl: "https://example.com/people-analytics-brasil",
    featured: false,
    imageSeed: "adm-002",
  },
  {
    id: "adm-003",
    slug: "esg-passa-por-revisao-e-ganha-metricas-mais-rigorosas-no-brasil",
    courseSlug: "administracao",
    title: "ESG passa por revisão e ganha métricas mais rigorosas no Brasil",
    subtitle:
      "Reguladores cobram relatórios padronizados e empresas começam a separar discurso de prática.",
    body: "Após anos de retórica frouxa em torno do tema, o ambiente regulatório brasileiro começa a exigir relatórios ESG com métricas padronizadas. A mudança força empresas a abandonar o marketing verde e a comprovar, com dados auditáveis, as iniciativas que comunicam.",
    source: "InfoMoney",
    publishedAt: iso(48),
    externalUrl: "https://example.com/esg-metricas",
    featured: false,
    imageSeed: "adm-003",
  },

  // --- Sistemas da Informação ---
  {
    id: "si-001",
    slug: "modelos-de-linguagem-locais-ganham-espaco-em-empresas-com-dados-sensiveis",
    courseSlug: "sistemas-da-informacao",
    title: "Modelos de linguagem locais ganham espaço em empresas com dados sensíveis",
    subtitle:
      "Bancos, hospitais e escritórios de advocacia adotam LLMs rodando em infraestrutura própria por exigências de compliance.",
    body: "A pressão regulatória sobre tratamento de dados sensíveis está empurrando organizações para alternativas a modelos hospedados em nuvem pública. Bancos, hospitais e escritórios de advocacia começam a rodar modelos de linguagem em infraestrutura própria, mesmo que com menor capacidade que os concorrentes comerciais.",
    source: "TechCrunch BR",
    publishedAt: iso(4),
    externalUrl: "https://example.com/llms-locais",
    featured: true,
    imageSeed: "si-001",
  },
  {
    id: "si-002",
    slug: "vulnerabilidade-em-biblioteca-popular-de-criptografia-mobiliza-equipes-de-seguranca",
    courseSlug: "sistemas-da-informacao",
    title:
      "Vulnerabilidade em biblioteca popular de criptografia mobiliza equipes de segurança",
    subtitle:
      "Falha permite contornar autenticação em determinadas configurações e atinge ecossistemas amplamente adotados.",
    body: "Pesquisadores divulgaram uma vulnerabilidade crítica em uma biblioteca de criptografia amplamente utilizada em aplicações web e mobile. A falha permite, em determinadas configurações, contornar mecanismos de autenticação. Patches foram publicados nas últimas horas e equipes de segurança recomendam atualização imediata.",
    source: "The Hacker News",
    publishedAt: iso(16),
    externalUrl: "https://example.com/cve-criptografia",
    featured: false,
    imageSeed: "si-002",
  },
  {
    id: "si-003",
    slug: "engenheiros-de-software-relatam-mudanca-permanente-na-rotina-com-uso-de-ia",
    courseSlug: "sistemas-da-informacao",
    title:
      "Engenheiros de software relatam mudança permanente na rotina com uso de IA",
    subtitle:
      "Pesquisa global mostra que ferramentas assistivas se tornaram padrão em times maduros e que o papel do desenvolvedor está se redesenhando.",
    body: "Um levantamento internacional com mais de 30 mil profissionais aponta que ferramentas de IA generativa passaram a fazer parte da rotina cotidiana em 71% das equipes de engenharia. O estudo discute deslocamentos de habilidade, redistribuição de tarefas e o impacto sobre desenvolvedores em início de carreira.",
    source: "Stack Overflow",
    publishedAt: iso(34),
    externalUrl: "https://example.com/ia-engenharia",
    featured: false,
    imageSeed: "si-003",
  },
  {
    id: "si-004",
    slug: "open-source-brasileiro-recebe-aporte-publico-para-infraestrutura-de-dados",
    courseSlug: "sistemas-da-informacao",
    title:
      "Open source brasileiro recebe aporte público para infraestrutura de dados",
    subtitle:
      "Programa destina recursos a projetos de bases públicas, observabilidade e ferramentas de análise.",
    body: "Um programa federal anunciou aporte direcionado a projetos brasileiros de software livre voltados a infraestrutura de dados públicos, observabilidade e análise. A iniciativa segue movimentos semelhantes da União Europeia.",
    source: "Tecnoblog",
    publishedAt: iso(72),
    externalUrl: "https://example.com/open-source-brasil",
    featured: false,
    imageSeed: "si-004",
  },

  // --- Processos Gerenciais ---
  {
    id: "proc-001",
    slug: "industria-brasileira-reduz-tempo-de-ciclo-com-automacao-de-processos",
    courseSlug: "processos-gerenciais",
    title:
      "Indústria brasileira reduz tempo de ciclo com automação de processos",
    subtitle:
      "Estudo setorial mostra ganhos médios de 31% em produtividade após adoção combinada de BPM e RPA.",
    body: "Um estudo realizado com 80 indústrias de médio porte mostra que a combinação de gestão por processos com automação robótica reduziu o tempo de ciclo em uma média de 31% em três anos. O documento detalha quais processos foram alvo, como a transição foi feita e quais foram os efeitos sobre o quadro de pessoal.",
    source: "Valor Econômico",
    publishedAt: iso(8),
    externalUrl: "https://example.com/automacao-industria",
    featured: true,
    imageSeed: "proc-001",
  },
  {
    id: "proc-002",
    slug: "lean-six-sigma-volta-ao-radar-de-empresas-de-servicos",
    courseSlug: "processos-gerenciais",
    title: "Lean Six Sigma volta ao radar de empresas de serviços",
    subtitle:
      "Bancos, seguradoras e operadoras de saúde retomam metodologia para enxugar processos administrativos.",
    body: "Após anos relegada a indústria pesada, a metodologia Lean Six Sigma volta a ganhar tração em empresas de serviços. Bancos, seguradoras e operadoras de saúde retomam o uso para enxugar processos administrativos e reduzir variabilidade em jornadas de atendimento.",
    source: "Época Negócios",
    publishedAt: iso(30),
    externalUrl: "https://example.com/lean-servicos",
    featured: false,
    imageSeed: "proc-002",
  },
  {
    id: "proc-003",
    slug: "cadeia-de-suprimentos-enfrenta-pressao-por-resiliencia-climatica",
    courseSlug: "processos-gerenciais",
    title:
      "Cadeia de suprimentos enfrenta pressão por resiliência climática",
    subtitle:
      "Eventos extremos repetidos forçam empresas a redesenhar logística e diversificar fornecedores.",
    body: "A sequência de eventos climáticos extremos no Brasil e no mundo tem obrigado empresas a redesenhar suas cadeias de suprimentos. A pauta da resiliência substitui a do menor custo e exige novos critérios de seleção de fornecedores.",
    source: "Folha de S.Paulo",
    publishedAt: iso(54),
    externalUrl: "https://example.com/supply-clima",
    featured: false,
    imageSeed: "proc-003",
  },

  // --- Pedagogia ---
  {
    id: "ped-001",
    slug: "alfabetizacao-na-idade-certa-volta-ao-centro-da-politica-educacional",
    courseSlug: "pedagogia",
    title:
      "Alfabetização na idade certa volta ao centro da política educacional",
    subtitle:
      "Programa nacional foca os dois primeiros anos do fundamental e amplia formação continuada de docentes.",
    body: "Um novo programa nacional de alfabetização coloca os dois primeiros anos do ensino fundamental no centro da política educacional. A iniciativa amplia recursos para formação continuada de docentes, materiais didáticos e avaliação diagnóstica.",
    source: "Nova Escola",
    publishedAt: iso(12),
    externalUrl: "https://example.com/alfabetizacao-idade-certa",
    featured: true,
    imageSeed: "ped-001",
  },
  {
    id: "ped-002",
    slug: "metodologias-ativas-encontram-resistencia-em-escolas-com-infraestrutura-limitada",
    courseSlug: "pedagogia",
    title:
      "Metodologias ativas encontram resistência em escolas com infraestrutura limitada",
    subtitle:
      "Pesquisa mostra que adoção depende de espaço físico adequado, formação docente e tempo para planejamento.",
    body: "Uma pesquisa nacional mostra que a adoção de metodologias ativas em escolas públicas depende fortemente de condições estruturais. Espaço físico adequado, formação consistente e tempo dedicado ao planejamento aparecem como principais barreiras nos contextos com infraestrutura limitada.",
    source: "Educação",
    publishedAt: iso(36),
    externalUrl: "https://example.com/metodologias-ativas",
    featured: false,
    imageSeed: "ped-002",
  },
  {
    id: "ped-003",
    slug: "educacao-socioemocional-ganha-protocolos-mais-claros-em-redes-publicas",
    courseSlug: "pedagogia",
    title:
      "Educação socioemocional ganha protocolos mais claros em redes públicas",
    subtitle:
      "Secretarias estaduais publicam diretrizes para integrar competências socioemocionais ao currículo regular.",
    body: "Diversas secretarias estaduais de educação publicaram diretrizes próprias para a integração de competências socioemocionais ao currículo regular. O movimento tenta dar contornos práticos a uma agenda que, até então, vinha sendo aplicada de forma irregular pelas redes.",
    source: "Agência Brasil",
    publishedAt: iso(50),
    externalUrl: "https://example.com/socioemocional-protocolos",
    featured: false,
    imageSeed: "ped-003",
  },

  // --- Ciências Contábeis ---
  {
    id: "ctb-001",
    slug: "cfc-publica-orientacao-sobre-contabilizacao-de-creditos-tributarios-do-novo-regime",
    courseSlug: "ciencias-contabeis",
    title:
      "CFC publica orientação sobre contabilização de créditos tributários do novo regime",
    subtitle:
      "Documento detalha tratamento contábil dos créditos do IBS e da CBS durante a transição.",
    body: "O Conselho Federal de Contabilidade publicou orientação técnica detalhando o tratamento contábil dos créditos tributários previstos no novo regime de tributação sobre o consumo. O texto cobre os principais pontos do período de transição e exemplifica situações comuns nos setores industrial, comercial e de serviços.",
    source: "Portal do CFC",
    publishedAt: iso(14),
    externalUrl: "https://example.com/cfc-creditos-tributarios",
    featured: true,
    imageSeed: "ctb-001",
  },
  {
    id: "ctb-002",
    slug: "controladoria-passa-a-ocupar-papel-estrategico-em-empresas-de-medio-porte",
    courseSlug: "ciencias-contabeis",
    title:
      "Controladoria passa a ocupar papel estratégico em empresas de médio porte",
    subtitle:
      "Função deixa de ser apenas reportadora e ganha cadeira nas decisões de alocação de capital.",
    body: "A controladoria começa a sair da função estritamente reportadora em empresas de médio porte. Pesquisa setorial mostra que controllers passaram a ocupar cadeira nas decisões de alocação de capital, planejamento orçamentário e avaliação de investimentos em mais de 60% das companhias analisadas.",
    source: "Capital Aberto",
    publishedAt: iso(42),
    externalUrl: "https://example.com/controladoria-estrategica",
    featured: false,
    imageSeed: "ctb-002",
  },
  {
    id: "ctb-003",
    slug: "auditoria-incorpora-analise-de-dados-em-larga-escala",
    courseSlug: "ciencias-contabeis",
    title: "Auditoria incorpora análise de dados em larga escala",
    subtitle:
      "Firmas migram de amostragem para análise integral de transações em mandatos relevantes.",
    body: "As principais firmas de auditoria do país relatam migração estrutural da amostragem clássica para a análise integral de transações em mandatos relevantes. O movimento é viabilizado por ferramentas de análise de dados e impõe novos perfis profissionais aos times de auditoria.",
    source: "IBracon",
    publishedAt: iso(66),
    externalUrl: "https://example.com/auditoria-dados",
    featured: false,
    imageSeed: "ctb-003",
  },

  // --- Psicologia ---
  {
    id: "psi-001",
    slug: "saude-mental-no-trabalho-passa-a-ser-tema-de-norma-regulamentadora",
    courseSlug: "psicologia",
    title:
      "Saúde mental no trabalho passa a ser tema de norma regulamentadora",
    subtitle:
      "Regulação obriga empresas a mapear riscos psicossociais e adotar medidas estruturadas de prevenção.",
    body: "Uma nova norma regulamentadora coloca a saúde mental no trabalho como obrigação formal das empresas brasileiras. O texto exige mapeamento dos riscos psicossociais, plano de ação documentado e medidas estruturadas de prevenção. Especialistas avaliam que a regra muda o patamar da pauta no país.",
    source: "Folha de S.Paulo",
    publishedAt: iso(2),
    externalUrl: "https://example.com/saude-mental-nr",
    featured: true,
    imageSeed: "psi-001",
  },
  {
    id: "psi-002",
    slug: "burnout-em-adolescentes-cresce-e-mobiliza-redes-de-cuidado",
    courseSlug: "psicologia",
    title: "Burnout em adolescentes cresce e mobiliza redes de cuidado",
    subtitle:
      "Pesquisa nacional registra aumento expressivo dos quadros e aponta para a interseção entre escola, família e redes sociais.",
    body: "Dados recentes mostram crescimento expressivo de quadros compatíveis com burnout em adolescentes brasileiros. O fenômeno mobiliza redes de cuidado e exige diálogo direto entre escola, família e profissionais de saúde. A pesquisa aponta também para o papel das redes sociais como amplificador do problema.",
    source: "BBC Brasil",
    publishedAt: iso(22),
    externalUrl: "https://example.com/burnout-adolescente",
    featured: false,
    imageSeed: "psi-002",
  },
  {
    id: "psi-003",
    slug: "terapia-cognitivo-comportamental-ganha-protocolo-para-uso-em-grupo",
    courseSlug: "psicologia",
    title:
      "Terapia cognitivo-comportamental ganha protocolo para uso em grupo",
    subtitle:
      "Manual padroniza intervenção em saúde pública e amplia acesso ao tratamento.",
    body: "Um manual técnico padroniza o uso da terapia cognitivo-comportamental em formato de grupo no contexto da saúde pública brasileira. A publicação amplia o acesso ao tratamento, especialmente em municípios com poucos profissionais de saúde mental, e detalha protocolos por condição clínica.",
    source: "Conselho Federal de Psicologia",
    publishedAt: iso(46),
    externalUrl: "https://example.com/tcc-grupo",
    featured: false,
    imageSeed: "psi-003",
  },
];

export function getArticlesByCourse(slug: CourseSlug): Article[] {
  return ARTICLES.filter((a) => a.courseSlug === slug).sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
}

export function getArticleBySlug(slug: string): Article | undefined {
  return ARTICLES.find((a) => a.slug === slug);
}

export function getFeaturedByCourse(slug: CourseSlug): Article | undefined {
  const list = getArticlesByCourse(slug);
  return list.find((a) => a.featured) ?? list[0];
}

export function getRelated(article: Article, limit = 3): Article[] {
  return getArticlesByCourse(article.courseSlug)
    .filter((a) => a.id !== article.id)
    .slice(0, limit);
}

export function getLatest(limit = 8): Article[] {
  return [...ARTICLES]
    .sort(
      (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    )
    .slice(0, limit);
}
