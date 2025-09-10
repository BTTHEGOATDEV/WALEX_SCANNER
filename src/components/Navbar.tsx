import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="flex justify-between items-center px-8 py-4 bg-neutral-900 shadow-md">
      <Link to="/" className="text-xl font-bold text-blue-500"> WALEXScan</Link>
      <div className="space-x-4">
        <Link to="/login" className="hover:underline">Login</Link>
        <Link to="/register" className="hover:underline">Register</Link>
      </div>
    </nav>
  );
}