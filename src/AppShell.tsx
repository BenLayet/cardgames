import "./i18n";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import {App} from "./components/app";

const AppShell = () => {
  const {t, i18n } = useTranslation();
  useEffect(() => {
    const appTitle = t('title');
    document.title = `${appTitle}`;
  }, [t, i18n.language]);

  return i18n.isInitialized ? (
    <>
      <App path="" />
    </>
  ) : (
    <FontAwesomeIcon icon={faSpinner} spin />
  );
};
export default AppShell;
