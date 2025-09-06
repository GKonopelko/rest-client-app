import { Button } from 'antd';
import styles from './MainPage.module.css';

export default function MainPage() {
  return (
    <div className={styles.page}>
      <Button type="primary">Start</Button>
      <div>
        {Array.from({ length: 100 }).map((_, index) => (
          <p key={index}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Paragraph{' '}
            {index + 1}
          </p>
        ))}
      </div>
    </div>
  );
}
