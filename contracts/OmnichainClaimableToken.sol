// SPDX-License-Identifier: MIT
pragma solidity 0.8.7;

import "@zetachain/protocol-contracts/contracts/zevm/SystemContract.sol";
import "@zetachain/protocol-contracts/contracts/zevm/interfaces/zContract.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@zetachain/toolkit/contracts/BytesHelperLib.sol";

contract OmnichainClaimableToken is zContract, ERC721 {
    SystemContract public immutable systemContract;
    uint256 constant BITCOIN = 18332;

    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;

    uint256 private totalSupply_;
    uint256 private immutable maxSupply_;
    address private immutable signer_;
    mapping(uint256 => MintedToken) private mintedTokens_;

    mapping(uint256 => uint256) public tokenAmounts;
    mapping(uint256 => uint256) public tokenChains;

    struct MintedToken {
        bool exists;
        address user;
        uint8 v;
        bytes32 r;
        bytes32 s;
    }


    /// Initialize the contract with the max supply and the signer address
    constructor(address systemContractAddress, uint256 maxSupplyInit, address signerInit) ERC721("OmnichainClaimableToken", "OMTC") {
        systemContract = SystemContract(systemContractAddress);
        maxSupply_ = maxSupplyInit;
        signer_ = signerInit;
    }

    modifier onlySystem() {
        require(
            msg.sender == address(systemContract),
            "Only system contract can call this function"
        );
        _;
    }

    function onCrossChainCall(
        zContext calldata context,
        address zrc20,
        uint256 amount,
        bytes calldata message
    ) external override onlySystem {
        address recipient;

        if (context.chainID == BITCOIN) {
            recipient = BytesHelperLib.bytesToAddress(message, 0);
        } else {
            recipient = abi.decode(message, (address));
        }

        _mintNFT(recipient, context.chainID, amount);
    }

    function _mintNFT(
        address recipient,
        uint256 chainId,
        uint256 amount
    ) private {
        uint256 tokenId = _tokenIdCounter.current();
        _safeMint(recipient, tokenId);
        tokenChains[tokenId] = chainId;
        tokenAmounts[tokenId] = amount;
        _tokenIdCounter.increment();
    }

    function burnNFT(uint256 tokenId, bytes memory recipient) public {
        require(
            _isApprovedOrOwner(_msgSender(), tokenId),
            "Caller is not owner nor approved"
        );
        address zrc20 = systemContract.gasCoinZRC20ByChainId(
            tokenChains[tokenId]
        );

        (, uint256 gasFee) = IZRC20(zrc20).withdrawGasFee();

        IZRC20(zrc20).approve(zrc20, gasFee);
        IZRC20(zrc20).withdraw(recipient, tokenAmounts[tokenId] - gasFee);

        _burn(tokenId);
        delete tokenAmounts[tokenId];
        delete tokenChains[tokenId];
    }
    



    // Function to mint a token for a user
    function mint(uint256 tokenId, address user, uint8 v, bytes32 r, bytes32 s) external {
        require(!mintedTokens_[tokenId].exists, "MyTokenClaimable: token already minted");
        // Create the message hash based on the tokenId and the user address
        bytes32 messageHash = keccak256(abi.encodePacked(tokenId, user));
        // Recover the signature
        address recoveredSigner = ecrecover(_toTyped32ByteDataHash(messageHash), v, r, s);

        // Ensure the recovered signer is the same as the contract's signer
        require(recoveredSigner == signer_, "MyTokenClaimable: invalid signature");
        
        // Record the token as minted for the user
        mintedTokens_[tokenId] = MintedToken(true, user, v, r, s);
        ++totalSupply_;
        _safeMint(user, tokenId);
    }


    function _toTyped32ByteDataHash(bytes32 messageHash) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", messageHash));
    }

    // Getter for the total supply of minted tokens
    function totalSupply() external view returns (uint256) {
        return totalSupply_;
    }

    // Getter for the max supply
    function maxSupply() external view returns (uint256) {
        return maxSupply_;
    }

    // Getter for the signer address
    function signer() external view returns (address) {
        return signer_;
    }

    // Getter for the minted tokens
    function mintedTokens(uint256 tokenId) external view returns (MintedToken memory) {
        require(mintedTokens_[tokenId].exists, "MyTokenClaimable: token not minted");
        return mintedTokens_[tokenId];
    }
}