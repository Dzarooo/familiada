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
        <div className="w-screen flex justify-between p-5">
            <div className="flex gap-2 flex-nowrap">
                <input ref={teamOneName} placeholder="Nazwa drużyny 1" className="outline-none border-solid border-b border-b-yellow-300"></input>
                <button onClick={() => { UpdateTeamOneName() }} className="bg-yellow-300 text-black px-2 rounded-lg">Zapisz</button>
            </div>

            <div>
                <input ref={teamTwoName} placeholder="Nazwa drużyny 2" className="outline-none border-solid border-b border-b-yellow-300"></input>
                <button onClick={() => { UpdateTeamTwoName() }} className="bg-yellow-300 text-black px-2 rounded-lg">Zapisz</button>
            </div>
        </div>
    )
}

export default Admin;