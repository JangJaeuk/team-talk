// 날짜 포맷 함수 ex) 2025년 8월 31일
export const formatDate = (date: Date) => {
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
};

// 시간 포맷 함수 ex) 12:30
export const formatTime = (date: Date) => {
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
};

// 시간 포맷 함수 ex) 오후 12시 30분
export const formatTimeWithAmpm = (date: Date) => {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? "오후" : "오전";
  const displayHours = hours % 12 || 12;
  return `${ampm} ${displayHours}시 ${minutes}분`;
};

// 같은 날짜인지 확인
export const isSameDay = (date1: Date, date2: Date) => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

// 같은 해인지 확인
export const isSameYear = (date1: Date, date2: Date) => {
  return date1.getFullYear() === date2.getFullYear();
};

// 마지막 메시지 날짜 포맷
export const formatLastMessageDate = (date: Date) => {
  const now = new Date();
  const messageDate = new Date(date);

  if (isSameDay(messageDate, now)) {
    // 오늘이면 시간만
    return formatTimeWithAmpm(messageDate);
  } else if (isSameYear(messageDate, now)) {
    // 올해면 월/일
    return `${messageDate.getMonth() + 1}월 ${messageDate.getDate()}일`;
  } else {
    // 다른 해면 연/월/일
    return `${messageDate.getFullYear()}년 ${
      messageDate.getMonth() + 1
    }월 ${messageDate.getDate()}일`;
  }
};

// 시간 포맷 함수 ex) 10일 전, 10시간 전, 10분 전, 방금 전
export const formatTimeAgo = (date: Date) => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}일 전`;
  if (hours > 0) return `${hours}시간 전`;
  if (minutes > 0) return `${minutes}분 전`;
  return "방금 전";
};
