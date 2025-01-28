"use client";
import { redirect } from "next/navigation";
import { IoArrowBack } from "react-icons/io5";

const GoBackButton = () => {
  return (
    <button
      onClick={() => redirect("/indicatormanagement")}
      className="flex items-center justify-center gap-2 px-4 py-1 bg-blue-100"
    >
      <IoArrowBack />
      Go Back
    </button>
  );
};

export default GoBackButton;
