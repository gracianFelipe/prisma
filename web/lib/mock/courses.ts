import type { Course } from "../types";

export const COURSES: Course[] = [
  {
    slug: "direito",
    name: "Direito",
    shortName: "Direito",
    label: "Direito",
    tagline: "Tribunais, legislação e a fronteira jurídica do digital.",
    description:
      "Leia as notícias mais atuais sobre decisões dos tribunais, mudanças regulatórias, direito digital e os temas jurídicos que estão em pauta no Brasil.",
  },
  {
    slug: "administracao",
    name: "Administração",
    shortName: "Administração",
    label: "Administração",
    tagline: "Gestão, estratégia e os movimentos do mercado.",
    description:
      "Acompanhe os assuntos mais recentes sobre liderança, governança, mercado, inovação e os modelos de negócio que moldam o presente.",
  },
  {
    slug: "sistemas-da-informacao",
    name: "Sistemas da Informação",
    shortName: "SI",
    label: "Sistemas da Informação",
    tagline: "Tecnologia, dados e o software que reescreve o mundo.",
    description:
      "Inteligência artificial, segurança da informação, engenharia de software, dados e as transformações digitais que pautam a área.",
  },
  {
    slug: "processos-gerenciais",
    name: "Processos Gerenciais",
    shortName: "Processos",
    label: "Processos Gerenciais",
    tagline: "Operações, eficiência e o desenho dos sistemas que funcionam.",
    description:
      "Notícias sobre gestão de processos, melhoria contínua, cadeia de suprimentos, qualidade e operações de alta performance.",
  },
  {
    slug: "pedagogia",
    name: "Pedagogia",
    shortName: "Pedagogia",
    label: "Pedagogia",
    tagline: "Educação, docência e as práticas que formam pessoas.",
    description:
      "Discussões atuais sobre educação básica, formação docente, aprendizagem, inclusão e tecnologia em sala de aula.",
  },
  {
    slug: "ciencias-contabeis",
    name: "Ciências Contábeis",
    shortName: "Contábeis",
    label: "Ciências Contábeis",
    tagline: "Tributação, auditoria e o pulso fiscal do país.",
    description:
      "Contabilidade, reforma tributária, IFRS, auditoria, controladoria e os movimentos que definem o ambiente regulatório.",
  },
  {
    slug: "psicologia",
    name: "Psicologia",
    shortName: "Psicologia",
    label: "Psicologia",
    tagline: "Saúde mental, comportamento e a ciência da mente humana.",
    description:
      "Saúde mental, psicologia clínica, neuropsicologia, bem-estar e os temas que pautam o cuidado psicológico contemporâneo.",
  },
];

export function getCourse(slug: string): Course | undefined {
  return COURSES.find((c) => c.slug === slug);
}
