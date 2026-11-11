# KoncepT Barbearia — guia rápido do projeto

## Estrutura
- `index.html` — página única (início, A KoncepT, serviços, comodidades, galeria, equipe, localização/contato, agendamento, rodapé)
- `css/style.css` — estilos organizados por parte (1 a 9)
- `js/main.js` — interações (menu e destaque da seção atual, tela de carregamento, lightbox, atalhos flutuantes, cursor, mapa)
- `assets/` — imagens (fotos em WebP), vídeo do hero (WebM + MP4), ícones

## Como editar
- **Serviços**: em `index.html`, procure "COMO EDITAR OS SERVIÇOS". Cada categoria é um `<section class="svc-cat">` (acordeão: só uma abre por vez; nome em `.svc-cat-name`, quantidade em `.svc-cat-count`) e cada serviço um `<li class="svc-row">`
  (nome, duração, descrição opcional, preço e botão "Reservar" → Booksy). O comentário no código mostra os 3 formatos de preço.
- **Equipe**: bloco "COMO EDITAR A EQUIPE" (fotos em `assets/equipe/`, WebP + JPG de reserva, quadradas, rosto centralizado).
- **Galeria**: 9 fotos em `assets/galeria/`, mostradas inteiras (sem corte) em linhas de altura igual: 3×3 no desktop e faixas de 1 e 2 fotos no celular. Cada `<li class="g-item">` leva `--ar` (largura ÷ altura da foto); as quebras de linha são os `<li class="g-br">`. A ordem do HTML é a do lightbox.
- **Comodidades**: lista `.amen-list` (ícone + texto). Programa de fidelidade aparece sem detalhes de benefícios/regras.
- **Tela de carregamento**: duração em `DURATION` (1000 ms) no `js/main.js`.
- Contatos, endereço e links: procure por `wa.me`, `instagram.com`, `booksy.com` e `google.com/maps` em `index.html`.

## Ao publicar
- Informe o endereço final (domínio) para completar `og:image`, `twitter:image` (precisam de URL absoluta) e a tag `canonical`.

- **Rodapé / Voltech**: crédito em `.ft-credit`; para virar link do Instagram, siga o comentário no HTML.
