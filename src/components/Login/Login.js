import React, { useState, useEffect } from 'react';
import { ToastContainer, toast} from 'react-toastify';
import { WhatsappShareButton, WhatsappIcon } from 'react-share';
import 'react-toastify/dist/ReactToastify.css';
import io from "socket.io-client";
import { FaCopy } from 'react-icons/fa';
import Chat from '../Chat/Chat.js';
import ToastError from '../Toaster/ToastError.js';
import ToastSuccess from '../Toaster/ToastSuccess.js';
import './Login.css';

const socket = io.connect(process.env.REACT_APP_HOSTED_SERVER_LOCAL);

function Login() {
    const [name, SetName] = useState(''); // Username 
    const [hash, SetHash] = useState(''); // Room id used in socket.io
    const [showCopy, SetShowCopy] = useState(false); // showing copy button 
    const [showChat, SetShowChat] = useState(false); // showing chats of room user wants to join
    const [isAdmin, SetIsAdmin] = useState(false); // Track admin status
    const [roomLimit, SetRoomLimit] = useState('2'); // max limit of room (ONLY FOR ADMIN)
    const [showUsernameError, SetShowUsernameError] = useState(false);
    const [showHashError, SetShowHashError] = useState(false);
    const [showRoomLimitError, SetShowRoomLimitError] = useState(false);
    const [showCopyHashSuccess, SetShowCopyHashSuccess] = useState(false);
    const [shivamMsg, SetShivamMsg] = useState(true); // SHIVAM KUMAR'S MESSAGE TO USERS
    const [mapIDName, SetMapIDName] = useState({}); // mpas socket.id to a name 

    useEffect(() => {
        SetShowHashError(false);
    }, [showHashError]);

    useEffect(() => {
        SetShowUsernameError(false);
    }, [showUsernameError]);

    useEffect(() => {
        SetShowRoomLimitError(false);
    }, [showRoomLimitError]);

    useEffect(() => {
        SetShowCopyHashSuccess(false);
    }, [showCopyHashSuccess]);

    const joinRoom = (e) => {
        e.preventDefault();
        const limit = parseInt(roomLimit);
        if (name === "") {
            SetShowUsernameError(true);
        } else if (hash === "") {
            SetShowHashError(true);
        } else if (isAdmin && (limit < 2 || limit > 100)) {
            SetShowRoomLimitError(true);
        } if(isAdmin && (name !== "" && hash !== "" && limit >= 2 && limit <= 100)) {
            mapIDName[socket.id] = name;
            socket.emit("join_room_admin", hash, name, limit);
            SetShowChat(true);
        } else if(!isAdmin && (name !== "" && hash !== "")){
            mapIDName[socket.id] = name;
            socket.emit("join_room_user", hash, name);
            SetShowChat(true);
        }
      };


      const handleRoomLimitChange = (e) => {
        const inputValue = parseInt(e.target.value);
        if (inputValue >= 2 && inputValue <= 100) {
            SetRoomLimit(inputValue);
        } else {
            SetRoomLimit('2');
            SetShowRoomLimitError(true);
            <ToastError 
                message="Please enter a number between 2 and 100" 
                time={3000}
                />
        }
    };

    const handleHash = (e) => {
        e.preventDefault();
        const str = require('randomstring').generate({
            length: 100,
            charset: process.env.REACT_APP_SECRET_KEY
        });
        SetHash(str);
        SetShowCopy(true);
        SetIsAdmin(true); 
        SetShowCopyHashSuccess(true);
    };

    const CopyHash = (e) => {
        e.preventDefault();
        const copyText = document.getElementById('hash-input');
        copyText.select();
        document.execCommand('copy');
    };

    const HandleTokenChange = (e) => {
        SetHash(e.target.value);
        SetIsAdmin(false);
    };

    useEffect(() => {
        SetShivamMsg(false);
    },[shivamMsg]);

    return (
        <div>
            <ToastContainer />
            {
                shivamMsg && 
                toast.info("In Security Token field Either Generate a Token or Copy Paste Someone's Generated Token ONLY.", {
                    position: "top-center",
                    autoClose: 30000,
                    hideProgressBar: false,
                    closeOnClick: false,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "light",
                    })
            }
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
                    message="make sure to Share the TOKEN on Whatsapp" 
                    time={6000}
                />
            )}
            { 
                !showChat &&
                <div><h1>Chat App</h1></div> && 
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
                                    placeholder="Max People in room, default is 2"
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
                                onChange={HandleTokenChange}
                                required
                            />
                            {
                                showCopy && 
                                <button onClick={CopyHash} className="copy-button">
                                    Copy Token<FaCopy />
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
                    <br />
                    {
                        showCopy && 
                        <div className='icon-container'>
                            <WhatsappShareButton url={String(hash)} quote={'TOKEN'}>
                                <WhatsappIcon size={40} round={true} />
                            </WhatsappShareButton>
                            <h4>Share Token on Whatsapp</h4>
                        </div>
                    }
                </div>
            }   
            {
                showChat &&
                <Chat
                    socket={socket}
                    name={name}
                    hash={hash}
                    isAdmin={isAdmin}
                    SetMapIDName={SetMapIDName}
                    mapIDName={mapIDName}
                />
            }
    </div>
    );
}

export default Login;