"use client";

export function JCPOAAboutTab() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white rounded-xl border p-6">
        <h3 className="font-serif text-xl font-semibold text-gray-900 mb-3">
          What is Promise Theory?
        </h3>
        <p className="text-sm text-gray-700 leading-relaxed mb-3">
          Promise Theory, developed by Mark Burgess, is a framework for understanding
          voluntary cooperation in complex systems. Unlike top-down obligation models,
          Promise Theory starts from the premise that every agent is autonomous — they
          can only make promises about their own behavior, never impose obligations on others.
        </p>
        <p className="text-sm text-gray-700 leading-relaxed mb-3">
          A <strong>promise</strong> is a declaration of intent by an autonomous agent.
          It has a <em>promiser</em> (who commits), a <em>promisee</em> (who benefits),
          a <em>body</em> (what is committed), and a <em>polarity</em> (+give or −accept).
          A complete interaction requires both: the promiser gives, and the promisee accepts.
        </p>
        <p className="text-sm text-gray-700 leading-relaxed">
          Promise Pipeline applies this theory to real-world accountability by modeling
          commitments as a network of interdependent promises. When one promise fails,
          we can trace the <em>cascade</em> through the dependency graph — which downstream
          commitments break, which domains are affected, and where to intervene.
        </p>
      </div>

      <div className="bg-white rounded-xl border p-6">
        <h3 className="font-serif text-xl font-semibold text-gray-900 mb-3">
          About This Dashboard
        </h3>
        <p className="text-sm text-gray-700 leading-relaxed mb-3">
          This dashboard analyzes the Joint Comprehensive Plan of Action (JCPOA), the
          2015 multilateral nuclear agreement between Iran and the P5+1 powers (US, UK,
          France, Germany, Russia, China) plus the EU. We model the agreement as a network
          of 22 promises made by 11 agents across 8 domains.
        </p>
        <p className="text-sm text-gray-700 leading-relaxed mb-3">
          The JCPOA is a case study in cascading withdrawal. When the United States exited
          the agreement in 2018, downstream promises from other parties degraded or collapsed
          in sequence — not because they were individually broken, but because the dependency
          structure transmitted the failure. The Network tab lets you simulate this: select
          any promise, change its status, and watch the cascade propagate.
        </p>
        <p className="text-sm text-gray-700 leading-relaxed">
          This is what distinguishes a promise network from a compliance checklist. The
          JCPOA&apos;s promises were interdependent by design — sanctions relief was conditioned
          on enrichment limits, which were conditioned on inspection access. When one layer
          fails, the structure transmits the failure to every connected node.
        </p>
      </div>

      <div className="bg-white rounded-xl border p-6">
        <h3 className="font-serif text-xl font-semibold text-gray-900 mb-3">
          Methodology
        </h3>
        <ul className="text-sm text-gray-700 space-y-2 list-disc pl-5">
          <li>Promise data sourced from the JCPOA full text (July 14, 2015), IAEA verification reports, and publicly available compliance assessments</li>
          <li>Dependencies inferred from the agreement&apos;s conditional structure — sanctions relief tied to enrichment limits, enrichment limits tied to inspection access, etc.</li>
          <li>Status assessments reflect the state of play following the US withdrawal (May 2018) and subsequent Iranian escalations through 2025</li>
          <li>Network health calculated as a weighted average of promise statuses: Verified=100, Declared=60, Degraded=30, Violated=0, Unverifiable=20</li>
          <li>Cascade simulation traces how failure propagates through the dependency graph, with diminishing impact at each level of distance from the source</li>
        </ul>
      </div>

      <div className="bg-gray-50 rounded-xl border p-6 text-center">
        <p className="text-sm text-gray-600">
          Promise Pipeline is open source under the AGPL-3.0 license.
        </p>
      </div>
    </div>
  );
}
