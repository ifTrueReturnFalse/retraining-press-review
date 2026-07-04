import CalendarIcon from "@/assets/Icons/CalendarIcon";
import BlackButton from "../Buttons/BlackButton/BlackButton";
import styles from "./PressReview.module.css";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getWeekNumber } from "@/utils/timeUtils";

interface PressReviewProps {
  newsType: string;
  generatedAt: string;
  content: string;
}

export default function PressReview({
  newsType,
  generatedAt,
  content,
}: PressReviewProps) {
  const handleCopyReview = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className={styles.review}>
      <div className={styles.reviewHeader}>
        <div className={styles.reviewDetails}>
          <p className={styles.reviewType}>
            {newsType} - SEMAINE {getWeekNumber(generatedAt)}
          </p>
          <p className={styles.reviewDate}>
            <CalendarIcon />
            <span>
              {new Date(generatedAt).toLocaleString("fr-FR", {
                weekday: "long",
                day: "2-digit",
                month: "long",
              })}
              <span> à</span>{" "}
              {new Date(generatedAt).toLocaleString("fr-FR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </p>
        </div>
        <BlackButton
          buttonText="Copier"
          className={styles.copyButton}
          onClick={() => handleCopyReview(content)}
        />
      </div>

      <div>
        <Markdown remarkPlugins={[remarkGfm]}>{content}</Markdown>
      </div>
    </div>
  );
}
