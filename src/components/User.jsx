import { initializeApp } from "firebase/app";
import { getFirestore, doc, onSnapshot } from "firebase/firestore";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { useState, useEffect } from "react";

const User = () => {

    const [teamOneName, setTeamOneName] = useState("loading...");
    const [teamTwoName, setTeamTwoName] = useState("loading...");

    const [teamOnePoints, setTeamOnePoints] = useState("Loading...");
    const [teamTwoPoints, setTeamTwoPoints] = useState("Loading...");

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

    useEffect(() => {

        signInAnonymously(auth).catch(err => {
            console.error("Anon auth failed:", err);
        });

        const unsubAuth = onAuthStateChanged(auth, (user) => {
            if (!user) return;

            console.log("Auth ready");

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

            return () => {
                unsubTeam1();
                unsubTeam2();
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
                    <p className="text-center text-4xl">Dlaczego Twoja stara wpierdala jajecznicę z patelni?</p>
                </div>

                {/* Answers */}
                <div className="w-[70vw] flex flex-col flex-nowrap gap-4">

                    <div className="flex gap-4">
                        <p>1</p>
                        <div className="flex-1 flex justify-between gap-4">
                            <p className="border-dotted border-b-4 border-b-yellow-300 flex-1">Odpowiedź</p>
                            <div>
                                <div className="flex flex-nowrap gap-1 h-10">
                                    <p className="w-3.75">0</p>
                                    <p className="w-3.75">0</p>
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
                        <div className="flex-1 flex justify-between gap-4">
                            <p className="border-dotted border-b-4 border-b-yellow-300 flex-1">Odpowiedź</p>
                            <div>
                                <div className="flex flex-nowrap gap-1 h-10">
                                    <p className="w-3.75">0</p>
                                    <p className="w-3.75">0</p>
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
                        <div className="flex-1 flex justify-between gap-4">
                            <p className="border-dotted border-b-4 border-b-yellow-300 flex-1">Odpowiedź</p>
                            <div>
                                <div className="flex flex-nowrap gap-1 h-10">
                                    <p className="w-3.75">0</p>
                                    <p className="w-3.75">0</p>
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
                        <div className="flex-1 flex justify-between gap-4">
                            <p className="border-dotted border-b-4 border-b-yellow-300 flex-1">Odpowiedź</p>
                            <div>
                                <div className="flex flex-nowrap gap-1 h-10">
                                    <p className="w-3.75">0</p>
                                    <p className="w-3.75">0</p>
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
                        <div className="flex-1 flex justify-between gap-4">
                            <p className="border-dotted border-b-4 border-b-yellow-300 flex-1">Odpowiedź</p>
                            <div>
                                <div className="flex flex-nowrap gap-1 h-10">
                                    <p className="w-3.75">0</p>
                                    <p className="w-3.75">0</p>
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
                                <p className="w-3.75">0</p>
                                <p className="w-3.75">0</p>
                            </div>
                            <div className="flex flex-nowrap gap-1">
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