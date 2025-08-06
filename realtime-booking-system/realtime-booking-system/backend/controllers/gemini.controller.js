const axios = require('axios');

/**
 * Gửi tin nhắn đến Gemini AI và nhận phản hồi
 */
exports.sendMessage = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ 
        error: 'Tin nhắn không được để trống' 
      });
    }

    // Gọi Gemini API
    const response = await axios.post(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
      {
        contents: [{
          parts: [{
            text: `Bạn là trợ lý ảo của bệnh viện. Hãy trả lời câu hỏi sau bằng tiếng Việt một cách thân thiện, ngắn gọn và dễ đọc. Tránh sử dụng dấu sao (*) và bullet points. Trả lời trong 2-3 câu ngắn gọn, dễ hiểu: ${message}`
          }]
        }]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.GEMINI_API_KEY}`
        },
        params: {
          key: process.env.GEMINI_API_KEY
        }
      }
    );

    // Lấy phản hồi từ Gemini
    const reply = response.data.candidates[0].content.parts[0].text;

    res.json({
      success: true,
      reply: reply
    });

  } catch (error) {
    console.error('Lỗi khi gọi Gemini API:', error.response?.data || error.message);
    
    // Fallback về mock response nếu API gặp lỗi
    const mockReply = getMockResponse(message);
    
    res.json({
      success: true,
      reply: mockReply,
      note: 'Sử dụng phản hồi dự phòng do lỗi API'
    });
  }
};

/**
 * Hàm tạo phản hồi giả lập cho chatbot (fallback)
 */
const getMockResponse = (message) => {
  const lowerMessage = message.toLowerCase();
  
  // Danh sách các triệu chứng và khoa khám tương ứng
  const symptomToDepartment = [
    {
      keywords: ['đau bụng', 'đau dạ dày', 'khó tiêu', 'trào ngược', 'nôn', 'buồn nôn', 'tiêu chảy'],
      response: 'Với triệu chứng đau bụng/dạ dày, bạn nên khám tại khoa Tiêu hóa. Bác sĩ sẽ thăm khám và có thể chỉ định nội soi dạ dày hoặc siêu âm ổ bụng để chẩn đoán chính xác.'
    },
    {
      keywords: ['đau đầu', 'chóng mặt', 'tê tay chân', 'co giật', 'động kinh', 'run', 'mất ngủ'],
      response: 'Với các triệu chứng về đau đầu/chóng mặt/tê tay chân, bạn nên khám tại khoa Thần kinh. Bác sĩ có thể chỉ định chụp CT, MRI hoặc điện não đồ tùy tình trạng.'
    },
    {
      keywords: ['ho', 'khó thở', 'đờm', 'đau ngực', 'viêm phổi', 'hen suyễn', 'thở khò khè'],
      response: 'Với các triệu chứng về ho/khó thở, bạn nên khám tại khoa Hô hấp. Bác sĩ có thể chỉ định chụp X-quang phổi, đo chức năng hô hấp hoặc xét nghiệm đờm.'
    },
    {
      keywords: ['đau tim', 'tức ngực', 'hồi hộp', 'cao huyết áp', 'mạch', 'nhịp tim', 'đánh trống ngực'],
      response: 'Với các triệu chứng về tim mạch, bạn nên khám tại khoa Tim mạch. Bác sĩ sẽ kiểm tra huyết áp, điện tâm đồ và có thể chỉ định siêu âm tim hoặc các xét nghiệm chuyên sâu khác.'
    },
    {
      keywords: ['đau khớp', 'viêm khớp', 'đau lưng', 'đau cột sống', 'thoát vị', 'đau vai', 'đau gối'],
      response: 'Với các triệu chứng về đau khớp/cột sống, bạn nên khám tại khoa Cơ xương khớp. Bác sĩ có thể chỉ định chụp X-quang, MRI hoặc xét nghiệm viêm khớp.'
    },
    {
      keywords: ['ngứa', 'mẩn đỏ', 'nổi mụn', 'da', 'dị ứng'],
      response: 'Với triệu chứng ngứa, bạn nên khám tại khoa Da liễu. Bác sĩ sẽ kiểm tra tình trạng da và có thể chỉ định các xét nghiệm liên quan nếu cần.'
    }
  ];

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
};