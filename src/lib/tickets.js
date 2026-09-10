import { carregarEstado, proximoProtocolo, salvarEstado } from "./store.js";

function agora() {
  return new Date().toISOString();
}

function novoHistorico(autor, tipo, texto) {
  return {
    id: `h-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    data: agora(),
    autorId: autor?.id ?? "sistema",
    autorNome: autor?.nome ?? "Sistema",
    tipo,
    texto,
  };
}

function persistirChamado(chamado) {
  const estado = carregarEstado();
  const indice = estado.chamados.findIndex((item) => item.id === chamado.id);
  if (indice >= 0) {
    estado.chamados[indice] = chamado;
  } else {
    estado.chamados.unshift(chamado);
  }
  salvarEstado(estado);
  return chamado;
}

export function listarUsuarios() {
  return carregarEstado().usuarios;
}

export function buscarUsuario(id) {
  return carregarEstado().usuarios.find((usuario) => usuario.id === id) ?? null;
}

export function listarAtendentes() {
  return carregarEstado().usuarios.filter(
    (usuario) => usuario.perfil === "atendente" && usuario.ativo
  );
}

export function listarChamados() {
  return carregarEstado().chamados;
}

export function buscarChamado(id) {
  return carregarEstado().chamados.find((chamado) => chamado.id === id) ?? null;
}

export function chamadosDoSolicitante(solicitanteId) {
  return listarChamados().filter((chamado) => chamado.solicitanteId === solicitanteId);
}

export function chamadosDoAtendente(atendenteId) {
  return listarChamados().filter((chamado) => chamado.atendenteId === atendenteId);
}

export function abrirChamado({ titulo, descricao, categoria, prioridade }, solicitante) {
  const tituloLimpo = titulo.trim();
  const descricaoLimpa = descricao.trim();

  if (!tituloLimpo) return { ok: false, erro: "Informe o título." };
  if (!descricaoLimpa) return { ok: false, erro: "Informe a descrição." };
  if (!categoria) return { ok: false, erro: "Escolha a categoria." };
  if (!prioridade) return { ok: false, erro: "Escolha a prioridade sugerida." };

  const estado = carregarEstado();
  const protocolo = proximoProtocolo(estado);
  const criadoEm = agora();

  const chamado = {
    id: protocolo,
    titulo: tituloLimpo,
    descricao: descricaoLimpa,
    categoria,
    prioridade,
    status: "aberta",
    solicitanteId: solicitante.id,
    atendenteId: null,
    solucao: "",
    criadoEm,
    atualizadoEm: criadoEm,
    historico: [
      novoHistorico(solicitante, "abertura", `Chamado aberto com prioridade sugerida ${prioridade}.`),
      novoHistorico(
        { id: "sistema", nome: "Serviço de e-mail" },
        "email",
        "Aviso de protocolo registrado (envio simulado)."
      ),
    ],
  };

  estado.chamados.unshift(chamado);
  estado.sequencia += 1;
  salvarEstado(estado);
  return { ok: true, chamado };
}

export function cancelarChamado(id, solicitante, motivo) {
  const chamado = buscarChamado(id);
  if (!chamado) return { ok: false, erro: "Chamado não encontrado." };
  if (chamado.solicitanteId !== solicitante.id) {
    return { ok: false, erro: "Você só pode cancelar os próprios chamados." };
  }
  if (chamado.status !== "aberta") {
    return { ok: false, erro: "Só é possível cancelar um chamado ainda aberto." };
  }
  if (!motivo.trim()) return { ok: false, erro: "Informe o motivo do cancelamento." };

  chamado.status = "cancelada";
  chamado.atualizadoEm = agora();
  chamado.historico.push(novoHistorico(solicitante, "cancelamento", `Cancelado pelo solicitante: ${motivo.trim()}`));
  persistirChamado(chamado);
  return { ok: true, chamado };
}

export function triarChamado(id, gestor, { categoria, prioridade, atendenteId, observacao }) {
  const chamado = buscarChamado(id);
  if (!chamado) return { ok: false, erro: "Chamado não encontrado." };
  if (chamado.status === "encerrada" || chamado.status === "cancelada") {
    return { ok: false, erro: "Chamado encerrado ou cancelado não pode ser triado." };
  }

  const atendente = atendenteId ? buscarUsuario(atendenteId) : null;
  const redistribuicao = Boolean(chamado.atendenteId && atendenteId && chamado.atendenteId !== atendenteId);

  chamado.categoria = categoria || chamado.categoria;
  chamado.prioridade = prioridade || chamado.prioridade;
  chamado.atualizadoEm = agora();

  if (atendente) {
    chamado.atendenteId = atendente.id;
    chamado.status = "em_andamento";
    const texto = redistribuicao
      ? `Chamado redistribuído para ${atendente.nome}. Prioridade: ${chamado.prioridade}.`
      : `Prioridade definida como ${chamado.prioridade} e atribuído a ${atendente.nome}.`;
    chamado.historico.push(novoHistorico(gestor, "triagem", texto));
  } else {
    chamado.historico.push(
      novoHistorico(
        gestor,
        "observacao",
        observacao.trim() || "Nenhum atendente disponível. Chamado permanece aberto."
      )
    );
  }

  persistirChamado(chamado);
  return { ok: true, chamado };
}

export function registrarAndamento(id, atendente, texto) {
  const chamado = buscarChamado(id);
  if (!chamado) return { ok: false, erro: "Chamado não encontrado." };
  if (chamado.status !== "em_andamento") {
    return { ok: false, erro: "Andamento só pode ser registrado em chamado em andamento." };
  }
  if (chamado.atendenteId !== atendente.id) {
    return { ok: false, erro: "Este chamado não está atribuído a você." };
  }
  if (!texto.trim()) return { ok: false, erro: "Informe o andamento." };

  chamado.atualizadoEm = agora();
  chamado.historico.push(novoHistorico(atendente, "andamento", texto.trim()));
  persistirChamado(chamado);
  return { ok: true, chamado };
}

export function registrarSolucao(id, atendente, solucao) {
  const chamado = buscarChamado(id);
  if (!chamado) return { ok: false, erro: "Chamado não encontrado." };
  if (chamado.status !== "em_andamento") {
    return { ok: false, erro: "A solução só pode ser registrada em chamado em andamento." };
  }
  if (chamado.atendenteId !== atendente.id) {
    return { ok: false, erro: "Este chamado não está atribuído a você." };
  }
  if (!solucao.trim()) return { ok: false, erro: "Informe a solução aplicada." };

  chamado.solucao = solucao.trim();
  chamado.atualizadoEm = agora();
  chamado.historico.push(novoHistorico(atendente, "solucao", solucao.trim()));
  persistirChamado(chamado);
  return { ok: true, chamado };
}

export function encerrarChamado(id, atendente, solucao) {
  const chamado = buscarChamado(id);
  if (!chamado) return { ok: false, erro: "Chamado não encontrado." };
  if (chamado.status !== "em_andamento") {
    return { ok: false, erro: "Só é possível encerrar chamado em andamento." };
  }
  if (chamado.atendenteId !== atendente.id) {
    return { ok: false, erro: "Este chamado não está atribuído a você." };
  }

  const textoSolucao = (solucao || chamado.solucao || "").trim();
  if (!textoSolucao) {
    return { ok: false, erro: "Registre a solução antes de encerrar." };
  }

  if (!chamado.solucao) {
    chamado.solucao = textoSolucao;
    chamado.historico.push(novoHistorico(atendente, "solucao", textoSolucao));
  }

  chamado.status = "encerrada";
  chamado.atualizadoEm = agora();
  chamado.historico.push(novoHistorico(atendente, "encerramento", "Chamado encerrado."));
  chamado.historico.push(
    novoHistorico(
      { id: "sistema", nome: "Serviço de e-mail" },
      "email",
      "Aviso de encerramento registrado (envio simulado)."
    )
  );

  persistirChamado(chamado);
  return { ok: true, chamado };
}

export function contarPorStatus(chamados) {
  return chamados.reduce(
    (acc, chamado) => {
      acc[chamado.status] = (acc[chamado.status] || 0) + 1;
      return acc;
    },
    { aberta: 0, em_andamento: 0, encerrada: 0, cancelada: 0 }
  );
}
