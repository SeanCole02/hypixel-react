import React from "react";
import { Button, Container, Card } from "react-bootstrap";
import { Link } from 'react-router-dom';
import GoogleSignIn from "../../components/GoogleSignIn/GoogleSignIn";
import Search from "../../components/Search/Search";

function Refed() {

    function onAfterLogin() {
        
    }

    return (
        <div className="refed">
            <Container>
                <Search />
                <Card>
                    <Card.Header>
                        <Card.Title>Invitation</Card.Title>
                    </Card.Header>
                    <Card.Body>
                        <p>You were invited to use this application because someone thought it would be interesting and helpful to you.</p>
                        <hr />
                        <p>Login with Google:</p>
                        <GoogleSignIn onAfterLogin={onAfterLogin} />
                        <p>We use Google accounts because they are more secure than requiring a separate login. We use your Google Id and email in compliance with our <a href="https://coflnet.com/privacy">privacy policy</a> (i.e. to know what settings you made and contact you in case we need to)</p>
                        
                        <Link to="/"><Button>Go to main page</Button></Link>
                    </Card.Body>
                </Card>
            </Container>
        </div>
    )
}

export default Refed;
