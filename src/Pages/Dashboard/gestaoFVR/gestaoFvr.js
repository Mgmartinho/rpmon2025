import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Table,
  Button,
  Badge,
  Card,
  Row,
  Col,
  Spinner,
  Form,
} from "react-bootstrap";

import {
  BsPlus,
  BsPencilSquare,
  BsTrash,
  BsClockHistory,
  BsClipboardCheck,
} from "react-icons/bs";

import "./styles.css";

import { FaUserDoctor } from "react-icons/fa6";
import { GiHorseHead } from "react-icons/gi";

const API_URL = "http://localhost:3000/solipedes";

const GestaoFvr = () => {
  const [dados, setDados] = useState([]);
  const [loading, setLoading] = useState(true);

  const ITEMS_PER_PAGE = 10;

  const [currentPage, setCurrentPage] = useState(1);

  // 🔹 BUSCA DADOS DO MYSQL
  useEffect(() => {
    const carregarDados = async () => {
      try {
        const response = await fetch(API_URL);
        const data = await response.json();
        setDados(data);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setLoading(false);
      }
    };

    carregarDados();
  }, []);

  // 🔹 INDICADORES
  const total = dados.length;
  const ativos = dados.filter((d) => d.status === "Ativo").length;
  const baixados = dados.filter((d) => d.status === "Baixado").length;
  const movimentacao = dados.filter(
    (d) => d.movimentacao !== null && d.movimentacao !== ""
  ).length;

  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" />
        <p>Carregando gestão veterinária...</p>
      </div>
    );
  }

  //Variaveis de Tarefas
  const statusVariant = {
    NEW: "info",
    INPROGRESS: "primary",
    PENDING: "warning",
    COMPLETED: "success",
  };

  const priorityVariant = {
    LOW: "success",
    MEDIUM: "warning",
    HIGH: "danger",
  };

  const totalTasks = dados.length;
  const totalPages = Math.ceil(totalTasks / ITEMS_PER_PAGE);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;

  const tarefasPaginadas = dados.slice(startIndex, endIndex);

  const temMovimentacao = dados.some(
    (item) => item.movimentacao !== null && item.movimentacao !== ""
  );

  return (
    <div className="container-fluid py-4 d-flex justify-content-center">
      <div className="">
        {/* ===================== */}
        {/* 🔹 GESTÃO DE TAREFAS */}
        {/* ===================== */}
        <Card className="shadow-sm mb-5">
          <Card.Body>
            <Row>
              {/* 🔹 COLUNA ESQUERDA (VAZIA / RESERVADA) */}
              <Col md={4} className="border-end">
                <h4 className="mb-1">Gestão de Tarefas</h4>
                <small className="text-muted">
                  Relação rápida de tarefas operacionais
                </small>

                {/* Indicadores */}
                <Row className="m-3 p-2">
                  <Col md={12}>
                    <Card className="text-center border-0 shadow-sm card-hover total p-2">
                      <Card.Body>
                        <small className="text-muted">Total</small>
                        <h4>{total}</h4>
                      </Card.Body>
                    </Card>
                  </Col>

                  <Col md={12}>
                    <Card className="mt-3 text-center border-start border-success border-4 shadow-sm card-hover success">
                      <Card.Body>
                        <small className="text-muted">Em progresso</small>
                        <h4 className="text-success">{ativos}</h4>
                      </Card.Body>
                    </Card>
                  </Col>

                  <Col md={12}>
                    <Card className="mt-3 text-center border-start border-danger border-4 shadow-sm card-hover danger">
                      <Card.Body>
                        <small className="text-muted">Medicação</small>
                        <h4 className="text-danger">{baixados}</h4>
                      </Card.Body>
                    </Card>
                  </Col>

                  <Col md={12}>
                    <Card className="mt-3 text-center border-start border-warning border-4 shadow-sm card-hover warning">
                      <Card.Body>
                        <small className="text-muted">Pendente</small>
                        <h4 className="text-warning">{ativos - baixados}</h4>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={12}>
                    <Card className="mt-3 text-center border-start border-primary border-1 shadow-lg card-hover warning">
                      <Card.Body>
                        <small className="text-muted">Completo</small>
                        <h4 className="text-warning">{ativos - baixados}</h4>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </Col>

              {/* 🔹 COLUNA DIREITA (TAREFAS) */}
              <Col md={8}>
                {/* Header */}
                <Row className="align-items-center mb-3">
                  <Col>
                    <h5 className="mb-0">All Tasks</h5>
                    <small className="text-muted">
                      Gestão rápida (últimas 10)
                    </small>
                  </Col>
                  <Col className="text-end">
                    <Link to="/dashboard/gestaofvr/taskcreatepage">
                      <Button>
                        <BsPlus /> Create
                      </Button>
                    </Link>
                  </Col>
                </Row>

                {/* Filtros */}
                <Row className="g-2 mb-3">
                  <Col md={4}>
                    <Form.Control size="sm" placeholder="Search tasks..." />
                  </Col>
                  <Col md={6}>
                    <Form.Select size="sm">
                      <option>All</option>
                      <option>New</option>
                      <option>In Progress</option>
                      <option>Pending</option>
                      <option>Completed</option>
                    </Form.Select>
                  </Col>
                </Row>

                {/* Tabela de tarefas */}
                <Table hover responsive size="sm" className="align-middle mb-0">
                  <thead className="table-light text-center">
                    <tr>
                      <th>
                        <GiHorseHead /> ID
                      </th>
                      <th>Tarefas</th>
                      <th>Data de criação</th>
                      <th>Status</th>
                      <th>Prioridade</th>
                      <th>Atribuição</th>
                    </tr>
                  </thead>

                  <tbody>
                    {tarefasPaginadas.map((tarefa) => {
                      const status = tarefa.status || "PENDING";
                      const prioridade = tarefa.prioridade || "MEDIUM";

                      return (
                        <tr key={tarefa.numero} className="align-middle">
                          {/* ID */}
                          <td className="fw-bold text-primary text-center">
                            {tarefa.numero}
                          </td>

                          {/* Tarefa */}
                          <td className="text-start">
                            <span className="fw-semibold">
                              {tarefa.titulo || "Tarefa a ser definida"}
                            </span>
                            <br />
                            <small className="text-muted">
                              Solípede: {tarefa.nome}
                            </small>
                          </td>

                          {/* Data */}
                          <td className="text-center">
                            {tarefa.DataNascimento || "—"}
                          </td>

                          {/* Status */}
                          <td className="text-center">
                            <Badge bg={statusVariant[status]}>{status}</Badge>
                          </td>

                          {/* Prioridade */}
                          <td className="text-center">
                            <Badge bg={priorityVariant[prioridade]}>
                              {prioridade}
                            </Badge>
                          </td>

                          {/* Responsável */}
                          <td className="text-start">
                            <FaUserDoctor className="me-2 text-primary" />
                            <span>{tarefa.responsavel || "Veterinária"}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
                {/* Paginação */}
                <div className="d-flex justify-content-between align-items-center mt-3">
                  <small className="text-muted">
                    Página {currentPage} de {totalPages}
                  </small>

                  <div>
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      className="me-2"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((prev) => prev - 1)}
                    >
                      Anterior
                    </Button>

                    <Button
                      variant="outline-secondary"
                      size="sm"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((prev) => prev + 1)}
                    >
                      Próximo
                    </Button>
                  </div>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* ================================= */}
        {/* 🔹 GESTÃO VETERINÁRIA – SOLÍPEDES */}
        {/* ================================= */}
        <Card className="shadow-sm">
          <Card.Body>
            <Col>
              <Row className="align-items-center">
                {/* TÍTULO */}
                <Col md={8}>
                  <h4 className="mb-1">
                    Gestão Veterinária de Solípedes (FVR)
                  </h4>
                  <small className="text-muted">
                    Controle operacional e histórico clínico
                  </small>
                </Col>

                {/* AÇÃO */}
                <Col md={4} className="text-end">
                  <Link to="/dashboard/gestaofvr/solipede/create">
                    <Button variant="primary" size="sm">
                      <BsPlus className="me-1" /> Criar novo Solípede
                    </Button>
                  </Link>
                </Col>
              </Row>
            </Col>

            {/* Indicadores */}
            <Row className="my-4">
              <Col md={3}>
                <Card className="text-center border-0 shadow-sm card-hover total p-2">
                  <Card.Body>
                    <small className="text-muted">Total</small>
                    <h4>{total}</h4>
                  </Card.Body>
                </Card>
              </Col>

              <Col md={3}>
                <Card className="text-center border-start border-success border-4 shadow-sm card-hover success">
                  <Card.Body>
                    <small className="text-muted">Ativos</small>
                    <h4 className="text-success">{ativos}</h4>
                  </Card.Body>
                </Card>
              </Col>

              <Col md={3}>
                <Card className="text-center border-start border-danger border-4 shadow-sm card-hover danger">
                  <Card.Body>
                    <small className="text-muted">Baixados</small>
                    <h4 className="text-danger">{baixados}</h4>
                  </Card.Body>
                </Card>
              </Col>

              <Col md={3}>
                <Card className="text-center border-start border-warning border-4 shadow-sm card-hover warning">
                  <Card.Body>
                    <small className="text-muted">Movimentação</small>
                    <h4 className="text-warning">{movimentacao}</h4>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* Tabela geral */}
            <Table striped hover responsive className="align-middle">
              <thead className="table-primary text-center">
                <tr>
                  <th>Nº</th>
                  <th>Nome</th>
                  <th>Ano de Nascimento</th>
                  <th>Sexo</th>
                  <th>Pelagem</th>
                  <th>Alocação</th>
                  <th>Origem</th>
                  <th>Esquadrão</th>
                  <th>Status</th>
                  {temMovimentacao && <th>Movimentação</th>}
                  <th>Gestão</th>
                </tr>
              </thead>

              <tbody>
                {dados.map((item) => (
                  <tr key={item.numero} className="text-center">
                    <td className="fw-bold">
                      <Link
                        to={`/dashboard/gestaofvr/solipede/edit/${item.numero}`}
                      >
                        {item.numero}
                      </Link>
                    </td>
                    <td>{item.nome}</td>
                    <td> {new Date(item.DataNascimento).getFullYear()}</td>
                    <td>{item.sexo}</td>
                    <td>{item.pelagem}</td>
                    <td>{item.alocacao}</td>
                    <td>{item.origem}</td>
                    <td>{item.esquadrao}</td>
                    <td>
                      <Badge
                        bg={item.status === "Baixado" ? "danger " : "success"}
                      >
                        {item.status}
                      </Badge>
                    </td>
                    {temMovimentacao && (
                      <td>
                        {item.movimentacao && (
                          <Badge bg="warning" text="dark">
                            {item.movimentacao}
                          </Badge>
                        )}
                      </td>
                    )}
                    <td>
                      <Button size="sm" variant="info" className="me-1">
                        <BsClockHistory />
                      </Button>
                      <Link to="/dashboard/gestaofvr/solipede/prontuario">
                        <Button
                          size="sm"
                          variant="success"
                          className="me-1"
                          title="Prontuário"
                        >
                          <BsClipboardCheck />
                        </Button>
                      </Link>

                      <Link
                        to={`/dashboard/gestaofvr/solipede/edit/${item.numero}`}
                      >
                        <Button
                          size="sm"
                          variant="warning"
                          className="me-1"
                          title="Editar"
                        >
                          <BsPencilSquare />
                        </Button>
                      </Link>
                      <Button size="sm" variant="danger">
                        <BsTrash />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
};

export default GestaoFvr;
