(() => {
  "use strict";

  const dados = window.CARDAPIO;
  const STORAGE_KEY = "lanche-do-tio-carrinho-v1";
  const MAX_QUANTIDADE = 99;
  const moeda = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  });

  const elementos = {
    nomeLoja: document.querySelector("#nome-loja"),
    categorias: document.querySelector("#categorias"),
    subcategorias: document.querySelector("#subcategorias"),
    produtos: document.querySelector("#produtos"),
    itensCarrinho: document.querySelector("#itens-carrinho"),
    contadorCarrinho: document.querySelector("#contador-carrinho"),
    sacolaFlutuante: document.querySelector("#sacola-flutuante"),
    sacolaFlutuanteContagem: document.querySelector("#sacola-flutuante-contagem"),
    sacolaFlutuanteSubtotal: document.querySelector("#sacola-flutuante-subtotal"),
    subtotal: document.querySelector("#subtotal"),
    formulario: document.querySelector("#formulario-pedido"),
    camposEntrega: document.querySelector("#campos-entrega"),
    cep: document.querySelector("#cep-cliente"),
    statusCep: document.querySelector("#status-cep"),
    rua: document.querySelector("#rua-cliente"),
    numero: document.querySelector("#numero-cliente"),
    bairro: document.querySelector("#bairro-cliente"),
    cidade: document.querySelector("#cidade-cliente"),
    finalizar: document.querySelector("#finalizar-pedido"),
    mensagemConfiguracao: document.querySelector("#mensagem-configuracao"),
    anuncio: document.querySelector("#anuncio")
  };

  let categoriaAtiva = "todos";
  let subcategoriaAtiva = "todos";
  let cepConsultado = "";
  let consultaCepController = null;
  let consultaCepPendente = false;
  let carrinho = carregarCarrinho();

  function escaparHTML(valor) {
    return String(valor).replace(/[&<>"']/g, (caractere) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[caractere]);
  }

  function carregarCarrinho() {
    try {
      const salvo = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      if (!salvo || typeof salvo !== "object" || Array.isArray(salvo)) return {};

      const idsValidos = new Set((dados?.produtos || []).map((produto) => produto.id));
      return Object.fromEntries(
        Object.entries(salvo).filter(([id, quantidade]) =>
          idsValidos.has(id) && Number.isInteger(quantidade) && quantidade > 0
        ).map(([id, quantidade]) => [id, Math.min(quantidade, MAX_QUANTIDADE)])
      );
    } catch {
      // Se o navegador bloquear o armazenamento ou os dados estiverem inválidos, começa vazio.
      return {};
    }
  }

  function salvarCarrinho() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(carrinho));
    } catch {
      // O site continua utilizável mesmo se o armazenamento local estiver indisponível.
    }
  }

  function obterProdutosNoCarrinho() {
    return Object.entries(carrinho)
      .map(([id, quantidade]) => {
        const produto = dados.produtos.find((item) => item.id === id);
        return produto ? { produto, quantidade } : null;
      })
      .filter(Boolean);
  }

  function obterSubtotal() {
    return obterProdutosNoCarrinho().reduce(
      (total, item) => total + item.produto.preco * item.quantidade,
      0
    );
  }

  function anunciar(texto) {
    elementos.anuncio.textContent = "";
    window.setTimeout(() => {
      elementos.anuncio.textContent = texto;
    }, 30);
  }

  function sincronizarCamposEntrega() {
    const recebimento = elementos.formulario.querySelector('input[name="recebimento"]:checked')?.value;
    const precisaEntrega = recebimento === "Entrega";

    elementos.camposEntrega.hidden = !precisaEntrega;
    elementos.cep.required = precisaEntrega;
    elementos.cep.setCustomValidity("");
    [elementos.rua, elementos.numero, elementos.bairro, elementos.cidade].forEach((campo) => {
      campo.required = precisaEntrega;
      campo.setCustomValidity("");
    });
  }

  async function buscarEnderecoPorCep(cep) {
    consultaCepController?.abort();
    const controller = new AbortController();
    consultaCepController = controller;
    consultaCepPendente = true;
    [elementos.rua, elementos.bairro, elementos.cidade].forEach((campo) => {
      campo.readOnly = true;
      campo.value = "";
    });
    elementos.statusCep.textContent = "Consultando CEP…";

    try {
      const resposta = await fetch(`https://viacep.com.br/ws/${cep}/json/`, {
        signal: controller.signal
      });
      if (!resposta.ok) throw new Error("Falha na consulta do CEP.");

      const dadosCep = await resposta.json();
      if (controller.signal.aborted || cepConsultado !== cep) return;
      if (dadosCep.erro) throw new Error("CEP não encontrado.");

      elementos.rua.value = dadosCep.logradouro || "";
      elementos.bairro.value = dadosCep.bairro || "";
      elementos.cidade.value = [dadosCep.localidade, dadosCep.uf].filter(Boolean).join(" - ");
      if (!elementos.rua.value && !elementos.bairro.value && !elementos.cidade.value) {
        throw new Error("Endereço não encontrado.");
      }
      elementos.statusCep.textContent = "Rua, bairro e cidade preenchidos. Informe o número e confira os dados.";
    } catch (erro) {
      if (erro.name !== "AbortError" && cepConsultado === cep) {
        elementos.statusCep.textContent = "Não foi possível localizar esse CEP. Confira-o ou preencha o endereço manualmente.";
      }
    } finally {
      if (consultaCepController === controller) {
        consultaCepPendente = false;
        [elementos.rua, elementos.bairro, elementos.cidade].forEach((campo) => {
          campo.readOnly = false;
        });
        consultaCepController = null;
      }
    }
  }

  function tratarEntradaCep() {
    const digitos = elementos.cep.value.replace(/\D/g, "").slice(0, 8);
    elementos.cep.value = digitos.length > 5
      ? `${digitos.slice(0, 5)}-${digitos.slice(5)}`
      : digitos;

    if (cepConsultado && digitos !== cepConsultado) {
      consultaCepController?.abort();
      consultaCepController = null;
      consultaCepPendente = false;
      [elementos.rua, elementos.bairro, elementos.cidade].forEach((campo) => {
        campo.readOnly = false;
        campo.value = "";
      });
      cepConsultado = "";
    }

    elementos.cep.setCustomValidity("");
    if (digitos.length < 8) {
      elementos.statusCep.textContent = "Digite os 8 números do CEP para buscar o endereço.";
      return;
    }

    if (digitos !== cepConsultado) {
      cepConsultado = digitos;
      buscarEnderecoPorCep(digitos);
    }
  }

  function renderizarCategorias() {
    const categorias = [
      { id: "todos", nome: "Tudo" },
      ...dados.categorias
    ];

    elementos.categorias.innerHTML = categorias.map((categoria) => `
      <button
        class="botao-categoria ${categoria.id === categoriaAtiva ? "ativo" : ""}"
        type="button"
        data-categoria="${escaparHTML(categoria.id)}"
        aria-pressed="${categoria.id === categoriaAtiva}"
      >${escaparHTML(categoria.nome)}</button>
    `).join("");
  }

  function renderizarSubcategorias() {
    const categoriaLanches = dados.categorias.find((categoria) => categoria.id === "lanches");
    const subcategorias = categoriaLanches?.subcategorias || [];
    const mostrarSubcategorias = categoriaAtiva === "lanches" && subcategorias.length > 0;

    elementos.subcategorias.hidden = !mostrarSubcategorias;
    if (!mostrarSubcategorias) {
      elementos.subcategorias.innerHTML = "";
      return;
    }

    elementos.subcategorias.innerHTML = [
      { id: "todos", nome: "Todos os lanches" },
      ...subcategorias
    ].map((subcategoria) => `
      <button
        class="botao-subcategoria ${subcategoria.id === subcategoriaAtiva ? "ativo" : ""}"
        type="button"
        data-subcategoria="${escaparHTML(subcategoria.id)}"
        aria-pressed="${subcategoria.id === subcategoriaAtiva}"
      >${escaparHTML(subcategoria.nome)}</button>
    `).join("");
  }

  function renderizarProdutos() {
    const produtos = dados.produtos.filter((produto) =>
      (categoriaAtiva === "todos" || produto.categoria === categoriaAtiva) &&
      (categoriaAtiva !== "lanches" || subcategoriaAtiva === "todos" || produto.subcategoria === subcategoriaAtiva)
    );

    if (produtos.length === 0) {
      elementos.produtos.innerHTML = '<p class="estado-vazio">Nenhum produto nesta categoria.</p>';
      return;
    }

    elementos.produtos.innerHTML = produtos.map((produto) => `
      <article class="cartao-produto ${produto.esgotado ? "produto-esgotado" : ""}">
        <div class="foto-produto">
          <img src="${escaparHTML(produto.imagem)}" alt="${escaparHTML(produto.nome)}" loading="lazy" />
          <span class="foto-indisponivel" aria-hidden="true">🍔</span>
          ${produto.esgotado ? '<span class="selo-esgotado">Esgotado</span>' : ""}
        </div>
        <div class="detalhes-produto">
          <div class="nome-preco">
            <h3>${escaparHTML(produto.nome)}</h3>
            <strong>${moeda.format(produto.preco)}</strong>
          </div>
          <p>${escaparHTML(produto.descricao)}</p>
          <button
            class="botao-adicionar"
            type="button"
            data-adicionar="${escaparHTML(produto.id)}"
            ${produto.esgotado ? "disabled" : ""}
          >${produto.esgotado ? "Indisponível" : "+ Adicionar ao pedido"}</button>
        </div>
      </article>
    `).join("");

    // Mantém um espaço visual amigável quando uma foto externa não puder ser carregada.
    elementos.produtos.querySelectorAll(".foto-produto img").forEach((imagem) => {
      imagem.addEventListener("error", () => {
        imagem.hidden = true;
        imagem.nextElementSibling.hidden = false;
      }, { once: true });
    });
  }

  function renderizarCarrinho() {
    const itens = obterProdutosNoCarrinho();
    const quantidadeTotal = itens.reduce((total, item) => total + item.quantidade, 0);
    const temEsgotado = itens.some((item) => item.produto.esgotado);
    const subtotalAtual = moeda.format(obterSubtotal());

    elementos.contadorCarrinho.textContent = quantidadeTotal;
    elementos.contadorCarrinho.setAttribute("aria-label", `${quantidadeTotal} itens no pedido`);
    elementos.subtotal.textContent = subtotalAtual;
    elementos.sacolaFlutuante.hidden = itens.length === 0;
    elementos.sacolaFlutuanteContagem.textContent = `${quantidadeTotal} ${quantidadeTotal === 1 ? "item" : "itens"} na sacola`;
    elementos.sacolaFlutuanteSubtotal.textContent = subtotalAtual;
    elementos.sacolaFlutuante.setAttribute("aria-label", `Ver sacola com ${quantidadeTotal} ${quantidadeTotal === 1 ? "item" : "itens"}; subtotal ${subtotalAtual}`);
    document.body.classList.toggle("com-sacola-flutuante", itens.length > 0);
    elementos.finalizar.disabled = itens.length === 0 || temEsgotado;

    if (itens.length === 0) {
      elementos.itensCarrinho.innerHTML = `
        <div class="carrinho-vazio">
          <span aria-hidden="true">🥡</span>
          <p>Seu pedido ainda está vazio.</p>
          <a href="#titulo-cardapio">Escolher itens</a>
        </div>
      `;
    } else {
      elementos.itensCarrinho.innerHTML = itens.map(({ produto, quantidade }) => `
        <article class="item-carrinho">
          <div class="item-carrinho-info">
            <h3>${escaparHTML(produto.nome)}</h3>
            <p>${moeda.format(produto.preco * quantidade)}</p>
            ${produto.esgotado ? '<span class="aviso-item-esgotado">Agora esgotado — remova para continuar.</span>' : ""}
            <div class="controles-quantidade" aria-label="Quantidade de ${escaparHTML(produto.nome)}">
              <button type="button" data-acao="diminuir" data-id="${escaparHTML(produto.id)}" aria-label="Diminuir ${escaparHTML(produto.nome)}">−</button>
              <span aria-live="polite">${quantidade}</span>
              <button type="button" data-acao="aumentar" data-id="${escaparHTML(produto.id)}" aria-label="Aumentar ${escaparHTML(produto.nome)}" ${produto.esgotado || quantidade >= MAX_QUANTIDADE ? "disabled" : ""}>+</button>
            </div>
          </div>
          <button class="botao-remover" type="button" data-acao="remover" data-id="${escaparHTML(produto.id)}">Remover</button>
        </article>
      `).join("");
    }

    elementos.mensagemConfiguracao.hidden = true;
    salvarCarrinho();
  }

  elementos.categorias.addEventListener("click", (evento) => {
    const botao = evento.target.closest("button[data-categoria]");
    if (!botao) return;
    categoriaAtiva = botao.dataset.categoria;
    subcategoriaAtiva = "todos";
    renderizarCategorias();
    renderizarSubcategorias();
    renderizarProdutos();
  });

  elementos.subcategorias.addEventListener("click", (evento) => {
    const botao = evento.target.closest("button[data-subcategoria]");
    if (!botao) return;
    subcategoriaAtiva = botao.dataset.subcategoria;
    renderizarSubcategorias();
    renderizarProdutos();
  });

  elementos.produtos.addEventListener("click", (evento) => {
    const botao = evento.target.closest("button[data-adicionar]");
    if (!botao) return;

    const produto = dados.produtos.find((item) => item.id === botao.dataset.adicionar);
    if (!produto || produto.esgotado) return;

    carrinho[produto.id] = Math.min((carrinho[produto.id] || 0) + 1, MAX_QUANTIDADE);
    renderizarCarrinho();
    anunciar(`${produto.nome} adicionado ao pedido.`);
  });

  elementos.itensCarrinho.addEventListener("click", (evento) => {
    const botao = evento.target.closest("button[data-acao]");
    if (!botao) return;

    const { acao, id } = botao.dataset;
    if (acao === "remover" || (acao === "diminuir" && carrinho[id] <= 1)) {
      delete carrinho[id];
    } else if (acao === "diminuir") {
      carrinho[id] -= 1;
    } else if (acao === "aumentar") {
      const produto = dados.produtos.find((item) => item.id === id);
      if (produto && !produto.esgotado) {
        carrinho[id] = Math.min(carrinho[id] + 1, MAX_QUANTIDADE);
      }
    }
    renderizarCarrinho();
  });

  elementos.formulario.addEventListener("change", (evento) => {
    if (evento.target.name === "recebimento") sincronizarCamposEntrega();
  });

  elementos.cep.addEventListener("input", tratarEntradaCep);

  elementos.formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();
    const campoNome = elementos.formulario.elements.nome;
    const recebimentoSelecionado = elementos.formulario.querySelector('input[name="recebimento"]:checked')?.value;
    const precisaEntrega = recebimentoSelecionado === "Entrega";
    const digitosCep = elementos.cep.value.replace(/\D/g, "");

    campoNome.setCustomValidity(campoNome.value.trim() ? "" : "Informe seu nome.");
    [
      [elementos.rua, "Informe a rua."],
      [elementos.numero, "Informe o número ou escreva s/n."],
      [elementos.bairro, "Informe o bairro."],
      [elementos.cidade, "Informe a cidade."]
    ].forEach(([campo, mensagem]) => {
      campo.setCustomValidity(!precisaEntrega || campo.value.trim() ? "" : mensagem);
    });
    elementos.cep.setCustomValidity(!precisaEntrega
      ? ""
      : digitosCep.length !== 8
        ? "Informe um CEP válido com 8 números."
        : consultaCepPendente
          ? "Aguarde a consulta do CEP terminar."
          : "");
    if (!elementos.formulario.reportValidity()) return;

    const itens = obterProdutosNoCarrinho();
    if (itens.length === 0) return;

    if (itens.some((item) => item.produto.esgotado)) {
      elementos.mensagemConfiguracao.textContent = "Remova do pedido os itens que ficaram esgotados para continuar.";
      elementos.mensagemConfiguracao.hidden = false;
      return;
    }

    const telefone = String(dados?.loja?.whatsapp || "").replace(/\D/g, "");
    if (telefone.length < 10 || telefone.length > 15) {
      elementos.mensagemConfiguracao.textContent = "O WhatsApp da lanchonete ainda não foi configurado. Atualize o número em cardapio.js.";
      elementos.mensagemConfiguracao.hidden = false;
      return;
    }

    const formulario = new FormData(elementos.formulario);
    const nome = String(formulario.get("nome")).trim();
    const recebimento = String(formulario.get("recebimento"));
    const cep = recebimento === "Entrega" ? elementos.cep.value : "";
    const rua = recebimento === "Entrega" ? String(formulario.get("rua")).trim() : "";
    const numero = recebimento === "Entrega" ? String(formulario.get("numero")).trim() : "";
    const bairro = recebimento === "Entrega" ? String(formulario.get("bairro")).trim() : "";
    const cidade = recebimento === "Entrega" ? String(formulario.get("cidade")).trim() : "";
    const pagamento = String(formulario.get("pagamento"));
    const linhasItens = itens.map(({ produto, quantidade }) =>
      `• ${quantidade}x ${produto.nome} — ${moeda.format(produto.preco * quantidade)}`
    );
    const mensagem = [
     `*Nome:* ${nome}`,
      "",
      `*PEDIDO — ${dados.loja.nome}*`,
      "",
      "*Itens do pedido:*",
      ...linhasItens,
      "",
      `*Subtotal: ${moeda.format(obterSubtotal())}*`,
      `*Recebimento:* ${recebimento === "Retirada" ? "Retirada no local" : "Entrega"}`,
      ...(recebimento === "Entrega" ? [
        `*CEP:* ${cep}`,
        `*Rua:* ${rua}`,
        `*Número:* ${numero}`,
        `*Bairro:* ${bairro}`,
        `*Cidade:* ${cidade}`
      ] : []),
      `*Forma de pagamento:* ${pagamento}`,
      
    ].join("\n");

    const url = `https://wa.me/${19994268308}?text=${encodeURIComponent(`finalize seu pedido aqui: ${mensagem}`)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  });

  elementos.formulario.addEventListener("input", (evento) => {
    if (["nome", "rua", "numero", "bairro", "cidade"].includes(evento.target.name)) {
      evento.target.setCustomValidity("");
    }
  });

  if (!dados || !Array.isArray(dados.categorias) || !Array.isArray(dados.produtos)) {
    elementos.produtos.innerHTML = '<p class="estado-vazio">Não foi possível carregar o cardápio. Confira o arquivo cardapio.js.</p>';
    elementos.finalizar.disabled = true;
    return;
  }

  document.title = `Cardápio | ${dados.loja.nome}`;
  elementos.nomeLoja.textContent = dados.loja.nome;
  renderizarCategorias();
  renderizarSubcategorias();
  renderizarProdutos();
  renderizarCarrinho();
  sincronizarCamposEntrega();
})();
