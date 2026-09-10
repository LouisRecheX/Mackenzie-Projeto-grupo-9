import { PRIORIDADES, STATUS } from "../data/constants.js";

export function formatarData(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function rotuloStatus(status) {
  return STATUS[status] ?? status;
}

export function rotuloPrioridade(prioridade) {
  return PRIORIDADES[prioridade] ?? prioridade;
}

export function mesmoMes(iso, referencia = new Date()) {
  const data = new Date(iso);
  return (
    data.getMonth() === referencia.getMonth() &&
    data.getFullYear() === referencia.getFullYear()
  );
}

export function irPara(caminho) {
  window.location.hash = caminho.startsWith("#") ? caminho : `#${caminho}`;
}
