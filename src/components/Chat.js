import React, { useEffect, useState } from "react"
import ScrollToBottom from "react-scroll-to-bottom"

import './Chat.css'

function Chat({socket, name, hash}) {

    const [hashInitials, SetHashInitials] = useState(hash.substr(0,5) + "...")
    const [displayButton, SetDisplayButton] = useState('more')
    const [currentMessage, setCurrentMessage] = useState('')
    const [messageList, setMessageList] = useState([])
    const [yourID, setYourID] = useState()
    const [userCount, SetUserCount] = useState(0)

    useEffect(() => {

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

    const HandleHashInitials = () => {
        if(hash === hashInitials){
            SetHashInitials(hash.substr(0,5) + "...")
            SetDisplayButton('more')
        } else {
            SetHashInitials(hash)
            SetDisplayButton('less')
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
            <div>
                <h3>
                    ROOM ID (CONFIDENTIAL)
                    <div />
                    <div>
                        {hashInitials}
                    </div>
                </h3>
            <button 
                onClick={HandleHashInitials}
                className="copy-button"
            >
                Read {displayButton}
            </button>
        </div>
        <div className="chat-window">
            <div className="chat-header">
                <p>Live Chat - {userCount}</p>
            </div>
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