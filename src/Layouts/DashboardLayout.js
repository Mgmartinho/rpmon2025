import { Outlet } from "react-router-dom";
import { Container, Row, Col } from "react-bootstrap";
import HeaderDashboard from "../components/HeaderGestao/HeaderDashboard";
import FooterDashboard from "../components/HeaderGestao/FooterDashboard";
const DashboardLayout = () => {
  return (
    <>
      <HeaderDashboard />

      <main>
        <Container fluid >
          <Row className="justify-content-center">
            <Col
              xl={9}   // ~75% em telas grandes
              lg={10}  // um pouco maior em notebooks
              md={11}
              sm={12}
            >
              <Outlet />
            </Col>
          </Row>
        </Container>
      </main>

            <FooterDashboard />

    </>
  );
};

export default DashboardLayout;
