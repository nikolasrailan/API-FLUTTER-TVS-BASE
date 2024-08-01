const request = require("supertest");
import * as server from "../server";
import { app } from "../server"; // Certifique-se de que o caminho está correto
import { Request, Response } from "express";
import { Produto } from "../models/Produto";

describe("Teste da Rota incluirProduto", () => {
  let produtoId: number;

  it("Deve incluir um novo produto com sucesso", async () => {
    const novoProduto = {
      descricao: "Produto teste muito legal",
    };

    const response = await request(app).post("/incluirProduto").send(novoProduto);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body.descricao).toBe(novoProduto.descricao);

    produtoId = response.body.id; // Armazena o ID do cliente recém-criado para limpeza posterior
  });

  // it("Deve retornar erro ao tentar incluir um produto com descricao já existente", async () => {
  //   const produtoExistente = {
  //     descricao: "Produto teste muito legal",
  //   };

  //   // Tenta incluir um produto com descricao já existente
  //   const response = await request(app).post("/incluirProduto").send(produtoExistente);

  //   expect(response.status).toBe(400);
  //   expect(response.body).toHaveProperty("message", "descricao já cadastrado");
  // });

  // afterAll(async () => {
  //   // Remove o cliente criado no teste
  //   if (produtoId) {
  //     await Produto.destroy({ where: { id: produtoId } });
  //   }
  // });
});

describe("Teste da Rota getProdutoById", () => {
  it("Deve retornar o produto correto quando o id é valido", async () => {
    const idProduto = 1; // Supondo que este seja um Id válido existente no seu banco de dados
    const response = await request(app).get(`/produtos/${idProduto}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("id", idProduto);
  });

  it("Deve retornar um status 404 quando o Id do produto nao existe", async () => {
    const idProduto = 999;

    const response = await request(app).get(`/produtos/${idProduto}`);

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("message", "Produto não encontrado");
  });
});

describe("Teste da Rota listarProdutos", () => {
  it("Deve retornar uma lista de produtos", async () => {
    const response = await request(app).get("/produtos");

    expect(response.status).toBe(200);
    expect(response.body.produtos).toBeInstanceOf(Array);
  });

  it("Deve retornar a lista de produtos dentro de um tempo aceitavel", async () => {
    const start = Date.now();
    const response = await request(app).get("/produtos");
    const duration = Date.now() - start;

    expect(response.status).toBe(200);
    expect(duration).toBeLessThan(100); // Verifica se a resposta é retornada em menos de 500ms
  });
});

describe("Teste da Rota excluirProduto", () => {
  beforeAll(async () => {
    // Cria um produto com um ID único para o teste de exclusão
    await Produto.create({ id: 99, descricao: "Teste"});
    // Adicione lógica para garantir que não há pedidos vinculados, se necessário
  });

  afterAll(async () => {
    // Limpa o banco de dados após os testes
    await Produto.destroy({ where: { id: 99 } });
  });

  it("Deve excluir um produto existente", async () => {
    // Faz a requisição para excluir o produto com ID 99
    const response = await request(app).delete("/excluirProduto/99");

    // Verifica se a resposta da API está correta
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("message", "Produto excluído com sucesso");

    // Verifica se o cliente foi realmente excluído
    const produtoExcluido = await Produto.findByPk(99);
    expect(produtoExcluido).toBeNull(); // Deve retornar null se o cliente foi excluído
  });
});

describe("Teste da Rota atualizarCliente", () => {
  let produtoId: number;
  let produtoExistenteId: number;

  beforeAll(async () => {
    // Cria um cliente para testes
    const produto = await Produto.create({
      descricao: "atualizandooo",
    });
    produtoExistenteId = produto.id;

    // Cria outro cliente para ser atualizado
    const produtoParaAtualizar = await Produto.create({
      descricao: "produto para atualizar",
    });
    produtoId = produtoParaAtualizar.id;
  });

  it("Deve atualizar um produto com sucesso", async () => {
    const produtoAtualizado = {
      descricao: "produto Atualizado",
    };

    const response = await request(app).put(`/atualizarProduto/${produtoId}`).send(produtoAtualizado);

    expect(response.status).toBe(200);
    expect(response.body.descricao).toBe(produtoAtualizado.descricao);
  });

  // it("Deve retornar erro ao tentar atualizar cliente com CPF já existente", async () => {
  //   const clienteAtualizado = {
  //     nome: "Novo Nome",
  //     sobrenome: "Novo Sobrenome",
  //     cpf: "12345678900" // CPF já usado por clienteExistenteId
  //   };

  //   const response = await request(app).put(`/atualizarCliente/${clienteId}`).send(clienteAtualizado);

  //   expect(response.status).toBe(400);
  //   expect(response.body).toHaveProperty("message", "CPF já está sendo usado por outro cliente");
  // });

  it("Deve retornar erro ao tentar atualizar produto inexistente", async () => {
    const produtoInexistenteId = 999999;
    const produtoAtualizado = {
      descricao: "banana",
    };

    const response = await request(app).put(`/atualizarProduto/${produtoInexistenteId}`).send(produtoAtualizado);

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("message", "Produto não encontrado");
  });

  afterAll(async () => {
    // Limpeza dos clientes criados
    await Produto.destroy({ where: { id: [produtoId, produtoExistenteId] } });
  });
});
