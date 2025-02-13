"use client";
import { redirect } from "next/navigation";
import { useRouter } from "next/navigation";
import { IoArrowBack } from "react-icons/io5";

const GoBackButton = () => {
  const router = useRouter();
  return (
    <button
      onClick={() => router.back()}
      className="flex items-center justify-center gap-2 px-6 py-2 border-2 border-blue-500 text-blue-500 font-bold rounded-xl"
    >
      <IoArrowBack className="text-blue-500 font-black" />
      Go Back
    </button>
  );
};

export default GoBackButton;
