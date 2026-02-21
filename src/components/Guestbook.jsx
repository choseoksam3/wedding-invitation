import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
};

export default function Guestbook() {
  const [messages, setMessages] = useState([]);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'guestbook'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !content.trim() || !password.trim()) return;

    setSubmitting(true);
    try {
      await addDoc(collection(db, 'guestbook'), {
        name: name.trim(),
        password: password.trim(),
        content: content.trim(),
        createdAt: serverTimestamp(),
      });
      setName('');
      setPassword('');
      setContent('');
    } catch (err) {
      console.error('방명록 저장 실패:', err);
      alert('저장에 실패했습니다. 잠시 후 다시 시도해주세요.');
    }
    setSubmitting(false);
  };

  const handleDelete = async (msg) => {
    const input = prompt('삭제하려면 비밀번호를 입력하세요.');
    if (!input) return;
    if (input !== msg.password) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }
    try {
      await deleteDoc(doc(db, 'guestbook', msg.id));
    } catch (err) {
      console.error('삭제 실패:', err);
      alert('삭제에 실패했습니다.');
    }
  };

  const formatDate = (ts) => {
    if (!ts) return '';
    const d = ts.toDate();
    return `${d.getMonth() + 1}.${d.getDate()}`;
  };

  return (
    <motion.section
      className="py-20 px-6 bg-warm-100/50"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      variants={{ visible: { transition: { staggerChildren: 0.15 } } }}
    >
      <motion.h2
        variants={fadeInUp}
        className="font-serif text-center text-warm-600 text-lg mb-8 tracking-wider"
      >
        방명록
      </motion.h2>

      {/* 작성 폼 */}
      <motion.form
        variants={fadeInUp}
        onSubmit={handleSubmit}
        className="max-w-sm mx-auto mb-8 space-y-3"
      >
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="이름"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={20}
            className="flex-1 px-3 py-2.5 text-sm bg-white border border-warm-200 rounded-lg focus:outline-none focus:border-warm-400"
          />
          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            maxLength={10}
            className="w-24 px-3 py-2.5 text-sm bg-white border border-warm-200 rounded-lg focus:outline-none focus:border-warm-400"
          />
        </div>
        <div className="flex gap-2">
          <textarea
            placeholder="축하 메시지를 남겨주세요"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={200}
            rows={2}
            className="flex-1 px-3 py-2.5 text-sm bg-white border border-warm-200 rounded-lg focus:outline-none focus:border-warm-400 resize-none"
          />
          <button
            type="submit"
            disabled={submitting}
            className="px-4 bg-warm-500 text-white text-sm rounded-lg hover:bg-warm-600 transition-colors disabled:opacity-50 shrink-0"
          >
            등록
          </button>
        </div>
      </motion.form>

      {/* 메시지 목록 */}
      <motion.div variants={fadeInUp} className="max-w-sm mx-auto space-y-3">
        {messages.length === 0 && (
          <p className="text-center text-warm-400 text-sm font-serif">
            첫 번째 축하 메시지를 남겨주세요
          </p>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className="bg-white rounded-xl px-4 py-3.5 shadow-sm">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-serif text-warm-700 text-sm font-bold">{msg.name}</span>
              <div className="flex items-center gap-2">
                <span className="text-warm-300 text-xs">{formatDate(msg.createdAt)}</span>
                <button
                  onClick={() => handleDelete(msg)}
                  className="text-warm-300 text-xs hover:text-warm-500"
                >
                  삭제
                </button>
              </div>
            </div>
            <p className="text-warm-600 text-sm leading-relaxed">{msg.content}</p>
          </div>
        ))}
      </motion.div>
    </motion.section>
  );
}
