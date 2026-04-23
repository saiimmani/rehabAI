import React, { useState, useEffect, useRef, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Navbar, PageHeader } from '../components/Layout';
import { Card, Button } from '../components/UIComponents';
import apiClient from '../services/apiClient';

const AIChatAssistant = () => {
  const { user } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const quickQuestions = [
    'How do I strengthen my knee?',
    'Exercises for leg pain',
    'What should I do if I feel pain?',
    'How to improve shoulder mobility?',
    'Tips for back pain relief',
    'Schedule an appointment'
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    setMessages([
      {
        id: 1,
        type: 'bot',
        content: `Hello! 👋 I'm your AI Rehabilitation Assistant. I can help with exercises, pain management, and recovery tips.\n\nHow can I help you today?`,
        timestamp: new Date()
      }
    ]);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendToBackend = async (message) => {
    try {
      const response = await apiClient.post('/chat/message', {
        message,
        userId: user._id
      });
      return response.data.reply || getLocalAIResponse(message);
    } catch (error) {
      console.error('Error sending message:', error);
      return getLocalAIResponse(message);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const text = inputValue;
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setLoading(true);

    const reply = await sendToBackend(text);
    const botMessage = { id: Date.now() + 1, type: 'bot', content: reply, timestamp: new Date() };
    setMessages(prev => [...prev, botMessage]);
    setLoading(false);
  };

  const handleQuickQuestion = async (question) => {
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: question,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);

    const reply = await sendToBackend(question);
    const botMessage = { id: Date.now() + 1, type: 'bot', content: reply, timestamp: new Date() };
    setMessages(prev => [...prev, botMessage]);
    setLoading(false);
  };

  // Comprehensive local AI fallback — covers leg, hip, ankle, wrist, neck, etc.
  const getLocalAIResponse = (userMessage) => {
    const msg = userMessage.toLowerCase();

    if (msg.includes('hello') || msg.includes('hi ') || msg === 'hi' || msg.includes('hey')) {
      return `Hello! 👋 I'm your AI Rehabilitation Assistant. I'm here to help you with:\n\n• 🏋️ Exercise guidance and proper form\n• 💊 Pain management strategies\n• 📊 Progress tracking support\n• 📅 Appointment scheduling\n• 🧠 General rehabilitation advice\n\nWhat would you like help with today?`;
    }

    if (msg.includes('leg') || msg.includes('thigh') || msg.includes('hamstring') || msg.includes('quad') || msg.includes('calf') || msg.includes('shin')) {
      return `Here are effective **leg rehabilitation exercises**:\n\n1. **Quad Sets** — Sitting on floor, tighten quad muscle, hold 5 seconds. 3×15 reps.\n2. **Straight Leg Raises** — Lying flat, raise leg to 45°, hold 2 seconds. 3×12 reps.\n3. **Hamstring Curls** — Standing, curl heel toward glutes slowly. 3×12 reps.\n4. **Calf Raises** — Rise onto toes, lower slowly. 3×20 reps.\n5. **Seated Leg Press** — Light resistance, full range of motion. 3×12 reps.\n6. **Bridges** — Lying on back, lift hips, squeeze glutes. 3×15 reps.\n\n⚠️ Start with low resistance and increase gradually. Stop if you feel sharp pain!`;
    }

    if (msg.includes('knee')) {
      return `Here are effective **knee rehabilitation exercises**:\n\n1. **Knee Extensions** — Sit, extend one leg straight, hold 2 seconds. 3×10 reps.\n2. **Wall Squats** — Back flat on wall, slide down to 90°. 3×12 reps.\n3. **Step-ups** — Low step, step up/down slowly. 3×10 per leg.\n4. **Straight Leg Raises** — Lying flat, raise one leg to 45°. 3×15 reps.\n5. **Calf Raises** — Rise onto toes, lower slowly. 3×20 reps.\n6. **Terminal Knee Extension** — Band around knee, straighten fully. 3×15 reps.\n\n⚠️ Always warm up first. Stop if you feel sharp pain!`;
    }

    if (msg.includes('hip')) {
      return `Here are effective **hip rehabilitation exercises**:\n\n1. **Hip Flexor Stretch** — Lunge position, sink hips forward, hold 30 seconds.\n2. **Clamshells** — Side-lying, knees bent, open top knee like clamshell. 3×15 reps.\n3. **Hip Abduction** — Lying on side, raise top leg 30°, hold 2 seconds. 3×12 reps.\n4. **Bridges** — On back, lift hips, squeeze glutes. 3×15 reps.\n5. **Side-Lying Hip Circles** — Small controlled circles. 2 min each direction.\n6. **Standing Hip Extension** — Hold support, extend leg back slowly. 3×12 reps.\n\n⚠️ Keep movements slow and controlled. Avoid locking joints.`;
    }

    if (msg.includes('ankle') || msg.includes('foot') || msg.includes('heel')) {
      return `Here are effective **ankle rehabilitation exercises**:\n\n1. **Alphabet Tracing** — Lift foot, trace alphabet with toes. 2-3 sets.\n2. **Calf Raises** — Rise onto toes slowly, lower. 3×20 reps.\n3. **Ankle Circles** — Full range of motion rotations. 20 each direction.\n4. **Towel Scrunches** — Pick up towel with toes, hold 5 seconds. 3×10.\n5. **Resistance Band Flex/Point** — Band around foot, flex and point. 3×15 reps.\n6. **Single-Leg Balance** — 30 seconds each foot, progress to unstable surface.\n\n⚠️ Start non-weight-bearing exercises first if recently injured.`;
    }

    if (msg.includes('shoulder') || msg.includes('rotator')) {
      return `Here are **shoulder rehabilitation exercises**:\n\n1. **Pendulum Swings** — Lean forward, let arm hang, make small circles. 2 min each direction.\n2. **Doorway Stretch** — Arms at 90°, lean into doorway. Hold 30 seconds.\n3. **External Rotation** — Resistance band, rotate forearm outward. 3×15 reps.\n4. **Wall Crawl** — Walk fingers up wall as high as comfortable. 3×10 reps.\n5. **Scapular Retractions** — Squeeze shoulder blades together. 3×15 reps.\n\n⚠️ Always check with your therapist before starting new exercises!`;
    }

    if (msg.includes('back') || msg.includes('spine') || msg.includes('lumbar')) {
      return `**Back rehabilitation exercises**:\n\n1. **Cat-Cow Stretch** — On hands/knees, alternate arch and round back. 3×10.\n2. **Bird Dog** — Opposite arm/leg extension, hold 5 seconds. 3×10 each side.\n3. **Knee-to-Chest** — Lying on back, pull knee to chest. Hold 20 seconds each.\n4. **Bridge** — Lying on back, lift hips. 3×15 reps.\n5. **Pelvic Tilts** — Flatten lower back to floor, hold 5 seconds. 3×10.\n6. **Child's Pose** — Stretch arms forward, hold 30 seconds.`;
    }

    if (msg.includes('neck') || msg.includes('cervical')) {
      return `**Neck rehabilitation exercises**:\n\n1. **Chin Tucks** — Gently pull chin straight back. Hold 5 seconds. 3×10.\n2. **Neck Rotations** — Slowly turn head left/right, hold each side 10 seconds.\n3. **Side Bends** — Tilt ear toward shoulder gently. Hold 15 seconds each side.\n4. **Shoulder Rolls** — Roll shoulders backward in circles. 3×10.\n5. **Isometric Resistance** — Press hand against head (front, back, sides), no movement. Hold 5 seconds.\n\n⚠️ Never force neck movements. Stop if you feel any tingling or numbness.`;
    }

    if (msg.includes('wrist') || msg.includes('hand') || msg.includes('finger')) {
      return `**Wrist and hand rehabilitation**:\n\n1. **Wrist Flexion/Extension** — Rest forearm, bend wrist up and down. 3×15.\n2. **Wrist Circles** — Slow full circles, each direction. 20 reps.\n3. **Finger Spreads** — Spread fingers wide, hold 5 seconds. 3×10.\n4. **Grip Strengthening** — Squeeze soft ball or putty. 3×15 reps.\n5. **Thumb Opposition** — Touch thumb to each finger. 3×10 rounds.\n\n⚠️ Keep movements pain-free. Rest if swelling increases.`;
    }

    if (msg.includes('pain')) {
      return `I'm sorry you're experiencing pain. Here's what to do:\n\n🛑 **Immediate Steps:**\n1. Stop the activity if you feel sharp or severe pain\n2. Apply ice for 15-20 minutes (wrap in cloth)\n3. Rest and elevate if there's swelling\n\n📞 **Contact Your Care Team:**\n• Notify your physiotherapist — they can adjust your program\n• Log your pain level via "Log Daily Health"\n• If pain level is 8+ out of 10, your doctor is automatically alerted\n\n⚠️ Mild discomfort is normal, but sharp pain is always a warning sign!`;
    }

    if (msg.includes('progress') || msg.includes('how am i doing')) {
      return `📊 **Your Progress**\n\nView detailed progress in the **Progress Report** section. You'll find:\n\n✅ Exercise completion rate\n📈 Pain level trends over time\n🎯 Weekly exercise logs\n📅 Session history\n\n**To maximize recovery:**\n• Complete all assigned exercises\n• Log pain levels consistently\n• Communicate via Doctor Chat\n• Book regular sessions`;
    }

    if (msg.includes('appointment') || msg.includes('schedule') || msg.includes('book')) {
      return `📅 **Book a Session:**\n1. Go to **"Support"** in your dashboard\n2. Find your doctor or physiotherapist\n3. Click **"Book Appointment"**\n4. Confirm the booking\n\nOr use **"Doctor Chat"** to message your assigned doctor directly!`;
    }

    if (msg.includes('diet') || msg.includes('nutrition') || msg.includes('food') || msg.includes('eat')) {
      return `Nutrition plays a vital role in rehabilitation!\n\n**Key Recovery Nutrients:**\n🥩 **Protein** — Chicken, fish, eggs, legumes — muscle repair\n🥦 **Vitamin C** — Citrus, berries — collagen synthesis\n🐟 **Omega-3** — Salmon, walnuts — reduces inflammation\n🥛 **Calcium & Vitamin D** — Bone health\n💧 **Hydration** — 8-10 glasses water daily\n\nCheck your **Diet Plans** tab in the Patient Dashboard for your personalized plan!`;
    }

    if (msg.includes('sleep') || msg.includes('rest')) {
      return `Rest and sleep are critical for rehabilitation!\n\n**Recovery Sleep Tips:**\n😴 Aim for 7-9 hours per night\n🛏️ Ask your therapist about best sleep position for your injury\n📵 Avoid screens 1 hour before bed\n🧘 Gentle stretching before sleep helps\n\n**Active Recovery:**\nOn rest days, light walking or gentle stretching improves blood flow to healing tissues.`;
    }

    return `I'm here to support your rehabilitation journey! I can help with:\n\n🦵 **Leg, Knee & Hip exercises**\n💪 **Shoulder & Arm rehabilitation**\n🔙 **Back & Neck pain relief**\n🦶 **Ankle & Foot recovery**\n💊 **Pain management tips**\n📅 **Scheduling appointments**\n🥗 **Nutrition for recovery**\n\nJust describe your injury or ask about specific body part exercises!`;
  };

  const formatTime = (date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const renderContent = (content) => {
    return content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  };

  const userRole = user?.role;

  // Avatar based on message type and user role
  const getBotAvatar = () => (
    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm flex-shrink-0 shadow-md" title="AI Assistant">
      🤖
    </div>
  );

  const getUserAvatar = () => {
    const initials = user ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() : '?';
    const icon = userRole === 'doctor' ? '👨‍⚕️' : userRole === 'physiotherapist' ? '🧑‍🔬' : null;
    return (
      <div
        className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center text-xs font-bold text-white flex-shrink-0 shadow-md"
        title={userRole === 'doctor' ? 'Doctor' : userRole === 'physiotherapist' ? 'Physiotherapist' : 'Patient'}
      >
        {icon || initials || '?'}
      </div>
    );
  };

  return (
    <div className="min-h-screen relative flex flex-col">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none" />
      <Navbar />

      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-4 py-8 relative z-10">
        <PageHeader
          title="🤖 AI Chat Assistant"
          subtitle="Get instant answers to your rehabilitation questions — ask about any body part!"
        />

        <Card className="flex-1 flex flex-col min-h-96 mb-6 glass-panel border border-slate-700/50">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-1 scrollbar-thin" style={{ minHeight: '320px', maxHeight: '480px' }}>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-end gap-2 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {/* Bot avatar on left */}
                {message.type === 'bot' && getBotAvatar()}

                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                    message.type === 'user'
                      ? 'bg-gradient-to-tr from-indigo-600 to-purple-600 text-white rounded-br-sm shadow-[0_0_15px_rgba(99,102,241,0.3)]'
                      : 'bg-slate-800/80 border border-slate-700 text-slate-200 rounded-bl-sm backdrop-blur-md'
                  }`}
                >
                  {/* Sender label */}
                  <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${message.type === 'user' ? 'text-indigo-200' : 'text-indigo-400'}`}>
                    {message.type === 'user'
                      ? (userRole === 'doctor' ? '👨‍⚕️ Doctor' : userRole === 'physiotherapist' ? '🧑‍🔬 Physiotherapist' : '🧑 You')
                      : '🤖 AI Assistant'
                    }
                  </p>
                  <div
                    className="whitespace-pre-wrap text-sm leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: renderContent(message.content) }}
                  />
                  <p className={`text-xs mt-2 text-right ${message.type === 'user' ? 'text-indigo-200' : 'text-slate-500'}`}>
                    {formatTime(message.timestamp)}
                  </p>
                </div>

                {/* User avatar on right */}
                {message.type === 'user' && getUserAvatar()}
              </div>
            ))}

            {loading && (
              <div className="flex items-end gap-2 justify-start">
                {getBotAvatar()}
                <div className="bg-slate-800/80 border border-slate-700 text-slate-200 px-4 py-3 rounded-2xl rounded-bl-sm backdrop-blur-md">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 mb-1">🤖 AI Assistant</p>
                  <div className="flex space-x-1.5">
                    <div className="h-2 w-2 bg-indigo-400 rounded-full animate-bounce" />
                    <div className="h-2 w-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="h-2 w-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions */}
          {messages.length === 1 && (
            <div className="mb-4">
              <p className="text-xs text-slate-500 mb-2 font-semibold uppercase tracking-wider">Quick questions:</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {quickQuestions.map((question, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleQuickQuestion(question)}
                    className="text-left p-2.5 glass-card hover:bg-slate-700/50 transition-colors text-xs text-slate-300 font-medium rounded-xl"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <form onSubmit={handleSendMessage} className="mt-2 pt-4 border-t border-slate-700/50">
            <div className="flex gap-2">
              <input
                placeholder="Ask about any body part, exercise or pain management..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={loading}
                className="flex-1 premium-input"
              />
              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={loading || !inputValue.trim()}
              >
                {loading ? '...' : '📤 Send'}
              </Button>
            </div>
            <p className="text-xs text-slate-600 mt-2">Press Enter to send · Ask about knee, leg, shoulder, back, ankle etc.</p>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default AIChatAssistant;
