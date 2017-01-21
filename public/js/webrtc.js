
//webrtc.js:  This is where we will put the bulk of the webrtc related code


////Signaling Code ////////////////////////////////////////////////////////////////////////////
io = io.connect();
var myName = "";
var theirName = "";
var myUserType = "";
var configuration = {
    'iceServers': [{
        'url': 'stun:stun.l.google.com:19302'
    }]
};
var rtcPeerConn;
var mainVideoArea = document.querySelector("#mainVideoTag");
var smallVideoArea = document.querySelector("#smallVideoTag");


io.on('signal', function(data) {
    if (data.user_type == "doctor" && data.command == "joinroom") {
        console.log("The doctor is here!");
        if (myUserType == "patient") {
            theirName = data.user_name;
            document.querySelector("#messageOutName").textContent = theirName;
            document.querySelector("#messageInName").textContent = myName;
        }
        //Switch to the doctor listing
        document.querySelector("#requestDoctorForm").style.display = 'none';
        document.querySelector("#waitingForDoctor").style.display = 'none';
        document.querySelector("#doctorListing").style.display = 'block';
        
    } else if (data.user_type == "patient" && data.command == "calldoctor") {
        console.log("Patient is calling");
        if (myUserType == "doctor") {
            theirName = data.user_name;
            document.querySelector("#messageOutName").textContent = theirName;
            document.querySelector("#messageInName").textContent = myName;
        }
        document.querySelector("#doctorSignup").style.display = 'none';
        document.querySelector("#videoPage").style.display = 'block';
        
    } else if (data.user_type == "signaling") {
        if(!rtcPeerConn) startSignaling();
        var message = JSON.parse(data.user_data);
        if (message.sdp) {
            rtcPeerConn.setRemoteDescription(new RTCSessionDescription(message.sdp), function() {
                // if we recieved an offer, we need to answer
                if (rtcPeerConn.remoteDescription.type == 'offer') {
                    rtcPeerConn.createAnswer(sendLocalDesc, logError);
                }
            }, logError);
        }
     else {
        rtcPeerConn.addIceCandidate(new RTCIceCandidate(message.candidate));
     }
    }
});

function startSignaling() {
    console.log("starting signaling...");
    //rtcPeerConn = new webkitRTCPeerConnection(configuration); // can use or here..
    rtcPeerConn = new mozRTCPeerConnection(configuration);
    
    // send any ice candidates to the other peer
    rtcPeerConn.onicecandidate = function(evt) {
        if (evt.candidate) 
            io.emit('signal', {"user_type":"signaling", "command":"icecandidate", "user_data": JSON.stringify({'candidate': evt.candidate})});
            console.log("completed sending and ice candidate");
        
    };
    
    // let the 'negotiationneeded' event trigger offer generation
    rtcPeerConn.onnegotiationneeded = function() {
        console.log(" on negotiation called");
        rtcPeerConn.createOffer(sendLocalDesc, logError);
    };
    
    
    // once remote stream arrives, show it in the main video element
    rtcPeerConn.onaddstream = function(evt) {
        console.log("going to add their stream");
        mainVideoArea.src = URL.createObjectURL(evt.stream);
    };
    
    // get a local stream, show it in our video tag and add it to be sent
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
    navigator.getUserMedia({
        'audio': false,
        'video': true
    }, function(stream) {
        console.log("going to display my stream...");
        smallVideoArea.src = URL.createObjectURL(stream);
        rtcPeerConn.addStream(stream); 
    }, logError);
     
     
}

function sendLocalDesc(desc) {
    rtcPeerConn.setLocalDescription(desc, function() {
        console.log("sending local description");
        io.emit('signal', {"user_type":"signaling", "command":"SDP", "user_data": JSON.stringify({'sdp': rtcPeerConn.localDescription})});
    }, logError);
}


function logError(error) {
    
}






