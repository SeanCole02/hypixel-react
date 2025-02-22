import React, { useEffect, useState } from 'react';
import { useMatomo } from '@datapunt/matomo-tracker-react'
import { useLocation } from "react-router-dom";
import CookieConsent from 'react-cookie-consent';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { OfflineBanner } from '../OfflineBanner/OfflineBanner';
import { useHistory } from "react-router-dom";
import registerNotificationCallback from '../../utils/NotificationUtils';
import { createTheme, ThemeProvider } from '@material-ui/core';
import { getURLSearchParam } from '../../utils/Parser/URLParser';
import Cookies from 'js-cookie';
import { Modal } from 'react-bootstrap';
import ReloadDialog from '../ReloadDialog/ReloadDialog';
import 'react-contexify/dist/ReactContexify.css';
import { startMigrations } from '../../migrations/MigrationUtils';


export function MainApp(props: any) {

    let [showRefreshFeedbackDialog, setShowRefreshFeedbackDialog] = useState(false);

    const { trackPageView, trackEvent, pushInstruction } = useMatomo()
    const location = useLocation();
    const history = useHistory();

    const prefersDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

    useEffect(() => {
        let preventReloadDialog = localStorage.getItem("rememberHideReloadDialog") === "true";
        if (preventReloadDialog) {
            return;
        }

        // check if page was reloaded
        if (window.performance && window.performance.getEntriesByType("navigation")[0] && (window.performance.getEntriesByType("navigation")[0] as any).type === "reload") {

            let lastReloadTime = localStorage.getItem("lastReloadTime");
            // Check if the last reload was less than 30 seconds ago
            if (lastReloadTime && 30_000 > new Date().getTime() - Number(lastReloadTime)) {
                setTimeout(() => {
                    setShowRefreshFeedbackDialog(true);
                }, 1000)
            } else {
                localStorage.setItem("lastReloadTime", new Date().getTime().toString());
            }
        }

        startMigrations();
    }, []);

    useEffect(() => {

        pushInstruction("requireConsent");

        // check for tracking of old users
        let cookie = Cookies.get('nonEssentialCookiesAllowed');
        if (cookie === "true") {
            pushInstruction("rememberConsentGiven");
        }

        let uiStyle = window.localStorage.getItem("uiStyle");
        if ((!uiStyle || uiStyle !== (prefersDarkMode ? 'dark' : 'light'))) {
            window.localStorage.setItem("uiStyle", prefersDarkMode ? 'dark' : 'light')
            trackEvent({
                category: 'uiStyle',
                action: prefersDarkMode ? 'dark' : 'light'
            })
        }

        let refId = getURLSearchParam("refId");
        if (refId) {
            (window as any).refId = refId;
        }

        registerNotificationCallback(history);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location])

    useEffect(() => {
        trackPageView({});
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [document.title]);

    const theme = React.useMemo(
        () =>
            createTheme({
                palette: {
                    type: 'dark',
                },
            }),
        [],
    );

    function setTrackingAllowed() {
        pushInstruction("rememberConsentGiven");
        trackPageView({});
    }

    let refreshFeedbackDialog = (
        <Modal size={"lg"} show={showRefreshFeedbackDialog} onHide={() => { setShowRefreshFeedbackDialog(false) }}>
            <Modal.Header closeButton>
                <Modal.Title>Has an error occured?</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <ReloadDialog onClose={() => { setShowRefreshFeedbackDialog(false) }} />
            </Modal.Body>
        </Modal>);

    return (
        <ThemeProvider theme={theme}>
            <OfflineBanner />
            {props.children}
            <CookieConsent
                enableDeclineButton
                declineButtonStyle={{ backgroundColor: "rgb(65, 65, 65)", borderRadius: "10px", color: "lightgrey", fontSize: "14px" }}
                buttonStyle={{ backgroundColor: "green", borderRadius: "10px", color: "white", fontSize: "20px" }}
                contentStyle={{ marginBottom: "0px" }}
                buttonText="Yes, I understand"
                declineButtonText="Decline"
                cookieName="nonEssentialCookiesAllowed"
                data-nosnippet
                style={{ paddingLeft: "40px" }}
                onAccept={() => { setTrackingAllowed() }}
            >
                <span data-nosnippet>
                    <p style={{ margin: "0px" }}>We use cookies for analytics. <a href="https://coflnet.com/privacy"> privacy policy </a></p>
                </span>
            </CookieConsent>
            {refreshFeedbackDialog}
            <ToastContainer theme={"colored"} />
        </ThemeProvider>
    )
}
