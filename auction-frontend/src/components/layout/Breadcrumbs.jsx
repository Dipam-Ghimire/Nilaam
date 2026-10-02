// src/components/layout/Breadcrumbs.jsx

import { Link } from 'react-router-dom';

export default function Breadcrumbs({ items = [] }) {
  const breadcrumbs = [
    {
      label: 'Home',
      to: '/',
    },
    ...items,
  ];

  return (
    <nav
      aria-label="Breadcrumb"
      className="mb-6"
    >
      <ol className="flex flex-wrap items-center gap-2 text-sm">
        {breadcrumbs.map((item, index) => {
          const isLast = index === breadcrumbs.length - 1;

          return (
            <li
              key={`${item.label}-${index}`}
              className="flex items-center gap-2"
            >
              {index > 0 && (
                <span className="text-gray-900">
                  /
                </span>
              )}

              {item.to && !isLast ? (
                <Link
                  to={item.to}
                  className="text-cyan-900 transition hover:text-cyan-500 hover:underline"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={
                    isLast
                      ? 'font-medium text-gray-500'
                      : 'text-gray-500'
                  }
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}