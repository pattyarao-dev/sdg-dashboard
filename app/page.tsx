import Image from "next/image";
import pool from "@/utils/postgres";
import Login from "@/components/Login";

const fetchDataFromDB = async () => {
  try {
    const client = await pool.connect();
    console.log("Connected to DB");

    const result = await client.query("SELECT * FROM md_user");
    const data = result.rows;
    console.log("Fetched data:", data);

    client.release();
    return data;

  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

fetchDataFromDB()
  .then(data => {
    console.log("Received data:", data);

  })

  .catch(error => {
    console.error("Error fetching data:", error);
  });

export default function Home() {
  return (
    <div className="w-full min-h-screen flex items-center justify-center">
      <Login/>
    </div>
  );
}
