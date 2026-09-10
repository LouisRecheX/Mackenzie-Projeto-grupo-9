import { useState } from "react";
import { chamadosDoSolicitante, contarPorStatus } from "../lib/tickets";
import { formatarData, irPara } from "../lib/format";
import { PriorityBadge, StatusBadge } from "../components/Badges";

export default function Solicitante({ sessao }) {
  const [busca, setBusca] = useState("");
  const chamados = chamadosDoSolicitante(sessao.id);
  const totais = contarPorStatus(chamados);
  const visiveis = chamados.filter((chamado) => {
    const texto = `${chamado.id} ${chamado.titulo} ${chamado.categoria}`.toLowerCase();
    return texto.includes(busca.trim().toLowerCase());
  });

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Minhas solicitações</h1>
          <p>Acompanhe o status dos chamados que você abriu.</p>
        </div>
        <button className="btn btn-primary" type="button" onClick={() => irPara("/solicitante/nova")}>
          Nova solicitação
        </button>
      </div>

      <div className="grid-stats">
        <div className="stat"><em>Abertos</em><strong>{totais.aberta}</strong></div>
        <div className="stat"><em>Em andamento</em><strong>{totais.em_andamento}</strong></div>
        <div className="stat"><em>Encerrados</em><strong>{totais.encerrada}</strong></div>
        <div className="stat"><em>Cancelados</em><strong>{totais.cancelada}</strong></div>
      </div>

      <div className="filters">
        <input className="input" type="search" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar por protocolo, título ou categoria" aria-label="Buscar solicitações" />
      </div>

      <div className="card table-wrap">
        {visiveis.length === 0 ? (
          <div className="empty">{chamados.length === 0 ? "Você ainda não abriu nenhum chamado." : "Nenhum chamado neste filtro."}</div>
        ) : (
          <table className="data">
            <thead>
              <tr>
                <th>Protocolo</th>
                <th>Título</th>
                <th>Categoria</th>
                <th>Prioridade</th>
                <th>Status</th>
                <th>Atualizado</th>
              </tr>
            </thead>
            <tbody>
              {visiveis.map((chamado) => (
                <tr key={chamado.id} className="clickable" onClick={() => irPara(`/chamado/${chamado.id}`)}>
                  <td>{chamado.id}</td>
                  <td>{chamado.titulo}</td>
                  <td>{chamado.categoria}</td>
                  <td><PriorityBadge prioridade={chamado.prioridade} /></td>
                  <td><StatusBadge status={chamado.status} /></td>
                  <td>{formatarData(chamado.atualizadoEm)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
