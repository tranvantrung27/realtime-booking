// Commented out as we're using mock responses instead of actual API calls
// import axios from 'axios';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * Gửi tin nhắn đến Gemini AI và nhận phản hồi
 * @param message Tin nhắn người dùng gửi đến AI
 * @returns Phản hồi từ AI
 */
/**
 * Hàm tạo phản hồi giả lập cho chatbot
 */
// Danh sách các triệu chứng và khoa khám tương ứng
interface SymptomDepartment {
  keywords: string[];
  department: string;
  response: string;
}

const symptomToDepartment: SymptomDepartment[] = [
  {
    keywords: ['đau bụng', 'đau dạ dày', 'khó tiêu', 'trào ngược', 'nôn', 'buồn nôn', 'tiêu chảy'],
    department: 'Tiêu hóa',
    response: 'Với triệu chứng đau bụng/dạ dày, bạn nên khám tại khoa Tiêu hóa. Bác sĩ sẽ thăm khám và có thể chỉ định nội soi dạ dày hoặc siêu âm ổ bụng để chẩn đoán chính xác.'
  },
  {
    keywords: ['đau đầu', 'chóng mặt', 'tê tay chân', 'co giật', 'động kinh', 'run', 'mất ngủ'],
    department: 'Thần kinh',
    response: 'Với các triệu chứng về đau đầu/chóng mặt/tê tay chân, bạn nên khám tại khoa Thần kinh. Bác sĩ có thể chỉ định chụp CT, MRI hoặc điện não đồ tùy tình trạng.'
  },
  {
    keywords: ['ho', 'khó thở', 'đờm', 'đau ngực', 'viêm phổi', 'hen suyễn', 'thở khò khè'],
    department: 'Hô hấp',
    response: 'Với các triệu chứng về ho/khó thở, bạn nên khám tại khoa Hô hấp. Bác sĩ có thể chỉ định chụp X-quang phổi, đo chức năng hô hấp hoặc xét nghiệm đờm.'
  },
  {
    keywords: ['đau tim', 'tức ngực', 'hồi hộp', 'cao huyết áp', 'mạch', 'nhịp tim', 'đánh trống ngực'],
    department: 'Tim mạch',
    response: 'Với các triệu chứng về tim mạch, bạn nên khám tại khoa Tim mạch. Bác sĩ sẽ kiểm tra huyết áp, điện tâm đồ và có thể chỉ định siêu âm tim hoặc các xét nghiệm chuyên sâu khác.'
  },
  {
    keywords: ['đau khớp', 'viêm khớp', 'đau lưng', 'đau cột sống', 'thoát vị', 'đau vai', 'đau gối'],
    department: 'Cơ xương khớp',
    response: 'Với các triệu chứng về đau khớp/cột sống, bạn nên khám tại khoa Cơ xương khớp. Bác sĩ có thể chỉ định chụp X-quang, MRI hoặc xét nghiệm viêm khớp.'
  },
  {
    keywords: ['mắt', 'nhìn mờ', 'đau mắt', 'đỏ mắt', 'cườm', 'khô mắt', 'song thị', 'nhìn đôi'],
    department: 'Mắt',
    response: 'Với các vấn đề về mắt, bạn nên khám tại khoa Mắt. Bác sĩ sẽ kiểm tra thị lực, đáy mắt và các chỉ số liên quan đến mắt của bạn.'
  },
  {
    keywords: ['tai', 'mũi', 'họng', 'khó nuốt', 'viêm amidan', 'viêm xoang', 'chảy máu cam', 'ù tai', 'đau tai'],
    department: 'Tai Mũi Họng',
    response: 'Với các vấn đề về tai, mũi, họng, bạn nên khám tại khoa Tai Mũi Họng. Bác sĩ sẽ kiểm tra và có thể thực hiện nội soi tai mũi họng nếu cần.'
  },
  {
    keywords: ['da', 'nổi mẩn', 'ngứa', 'nổi mụn', 'nám', 'tàn nhang', 'vảy nến', 'mề đay'],
    department: 'Da liễu',
    response: 'Với các vấn đề về da, bạn nên khám tại khoa Da liễu. Bác sĩ sẽ kiểm tra tình trạng da và có thể chỉ định các xét nghiệm liên quan nếu cần.'
  },
  {
    keywords: ['tiểu đường', 'đái tháo đường', 'tuyến giáp', 'béo phì', 'suy giáp', 'cường giáp', 'hormone'],
    department: 'Nội tiết',
    response: 'Với các vấn đề về nội tiết, bạn nên khám tại khoa Nội tiết. Bác sĩ sẽ kiểm tra và chỉ định xét nghiệm hormone, đường huyết và các chỉ số liên quan.'
  },
  {
    keywords: ['trẻ em', 'trẻ sơ sinh', 'em bé', 'con nít', 'tiêm chủng', 'vắc-xin', 'chậm phát triển'],
    department: 'Nhi',
    response: 'Với các vấn đề sức khỏe của trẻ em, bạn nên đưa bé đến khám tại khoa Nhi. Bác sĩ nhi khoa sẽ thăm khám và tư vấn phù hợp với độ tuổi của bé.'
  }
];

const getMockResponse = (message: string): string => {
  const lowerMessage = message.toLowerCase();
  
  // Kiểm tra xem tin nhắn có chứa các từ khóa về triệu chứng không
  for (const item of symptomToDepartment) {
    if (item.keywords.some(keyword => lowerMessage.includes(keyword))) {
      return item.response;
    }
  }
  
  // Các phản hồi khác
  if (lowerMessage.includes('tôi là ai') || lowerMessage.includes('bạn là ai')) {
    return 'Tôi là trợ lý ảo của bệnh viện. Tôi có thể giúp bạn tra cứu thông tin về lịch khám, đặt lịch, tìm bác sĩ phù hợp hoặc giải đáp các câu hỏi về dịch vụ y tế. Bạn cần hỗ trợ gì ạ?';
  }
  
  if (lowerMessage.includes('đặt lịch') || lowerMessage.includes('đặt hẹn') || lowerMessage.includes('khám')) {
    return 'Để đặt lịch khám, bạn cần chọn chuyên khoa, bác sĩ và thời gian phù hợp. Bạn có thể đặt lịch khám trực tiếp trên hệ thống hoặc liên hệ tổng đài 1900xxxx để được hỗ trợ.';
  }
  
  if (lowerMessage.includes('giờ') || lowerMessage.includes('thời gian')) {
    return 'Bệnh viện làm việc từ 7:30 đến 17:00 các ngày trong tuần, và 7:30 đến 11:30 vào thứ Bảy. Chủ nhật và các ngày lễ chỉ tiếp nhận cấp cứu.';
  }
  
  if (lowerMessage.includes('bác sĩ') || lowerMessage.includes('chuyên khoa')) {
    return 'Bệnh viện có nhiều chuyên khoa như Nhi, Tim mạch, Nội tiết, Da liễu, Thần kinh, Tiêu hóa, Cơ xương khớp, Tai Mũi Họng, Mắt... Bạn cần tư vấn về chuyên khoa nào?';
  }
  
  return 'Tôi là trợ lý ảo của bệnh viện. Tôi có thể giúp bạn tra cứu thông tin về lịch khám, đặt lịch, tìm bác sĩ phù hợp hoặc giải đáp các câu hỏi về dịch vụ y tế. Bạn cũng có thể mô tả triệu chứng bệnh để tôi gợi ý khoa khám phù hợp.';
}

export const sendMessageToGemini = async (message: string): Promise<string> => {
  try {
    // Tạm thời mô phỏng phản hồi để tránh lỗi SSL
    // const response = await axios.post(
    //   'https://api.genmini.com/consultation',
    //   {
    //     message,
    //   },
    //   {
    //     headers: {
    //       'Content-Type': 'application/json',
    //       'Authorization': `Bearer AIzaSyCMIFA5nM-uma3CzMOjkums_BDXJdkJ3jc`,
    //     },
    //   }
    // );
    
    // Mô phỏng phản hồi từ API
    const mockResponse = {
      data: {
        reply: getMockResponse(message)
      }
    };
    
    // Giả lập độ trễ mạng
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const response = mockResponse;

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