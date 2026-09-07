/**
 * Every priced item and every FAQ, transcribed verbatim from the Claude Design
 * canvas. This is the single source of truth: the page renders from it and the
 * JSON-LD graph is generated from it, so prices can never drift between the two.
 *
 * Copy is kept exactly as written by the taróloga, typos included.
 */

export interface Reading {
  title: string;
  tag: string;
  /** Numeric BRL value, for structured data. */
  price: number;
  /** Exact on-screen rendering, as designed. */
  priceLabel: string;
  text: string;
}

export interface ReadingGroup {
  name: string;
  accent: string;
  note: string;
  readings: Reading[];
}

/**
 * Accents come from the canvas's `pal` array, which overrides the per-group
 * `accent` field in its own source data — these are the colours that render.
 */
export const READING_GROUPS: ReadingGroup[] = [
  {
    name: 'Vida amorosa',
    accent: '#f4a3b4',
    note: 'Opções para solteiros e para quem tem alguém especial',
    readings: [
      {
        title: 'O Jogo da Perspectiva',
        tag: 'Relacionamentos',
        price: 60,
        priceLabel: 'R$ 60,00',
        text: 'O mais completo para analisar você e seu par! Fala sobre o passado, presente e futuro da relação + os pensamentos, sentimentos, atitudes e atração física de vocês dois',
      },
      {
        title: 'Templo de Afrodite',
        tag: 'Relacionamentos',
        price: 30,
        priceLabel: 'R$ 30,00',
        text: 'Vamos falar sobre os pensamentos e sentimentos de vocês dois, sobre o que cada um quer de verdade e sobre qual é o futuro desse envolvimento',
      },
      {
        title: 'Decifrando o Parceiro',
        tag: 'Relacionamentos',
        price: 45,
        priceLabel: 'R$ 45,00',
        text: 'Aqui não vamos falar do relacionamento, mas sim do seu par: como ela/e te via no passado, como vê hoje em dia com a mente e com o coração, por que ela/e age como age e como te verá no futuro',
      },
      {
        title: 'A Torre do Amor',
        tag: 'Solteiros',
        price: 60,
        priceLabel: 'R$ 60,00',
        text: 'Tiragem para saber quais as características da próxima pessoa com quem você terá um relacionamento sério: como é a aparência e a personalidade, onde pode encontrá-la, se chega em mais ou menos que 3 meses...',
      },
      {
        title: 'Fonte do Amor',
        tag: 'Solteiros',
        price: 20,
        priceLabel: 'R$ 20,00',
        text: 'Tiragem rápida e objetiva: veremos qual o seu momento atual na vida amorosa, o que você deseja que aconteça e o que a vida vai te dar',
      },
      {
        title: 'Destino Amoroso',
        tag: 'Solteiros',
        price: 45,
        priceLabel: 'R$ 45,00',
        text: 'O caminho afetivo que se abre nos próximos meses: sinais, encontros e o tempo certo.',
      },
    ],
  },
  {
    name: 'Análise de áreas',
    accent: '#93d2d4',
    note: 'Escolha a área que quiser: vida profissional, financeira, acadêmica, saúde…',
    readings: [
      {
        title: 'Jogo das 3 Cartas',
        tag: 'Por área',
        price: 20,
        priceLabel: 'R$ 20,00',
        text: 'Análise do passado, presente e futuro da área que você escolher',
      },
      {
        title: 'Método Ferradura',
        tag: 'Por área',
        price: 40,
        priceLabel: 'R$ 40,00',
        text: 'Análise do passado, presente, futuro, obstáculos, como o ambiente influencia + conselho e o que acontece caso você siga o conselho do jogo, também sobre a área da vida que você escolher',
      },
    ],
  },
  {
    name: 'Autoconhecimento',
    accent: '#cfc0ee',
    note: 'Para olhar para dentro',
    readings: [
      {
        title: 'Vidas Passadas',
        tag: 'Autoconhecimento',
        price: 60,
        priceLabel: 'R$ 60,00',
        text: 'Veremos como era sua vida em uma encarnação anterior: sua família, trabalho, relacionamento amoroso, status social, causa da morte e qual é a mensagem que seu “eu” do passado deixa para o seu “eu” do presente',
      },
      {
        title: 'Ponto Cego',
        tag: 'Autoconhecimento',
        price: 30,
        priceLabel: 'R$ 30,00',
        text: 'Um jogo que vai escavar as percepções mais profundas do seu ser: Como você se vê? Como as outras pessoas te veem? O que essas visões tem em comum? Quais são as características suas que você ainda não percebeu que tem?',
      },
      {
        title: 'Jogo da Autoestima',
        tag: 'Autoconhecimento',
        price: 30,
        priceLabel: 'R$ 30,00',
        text: 'Aqui vamos analisar: Quais suas qualidades, quais comportamentos seus deveriam ser evitados, suas dificuldades e como superá-las, e qual a sua essência/seu verdadeiro eu',
      },
    ],
  },
  {
    name: 'Outros Atendimentos',
    accent: '#e3d9a8',
    note: 'Análises completas e Jogo da Amizade',
    readings: [
      {
        title: 'Mandala Astrológica',
        tag: 'Panorama',
        price: 90,
        priceLabel: 'R$ 90,00',
        text: 'Vamos falar sobre várias áreas da sua vida ao mesmo tempo: Amor, trabalho, finanças, amizades, seu estado de espírito atual, crises e como superá-las, como as pessoas te veem...',
      },
      {
        title: 'Tabuleiro',
        tag: 'Panorama',
        price: 60,
        priceLabel: 'R$ 60,00',
        text: 'Vamos falar sobre o passado, presente e futuro de 6 áreas da sua vida: Amor, trabalho, saúde, amizades, família e objetivos',
      },
      {
        title: 'Jogo da Amizade',
        tag: 'Outros atendimentos',
        price: 30,
        priceLabel: 'R$ 30,00',
        text: 'Vou analisar a relação entre você e sua amiga(o), veremos o que fortalece e o que enfraquece a amizade, como cada um se comporta nessa amizade, qual o futuro da amizade de vocês e como essa amizade é hoje',
      },
    ],
  },
];

export interface Tier {
  /** Large numeral, e.g. "1", "7+", "1h30". */
  headline: string;
  /** Word beside the numeral, e.g. "perguntas", "de leitura". */
  unit: string;
  price: number;
  priceLabel: string;
  /** May contain <b> — rendered with set:html. */
  text: string;
  featured?: boolean;
}

export const QUESTION_TIERS: Tier[] = [
  {
    headline: '1',
    unit: 'pergunta',
    price: 10,
    priceLabel: 'R$ 10',
    text: 'Perfeito para quem já sabe exatamente o que quer saber. Com mais R$ 2 <b>é possível incluir</b> um conselho geral.',
  },
  {
    headline: '3',
    unit: 'perguntas',
    price: 30,
    priceLabel: 'R$ 30',
    text: 'Fazendo três perguntas ou mais o conselho geral <b>é dado de brinde.</b>',
    featured: true,
  },
  {
    headline: '7+',
    unit: 'perguntas',
    price: 66,
    priceLabel: 'R$ 66',
    text: 'A partir de 7 perguntas há um <b>desconto de 5%</b> em cima do valor total. E claro, está incluso o <b>conselho geral de brinde.</b>',
  },
];

export const TIME_TIERS: Tier[] = [
  {
    headline: '1h',
    unit: 'de leitura',
    price: 90,
    priceLabel: 'R$ 90',
    text: 'Fico uma hora inteira à disposição para responder suas perguntas.',
  },
  {
    headline: '1h30',
    unit: 'de leitura',
    price: 120,
    priceLabel: 'R$ 120',
    text: 'Meia hora a mais, para temas que pedem calma.',
    featured: true,
  },
];

export type PackageIcon = 'deck' | 'ball' | 'chalice' | 'moon';

export interface Package {
  name: string;
  /** Top bar and heading accent. */
  accent: string;
  /** Bullet colour — darker than `accent` where the accent is too light on white. */
  bullet: string;
  icon: PackageIcon;
  items?: string[];
  description?: string;
  badge?: string;
  price: number;
  priceLabel: string;
  /** Suffix beside the price, e.g. ",00" or ",00 mensais". */
  priceSuffix: string;
  footnote?: string;
  /** Set for the monthly subscription so structured data can mark it recurring. */
  recurring?: boolean;
}

export const PACKAGES: Package[] = [
  {
    name: 'Pacote do amor para solteiros',
    accent: '#c79ae8',
    bullet: '#c79ae8',
    icon: 'deck',
    items: ['Torre do Amor', 'Destino amoroso', '5 perguntas', 'Conselho'],
    price: 130,
    priceLabel: 'R$ 130',
    priceSuffix: ',00',
  },
  {
    name: 'Pacote do amor para relacionamentos',
    accent: '#ed8f89',
    bullet: '#ed8f89',
    icon: 'deck',
    items: ['O Jogo da Perspectiva', 'Decifrando o Parceiro', '5 perguntas', 'Conselho'],
    price: 130,
    priceLabel: 'R$ 130',
    priceSuffix: ',00',
  },
  {
    name: 'Pacote do essencial',
    accent: '#f2c94c',
    bullet: '#d9a91f',
    icon: 'ball',
    items: ['Vidas Passadas', 'Mandala Astrológica', '5 perguntas', 'Conselho espiritual'],
    price: 180,
    priceLabel: 'R$ 180',
    priceSuffix: ',00',
  },
  {
    name: 'Pacote da vida profissional',
    accent: '#7fc9cd',
    bullet: '#4fa4a8',
    icon: 'chalice',
    items: ['5 perguntas', 'Análise do meio profissional', 'Análise sobre abertura de caminhos'],
    price: 65,
    priceLabel: 'R$ 65',
    priceSuffix: ',00',
  },
  {
    name: 'Pacote mensal',
    accent: '#8ed07a',
    bullet: '#8ed07a',
    icon: 'moon',
    badge: 'assinatura',
    description:
      'Todo início de mês (no dia combinado) te enviarei uma análise de 4/5 áreas de sua vida (a sua escolha) + um conselho.',
    price: 45,
    priceLabel: 'R$ 45',
    priceSuffix: ',00 mensais',
    footnote: '5 reais de desconto no primeiro mês.',
    recurring: true,
  },
];

export interface Faq {
  q: string;
  a: string;
  /** Renders the Pix / credit-card payment icons under the answer. */
  pay?: boolean;
}

export const FAQS: Faq[] = [
  {
    q: 'Quero fazer um atendimento! Consigo ser atendido agora mesmo?',
    a: 'Não, as tiragens prontas são feitas agendando dia e horário! Já as perguntas avulsas são feitas de acordo com minha disponibilidade, normalmente consigo respondê-las em até 2-3 horas. Todos os atendimentos são feitos por WhatsApp com envio de fotos das cartas e áudios das explicações.',
  },
  {
    q: 'Decidi que vou tirar tarot, preciso passar alguma informação minha?',
    a: 'Sim, preciso do seu nome completo e data de nascimento. Se for uma tiragem/pergunta que envolve outras pessoas, preciso do nome completo e data de nascimento delas também.',
  },
  {
    q: 'Qual o melhor jeito de fazer uma pergunta para o tarot?',
    a: 'Seja objetivo! Não queira misturar vários assuntos em uma pergunta só (exemplo: “qual é meu futuro no amor e no trabalho?” pergunte uma coisa de cada vez) e nem queira transformar algo que é para ser duas perguntas em uma (por exemplo: “o que ele pensa e sente por mim?” esse tipo de questão não funciona, pois envolve duas áreas diferentes do ser humano que podem não estar na mesma sintonia! com o coração ele pode te amar, mas com a mente pode ter dúvidas sobre o relacionamento entre vocês... o correto seria: “pergunta 1: o que ele pensa sobre mim?; pergunta 2: o que ele sente por mim?”). Também evite fazer perguntas que tragam várias opções (exemplo: “serei mais feliz na cidade A ou na cidade B?” prefira perguntar separando as duas coisas para ter uma análise mais completa e profunda: “pergunta 1: como me sentirei na cidade A?” “pergunta 2: como me sentirei na cidade B?”).',
  },
  {
    q: 'Quero agendar uma tiragem pronta, se fizer isso eu ganho perguntas avulsas?',
    a: 'Não! Podemos fazer a tiragem pronta, mas perguntas que não sejam dúvidas sobre as cartas e sobre o que foi falado serão cobradas como perguntas avulsas, com o valor de 10 reais cada.',
  },
  {
    q: 'Quero fazer a mesma pergunta que já fiz para outra taróloga recentemente, posso?',
    a: 'Poder até pode, mas não é recomendado. Mesmo que esteja ansiosa(o) com uma pergunta, é melhor esperar pelo menos 7 dias para perguntar a mesma coisa de novo, para dar tempo de ter alguma mudança nas energias/cenário e absorver tudo que foi dito na consulta anterior. Perguntar várias vezes a mesma coisa num curto espaço de tempo não vai te ajudar, e sim te deixar mais confusa(o) e “contaminar” sua energia, fazendo com que o baralho te dê respostas cada vez mais aleatórias na intenção de te deixar satisfeito com alguma.',
  },
  {
    q: 'O tarot consegue ver tudo mesmo? Sem nenhuma exceção?',
    a: 'O tarot tem limites, não é possível puxar pelas cartas informações como datas, nomes de pessoas, nomes de lugares e nem fazer estimativas precisas de tempo.',
  },
  {
    q: 'Achei as tiragens muito caras, tem alguma opção mais baratinha?',
    a: 'Toda sexta feira, por meio dos stories do Instagram a_sacerdotiza, eu respondo perguntas avulsas objetivas pelo valor de 5 reais cada. Nesse dia, pode enviar por lá quantas perguntas quiser por esse valor simbólico.',
  },
  {
    q: 'Quais as formas de pagamento?',
    a: 'Pix e cartão de crédito, sempre antes do atendimento.',
    pay: true,
  },
];

/** Hero bio. */
export const BIO =
  'Yara Faria é taróloga e mestre de baralho cigano desde 2020. Uma pessoa muito tranquila, ' +
  'respeitosa, objetiva e delicada com as palavras! Pronta para te ajudar a chegar numa decisão ' +
  'sobre uma escolha importante, entender o futuro de um relacionamento difícil, se autoconhecer ' +
  'melhor e te proporcionar uma experiência ímpar com as cartas.';

export const PROMO_TEXT_PREFIX = 'Perguntas avulsas por apenas ';
export const PROMO_PRICE = 'R$ 5';
export const PROMO_TEXT_SUFFIX = ' nos stories da ';
