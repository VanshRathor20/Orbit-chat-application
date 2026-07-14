import {
  Avatar,
  Box,
  Button,
  Input,
  Spinner,
  Text,
  Image,
  useBreakpointValue,
} from "@chakra-ui/react";
import EmojiPicker from "emoji-picker-react";
import axios from "axios";
import { useEffect, useState, useRef } from "react";
import { LuCamera, LuPaperclip, LuSendHorizontal, LuImage, LuX, LuInfo, LuSmile, LuArrowLeft } from "react-icons/lu";
import { getSender, getSenderFull } from "../config/ChatLogics";
import { ChatState } from "../Context/ChatProvider";
import { toaster } from "./ui/toaster";
import "./styles.css";

const SingleChat = ({ fetchAgain, setFetchAgain, isRightPanelOpen, setIsRightPanelOpen }) => {

  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [isAttachmentOpen, setIsAttachmentOpen] = useState(false);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);

  const cameraRef = useRef();
  const galleryRef = useRef();
  const inputRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const emojiToggleButtonRef = useRef(null);

  const { user, selectedChat, setSelectedChat, setChats, socket, messages, setMessages } = ChatState();
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const isMobile = useBreakpointValue({ base: true, md: false });

  useEffect(() => {
    if (selectedChat && isMobile === false) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [selectedChat, isMobile]);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (
        isEmojiPickerOpen &&
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(e.target) &&
        emojiToggleButtonRef.current &&
        !emojiToggleButtonRef.current.contains(e.target)
      ) {
        setIsEmojiPickerOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isEmojiPickerOpen]);

  const fetchMessages = async () => {
    if (!selectedChat) return;

    try {
      setLoading(true);
      const config = {
        headers: { Authorization: `Bearer ${user?.token}` },
      };
      const { data } = await axios.get(
        `/api/message/${selectedChat._id}`,
        config
      );
      setMessages(data);
      setLoading(false);
    } catch (error) {
      toaster.create({
        title: "Error Occurred!",
        description: "Failed to load the messages",
        type: "error",
      });
      setLoading(false);
    }
  };

  const handleEmojiClick = (emojiObject) => {
    const cursor = inputRef.current?.selectionStart || newMessage.length;
    const textBefore = newMessage.slice(0, cursor);
    const textAfter = newMessage.slice(cursor);
    setNewMessage(textBefore + emojiObject.emoji + textAfter);

    // Optional: restore cursor position after render
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.selectionStart = cursor + emojiObject.emoji.length;
        inputRef.current.selectionEnd = cursor + emojiObject.emoji.length;
        inputRef.current.focus();
      }
    }, 10);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() && !selectedImage) return;

    try {
      setSending(true);
      let imageUrl = null;

      if (selectedImage) {
        const data = new FormData();
        data.append("file", selectedImage);
        data.append("upload_preset", "yapp-chat-app");
        data.append("cloud_name", "itcli5ya");

        const res = await fetch("https://api.cloudinary.com/v1_1/itcli5ya/image/upload", {
          method: "post",
          body: data,
        });
        const uploadData = await res.json();
        imageUrl = uploadData.url.toString();
      }

      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
      };

      let sentMessages = [];

      // Send image message if exists
      if (imageUrl) {
        const { data: imgData } = await axios.post(
          "/api/message",
          { content: imageUrl, chatId: selectedChat._id },
          config
        );
        sentMessages.push(imgData);
      }

      // Send text message (caption) if exists
      if (newMessage.trim()) {
        const { data: txtData } = await axios.post(
          "/api/message",
          { content: newMessage, chatId: selectedChat._id },
          config
        );
        sentMessages.push(txtData);
      }

      if (socket && selectedChat) {
        socket.emit("stop typing", selectedChat._id);
        setTyping(false);
      }

      setMessages((prev) => [...prev, ...sentMessages]);
      setNewMessage("");
      setSelectedImage(null);
      setImagePreviewUrl(null);
      setSending(false);

      const lastMsg = sentMessages[sentMessages.length - 1];
      if (lastMsg) {
        setChats((prevChats) => {
          const chatExists = prevChats.some((c) => c._id === selectedChat._id);
          if (chatExists) {
            const updatedChats = prevChats.map((c) => {
              if (c._id === selectedChat._id) {
                return { ...c, latestMessage: lastMsg };
              }
              return c;
            });
            const targetChat = updatedChats.find((c) => c._id === selectedChat._id);
            const remainingChats = updatedChats.filter((c) => c._id !== selectedChat._id);
            return [targetChat, ...remainingChats];
          } else {
            const newChat = { ...selectedChat, latestMessage: lastMsg };
            return [newChat, ...prevChats];
          }
        });
      }
    } catch (error) {
      toaster.create({
        title: "Error Occurred!",
        description: "Failed to send the message",
        type: "error",
      });
      setSending(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type === "image/jpeg" || file.type === "image/png" || file.type === "image/gif") {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      toaster.create({
        title: "Please Select an Image!",
        type: "warning",
      });
    }
    e.target.value = null;
  };

  const typingHandler = (e) => {
    setNewMessage(e.target.value);

    if (!socketConnected) return;

    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat._id);
    }
    let lastTypingTime = new Date().getTime();
    var timerLength = 3000;
    setTimeout(() => {
      var timeNow = new Date().getTime();
      var timeDiff = timeNow - lastTypingTime;
      if (timeDiff >= timerLength && typing) {
        socket.emit("stop typing", selectedChat._id);
        setTyping(false);
      }
    }, timerLength);
  };

  useEffect(() => {
    if (socket) {
      setSocketConnected(true);
    }
  }, [socket]);

  useEffect(() => {
    if (!socket) return;

    socket.on("typing", (room) => {
      if (room === selectedChat?._id) {
        setIsTyping(true);
      }
    });

    socket.on("stop typing", (room) => {
      if (room === selectedChat?._id) {
        setIsTyping(false);
      }
    });

    return () => {
      socket.off("typing");
      socket.off("stop typing");
    };
  }, [socket, selectedChat]);



  useEffect(() => {
    fetchMessages();
    
    if (socket && selectedChat) {
      socket.emit("join chat", selectedChat._id);
    }
    // eslint-disable-next-line
  }, [selectedChat, socket]);

  if (!selectedChat) {
    return (
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        h="100%"
        w="100%"
        px={6}
      >
        <Text
          fontSize={{ base: "xl", md: "2xl", xl: "3xl" }}
          fontFamily="Work sans"
          color="var(--text-muted)"
          textAlign="center"
          maxW={{ base: "md", md: "md", xl: "none" }}
          whiteSpace={{ base: "normal", md: "normal", xl: "nowrap" }}
        >
          Select a chat to start messaging
        </Text>
      </Box>
    );
  }

  return (
    <Box display="flex" flexDir="column" w="100%" h="100%" justifyContent="space-between">
      <Box
        display="flex"
        w="100%"
        alignItems="center"
        justifyContent="space-between"
        pb={3}
        px={2}
        borderBottom="var(--glass-border)"
      >
        <Box display="flex" alignItems="center" gap={1}>
          <Button
            display={{ base: "flex", md: "none" }}
            variant="ghost"
            onClick={() => setSelectedChat(null)}
            color="rgba(255, 255, 255, 0.9)"
            _hover={{ bg: "whiteAlpha.200", color: "white" }}
            p={2}
            mr={1}
          >
            <LuArrowLeft size={22} strokeWidth={2.5} />
          </Button>
          
          <Box
            fontSize={{ base: "18px", md: "24px" }}
            fontFamily="Work sans"
            fontWeight="bold"
            cursor="pointer"
            onClick={() => setIsRightPanelOpen(!isRightPanelOpen)}
          >
          {!selectedChat.isGroupChat ? (
            <Box display="flex" alignItems="center" gap={3} overflow="hidden">
              <Avatar.Root size="sm" display="inline-flex" flexShrink={0}>
                <Avatar.Fallback
                  name={getSender(user, selectedChat.users)}
                />
                <Avatar.Image
                  src={getSenderFull(user, selectedChat.users)?.pic}
                />
              </Avatar.Root>
              <Text noOfLines={1} maxW={{ base: "180px", md: "350px", lg: "500px" }}>
                {getSender(user, selectedChat.users)}
              </Text>
            </Box>
          ) : (
            <Box display="flex" alignItems="center" gap={3} overflow="hidden">
              <Avatar.Root size="sm" display="inline-flex" flexShrink={0}>
                <Avatar.Fallback name={user.name} />
                <Avatar.Image src={user.pic} />
              </Avatar.Root>
              <Text noOfLines={1} maxW={{ base: "180px", md: "350px", lg: "500px" }}>
                {selectedChat.chatName.toUpperCase()}
              </Text>
            </Box>
          )}
          </Box>
        </Box>
        <Button
          variant="ghost"
          onClick={() => setIsRightPanelOpen(!isRightPanelOpen)}
          color="rgba(255, 255, 255, 0.9)"
          _hover={{ bg: "whiteAlpha.200", color: "white" }}
          p={2}
        >
          <LuInfo size={22} strokeWidth={2.5} />
        </Button>
      </Box>

      <Box
        className="messages"
        flex="1"
        p={3}
        w="100%"
        borderRadius="lg"
        overflowY="auto"
        sx={{
          scrollbarWidth: "thin",
          scrollbarColor: "transparent transparent",
          "&:hover": {
            scrollbarColor: "rgba(255, 255, 255, 0.2) transparent",
          },
          "&::-webkit-scrollbar": {
            width: "6px",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "transparent",
            borderRadius: "10px",
            transition: "background 0.2s",
          },
          "&:hover::-webkit-scrollbar-thumb": {
            background: "rgba(255, 255, 255, 0.2)",
          },
        }}
      >
        {loading ? (
          <Spinner size="xl" display="flex" mx="auto" mt={12} />
        ) : (
          messages.map((m) => (
            <Box
              key={m._id}
              display="flex"
              justifyContent={
                m.sender._id === user._id ? "flex-end" : "flex-start"
              }
              mb={2}
            >
              <Box
                bg={m.sender._id === user._id ? "var(--accent-gradient)" : "rgba(255, 255, 255, 0.05)"}
                border={m.sender._id !== user._id ? "var(--glass-border)" : "none"}
                color="white"
                borderRadius="var(--glass-radius-sm)"
                px={4}
                py={2}
                maxW="75%"
              >
                <Text fontSize="xs" fontWeight="bold" mb={1} color={m.sender._id === user._id ? "rgba(255,255,255,0.8)" : "var(--text-secondary)"}>
                  {m.sender.name}
                </Text>
                {m.content && (m.content.match(/\.(jpeg|jpg|gif|png)$/i) || m.content.includes("res.cloudinary.com")) ? (
                  <Image src={m.content} alt="chat media" maxW="100%" borderRadius="md" mt={1} />
                ) : (
                  <Text fontSize="sm">{m.content}</Text>
                )}
              </Box>
            </Box>
          ))
        )}
      </Box>

      <Box display="flex" flexDir="column" w="100%" mt={2}>
        {imagePreviewUrl && (
          <Box position="relative" mb={2} w="fit-content" alignSelf="flex-start">
            <Image 
              src={imagePreviewUrl} 
              alt="Preview" 
              maxH="150px" 
              borderRadius="md" 
              border="var(--glass-border)" 
              boxShadow="var(--glass-shadow)"
            />
            <Box 
              position="absolute" 
              top={-2} 
              right={-2} 
              bg="rgba(0,0,0,0.6)" 
              borderRadius="full" 
              p={1} 
              cursor="pointer"
              backdropFilter="blur(4px)"
              onClick={() => {
                setSelectedImage(null);
                setImagePreviewUrl(null);
              }}
              _hover={{ bg: "rgba(0,0,0,0.8)" }}
            >
              <LuX size={16} color="white" />
            </Box>
          </Box>
        )}
        
        <Box display="flex" w="100%" gap={2} alignItems="center">
        <Box position="relative" flex="1">
          <input type="file" accept="image/*" capture="environment" style={{ display: "none" }} ref={cameraRef} onChange={handleImageUpload} />
          <input type="file" accept="image/*" style={{ display: "none" }} ref={galleryRef} onChange={handleImageUpload} />
          
          {isEmojiPickerOpen && (
            <Box
              ref={emojiPickerRef}
              position="absolute"
              bottom="100%"
              left={0}
              mb={2}
              zIndex={11}
              boxShadow="var(--glass-shadow)"
              borderRadius="lg"
              overflow="hidden"
              border="var(--glass-border)"
            >
              <EmojiPicker theme="dark" onEmojiClick={handleEmojiClick} />
            </Box>
          )}

          <Box 
            ref={emojiToggleButtonRef}
            position="absolute" 
            left={4} 
            top="50%" 
            transform="translateY(-50%)" 
            zIndex={2} 
            cursor="pointer" 
            onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)} 
            color="var(--text-muted)" 
            _hover={{ color: "var(--text-primary)" }}
          >
            <LuSmile size={20} />
          </Box>

          {isAttachmentOpen && (
            <>
              <Box position="fixed" inset={0} zIndex={10} onClick={() => setIsAttachmentOpen(false)} />
              <Box
                position="absolute"
                bottom="100%"
                right={0}
                mb={2}
                p={2}
                bg="var(--glass-bg)"
                backdropFilter="var(--glass-blur)"
                border="var(--glass-border)"
                borderRadius="var(--glass-radius-lg)"
                boxShadow="var(--glass-shadow)"
                zIndex={11}
                display="flex"
                gap={2}
              >
                <Box
                  display="flex"
                  flexDir="column"
                  alignItems="center"
                  justifyContent="center"
                  p={3}
                  bg="rgba(255, 255, 255, 0.05)"
                  borderRadius="md"
                  cursor="pointer"
                  _hover={{ bg: "rgba(255, 255, 255, 0.1)" }}
                  onClick={() => { setIsAttachmentOpen(false); cameraRef.current.click(); }}
                >
                  <LuCamera size={24} color="var(--text-primary)" />
                  <Text fontSize="xs" mt={1} color="var(--text-secondary)">Camera</Text>
                </Box>
                <Box
                  display="flex"
                  flexDir="column"
                  alignItems="center"
                  justifyContent="center"
                  p={3}
                  bg="rgba(255, 255, 255, 0.05)"
                  borderRadius="md"
                  cursor="pointer"
                  _hover={{ bg: "rgba(255, 255, 255, 0.1)" }}
                  onClick={() => { setIsAttachmentOpen(false); galleryRef.current.click(); }}
                >
                  <LuImage size={24} color="var(--text-primary)" />
                  <Text fontSize="xs" mt={1} color="var(--text-secondary)">Gallery</Text>
                </Box>
              </Box>
            </>
          )}

          {isTyping && (
            <Box position="absolute" bottom="100%" left={4} mb={1} zIndex={2}>
              <Text fontSize="xs" color="var(--text-muted)" fontStyle="italic">
                typing...
              </Text>
            </Box>
          )}

          <Input
            ref={inputRef}
            placeholder="Message..."
            value={newMessage}
            onChange={typingHandler}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            bg="rgba(255, 255, 255, 0.05)"
            border="var(--glass-border)"
            borderRadius="full"
            color="var(--text-primary)"
            pl={12}
            pr={12}
            h="46px"
            _focus={{ borderColor: "var(--text-muted)", boxShadow: "none" }}
          />

          <Box 
            position="absolute" 
            right={3} 
            top="50%" 
            transform="translateY(-50%)" 
            zIndex={2} 
            cursor="pointer" 
            onClick={() => setIsAttachmentOpen(!isAttachmentOpen)} 
            color="var(--text-muted)" 
            _hover={{ color: "var(--text-primary)" }}
          >
            <LuPaperclip size={20} />
          </Box>
        </Box>

        <Button
          bg="var(--accent-gradient)"
          color="white"
          borderRadius="full"
          _hover={{ opacity: 0.9 }}
          onClick={() => sendMessage()}
          loading={sending}
          px={{ base: 4, md: 6 }}
          h="46px"
        >
          <LuSendHorizontal size={20} style={{ transform: "rotate(-35deg) translate(2px, -2px)" }} />
          {/* <Text display={{ base: "none", md: "block" }} ml={2}></Text> */}
        </Button>
      </Box>
    </Box>
    </Box>
  );
};

export default SingleChat;
