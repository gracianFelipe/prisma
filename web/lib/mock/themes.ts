import type { Theme } from "../types";

export const THEMES: Theme[] = [
  {
    slug: "justica",
    name: "Justiça",
    shortName: "Justiça",
    label: "Justiça",
    tagline: "Tribunais, legislação e a fronteira jurídica do digital.",
    description:
      "Decisões dos tribunais, mudanças regulatórias, direitos, justiça e direito digital: os temas jurídicos que estão em pauta no Brasil e no mundo.",
  },
  {
    slug: "negocios",
    name: "Negócios",
    shortName: "Negócios",
    label: "Negócios",
    tagline: "Gestão, estratégia e os movimentos do mercado.",
    description:
      "Liderança, governança, economia, inovação e os modelos de negócio que moldam o presente: o que move empresas e mercados.",
  },
  {
    slug: "tecnologia",
    name: "Tecnologia",
    shortName: "Tecnologia",
    label: "Tecnologia",
    tagline: "Tecnologia, dados e o software que reescreve o mundo.",
    description:
      "Inteligência artificial, segurança da informação, engenharia de software, dados e as transformações digitais que definem o nosso tempo.",
  },
  {
    slug: "gestao",
    name: "Gestão",
    shortName: "Gestão",
    label: "Gestão",
    tagline: "Operações, eficiência e o desenho dos sistemas que funcionam.",
    description:
      "Gestão de processos, melhoria contínua, cadeia de suprimentos, qualidade, carreiras e operações de alta performance.",
  },
  {
    slug: "educacao",
    name: "Educação",
    shortName: "Educação",
    label: "Educação",
    tagline: "Ensino, docência e as práticas que formam pessoas.",
    description:
      "Educação básica, formação docente, aprendizagem, inclusão e tecnologia em sala de aula: o que está em jogo na formação de pessoas.",
  },
  {
    slug: "financas",
    name: "Finanças",
    shortName: "Finanças",
    label: "Finanças",
    tagline: "Tributação, auditoria e o pulso fiscal do país.",
    description:
      "Finanças, contabilidade, reforma tributária, auditoria, investimentos e os movimentos que definem o ambiente econômico e regulatório.",
  },
  {
    slug: "comportamento",
    name: "Comportamento",
    shortName: "Comportamento",
    label: "Comportamento",
    tagline: "Saúde mental, comportamento e a ciência da mente humana.",
    description:
      "Saúde mental, psicologia, comportamento, neurociência e bem-estar: os temas que pautam o cuidado e a compreensão da mente humana.",
  },
  {
    slug: "saude",
    name: "Saúde",
    shortName: "Saúde",
    label: "Saúde",
    tagline: "Medicina, bem-estar e a estética que cuida do corpo.",
    description:
      "Saúde pública, avanços da medicina, prevenção, dermatologia e os procedimentos estéticos que pautam o cuidado com o corpo e a aparência.",
  },
];

export function getTheme(slug: string): Theme | undefined {
  return THEMES.find((c) => c.slug === slug);
}
