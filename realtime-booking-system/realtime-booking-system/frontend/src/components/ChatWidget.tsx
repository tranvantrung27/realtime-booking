import React, { useState, useEffect, useRef } from 'react';
import { sendMessageToGemini, saveChatHistory, getChatHistory } from '../services/gemini';
import './ChatWidget.css';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showBubble, setShowBubble] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatWindowRef = useRef<HTMLDivElement>(null);

  // Tải lịch sử chat khi component được mount
  useEffect(() => {
    const savedMessages = getChatHistory();
    if (savedMessages.length > 0) {
      setMessages(savedMessages);
    }
    
    // Hiển thị bubble sau 2 giây khi trang web được tải
    setTimeout(() => {
      setShowBubble(true);
    }, 2000);
  }, []);

  // Cuộn xuống tin nhắn mới nhất
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  // Focus vào input khi mở chat
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  }, [isOpen]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && chatWindowRef.current && !chatWindowRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowBubble(true);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
    setShowBubble(false);
    
    // Hiển thị lại bubble sau 5 giây nếu đóng chat
    if (isOpen) {
      setTimeout(() => {
        setShowBubble(true);
      }, 5000);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const simulateTyping = (callback: () => void) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      callback();
    }, 1500);
  };

  const handleSendMessage = async () => {
    if (inputValue.trim() === '') return;

    const userMessage: Message = {
      role: 'user',
      content: inputValue,
    };

    // Cập nhật UI với tin nhắn người dùng
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Simulate typing effect
      simulateTyping(async () => {
        // Gửi tin nhắn đến Gemini AI
        const response = await sendMessageToGemini(userMessage.content);

        // Thêm phản hồi từ AI vào danh sách tin nhắn
        const assistantMessage: Message = {
          role: 'assistant',
          content: response,
        };

        setMessages((prevMessages) => {
          const updatedMessages = [...prevMessages, assistantMessage];
          // Lưu lịch sử chat
          saveChatHistory(updatedMessages);
          return updatedMessages;
        });
        setIsLoading(false);
      });
    } catch (error) {
      console.error('Lỗi khi gửi tin nhắn:', error);
      
      // Thêm thông báo lỗi
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Đã xảy ra lỗi khi xử lý tin nhắn của bạn. Vui lòng thử lại sau.',
      };
      
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="chat-widget-container">
      {/* Nút chat */}
      <div className="chat-button-container">
        <button
          onClick={toggleChat}
          className="chat-bot-button"
          aria-label="Chat với trợ lý ảo"
          title="Mở chat"
        >
          <div className="chat-bot-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2Z" fill="white"/>
              <path d="M8 13C8.55228 13 9 12.5523 9 12C9 11.4477 8.55228 11 8 11C7.44772 11 7 11.4477 7 12C7 12.5523 7.44772 13 8 13Z" fill="#2563EB"/>
              <path d="M16 13C16.5523 13 17 12.5523 17 12C17 11.4477 16.5523 11 16 11C15.4477 11 15 11.4477 15 12C15 12.5523 15.4477 13 16 13Z" fill="#2563EB"/>
              <path d="M8.5 17H15.5C15.5 15.5 14.5 14 12 14C10 14 8.5 15.5 8.5 17Z" fill="#2563EB"/>
            </svg>
          </div>
        </button>

        {!isOpen && showBubble && (
          <div className="chat-bubble" onClick={toggleChat}>
            <div className="chat-bubble-content">
              <div className="chat-bubble-header">
                <span className="chat-bubble-title">💬 Chatbot Bệnh viện</span>
              </div>
              <p className="chat-bubble-text">Xin chào! Tôi có thể giúp gì cho bạn?</p>
            </div>
          </div>
        )}
      </div>

      {/* Khung chat */}
      {isOpen && (
        <div ref={chatWindowRef} className="chat-window">
          {/* Header */}
          <div className="chat-header">
            <div className="chat-header-content">
              <div className="bot-avatar">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2Z" fill="white"/>
                  <path d="M8 13C8.55228 13 9 12.5523 9 12C9 11.4477 8.55228 11 8 11C7.44772 11 7 11.4477 7 12C7 12.5523 7.44772 13 8 13Z" fill="#2563EB"/>
                  <path d="M16 13C16.5523 13 17 12.5523 17 12C17 11.4477 16.5523 11 16 11C15.4477 11 15 11.4477 15 12C15 12.5523 15.4477 13 16 13Z" fill="#2563EB"/>
                  <path d="M8.5 17H15.5C15.5 15.5 14.5 14 12 14C10 14 8.5 15.5 8.5 17Z" fill="#2563EB"/>
                </svg>
              </div>
              <div className="header-info">
                <h3 className="bot-name">Chatbot Bệnh viện</h3>
                <div className="status-indicator">
                  <span className="status-dot"></span>
                  <span className="status-text">Đang hoạt động</span>
                </div>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="chat-messages">
            {messages.length === 0 ? (
              <div className="welcome-message">
                <div className="bot-message">
                  <div className="bot-avatar-small">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2Z" fill="#2563EB"/>
                      <path d="M8 13C8.55228 13 9 12.5523 9 12C9 11.4477 8.55228 11 8 11C7.44772 11 7 11.4477 7 12C7 12.5523 7.44772 13 8 13Z" fill="white"/>
                      <path d="M16 13C16.5523 13 17 12.5523 17 12C17 11.4477 16.5523 11 16 11C15.4477 11 15 11.4477 15 12C15 12.5523 15.4477 13 16 13Z" fill="white"/>
                      <path d="M8.5 17H15.5C15.5 15.5 14.5 14 12 14C10 14 8.5 15.5 8.5 17Z" fill="white"/>
                    </svg>
                  </div>
                  <div className="message-content bot-message-content">
                    <div className="message-text">
                      <p className="greeting-text">👋 Xin chào! Tôi là trợ lý ảo của bệnh viện.</p>
                      <div className="service-list">
                        <p className="service-intro">Tôi có thể giúp bạn:</p>
                        <div className="services">
                          <span className="service-item">🏥 Tìm khoa khám phù hợp</span>
                          <span className="service-item">📅 Đặt lịch khám bệnh</span>
                          <span className="service-item">👨‍⚕️ Tra cứu thông tin bác sĩ</span>
                          <span className="service-item">⏰ Giờ làm việc bệnh viện</span>
                        </div>
                      </div>
                      <p className="help-text">Hãy mô tả triệu chứng để tôi gợi ý khoa khám phù hợp! 💙</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              messages.map((message, index) => (
                <div key={index} className={`message-wrapper ${message.role}`}>
                  {message.role === 'assistant' && (
                    <div className="bot-avatar-small">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2Z" fill="#2563EB"/>
                        <path d="M8 13C8.55228 13 9 12.5523 9 12C9 11.4477 8.55228 11 8 11C7.44772 11 7 11.4477 7 12C7 12.5523 7.44772 13 8 13Z" fill="white"/>
                        <path d="M16 13C16.5523 13 17 12.5523 17 12C17 11.4477 16.5523 11 16 11C15.4477 11 15 11.4477 15 12C15 12.5523 15.4477 13 16 13Z" fill="white"/>
                        <path d="M8.5 17H15.5C15.5 15.5 14.5 14 12 14C10 14 8.5 15.5 8.5 17Z" fill="white"/>
                      </svg>
                    </div>
                  )}
                  <div className={`message-content ${message.role}-message-content`}>
                    <div className="message-text">{message.content}</div>
                  </div>
                </div>
              ))
            )}

            {isTyping && (
              <div className="message-wrapper assistant">
                <div className="bot-avatar-small">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2Z" fill="#2563EB"/>
                    <path d="M8 13C8.55228 13 9 12.5523 9 12C9 11.4477 8.55228 11 8 11C7.44772 11 7 11.4477 7 12C7 12.5523 7.44772 13 8 13Z" fill="white"/>
                    <path d="M16 13C16.5523 13 17 12.5523 17 12C17 11.4477 16.5523 11 16 11C15.4477 11 15 11.4477 15 12C15 12.5523 15.4477 13 16 13Z" fill="white"/>
                    <path d="M8.5 17H15.5C15.5 15.5 14.5 14 12 14C10 14 8.5 15.5 8.5 17Z" fill="white"/>
                  </svg>
                </div>
                <div className="message-content bot-message-content">
                  <div className="typing-indicator">
                    <div className="typing-dots">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="chat-input">
            <div className="input-container">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder="Nhập tin nhắn của bạn..."
                className="message-input"
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                className={`send-button ${
                  isLoading || inputValue.trim() === '' ? 'disabled' : ''
                }`}
                disabled={isLoading || inputValue.trim() === ''}
                aria-label="Gửi tin nhắn"
                title="Gửi tin nhắn"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="chat-footer">
            <span className="powered-by">Powered by Gemini AI ✨</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWidget;