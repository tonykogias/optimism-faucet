// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.0;

/// Internal Imports

import "ds-test/test.sol";
import "./ERC20Mintable.sol";
import "./OptimismFaucetUser.sol";
import "../../OptimismFaucet.sol";

contract OptimismFaucetTest is DSTest {

    /// Storage

    /// @notice DAI token
    ERC20Mintable internal DAI;
    /// @notice OptimismFaucet contract
    OptimismFaucet internal FAUCET;
    /// @notice User: Alice (default super operator)
    OptimismFaucetUser internal ALICE;
    /// @notice User: Bob
    OptimismFaucetUser internal BOB;

    /// Setup

    function setUp() public virtual {
        // Setup token
        DAI = new ERC20Mintable("DAI Stablecoin", "DAI");

        // Create faucet
        FAUCET = new OptimismFaucet(address(DAI));

        // Fund faucet
        (bool success, ) = payable(address(FAUCET)).call{value: 100 ether}("");
        require(success, "Failed funding faucet with ETH");
        DAI.mint(address(FAUCET), 100_000e18);

        // Setup faucet users
        ALICE = new OptimismFaucetUser(FAUCET, address(DAI));
        BOB = new OptimismFaucetUser(FAUCET, address(DAI));

        // Make Alice superOperator
        FAUCET.updateSuperOperator(address(ALICE), true);
    }
}