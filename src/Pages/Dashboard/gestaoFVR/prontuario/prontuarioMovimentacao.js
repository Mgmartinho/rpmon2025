import { useEffect, useState } from "react";
import {
    Col,
    Row,
    Card,
    Form,
    Spinner,
    Button,
} from "react-bootstrap";

import { api } from "../../../../services/api";

const ProntuarioMovimentacao = () => {
    const [loading, setLoading] = useState(true);
    const [salvando, setSalvando] = useState(false);

    const hoje = new Date().toISOString().split("T")[0];


    const [movimentacao, setMovimentacao] = useState({
        movimentacao: "",
        alocacao: "",
        data_movimentacao: hoje,
    });

    const opcoesMovimentacao = [
        "",
        "RPMon",
        "Barro Branco",
        "Hospital Veterinário",
        "Avare",
        "Barretos",
        "Bauru",
        "Campinas",
        "Colina",
        "Escola Equitação Exército",
        "Itapetininga",
        "Marilia",
        "Maua",
        "Presidente Prudente",
        "Ribeirão Preto",
        "Santos",
        "São Bernardo do Campo",
        "São José do Rio Preto",
        "Sorocaba",
        "Taubate",
        "Representacao",
    ];

    const handleMovimentacaoSubmit = (e) => {
        e.preventDefault();
        setSalvando(true);

        const payload = {
            ...movimentacao,
            opcoesMovimentacao: opcoesMovimentacao,
            data_movimentacao: new Date().toISOString(),
        };

        console.log("=================================");
        console.log("🔥 HANDLE MOVIMENTACAO SUBMIT");
        console.log("Dados recebidos:");
        console.log(payload);
        console.log("=================================");

        setTimeout(() => {
            alert("Dados passaram pelo handle com sucesso! ✅");
            setSalvando(false);
        }, 1000);


        setMovimentacao({
            movimentacao: "",
            alocacao: "",
            data_movimentacao: hoje,
        });
    };

    const handleReset = () => {
        setMovimentacao({
            movimentacao: "",
            alocacao: "",
            data_movimentacao: hoje,
        });

    };

    // if (loading) {
    //     return (
    //         <div className="text-center my-5">
    //             <Spinner animation="border" />
    //             <p>Carregando...</p>
    //         </div>
    //     );
    // }

    return (
        <div>
            <Card className="shadow-sm border-0">
                <Card.Body>
                    <Form onSubmit={handleMovimentacaoSubmit}>

                        <Form.Group className="mb-3">
                            <Form.Label className="fw-bold">
                                Movimentação -{" "}
                                {new Date(hoje).toLocaleDateString("pt-BR", {
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "numeric",
                                })}{" "}
                            </Form.Label>
                        </Form.Group>

                        <div
                            className="mt-3 mb-3 p-3 rounded"
                            style={{
                                backgroundColor: "#f8f9fa",
                                border: "1px solid #dee2e6",
                            }}
                        >
                            <Row>
                                <Col xs={12}>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="fw-bold">
                                            Motivo da movimentação *
                                        </Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={2}
                                            maxLength={500}
                                            size="sm"
                                            placeholder="Descrição do motivo da movimentação"
                                            value={movimentacao.movimentacao}
                                            onChange={(e) =>
                                                setMovimentacao({
                                                    ...movimentacao,
                                                    movimentacao: e.target.value,
                                                })
                                            }
                                            disabled={salvando}
                                        />
                                        <small className="text-muted">
                                            caracteres: {movimentacao.movimentacao.length}/500
                                        </small>
                                    </Form.Group>
                                </Col>
                            </Row>
                        </div>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-bold">
                                        Informe a data da movimentação (Opcional)
                                    </Form.Label>
                                    <Form.Control
                                        type="date"
                                        value={movimentacao.data_movimentacao}
                                        onChange={(e) =>
                                            setMovimentacao({
                                                ...movimentacao,
                                                data_movimentacao: e.target.value,
                                            })
                                        }
                                        disabled={salvando}
                                    />
                                    <small className="text-muted">
                                        Se não for selecionada, a data atual será usada.
                                    </small>
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col xs={12}>
                                <Form.Group className="mb-4">
                                    <Form.Label className="fw-bold">
                                        Informe o destino da movimentação:
                                    </Form.Label>
                                    <Form.Select
                                        value={movimentacao.alocacao}
                                        onChange={(e) =>
                                            setMovimentacao({
                                                ...movimentacao,
                                                alocacao: e.target.value,
                                            })
                                        }
                                        disabled={salvando}
                                    >
                                        {opcoesMovimentacao.map((opcao) => (
                                            <option key={opcao} value={opcao}>
                                                {opcao === "" ? "Selecione o destino..." : opcao}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>

                        <div className="d-flex gap-2">
                            <Button
                                type="submit"
                                variant="success"
                                disabled={salvando}
                            >
                                {salvando ? (
                                    <>
                                        <Spinner
                                            size="sm"
                                            className="me-2"
                                            animation="border"
                                        />
                                        Salvando...
                                    </>
                                ) : (
                                    <>💾 Salvar Registro</>
                                )}
                            </Button>

                            <Button
                                type="button"
                                variant="secondary"
                                onClick={handleReset}
                                disabled={salvando}
                            >
                                Limpar
                            </Button>
                        </div>

                    </Form>
                </Card.Body>
            </Card>
        </div>
    );
};

export default ProntuarioMovimentacao;