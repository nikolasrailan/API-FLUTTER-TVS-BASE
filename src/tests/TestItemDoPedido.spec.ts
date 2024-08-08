const request = require("supertest");
import * as server from "../server";
import { app } from "../server"; // Certifique-se de que o caminho está correto
import { Request, Response } from "express";
import { Cliente } from "../models/Cliente";
import { Produto } from "../models/Produto";
import { Pedido } from "../models/Pedido";
import { ItemDoPedido } from "../models/ItemDoPedido";
import { idText } from "typescript";

describe("Teste da Rota incluirItemDoPedido", () => {
  let itemPedidoId: number;

  it("Deve incluir um novo itemDoPedido com sucesso", async () => {
    const novoItemDoPedido = {
      id_pedido: 3,
      id_produto: 2,
      qtdade: 3,
    };

    const response = await request(app).post("/incluirItemDoPedido").send(novoItemDoPedido);
    

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body.id_pedido).toBe(novoItemDoPedido.id_pedido);
    expect(response.body.id_produto).toBe(novoItemDoPedido.id_produto);
    expect(response.body.qtdade).toBe(novoItemDoPedido.qtdade);

    itemPedidoId = response.body.id; // Armazena o ID do cliente recém-criado para limpeza posterior
  });

  afterAll(async () => {
    // Remove o cliente criado no teste
    if (itemPedidoId) {
      await ItemDoPedido.destroy({ where: { id: itemPedidoId } });
    }
  });
 });

describe("Teste da Rota getItemDoPedidoById", () => {
  it("Deve retornar o item do pedido correto quando o id é valido", async () => {
    const idItemDoPedido = 2; // Supondo que este seja um Id válido existente no seu banco de dados
    const response = await request(app).get(`/itensDoPedido/${idItemDoPedido}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("id", idItemDoPedido);
  });

  it("Deve retornar um status 404 quando o Id do item do pedido nao existe", async () => {
    const idItemDoPedido = 999;

    const response = await request(app).get(`/itensDoPedido/${idItemDoPedido}`);

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("message", "Item do Pedido não encontrado");
  });
});

describe("Teste da Rota listarItensDoPedido", () => {
  it("Deve retornar uma lista de ItensDoPedido", async () => {
    const response = await request(app).get("/itensDoPedido");

    expect(response.status).toBe(200);
    expect(response.body.itensDoPedido).toBeInstanceOf(Array);
  });

  it("Deve retornar a lista de itensDoPedido dentro de um tempo aceitavel", async () => {
    const start = Date.now();
    const response = await request(app).get("/itensDoPedido");
    const duration = Date.now() - start;

    expect(response.status).toBe(200);
    expect(duration).toBeLessThan(100); // Verifica se a resposta é retornada em menos de 500ms
  });
});

// describe("Teste da Rota excluirCliente", () => {
//   beforeAll(async () => {
//     // Cria um cliente com um ID único para o teste de exclusão
//     await Cliente.create({ id: 99, nome: "Teste", sobrenome: "Cliente", cpf: "00000000000" });
//     // Adicione lógica para garantir que não há pedidos vinculados, se necessário
//   });

//   afterAll(async () => {
//     // Limpa o banco de dados após os testes
//     await Cliente.destroy({ where: { id: 99 } });
//   });

//   it("Deve excluir um cliente existente", async () => {
//     // Faz a requisição para excluir o cliente com ID 99
//     const response = await request(app).delete("/excluirCliente/99");

//     // Verifica se a resposta da API está correta
//     expect(response.status).toBe(200);
//     expect(response.body).toHaveProperty("message", "Cliente excluído com sucesso");

//     // Verifica se o cliente foi realmente excluído
//     const clienteExcluido = await Cliente.findByPk(99);
//     expect(clienteExcluido).toBeNull(); // Deve retornar null se o cliente foi excluído
//   });
// });

// describe("Teste da Rota atualizarCliente", () => {
//   let clienteId: number;
//   let clienteExistenteId: number;

//   beforeAll(async () => {
//     // Cria um cliente para testes
//     const cliente = await Cliente.create({
//       nome: "Cliente",
//       sobrenome: "Existente",
//       cpf: "12345678900"
//     });
//     clienteExistenteId = cliente.id;

//     // Cria outro cliente para ser atualizado
//     const clienteParaAtualizar = await Cliente.create({
//       nome: "Cliente",
//       sobrenome: "Para Atualizar",
//       cpf: "09876543211"
//     });
//     clienteId = clienteParaAtualizar.id;
//   });

//   it("Deve atualizar um cliente com sucesso", async () => {
//     const clienteAtualizado = {
//       nome: "Cliente Atualizado",
//       sobrenome: "Sobrenome Atualizado",
//       cpf: "09876543211"
//     };

//     const response = await request(app).put(`/atualizarCliente/${clienteId}`).send(clienteAtualizado);

//     expect(response.status).toBe(200);
//     expect(response.body.nome).toBe(clienteAtualizado.nome);
//     expect(response.body.sobrenome).toBe(clienteAtualizado.sobrenome);
//     expect(response.body.cpf).toBe(clienteAtualizado.cpf);
//   });

//   it("Deve retornar erro ao tentar atualizar cliente com CPF já existente", async () => {
//     const clienteAtualizado = {
//       nome: "Novo Nome",
//       sobrenome: "Novo Sobrenome",
//       cpf: "12345678900" // CPF já usado por clienteExistenteId
//     };

//     const response = await request(app).put(`/atualizarCliente/${clienteId}`).send(clienteAtualizado);

//     expect(response.status).toBe(400);
//     expect(response.body).toHaveProperty("message", "CPF já está sendo usado por outro cliente");
//   });

//   it("Deve retornar erro ao tentar atualizar cliente inexistente", async () => {
//     const clienteInexistenteId = 999999;
//     const clienteAtualizado = {
//       nome: "Nome",
//       sobrenome: "Sobrenome",
//       cpf: "00000000000"
//     };

//     const response = await request(app).put(`/atualizarCliente/${clienteInexistenteId}`).send(clienteAtualizado);

//     expect(response.status).toBe(404);
//     expect(response.body).toHaveProperty("message", "Cliente não encontrado");
//   });

//   afterAll(async () => {
//     // Limpeza dos clientes criados
//     await Cliente.destroy({ where: { id: [clienteId, clienteExistenteId] } });
//   });
// });
