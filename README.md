# Cardápio digital — Lanche do Tio

Site estático feito com HTML, CSS e JavaScript puro. Não precisa de servidor, banco de dados, mensalidade ou dependências. O pedido é montado no navegador e enviado pelo cliente ao WhatsApp da lanchonete.

## Arquivos

- `index.html`: estrutura da página e formulário do pedido.
- `styles.css`: layout responsivo, com prioridade para celular.
- `cardapio.js`: dados que o responsável pela lanchonete pode editar.
- `app.js`: filtros, carrinho, validação, armazenamento local e integração com WhatsApp.

## Como testar

Abra `index.html` em um navegador. Para testar o envio, primeiro troque o telefone fictício em `cardapio.js` pelo número real. O WhatsApp será aberto com uma mensagem pronta; o cliente ainda precisa confirmar o envio.

## Publicar grátis no Netlify

1. Em `cardapio.js`, configure o número do WhatsApp real com código do país e DDD, somente dígitos. Exemplo de formato: `5511987654321`.
2. Acesse [netlify.com](https://www.netlify.com/) e crie uma conta gratuita.
3. No painel do Netlify, escolha **Add new site** e depois **Deploy manually** (ou arraste a pasta do projeto para a área de deploy indicada).
4. Envie a pasta que contém `index.html`, `styles.css`, `app.js` e `cardapio.js` — não apenas o arquivo HTML.
5. O Netlify publicará o site e fornecerá um link. Você pode personalizar o subdomínio nas configurações do site.

O projeto não tem etapa de build: deixe o comando de build vazio e publique a pasta raiz do projeto. Se conectar a um repositório Git, cada atualização enviada ao repositório será publicada automaticamente.

## Como trocar preços ou marcar esgotado

Abra `cardapio.js` em um editor de texto simples e localize o produto pela propriedade `nome` ou `id`.

- **Trocar preço:** edite `preco`, usando ponto para centavos. Exemplo: `preco: 27.5`.
- **Marcar como esgotado:** altere para `esgotado: true`. O produto continuará visível, mas não poderá ser adicionado.
- **Disponibilizar novamente:** altere para `esgotado: false`.
- **Trocar telefone ou nome da loja:** edite `loja.whatsapp` ou `loja.nome` no começo do arquivo.
- **Adicionar produto:** copie um bloco de produto e troque o `id` por um valor exclusivo. Use o `id` de uma categoria existente em `categoria` (`lanches`, `porcoes` ou `bebidas`).
- **Classificar um lanche:** inclua `subcategoria` no produto com um destes valores: `hamburguer`, `contra-file`, `frango`, `sem-carne` ou `omeletes`. Lanches sem essa propriedade aparecem em **Todos os lanches**, mas não nas subabas específicas.

No pedido, o cliente escolhe **Retirada no local** ou **Entrega**. Ao escolher entrega, informa o CEP e o site consulta o ViaCEP para preencher os campos **Rua**, **Bairro** e **Cidade** (com UF). O cliente informa o **Número**; os quatro campos podem ser editados e são obrigatórios para entrega. Se a consulta falhar, podem ser preenchidos manualmente. Na retirada, CEP e endereço não são exigidos nem enviados no pedido.

Depois de salvar, publique novamente (ou aguarde o deploy automático, se o site estiver conectado ao Git). O carrinho fica salvo no `localStorage` do navegador do cliente; os valores dos itens são recalculados usando os preços atuais do cardápio.

## Observações

- As fotos de exemplo são carregadas do Unsplash e podem ser substituídas pelos links das fotos dos produtos.
- O site não calcula taxa de entrega e não processa pagamentos. O cliente e a lanchonete combinam esses detalhes pelo WhatsApp.
- A consulta de CEP usa a API pública do ViaCEP e requer conexão com a internet.
- O carrinho fica salvo no mesmo navegador e aparelho; ele não é sincronizado entre dispositivos.
