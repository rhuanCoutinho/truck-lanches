/*
 * DADOS DO CARDÁPIO
 * Edite este arquivo para trocar o telefone, os produtos, as categorias e os preços.
 * O telefone deve conter código do país + DDD + número, somente com dígitos.
 */
window.CARDAPIO = {
  loja: {
    nome: "Truck lanches", // Nome da lanchonete.
    endereco: "Av. Cillos, 4064 - Parque Novo Mundo, Americana - SP", // Endereço da lanchonete.
    whatsapp: "19 99432-2905" // Exemplo fictício: substitua pelo WhatsApp da lanchonete.
  },

  categorias: [
    {
      id: "lanches",
      nome: "Lanches",
      subcategorias: [
        { id: "hamburguer", nome: "Lanches de Hambúrguer" },
        { id: "contra-file", nome: "Lanches de Contra-Filé" },
        { id: "frango", nome: "Lanches de Frango" },
        { id: "sem-carne", nome: "Lanches sem Carne" },
        { id: "omeletes", nome: "Omeletes" }
      ]
    },
    { id: "porcoes", nome: "Porções" },
    { id: "bebidas", nome: "Bebidas" }
  ],

  produtos: [
    {
      id: "x-burguer",
      categoria: "lanches",
      subcategoria: "hamburguer",
      nome: "X-Burguer da Casa",
      descricao: "Hambúrguer artesanal, queijo, alface, tomate e molho especial.",
      preco: 24.9,
      imagem: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80",
      esgotado: false
    },
    {
      id: "x-bacon",
      categoria: "lanches",
      subcategoria: "hamburguer",
      nome: "X-Bacon",
      descricao: "Hambúrguer, queijo derretido, bacon crocante e maionese da casa.",
      preco: 29.9,
      imagem: "https://images.unsplash.com/photo-1553979459-d2229ba7433a?auto=format&fit=crop&w=800&q=80",
      esgotado: false
    },
    {
      id: "hot-dog",
      categoria: "lanches",
      nome: "Hot Dog Completo",
      descricao: "Salsicha, molho, milho, batata palha, queijo e vinagrete.",
      preco: 18,
      imagem: "https://images.unsplash.com/photo-1612392062798-2dbaa9f8d7b0?auto=format&fit=crop&w=800&q=80",
      esgotado: true
    },
    {
      id: "batata-frita",
      categoria: "porcoes",
      nome: "Batata Frita",
      descricao: "Porção crocante de batata frita, perfeita para dividir.",
      preco: 22,
      imagem: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=800&q=80",
      esgotado: false
    },
    {
      id: "aneis-cebola",
      categoria: "porcoes",
      nome: "Anéis de Cebola",
      descricao: "Anéis empanados e douradinhos. Acompanha molho da casa.",
      preco: 25.5,
      imagem: "https://images.unsplash.com/photo-1639024471283-03518883512d?auto=format&fit=crop&w=800&q=80",
      esgotado: false
    },
    {
      id: "refrigerante-lata",
      categoria: "bebidas",
      nome: "Refrigerante Lata",
      descricao: "Lata de 350 ml. Consulte os sabores disponíveis pelo WhatsApp.",
      preco: 6,
      imagem: "https://images.unsplash.com/photo-1581636625402-29b2a704ef13?auto=format&fit=crop&w=800&q=80",
      esgotado: false
    },
    {
      id: "suco-laranja",
      categoria: "bebidas",
      nome: "Suco de Laranja",
      descricao: "Suco natural geladinho, copo de 300 ml.",
      preco: 9.5,
      imagem: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=800&q=80",
      esgotado: false
    }
  ]
};
