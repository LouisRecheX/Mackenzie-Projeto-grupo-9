import { useState } from "react";
import { chamadosDoAtendente } from "../lib/tickets";
import { formatarData, irPara } from "../lib/format";
import { PriorityBadge, StatusBadge } from "../components/Badges";

export default function Atendente({ sessao }) {
  const [busca, setBusca] = useState("");
  const chamados = chamadosDoAtendente(sessao.id);
  const ativos = chamados.filter((item) => item.status === "em_andamento");
  const visiveis = chamados.filter((chamado) => {
    const texto = `${chamado.id} ${chamado.titulo}`.toLowerCase();
    return texto.includes(busca.trim().toLowerCase());
  });

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Meus atendimentos</h1>
          <p>Chamados atribuídos a você. Registre andamento, solução e encerramento.</p>
        </div>
      </div>

      <div className="grid-stats" style={{ gridTemplateColumns: "repeat(2, 1fr)" }}>
        <div className="stat"><em>Em andamento</em><strong>{ativos.length}</strong></div>
        <div className="stat"><em>Total atribuídos</em><strong>{chamados.length}</strong></div>
      </div>

      <div className="filters">
        <input className="input" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar por protocolo ou título" />
      </div>

      <div className="card table-wrap">
        {visiveis.length === 0 ? (
          <div className="empty">{chamados.length === 0 ? "Nenhum chamado atribuído no momento." : "Nenhum chamado neste filtro."}</div>
        ) : (
          <table className="data">
            <thead>
              <tr>
                <th>Protocolo</th>
                <th>Título</th>
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
