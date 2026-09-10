import { webcrypto } from "node:crypto";

if (!globalThis.crypto) {
  globalThis.crypto = webcrypto;
}

const memoria = new Map();
globalThis.localStorage = {
  getItem: (chave) => (memoria.has(chave) ? memoria.get(chave) : null),
  setItem: (chave, valor) => memoria.set(chave, String(valor)),
  removeItem: (chave) => memoria.delete(chave),
};

const { autenticar } = await import("../src/lib/auth.js");
const {
  abrirChamado,
  cancelarChamado,
  encerrarChamado,
  registrarAndamento,
  registrarSolucao,
  triarChamado,
} = await import("../src/lib/tickets.js");

function falhar(condicao, mensagem) {
  if (!condicao) {
    throw new Error(mensagem);
  }
}

const solicitante = (await autenticar("ana.souza@mackenzie.br", "123456")).sessao;
const gestor = (await autenticar("carla.mendes@mackenzie.br", "123456")).sessao;
const atendente = (await autenticar("rafael.costa@mackenzie.br", "123456")).sessao;
const inativo = await autenticar("inativo@mackenzie.br", "123456");
const senhaErrada = await autenticar("ana.souza@mackenzie.br", "errada");

falhar(solicitante.perfil === "solicitante", "login solicitante");
falhar(gestor.perfil === "gestor", "login gestor");
falhar(atendente.perfil === "atendente", "login atendente");
falhar(!inativo.ok, "cadastro inativo deve recusar");
falhar(!senhaErrada.ok && senhaErrada.erro.includes("inválidos"), "erro genérico de senha");

const aberto = abrirChamado(
  { titulo: "Teste", descricao: "Descrição do teste", categoria: "TI", prioridade: "alta" },
  solicitante
);
falhar(aberto.ok && aberto.chamado.status === "aberta", "abrir chamado");

const semTitulo = abrirChamado(
  { titulo: "  ", descricao: "x", categoria: "TI", prioridade: "alta" },
  solicitante
);
falhar(!semTitulo.ok, "título obrigatório");

const triado = triarChamado(aberto.chamado.id, gestor, {
  categoria: "TI",
  prioridade: "urgente",
  atendenteId: atendente.id,
  observacao: "",
});
falhar(triado.ok && triado.chamado.status === "em_andamento", "triagem");

const andamento = registrarAndamento(aberto.chamado.id, atendente, "Visita técnica iniciada");
falhar(andamento.ok, "andamento");

const semSolucao = encerrarChamado(aberto.chamado.id, atendente, "");
falhar(!semSolucao.ok, "encerrar sem solução deve falhar");

const solucao = registrarSolucao(aberto.chamado.id, atendente, "Fonte trocada");
falhar(solucao.ok, "registrar solução");

const encerrado = encerrarChamado(aberto.chamado.id, atendente, "Fonte trocada");
falhar(encerrado.ok && encerrado.chamado.status === "encerrada", "encerrar");

const outro = abrirChamado(
  { titulo: "Cancelar", descricao: "Pedido duplicado", categoria: "Secretaria", prioridade: "baixa" },
  solicitante
);
const cancelado = cancelarChamado(outro.chamado.id, solicitante, "Abri duas vezes");
falhar(cancelado.ok && cancelado.chamado.status === "cancelada", "cancelar");

console.log("Regras do AtendeFácil conferidas.");
