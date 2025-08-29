// If not already installed: npm i lucide-react
import { CheckCircle2, Search, Wallet, ArrowRight } from "lucide-react";
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <section className="hero flex flex-col md:flex-row items-center gap-8">
      <img
        src="/images/homepage.png"
        alt="Domestic helper placeholder"
        className="w-full md:w-1/2 rounded-lg shadow"
      />

      <div className="hero-content md:w-1/2">
        <h1 className="text-3xl font-bold mb-4">
          MMTC — Trusted Foreign Domestic Worker Agency
        </h1>

        {/* Callout box */}
        <div className="bg-gray-50 border-l-4 border-green-600 rounded-md p-6 shadow-sm mb-4">
          <h2 className="text-xl font-semibold mb-3">Why direct hire from us?</h2>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 text-green-600" />
              <span>No agency fee — employers search directly from our pool of helpers</span>
            </li>
            <li className="flex items-start gap-3">
              <Search className="mt-0.5 h-5 w-5 text-green-600" />
              <span>Full transparency — you choose who to shortlist and interview</span>
            </li>
            <li className="flex items-start gap-3">
              <Wallet className="mt-0.5 h-5 w-5 text-green-600" />
              <span>Cost-effective — pay only for what you really need</span>
            </li>
          </ul>
        </div>

        <p className="text-gray-600 mb-4">
          Need extra help? Our team can assist with processing, transportation,
          recommendations, and practical advice. We keep the hiring journey
          smooth, simple, and fully supported when you need it.
        </p>

        <Link to="/helpers" className="helpers-btn">
          Go to Helpers →
        </Link>


      </div>
    </section>
  );
}
