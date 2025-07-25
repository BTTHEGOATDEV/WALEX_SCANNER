import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-white">
      <Navbar />
      <section className="text-center py-28 px-4 max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Welcome to CyberScan</h1>
        <p className="text-lg mb-6">Professional Pentesting Simplified. Monitor, Scan, Report.</p>
        <div className="flex justify-center gap-4">
          <Link to="/register" className="bg-blue-600 px-6 py-2 rounded-md hover:bg-blue-700">
            Get Started
          </Link>
          <Link to="/login" className="border px-6 py-2 rounded-md hover:bg-neutral-800">
            Sign In
          </Link>
        </div>
      </section>
    </div>
  );
}
