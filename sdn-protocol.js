﻿module.exports.CommandEnum = {
    CTRL_MOVE : 0x01, // In
    CTRL_STOP : 0x02, // In
    CTRL_MOVETO : 0x54, // In
    CTRL_MOVEOF : 0x04, // In
    CTRL_WINK : 0x05, // In

    GET_MOTOR_POSITION : 0x0C, // In
    POST_MOTOR_POSITION : 0x0D,
    GET_MOTOR_STATUS : 0x0E, // In
    POST_MOTOR_STATUS : 0x0F,

    SET_MOTOR_LIMITS : 0x11, // In
    SET_MOTOR_DIRECTION : 0x12, // In
    SET_MOTOR_ROLLING_SPEED : 0x13, // In
    SET_MOTOR_IP : 0x15, // In

    GET_MOTOR_LIMITS : 0x21,
    GET_MOTOR_DIRECTION : 0x22,
    GET_MOTOR_ROLLING_SPEED : 0x23,
    GET_MOTOR_IP : 0x25,
    GET_DCT_LOCK : 0x27,
    GET_FACTORY_DEFAULT : 0x2F,
    POST_MOTOR_LIMITS : 0x31,
    POST_MOTOR_DIRECTION : 0x32,
    POST_MOTOR_ROLLING_SPEED : 0x33,
    POST_MOTOR_IP : 0x35,
    POST_DCT_LOCK : 0x37,
    POST_FACTORY_DEFAULT : 0x3F,

    GET_NODE_ADDR : 0x50,
    GET_GROUP_ADDR : 0x51,
    GET_NODE_LABEL : 0x55,
    GET_NODE_SERIAL_NUMBER : 0x5C,
    ET_NETWORK_ERROR_STAT : 0x5D,
    GET_NETWORK_STAT : 0x5E
};

const srcAddr = 0x01;

DevicesEnum = {
    ILT : 0x00,
    ST30 : 0x02,
};

module.exports.MoveEnum = {
    UpLimit : 0x01,
    DownLimit : 0x02,
    Stop : 0x03,
    Ip : 0x04,
    NextIpUp : 0x05,
    NextIpDown : 0x06,
    JogUp : 0x0A,
    JogDown : 0x0B,
    Percent : 0x10
};
 
CheckSum = function (msg) {
        var sum = 0x0000;
        var sumSize = msg.length - 2;
        for (var i = 0; i < sumSize; i++) {
            sum += msg[i];
        }
        return sum & 0xFFFF;
};


    
module.exports.MoveData = function (move, data) {
    const m_dataSize = 3;
    const m_cmdOffset = 0;
    
    var moveData = Buffer(m_dataSize);
    moveData[0] = move;
    moveData[1] = data & 0x00FF;
    moveData[2] = (data & 0xFF00) >> 8;
    
    return moveData;
};

module.exports.StopMotor = function (destAddr) {
    return module.exports.SomfyMsg(srcAddr, destAddr, module.exports.CommandEnum.CTRL_STOP, Buffer([0x00]));
};

module.exports.StopGroup = function (groupAddr) {
    return module.exports.SomfyMsg(groupAddr, 0x0, module.exports.CommandEnum.CTRL_STOP, Buffer([0x00]));
};

module.exports.DownLimit = function (destAddr) {
    var moveData = module.exports.MoveData(module.exports.MoveEnum.DownLimit, 0);
    return module.exports.IltMsg(srcAddr, destAddr, module.exports.CommandEnum.CTRL_MOVETO, moveData);
};

module.exports.DownLimitGroup = function (groupAddr) {
    var moveData = module.exports.MoveData(module.exports.MoveEnum.DownLimit, 0);
    return module.exports.IltMsg(groupAddr, 0x0, module.exports.CommandEnum.CTRL_MOVETO, moveData);
};

module.exports.UpLimit = function (destAddr) {
    var moveData = module.exports.MoveData(module.exports.MoveEnum.UpLimit, 0);
    return module.exports.IltMsg(srcAddr, destAddr, module.exports.CommandEnum.CTRL_MOVETO, moveData);
};

module.exports.UpLimitGroup = function (groupAddr) {
    var moveData = module.exports.MoveData(module.exports.MoveEnum.UpLimit, 0);
    return module.exports.IltMsg(groupAddr, 0x0, module.exports.CommandEnum.CTRL_MOVETO, moveData);
};

module.exports.GetPosition = function (destAddr) {
    return module.exports.SomfyMsg(srcAddr, destAddr, module.exports.CommandEnum.GET_MOTOR_POSITION, Buffer(0));
};

module.exports.GetPositionGroup = function (groupAddr) {
    return module.exports.SomfyMsg(groupAddr, 0x0, module.exports.CommandEnum.GET_MOTOR_POSITION, Buffer(0));
};

module.exports.SetPosition = function (destAddr, countPosition) {
    var moveData = module.exports.MoveData(module.exports.MoveEnum.CountPos, countPosition);
    return module.exports.SomfyMsg(srcAddr, destAddr, module.exports.CommandEnum.CTRL_MOVETO, moveData);
};

module.exports.SetPositionGroup = function (groupAddr, countPosition) {
    var moveData = module.exports.MoveData(module.exports.MoveEnum.CountPos, countPosition);
    return module.exports.SomfyMsg(groupAddr, 0x0, module.exports.CommandEnum.CTRL_MOVETO, moveData);
};
    
module.exports.SomfyMsg = function (srcAddr, destAddr, cmd, msgData) {
    const msgOverhead = 11;
    const msg_offset = 0;
    const len_offset = 1;
    const dev_offst = 2;
    const src_offset = 3;
    const dest_offset = 6;
    const data_offset = 9;
    
    var somfyMsg = Buffer(msgOverhead + msgData.length);
    somfyMsg[msg_offset] = ~cmd;
    somfyMsg[len_offset] = ~somfyMsg.length;
    somfyMsg[dev_offst] = ~DevicesEnum.ST30;
    somfyMsg[src_offset] = (srcAddr & 0x000000FF);
    somfyMsg[src_offset + 1] = ((srcAddr & 0x0000FF00) >> 8);
    somfyMsg[src_offset + 2] = ((srcAddr & 0x00FF0000) >> 16);
    somfyMsg[dest_offset] = ~(destAddr & 0x000000FF);
    somfyMsg[dest_offset + 1] = ~((destAddr & 0x0000FF00) >> 8);
    somfyMsg[dest_offset + 2] = ~((destAddr & 0x00FF0000) >> 16);
    
    for (var i = 0; i < msgData.length; i++) {
        somfyMsg[data_offset + i] = ~msgData[i];
    }
    
    var checkSum = CheckSum(somfyMsg);
    somfyMsg[somfyMsg.length - 1] = (checkSum & 0x00FF);
    somfyMsg[somfyMsg.length - 2] = (checkSum & 0xFF00) >> 8;
    
    return somfyMsg;
};

module.exports.IltMsg = function (srcAddr, destAddr, cmd, msgData) {
    const msgOverhead = 11;
    const msg_offset = 0;
    const len_offset = 1;
    const dev_offst = 2;
    const src_offset = 3;
    const dest_offset = 6;
    const data_offset = 9;
    
    var somfyMsg = Buffer(msgOverhead + msgData.length);
    somfyMsg[msg_offset] = ~cmd;
    somfyMsg[len_offset] = ~somfyMsg.length;
    somfyMsg[dev_offst] = ~DevicesEnum.ILT;
    somfyMsg[src_offset + 2] = (srcAddr & 0x000000FF);
    somfyMsg[src_offset + 1] = ((srcAddr & 0x0000FF00) >> 8);
    somfyMsg[src_offset] = ((srcAddr & 0x00FF0000) >> 16);
    somfyMsg[dest_offset] = ~(destAddr & 0x000000FF);
    somfyMsg[dest_offset + 1] = ~((destAddr & 0x0000FF00) >> 8);
    somfyMsg[dest_offset + 2] = ~((destAddr & 0x00FF0000) >> 16);
    
    for (var i = 0; i < msgData.length; i++) {
        somfyMsg[data_offset + i] = ~msgData[i];
    }
    
    var checkSum = CheckSum(somfyMsg);
    somfyMsg[somfyMsg.length - 1] = (checkSum & 0x00FF);
    somfyMsg[somfyMsg.length - 2] = (checkSum & 0xFF00) >> 8;
    
    return somfyMsg;
};








