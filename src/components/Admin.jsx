import { useRef } from "react";

const Admin = () => {

    const teamOneName = useRef("");
    const teamTwoName = useRef("");

    const UpdateTeamOneName = () => {
        console.log(teamOneName.current.value);
    }

    const UpdateTeamTwoName = () => {
        console.log(teamTwoName.current.value);
    }

    return (
        <>
            <input ref={teamOneName} placeholder="Nazwa drużyny 1"></input>
            <button onClick={() => { UpdateTeamOneName() }}>Zapisz</button>

            <input ref={teamTwoName} placeholder="Nazwa drużyny 2"></input>
            <button onClick={() => { UpdateTeamTwoName() }}>Zapisz</button>
        </>
    )
}

export default Admin;