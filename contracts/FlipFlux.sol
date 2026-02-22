// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract FlipFlux is Ownable {
    enum Side { Heads, Tails }

    event BetPlaced(address indexed player, uint256 amount, Side guess, Side result, bool won);
    event TreasuryFunded(address indexed from, uint256 amount);
    event TreasuryWithdrawn(address indexed to, uint256 amount);

    constructor() Ownable(msg.sender) {}

    receive() external payable {
        emit TreasuryFunded(msg.sender, msg.value);
    }

    function bankroll() public view returns (uint256) {
        return address(this).balance;
    }

    function flip(Side guess) external payable {
        uint256 wager = msg.value;
        require(wager > 0, "Wager required");
        require(wager <= bankroll() / 2, "Treasury too low");

        Side result = _randomFlip();
        bool won = result == guess;
        if (won) {
            (bool sent,) = msg.sender.call{value: wager * 2}(
                ""
            );
            require(sent, "Payout failed");
        }

        emit BetPlaced(msg.sender, wager, guess, result, won);
    }

    function withdraw(uint256 amount, address payable to) external onlyOwner {
        require(amount <= bankroll(), "Insufficient funds");
        (bool sent,) = to.call{value: amount}("");
        require(sent, "Withdraw failed");
        emit TreasuryWithdrawn(to, amount);
    }

    function _randomFlip() internal view returns (Side) {
        return Side(uint256(keccak256(abi.encodePacked(blockhash(block.number - 1), block.timestamp, msg.sender))) % 2);
    }
}
