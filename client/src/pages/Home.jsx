import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <section className="hero">
      <img
        src="/images/homepage.png"
        alt="Domestic helper placeholder"
      />
      <div className="hero-content">
        <h1>MMTC — Trusted Foreign Domestic Worker Agency</h1>
        <p>
          <strong>Why direct hire from us?</strong><br />
          ✅ No agency fee — employers search directly from our pool of helpers.<br />
          ✅ Full transparency — you choose who to shortlist and interview.<br />
          ✅ Cost-effective — pay only for what you really need.<br />
        </p>
        <p>
          Need extra help? Our team is ready to assist with processing, transportation,
          recommendations, and practical advice. We make sure the hiring journey is smooth,
          simple, and fully supported when you need it.
        </p>
        <Link to="/helpers">Go to Helpers →</Link>
      </div>

    </section>
  );
}
