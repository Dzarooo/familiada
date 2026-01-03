import { useRef, useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, updateDoc, getDocs, collection, increment } from "firebase/firestore";
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

    const [isAnyQuestionShown, setIsAnyQuestionShown] = useState(false);

    const [answeringTeam, setAnsweringTeam] = useState(-1);
    const [mistakes, setMistakes] = useState(0);

    const teamRefs = {
        team1: teamOneName,
        team2: teamTwoName,
    }

    const [questions, setQuestions] = useState(null)

    // Update given team name in database.
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

    // Show answers accordion component.
    const toggleAnswers = (e, id) => {

        if (e.target.classList.contains("toggleAnswersButton")) return;

        setQuestions(prev =>
            prev.map(question =>
                question.id === id ? { ...question, answersShown: !question.answersShown } : { ...question, answersShown: false }
            )
        );
    }

    const toggleQuestion = async (id) => {

        try {
            const snap = await getDoc(doc(db, "game_data", "game_data"))
            const activeQuestion = snap.data().activeQuestion;
            //console.log(activeQuestion);

            if (activeQuestion != id) {

                await updateDoc(
                    doc(db, "game_data", "game_data"),
                    { activeQuestion: id }
                );

                setQuestions(prev =>
                    prev.map(question => {
                        if (question.id != id) {
                            question.isActive = false
                        }
                        else question.isActive = true;

                        return question;
                    })
                );

                setIsAnyQuestionShown(true);
            }
            else {
                await updateDoc(
                    doc(db, "game_data", "game_data"),
                    {
                        activeQuestion: -1,
                        answeringTeam: -1,
                        mistakes: 0
                    }
                );

                setQuestions(prev =>
                    prev.map(question => {
                        question.isActive = false;

                        return question;
                    })
                );

                setAnsweringTeam(-1);
                setMistakes(0);
                setIsAnyQuestionShown(false);
            }

            console.log("Toggled active question.")
        }
        catch (err) {
            console.error(err.message);
        }

    }

    // Toggle answer isShown boolean in database.
    const toggleAnswer = async (questionId, answerId) => {
        //console.log(questionId, answerId);
        try {
            const ref = doc(db, "questions", questionId);
            const docSnap = await getDoc(ref);
            const current = docSnap.data().answers[answerId].isShown;

            await updateDoc(
                ref,
                { [`answers.${answerId}.isShown`]: !current }
            );


            setQuestions(prev =>
                prev.map(question => {
                    if (question.id != questionId) return question;

                    const newAnswers = Object.fromEntries(
                        Object.entries(question.answers).map(([id, answer]) => [
                            id,
                            id === answerId ? { ...answer, isShown: !current } : answer
                        ])
                    )

                    return { ...question, answers: newAnswers };
                })
            )

            console.log("toggled answer for questionId " + questionId + " and answerId " + answerId);
        }
        catch (err) {
            console.error(err.message);
        }
    }

    const selectAnsweringTeam = async (team) => {
        if (team === answeringTeam) {
            await updateDoc(
                doc(db, "game_data", "game_data"),
                {
                    answeringTeam: -1,
                    mistakes: 0
                }
            )
            setAnsweringTeam(-1)
            setMistakes(0);
        }
        else {
            await updateDoc(
                doc(db, "game_data", "game_data"),
                {
                    answeringTeam: team,
                    mistakes: 0
                }
            )
            setAnsweringTeam(team);
            setMistakes(0);
        }
    }

    const increaseMistakes = async () => {
        await updateDoc(
            doc(db, "game_data", "game_data"),
            { mistakes: increment(1) }
        )
        setMistakes(prev => prev + 1);
    }

    useEffect(() => {

        signInAnonymously(auth).catch(err => {
            console.error("Anon auth failed:", err);
        });

        const fetchGameData = async () => {
            const gameDataSnap = await getDoc(doc(db, "game_data", "game_data"));
            const gameData = gameDataSnap.data();

            setAnsweringTeam(gameData.answeringTeam);
            setMistakes(gameData.mistakes);
            if (gameData.activeQuestion != -1) setIsAnyQuestionShown(true)

            return gameData
        }

        const fetchTeams = async () => {
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

        const fetchQuestions = async (activeQuestion) => {
            try {
                const docsSnap = await getDocs(collection(db, "questions"))

                const data = docsSnap.docs.map(doc => ({
                    id: doc.id,
                    answersShown: false,
                    isActive: false,
                    ...doc.data(),
                }));

                const finalData = data.map(doc => {
                    if (parseInt(doc.id) === parseInt(activeQuestion)) doc.isActive = true;
                    return doc;
                })

                //console.log(finalData);
                setQuestions(finalData);
                console.log("fetched questions.");
            }
            catch (err) {
                console.error(err.message);
            }
        }

        const unsubAuth = onAuthStateChanged(auth, async (user) => {
            if (!user) return;

            console.log("Auth ready");

            const gameData = await fetchGameData();
            fetchTeams();
            fetchQuestions(gameData.activeQuestion);
        });

        return () => unsubAuth();

    }, [db]);

    // im sorry for myself and for anyone seeing this...
    const getMistakesStyleButton = (button) => {
        if (mistakes == 0) {
            if (button == 0) {
                return "text-red-400 bg-red-950/50 hover:bg-red-950";
            }
            else if (button == 1) {
                return "border-gray-400 text-gray-400 bg-gray-900";
            }
            else if (button == 2) {
                return "border-gray-400 text-gray-400 bg-gray-900";
            }
            else if (button == 3) {
                return "border-gray-400 text-gray-400 bg-gray-900";
            }
            else {
                console.error("invalid button order number provided.")
            }
        }
        else if (mistakes == 1) {
            if (button == 0) {
                return "text-red-950 bg-red-400";
            }
            else if (button == 1) {
                return "text-red-400 bg-red-950/50 hover:bg-red-950";
            }
            else if (button == 2) {
                return "border-gray-400 text-gray-400 bg-gray-900";
            }
            else if (button == 3) {
                return "border-gray-400 text-gray-400 bg-gray-900";
            }
            else {
                console.error("invalid button order number provided.")
            }
        }
        else if (mistakes == 2) {
            if (button == 0) {
                return "text-red-950 bg-red-400";
            }
            else if (button == 1) {
                return "text-red-950 bg-red-400";
            }
            else if (button == 2) {
                return "text-red-400 bg-red-950/50 hover:bg-red-950";
            }
            else if (button == 3) {
                return "border-gray-400 text-gray-400 bg-gray-900";
            }
            else {
                console.error("invalid button order number provided.")
            }
        }
        else if (mistakes == 3) {
            if (button == 0) {
                return "text-red-950 bg-red-400";
            }
            else if (button == 1) {
                return "text-red-950 bg-red-400";
            }
            else if (button == 2) {
                return "text-red-950 bg-red-400";
            }
            else if (button == 3) {
                return "text-red-400 bg-red-950/50 hover:bg-red-950";
            }
            else {
                console.error("invalid button order number provided.")
            }
        }
        else if (mistakes == 4) {
            if (button == 0) {
                return "text-red-950 bg-red-400";
            }
            else if (button == 1) {
                return "text-red-950 bg-red-400";
            }
            else if (button == 2) {
                return "text-red-950 bg-red-400";
            }
            else if (button == 3) {
                return "text-red-950 bg-red-400";
            }
            else {
                console.error("invalid button order number provided.")
            }
        }
    }

    return (
        <div className="w-screen min-h-screen flex flex-col">

            {/* Teams */}
            <div className="w-screen flex justify-between p-5">

                {/* team 1 */}
                <div className="flex flex-nowrap flex-col gap-2">
                    <div className="flex gap-2 flex-nowrap h-fit">
                        <input ref={teamOneName} defaultValue="Loading..." placeholder="Nazwa drużyny 1" className="outline-none border-dotted border-b-4 pt-2 border-b-yellow-300"></input>
                        <button onClick={() => { updateTeamName("team1") }} className="bg-yellow-300 text-black px-2 rounded-lg cursor-pointer">Zapisz</button>
                    </div>

                    {answeringTeam != 1 && isAnyQuestionShown &&
                        <button onClick={() => { selectAnsweringTeam(0) }} className={`w-full border-solid border cursor-pointer border-yellow-300 ${answeringTeam == 0 ? "bg-yellow-300 text-black hover:bg-yellow-300/85" : "bg-transparent text-yellow-300 hover:bg-yellow-500/15"}`}><i className="bi bi-megaphone-fill"></i></button>
                    }

                    {answeringTeam === 0 &&
                        <div className="w-full flex">
                            <button disabled={mistakes != 0} onClick={() => { increaseMistakes() }} className={`flex-1/3 border border-solid cursor-pointer font-extrabold ${getMistakesStyleButton(0)} `}>X</button>
                            <button disabled={mistakes != 1} onClick={() => { increaseMistakes() }} className={`flex-1/3 border border-solid cursor-pointer font-extrabold ${getMistakesStyleButton(1)}`}>X</button>
                            <button disabled={mistakes != 2} onClick={() => { increaseMistakes() }} className={`flex-1/3 border border-solid cursor-pointer font-extrabold ${getMistakesStyleButton(2)} `}>X</button>
                        </div>
                    }

                    {answeringTeam === 1 &&
                        <button disabled={mistakes != 3} onClick={() => { increaseMistakes() }} className={`w-full border border-solid cursor-pointer font-extrabold ${getMistakesStyleButton(3)} `}>X</button>
                    }
                </div>

                {/* team 2 */}
                <div className="flex flex-nowrap flex-col gap-2">
                    <div className="flex gap-2 flex-nowrap h-fit">
                        <input ref={teamTwoName} defaultValue="Loading..." placeholder="Nazwa drużyny 2" className="outline-none border-dotted border-b-4 pt-2 border-b-yellow-300"></input>
                        <button onClick={() => { updateTeamName("team2") }} className="bg-yellow-300 text-black px-2 rounded-lg cursor-pointer">Zapisz</button>
                    </div>

                    {answeringTeam != 0 && isAnyQuestionShown &&
                        <button onClick={() => { selectAnsweringTeam(1) }} className={`w-full border-solid border cursor-pointer border-yellow-300 ${answeringTeam == 1 ? "bg-yellow-300 text-black hover:bg-yellow-300/85" : "bg-transparent text-yellow-300 hover:bg-yellow-500/15"}`}><i className="bi bi-megaphone-fill"></i></button>
                    }

                    {answeringTeam === 1 &&
                        <div className="w-full flex">
                            <button disabled={mistakes != 0} onClick={() => { increaseMistakes() }} className={`flex-1/3 border border-solid cursor-pointer font-extrabold ${getMistakesStyleButton(0)} `}>X</button>
                            <button disabled={mistakes != 1} onClick={() => { increaseMistakes() }} className={`flex-1/3 border border-solid cursor-pointer font-extrabold ${getMistakesStyleButton(1)} `}>X</button>
                            <button disabled={mistakes != 2} onClick={() => { increaseMistakes() }} className={`flex-1/3 border border-solid cursor-pointer font-extrabold ${getMistakesStyleButton(2)} `}>X</button>
                        </div>
                    }

                    {answeringTeam === 0 &&
                        <button disabled={mistakes != 3} onClick={() => { increaseMistakes() }} className={`w-full border border-solid cursor-pointer font-extrabold ${getMistakesStyleButton(3)} `}>X</button>
                    }
                </div>
            </div>

            {/* Questions */}
            <div className="flex-1 w-screen">
                {/* When loading */}
                {questions === null && <h1 className="text-center">Loading questions...</h1>}

                {/* Already loaded */}
                {questions != null &&
                    <div className="w-screen flex items-center flex-col gap-4">
                        <h1 className="text-center">Pytania</h1>

                        <div className="min-w-fit w-[70vw]">
                            {questions.map((question, index) => {
                                return (
                                    <div key={question.id} className="border-solid border-t border-yellow-300 last:border-b flex flex-col gap-2">
                                        {/* question */}
                                        <div onClick={(e) => { toggleAnswers(e, question.id) }} className="flex flex-nowrap justify-between p-2 cursor-pointer">
                                            <p>{index + 1}. {question.question}</p>
                                            <button onClick={() => { toggleQuestion(question.id) }} className={`toggleAnswersButton border-solid border border-yellow-300 px-2 cursor-pointer ${question.isActive ? "bg-transparent text-yellow-300" : "bg-yellow-300 text-black"}`}>{question.isActive ? "Ukryj" : "Pokaż"}</button>
                                        </div>
                                        {/* answers */}
                                        <div className={`mx-6 flex-col gap-4 pb-2 ${question.answersShown ? "flex" : "hidden"}`}>
                                            {Object.entries(question.answers).map(([id, answer]) => (
                                                <div key={question.id + "answers" + id} className="flex justify-between border-dotted border-b-2 border-yellow-300 pb-2">
                                                    <p>{answer.answer}</p>
                                                    <div className="flex flex-nowrap gap-4">
                                                        <p>{answer.value}</p>
                                                        <button onClick={() => { toggleAnswer(question.id, id) }} className={`border-solid border border-yellow-300 px-2 cursor-pointer ${answer.isShown ? "bg-transparent text-yellow-300" : "bg-yellow-300 text-black"}`}>{answer.isShown ? "Zakryj" : "Odkryj"}</button>
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