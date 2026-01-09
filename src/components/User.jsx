import { initializeApp } from "firebase/app";
import { getFirestore, doc, onSnapshot, getDoc } from "firebase/firestore";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { useState, useEffect } from "react";

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

    const [teamOneName, setTeamOneName] = useState("loading...");
    const [teamTwoName, setTeamTwoName] = useState("loading...");

    const [teamOnePoints, setTeamOnePoints] = useState("Loading...");
    const [teamTwoPoints, setTeamTwoPoints] = useState("Loading...");

    const [pool, setPool] = useState("000");

    const [activeQuestion, setActiveQuestion] = useState(null);


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

                setPool(pool);


                if (data.activeQuestion == -1) {
                    setActiveQuestion(-1);

                    unsubQuestion();

                }
                else {

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
                </div>
                <div className="flex gap-4 flex-nowrap">
                    <p>{teamTwoPoints}</p>
                    <p>{teamTwoName}</p>
                </div>
            </div>

            <div className="w-[70vw] flex-1 flex flex-col items-center justify-center gap-10">
                {/* Question */}
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
        </div>
    )
}

export default User;