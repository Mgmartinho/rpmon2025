const KNOWN_DB_KEYWORDS = [
  "sql",
  "mysql",
  "database",
  "db",
  "constraint",
  "duplicate",
  "foreign key",
  "deadlock",
  "lock wait",
  "er_dup",
];

const KNOWN_VALIDATION_KEYWORDS = [
  "campo",
  "obrigat",
  "invalid",
  "inválid",
  "required",
  "validation",
  "formato",
  "preencha",
  "falt",
];

const KNOWN_AUTH_KEYWORDS = [
  "401",
  "403",
  "token",
  "sess",
  "não autoriz",
  "nao autoriz",
  "permiss",
  "senha",
  "unauthorized",
  "forbidden",
];

const normalize = (value) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const includesAny = (text, terms) => terms.some((term) => text.includes(term));

export const classifyError = ({ message = "", status, code = "" }) => {
  const text = normalize(`${message} ${code}`);

  if (status === 0 || text.includes("failed to fetch") || text.includes("network") || text.includes("conexao") || text.includes("conexão")) {
    return "communication";
  }

  if (status === 401 || status === 403 || includesAny(text, KNOWN_AUTH_KEYWORDS)) {
    return "auth";
  }

  if (status >= 400 && status < 500 && includesAny(text, KNOWN_VALIDATION_KEYWORDS)) {
    return "validation";
  }

  if (status >= 500 || includesAny(text, KNOWN_DB_KEYWORDS)) {
    return "database";
  }

  if (status >= 400 && status < 500) {
    return "request";
  }

  return "unknown";
};

export const extractApiErrorInfo = (errorOrResponse, fallbackMessage = "Erro inesperado") => {
  const response = errorOrResponse || {};
  const message =
    response.error ||
    response.erro ||
    response.message ||
    response.detail ||
    errorOrResponse?.message ||
    fallbackMessage;

  const status =
    Number(response.status) ||
    Number(response.statusCode) ||
    Number(response.httpStatus) ||
    (errorOrResponse?.name === "TypeError" ? 0 : undefined);

  const code = response.code || response.errorCode || "";

  const kind = classifyError({ message, status, code });

  const hints = {
    communication: "Falha de comunicação com a API. Verifique rede, URL da API e se o backend está ativo.",
    auth: "Falha de autenticação/autorização. Revise login, token e permissões do usuário.",
    validation: "Dados inválidos ou incompletos. Revise campos obrigatórios e formatos.",
    database: "Possível falha de banco de dados/consulta. Verifique constraints, conexão do banco e logs do backend.",
    request: "Requisição rejeitada pela API. Revise payload e regras de negócio.",
    unknown: "Falha não categorizada. Consulte console e logs do backend para mais detalhes.",
  };

  return {
    kind,
    message,
    status,
    code,
    hint: hints[kind],
  };
};

export const buildUserErrorMessage = (title, errorOrResponse, fallbackMessage) => {
  const info = extractApiErrorInfo(errorOrResponse, fallbackMessage);

  const lines = [
    title,
    "",
    `Categoria: ${info.kind}`,
    `Mensagem: ${info.message}`,
  ];

  if (info.status !== undefined) {
    lines.push(`HTTP: ${info.status}`);
  }

  if (info.code) {
    lines.push(`Codigo: ${info.code}`);
  }

  lines.push(`Diagnostico: ${info.hint}`);

  return lines.join("\n");
};
