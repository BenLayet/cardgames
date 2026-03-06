import {useSofter} from "@softer-components/redux-adapter";

import type {StartScreenContract} from "./start-screen.component.ts";
import {useTranslation} from "react-i18next";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faStar} from "@fortawesome/free-solid-svg-icons";
import {LanguageSwitcher} from "../../../language-switcher";

export const View = ({path = ""}) => {
    const [v, d] = useSofter<StartScreenContract>(path);
    const {t} = useTranslation();
    return (<div className="vstack justify-content-around align-items-center">
            <h1 className="game-title">{t("title")}</h1>
            <div className="d-flex flex-column gap-2 text-center">
                <div className="row">
                    <label className="fs-3 ">{t("language")}</label>
                    <div>
                        <LanguageSwitcher/>
                    </div>
                </div>
                <div className="row">
                    <label className="fs-3">{t("cardCount")}</label>
                    <div className=" d-flex gap-2 justify-content-center flex-wrap">
                        {v.cardCountOptions.map((option) => <button
                                key={option}
                                className={`btn ${v.cardCount === option ? 'btn-primary' : 'btn-outline-primary'}`}
                                onClick={() => d.setCardCountRequested(option)}>
                                {option}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <button onClick={() => d.startGameRequested()}
                    className="btn btn-lg btn-primary px-2 mt-1">
                <FontAwesomeIcon icon={faStar}/> {t('start')} <FontAwesomeIcon icon={faStar}/>
            </button>
        </div>
    );
};
