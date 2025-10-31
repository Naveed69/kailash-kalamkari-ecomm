import React from "react";

type Column<T> = { key: string; label: string; render?: (row: T) => React.ReactNode };

export const AdminTable = <T,>({ columns, data }: { columns: Column<T>[]; data: T[] }) => {
  return (
    <table className="w-full bg-white rounded shadow">
      <thead>
        <tr>
          {columns.map((c) => (
            <th key={c.key} className="text-left p-2 border-b">{c.label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row: any, i) => (
          <tr key={i} className="border-t">
            {columns.map((c) => (
              <td key={c.key} className="p-2 align-top">{c.render ? c.render(row) : row[c.key]}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};
