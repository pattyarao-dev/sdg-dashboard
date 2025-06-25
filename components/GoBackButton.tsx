"use client";
import { useRouter } from "next/navigation";
import { IoArrowBack } from "react-icons/io5";

const GoBackButton = () => {
  const router = useRouter();
  return (
    <button onClick={() => router.back()} className="navigation-button">
      <IoArrowBack className="" />
      <p>Go Back</p>
    </button>
  );
};

export default GoBackButton;
