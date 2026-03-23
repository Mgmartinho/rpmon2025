import { useState } from "react";
import { Alert, Badge, Button, Card, Col, Container, Row } from "react-bootstrap";
import { BsArrowLeftRight, BsCapsulePill, BsShieldPlus } from "react-icons/bs";
import { Link } from "react-router-dom";
import MovimentacaoLote from "./movimentacaoLote";

const tipos = [
  {
    key: "movimentacao",
    titulo: "Movimentacao",
    descricao: "Altera alocacao de varios solipedes e registra prontuario em lote.",
    icon: BsArrowLeftRight,
    variant: "primary",
  },
  {
    key: "vacinacao",
    titulo: "Vacinacao",
    descricao: "Planejado para lancamentos em lote de vacinas.",
    icon: BsShieldPlus,
    variant: "success",
  },
  {
    key: "vermifugacao",
    titulo: "Vermifugacao",
    descricao: "Planejado para lancamentos em lote de vermifugacao.",
    icon: BsCapsulePill,
    variant: "warning",
  },
];

export default function LancamentosLotePage() {
  const [tipoSelecionado, setTipoSelecionado] = useState("movimentacao");

  return (
    <Container fluid className="py-4">
      <Row className="mb-3 align-items-center">
        <Col md={8}>
          <h4 className="mb-1">Lancamentos em Lote</h4>
          <small className="text-muted">
            Selecione o tipo de lancamento para executar operacoes em lote.
          </small>
        </Col>
        <Col md={4} className="text-md-end mt-2 mt-md-0">
          <Link to="/dashboard/gestaofvr">
            <Button variant="outline-secondary">Voltar para Gestao FVR</Button>
          </Link>
        </Col>
      </Row>

      <Row className="g-3 mb-4">
        {tipos.map((tipo) => {
          const Icone = tipo.icon;
          const ativo = tipoSelecionado === tipo.key;

          return (
            <Col md={4} key={tipo.key}>
              <Card
                className={`h-100 shadow-sm ${ativo ? "border-2" : ""}`}
                border={ativo ? tipo.variant : "light"}
                style={{ cursor: "pointer" }}
                onClick={() => setTipoSelecionado(tipo.key)}
              >
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <Icone size={22} />
                    {ativo && <Badge bg={tipo.variant}>Selecionado</Badge>}
                  </div>
                  <h6 className="mb-1">{tipo.titulo}</h6>
                  <small className="text-muted">{tipo.descricao}</small>
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>

      {tipoSelecionado === "movimentacao" && <MovimentacaoLote />}

      {tipoSelecionado === "vacinacao" && (
        <Alert variant="success" className="shadow-sm">
          Modulo de vacinacao em lote selecionado. Podemos implementar o formulario completo na sequencia.
        </Alert>
      )}

      {tipoSelecionado === "vermifugacao" && (
        <Alert variant="warning" className="shadow-sm">
          Modulo de vermifugacao em lote selecionado. Podemos implementar o formulario completo na sequencia.
        </Alert>
      )}
    </Container>
  );
}
