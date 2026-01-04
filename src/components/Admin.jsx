import { useRef, useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, updateDoc, getDocs, collection, increment, addDoc, serverTimestamp, orderBy, query, deleteDoc } from "firebase/firestore";
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

    const [questions, setQuestions] = useState(null);

    //This code do be getting worse with each commit (and deadline being closer :skull:)
    const formQuestion = useRef("");
    const formAnswer1 = useRef("");
    const formAnswer2 = useRef("");
    const formAnswer3 = useRef("");
    const formAnswer4 = useRef("");
    const formAnswer5 = useRef("");
    const formValue1 = useRef("");
    const formValue2 = useRef("");
    const formValue3 = useRef("");
    const formValue4 = useRef("");
    const formValue5 = useRef("");


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

        if (e.target.classList.contains("questionButton")) return;

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

            if (activeQuestion != id) {

                await updateDoc(
                    doc(db, "game_data", "game_data"),
                    { activeQuestion: id }
                );

                if (activeQuestion != -1) {
                    await updateDoc(
                        doc(db, "questions", activeQuestion),
                        {
                            "answers.0.isShown": false,
                            "answers.1.isShown": false,
                            "answers.2.isShown": false,
                            "answers.3.isShown": false,
                            "answers.4.isShown": false
                        }
                    )

                    setQuestions(prev =>
                        prev.map(question => {

                            if (question.id != id) {

                                question.isActive = false

                                const newAnswers = Object.fromEntries(
                                    Object.entries(question.answers).map(([id, answer]) => [
                                        id,
                                        { ...answer, isShown: false }
                                    ])
                                )

                                return { ...question, answers: newAnswers };
                            }
                            else question.isActive = true;

                            return question;
                        })
                    );


                }
                else {

                    setQuestions(prev =>
                        prev.map(question => {
                            if (question.id != id) {
                                question.isActive = false
                            }
                            else question.isActive = true;

                            return question;
                        })
                    );
                }

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

                await updateDoc(
                    doc(db, "questions", activeQuestion),
                    {
                        "answers.0.isShown": false,
                        "answers.1.isShown": false,
                        "answers.2.isShown": false,
                        "answers.3.isShown": false,
                        "answers.4.isShown": false
                    }
                )

                setQuestions(prev =>
                    prev.map(question => {
                        question.isActive = false;
                        if (question.id != activeQuestion) return question;

                        const newAnswers = Object.fromEntries(
                            Object.entries(question.answers).map(([id, answer]) => [
                                id,
                                { ...answer, isShown: false }
                            ])
                        )

                        return { ...question, answers: newAnswers };
                    })
                )

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

    const showAllAnswers = async (id) => {
        try {
            await updateDoc(
                doc(db, "questions", id),
                {
                    "answers.0.isShown": true,
                    "answers.1.isShown": true,
                    "answers.2.isShown": true,
                    "answers.3.isShown": true,
                    "answers.4.isShown": true
                }
            )

            setQuestions(prev =>
                prev.map(question => {
                    if (question.id != id) return question;

                    const newAnswers = Object.fromEntries(
                        Object.entries(question.answers).map(([id, answer]) => [
                            id,
                            { ...answer, isShown: true }
                        ])
                    )

                    return { ...question, answers: newAnswers };
                })
            )
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

    const createQuestion = async () => {

        if (
            formQuestion.current.value == "" ||
            formAnswer1.current.value == "" ||
            formAnswer2.current.value == "" ||
            formAnswer3.current.value == "" ||
            formAnswer4.current.value == "" ||
            formAnswer5.current.value == "" ||
            formValue1.current.value == "" ||
            formValue2.current.value == "" ||
            formValue3.current.value == "" ||
            formValue4.current.value == "" ||
            formValue5.current.value == ""
        ) {
            console.error("At least one input is empty.")
            return;
        }

        const newQuestion = {
            question: formQuestion.current.value,
            createdAt: serverTimestamp(),
            answers: {
                0: {
                    answer: formAnswer1.current.value,
                    value: formValue1.current.value,
                },
                1: {
                    answer: formAnswer2.current.value,
                    value: formValue2.current.value,
                },
                2: {
                    answer: formAnswer3.current.value,
                    value: formValue3.current.value,
                },
                3: {
                    answer: formAnswer4.current.value,
                    value: formValue4.current.value,
                },
                4: {
                    answer: formAnswer5.current.value,
                    value: formValue5.current.value,
                }
            }
        }

        try {
            const docRef = await addDoc(
                collection(db, "questions"),
                newQuestion
            )

            newQuestion.id = docRef.id;
            newQuestion.answersShown = false;
            newQuestion.isActive = false;

            setQuestions(prev => [...prev, newQuestion])

            console.log("Passed", newQuestion);
        }
        catch (err) {
            console.error(err.message);
        }

    }

    const deleteQuestion = async (id) => {
        try {
            await deleteDoc(doc(db, "questions", id))


            setQuestions(prev => {
                const updated = prev.filter(question => question.id != id);
                return updated;
            })

            console.log("deleted question with id", id)
        }
        catch (err) {
            console.log(err.message);
        }
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

                const questionsQuery = query(
                    collection(db, "questions"),
                    orderBy("createdAt", "asc")
                );

                const docsSnap = await getDocs(questionsQuery);

                const data = docsSnap.docs.map(doc => ({
                    id: doc.id,
                    answersShown: false,
                    isActive: false,
                    ...doc.data(),
                }));

                const finalData = data.map(doc => {

                    if (doc.id === activeQuestion) doc.isActive = true;
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
                            <div>
                                {questions.map((question, index) => {
                                    return (
                                        <div key={question.id} className={`border-solid border-t border-yellow-300 last:border-b flex flex-col gap-2 ${question.answersShown ? "bg-yellow-500/10" : "bg-transparent"} `}>
                                            {/* question */}
                                            <div onClick={(e) => { toggleAnswers(e, question.id) }} className="flex flex-nowrap justify-between p-2 cursor-pointer">
                                                <p>{index + 1}. {question.question}</p>
                                                <div className="flex flex-nowrap gap-2">
                                                    {question.isActive &&
                                                        <button onClick={() => { showAllAnswers(question.id) }} className="questionButton bg-yellow-300 text-black px-2 border border-solid border-yellow-300 cursor-pointer">Odkryj wszystkie odpowiedzi</button>
                                                    }
                                                    <button onClick={() => { toggleQuestion(question.id) }} className={`questionButton border-solid border border-yellow-300 px-2 cursor-pointer ${question.isActive ? "bg-transparent text-yellow-300" : "bg-yellow-300 text-black"}`}>{question.isActive ? "Ukryj" : "Pokaż"}</button>
                                                    <button onClick={() => { deleteQuestion(question.id) }} className="questionButton bg-yellow-300 text-black px-2 border border-solid border-yellow-300 cursor-pointer">Usuń</button>
                                                </div>
                                            </div>
                                            {/* answers */}
                                            <div className={`mx-6 flex-col gap-4 pb-2 ${question.answersShown ? "flex" : "hidden"}`}>
                                                {Object.entries(question.answers).map(([id, answer]) => (
                                                    <div key={question.id + "answers" + id} className="flex justify-between border-dotted border-b-2 border-yellow-300 pb-2">
                                                        <p>{answer.answer}</p>
                                                        <div className="flex flex-nowrap gap-4">
                                                            <p>{answer.value}</p>
                                                            {question.isActive &&
                                                                <button onClick={() => { toggleAnswer(question.id, id) }} className={`border-solid border border-yellow-300 px-2 cursor-pointer ${answer.isShown ? "bg-transparent text-yellow-300" : "bg-yellow-300 text-black"}`}>{answer.isShown ? "Zakryj" : "Odkryj"}</button>
                                                            }
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>

                            <div className="border-solid border-t border-yellow-300 border-b flex flex-col gap-2 pb-4 pt-2 mt-25">
                                {/* question */}
                                <input ref={formQuestion} placeholder="Treść pytania" className="outline-none"></input>
                                {/* answers */}
                                <div className="mx-6 flex-col gap-4 pb-2">
                                    <div className="justify-between border-dotted border-b-2 border-yellow-300 pt-2 flex flex-nowrap">
                                        <input ref={formAnswer1} placeholder="Odpowiedź 1" className="flex-1 outline-none"></input>
                                        <input ref={formValue1} placeholder="Wartość 1" className="text-right outline-none"></input>
                                    </div>
                                    <div className="justify-between border-dotted border-b-2 border-yellow-300 pt-2 flex flex-nowrap">
                                        <input ref={formAnswer2} placeholder="Odpowiedź 2" className="flex-1 outline-none"></input>
                                        <input ref={formValue2} placeholder="Wartość 2" className="text-right outline-none"></input>
                                    </div>
                                    <div className="justify-between border-dotted border-b-2 border-yellow-300 pt-2 flex flex-nowrap">
                                        <input ref={formAnswer3} placeholder="Odpowiedź 3" className="flex-1 outline-none"></input>
                                        <input ref={formValue3} placeholder="Wartość 3" className="text-right outline-none"></input>
                                    </div>
                                    <div className="justify-between border-dotted border-b-2 border-yellow-300 pt-2 flex flex-nowrap">
                                        <input ref={formAnswer4} placeholder="Odpowiedź 4" className="flex-1 outline-none"></input>
                                        <input ref={formValue4} placeholder="Wartość 4" className="text-right outline-none"></input>
                                    </div>
                                    <div className="justify-between border-dotted border-b-2 border-yellow-300 pt-2 flex flex-nowrap">
                                        <input ref={formAnswer5} placeholder="Odpowiedź 5" className="flex-1 outline-none"></input>
                                        <input ref={formValue5} placeholder="Wartość 5" className="text-right outline-none"></input>
                                    </div>

                                </div>

                                <button onClick={() => { createQuestion() }} className="bg-yellow-300 text-black w-fit px-2 cursor-pointer">Dodaj Pytanie</button>

                            </div>

                        </div>

                    </div>
                }
            </div>
        </div>
    )
}

export default Admin;