'use client';

import { Table } from 'antd';
import styles from './HistoryPage.module.css';
import { RootState } from '@/store';
import { useSelector } from 'react-redux';
import { selectUserId } from '@/slices/userSlice';
import { fetchHistory } from '@/lib/firebase/historyService';
import { useEffect, useState } from 'react';
import { Timestamp } from 'firebase/firestore';
import Link from 'next/link';

interface FirestoreHistoryItem {
  id: string;
  createdAt?: Timestamp;
  timestamp?: string;
  url?: string;
  method?: string;
  statusCode?: number;
  error?: string;
  requestSize?: number;
  responseSize?: number;
  latency?: number;
}

interface HistoryRecord {
  key: number;
  timestamp: string;
  url: string;
  method: string;
  statusCode: number;
  error: string;
  requestSize: number;
  responseSize: number;
  latency: number;
}

export default function HistoryPage() {
  const userId = useSelector((state: RootState) => selectUserId(state)) || '';
  const [data, setData] = useState<HistoryRecord[]>([]);

  useEffect(() => {
    if (!userId) return;

    const loadHistory = async () => {
      try {
        const history: FirestoreHistoryItem[] = await fetchHistory(userId);
        const tableData: HistoryRecord[] = history.map((item, index) => ({
          key: index,
          timestamp: item.timestamp ?? '',
          url: item.url ?? '',
          method: item.method ?? '',
          statusCode: item.statusCode ?? 0,
          error: item.error ?? '',
          requestSize: item.requestSize ?? 0,
          responseSize: item.responseSize ?? 0,
          latency: item.latency ?? 0,
        }));

        setData(tableData);
      } catch (err) {
        console.error(err);
      }
    };

    loadHistory();
  }, [userId]);

  const columns = [
    { title: 'Timestamp', dataIndex: 'timestamp', key: 'timestamp' },
    { title: 'URL', dataIndex: 'url', key: 'url' },
    { title: 'Method', dataIndex: 'method', key: 'method' },
    { title: 'Status code', dataIndex: 'statusCode', key: 'statusCode' },
    { title: 'Request size', dataIndex: 'requestSize', key: 'requestSize' },
    { title: 'Response size', dataIndex: 'responseSize', key: 'responseSize' },
    { title: 'Latency', dataIndex: 'latency', key: 'latency' },
    { title: 'Error', dataIndex: 'error', key: 'error' },
  ];

  return (
    <div className={styles.page}>
      <section className={styles.content}>
        <h1>History</h1>

        {data.length ? (
          <Table
            columns={columns}
            dataSource={data}
            style={{ width: '100%' }}
            scroll={{ x: 'max-content' }}
            pagination={{ pageSize: 10 }}
            onRow={(record) => {
              console.log(record);
              return {
                onClick: () => {
                  window.location.href = `/rest-client/${record.method}/`;
                },
              };
            }}
            rowClassName={() => styles.rowHover}
          />
        ) : (
          <div>
            <span>You have not sent any requests yet, try </span>
            <Link href="/rest-client" style={{ textDecoration: 'underline' }}>
              Rest client
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
