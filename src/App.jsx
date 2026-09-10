import { useEffect, useState } from "react";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Solicitante from "./pages/Solicitante";
import NovaSolicitacao from "./pages/NovaSolicitacao";
import Gestor from "./pages/Gestor";
import Atendente from "./pages/Atendente";
import TicketDetalhe from "./pages/TicketDetalhe";
import { obterSessao, rotaInicial } from "./lib/auth";
import { irPara } from "./lib/format";

function lerRota() {
  const bruto = window.location.hash.replace(/^#/, "") || "/";
  return bruto.startsWith("/") ? bruto : `/${bruto}`;
}

export default function App() {
  const [rota, setRota] = useState(lerRota);
  const [sessao, setSessao] = useState(obterSessao);

  useEffect(() => {
    const aoMudar = () => {
      setRota(lerRota());
      setSessao(obterSessao());
    };
    window.addEventListener("hashchange", aoMudar);
    return () => window.removeEventListener("hashchange", aoMudar);
  }, []);

  useEffect(() => {
    if (!sessao && rota !== "/login") {
      irPara("/login");
      return;
    }
    if (sessao && (rota === "/" || rota === "/login")) {
      irPara(rotaInicial(sessao.perfil));
    }
  }, [rota, sessao]);

  if (!sessao || rota === "/login") {
    return <Login />;
  }

  const partes = rota.split("/").filter(Boolean);
  let conteudo = null;

  if (sessao.perfil === "solicitante" && partes[0] === "solicitante" && partes[1] === "nova") {
    conteudo = <NovaSolicitacao sessao={sessao} />;
  } else if (sessao.perfil === "solicitante" && partes[0] === "solicitante") {
    conteudo = <Solicitante sessao={sessao} />;
  } else if (sessao.perfil === "gestor" && partes[0] === "gestor") {
    conteudo = <Gestor />;
  } else if (sessao.perfil === "atendente" && partes[0] === "atendente") {
    conteudo = <Atendente sessao={sessao} />;
  } else if (partes[0] === "chamado" && partes[1]) {
    conteudo = <TicketDetalhe key={partes[1]} sessao={sessao} protocolo={partes[1]} />;
  } else {
    irPara(rotaInicial(sessao.perfil));
    conteudo = <p>Redirecionando...</p>;
  }

  return <Layout sessao={sessao}>{conteudo}</Layout>;
}
