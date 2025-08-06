import axios from 'axios';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * Gửi tin nhắn đến Gemini AI và nhận phản hồi
 * @param message Tin nhắn người dùng gửi đến AI
 * @returns Phản hồi từ AI
 */
export const sendMessageToGemini = async (message: string): Promise<string> => {
  try {
    const response = await axios.post(
      'http://localhost:3000/api/gemini/chat',
      {
        message,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    
    return response.data.reply || 'Xin lỗi, tôi không thể xử lý yêu cầu của bạn lúc này.';
  } catch (error) {
    console.error('Lỗi khi gọi API Gemini:', error);
    return 'Đã xảy ra lỗi khi kết nối với trợ lý ảo. Vui lòng thử lại sau.';
  }
};

/**
 * Lưu lịch sử chat vào localStorage
 * @param messages Danh sách tin nhắn cần lưu
 */
export const saveChatHistory = (messages: ChatMessage[]): void => {
  localStorage.setItem('chat_history', JSON.stringify(messages));
};

/**
 * Lấy lịch sử chat từ localStorage
 * @returns Danh sách tin nhắn đã lưu hoặc mảng rỗng nếu chưa có
 */
export const getChatHistory = (): ChatMessage[] => {
  const history = localStorage.getItem('chat_history');
  return history ? JSON.parse(history) : [];
};

/**
 * Xóa lịch sử chat
 */
export const clearChatHistory = (): void => {
  localStorage.removeItem('chat_history');
};