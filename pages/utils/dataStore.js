import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';

let scores = {}; // { lessonId: score }

export const loadScores = async (user) => {
  if (!user) return;

  try {
    // ONE query gets ALL scores at once - parallel loading!
    const scoresRef = collection(db, 'users', user.uid, 'scores');
    const snapshot = await getDocs(scoresRef);

    const scoresData = {};
    snapshot.forEach(doc => {
      scoresData[doc.id] = doc.data().score;
      console.log('Loaded', doc.id, scoresData[doc.id]);
    });

    scores = scoresData;
  } catch (error) {
    console.error("Error loading scores:", error);
  }
};

export const getScoreForLesson = (lessonId) => scores[lessonId] ?? null;
export const updateScore = (lessonId, score) => {
  scores[lessonId] = score;
};
export const getScores = () => ({ ...scores });