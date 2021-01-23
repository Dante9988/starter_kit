pragma solidity ^0.5.0;

contract StarterKit {
    string public name; // State variable
    uint public postCount = 0;
    mapping(uint => Post) public posts;  // Key value store, writes information to the blockchain itself


    struct Post {
        uint id; // Uniqe ID can't be negative integer
        string content;
        uint tipAmount;
        address payable author;
    }

    event PostCreated(
        uint id,
        string content,
        uint tipAmount,
        address payable author
    );

    event PostTipped(
        uint id,
        string content,
        uint tipAmount,
        address payable author
    );

    constructor() public {
        name = "Block World Social Network";
    }

    function createPost(string memory _content) public { // Local variable to pass argument
        // Require valid content
        require(bytes(_content).length > 0);
        // Increment the post count
        postCount ++;
        // Create the post
        // _posts = Post(postCount, _content, 0, msg.sender); // msg.sendre is a speacial argument and let us know whos calling this funciton and identify address
        posts[postCount] = Post(postCount, _content, 0, msg.sender); // msg.sender = from: in JS file for testing
        // Trigger event
        emit PostCreated(postCount, _content, 0, msg.sender);
    }

    function tipPost(uint _id) public payable {
        // Make sure that id is valid
        require(_id > 0 && _id <= postCount);

        // Fetch the post
        Post memory _post = posts[_id];

        // Fetch the author
        address payable _author = _post.author;

        // Pay the author by sending them Ether
        address(_author).transfer(msg.value);

        // Increment the tip amount
        // 1 Ether = 1000000000000000000 Wei 
        _post.tipAmount = _post.tipAmount + msg.value;

        // Update the post
        posts[_id] = _post;

        // Trigger an event
        emit PostTipped(postCount, _post.content, _post.tipAmount, _author);
    }  
}