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

const ProntuarioTratamento = () => {
    const [loading, setLoading] = useState(true);
    const [salvando, setSalvando] = useState(false);

    const hoje = new Date().toISOString().split("T")[0];
    const hora = new Date().toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });

    const [tratamento, setTratamento] = useState({
        diagnostico: "",
        prescricao: "",
        observacaoClinica: "",
        data_inicio: hoje,
        data_validade: "",
    });

    const [precisaBaixarSelecionado, setPrecisaBaixarSelecionado] = useState("nao");

    const precisaBaixar = [
        { value: "nao", label: "❌ Não - Manter status atual do solípede" },
        { value: "sim", label: "✅ Sim - Baixar o solípede para este tratamento" }
    ];

    // const CarregarRestricao = async () => {
    //     try {
    //         const response = await api.get("/restricao");
    //         console.log("Restrição carregada:", response.data);
    //     } catch (error) {
    //         console.error("Erro ao carregar a restrição:", error);
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    // useEffect(() => {
    //     CarregarRestricao();
    // }, []);

    const handleTratamentoSubmit = (e) => {
        e.preventDefault();
        setSalvando(true);

        const payload = {
            ...tratamento,
            precisaBaixar: precisaBaixarSelecionado,
            data_registro: new Date().toISOString(),
        };

        console.log("=================================");
        console.log("🔥 HANDLE TRATAMENTO SUBMIT");
        console.log("Dados recebidos:");
        console.log(payload);
        console.log("=================================");

        setTimeout(() => {
            alert("Dados passaram pelo handle com sucesso! ✅");
            setSalvando(false);
        }, 1000);


        setTratamento({
            diagnostico: "",
            prescricao: "",
            observacaoClinica: "",
            data_inicio: hoje,
            data_validade: "",
        });
    };

    const handleReset = () => {
        setTratamento({
            diagnostico: "",
            prescricao: "",
            observacaoClinica: "",
            data_inicio: hoje,
            data_validade: "",
        });

        setPrecisaBaixarSelecionado("nao");
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
                    <Form onSubmit={handleTratamentoSubmit}>

                        <Form.Group className="mb-3">
                            <Form.Label className="fw-bold">
                                Tratamento -{" "}
                                {new Date(hoje).toLocaleDateString("pt-BR", {
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "numeric",
                                })}{" "}
                                {hora}
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
                                            Diagnóstico *
                                        </Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={2}
                                            maxLength={500}
                                            size="sm"
                                            placeholder="Descrição do tratamento"
                                            value={tratamento.diagnostico}
                                            onChange={(e) =>
                                                setTratamento({
                                                    ...tratamento,
                                                    diagnostico: e.target.value,
                                                })
                                            }
                                            disabled={salvando}
                                        />
                                        <small className="text-muted">
                                            caracteres: {tratamento.diagnostico.length}/500
                                        </small>
                                    </Form.Group>
                                </Col>

                                <Col xs={12}>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="fw-bold">
                                            Observação Clínica *
                                        </Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={2}
                                            maxLength={500}
                                            size="sm"
                                            placeholder="Descrição da observação clínica"
                                            value={tratamento.observacaoClinica}
                                            onChange={(e) =>
                                                setTratamento({
                                                    ...tratamento,
                                                    observacaoClinica: e.target.value,
                                                })
                                            }
                                            disabled={salvando}
                                        />
                                        <small className="text-muted">
                                            caracteres: {tratamento.observacaoClinica.length}/500
                                        </small>
                                    </Form.Group>
                                </Col>

                                <Col xs={12}>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="fw-bold">
                                            Prescrição Veterinária *
                                        </Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={6}
                                            maxLength={5000}
                                            size="sm"
                                            placeholder="Prescrição veterinária"
                                            value={tratamento.prescricao}
                                            onChange={(e) =>
                                                setTratamento({
                                                    ...tratamento,
                                                    prescricao: e.target.value,
                                                })
                                            }
                                            disabled={salvando}
                                        />
                                        <small className="text-muted">
                                            caracteres: {tratamento.prescricao.length}/5.000
                                        </small>
                                    </Form.Group>
                                </Col>
                            </Row>
                        </div>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-bold">
                                        Data de início (Opcional)
                                    </Form.Label>
                                    <Form.Control
                                        type="date"
                                        value={tratamento.data_inicio}
                                        onChange={(e) =>
                                            setTratamento({
                                                ...tratamento,
                                                data_inicio: e.target.value,
                                            })
                                        }
                                        disabled={salvando}
                                    />
                                </Form.Group>
                            </Col>

                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-bold">
                                        Data de término (Opcional)
                                    </Form.Label>
                                    <Form.Control
                                        type="date"
                                        value={tratamento.data_validade}
                                        onChange={(e) =>
                                            setTratamento({
                                                ...tratamento,
                                                data_validade: e.target.value,
                                            })
                                        }
                                        disabled={salvando}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col xs={12}>
                                <Form.Group className="mb-4">
                                    <Form.Label className="fw-bold">
                                        🩺 Precisa baixar o solípede?
                                    </Form.Label>
                                    <Form.Select
                                        value={precisaBaixarSelecionado}
                                        onChange={(e) =>
                                            setPrecisaBaixarSelecionado(e.target.value)
                                        }
                                        disabled={salvando}
                                    >
                                        {precisaBaixar.map((option) => (
                                            <option
                                                key={option.value}
                                                value={option.value}
                                            >
                                                {option.label}
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

export default ProntuarioTratamento;