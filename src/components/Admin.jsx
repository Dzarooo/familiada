import { useRef, useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, updateDoc, getDocs, collection } from "firebase/firestore";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";

const Admin = () => {

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

    const teamOneName = useRef("");
    const teamTwoName = useRef("");

    const teamRefs = {
        team1: teamOneName,
        team2: teamTwoName,
    }

    const [questions, setQuestions] = useState(null)

    const updateTeamName = async (team) => {
        const ref = teamRefs[team];

        if (!ref?.current) {
            console.error(`Invalid team ref: ${team}`);
            return;
        }

        const name = ref.current.value.trim();

        if (!name) {
            console.error("Team name is empty");
            return;
        }

        try {
            await updateDoc(
                doc(db, "teams", team),
                { name: name }
            );

            console.log(`Updated ${team}: ${name}`);
        } catch (err) {
            console.error("Failed to update team name:", err.message);
        }
    }

    const toggleAnswers = (id) => {
        setQuestions(prev => 
            prev.map(question => 
                question.id === id ? { ...question, answersShown: !question.answersShown} : { ...question, answersShown: false }
            )
        )
    }

    useEffect(() => {

        signInAnonymously(auth).catch(err => {
            console.error("Anon auth failed:", err);
        });

        const fetchAllTeams = async () => {
            try {

                const results = await Promise.all(
                    Object.keys(teamRefs).map(async (teamId) => {
                        const ref = doc(db, "teams", teamId);
                        const snap = await getDoc(ref);

                        if (!snap.exists()) {
                            throw new Error(`No such document: ${teamId}`);
                        }

                        return { teamId, ...snap.data() };
                    })
                );

                results.forEach(({ teamId, name }) => {
                    teamRefs[teamId].current.value = name;
                });

                console.log("fetched teams.");

            } catch (err) {
                console.error(err.message);
            }
        };

        const fetchQuestions = async () => {
            try {
                const docsSnap = await getDocs(collection(db, "questions"))

                const data = docsSnap.docs.map(doc => ({
                    id: doc.id,
                    answersShown: false,
                    ...doc.data(),
                }));

                // console.log(data);
                // data[0].answers.map((answer) => {
                //     console.log(answer.answer)
                // })
                setQuestions(data);
                console.log("fetched questions.");
            }
            catch (err) {
                console.error(err.message);
            }
        }

        const unsubAuth = onAuthStateChanged(auth, (user) => {
            if (!user) return;

            console.log("Auth ready");

            fetchAllTeams();
            fetchQuestions();
        });

        return () => unsubAuth();

    }, [db]);

    return (
        <div className="w-screen min-h-screen flex flex-col">

            {/* Teams */}
            <div className="w-screen flex justify-between p-5">
                <div className="flex gap-2 flex-nowrap h-fit">
                    <input ref={teamOneName} defaultValue="Loading..." placeholder="Nazwa drużyny 1" className="outline-none border-dotted border-b-4 pt-2 border-b-yellow-300"></input>
                    <button onClick={() => { updateTeamName("team1") }} className="bg-yellow-300 text-black px-2 rounded-lg cursor-pointer">Zapisz</button>
                </div>

                <div className="flex gap-2 flex-nowrap h-fit">
                    <input ref={teamTwoName} defaultValue="Loading..." placeholder="Nazwa drużyny 2" className="outline-none border-dotted border-b-4 pt-2 border-b-yellow-300"></input>
                    <button onClick={() => { updateTeamName("team2") }} className="bg-yellow-300 text-black px-2 rounded-lg cursor-pointer">Zapisz</button>
                </div>
            </div>

            {/* Questions */}
            <div className="flex-1 w-screen">
                {/* When loading */}
                {questions === null && <h1 className="text-center">Loading questions...</h1>}

                {/* Already loaded */}
                {questions != null &&
                    <div className="w-screen flex items-center flex-col gap-4">
                        <h1 className="text-center">Questions</h1>

                        <div className="min-w-fit w-[70vw]">
                            {questions.map((question, index) => {
                                return (
                                    <div key={question.id} className="border-solid border-t border-yellow-300 last:border-b flex flex-col gap-2">
                                        {/* question */}
                                        <div className="flex flex-nowrap justify-between p-2 cursor-pointer" onClick={() => {toggleAnswers(question.id)}}>
                                            <p>{index + 1}. {question.question}</p>
                                            <button className="border-solid border border-yellow-300 px-2 cursor-pointer bg-yellow-300 text-black">{question.isShown ? "Ukryj" : "Pokaż"}</button>
                                        </div>
                                        {/* answers */}
                                        <div className={`mx-6 flex-col gap-4 pb-2 ${question.answersShown ? "flex" : "hidden"}`}>
                                            {question.answers.map((answer, index) => (
                                                <div key={question.id + "answers" + index} className="flex justify-between border-dotted border-b-2 border-yellow-300 pb-2">
                                                    <p>{answer.answer}</p>
                                                    <div className="flex flex-nowrap gap-4">
                                                        <p>{answer.value}</p>
                                                        <button className={`border-solid border border-yellow-300 px-2 cursor-pointer ${answer.isShown ? "bg-transparent text-yellow-300" : "bg-yellow-300 text-black"}`}>{answer.isShown ? "Zakryj" : "Odkryj"}</button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                }
            </div>
        </div>
    )
}

export default Admin;