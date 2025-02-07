import Link from "next/link";

const Navbar = () => {
  return (
    <div className="w-full h-fit sticky top-0 flex items-center justify-between bg-gradient-to-br from-green-200/80 to-orange-100/80 backdrop-blur px-10 py-6 drop-shadow-lg text-gray-700 font-semibold uppercase">
      <div className="">
        <h1>SDG Dashboard</h1>
      </div>
      <div className="w-fit flex items-center justify-end gap-8">
        <p>Home</p>
        <Link href="/indicatormanagement">Indicator Management</Link>
        <Link href="/projectmanagement">Project Management</Link>
      </div>
    </div>
  );
};

export default Navbar;
