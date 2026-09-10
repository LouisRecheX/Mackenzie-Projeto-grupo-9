import { useState } from "react";
import { CATEGORIAS, PRIORIDADES } from "../data/constants";
import {
  buscarChamado,
  buscarUsuario,
  cancelarChamado,
  encerrarChamado,
  listarAtendentes,
  registrarAndamento,
  registrarSolucao,
  triarChamado,
} from "../lib/tickets";
import { formatarData, irPara } from "../lib/format";
import { PriorityBadge, StatusBadge } from "../components/Badges";

export default function TicketDetalhe({ sessao, protocolo }) {
  const [, setTick] = useState(0);
  const chamado = buscarChamado(protocolo);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  const [motivo, setMotivo] = useState("");
  const [categoria, setCategoria] = useState(chamado?.categoria ?? "TI");
  const [prioridade, setPrioridade] = useState(chamado?.prioridade ?? "media");
  const [atendenteId, setAtendenteId] = useState(chamado?.atendenteId ?? "");
  const [observacao, setObservacao] = useState("");
  const [andamento, setAndamento] = useState("");
  const [solucao, setSolucao] = useState(chamado?.solucao ?? "");
  const [copiado, setCopiado] = useState(false);

  if (!chamado) {
    return (
      <div className="card card-pad">
        <p>Chamado não encontrado.</p>
        <button className="btn btn-ghost" type="button" onClick={() => irPara(`/${sessao.perfil}`)}>
          Voltar
        </button>
      </div>
    );
  }

  const solicitante = buscarUsuario(chamado.solicitanteId);
  const atendente = buscarUsuario(chamado.atendenteId);
  const atendentes = listarAtendentes();
  const visivel =
    sessao.perfil !== "solicitante" || chamado.solicitanteId === sessao.id;

  if (!visivel) {
    return <div className="card card-pad erro">Você só pode ver os próprios chamados.</div>;
  }

  function atualizar(resultado) {
    if (!resultado.ok) {
      setMensagem("");
      setErro(resultado.erro);
      return;
    }
    setErro("");
    setMensagem("Registro gravado. O histórico foi atualizado.");
    setTick((n) => n + 1);
  }

  return (
    <>
      <div className="page-head">
        <div>
          <div className="protocolo">
            {chamado.id}
            <button
              className="btn btn-ghost"
              type="button"
              style={{ marginLeft: 10, padding: "6px 10px" }}
              onClick={() => {
                navigator.clipboard.writeText(chamado.id);
                setCopiado(true);
                setTimeout(() => setCopiado(false), 1500);
              }}
            >
              {copiado ? "Copiado" : "Copiar protocolo"}
            </button>
          </div>
          <h1>{chamado.titulo}</h1>
          <p>{chamado.descricao}</p>
        </div>
        <button className="btn btn-ghost" type="button" onClick={() => irPara(`/${sessao.perfil}`)}>
          Voltar
        </button>
      </div>

      {erro ? <div className="erro">{erro}</div> : null}
      {mensagem ? <div className="ok">{mensagem}</div> : null}

      <div className="detail-grid">
        <section className="card card-pad">
          <div className="meta">
            <div><em>Status</em><StatusBadge status={chamado.status} /></div>
            <div><em>Prioridade</em><PriorityBadge prioridade={chamado.prioridade} /></div>
            <div><em>Categoria</em><strong>{chamado.categoria}</strong></div>
            <div><em>Aberto em</em><strong>{formatarData(chamado.criadoEm)}</strong></div>
            <div><em>Solicitante</em><strong>{solicitante?.nome ?? "—"}</strong></div>
            <div><em>Atendente</em><strong>{atendente?.nome ?? "Não atribuído"}</strong></div>
          </div>

          {chamado.solucao ? (
            <p><strong>Solução:</strong> {chamado.solucao}</p>
          ) : null}

          <h3>Histórico</h3>
          <ul className="timeline">
            {[...chamado.historico].reverse().map((item) => (
              <li key={item.id}>
                <time>{formatarData(item.data)} · {item.autorNome}</time>
                {item.texto}
              </li>
            ))}
          </ul>
        </section>

        <aside className="card card-pad">
          {sessao.perfil === "solicitante" && chamado.status === "aberta" && (
            <form onSubmit={(e) => { e.preventDefault(); atualizar(cancelarChamado(chamado.id, sessao, motivo)); }}>
              <h3>Cancelar solicitação</h3>
              <label className="field">
                <span>Motivo</span>
                <textarea className="textarea" value={motivo} onChange={(e) => setMotivo(e.target.value)} />
              </label>
              <button className="btn btn-danger" type="submit">Cancelar chamado</button>
            </form>
          )}

          {sessao.perfil === "gestor" && chamado.status !== "encerrada" && chamado.status !== "cancelada" && (
            <form onSubmit={(e) => {
              e.preventDefault();
              atualizar(triarChamado(chamado.id, sessao, { categoria, prioridade, atendenteId, observacao }));
            }}>
              <h3>Triagem e atribuição</h3>
              <label className="field">
                <span>Categoria</span>
                <select className="select" value={categoria} onChange={(e) => setCategoria(e.target.value)}>
                  {CATEGORIAS.map((item) => <option key={item}>{item}</option>)}
                </select>
              </label>
              <label className="field">
                <span>Prioridade</span>
                <select className="select" value={prioridade} onChange={(e) => setPrioridade(e.target.value)}>
                  {Object.entries(PRIORIDADES).map(([valor, rotulo]) => (
                    <option key={valor} value={valor}>{rotulo}</option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Atendente</span>
                <select className="select" value={atendenteId} onChange={(e) => setAtendenteId(e.target.value)}>
                  <option value="">Deixar sem atendente</option>
                  {atendentes.map((item) => <option key={item.id} value={item.id}>{item.nome}</option>)}
                </select>
              </label>
              <label className="field">
                <span>Observação <small>(se não houver atendente)</small></span>
                <textarea className="textarea" value={observacao} onChange={(e) => setObservacao(e.target.value)} />
              </label>
              <button className="btn btn-primary" type="submit">Salvar triagem</button>
            </form>
          )}

          {sessao.perfil === "atendente" && chamado.atendenteId === sessao.id && chamado.status === "em_andamento" && (
            <>
              <form onSubmit={(e) => {
                e.preventDefault();
                atualizar(registrarAndamento(chamado.id, sessao, andamento));
                if (andamento.trim()) setAndamento("");
              }}>
                <h3>Registrar andamento</h3>
                <label className="field">
                  <span>O que foi feito</span>
                  <textarea className="textarea" value={andamento} onChange={(e) => setAndamento(e.target.value)} />
                </label>
                <button className="btn btn-ghost" type="submit">Salvar andamento</button>
              </form>

              <form style={{ marginTop: 22 }} onSubmit={(e) => {
                e.preventDefault();
                const gravar = registrarSolucao(chamado.id, sessao, solucao);
                if (!gravar.ok) {
                  atualizar(gravar);
                  return;
                }
                atualizar(encerrarChamado(chamado.id, sessao, solucao));
              }}>
                <h3>Solução e encerramento</h3>
                <label className="field">
                  <span>Solução</span>
                  <textarea className="textarea" value={solucao} onChange={(e) => setSolucao(e.target.value)} />
                </label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button className="btn btn-ghost" type="button" onClick={() => atualizar(registrarSolucao(chamado.id, sessao, solucao))}>
                    Só registrar solução
                  </button>
                  <button className="btn btn-primary" type="submit">Encerrar chamado</button>
                </div>
              </form>
            </>
          )}

          {sessao.perfil === "solicitante" && chamado.status !== "aberta" && (
            <p className="foot-note">Este chamado já saiu da fila aberta. O histórico acima mostra o andamento.</p>
          )}
        </aside>
      </div>
    </>
  );
}
