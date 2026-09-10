import { sha256 } from "./hash.js";
import { carregarEstado, salvarEstado } from "./store.js";

const ERRO_GENERICO = "E-mail ou senha inválidos.";
const ERRO_INATIVO = "Este cadastro está inativo. Procure a TI da organização.";

export async function autenticar(email, senha) {
  const estado = carregarEstado();
  const usuario = estado.usuarios.find(
    (item) => item.email.toLowerCase() === email.trim().toLowerCase()
  );

  if (!usuario) {
    return { ok: false, erro: ERRO_GENERICO };
  }

  const hash = await sha256(senha);
  if (hash !== usuario.senhaHash) {
    return { ok: false, erro: ERRO_GENERICO };
  }

  if (!usuario.ativo) {
    return { ok: false, erro: ERRO_INATIVO };
  }

  const sessao = {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    perfil: usuario.perfil,
  };

  estado.sessao = sessao;
  salvarEstado(estado);
  return { ok: true, sessao };
}

export function encerrarSessao() {
  const estado = carregarEstado();
  estado.sessao = null;
  salvarEstado(estado);
}

export function obterSessao() {
  return carregarEstado().sessao;
}

export function rotaInicial(perfil) {
  if (perfil === "gestor") return "/gestor";
  if (perfil === "atendente") return "/atendente";
  return "/solicitante";
}
