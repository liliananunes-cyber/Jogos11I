/*
 * O DETETIVE — Dados dos casos
 *
 * Aqui estão todos os casos do jogo.
 * Cada caso tem: título, local, vítima, suspeitos e pistas.
 *
 * Cada suspeito tem:
 *   - Nome, papel, alibi
 *   - Motivo e método (caso seja o assassino)
 *   - Perguntas que o jogador pode fazer
 *   - Pistas que se revelam com certas perguntas
 *
 * As "deduções" são combinações de duas pistas
 * que revelam uma conclusão nova e importante.
 */

const CASES = [

  // ============================
  // CASO 1 — A Morte de Lord Blackwood
  // Cenário: Uma mansão vitoriana em 1923
  // ============================
  {
    id: 0,
    icon: "🏛️",
    title: "A Morte de Lord Blackwood",
    setting: "Mansão Blackwood, 1923",
    victim: "Lord Edmund Blackwood",
    victimIcon: "💀",
    intro: "O magnata foi encontrado morto no seu escritório trancado. Causa da morte: veneno misturado no brandy nocturno.",
    openingLines: [
      "Era uma noite fria de Outubro quando o telégrafo chegou.",
      "Lord Blackwood estava morto. Envenenado no seu próprio escritório.",
      "A mansão estava fechada. Ninguém entrou. Ninguém saiu.",
      "O assassino ainda está entre nós."
    ],
    difficulty: "Iniciante",
    murdererIndex: -1,
    motive: "A vítima estava prestes a alterar radicalmente o testamento, prejudicando gravemente o assassino.",
    weapon: "Veneno de Beleño misturado no decantador de brandy",

    deductions: [
      {
        clues: [
          "Dr. Harrow identificou imediatamente o veneno como Beleño — conhecimento muito específico para um inocente.",
          "Dr. Harrow esteve na mansão dias antes do crime e teve acesso ao corredor do escritório."
        ],
        conclusion: "Dr. Harrow sabia exatamente que veneno usar E esteve no local dias antes — oportunidade e conhecimento combinados são altamente suspeitos.",
        isKeyDeduction: true
      },
      {
        clues: [
          "Thomas Reed preparou o escritório às 17h e ficou evasivo sobre o decantador — uma hesitação suspeita.",
          "Thomas Reed ia ser despedido sem pensão após 30 anos — motivo forte e inesperado."
        ],
        conclusion: "Thomas Reed tinha motivo (demissão) e estava sozinho com o decantador às 17h. A janela de oportunidade é clara.",
        isKeyDeduction: true
      },
      {
        clues: [
          "Coronel Vane viu Lady Sinclair entrar no escritório antes do jantar — quando o decantador estava lá.",
          "Lady Sinclair admite ter entrado no escritório antes do jantar e tocado no secretário."
        ],
        conclusion: "Dois testemunhos independentes confirmam Lady Sinclair no escritório — o mordomo disse que não entrou sozinha, mas ambos a viram lá.",
        isKeyDeduction: false
      },
      {
        clues: [
          "Lady Sinclair ficou visivelmente perturbada com a menção do testamento — reação desproporcional para uma inocente.",
          "Lord Blackwood estava a rever o testamento nos dias anteriores à morte."
        ],
        conclusion: "Lady Sinclair sabia das alterações ao testamento e reagiu com pânico quando questionada — motivo forte e conhecimento prévio confirmados.",
        isKeyDeduction: true
      },
      {
        clues: [
          "Marta Bloom encontrou um frasco vazio com cheiro a ervas amargas perto do escritório.",
          "Apenas Thomas Reed e o Lord tinham chave do escritório."
        ],
        conclusion: "O frasco descartado indica que o veneno foi preparado fora do escritório e trazido de dentro. Apenas quem tem chave podia sair sem deixar rasto.",
        isKeyDeduction: false
      },
      {
        clues: [
          "Arthur Graves quase admitiu ter lido a correspondência privada do tio.",
          "Lord Blackwood estava a rever o testamento nos dias anteriores à morte."
        ],
        conclusion: "Arthur Graves leu a correspondência e sabia das alterações — tinha motivo concreto que negou inicialmente.",
        isKeyDeduction: false
      }
    ],

    suspects: [
      {
        id: 0,
        name: "Dr. Harrow",
        role: "Médico da Família",
        avatar: "👨‍⚕️",
        alibi: "Afirma ter atendido uma emergência médica do outro lado da cidade.",
        murdererMotive: "Como médico, sabia que os honorários prometidos nunca seriam pagos — e conhecia os venenos perfeitos.",
        murdererMethod: "Durante uma visita de rotina dias antes, adulterou o decantador aproveitando um momento de distração do mordomo.",
        innocentNote: "A sua dívida por receber piora com a morte do Lord — financeiramente, o crime não o beneficia.",
        questions: [
          {
            q: "Onde estava na noite do crime?",
            a: "Fui chamado à casa dos Pennington às 23h — a filha deles estava com febre alta. O cocheiro pode confirmar o percurso.",
            revealClue: false
          },
          {
            q: "Havia alguma tensão financeira com o Lord?",
            a: "Ele devia-me honorários há meses. Mas a sua morte não me ajuda — agora nunca receberei esse dinheiro.",
            revealClue: true, isKeyClue: false,
            clueText: "Dr. Harrow tinha créditos por cobrar ao Lord, mas a morte prejudica-o financeiramente.",
            crossReaction: {
              triggeredByClue: "Thomas Reed ia ser despedido sem pensão após 30 anos — motivo forte e inesperado.",
              reaction: "Disparate. Eu perderia dinheiro com a morte do Lord. Reed, esse sim, tinha tudo a ganhar com a confusão."
            }
          },
          {
            q: "Teve acesso ao escritório recentemente?",
            a: "Visitei a mansão na quinta-feira passada para uma consulta de rotina. Passei pelo corredor do escritório, sim.",
            revealClue: true, isKeyClue: false,
            clueText: "Dr. Harrow esteve na mansão dias antes do crime e teve acesso ao corredor do escritório."
          },
          {
            q: "Como especialista, que veneno poderia causar esses sintomas?",
            a: "Pelos sintomas descritos... beleño, provavelmente. É um alcalóide clássico, difícil de detetar sem análise específica. Mas qualquer boticário poderia fornecê-lo.",
            revealClue: true, isKeyClue: true,
            clueText: "Dr. Harrow identificou imediatamente o veneno como Beleño — conhecimento muito específico para um inocente."
          }
        ]
      },

      {
        id: 1,
        name: "Coronel Vane",
        role: "Velho Rival / Hóspede",
        avatar: "🎖️",
        alibi: "Diz ter jogado cartas com outros hóspedes até às 2h da manhã.",
        murdererMotive: "Blackwood possuía documentos que provariam fraudes durante a guerra — e planeava usá-los.",
        murdererMethod: "Usou contactos militares para obter veneno e adulterou o brandy durante o jantar, aproveitando um momento de distração.",
        innocentNote: "A sua rivalidade era de negócios — e os outros jogadores confirmam solidamente o seu alibi.",
        questions: [
          {
            q: "Como era a sua relação com Lord Blackwood?",
            a: "Amigos desde o regimento. Havia divergências nos negócios, claro, mas eram saudáveis. Assim nos estimulávamos mutuamente.",
            revealClue: false
          },
          {
            q: "Notou algo fora do normal nessa noite?",
            a: "Vi Lady Sinclair a entrar e sair do escritório antes do jantar. Achei curioso — ela geralmente evitava esse lado da mansão.",
            revealClue: true, isKeyClue: false,
            clueText: "Coronel Vane viu Lady Sinclair entrar no escritório antes do jantar — quando o decantador estava lá."
          },
          {
            q: "Existe algum segredo entre si e a vítima?",
            a: "Segredos? Que acusação. Havia... documentos antigos. Questões da guerra que preferíamos ambos manter privadas.",
            revealClue: true, isKeyClue: false,
            clueText: "Coronel Vane e Lord Blackwood partilhavam segredos militares comprometedores — possível motivo de conflito.",
            crossReaction: {
              triggeredByClue: "Lady Sinclair ficou visivelmente perturbada com a menção do testamento — reação desproporcional.",
              reaction: "Lady Sinclair perturbada? Isso sim é interessante. Ela sabia que perderia tudo. Eu não tinha nada a perder com a morte do Edmund."
            }
          },
          {
            q: "Tem experiência com substâncias tóxicas militares?",
            a: "Todo o oficial da minha geração tem. Guerra química, sabe... mas isso foi há décadas. Que insinuação é essa?",
            revealClue: true, isKeyClue: false,
            clueText: "Coronel Vane admite conhecimento de substâncias tóxicas militares — tecnicamente capaz de obter veneno."
          }
        ]
      },

      {
        id: 2,
        name: "Thomas Reed",
        role: "Mordomo Chefe",
        avatar: "🤵",
        alibi: "Diz ter supervisionado o jantar e fechado a mansão após a meia-noite.",
        murdererMotive: "Descobriu que seria despedido sem pensão após 30 anos de serviço, substituído pelo sobrinho.",
        murdererMethod: "Com acesso ilimitado ao escritório, verteu o veneno no decantador às 17h enquanto arrumava a divisão.",
        innocentNote: "A sua lealdade à família é genuína e os outros funcionários confirmam o seu comportamento sempre estável.",
        questions: [
          {
            q: "Quem tinha chave do escritório?",
            a: "Apenas o Lord e eu próprio. A Lady Sinclair pediu para deixar uma nota antes do jantar — acompanhei-a apenas até à porta.",
            revealClue: true, isKeyClue: false,
            clueText: "Apenas Thomas Reed e o Lord tinham chave do escritório. Lady Sinclair foi à porta mas não entrou sozinha."
          },
          {
            q: "O decantador de brandy foi preparado normalmente?",
            a: "O decantador já estava no escritório quando preparei a sala às 17h. Eu... não o toquei. Não nessa tarde.",
            revealClue: true, isKeyClue: false,
            clueText: "Thomas Reed preparou o escritório às 17h e ficou evasivo sobre o decantador — uma hesitação suspeita."
          },
          {
            q: "Sabia que ia ser despedido?",
            a: "Isso é... como sabe disso? O Lord mencionou 'mudanças' na semana passada. Trinta anos de serviço e 'mudanças'. Mas eu jamais...",
            revealClue: true, isKeyClue: true,
            clueText: "Thomas Reed ia ser despedido sem pensão após 30 anos — motivo forte e inesperado."
          },
          {
            q: "O que fez entre as 16h e as 18h nessa tarde?",
            a: "Preparei o escritório, o salão de jantar... circulei pela mansão como faço todos os dias. Não há nada de especial a relatar.",
            revealClue: true, isKeyClue: false,
            clueText: "Thomas Reed circulou pela mansão sozinho entre as 16h e 18h — sem testemunhas durante esse período.",
            crossReaction: {
              triggeredByClue: "Marta Bloom encontrou um frasco vazio com cheiro a ervas amargas perto do escritório.",
              reaction: "Um frasco? Não sei de nenhum frasco. Marta talvez o tenha deixado ela própria — anda distraída ultimamente."
            }
          }
        ]
      },

      {
        id: 3,
        name: "Lady Sinclair",
        role: "Prometida do Lord",
        avatar: "👩‍🦱",
        alibi: "Diz ter estado no seu quarto desde o jantar.",
        murdererMotive: "Estava prestes a ser excluída do testamento que lhe prometia uma fortuna considerável.",
        murdererMethod: "Conhecendo o hábito nocturno de beber brandy, verteu beleño no decantador durante uma visita rápida ao escritório.",
        innocentNote: "A sua devoção ao Lord era genuína e visível para todos os criados — difícil de fingir por dois anos.",
        questions: [
          {
            q: "Qual era o estado do vosso relacionamento?",
            a: "Íamos casar no próximo Outono. Edmund era atencioso, generoso. Estávamos verdadeiramente felizes.",
            revealClue: false
          },
          {
            q: "Entrou no escritório nessa tarde?",
            a: "Fui deixar uma nota de boa noite no secretário. Faço isso frequentemente. É um gesto carinhoso, não é crime.",
            revealClue: true, isKeyClue: false,
            clueText: "Lady Sinclair admite ter entrado no escritório antes do jantar e tocado no secretário onde o decantador estava."
          },
          {
            q: "Sabia das alterações ao testamento?",
            a: "Que... que alterações? Não sei de nenhuma alteração. De onde tirou isso?",
            revealClue: true, isKeyClue: true,
            clueText: "Lady Sinclair ficou visivelmente perturbada com a menção do testamento — reação desproporcional para uma inocente.",
            crossReaction: {
              triggeredByClue: "Lord Blackwood estava a rever o testamento nos dias anteriores à morte.",
              reaction: "Isso é uma mentira! Edmund nunca me diria... nunca me faria isso. Quem lhe contou? Foi Reed?"
            }
          },
          {
            q: "Tinha conhecimento de plantas venenosas?",
            a: "Fiz botânica na escola. Toda a dama culta estuda plantas. Isso não significa absolutamente nada.",
            revealClue: true, isKeyClue: false,
            clueText: "Lady Sinclair admite conhecimento de botânica — inclui potencialmente plantas venenosas como o beleño."
          }
        ]
      },

      {
        id: 4,
        name: "Marta Bloom",
        role: "Ama de Chaves",
        avatar: "👩‍🍳",
        alibi: "Afirma ter estado na cozinha até tarde, com dois ajudantes.",
        murdererMotive: "Roubara joias da família durante anos e o Lord ia chamar a polícia após encontrar provas.",
        murdererMethod: "Adulterou a garrafa no armário de vinhos antes de ser colocada no escritório, aproveitando a sua mobilidade.",
        innocentNote: "Os ajudantes de cozinha confirmam a sua presença contínua — o alibi é o mais sólido de todos.",
        questions: [
          {
            q: "Onde estava entre as 20h e as 23h?",
            a: "Na cozinha sem interrupções. Tínhamos um jantar de oito pessoas — não é altura para passeios. Os rapazes podem confirmar ao minuto.",
            revealClue: false
          },
          {
            q: "Encontrou algo invulgar pela mansão?",
            a: "Vi um frasco pequeno no lixo do corredor do primeiro andar, perto do escritório. Cheirava a ervas amargas. Achei que fosse de perfume velho.",
            revealClue: true, isKeyClue: true,
            clueText: "Marta Bloom encontrou um frasco vazio com cheiro a ervas amargas perto do escritório.",
            crossReaction: {
              triggeredByClue: "Thomas Reed preparou o escritório às 17h e ficou evasivo sobre o decantador.",
              reaction: "Reed a preparar o escritório? Ele e os seus segredos... nunca gostei da forma como olhava para o decantador."
            }
          },
          {
            q: "O Lord alguma vez a confrontou sobre algo?",
            a: "Nunca! Servi esta família há 22 anos. Com honra.",
            revealClue: false
          },
          {
            q: "Notou o estado do escritório nessa tarde?",
            a: "A porta estava fechada a chave — como sempre. Reed é muito ciumento com as suas responsabilidades.",
            revealClue: true, isKeyClue: false,
            clueText: "O escritório esteve fechado a chave toda a tarde — confirmando que apenas quem tem chave o pôde adulterar."
          }
        ]
      },

      {
        id: 5,
        name: "Arthur Graves",
        role: "Sobrinho e Herdeiro",
        avatar: "🧑‍💼",
        alibi: "Diz ter estado a ler no salão até à meia-noite.",
        murdererMotive: "As alterações ao testamento deixariam Arthur sem um penny — e as suas dívidas de jogo eram desesperadas.",
        murdererMethod: "Leu a correspondência roubada, descobriu o plano e agiu rápido, vertendo veneno no brandy durante um momento a sós.",
        innocentNote: "Como herdeiro natural, sempre receberia a herança sem o crime — matar o tio era prematuro e desnecessário.",
        questions: [
          {
            q: "Qual a extensão das suas dívidas de jogo?",
            a: "Tenho... compromissos financeiros, sim. Mas sou o herdeiro — recebia tudo a seu tempo. Nenhum motivo para precipitações.",
            revealClue: true, isKeyClue: false,
            clueText: "Arthur Graves tem dívidas de jogo substanciais mas argumenta que a herança chegaria naturalmente."
          },
          {
            q: "Sabia das alterações ao testamento?",
            a: "Que alterações?! Isso é impossível. Ele PROMETEU. Eu vi a correspondência... quero dizer, ouvi que havia mudanças.",
            revealClue: true, isKeyClue: true,
            clueText: "Arthur Graves quase admitiu ter lido a correspondência privada do tio — como soube das alterações?",
            crossReaction: {
              triggeredByClue: "Lady Sinclair ficou visivelmente perturbada com a menção do testamento.",
              reaction: "Ela também ficou perturbada? Então sabia. Fomos os dois apanhados — mas eu não o matei, juro."
            }
          },
          {
            q: "Pode confirmar que esteve no salão a noite toda?",
            a: "No salão... maioritariamente. Fui à biblioteca buscar um livro. Talvez tenha passado pelo corredor do primeiro andar.",
            revealClue: true, isKeyClue: false,
            clueText: "Arthur Graves admite ter circulado pela mansão nessa noite — alibi inicial era falso."
          },
          {
            q: "Alguém o viu no corredor do escritório?",
            a: "Não... quer dizer... não me recordo de ter visto ninguém. Era tarde.",
            revealClue: true, isKeyClue: false,
            clueText: "Arthur Graves não tem testemunhas para o período em que circulou pelo corredor do escritório."
          }
        ]
      }
    ]
  },

  // ============================
  // CASO 2 — O Roubo do Colar de Diamantes
  // Cenário: Um hotel de luxo em Lisboa, 1931
  // ============================
  {
    id: 1,
    icon: "💎",
    title: "O Roubo do Colar de Diamantes",
    setting: "Hotel Grandeur, Lisboa, 1931",
    victim: "Condessa Valéria Monteiro",
    victimIcon: "💎",
    intro: "A Condessa foi encontrada estrangulada no seu quarto. O famoso colar de diamantes desapareceu. Morte por asfixia.",
    openingLines: [
      "O verão de 1931 chegou quente a Lisboa.",
      "No Hotel Grandeur, a alta sociedade reunia-se como sempre.",
      "Mas esta noite, a Condessa Valéria Monteiro não acordaria.",
      "Estrangulada. O colar desaparecido. Um assassino entre os hóspedes."
    ],
    difficulty: "Intermédio",
    murdererIndex: -1,
    motive: "O assassino precisava desesperadamente do colar ou de silenciar a Condessa.",
    weapon: "Lenço de seda da própria Condessa",

    deductions: [
      {
        clues: [
          "Pierre Duval admite ter saído do bar por 20 minutos para o terraço — coincide com o crime.",
          "A Condessa queria verificar a autenticidade do colar — poderia expor Pierre Duval se fosse falso."
        ],
        conclusion: "Pierre Duval tinha motivo (colar falso) e estava sem alibi exatamente durante o crime. Combinação crítica.",
        isKeyDeduction: true
      },
      {
        clues: [
          "Dra. Voss tinha chave do quarto — acesso direto sem necessidade de arrombar.",
          "A Condessa pediu informações sobre serenantes nos dias antes da morte."
        ],
        conclusion: "A Condessa temia alguém o suficiente para perguntar sobre serenantes — e a única com acesso direto era a Dra. Voss.",
        isKeyDeduction: true
      },
      {
        clues: [
          "Rodrigo Fonseca ficou defensivo com a questão financeira — possível irregularidade.",
          "O alibi de Rodrigo Fonseca tem uma janela de 20 minutos não contabilizada."
        ],
        conclusion: "Fonseca tinha segredos financeiros para esconder e uma janela de tempo não explicada — oportunidade e motivo.",
        isKeyDeduction: true
      },
      {
        clues: [
          "Carlota Mendes não tem alibi verificável após sair do hotel.",
          "Carlota Mendes conhece os passadiços internos — acesso ao quarto sem ser vista."
        ],
        conclusion: "Carlota podia regressar sem ser vista e entrar pelo passadiço. A falta de alibi torna isso possível.",
        isKeyDeduction: false
      },
      {
        clues: [
          "Conde Xavier mencionou os andaimes espontaneamente — possível meio de acesso.",
          "O regresso ao hotel do Conde Xavier foi admitidamente 'discreto'."
        ],
        conclusion: "Xavier conhecia os andaimes, voltou ao hotel de forma discreta e sem testemunhas — acesso pela fachada é plausível.",
        isKeyDeduction: false
      }
    ],

    suspects: [
      {
        id: 0,
        name: "Pierre Duval",
        role: "Joalheiro Parisiense",
        avatar: "💍",
        alibi: "Diz ter estado no bar do hotel até à meia-noite.",
        murdererMotive: "A Condessa descobriu que o colar era falso — ia denunciá-lo e destruir a sua reputação.",
        murdererMethod: "Entrou pelo terraço usando os andaimes, recuperou o colar falso e eliminou a única testemunha.",
        innocentNote: "Perder uma cliente como a Condessa seria prejudicial, mas não catastrófico para um joalheiro estabelecido.",
        questions: [
          {
            q: "Vendeu o colar à Condessa?",
            a: "Sim, há três meses. Uma peça excelente. Stones de primeira qualidade. A Condessa estava radiante.",
            revealClue: false
          },
          {
            q: "A Condessa questionou a autenticidade do colar?",
            a: "Que pergunta estranha. Não... talvez um comentário recente sobre querer um segundo parecer de um gemologista. Uma paranoia.",
            revealClue: true, isKeyClue: true,
            clueText: "A Condessa queria verificar a autenticidade do colar — poderia expor Pierre Duval se fosse falso.",
            crossReaction: {
              triggeredByClue: "O regresso ao hotel do Conde Xavier foi admitidamente 'discreto'.",
              reaction: "Xavier a voltar discretamente? Que conveniente. Talvez tenha sido ele a roubar o colar para pagar as suas dívidas."
            }
          },
          {
            q: "Saiu do bar a algum momento?",
            a: "Bebi dois whiskeys. Estava lá... talvez tenha saído por uns vinte minutos para fumar no terraço. Uma pausa habitual.",
            revealClue: true, isKeyClue: false,
            clueText: "Pierre Duval admite ter saído do bar por 20 minutos para o terraço — exatamente quando o crime ocorreu."
          },
          {
            q: "Conhece bem a disposição do hotel?",
            a: "Fiquei aqui várias vezes ao longo dos anos. Conheço os corredores sim. É natural para um cliente frequente.",
            revealClue: true, isKeyClue: false,
            clueText: "Pierre Duval é cliente frequente e conhece bem os acessos e disposição dos quartos do hotel."
          }
        ]
      },

      {
        id: 1,
        name: "Dra. Elena Voss",
        role: "Médica Pessoal",
        avatar: "👩‍⚕️",
        alibi: "Afirma ter estado no seu quarto com enxaqueca.",
        murdererMotive: "A Condessa alterou o testamento para excluir a herança prometida após doze anos de serviço.",
        murdererMethod: "Com a chave reserva copiada, entrou quando a Condessa dormia, usou o lenço e encencenou um roubo.",
        innocentNote: "A sua dedicação à Condessa era conhecida por todos — difícil de associar à violência.",
        questions: [
          {
            q: "Há quanto tempo serve a Condessa?",
            a: "Doze anos. Conheço cada detalhe da sua saúde, dos seus hábitos, dos seus medos. Era como família para mim.",
            revealClue: false
          },
          {
            q: "Sabia das alterações ao testamento?",
            a: "A Condessa mencionou que estava a 'simplificar questões legais'. Não me contou detalhes. Confiei nela completamente.",
            revealClue: true, isKeyClue: false,
            clueText: "A Condessa mencionou alterações legais à Dra. Voss — que não questionou, o que é incomum para alguém tão próxima.",
            crossReaction: {
              triggeredByClue: "A Condessa pediu informações sobre serenantes nos dias antes da morte.",
              reaction: "Ela perguntou-me sobre serenantes por razões médicas. Insónia. Nada mais."
            }
          },
          {
            q: "Tinha chave do quarto da Condessa?",
            a: "Por motivos médicos, sim. Para emergências. Mas essa chave está no meu quarto, pode verificar.",
            revealClue: true, isKeyClue: true,
            clueText: "Dra. Voss tinha chave do quarto — acesso direto sem necessidade de arrombar."
          },
          {
            q: "Notou algo diferente na Condessa nos últimos dias?",
            a: "Estava mais fechada. Mais precavida. Como se esperasse por algo. Perguntou-me sobre serenantes.",
            revealClue: true, isKeyClue: false,
            clueText: "A Condessa pediu informações sobre serenantes nos dias antes da morte — temia algo ou alguém."
          }
        ]
      },

      {
        id: 2,
        name: "Rodrigo Fonseca",
        role: "Gerente do Hotel",
        avatar: "🏨",
        alibi: "Diz ter estado a resolver um incidente na cozinha.",
        murdererMotive: "A Condessa descobriu que ele desviava fundos dos hóspedes VIP e ia denunciá-lo à direção.",
        murdererMethod: "Usou a chave mestra para aceder ao quarto quando a Condessa dormia e encencenou um roubo.",
        innocentNote: "A sua reputação profissional é impecável segundo os funcionários — trinta anos sem mácula aparente.",
        questions: [
          {
            q: "A Condessa tinha feito reclamações recentes?",
            a: "A Condessa era... exigente. Reclamações eram a norma. Nada de especial.",
            revealClue: false
          },
          {
            q: "Tem acesso a todos os quartos?",
            a: "Obviamente. Sou o gerente. Tenho a chave mestra. É parte do cargo.",
            revealClue: true, isKeyClue: false,
            clueText: "Rodrigo Fonseca tem chave mestra de todos os quartos do hotel."
          },
          {
            q: "Havia irregularidades financeiras no hotel?",
            a: "Irregularidades? As nossas contas são auditadas regularmente. Porque pergunta isso?",
            revealClue: true, isKeyClue: true,
            clueText: "Rodrigo Fonseca ficou defensivo com a questão financeira — possível irregularidade que a Condessa teria descoberto.",
            crossReaction: {
              triggeredByClue: "Dra. Voss tinha chave do quarto — acesso direto sem necessidade de arrombar.",
              reaction: "A médica tinha chave? Isso é muito mais suspeito do que qualquer questão administrativa que me possa colocar."
            }
          },
          {
            q: "O incidente na cozinha pode ser confirmado?",
            a: "O chef pode confirmar. Embora... o incidente resolveu-se rapidamente. Talvez vinte minutos.",
            revealClue: true, isKeyClue: false,
            clueText: "O alibi de Rodrigo Fonseca tem uma janela de 20 minutos não contabilizada — coincide com o tempo estimado do crime."
          }
        ]
      },

      {
        id: 3,
        name: "Carlota Mendes",
        role: "Camareira Pessoal",
        avatar: "🧹",
        alibi: "Diz ter terminado o turno às 22h e ido para casa.",
        murdererMotive: "A Condessa sabia que ela vendia segredos a jornalistas e ia despedi-la sem referências.",
        murdererMethod: "Regressou pelo acesso de serviço, entrou pelo passadiço interno e usou o lenço da Condessa.",
        innocentNote: "Uma camareira raramente tem acesso direto ao cofre dos hóspedes VIP — o colar estava guardado.",
        questions: [
          {
            q: "A que horas saiu do hotel nessa noite?",
            a: "Às 22h em ponto. Assinei o livro de saída. Pode verificar.",
            revealClue: false
          },
          {
            q: "A Condessa disse algo sobre despedi-la?",
            a: "Despedir? Ela... fez alguns comentários. Sobre 'lealdade'. Sobre segredos da família que 'chegavam a ouvidos errados'.",
            revealClue: true, isKeyClue: true,
            clueText: "Carlota Mendes admite que a Condessa a confrontou sobre vazar segredos — ameaça real ao emprego.",
            crossReaction: {
              triggeredByClue: "A Condessa pediu informações sobre serenantes nos dias antes da morte.",
              reaction: "A Condessa pedir serenantes? Ela dormia como uma pedra. Isso é estranho... talvez estivesse com medo de alguém próximo."
            }
          },
          {
            q: "Conhece o passadiço interno dos criados?",
            a: "Toda a camareira conhece. É como nos movemos sem incomodar os hóspedes. Mas eu saí do hotel às 22h.",
            revealClue: true, isKeyClue: false,
            clueText: "Carlota Mendes conhece os passadiços internos — acesso ao quarto sem ser vista é tecnicamente possível."
          },
          {
            q: "Alguém a viu fora do hotel nessa noite?",
            a: "Fui directamente para casa. Vivo sozinha. Não tenho testemunhas, infelizmente.",
            revealClue: true, isKeyClue: false,
            clueText: "Carlota Mendes não tem alibi verificável após sair do hotel — ninguém confirma o seu paradeiro."
          }
        ]
      },

      {
        id: 4,
        name: "Conde Xavier",
        role: "Ex-Marido",
        avatar: "🎩",
        alibi: "Diz ter jantado com amigos num restaurante próximo.",
        murdererMotive: "A Condessa possuía provas das suas fraudes que ameaçava revelar durante o processo de divórcio.",
        murdererMethod: "Subiu pelos andaimes da fachada (obras em curso), entrou pela janela e levou o colar para simular um roubo.",
        innocentNote: "A morte complica o divórcio legalmente — pode custar-lhe a herança que disputava.",
        questions: [
          {
            q: "Por que estava hospedado no mesmo hotel?",
            a: "Coincidência. Lisboa não tem muitos hotéis desta categoria. E havia questões legais que precisávamos discutir pessoalmente.",
            revealClue: false
          },
          {
            q: "Qual era o estado do divórcio?",
            a: "Havia... complicações. Ela possuía documentos. Documentos que eu preferia que não existissem.",
            revealClue: true, isKeyClue: true,
            clueText: "A Condessa possuía documentos comprometedores do Conde Xavier — forte motivo para silenciá-la.",
            crossReaction: {
              triggeredByClue: "Pierre Duval admite ter saído do bar por 20 minutos para o terraço.",
              reaction: "Duval no terraço nessa hora? Isso é... muito conveniente para si. O terraço dá para os andaimes, sabe?"
            }
          },
          {
            q: "Notou as obras no exterior do hotel?",
            a: "Os andaimes são impossíveis de ignorar. Feios. Perturbam os hóspedes.",
            revealClue: true, isKeyClue: false,
            clueText: "Conde Xavier mencionou os andaimes espontaneamente — possível meio de acesso ao quarto sem ser visto."
          },
          {
            q: "O jantar pode ser confirmado integralmente?",
            a: "Os meus amigos confirmam o jantar. Talvez não o regresso ao hotel, que foi... discreto.",
            revealClue: true, isKeyClue: false,
            clueText: "O regresso ao hotel do Conde Xavier foi admitidamente 'discreto' — sem testemunhas para o período crítico."
          }
        ]
      }
    ]
  },

  // ============================
  // CASO 3 — O Veneno do Carnaval
  // Cenário: Uma quinta no Algarve, 1958
  // ============================
  {
    id: 2,
    icon: "🌹",
    title: "O Veneno do Carnaval",
    setting: "Quinta dos Laranjais, Algarve, 1958",
    victim: "Engenheiro Francisco Melo",
    victimIcon: "🌹",
    intro: "Durante a festa de Carnaval na Quinta dos Laranjais, o engenheiro Francisco Melo entrou em colapso e morreu. Veneno no champanhe.",
    openingLines: [
      "O Carnaval de 1958 era para ser uma noite de alegria.",
      "A Quinta dos Laranjais faiscava de luzes e música.",
      "Mas entre os convidados, alguém esperava pelo momento certo.",
      "O engenheiro Francisco Melo nunca soube quem lhe deu a taça final."
    ],
    difficulty: "Avançado",
    murdererIndex: -1,
    motive: "O engenheiro possuía informações, contratos ou provas que ameaçavam destruir alguém presente na festa.",
    weapon: "Arsénio dissolvido no champanhe servido ao engenheiro",

    deductions: [
      {
        clues: [
          "Isabel Neves admite ter servido pessoalmente o champanhe ao engenheiro nessa noite.",
          "Isabel Neves sabia do relatório de inspeção que destruiria o seu negócio de construção."
        ],
        conclusion: "Isabel serviu o champanhe E tinha motivo para eliminar o engenheiro. A combinação é altamente incriminadora.",
        isKeyDeduction: true
      },
      {
        clues: [
          "O Dr. Coutinho tem acesso a substâncias tóxicas no laboratório do hospital.",
          "Dr. Coutinho foi confrontado pelo engenheiro por falsificação de laudos médicos."
        ],
        conclusion: "Coutinho tinha meios (arsénio hospitalar) e motivo (chantagem) — combinação letal.",
        isKeyDeduction: true
      },
      {
        clues: [
          "Leonor Melo nega qualquer problema no casamento mas fica nervosa quando pressionada.",
          "O seguro de vida do engenheiro Melo vencia na semana seguinte e era de valor considerável."
        ],
        conclusion: "Leonor beneficia diretamente da morte do marido no timing mais vantajoso possível — coincidência demasiado perfeita.",
        isKeyDeduction: true
      },
      {
        clues: [
          "Augusto Ferreira admite ter discutido violentamente com o engenheiro na semana anterior.",
          "O engenheiro bloqueou o contrato de Augusto Ferreira com a câmara municipal."
        ],
        conclusion: "Ferreira perdeu o contrato por causa do engenheiro e discutiram dias antes — rancor acumulado e motivo financeiro.",
        isKeyDeduction: false
      }
    ],

    suspects: [
      {
        id: 0,
        name: "Leonor Melo",
        role: "Esposa da Vítima",
        avatar: "👰",
        alibi: "Diz ter estado a receber convidados na entrada durante toda a noite.",
        murdererMotive: "Seguro de vida considerável e um amante que esperava uma vida nova sem o marido.",
        murdererMethod: "Preparou antecipadamente uma taça com arsénio e aproveitou a confusão do Carnaval para a entregar ao marido.",
        innocentNote: "A sua dor parece genuína e os criados confirmam que recebeu convidados durante grande parte da noite.",
        questions: [
          {
            q: "Como era a sua relação com o engenheiro?",
            a: "Francisco era um homem trabalhador. Amávamo-nos. Há sempre pequenas tensões num casamento, não é?",
            revealClue: false
          },
          {
            q: "Havia problemas sérios no casamento?",
            a: "Claro que não. Festejamos aqui todos os anos. Eu... havia discussões recentes, sim. Mas nada de grave.",
            revealClue: true, isKeyClue: false,
            clueText: "Leonor Melo nega problemas no casamento mas fica nervosa quando pressionada — possível ocultação.",
            crossReaction: {
              triggeredByClue: "O seguro de vida do engenheiro Melo vencia na semana seguinte e era de valor considerável.",
              reaction: "O seguro?! Isso é... coincidência. Francisco nunca falava de seguros. Eu nem sabia da data exacta."
            }
          },
          {
            q: "Sabia do seguro de vida?",
            a: "Francisco tratava das finanças. Eu sabia que havia um seguro, claro. Não me lembro de datas.",
            revealClue: true, isKeyClue: true,
            clueText: "O seguro de vida do engenheiro Melo vencia na semana seguinte e era de valor considerável.",
          },
          {
            q: "Serviu champanhe ao engenheiro nessa noite?",
            a: "Podem ter sido os criados... eu estava a receber convidados. É possível que lhe tenha levado uma taça no início da noite.",
            revealClue: true, isKeyClue: false,
            clueText: "Leonor Melo admite ter podido servir champanhe ao marido — nega mas não com convicção."
          }
        ]
      },

      {
        id: 1,
        name: "Isabel Neves",
        role: "Sócia de Negócios",
        avatar: "👩‍💼",
        alibi: "Diz ter estado sempre no salão principal com os outros convidados.",
        murdererMotive: "O engenheiro preparava um relatório de inspeção que iria destruir o seu negócio de construção ilegal.",
        murdererMethod: "Trouxe arsénio escondido no bolso e aproveitou um momento de distração para dissolvê-lo na taça do engenheiro.",
        innocentNote: "Vários convidados a viram no salão durante a noite, embora com intervalos não confirmados.",
        questions: [
          {
            q: "Qual era a natureza do vosso negócio?",
            a: "Construção civil. Francisco fiscalizava obras municipais — era útil ter a sua boa vontade.",
            revealClue: false
          },
          {
            q: "Havia algum conflito profissional com o engenheiro?",
            a: "Havia... divergências sobre um relatório de inspeção. Ele era muito rígido nas regras. Demasiado.",
            revealClue: true, isKeyClue: true,
            clueText: "Isabel Neves sabia do relatório de inspeção que destruiria o seu negócio de construção.",
            crossReaction: {
              triggeredByClue: "Leonor Melo admite ter podido servir champanhe ao marido.",
              reaction: "Leonor serviu champanhe ao marido? Isso é suspeito. O casamento deles não era o que aparentava."
            }
          },
          {
            q: "Serviu alguma coisa ao engenheiro nessa noite?",
            a: "Eu... sim, levei-lhe uma taça de champanhe quando o vi sozinho. Um gesto de cortesia, nada mais.",
            revealClue: true, isKeyClue: false,
            clueText: "Isabel Neves admite ter servido pessoalmente o champanhe ao engenheiro nessa noite."
          },
          {
            q: "Pode confirmar onde estava durante toda a noite?",
            a: "Estava no salão. Talvez tenha ido à varanda uma vez. É difícil lembrar — havia tanta gente.",
            revealClue: true, isKeyClue: false,
            clueText: "Isabel Neves não tem testemunhas para todos os momentos da noite — há intervalos por confirmar."
          }
        ]
      },

      {
        id: 2,
        name: "Dr. Coutinho",
        role: "Médico e Amigo da Família",
        avatar: "🩺",
        alibi: "Diz ter estado a conversar com convidados na biblioteca.",
        murdererMotive: "O engenheiro descobriu que falsificara laudos médicos para um cliente corrupto e ameaçava denunciá-lo.",
        murdererMethod: "Com acesso privilegiado a substâncias no hospital, trouxe arsénio em pó e adicionou ao champanhe durante um brinde.",
        innocentNote: "A sua reputação médica é respeitada e foi ele próprio a declarar a morte — comportamento incomum para um culpado.",
        questions: [
          {
            q: "Foi o senhor que declarou a morte?",
            a: "Infelizmente sim. Fui o primeiro a chegar quando Francisco colapsou. Os sintomas eram consistentes com intoxicação aguda.",
            revealClue: false
          },
          {
            q: "Tinha conflitos com o engenheiro?",
            a: "Francisco... descobriu uma irregularidade num laudo médico que assinei. Uma pressão do cliente, não um erro de julgamento. Estava a tentar resolver a situação.",
            revealClue: true, isKeyClue: true,
            clueText: "Dr. Coutinho foi confrontado pelo engenheiro por falsificação de laudos médicos — chantagem implícita.",
            crossReaction: {
              triggeredByClue: "Isabel Neves sabia do relatório de inspeção que destruiria o seu negócio.",
              reaction: "Isabel também tinha problemas com Francisco? Não sabia. Somos dois com motivos — isso torna-me menos suspeito, não mais."
            }
          },
          {
            q: "Tem acesso a substâncias tóxicas?",
            a: "Trabalho num hospital. Qualquer médico tem acesso a substâncias perigosas. Isso não prova nada.",
            revealClue: true, isKeyClue: false,
            clueText: "Dr. Coutinho tem acesso a substâncias tóxicas no laboratório do hospital, incluindo potencialmente arsénio."
          },
          {
            q: "Estava presente quando o engenheiro bebeu?",
            a: "Estava na biblioteca, mas passei pelo salão por volta das 23h para cumprimentar os anfitriões.",
            revealClue: true, isKeyClue: false,
            clueText: "Dr. Coutinho passou pelo salão precisamente por volta da hora estimada do envenenamento."
          }
        ]
      },

      {
        id: 3,
        name: "Augusto Ferreira",
        role: "Empreiteiro Local",
        avatar: "👷",
        alibi: "Diz ter saído cedo da festa, por volta das 22h.",
        murdererMotive: "O engenheiro bloqueou o seu contrato com a câmara, destruindo anos de trabalho e planos.",
        murdererMethod: "Ficou mais tempo do que admite, aguardou o momento certo na varanda e adicionou arsénio ao champanhe.",
        innocentNote: "Vários convidados confirmam tê-lo visto a sair relativamente cedo — o alibi tem algum suporte.",
        questions: [
          {
            q: "Por que saiu cedo da festa?",
            a: "Não me sentia bem. E Francisco estava lá — preferia evitar uma discussão na festa dos outros.",
            revealClue: false
          },
          {
            q: "Qual era o seu conflito com o engenheiro?",
            a: "Bloqueou o meu contrato com a câmara por causa de alegadas irregularidades. Anos de trabalho deitados abaixo por birra burocrática.",
            revealClue: true, isKeyClue: false,
            clueText: "O engenheiro bloqueou o contrato de Augusto Ferreira com a câmara municipal — prejuízo considerável."
          },
          {
            q: "Discutiram recentemente?",
            a: "Tivemos... palavras, na semana passada. Em público, no café. Mas eu não sou assassino.",
            revealClue: true, isKeyClue: false,
            clueText: "Augusto Ferreira admite ter discutido violentamente com o engenheiro na semana anterior ao crime.",
            crossReaction: {
              triggeredByClue: "Isabel Neves admite ter servido pessoalmente o champanhe ao engenheiro.",
              reaction: "Isabel serviu o champanhe? Eu conheço Isabel — ela não teria feito isso sem razão. O que é que ela andava a esconder?"
            }
          },
          {
            q: "Alguém pode confirmar que saiu às 22h?",
            a: "O porteiro... talvez. Ou talvez fossem 23h. Não olhei para o relógio quando saí.",
            revealClue: true, isKeyClue: false,
            clueText: "Augusto Ferreira não tem confirmação precisa da hora de saída — pode ter ficado mais tempo do que admite."
          }
        ]
      },

      {
        id: 4,
        name: "Clara Baptista",
        role: "Secretária do Engenheiro",
        avatar: "💼",
        alibi: "Diz ter estado sempre perto da anfitriã durante a noite.",
        murdererMotive: "O engenheiro descobriu que ela lhe roubava dinheiro há meses — ia denunciá-la na segunda-feira.",
        murdererMethod: "Convenceu-o a experimentar um champanhe especial que ela mesma preparou, aproveitando a confiança que ele depositava nela.",
        innocentNote: "A sua lealdade ao engenheiro era conhecida — ninguém imaginaria uma traição desta magnitude.",
        questions: [
          {
            q: "Há quanto tempo trabalha para o engenheiro?",
            a: "Seis anos. Era como trabalhar para a família. Organizava toda a sua vida profissional.",
            revealClue: false
          },
          {
            q: "O engenheiro mencionou alguma preocupação recente?",
            a: "Estava... agitado ultimamente. Falou em 'arrumar a casa' profissional. Não entrei em detalhes.",
            revealClue: true, isKeyClue: false,
            clueText: "O engenheiro mencionou à secretária que queria 'arrumar a casa' — possível referência a confrontar alguém próximo."
          },
          {
            q: "Havia alguma irregularidade nas contas do escritório?",
            a: "Que irregularidade?! Eu trato dos pagamentos com toda a honestidade. Porque faz esta pergunta?",
            revealClue: true, isKeyClue: true,
            clueText: "Clara Baptista reagiu defensivamente à questão das contas — o engenheiro tinha razões para desconfiar dela.",
            crossReaction: {
              triggeredByClue: "Dr. Coutinho foi confrontado pelo engenheiro por falsificação de laudos médicos.",
              reaction: "O doutor também tinha problemas com Francisco? Isso muda tudo. Eram muitos os que queriam silenciá-lo."
            }
          },
          {
            q: "Interagiu com o engenheiro durante a festa?",
            a: "Trouxe-lhe uma taça de champanhe no início da noite — ele pediu-me especificamente. Confiava em mim para essas coisas.",
            revealClue: true, isKeyClue: false,
            clueText: "Clara Baptista admite ter servido champanhe ao engenheiro a seu pedido — acesso direto à taça confirmado."
          }
        ]
      }
    ]
  }

]; // Fim da lista de todos os casos