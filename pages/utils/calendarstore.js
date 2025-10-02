import { collection, getDocs, setDoc, doc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { units } from '../home/HomeScreen';
import { getStartDate, getEndDate } from '../diagnostic/datestore';
import { isBefore } from 'date-fns';
import { Alert } from 'react-native';

let calendarItems = {};

export const loadCalendar = async (user, lessonScores) => {
  if (!user) return;

  calendarItems = {}; // clear previous cache

  const calendarRef = collection(db, 'users', user.uid, 'calendar');
  const snapshot = await getDocs(calendarRef);
  const today = new Date();

  if (!snapshot.empty) {
    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      if (!data || !data.date || !data.lessonId) return;

      let lessonDate = new Date(data.date);

      // Move lesson to today if past and not completed
      if (isBefore(lessonDate, today) && lessonScores[data.lessonId] !== 4) {
        lessonDate = today;
      }

      const dateStr = lessonDate.toISOString().split('T')[0];
      if (!calendarItems[dateStr]) calendarItems[dateStr] = [];
      calendarItems[dateStr].push({ id: data.lessonId, name: `Lesson ${data.lessonId.replace('lesson','')}` });
    });
    console.log('Loaded calendar from Firestore:', calendarItems);
    return;
  }

  // Build new calendar if none exists
  const startDateRaw = getStartDate();
  const endDateRaw = getEndDate();

  if (!startDateRaw || !endDateRaw) {
    console.log('Cannot build calendar: start or end date missing');
    return;
  }

  const startDate = new Date(startDateRaw);
  const endDate = new Date(endDateRaw);

  const totalLessons = units.flatMap(u => u.lessons).filter(l => lessonScores[l.id] !== 4);
  const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) || 1;
  const lessonsPerDay = Math.ceil(totalLessons.length / totalDays);

  let currentDate = new Date(startDate);

  for (const unit of units) {
    for (const lesson of unit.lessons) {
      if (lessonScores[lesson.id] === 4) continue;

      const dateStr = currentDate.toISOString().split('T')[0];
      if (!calendarItems[dateStr]) calendarItems[dateStr] = [];
      calendarItems[dateStr].push({ id: lesson.id, name: lesson.title || `Lesson ${lesson.id.replace('lesson','')}` });

      // Save to Firestore
      await setDoc(doc(calendarRef, lesson.id), { lessonId: lesson.id, date: dateStr });

      if (calendarItems[dateStr].length >= lessonsPerDay) {
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }
  }

  console.log('Built new calendar:', calendarItems);
};

export const getCalendarItems = () => ({ ...calendarItems });

export const addOrUpdateCalendarItem = (lessonId, dateStr) => {
  if (!calendarItems[dateStr]) calendarItems[dateStr] = [];
  calendarItems[dateStr].push({ id: lessonId, name: `Lesson ${lessonId.replace('lesson','')}` });
};
