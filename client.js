let grpc = require("grpc");
let protoLoader = require("@grpc/proto-loader");
let readline = require("readline");

//Read terminal Lines
let reader = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

//Load the protobuf
let proto = grpc.loadPackageDefinition(
    protoLoader.loadSync("./proto/chat.proto", {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true
    })
);

const REMOTE_SERVER = "0.0.0.0:2019";

let username;

//Create gRPC client
let client = new proto.chatGroup.Chat(
    REMOTE_SERVER,
    grpc.credentials.createInsecure()
);

// Ask the user to enter name.
reader.question("Please enter your name: ", answer => {
    username = answer;
    startChat();
});

//Start the stream between server and client
let startChat =() => {
    // Join the chat service
    let channel = client.join();
    // Write the request
    channel.write({user: username, text: "I am joined the conversation..."});
    // get the data from response
    channel.on("data",(message) => {
    if (message.user == username) {
        return;
    }
    console.log(`${message.user}: ${message.text}`);
    });
    // Read the line from terminal
    reader.on("line", (text) => {
        channel.write({user: username, text: text});
    });
}
