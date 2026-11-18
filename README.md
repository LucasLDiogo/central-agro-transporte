# Central Agro & Transporte — Be8

Painel para TV (1920 × 1080) com tempo em Passo Fundo, câmbio, soja, trigo, diesel, clima no corredor até Rio Grande e uma central de notícias de ANTT, frete, rotas, combustíveis, agro e biodiesel. O avatar do setor puxa cada tela, comenta os números e boceja quando fica muito tempo parado.

## Como abrir na TV

Abra o endereço do GitHub Pages no navegador da TV (ou de um computador ligado a ela) e aperte **F** ou dê dois cliques para tela cheia.

| Tecla | O que faz |
| --- | --- |
| ← → | troca de tela |
| 1 a 6 | vai direto para a tela |
| Espaço | pausa / continua |
| F | tela cheia |
| B / D | faz o BeTruck bocejar / dormir |
| C / E / L | mangote de BeVant / limpador / lava o para-brisa |
| V / J / P | some e volta com o frasco BeVant / joinha / pisca o farol |
| R | BeTruck atravessa a tela rodando (corpo inteiro) |
| A | liga / desliga o modo alerta (teste) |
| H | mostra a ajuda |

Parâmetros opcionais no endereço: `?tela=mercado` (começa nessa tela), `?seg=40` (segundos por tela), `?video=ID_DO_YOUTUBE` ou `?video=https://…/arquivo.mp4` (testa a tela de vídeo).

## O que dá para ajustar em `config.json`

- `videos`: lista de vídeos que entram na programação. Exemplos: `{ "titulo": "Institucional", "youtube": "ID_DO_VIDEO" }` ou `{ "titulo": "Treinamento", "src": "assets/videos/treinamento.mp4", "som": true }`. Com a lista vazia a tela de vídeo não aparece.
- `recados`: frases curtas que passam na faixa do rodapé.
- `rota`: cidades do corredor (nome, latitude, longitude). O nome precisa ser igual ao do INMET para os avisos aparecerem.
- `noticias`: assuntos e termos de busca da central de notícias.
- `telas.segundosPorTela` e `telas.ordem`: tempo e ordem das telas.
- `avatar.bocejaAposSeg` / `avatar.dormeAposSeg`: tempo até o avatar bocejar e, com o painel pausado, dormir.

## De onde vêm os dados

| Dado | Fonte | Atualização |
| --- | --- | --- |
| Tempo e chuva | Open-Meteo | direto no navegador, a cada 10 min |
| Dólar e euro (agora) | AwesomeAPI | direto no navegador, a cada 3 min |
| Dólar e euro (histórico) | Banco Central, PTAX | coletor |
| Soja e trigo no Brasil | CEPEA/ESALQ | coletor |
| Soja e trigo em Chicago | CBOT via Yahoo Finance | coletor |
| Diesel | Petrobras, via combustivelapi.com.br | coletor |
| Avisos meteorológicos | INMET | coletor |
| Notícias | Google Notícias (RSS) | coletor |

O coletor (`coletor/coletar.py`) roda no GitHub Actions a cada 20 minutos e publica `dados.json` no ramo `dados`. Se uma fonte falhar, o painel mantém o último valor bom. Nenhum número é inventado: quando não há dado, aparece "—".

## Avatar: BeTruck

O avatar é o **BeTruck**, o caminhão-tanque Be8 BeVant da frota, desenhado em SVG e animado em JavaScript puro (`assets/betruck/betruck.js`, sem dependências). Ele tem 19 expressões, fala sincronizando a boca (a grade) com o balão e faz gracinhas: limpador, lavar o vidro, mangote de BeVant na boca, sumir e voltar com o frasco BeVant, joinha, piscar o farol e atravessar a tela rodando de corpo inteiro.

**Alerta de indicador:** quando uma tela de indicador (clima, mercado, comparativo, rota) fala em tom de alerta, a cabine fica vermelha, sobe o giroflex e os faróis piscam alternados. Nos primeiros 6 s o alerta é forte e depois fica mais calmo, até a troca de tela. As regras de alerta ficam em `fala()` de cada tela no `app.js`: chuva ≥ 60%, dólar ≥ +0,5% no dia, soja em Chicago ≤ −1% no dia, aviso do INMET ou chuva forte na rota.

Os clipes MP4 antigos continuam em `assets/avatar/`, mas o painel não usa mais. Persona e bordões: `assets/betruck/PERSONA.md`. Estúdio para testar tudo: `assets/betruck/estudio.html`.

Desenvolvido por Lucas L. Diogo para a Be8 — 2026
