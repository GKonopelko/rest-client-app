import { describe, it, expect, vi, beforeEach } from 'vitest';
import { saveRequest, fetchHistory } from './historyService';
import { db } from './firebase';
import type { DocumentData, QuerySnapshot } from 'firebase/firestore';
import {
  doc,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
} from 'firebase/firestore';
import type { RequestAnalytics } from '@/utils/requestHelpers';

vi.mock('firebase/firestore', async () => {
  const actual =
    await vi.importActual<typeof import('firebase/firestore')>(
      'firebase/firestore'
    );
  return {
    ...actual,
    doc: vi.fn(),
    collection: vi.fn(),
    addDoc: vi.fn(),
    getDocs: vi.fn(),
    query: vi.fn(),
    orderBy: vi.fn(),
    serverTimestamp: vi.fn(() => 'timestamp'),
  };
});

describe('Firebase functions', () => {
  const uid = 'test-uid';
  const requestData: RequestAnalytics = {
    url: '/test',
    method: 'GET',
    statusCode: 200,
    timestamp: '',
    latency: 0,
    error: '',
    requestSize: 0,
    responseSize: 0,
    requestBody: '',
    requestHeaders: '',
  };

  let userDocRef: object;
  let historyRef: object;

  beforeEach(() => {
    userDocRef = {};
    historyRef = {};

    (doc as unknown as ReturnType<typeof vi.fn>).mockReturnValue(userDocRef);
    (collection as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
      historyRef
    );
    (addDoc as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      {} as DocumentData
    );
    (getDocs as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      docs: [
        {
          id: '1',
          data: () => ({
            url: '/test',
            method: 'GET',
            status: 200,
            createdAt: 'timestamp',
          }),
        },
      ],
    } as unknown as QuerySnapshot<DocumentData>);
    (query as unknown as ReturnType<typeof vi.fn>).mockImplementation(
      (ref, order) => ({ ref, order })
    );
    (orderBy as unknown as ReturnType<typeof vi.fn>).mockImplementation(
      () => 'orderByCreatedAt'
    );
  });

  it('should throw if uid is empty', async () => {
    await expect(saveRequest('', requestData)).rejects.toThrow(
      'User not authenticated'
    );
  });

  it('should call addDoc with correct data', async () => {
    await saveRequest(uid, requestData);

    expect(doc).toHaveBeenCalledWith(db, 'users', uid);
    expect(collection).toHaveBeenCalledWith(userDocRef, 'history');
    expect(addDoc).toHaveBeenCalledWith(historyRef, {
      ...requestData,
      createdAt: 'timestamp',
    });
  });

  it('should fetch history correctly', async () => {
    const result = await fetchHistory(uid);

    expect(doc).toHaveBeenCalledWith(db, 'users', uid);
    expect(collection).toHaveBeenCalledWith(userDocRef, 'history');
    expect(query).toHaveBeenCalledWith(historyRef, 'orderByCreatedAt');
    expect(result).toEqual([
      {
        id: '1',
        url: '/test',
        method: 'GET',
        status: 200,
        createdAt: 'timestamp',
      },
    ]);
  });
});
