"use client";

import type { GardenPromise } from "@/lib/types/personal";
import { CollectionArtifact } from "./CollectionArtifact";

interface CollectionViewProps {
  promises: GardenPromise[];
}

export function CollectionView({ promises }: CollectionViewProps) {
  const withArtifacts = promises.filter((p) => p.artifact !== null);
  const kept = withArtifacts.filter((p) => !p.fossilized && p.status === "verified");
  const fossils = withArtifacts.filter((p) => p.fossilized);

  if (withArtifacts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <p className="text-4xl mb-4" aria-hidden="true">🌱</p>
        <p className="font-serif text-lg font-semibold text-gray-700 mb-2">
          Nothing here yet
        </p>
        <p className="text-sm text-gray-500 max-w-xs leading-relaxed">
          When you keep a promise, it crystallizes into an artifact and lives here
          permanently.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8" role="main">
      {kept.length > 0 && (
        <section aria-label="Kept promises">
          <h2 className="font-serif text-lg font-bold text-gray-900 mb-3">
            Kept promises
          </h2>
          <div className="space-y-3">
            {kept.map((p) => (
              <CollectionArtifact
                key={p.id}
                artifact={p.artifact!}
                promiseBody={p.body}
                reflection={p.reflection}
                fossilized={false}
              />
            ))}
          </div>
        </section>
      )}

      {fossils.length > 0 && (
        <section aria-label="Closed chapters">
          <h2 className="font-serif text-lg font-bold text-gray-700 mb-1">
            Closed chapters
          </h2>
          <p className="text-xs text-gray-400 mb-3">
            Promises that were fossilized — preserved, not forgotten.
          </p>
          <div className="space-y-3">
            {fossils.map((p) => (
              <CollectionArtifact
                key={p.id}
                artifact={p.artifact!}
                promiseBody={p.body}
                reflection={p.reflection}
                fossilized={true}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
