import Login from "@/components/Login";

const LoginPage = () => {
  return (
    <main className="w-full min-h-screen flex flex-col items-center justify-center gap-10">
      <Login />
      {/* <p>
        Create New Account{" "}
        <span className="text-blue-600 font-medium underline">
          <Link href="/signup">Sign Up</Link>
        </span>
      </p> */}
    </main>
  );
};

export default LoginPage;
