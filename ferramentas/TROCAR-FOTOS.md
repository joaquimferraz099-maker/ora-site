# Trocar as fotos de IA pelas fotos reais das embalagens

As fotos de embalagem do site hoje são imagens de IA. Quando as fotos reais chegarem:

1. Salve cada foto nova em `assets/originais/` com o nome da tabela abaixo (JPG ou PNG, o maior tamanho possível).
2. Apague o arquivo antigo de mesmo nome em `assets/originais/`, se tiver outra extensão.
3. Rode `python3 ferramentas/imagens.py` (precisa do Pillow).
4. O script gera as versões leves (WebP de 1600 px e 800 px) e o site inteiro passa a usar a foto nova.

| Arquivo em assets/originais | O que mostra hoje (IA) | Onde aparece |
|---|---|---|
| `img__pacote-natural.png` | Pacote preto 500 g, Natural | Início, Nossos cafés, produto, sacola |
| `img__pacote-cereja.png` | Pacote preto 500 g, Cereja | Início, Nossos cafés, produto, sacola |
| `img__pacote250-cereja.png` | Pacote kraft 250 g | Produto (galeria do 250 g) |
| `img__kit-aberto.jpg` | Caixa aberta com café e caneca | Presentes (abertura), produto do kit |
| `img__p-cafe-caneca.jpg` | Kit café e caneca | Cartão do kit, produto |
| `img__p-caixa.jpg` | Caixa vazia (usada no kit com jarra) | Cartão do kit café e jarra |
| `img__p-kit-completo.jpg` | Kit completo | Cartão do kit, produto |
| `img__p-kit-vertical.jpg` | Kit, recorte vertical | Produto |
| `img__caixa-slogan.jpg` | Caixa com "todo momento tem sua ORA" | Início (Presentes), Presentes |
| `img__sacola.jpg` | Sacola kraft | Presentes |
| `img__cartao-frente.jpg` | Cartão ORA | Presentes, Nossa história |
| `img__drip.jpg` | Drip Coffee (foto de banco, sachê sem marca) | Início, Nossos cafés |

Os pacotes (`pacote-*.png`) devem ter fundo transparente, como os atuais, porque o site põe o fundo colorido por trás.
