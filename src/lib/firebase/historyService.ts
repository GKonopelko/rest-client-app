import {
  doc,
  collection,
  addDoc,
  serverTimestamp,
  orderBy,
  getDocs,
  query,
} from 'firebase/firestore';
import { db } from './firebase';
import { RequestAnalytics } from '@/utils/requestHelpers';

export async function saveRequest(uid: string, requestData: RequestAnalytics) {
  if (!uid) throw new Error('User not authenticated');

  const historyRef = collection(doc(db, 'users', uid), 'history');
  await addDoc(historyRef, {
    ...requestData,
    createdAt: serverTimestamp(),
  });
}

export async function fetchHistory(uid: string) {
  const ref = collection(doc(db, 'users', uid), 'history');
  const q = query(ref, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}
