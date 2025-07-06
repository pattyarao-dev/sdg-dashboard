"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (res?.error) {
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div className="w-[25%] h-fit p-10 bg-white drop-shadow-lg rounded-lg flex flex-col items-center justify-center gap-10">
      <h1 className="w-full text-center text-2xl uppercase font-black text-yellow-500">
        SDG Dashboard
      </h1>
      <div className="w-full flex flex-col gap-6 items-center justify-center">
        <input
          className="w-full p-2 rounded-md text-xs border border-gray-300"
          type="text"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
          value={email}
        />
        <input
          className="w-full p-2 rounded-md text-xs border border-gray-300"
          type="password"
          placeholder="password"
          onChange={(e) => setPassword(e.target.value)}
          value={password}
        />
      </div>
      <div className="w-full">
        <button
          className="w-full px-4 py-2 bg-yellow-500 rounded-md"
          onClick={handleLogin}
        >
          Login
        </button>
      </div>
    </div>
  );
};

export default Login;
