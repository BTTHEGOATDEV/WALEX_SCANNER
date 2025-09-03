import { useState, useEffect } from "react";
import { Bot, MessageCircle, X, Send } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const WalkingChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m your personal security assistant. How can I help you with your penetration testing today?',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isVisible, setIsVisible] = useState(true);
  const [walkingDirection, setWalkingDirection] = useState<'right' | 'left' | 'paused-right' | 'paused-left'>('right');
  const [isWalking, setIsWalking] = useState(true);
  const [animationKey, setAnimationKey] = useState(0);

  // Auto-responses based on keywords
  const getAutoResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();
    
    if (message.includes('scan') || message.includes('test')) {
      return 'Great! You can start a new scan from the Scans page. Choose from domain scanning, port scanning, vulnerability assessment, or SSL/TLS analysis based on your needs.';
    }
    if (message.includes('help') || message.includes('how')) {
      return 'I can help you navigate the platform! Use the Dashboard to get an overview, go to Scans to run security tests, check Reports for analysis, or visit Settings to configure your profile.';
    }
    if (message.includes('report') || message.includes('result')) {
      return 'You can view all your scan results in the Reports section. Each completed scan will have detailed findings with severity levels and recommendations.';
    }
    if (message.includes('security') || message.includes('vulnerability')) {
      return 'This platform offers comprehensive security testing including vulnerability assessments, port scans, SSL certificate analysis, and domain reconnaissance. What specific security aspect interests you?';
    }
    if (message.includes('hi') || message.includes('hello')) {
      return 'Hello there! Welcome to BTScan. I\'m here to help you with any questions about penetration testing and security assessments.';
    }
    
    return 'That\'s a great question! While I\'m a simple assistant, I can help guide you through the platform features. Try asking about scans, reports, or security testing!';
  };

  const sendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');

    // Add bot response after a delay
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getAutoResponse(inputMessage),
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  // Hide chatbot temporarily when dialog is open
  useEffect(() => {
    setIsVisible(!isOpen);
  }, [isOpen]);

  // Smooth walking animation cycle with creative movement
  useEffect(() => {
    if (isOpen) return;
    
    const walkingCycle = () => {
      // Reset animation key to restart CSS animations
      setAnimationKey(prev => prev + 1);
      
      // Start walking right
      setWalkingDirection('right');
      setIsWalking(true);
      
      setTimeout(() => {
        // Pause at right edge for 5 seconds
        setWalkingDirection('paused-right');
        setIsWalking(false);
        
        setTimeout(() => {
          // Walk left
          setWalkingDirection('left');
          setIsWalking(true);
          
          setTimeout(() => {
            // Pause at left edge for 5 seconds
            setWalkingDirection('paused-left');
            setIsWalking(false);
            
            setTimeout(() => {
              walkingCycle(); // Restart cycle
            }, 5000);
          }, 10000); // 10 seconds to walk left (longer distance)
        }, 5000);
      }, 10000); // 10 seconds to walk right
    };

    // Start immediately
    walkingCycle();
  }, [isOpen]);

  return (
    <>
      {/* Walking Bot */}
      <div className={`fixed bottom-4 z-40 transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <div 
              key={animationKey}
              className={`chatbot-container cursor-pointer group ${
                walkingDirection === 'right' ? 'chatbot-walk-right' : 
                walkingDirection === 'left' ? 'chatbot-walk-left' : 
                walkingDirection === 'paused-right' ? 'chatbot-pause-right' :
                'chatbot-pause-left'
              }`}
            >
              <div className="relative">
                {/* Speech Bubble - Always visible and properly positioned */}
                <div className={`absolute chatbot-speech-bubble ${
                  walkingDirection === 'left' || walkingDirection === 'paused-left' 
                    ? 'chatbot-bubble-left' : 'chatbot-bubble-right'
                } bg-background/95 backdrop-blur-sm border border-border rounded-xl px-4 py-3 text-sm font-medium shadow-lg transition-all duration-500 min-w-max`}>
                  <div className="flex items-center gap-2">
                    <span className="animate-pulse">👋</span>
                    <span>Hey! I'm your personal assistant</span>
                  </div>
                  {/* Speech bubble tail */}
                  <div className={`absolute ${
                    walkingDirection === 'left' || walkingDirection === 'paused-left'
                      ? 'top-full left-6 border-t-border border-t-4 border-x-4 border-x-transparent'
                      : 'top-full right-6 border-t-border border-t-4 border-x-4 border-x-transparent'
                  }`}></div>
                </div>

                {/* Bot Character */}
                <div className="chatbot-character bg-gradient-to-br from-primary/30 to-primary/10 backdrop-blur-sm border border-primary/40 rounded-full p-4 shadow-xl hover:shadow-2xl transition-all duration-300 group-hover:from-primary/40 group-hover:to-primary/20 group-hover:scale-110">
                  <div className={`relative ${isWalking ? 'chatbot-walking-motion' : 'chatbot-idle-motion'}`}>
                    <Bot className={`h-7 w-7 text-primary transition-all duration-300 ${
                      walkingDirection === 'left' || walkingDirection === 'paused-left' ? 'scale-x-[-1]' : ''
                    } group-hover:text-primary/80`} />
                    {/* Walking dust effect */}
                    {isWalking && (
                      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                        <div className="chatbot-dust-particles"></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </DialogTrigger>

          {/* Chat Modal */}
          <DialogContent className="fixed bottom-4 right-4 max-w-md w-full m-0 translate-x-0 translate-y-0 data-[state=open]:slide-in-from-bottom-4 data-[state=closed]:slide-out-to-bottom-4">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-primary" />
                Security Assistant
              </DialogTitle>
            </DialogHeader>

            <Card className="h-80 flex flex-col">
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 text-sm ${
                          message.sender === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        {message.text}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Input
                    placeholder="Ask me anything about security testing..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1"
                  />
                  <Button 
                    onClick={sendMessage}
                    size="sm"
                    disabled={!inputMessage.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default WalkingChatbot;