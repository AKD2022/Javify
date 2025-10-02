import { getDoc, doc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { units } from '../home/HomeScreen'

let scores = {}; // { lessonId: score }

export const loadScores = async (user) => {
  if (!user) return;

  const scoresData = {};
  for (const unit of units) {
    for (const lesson of unit.lessons) {
      const docSnap = await getDoc(doc(db, 'users', user.uid, 'scores', lesson.id));
      scoresData[lesson.id] = docSnap.exists() ? docSnap.data().score : null;
      console.log('Loaded', lesson.id, scoresData[lesson.id]);
    }
  }
  scores = scoresData;
};

export const getScoreForLesson = (lessonId) => scores[lessonId] ?? null;
export const updateScore = (lessonId, score) => {
  scores[lessonId] = score;
};
export const getScores = () => ({ ...scores });


