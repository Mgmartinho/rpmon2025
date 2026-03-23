import { useEffect, useState } from "react";
import {
    Col,
    Row,
    Card,
    Form,
    Spinner,
    Button,
} from "react-bootstrap";
import { useParams } from "react-router-dom";

import { api } from "../../../../services/api";



const ProntuarioTratamento = () => {
    const { numero } = useParams();
    const [salvando, setSalvando] = useState(false);

    const hoje = new Date().toISOString().split("T")[0];
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

    const handleTratamentoSubmit = async (e) => {
        e.preventDefault();
        setSalvando(true);
        window.location.reload();
        if (!numero) {
            alert("Número do solípede não encontrado na rota.");
            setSalvando(false);
            return;
        }

        const payload = {
            numero_solipede: Number(numero),
            diagnostico: tratamento.diagnostico?.trim() || "",
            observacao_clinica: tratamento.observacaoClinica?.trim() || "",
            prescricao: tratamento.prescricao?.trim() || "",
            precisa_baixar: precisaBaixarSelecionado,
            foi_responsavel_pela_baixa: precisaBaixarSelecionado === "sim" ? 1 : 0,
            data_inicio: tratamento.data_inicio || null,
            data_validade: tratamento.data_validade || null,
        };

        console.log("=================================");
        console.log("🔥 HANDLE TRATAMENTO SUBMIT");
        console.log("Dados recebidos:");
        console.log(payload);
        console.log("=================================");

        try {
            const resultado = await api.criarProntuarioTratamento(payload);

            if (resultado?.success || resultado?.id) {
                alert("Tratamento salvo com sucesso! ✅");
                setTratamento({
                    diagnostico: "",
                    prescricao: "",
                    observacaoClinica: "",
                    data_inicio: hoje,
                    data_validade: "",
                });
                setPrecisaBaixarSelecionado("nao");
            } else {
                alert(`Erro ao salvar tratamento: ${resultado?.erro || resultado?.error || "Falha desconhecida"}`);
            }
        } catch (error) {
            console.error("Erro ao enviar tratamento:", error);
            alert("Erro de conexão ao enviar tratamento para a API.");
        } finally {
            setSalvando(false);
        }
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

    return (
        <div>
            <Card className="shadow-sm border-0">
                <Card.Body>
                    <Form onSubmit={handleTratamentoSubmit}>

                        <Form.Group className="mb-3">
                            <Form.Label className="fw-bold">
                                Tratamento 
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