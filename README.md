# Cardápio digital — Truck Lanches

Site estático feito com HTML, CSS e JavaScript puro. Não precisa de servidor, banco de dados, mensalidade ou dependências. O pedido é montado no navegador e enviado pelo cliente ao WhatsApp da lanchonete.

deploy: trucklanches.netlify.app

## Arquivos

- `index.html`: estrutura da página e formulário do pedido.
- `styles.css`: layout responsivo, com prioridade para celular.
- `cardapio.js`: dados que o responsável pela lanchonete pode editar.
- `app.js`: filtros, carrinho, validação, armazenamento local e integração com WhatsApp.

No pedido, o cliente escolhe **Retirada no local** ou **Entrega**. Ao escolher entrega, informa o CEP e o site consulta o ViaCEP para preencher os campos **Rua**, **Bairro** e **Cidade** (com UF). O cliente informa o **Número**; os quatro campos podem ser editados e são obrigatórios para entrega. Se a consulta falhar, podem ser preenchidos manualmente. Na retirada, CEP e endereço não são exigidos nem enviados no pedido.

Depois de salvar, publique novamente (ou aguarde o deploy automático, se o site estiver conectado ao Git). O carrinho fica salvo no `localStorage` do navegador do cliente; os valores dos itens são recalculados usando os preços atuais do cardápio.

## Observações

- As fotos de exemplo são carregadas do Unsplash e podem ser substituídas pelos links das fotos dos produtos.
- O site não calcula taxa de entrega e não processa pagamentos. O cliente e a lanchonete combinam esses detalhes pelo WhatsApp.
- A consulta de CEP usa a API pública do ViaCEP e requer conexão com a internet.
- O carrinho fica salvo no mesmo navegador e aparelho; ele não é sincronizado entre dispositivos.
