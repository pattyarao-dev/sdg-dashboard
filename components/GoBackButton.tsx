"use client";
import { redirect } from "next/navigation";
import { useRouter } from "next/navigation";
import { IoArrowBack } from "react-icons/io5";

const GoBackButton = () => {
  const router = useRouter();
  return (
    <button onClick={() => router.back()} className="button-style">
      <IoArrowBack className="" />
      <p>Go Back</p>
    </button>
  );
};

export default GoBackButton;
