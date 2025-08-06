// Utility functions để dịch text tiếng Anh sang tiếng Việt

export const translateStatus = (status: string): string => {
  const statusMap: { [key: string]: string } = {
    'pending': 'Chờ xác nhận',
    'confirmed': 'Đã xác nhận',
    'cancelled': 'Đã hủy',
    'done': 'Hoàn thành'
  };
  
  return statusMap[status.toLowerCase()] || status;
};

export const translateTime = (time: string): string => {
  // Chuyển đổi từ 24h sang 12h format
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'CH' : 'SA';
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  
  return `${displayHour}:${minutes} ${ampm}`;
};

export const translateDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const translateDateTime = (dateTimeString: string): { date: string; time: string } => {
  const date = new Date(dateTimeString);
  return {
    date: date.toLocaleDateString('vi-VN'),
    time: translateTime(date.toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    }))
  };
}; 