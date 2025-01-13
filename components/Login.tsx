"use client"

const Login = () => {
    return (
        <div className="w-[25%] h-fit p-10 bg-white/20 backdrop-blur rounded-lg flex flex-col items-center justify-center gap-10">
            <h1 className="w-full text-center text-2xl uppercase font-black text-yellow-500">SDG Dashboard</h1>
            <div className="w-full flex flex-col gap-6 items-center justify-center">
                <input className="w-full p-2 rounded-md text-xs" type="text" placeholder="Email"/>
                <input className="w-full p-2 rounded-md text-xs" type="password" placeholder="password" />
            </div>
            <div className="w-full">
                <button className="w-full px-4 py-2 bg-yellow-500 rounded-md">Login</button>
            </div>
        </div>
    )
}

export default Login