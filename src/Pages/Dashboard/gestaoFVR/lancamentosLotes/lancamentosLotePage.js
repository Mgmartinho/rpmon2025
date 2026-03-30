import { useState } from "react";
import {  Badge, Button, Card, Col, Container, Row } from "react-bootstrap";
import { BsArrowLeftRight, BsCapsulePill, BsShieldPlus } from "react-icons/bs";
import { Link } from "react-router-dom";

import MovimentacaoLote from "./movimentacaoLote";
import VacinacaoLote from "./vacinacaoLote";
import VermifugacaoLote from "./vermifugacaoLote";
import AieMormoLote from "./aieMormoLote";
const tipos = [
  {
    key: "movimentacao",
    titulo: "Movimentação",
    descricao: "Altera alocação de vários solípedes e registra prontuário em lote.",
    icon: BsArrowLeftRight,
    variant: "primary",
  },
  {
    key: "vacinacao",
    titulo: "Vacinação",
    descricao: "Planejado para lançamentos em lote de vacinas.",
    icon: BsShieldPlus,
    variant: "success",
  },
  {
    key: "vermifugacao",
    titulo: "Vermifugação",
    descricao: "Planejado para lançamentos em lote de vermifugação.",
    icon: BsCapsulePill,
    variant: "warning",
  },
  {
    key: "aieMormo",
    titulo: "AIE / Mormo",
    descricao: "Planejado para lançamentos em lote de AIE / Mormo.",
    icon: BsCapsulePill,
    variant: "danger",
  },
];

export default function LancamentosLotePage() {
  const [tipoSelecionado, setTipoSelecionado] = useState("movimentacao");

  return (
    <Container fluid className="py-4">
      <Row className="mb-3 align-items-center">
        <Col md={8}>
          <h4 className="mb-1">Lançamentos em Lote</h4>
          <small className="text-muted">
            Selecione o tipo de lançamento para executar operações em lote.
          </small>
        </Col>
        <Col md={4} className="text-md-end mt-2 mt-md-0">
          <Link to="/dashboard/gestaofvr">
            <Button variant="outline-secondary">Voltar para Gestão FVR</Button>
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

      {tipoSelecionado === "vacinacao" && <VacinacaoLote />}

      {tipoSelecionado === "vermifugacao" && <VermifugacaoLote />}
      
      {tipoSelecionado === "aieMormo" && <AieMormoLote />}

    </Container>
  );
}
