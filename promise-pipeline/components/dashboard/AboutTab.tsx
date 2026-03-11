export default function AboutTab() {
  return (
    <div className="prose prose-sm max-w-none">
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="font-serif text-xl font-bold text-gray-900">About Promise Pipeline</h2>

        <p className="mt-4 text-sm leading-relaxed text-gray-700">
          Promise Pipeline applies <strong>Promise Theory</strong> (Burgess, 2004) to commitment
          tracking, auditing, and simulation. Every institution, law, and AI system rests on a
          network of interdependent commitments. These commitments are currently scattered,
          self-assessed, and invisible to the people they are meant to protect.
        </p>

        <p className="mt-3 text-sm leading-relaxed text-gray-700">
          We make them <strong>legible</strong>, <strong>auditable</strong>, and{" "}
          <strong>simulable</strong>.
        </p>

        <h3 className="mt-6 font-serif text-lg font-bold text-gray-900">Promise Theory</h3>

        <p className="mt-3 text-sm leading-relaxed text-gray-700">
          Mark Burgess identified that centrally imposed policies consistently fail when
          autonomous nodes encounter conditions the policy designer did not anticipate. His
          alternative — having each node publish its own behavioral commitments (promises) —
          proved more robust because the architecture handles novelty differently.
        </p>

        <blockquote className="mt-4 border-l-4 border-gray-300 pl-4 italic text-gray-600">
          &ldquo;Existing theories based on obligations were unsuitable as they amounted to
          wishful thinking.&rdquo;
          <br />
          <span className="not-italic text-xs text-gray-400">— Mark Burgess, 2005</span>
        </blockquote>

        <h3 className="mt-6 font-serif text-lg font-bold text-gray-900">The Promise Schema</h3>

        <p className="mt-3 text-sm leading-relaxed text-gray-700">
          Every commitment — whether statutory, corporate, or algorithmic — decomposes into
          the same structure: <strong>who</strong> promised <strong>what</strong> to{" "}
          <strong>whom</strong>, by <strong>when</strong>, verified <strong>how</strong>, and
          depending on <strong>what other promises</strong>.
        </p>

        <h3 className="mt-6 font-serif text-lg font-bold text-gray-900">From Tracking to Simulation</h3>

        <p className="mt-3 text-sm leading-relaxed text-gray-700">
          A static dashboard showing promise statuses is useful. A simulation engine that models
          downstream consequences of commitment changes is transformative. The <strong>Network</strong>{" "}
          tab on this dashboard lets you click any promise, change its status, and see cascade
          effects propagate through the dependency graph.
        </p>

        <h3 className="mt-6 font-serif text-lg font-bold text-gray-900">References</h3>

        <ul className="mt-3 space-y-1 text-xs text-gray-500">
          <li>Burgess, M. (2004). Promise Theory — original formalization.</li>
          <li>Burgess, M. & Siri, J. (2014). <em>Thinking in Promises</em>. O&apos;Reilly Media.</li>
          <li>Sull, D. & Spinosa, C. (2007). &ldquo;Promise-Based Management.&rdquo; <em>Harvard Business Review</em>.</li>
          <li>Scott, J. C. (1998). <em>Seeing Like a State</em>. Yale University Press.</li>
        </ul>
      </div>
    </div>
  );
}
