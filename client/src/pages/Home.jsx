import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <section className="hero">
      <img
        src="https://via.placeholder.com/800x400"
        alt="Domestic helper placeholder"
      />
      <div className="hero-content">
        <h1>MMTC — Trusted Foreign Domestic Worker Agency</h1>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis auctor,
          metus in pulvinar pulvinar, enim sem tristique lorem, non hendrerit dui
          ante nec augue.
        </p>
        <p>
          Suspendisse potenti. Aenean non lacus non odio consequat tincidunt.
          Integer ornare nulla at tellus placerat, nec suscipit velit sodales.
        </p>
        <Link to="/helpers">Go to Helpers →</Link>
      </div>
    </section>
  );
}
