import { Link } from "react-router-dom";

const Landing = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-center p-10">
      <h1 className="text-4xl md:text-6xl font-bold mb-4">Pent Flow Hub</h1>
      <p className="text-lg mb-6">A powerful internal pentesting dashboard built for speed and control.</p>
      <div className="space-x-4">
        <Link to="/login" className="bg-white text-indigo-600 font-semibold px-6 py-2 rounded shadow hover:bg-gray-200">
          Login
        </Link>
        <Link to="/register" className="border border-white px-6 py-2 rounded font-semibold hover:bg-white hover:text-indigo-600">
          Register
        </Link>
      </div>
    </div>
  );
};

export default Landing;