// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract VerdictAttestation is ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;

    // Mapping from reportId to tokenId to prevent duplicate mints
    mapping(string => uint256) public reportToTokenId;

    event AttestationMinted(address indexed to, uint256 indexed tokenId, string reportId);

    constructor() ERC721("Verdict Attestation", "VRDCT") Ownable(msg.sender) {}

    // Overriding the _update function to make the token Soulbound (OpenZeppelin v5 compatible)
    function _update(address to, uint256 tokenId, address auth) internal virtual override(ERC721) returns (address) {
        address from = super._update(to, tokenId, auth);
        require(from == address(0), "VerdictAttestation: Token is soulbound and cannot be transferred");
        return from;
    }

    // Only the owner (the Relayer) can mint attestations
    function mintAttestation(address to, string memory reportId, string memory uri) public onlyOwner returns (uint256) {
        require(reportToTokenId[reportId] == 0, "VerdictAttestation: Report already attested");

        _nextTokenId++;
        uint256 newItemId = _nextTokenId;

        _mint(to, newItemId);
        _setTokenURI(newItemId, uri);
        
        reportToTokenId[reportId] = newItemId;

        emit AttestationMinted(to, newItemId, reportId);

        return newItemId;
    }
}
