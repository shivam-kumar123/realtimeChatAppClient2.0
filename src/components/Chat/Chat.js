import React, { useEffect, useState } from "react";
import ScrollToBottom from "react-scroll-to-bottom";
import './Chat.css';

function Chat({socket, name, hash, isAdmin, SetMapIDName, mapIDName, roomLimit}) {

    const [aboutHash, SetAboutHash] = useState("Token is your top secret...");
    const [displayButton, SetDisplayButton] = useState('more');
    const [currentMessage, SetCurrentMessage] = useState('');
    const [messageList, SetMessageList] = useState([]);
    const [yourID, SetYourID] = useState(''); //socket.id
    const [userCount, SetUserCount] = useState(0);
    const [roomPeopleNames, SetRoomPeopleNames] = useState([]);
    const [selectedFile, SetSelectedFile] = useState(null);
    const [fileInputText, setFileInputText] = useState('No file selected');
    const [receivedFiles, SetReceivedFiles] = useState([]); // for images transfer less than 1 mb
    const [isInRoom, SetIsInRoom] = useState(true); // Track if the user is currently in the room

    useEffect(() => {
      socket.on("room_names", (name) => {
        const names = [...name];
          SetRoomPeopleNames(names) //sending all names of people in room
          SetUserCount(names.length);
      })
    
        socket.on("receive_message", (data) => {
          SetMessageList((list) => {
            const messageExists = list.some((message) => {
              return (
                message.room === data.room &&
                message.author === data.author &&
                message.message === data.message &&
                message.time === data.time
              );
            });
            if (!messageExists) {
              return [...list, data];
            } else {
              return list;
            }
          });
        });
    
        if (socket.current) {
          socket.current.on("your_id", id => {
            SetYourID(socket.id);
          });
        }
      }, [socket, userCount, hash, yourID]);

      useEffect(() => {
        socket.on("join_user_msg", (name) => {
          const msg = name + " has joined the chat";
          const messageData = {
            id: yourID,
            room: hash, 
            author: "ChatBot",
            message: msg,
            time:
            new Date(Date.now()).getHours() +
            ":" +
            new Date(Date.now()).getMinutes(),
          };
          // await socket.emit("send_message", messageData);
          SetMessageList((list) => [...list, messageData]);
        })
      },[socket, hash, yourID]);

      useEffect(() => {
        socket.on("user_left", (leftName) => {
            SetRoomPeopleNames((prevNames) => prevNames.filter(name => name !== leftName));
            SetUserCount(count => count - 1);
        });
        return () => {
          // Clean up the event listener when the component unmounts
          socket.off("file:data");
          socket.off("user_left");
      };
    }, [socket]);

    useEffect(() => {
      socket.on("file:data", (data) => {
        SetReceivedFiles((prevFiles) => [...prevFiles, data]);
      });
      return () => {
        // Clean up the event listener when the component unmounts
        socket.off("file:data");
      };
    }, [socket]);

    const HandleLeaveRoom = async () => {
      const leftUserName = mapIDName[socket.id];
      const updatedMap = { ...mapIDName };
      delete updatedMap[socket.id];
      SetMapIDName(updatedMap);
      const updatedRoomPeopleNames = roomPeopleNames.filter(name => leftUserName !== name);
      SetRoomPeopleNames(updatedRoomPeopleNames);
      SetUserCount(userCount - 1);
      SetIsInRoom(false);
      const msg = leftUserName + " has left the chat";
      const messageData = {
        id: yourID,
        room: hash, 
        author: "ChatBot",
        message: msg,
        time:
        new Date(Date.now()).getHours() +
        ":" +
        new Date(Date.now()).getMinutes(),
      };
      await socket.emit("send_message", messageData);
      SetMessageList((list) => [...list, messageData]);
      socket.emit("leave_room", hash, leftUserName);
      window.location.reload();
    };
    

  const HandleFileSelect = (e) => {

    const selectedFile = e.target.files[0];

    if(selectedFile) {
      const fileReader = new FileReader();
      fileReader.onload = (e) => {
        const fileData = e.target.result;
        socket.emit("file:data", {
          to: hash,
          data: fileData,
          fileName: selectedFile.name,
          fileType: selectedFile.type,
        });
      };
      fileReader.readAsArrayBuffer(selectedFile);
      setFileInputText(selectedFile.name);
    }
    e.target.value = null;
  };

const SendFile = async (e) => {
  e.preventDefault();
  if (selectedFile) {
    const fileReader = new FileReader();
    fileReader.onload = (e) => {
      const fileData = e.target.result;
      socket.emit("file:data", { to: hash, data: fileData });
    };
    fileReader.readAsArrayBuffer(selectedFile);
    SetSelectedFile(null);
  }
};

  const HandleReceivedFileCancel = (fileData) => {
    SetReceivedFiles((prevFiles) => prevFiles.filter((file) => file !== fileData));
  };

    const HandleReceivedFileClick = (fileData) => {
      const blob = new Blob([fileData.data], { type: fileData.fileType }); 
      const downloadLink = document.createElement("a");
      downloadLink.href = URL.createObjectURL(blob);
      downloadLink.download = fileData.fileName;
      downloadLink.click();
      SetReceivedFiles((prevFiles) => prevFiles.filter((file) => file !== fileData));
    };

    const CopyHashToClipboard = () => {
      // Use the Clipboard API to copy the hash value to the clipboard
      navigator.clipboard.writeText(hash);
    };


      
    const HandleAboutHash = () => {
        if(aboutHash === "Token is your top secret..."){
          SetAboutHash("Token is your top secret, share it with people you know to connect with them, its a super secure key , you can chat with friends only if you are in room with same Token");
          SetDisplayButton('less');
        } else {
          SetAboutHash(aboutHash.substr(0,24) + "...");
          SetDisplayButton('more');
        }
    }

    const SendMessage = async (e) => {
        e.preventDefault();
        if (currentMessage !== "") {
            const messageData = {
            id: yourID,
            room: hash, 
            author: name,
            message: currentMessage,
            time:
                new Date(Date.now()).getHours() +
                ":" +
                new Date(Date.now()).getMinutes(),
            };
            await socket.emit("send_message", messageData);
            SetMessageList((list) => [...list, messageData]);
            SetCurrentMessage("");
        }
  };

  const renderMessages = (currentMessage, index)=> {
    return (
      <div
        key={index}
        className="message"
        id={name === currentMessage.author ? "you" : "other"}
      >
        <div>
          <div className="message-content">
            <p>{currentMessage.message}</p>
          </div>
          <div className="message-meta">
            <p id="time">{currentMessage.time}</p>
            <p id="author">{currentMessage.author}</p>
          </div>
        </div>
      </div>
    );
  }

return (
  <div>
      {name} {isAdmin ? "an admin " : "a user "} 
      {
        isAdmin && 
        <div>
          Room limit: {roomLimit}
        </div>
      }
      <div>
          <h5>
              ROOM ID / Hash (CONFIDENTIAL)
              <div />
              <span>
                  {aboutHash}
              </span>
          </h5>
          <button onClick={HandleAboutHash} className="copy-button">
              Read {displayButton}
          </button>
          <button onClick={CopyHashToClipboard} className="copy-button">
              Copy Token
          </button>
          {isInRoom && <button onClick={HandleLeaveRoom}>Leave Room</button>}
      </div>
      {
          isAdmin && 
          <div>
              <span>People in Room ({userCount}) : </span>
              {roomPeopleNames.map((name, index) => (
                  <span key={index}>{`${name}, `}</span>
              ))}
          </div>
      }
      {
        !isAdmin && 
        <span>People in Room - ({userCount})</span>
      }
      <div className="chat-window">
          <div className="chat-body">
              <ScrollToBottom className="message-container">
              {messageList.map(renderMessages)}
              {receivedFiles.map((fileData, index) => (
                  <div key={index}>
                  <p>Received File: {fileData.fileName}</p>
                  <button onClick={() => HandleReceivedFileClick(fileData)}>Download</button>
                  <button onClick={() => HandleReceivedFileCancel(fileData)}>Cancel</button>
                  </div>
              ))}
              </ScrollToBottom>
          </div>
          <form onSubmit={SendMessage}>
              <div className="chat-footer">
              <input
                  type="text"
                  value={currentMessage}
                  placeholder="Hey..."
                  onChange={(e) => {
                  SetCurrentMessage(e.target.value);
                  }}
              />
              <button onClick={SendMessage}>&#9658;</button>
              </div>
              <span>
              <input 
                  type="file" 
                  // accept=".txt,.png,.jpg,.jpeg,.pdf,.pptx,.doc,.zip" 
                  style={{ display: {fileInputText} }}
                  onChange={HandleFileSelect} />
              <button onClick={SendFile}>Send File</button>
              </span>
          </form>
      </div>
  </div>
);
}

export default Chat