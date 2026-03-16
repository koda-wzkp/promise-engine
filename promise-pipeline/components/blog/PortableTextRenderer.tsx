"use client";

import { PortableText, PortableTextComponents } from "@portabletext/react";
import Image from "next/image";
import Link from "next/link";
import { urlForImage } from "@/sanity/lib/image";

const components: PortableTextComponents = {
  block: {
    h2: ({ children }) => (
      <h2 className="font-serif text-2xl font-bold text-gray-900 mt-8 mb-3">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="font-serif text-xl font-semibold text-gray-900 mt-6 mb-2">
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 className="font-serif text-lg font-semibold text-gray-800 mt-4 mb-2">
        {children}
      </h4>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-600 my-4">
        {children}
      </blockquote>
    ),
    normal: ({ children }) => (
      <p className="text-gray-700 leading-relaxed mb-4">{children}</p>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="list-disc pl-6 mb-4 space-y-1 text-gray-700">
        {children}
      </ul>
    ),
    number: ({ children }) => (
      <ol className="list-decimal pl-6 mb-4 space-y-1 text-gray-700">
        {children}
      </ol>
    ),
  },
  marks: {
    strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
    em: ({ children }) => <em>{children}</em>,
    code: ({ children }) => (
      <code className="bg-gray-100 text-sm px-1.5 py-0.5 rounded font-mono">
        {children}
      </code>
    ),
    link: ({ value, children }) => (
      <a
        href={value?.href}
        className="text-blue-600 hover:underline"
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    ),
    promiseRef: ({ value, children }) => (
      <Link
        href={`/demo/hb2021#${value?.promiseId}`}
        className="text-blue-600 hover:underline font-mono text-sm"
      >
        {children}
      </Link>
    ),
  },
  types: {
    image: ({ value }) => {
      if (!value?.asset) return null;
      const url = urlForImage(value).width(800).url();
      return (
        <figure className="my-6">
          <Image
            src={url}
            alt={value.alt || ""}
            width={800}
            height={450}
            className="rounded-lg"
          />
          {value.caption && (
            <figcaption className="text-sm text-gray-500 mt-2 text-center">
              {value.caption}
            </figcaption>
          )}
        </figure>
      );
    },
    code: ({ value }) => (
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 my-4 overflow-x-auto">
        {value.language && (
          <div className="text-xs text-gray-400 mb-2">{value.language}</div>
        )}
        <code className="text-sm font-mono">{value.code}</code>
      </pre>
    ),
    callout: ({ value }) => {
      const styles: Record<string, string> = {
        info: "bg-blue-50 border-blue-200 text-blue-900",
        warning: "bg-amber-50 border-amber-200 text-amber-900",
        insight: "bg-purple-50 border-purple-200 text-purple-900",
      };
      const style = styles[value.type] || styles.info;
      return (
        <div className={`border rounded-lg p-4 my-4 ${style}`}>
          {value.title && (
            <div className="font-semibold mb-1">{value.title}</div>
          )}
          <p className="text-sm">{value.body}</p>
        </div>
      );
    },
  },
};

export default function PortableTextRenderer({ value }: { value: any }) {
  if (!value) return null;
  return <PortableText value={value} components={components} />;
}
