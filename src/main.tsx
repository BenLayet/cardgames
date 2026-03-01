import {configureSofterStore} from "@softer-components/redux-adapter";
import {StrictMode} from "react";
import {createRoot} from "react-dom/client";
import {Provider} from "react-redux";

import {appDef} from "./components/app";
import "./style/style.css";
import "./i18n";
import AppShell from "./AppShell.tsx";
import {configuration} from "./configuration.tsx";

export const store = configureSofterStore(appDef(configuration));
const container = document.getElementById("root");

if (container) {
    const root = createRoot(container);

    root.render(
        <StrictMode>
            <Provider store={store}>
                <AppShell/>
            </Provider>
        </StrictMode>,
    );
} else {
    throw new Error(
        "Root element with ID 'root' was not found in the document. Ensure there is a corresponding HTML element with the ID 'root' in your HTML file.",
    );
}
