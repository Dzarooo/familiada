import { initializeApp } from "firebase/app";
import { getFirestore, doc, onSnapshot, getDoc } from "firebase/firestore";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { useState, useEffect, useRef } from "react";

const User = () => {

    const firebaseConfig = {
        apiKey: "AIzaSyD2Uzvs9YLTGePSJnqqM1kkf6qhlv4aIvU",
        authDomain: "familiada-dzarooo.firebaseapp.com",
        projectId: "familiada-dzarooo",
        storageBucket: "familiada-dzarooo.firebasestorage.app",
        messagingSenderId: "1052199238692",
        appId: "1:1052199238692:web:03ca2924f0c45882472cb1"
    };

    const app = initializeApp(firebaseConfig);

    const auth = getAuth(app);

    const db = getFirestore(app);

    const soundCorrect = new Audio("/familiada/familiada-correct.mp3");
    const soundIncorrect = new Audio("/familiada/familiada-incorrect.mp3");

    const [teamOneName, setTeamOneName] = useState("loading...");
    const [teamTwoName, setTeamTwoName] = useState("loading...");

    const [teamOnePoints, setTeamOnePoints] = useState("Loading...");
    const [teamTwoPoints, setTeamTwoPoints] = useState("Loading...");

    const [pool, setPool] = useState("");

    const [activeQuestion, setActiveQuestion] = useState(null);

    const [answeringTeam, setAnsweringTeam] = useState(-1);

    const [mistakes, setMistakes] = useState(-1);


    const playCorrectSound = () => {
        soundCorrect.currentTime = 0;
        soundCorrect.play();
    }

    const playIncorrectSound = () => {
        soundIncorrect.currentTime = 0;
        soundIncorrect.play();
    }

    useEffect(() => {

        signInAnonymously(auth).catch(err => {
            console.error("Anon auth failed:", err);
        });

        const unsubAuth = onAuthStateChanged(auth, (user) => {
            if (!user) return;

            console.log("Auth ready");

            let unsubQuestion = () => { };

            const unsubTeam1 = onSnapshot(doc(db, "teams", "team1"), (snap) => {
                if (!snap.exists()) return;

                const data = snap.data();
                console.log("New team1 data:", data);

                setTeamOneName(data.name);
                setTeamOnePoints(data.points);
            });

            const unsubTeam2 = onSnapshot(doc(db, "teams", "team2"), (snap) => {
                if (!snap.exists()) return;

                const data = snap.data();
                console.log("New team2 data:", data);

                setTeamTwoName(data.name);
                setTeamTwoPoints(data.points);
            });

            const unsubGameData = onSnapshot(doc(db, "game_data", "game_data"), async (snap) => {
                if (!snap.exists()) return;

                const data = snap.data();
                console.log("game data:", data);

                let pool = data.pool;
                const length = ("" + pool).length;

                if (length == 1) pool = "00" + pool;
                else if (length == 2) pool = "0" + pool;
                else pool = "" + pool;

                setPool(prev => {
                    if(prev != "" && prev < pool) playCorrectSound();
                    return pool;
                });

                setAnsweringTeam(data.answeringTeam);

                setMistakes(prev => {
                    if (prev != -1 && prev < data.mistakes) playIncorrectSound();
                    return data.mistakes;
                });

                if (data.activeQuestion == -1) {
                    setActiveQuestion(-1);

                    unsubQuestion();
                }
                else {

                    unsubQuestion();

                    unsubQuestion = onSnapshot(doc(db, "questions", data.activeQuestion), snap => {
                        if (!snap.exists()) return;

                        const questionData = snap.data();

                        const newAnswers = Object.fromEntries(
                            Object.entries(questionData.answers).map(([id, answer]) => {

                                let value = answer.value
                                const length = ("" + value).length;

                                if (length == 1) value = "0" + value;
                                else if (length == 2) value = "" + value;

                                return [
                                    id,
                                    { ...answer, value: value }
                                ]
                            })
                        )

                        questionData.answers = newAnswers;

                        setActiveQuestion(questionData);
                    })

                }

            })

            return () => {
                unsubTeam1();
                unsubTeam2();
                unsubGameData();
                unsubQuestion();
            };
        });

        return () => unsubAuth();
    }, [db])

    return (
        <div className="w-screen min-h-screen h-fit flex flex-col flex-nowrap items-center">

            {/* Teams */}
            <div className="w-screen flex justify-between p-5">
                <div className="flex gap-4 flex-nowrap">
                    <p>{teamOneName}</p>
                    <p>{teamOnePoints}</p>
                    {((answeringTeam === 0 && mistakes < 3) || (answeringTeam === 1 && mistakes === 3)) &&
                        <i className="bi bi-megaphone-fill"></i>
                    }
                </div>
                <div className="flex gap-4 flex-nowrap">
                    {((answeringTeam === 1 && mistakes < 3) || (answeringTeam === 0 && mistakes === 3)) &&
                        <i className="bi bi-megaphone-fill -scale-x-100"></i>
                    }
                    <p>{teamTwoPoints}</p>
                    <p>{teamTwoName}</p>
                </div>
            </div>

            {/* Question and mistakes */}
            <div className="flex-1 w-screen flex justify-between items-center">

                {/* Team 1 mistakes */}
                {answeringTeam === 0 &&
                    <div className="flex-1/4 flex flex-col items-center">
                        <p className="text-[10rem] h-48">{mistakes > 0 && "X"}</p>
                        <p className="text-[10rem] h-48">{mistakes > 1 && "X"}</p>
                        <p className="text-[10rem] h-48">{mistakes > 2 && "X"}</p>
                    </div>
                }

                {answeringTeam === 1 &&
                    <div className="flex-1/4 flex flex-col items-center">
                        <p className="text-[15rem] h-[72]">{mistakes > 3 && "X"}</p>
                    </div>
                }


                {/* Question */}
                <div className="w-[70vw] flex-1 flex flex-col items-center justify-center gap-10">
                    <div className="w-[70vw] h-25">
                        <p className="text-center text-4xl">{activeQuestion === null ? "Loading..." : activeQuestion?.question}</p>
                    </div>

                    {/* Answers */}
                    <div className="w-[70vw] flex flex-col flex-nowrap gap-4">

                        <div className="flex gap-4">
                            <p>1</p>
                            <div className="flex-1 flex justify-between gap-4 items-end">
                                <p className="border-dotted border-b-4 border-b-yellow-300 flex-1">{activeQuestion != -1 && activeQuestion?.answers[0].isShown && activeQuestion?.answers[0].answer}</p>
                                <div>
                                    <div className="flex flex-nowrap gap-1 h-10">
                                        <p className="w-3.75">{activeQuestion != -1 && activeQuestion?.answers[0].isShown && activeQuestion?.answers[0].value[0]}</p>
                                        <p className="w-3.75">{activeQuestion != -1 && activeQuestion?.answers[0].isShown && activeQuestion?.answers[0].value[1]}</p>
                                    </div>
                                    <div className="flex flex-nowrap gap-1">
                                        <div className="w-3.75 h-1 bg-yellow-300"></div>
                                        <div className="w-3.75 h-1 bg-yellow-300"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <p>2</p>
                            <div className="flex-1 flex justify-between gap-4 items-end">
                                <p className="border-dotted border-b-4 border-b-yellow-300 flex-1">{activeQuestion != -1 && activeQuestion?.answers[1].isShown && activeQuestion?.answers[1].answer}</p>
                                <div>
                                    <div className="flex flex-nowrap gap-1 h-10">
                                        <p className="w-3.75">{activeQuestion != -1 && activeQuestion?.answers[1].isShown && activeQuestion?.answers[1].value[0]}</p>
                                        <p className="w-3.75">{activeQuestion != -1 && activeQuestion?.answers[1].isShown && activeQuestion?.answers[1].value[1]}</p>
                                    </div>
                                    <div className="flex flex-nowrap gap-1">
                                        <div className="w-3.75 h-1 bg-yellow-300"></div>
                                        <div className="w-3.75 h-1 bg-yellow-300"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <p>3</p>
                            <div className="flex-1 flex justify-between gap-4 items-end">
                                <p className="border-dotted border-b-4 border-b-yellow-300 flex-1">{activeQuestion != -1 && activeQuestion?.answers[2].isShown && activeQuestion?.answers[2].answer}</p>
                                <div>
                                    <div className="flex flex-nowrap gap-1 h-10">
                                        <p className="w-3.75">{activeQuestion != -1 && activeQuestion?.answers[2].isShown && activeQuestion?.answers[2].value[0]}</p>
                                        <p className="w-3.75">{activeQuestion != -1 && activeQuestion?.answers[2].isShown && activeQuestion?.answers[2].value[1]}</p>
                                    </div>
                                    <div className="flex flex-nowrap gap-1">
                                        <div className="w-3.75 h-1 bg-yellow-300"></div>
                                        <div className="w-3.75 h-1 bg-yellow-300"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <p>4</p>
                            <div className="flex-1 flex justify-between gap-4 items-end">
                                <p className="border-dotted border-b-4 border-b-yellow-300 flex-1">{activeQuestion != -1 && activeQuestion?.answers[3].isShown && activeQuestion?.answers[3].answer}</p>
                                <div>
                                    <div className="flex flex-nowrap gap-1 h-10">
                                        <p className="w-3.75">{activeQuestion != -1 && activeQuestion?.answers[3].isShown && activeQuestion?.answers[3].value[0]}</p>
                                        <p className="w-3.75">{activeQuestion != -1 && activeQuestion?.answers[3].isShown && activeQuestion?.answers[3].value[1]}</p>
                                    </div>
                                    <div className="flex flex-nowrap gap-1">
                                        <div className="w-3.75 h-1 bg-yellow-300"></div>
                                        <div className="w-3.75 h-1 bg-yellow-300"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <p>5</p>
                            <div className="flex-1 flex justify-between gap-4 items-end">
                                <p className="border-dotted border-b-4 border-b-yellow-300 flex-1">{activeQuestion != -1 && activeQuestion?.answers[4].isShown && activeQuestion?.answers[4].answer}</p>
                                <div>
                                    <div className="flex flex-nowrap gap-1 h-10">
                                        <p className="w-3.75">{activeQuestion != -1 && activeQuestion?.answers[4].isShown && activeQuestion?.answers[4].value[0]}</p>
                                        <p className="w-3.75">{activeQuestion != -1 && activeQuestion?.answers[4].isShown && activeQuestion?.answers[4].value[1]}</p>
                                    </div>
                                    <div className="flex flex-nowrap gap-1">
                                        <div className="w-3.75 h-1 bg-yellow-300"></div>
                                        <div className="w-3.75 h-1 bg-yellow-300"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2 justify-end">
                            <p className="text-end">Suma:</p>
                            <div>
                                <div className="flex flex-nowrap gap-1">
                                    <p className="w-3.75">{pool[0]}</p>
                                    <p className="w-3.75">{pool[1]}</p>
                                    <p className="w-3.75">{pool[2]}</p>
                                </div>
                                <div className="flex flex-nowrap gap-1">
                                    <div className="w-3.75 h-1 bg-yellow-300"></div>
                                    <div className="w-3.75 h-1 bg-yellow-300"></div>
                                    <div className="w-3.75 h-1 bg-yellow-300"></div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Team 2 mistakes */}
                {answeringTeam === 1 &&
                    <div className="flex-1/4 flex flex-col items-center">
                        <p className="text-[10rem] h-48">{mistakes > 0 && "X"}</p>
                        <p className="text-[10rem] h-48">{mistakes > 1 && "X"}</p>
                        <p className="text-[10rem] h-48">{mistakes > 2 && "X"}</p>
                    </div>
                }

                {answeringTeam === 0 &&
                    <div className="flex-1/4 flex flex-col items-center">
                        <p className="text-[15rem] h-[72]">{mistakes > 3 && "X"}</p>
                    </div>
                }

            </div>

            <div className="w-screen h-12.5 flex justify-center items-center">
                {mistakes >= 2 && mistakes <= 3 && (answeringTeam === 0 || answeringTeam === 1) &&
                    <p>Drużyna {answeringTeam === 0 ? teamTwoName : teamOneName} ma prawo do narady!</p>
                }
            </div>

        </div>
    )
}

export default User;