//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract BuyMeACoffee {
    event NewMemo(
        address indexed from,
        uint256 timestamp,
        string name,
        string message
    );

    struct Memo {
        address from;
        uint256 timestamp;
        string name;
        string message;
    }

    address payable owner;

    Memo[] memos;

    constructor() {
        owner = payable(msg.sender);
    }


    function getMemos() public view returns (Memo[] memory) {
        return memos;
    }

    function buyCoffee(string memory _name, string memory _message) public payable {
        require (
            msg.value > 0, "Can't buy coffee for free!"
        );

        memos.push(Memo(
            msg.sender,
            block.timestamp,
            _name,
            _message
        ));

        emit NewMemo(msg.sender, block.timestamp, _name, _message);
    }

    function withdrawTips() public {
        require(owner == msg.sender, "Only the owner can trigger a payout");
        require(owner.send(address(this).balance));
    }

    function changeOwner(address _newOwner) public {
        require(owner == msg.sender, "Only the owner can change the owner address");

        owner = payable(_newOwner);
    }

    function getOwner() public view returns (address) {
        return owner;
    }

}