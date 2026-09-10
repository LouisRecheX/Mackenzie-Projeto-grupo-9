import Brand from "./Brand";
import { encerrarSessao } from "../lib/auth";
import { restaurarDadosDemo } from "../lib/store";
import { irPara } from "../lib/format";
import { PERFIS } from "../data/constants";

export default function Layout({ sessao, children }) {
  function sair() {
    encerrarSessao();
    irPara("/login");
  }

  function restaurar() {
    if (window.confirm("Isso apaga os chamados desta sessão e recarrega os dados de demonstração.")) {
      restaurarDadosDemo();
      window.location.reload();
    }
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a href={`#/${sessao.perfil === "gestor" ? "gestor" : sessao.perfil === "atendente" ? "atendente" : "solicitante"}`}>
          <Brand />
        </a>
        <div className="top-actions">
          <div className="who">
            <strong>{sessao.nome}</strong>
            <span>{PERFIS[sessao.perfil]} · {sessao.email}</span>
          </div>
          <button className="btn btn-ghost" type="button" onClick={restaurar}>
            Restaurar demo
          </button>
          <button className="btn btn-forest" type="button" onClick={sair}>
            Sair
          </button>
        </div>
      </header>
      <main className="page">{children}</main>
    </div>
  );
}
