import { criarChamadosIniciais, criarUsuariosIniciais } from "../data/seed.js";

const CHAVE = "atendefacil-v1";

function estadoVazio() {
  return {
    usuarios: criarUsuariosIniciais(),
    chamados: criarChamadosIniciais(),
    sequencia: 19,
    sessao: null,
  };
}

export function carregarEstado() {
  try {
    const bruto = localStorage.getItem(CHAVE);
    if (!bruto) {
      const inicial = estadoVazio();
      salvarEstado(inicial);
      return inicial;
    }
    const lido = JSON.parse(bruto);
    if (!Array.isArray(lido.usuarios) || !Array.isArray(lido.chamados)) {
      throw new Error("estado inválido");
    }
    return lido;
  } catch {
    const inicial = estadoVazio();
    salvarEstado(inicial);
    return inicial;
  }
}

export function salvarEstado(estado) {
  localStorage.setItem(CHAVE, JSON.stringify(estado));
}

export function restaurarDadosDemo() {
  const inicial = estadoVazio();
  salvarEstado(inicial);
  return inicial;
}

export function proximoProtocolo(estado) {
  const numero = String(estado.sequencia).padStart(5, "0");
  return `AF-2026-${numero}`;
}
