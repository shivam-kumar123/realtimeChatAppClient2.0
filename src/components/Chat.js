import React, { useEffect, useState } from "react"
import ScrollToBottom from "react-scroll-to-bottom"

import './Chat.css'

function Chat({socket, name, hash, isAdmin}) {

    const [aboutHash, SetAboutHash] = useState("Hash is your top secret...")
    const [displayButton, SetDisplayButton] = useState('more')
    const [currentMessage, setCurrentMessage] = useState('')
    const [messageList, setMessageList] = useState([])
    const [yourID, setYourID] = useState() //socket.id
    const [userCount, SetUserCount] = useState(0)
    const [roomPeopleNames, SetRoomPeopleNames] = useState([])

    const copyHashToClipboard = () => {
      // Use the Clipboard API to copy the hash value to the clipboard
      navigator.clipboard.writeText(hash);
    };

    useEffect(() => {

      socket.on("room_names", (name) => {
          SetRoomPeopleNames([name]) //sending all names of people in room
      })

        socket.on("room_count", (count) => {
            console.log(`count is: ${count}`)
            SetUserCount(count);
        });

        socket.on("receive_message", (data) => {
          setMessageList((list) => {
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
            setYourID(socket.id);
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
            setMessageList((list) => [...list, messageData]);
            setCurrentMessage("");
        }
  };

  const renderMessages = (currentMessage, index)=> {
    console.log(`currentMessage.body = ${currentMessage.body} and socket.id = ${socket.id}`)
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

    return(
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
            <button 
                onClick={HandleAboutHash}
                className="copy-button"
            >
                Read {displayButton}
            </button>
          <button onClick={copyHashToClipboard} className="copy-button">
            Copy Hash
          </button>
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
            {/* <div className="chat-header">
                <p>Live Chat - {userCount}</p>
            </div> */}
            <div className="chat-body">
                <ScrollToBottom className="message-container">
                {messageList.map(renderMessages)}
                </ScrollToBottom>
            </div>
            <form onSubmit={sendMessage}>
                <div className="chat-footer">
                <input
                    type="text"
                    value={currentMessage}
                    placeholder="Hey..."
                    onChange={(e) => {
                      setCurrentMessage(e.target.value);
                    }}
                />
                <button 
                    onClick={sendMessage}
                    >
                    &#9658;
                </button>
                </div>
            </form>
            </div>
        </div>
  )

}

export default Chat