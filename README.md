# Invicta Filmes

Site institucional da Invicta Filmes — produtora audiovisual de Fortaleza, CE.

## Estrutura

```
├── index.html            # Página inicial (hero, portfólio, serviços, clientes, sobre, contato)
├── catalogo.html         # Catálogo completo de produções com filtro por categoria
├── css/
│   ├── index.css         # Estilos da página inicial
│   └── catalogo.css      # Estilos do catálogo
├── js/
│   ├── index.js          # Portfólio em mosaico, marquee, lightbox e painel de edição
│   └── catalogo.js       # Grid do catálogo, filtros, lightbox e painel de edição
└── assets/
    └── brand/
        └── manual-da-marca.pdf   # Apresentação + Manual da Marca (ID Visual)
```

## Identidade visual

Paleta oficial extraída do manual da marca:

| Cor | Hex | Uso |
|---|---|---|
| Azul Invicta | `#0737e8` | Botões, destaques, hovers |
| Preto | `#000000` | Fundo principal |
| Cinza escuro | `#2b2b2b` | Painéis e superfícies |
| Cinza médio | `#5b5b5b` | Elementos secundários |
| Branco gelo | `#ededed` | Texto |

Tipografia: **Bebas Neue** (display) e **Inter** (corpo), via Google Fonts.

## Como usar

Site estático, sem build — basta abrir `index.html` no navegador ou hospedar
os arquivos em qualquer serviço estático (GitHub Pages, Vercel, Netlify).

Os vídeos do portfólio e do catálogo são editáveis direto no navegador pelo
botão "✎ Editar" (canto da tela); as alterações ficam salvas no
`localStorage` de quem edita.
