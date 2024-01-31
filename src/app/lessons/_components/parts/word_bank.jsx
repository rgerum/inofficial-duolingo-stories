import WordButton from "./word_button";
import styles from "./word_bank.module.css";

export default function WordBank({ words }) {
  return (
    <div className={styles.word_bank}>
      {words.map((a, i) => (
        <WordButton key={i} {...a} />
      ))}
    </div>
  );
}
