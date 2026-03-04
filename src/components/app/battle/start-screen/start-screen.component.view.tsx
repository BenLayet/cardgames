import {useSofter} from "@softer-components/redux-adapter";

import type {StartScreenContract} from "./start-screen.component.ts";
import {useTranslation} from "react-i18next";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faStar} from "@fortawesome/free-solid-svg-icons";
import {LanguageSwitcher} from "../../../language-switcher";

export const View = ({path = ""}) => {
    const [v, d] = useSofter<StartScreenContract>(path);
    const {t} = useTranslation();
    return (<div className="vstack justify-content-center align-items-center">
            <h1 className="game-title">JEU DE BATAILLE !</h1>
            <div className="settings-container">
                {/* Language Switcher */}
                <div className="settings-row">
                    <label className="settings-label">{t("language")}</label>
                    <LanguageSwitcher/>
                </div>
                <div className="settings-row">
                    <label className="settings-label">{t("cardCount")}</label>
                    <div className="card-count-controls">
                        {v.cardCountOptions.map((option) => <button
                            className={`btn btn-lg ${v.cardCount === option? 'btn-primary' : 'btn-outline-primary'}`}
                                    onClick={() => d.setCardCountRequested(option)}>
                            {option}
                            </button>
                        )}
                    </div>
                </div>
            </div>
            <button onClick={() => d.startGameRequested()} style={{
                fontSize: "5em", minWidth: "10em", display: "inline-flex",
                alignItems: "center",
                justifyContent: "space-between"
            }}
                    className="btn btn-primary px-5 ">
                <FontAwesomeIcon icon={faStar}/>{t('ready')}<FontAwesomeIcon icon={faStar}/>
            </button>
        </div>
    );
};
