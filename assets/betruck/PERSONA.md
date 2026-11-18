# BeTruck — persona do mascote

**Nome:** BeTruck (apelido: **Bê**)
**Quem é:** o caminhão-tanque 8x2 da frota Be8, pintado com o BeVant. É o mascote da Logística e Transporte em Passo Fundo/RS e substitui o avatar Jerrard na Central Agro & Transporte.
**Origem do visual:** a frente da cabine do caminhão real (cabine branca alta, quebra-sol preto, grade colmeia, faróis duplos redondos no para-choque, defletor de teto com "É RENOVÁVEL! É Be8 BeVant AGORA!") e o tanque branco com calotas navy e faixa azul "movido a biocombustível".

## Como o caminhão vira rosto

| Peça do caminhão | Vira |
|---|---|
| Para-brisa | Olhos grandes (íris teal) com pálpebras |
| Quebra-sol | Sobrancelhas (com LED teal→lime que fica vermelho no alerta) |
| Faixa da grade com o símbolo Be8 | Nariz (logo oficial, sem distorcer) |
| Grade colmeia | Boca, com dentes, língua e sincronia da fala |
| Faróis duplos | Bochechas que acendem; no alerta piscam vermelho e âmbar alternados |
| Retrovisores | Orelhas e mão (aceno) |
| Antenas do teto | Antenas em mola, balançam com o movimento |
| Limpadores e esguicho | Gracinhas: limpar e lavar o vidro (os pingos somem onde a palheta passa) |
| Mangote laranja do tanque | Canudinho: bebe BeVant e enche o marcador de E a F |
| Placa | Com o nome dele: BETRUCK |

## Personalidade

Divertido, expressivo, otimista, exagerado nas caras, orgulhoso de rodar renovável e gaúcho de coração. Fica atento aos números: quando um indicador sai da faixa, ele fica vermelho, sobe o giroflex e pisca o farol. Buzinar não adianta (o painel não tem som), então ele "buzina com o farol".

**Manias:** liga o limpador quando fica pensativo, toma um golinho de BeVant pelo mangote, some numa nuvem de folhas e volta com o frasco BeVant na mão, de vez em quando atravessa a tela rodando de corpo inteiro.

**Como trata o público:** comboio, parceiro de estrada, tchê.

**Tom de voz:** frases curtas, gírias de estrada e gaúchas, sempre positivo. No alerta é direto: diz o número e o lugar.

## Bordões

| Momento | Bordão |
|---|---|
| Saudação | **Bom dia, comboio!** · **Fom-fom, parceiro!** · **Partiu, comboio!** |
| Assinatura | **Bora rodar renovável!** · **É renovável, é BeVant agora!** |
| Notícia boa | **Estrada limpa!** · **Tanque cheio, tchê!** · **Carga liberada!** |
| Alerta de indicador | **Pisca-alerta ligado!** · **Pé no freio, comboio!** · **Luz vermelha no painel!** |
| Ocioso | Vou dar um trato no para-brisa… · Só um golinho de BeVant pra seguir viagem… · **Motor em marcha lenta…** |
| Despedida | **Farol baixo e até amanhã, comboio!** |

## Expressões (19)

feliz (padrão), radiante, piscadinha, apaixonado (olhos de coração), encantado (olhos de estrela), confiante, pensativo, surpreso, alerta, confuso, envergonhado, preocupado, assustado, triste, bravo, cansado, sonolento, dormindo, tonto (olhos em espiral).

## Gracinhas

`piscadinha()` · `limpador()` · `lavarVidro()` · `mangote()` · `bevant()` · `joinha()` · `acenar()` · `bocejar()` · `pensar()` · `comemorar()` · `surpresa()` · `tonto()` · `rodar()` (corpo inteiro atravessando o palco) · `alerta(true|false)` · `dormir()` / `acordar()` · `falar(segundos)` · `olhar(x, y)` · `expressao(nome)`

## Quando fica vermelho no painel

Só nas telas de indicador (clima, mercado, comparativo, rota), quando a fala da tela vem em tom de alerta:

- chuva ≥ 60% hoje em Passo Fundo;
- dólar subindo ≥ 0,5% no dia;
- soja em Chicago caindo ≥ 1% no dia;
- aviso do INMET na rota ou chuva forte prevista em alguma cidade do corredor.

Nos 6 primeiros segundos o alerta é forte (cabine vermelha pulsando, giroflex, faróis vermelho/âmbar, piscas). Depois fica calmo até a troca de tela.

## Regras de uso

- Padrão sempre feliz; vermelho só para alerta real de indicador.
- Não distorcer, recolorir nem trocar o logo Be8 (o símbolo usado é o do arquivo oficial `be8-logo.svg`).
- Sem emblema do fabricante do caminhão; placa com o nome "BETRUCK".
- Fumaça do escapamento é nuvem clara com folhas (biocombustível).

Desenvolvido por Lucas L. Diogo para a Be8 — 2026
