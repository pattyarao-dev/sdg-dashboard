"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { getUserRoles } from "../actions/actions";

interface UserRole {
  user_type_id: number;
  name: string;
}

const SignUp = () => {
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [selectedRoleId, setSelectedRoleId] = useState<number | "">("");
  const [roles, setRoles] = useState<UserRole[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchRoles = async () => {
      const availableRoles = await getUserRoles();
      setRoles(availableRoles);
    };
    fetchRoles();
  }, []);

  const handleSignup = async () => {
    //PLEASE IMPLEMENT IF FORMS ARE NOT FILLED (like toast or somethin)
    if (!firstname || !lastname || !email || !password || !selectedRoleId) {
      console.log("Please complete the forms!");
      return;
    }

    if (password !== confirm) {
      console.log("Please make sure the passwords are the same");
      return;
    }

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({
        firstname,
        lastname,
        email,
        password,
        roleId: selectedRoleId,
      }),
    });

    const json = await res.json();

    if (!res.ok) {
      // DO SOMETHING HERE HEHE
    } else {
      // MEANING SUCCESS DO SOMETHING HERE TOO! For now redirect ko lang sa login
      console.log(json);
      router.push("/");
    }
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center">
      <div className="w-[25%] h-fit p-10 bg-white/20 backdrop-blur rounded-lg flex flex-col items-center justify-center gap-10">
        <div className="w-full flex flex-col gap-6 items-center justify-center">
          <input
            className="w-full p-2 rounded-md text-xs"
            type="text"
            placeholder="First Name"
            value={firstname}
            onChange={(e) => setFirstname(e.target.value)}
          />
          <input
            className="w-full p-2 rounded-md text-xs"
            type="text"
            placeholder="Last Name"
            value={lastname}
            onChange={(e) => setLastname(e.target.value)}
          />
          <input
            className="w-full p-2 rounded-md text-xs"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <select
            className="w-full p-2 rounded-md text-xs"
            value={selectedRoleId}
            onChange={(e) => setSelectedRoleId(Number(e.target.value))}
          >
            <option value="">Select Role</option>
            {roles.map((role) => (
              <option key={role.user_type_id} value={role.user_type_id}>
                {role.name}
              </option>
            ))}
          </select>
          <input
            className="w-full p-2 rounded-md text-xs"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <input
            className="w-full p-2 rounded-md text-xs"
            type="password"
            placeholder="Confirm Password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
          <button
            className="w-full px-4 py-2 bg-yellow-500 rounded-md"
            onClick={handleSignup}
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
