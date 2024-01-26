import styles from "./table.module.css";

export default function Table({ content }) {
  const rows = content
    .split("\n")
    .filter((v) => v.length > 0)
    .map((v) => v.split("|"));
  const header = rows.shift();
  return (
    <table className={styles.table}>
      <thead>
        <tr>
          {header.map((h, i) => (
            <th key={i}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i}>
            {row.map((cell, j) => (
              <td key={j}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
