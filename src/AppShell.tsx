import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import {App} from "./components/app";
import {UpdateBanner} from "./components/navigation/UpdateBanner.tsx";

const AppShell = () => {
  const {t, i18n } = useTranslation();
  useEffect(() => {
    const appTitle = t('title');
    document.title = appTitle;
    // screen readers pick their voice from the language of the page
    document.documentElement.lang = i18n.language;
  }, [t, i18n.language]);

  return i18n.isInitialized ? (
    <>
      <App path="" />
      <UpdateBanner />
    </>
  ) : (
    <FontAwesomeIcon icon={faSpinner} spin />
  );
};
export default AppShell;
