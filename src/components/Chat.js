import React, { useEffect, useState } from "react"
import ScrollToBottom from "react-scroll-to-bottom"

import './Chat.css'

function Chat({socket, name, hash, isAdmin, SetMapIDName , mapIDName}) {

    const [aboutHash, SetAboutHash] = useState("Hash is your top secret...")
    const [displayButton, SetDisplayButton] = useState('more')
    const [currentMessage, SetCurrentMessage] = useState('')
    const [messageList, SetMessageList] = useState([])
    const [yourID, SetYourID] = useState() //socket.id
    const [userCount, SetUserCount] = useState(0)
    const [roomPeopleNames, SetRoomPeopleNames] = useState([])
    const [selectedFile, SetSelectedFile] = useState(null);
    const [receivedFiles, SetReceivedFiles] = useState([]);
    const [isInRoom, SetIsInRoom] = useState(true); // Track if the user is currently in the room

    const HandleLeaveRoom = async () => {
      const leftUserName = mapIDName[socket.id]
      // alert(`${leftUserName} has left the room`);
        const updatedMap = { ...mapIDName };
        delete updatedMap[socket.id];
        SetMapIDName(updatedMap);
        const updatedRoomPeopleNames = roomPeopleNames.filter(name => leftUserName !== name);
        SetRoomPeopleNames(updatedRoomPeopleNames);
        SetUserCount(userCount - 1);
        SetIsInRoom(false);
        const msg = leftUserName + " has left the chat"
        const messageData = {
          id: yourID,
          room: hash, 
          author: "Hanuman Ji",
          message: msg,
          time:
          new Date(Date.now()).getHours() +
          ":" +
          new Date(Date.now()).getMinutes(),
        };
        await socket.emit("send_message", messageData);
        SetMessageList((list) => [...list, messageData]);
        socket.emit("leave_room", hash);
    };
      // Use useEffect to ensure state updates are complet

    
    useEffect(() => {
      // Listen for the "user left" event and update the room data
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

  // Function to handle file selection
  const handleFileSelect = (e) => {
    console.log(`file selected from ui`);
    const selectedFile = e.target.files[0];

    if (selectedFile) {
      console.log(`file selected: ${selectedFile.name}`);
      const fileReader = new FileReader();
      fileReader.onload = (e) => {
        const fileData = e.target.result;
        console.log(`file read, ready to send: ${selectedFile.name}`);
        socket.emit("file:data", {
          to: hash,
          data: fileData,
          fileName: selectedFile.name,
          fileType: selectedFile.type,
        });
      };
      fileReader.readAsArrayBuffer(selectedFile);

      // Clear the selected file
    } else {
      console.log("No file selected.");
    }
    e.target.value = null;
  };

// Function to send the selected file to the server
const sendFile = async (e) => {
  e.preventDefault();
  console.log(`trying to send file to server , still in client`)
  if (selectedFile) {
    console.log(`file might eject to server: ${selectedFile}`)
    const fileReader = new FileReader();
    fileReader.onload = (e) => {
      const fileData = e.target.result;
      console.log(`file ejected to server: ${fileData}`)
      socket.emit("file:data", { to: hash, data: fileData });
    };
    fileReader.readAsArrayBuffer(selectedFile);

    // Clear the selected file
    SetSelectedFile(null);
  } else {
    console.log("No file selected.");
  }
};

    // Function to handle the received file
    const handleReceivedFileClick = (fileData) => {
      // Create a Blob and provide a download link
      const blob = new Blob([fileData.data]);
      const downloadLink = document.createElement("a");
      downloadLink.href = URL.createObjectURL(blob);
      downloadLink.download = "received_file";
      console.log(`fileData: ${fileData.fileName}`)
      downloadLink.click();
      // Remove the downloaded file from the receivedFiles array
      SetReceivedFiles((prevFiles) => prevFiles.filter((file) => file !== fileData));
    };

    const copyHashToClipboard = () => {
      // Use the Clipboard API to copy the hash value to the clipboard
      navigator.clipboard.writeText(hash);
    };

    // Event listener for receiving file data
  useEffect(() => {
    socket.on("file:data", (data) => {
      console.log("Received file data from:", data.from);

      // Update the list of received files
      SetReceivedFiles((prevFiles) => [...prevFiles, data]);
    });

    return () => {
      // Clean up the event listener when the component unmounts
      socket.off("file:data");
    };
  }, [socket]);

    useEffect(() => {
    
      socket.on("room_names", (name) => {
          SetRoomPeopleNames([name]) //sending all names of people in room
      })

        socket.on("room_count", (count) => {
            console.log(`count is: ${count}`)
            SetUserCount(count);
        });

        socket.on("receive_message", (data) => {
          SetMessageList((list) => {
            // Check if the message is already present in the messageList
            const messageExists = list.some((message) => {
              return (
                message.room === data.room &&
                message.author === data.author &&
                message.message === data.message &&
                message.time === data.time
              );
            });
            
            // Add the message to the messageList only if it doesn't already exist
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
    
      }, [socket]);
      
    const HandleAboutHash = () => {
        if(aboutHash === "Hash is your top secret..."){
          SetAboutHash("Hash is your top secret, share it with people you know to connect with them, its a super secure key , you can chat with friends only if you both are on same hash")
          SetDisplayButton('less')
        } else {
          SetAboutHash(aboutHash.substr(0,23) + "...")
          SetDisplayButton('more')
        }
    }

    const sendMessage = async (e) => {
        e.preventDefault()
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
    console.log(`currentMessage.body = ${currentMessage.message} and socket.id = ${socket.id}`)
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
      {name} {isAdmin ? "an admin" : "a user"}
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
          <button onClick={copyHashToClipboard} className="copy-button">
              Copy Hash
          </button>
          {isInRoom && <button onClick={HandleLeaveRoom}>Leave Room</button>}
      </div>
      {
          isAdmin && 
          <div>
              <span>People in Room ({userCount}) : </span>
              {roomPeopleNames.map((name, index) => (
                  <span key={index}>{`${name} `}</span>
              ))}
          </div>
      }
      <div className="chat-window">
          <div className="chat-body">
              <ScrollToBottom className="message-container">
              {messageList.map(renderMessages)}
              {receivedFiles.map((fileData, index) => (
                  <div key={index}>
                  <p>Received File: {fileData.fileName}</p>
                  <button onClick={() => handleReceivedFileClick(fileData)}>Download</button>
                  </div>
              ))}
              </ScrollToBottom>
          </div>
          <form onSubmit={sendMessage}>
              <div className="chat-footer">
              <input
                  type="text"
                  value={currentMessage}
                  placeholder="Hey..."
                  onChange={(e) => {
                  SetCurrentMessage(e.target.value);
                  }}
              />
              <button onClick={sendMessage}>&#9658;</button>
              </div>
              <span>
              <input 
                  type="file" 
                  accept=".pdf,.txt,.png,.jpg,.jpeg,.ppt,.mkv,.mp3,.mp4" 
                  onChange={handleFileSelect} />
              <button onClick={sendFile}>Send File</button>
              </span>
          </form>
      </div>
  </div>
);
}

export default Chat