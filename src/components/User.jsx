import { initializeApp } from "firebase/app";
import { getFirestore, doc, onSnapshot } from "firebase/firestore";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { useState, useEffect } from "react";

const User = () => {

    const [teamOneName, setTeamOneName] = useState("loading...");
    const [teamTwoName, setTeamTwoName] = useState("loading...");

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
                console.log("New team1 name:", snap.data().name);
                setTeamOneName(snap.data().name);
            });

            const unsubTeam2 = onSnapshot(doc(db, "teams", "team2"), (snap) => {
                if (!snap.exists()) return;
                console.log("New team2 name:", snap.data().name);
                setTeamTwoName(snap.data().name);
            });

            return () => {
                unsubTeam1();
                unsubTeam2();
            };
        });

        return () => unsubAuth();
    }, [db])

    return (
        <div className="w-screen flex justify-between p-5">
            <p>{teamOneName}</p>
            <p>{teamTwoName}</p>
        </div>
    )
}

export default User;