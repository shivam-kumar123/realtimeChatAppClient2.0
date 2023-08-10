import React, { useState, useEffect } from 'react';
import { ToastContainer, toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import io from "socket.io-client";
import { FaCopy } from 'react-icons/fa';

import Chat from './Chat'
import ToastError from './ToastError'
import ToastSuccess from './ToastSuccess'
import './Login.css';

const socket = io.connect("https://chatappserver2-0.onrender.com");
// const socket = io.connect("http://localhost:3001");

function Login() {
    const [name, SetName] = useState(''); // Username 
    const [hash, SetHash] = useState(''); // Room id used in socket.io
    const [showCopy, SetShowCopy] = useState(false) // showing copy button 
    const [showChat, SetShowChat] = useState(false) // showing chats
    const [isAdmin, setIsAdmin] = useState(false); // Track admin status
    const [roomLimit, SetRoomLimit] = useState('0')
    const [showUsernameError, SetShowUsernameError] = useState(false);
    const [showHashError, SetShowHashError] = useState(false);
    const [showRoomLimitError, SetShowRoomLimitError] = useState(false);
    const [showCopyHashSuccess, SetShowCopyHashSuccess] = useState(false);
    const [shivamMsg, SetShivamMsg] = useState(true)

    useEffect(() => {
        SetShowHashError(false)
    }, [showHashError])

    useEffect(() => {
        SetShowUsernameError(false)
    }, [showUsernameError])

    useEffect(() => {
        SetShowRoomLimitError(false)
    }, [showRoomLimitError])

    useEffect(() => {
        SetShowCopyHashSuccess(false)
    }, [showCopyHashSuccess])

    // helps to join the room using socket.io by emitting our unique hash
    const joinRoom = (e) => {
        e.preventDefault()
        SetShowUsernameError(false);
        SetShowHashError(false);
        SetShowRoomLimitError(false);
        SetShowCopyHashSuccess(false)
        const limit = parseInt(roomLimit);
        if (name === "") {
            SetShowUsernameError(true);
        } if (hash === "") {
            SetShowHashError(true);
        } if (isAdmin && (limit < 2 || limit > 100)) {
            SetShowRoomLimitError(true);
        } if(isAdmin && (name !== "" && hash !== "" && limit >= 2 && limit <= 100)) {
            socket.emit("join_room_admin", hash, name, limit);
            SetShowChat(true);
        } else if(!isAdmin && (name !== "" && hash !== "")){
            socket.emit("join_room_user", hash, name);
            SetShowChat(true);
        }
      };


      const handleRoomLimitChange = (e) => {
        const inputValue = parseInt(e.target.value);
        if (inputValue >= 2 && inputValue <= 100) {
            SetRoomLimit(inputValue);
        } else {
            SetRoomLimit('-1');
            SetShowRoomLimitError(true);
            <ToastError 
                message="Please enter a number between 2 and 100" 
                time={3000}
                />
            console.log("Please enter a number between 2 and 100.");
        }
    };

    // creates hash and sets it 
    const handleHash = (e) => {
        e.preventDefault();
        const str = require('randomstring').generate({
            length: 100,
            charset: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890`~!@#$%^&*()-=_+{}[]:;",<.>?/|',
        });
        SetHash(str);
        SetShowCopy(true) 
        setIsAdmin(true); // Set admin status
        SetShowCopyHashSuccess(true)
    };

    // helps in copying the hash value generated by the system
    const copyHash = (e) => {
        e.preventDefault()
        const copyText = document.getElementById('hash-input');
        copyText.select();
        document.execCommand('copy');
    };

    const HandleSetHash = (e) => {
        e.preventDefault();
        // Process the pasted text and set it in the state
        const pastedText = (e.clipboardData || window.clipboardData).getData('Text');
        SetHash(pastedText);
        // SetHash(e.target.value)
        // setIsAdmin(false)
    }

    const HandleKeyPress = (e) => {
        e.preventDefault()
    }

    useEffect(() => {
        SetShivamMsg(false)
    },[shivamMsg])

    return (
        <div>
                {
                    !showChat &&
                    <div>
                        <h1>Chat App</h1>
                    </div>
                }
                <ToastContainer />
                {
                    shivamMsg && 
                    toast.info("In Security Token field Either Generate a Token or Copy Paste Someone's Generated Token ONLY.", {
                        position: "top-center",
                        autoClose: 60000,
                        hideProgressBar: false,
                        closeOnClick: false,
                        pauseOnHover: false,
                        draggable: true,
                        progress: undefined,
                        theme: "light",
                        })
                }
                {console.log(`return of login called`)}
                {showUsernameError && (
                <ToastError 
                    message="Please enter a Username" 
                    time={3000}
                    />
                )}
                {showHashError && (
                    <ToastError 
                        message="Please Generate a Token" 
                        time={3000}
                        />
                )}
                {showRoomLimitError && (
                    <ToastError 
                        message="Please enter a number between 2 and 100" 
                        time={3000}
                    />
                )}
                {showCopyHashSuccess && (
                    <ToastSuccess
                        message="make sure to copy the token" 
                        time={3000}
                    />
                )}
                { 
                !showChat &&
                <div className="login-box">
                    <form>
                        <div className="user-box">
                            <input
                                type="text"
                                value={name}
                                placeholder="Username"
                                required
                                onChange={(e) => SetName(e.target.value)}
                            />
                        </div>
                        { 
                            isAdmin && 
                            <div className="user-box">
                                <input
                                    type="number"
                                    // value={roomLimit}
                                    placeholder="Max People in room [2, 100]"
                                    required
                                    onChange={handleRoomLimitChange}
                                />
                            </div>
                        }
                        <div className="user-box">
                            <input
                                type="text"
                                id="hash-input"
                                value={hash}
                                placeholder="Security Token (CONFIDENTIAL)"
                                onInput={HandleSetHash}
                                onKeyPress={HandleKeyPress}
                                // onChange={HandleSetHash}
                                required
                            />
                            {
                                showCopy && 
                                <button onClick={copyHash} className="copy-button">
                                    Copy Token<FaCopy /> {/* Copy icon */}
                                </button>
                            }
                        </div>
                        <center>
                            <button onClick={handleHash}>
                                Generate Token
                            </button>
                            <button onClick={joinRoom}>
                                Chat
                            </button>
                        </center>
                    </form>
                    <h4>
                        Made with Love by Shivam Kumar
                        <div>Epitome of Secure Chat Application :)</div>
                    </h4>
                </div>
            }
            {
                showChat &&
                <Chat
                    socket={socket}
                    name={name}
                    hash={hash}
                    isAdmin={isAdmin}
                />
            }
        </div>
    );
}

export default Login;