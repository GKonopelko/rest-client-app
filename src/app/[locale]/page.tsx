import { Button } from 'antd';

export default function Home() {
  return (
    <>
      <Button type="primary">Start</Button>
      <div>
        {Array.from({ length: 100 }).map((_, index) => (
          <p key={index}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Paragraph{' '}
            {index + 1}
          </p>
        ))}
      </div>
    </>
  );
}
