// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.0;

/// Internal Imports

import "./utils/OptimismFaucetTest.sol";

/// Libraries

library Errors {
    string constant NotSuperOperator = 'Not super operator';
    string constant NotApprovedOperator = 'Not approved operator';
}

/// Tests

contract Tests is OptimismFaucetTest {
    /// @notice Allow dripping to recipient, if super operator
    function testDrip() public {
        // Bob before balances
        uint256 bobETHBalanceBefore = BOB.ETHBalance();
        uint256 bobDAIBalanceBefore = BOB.DAIBalance();

        // Alice drips to bob
        ALICE.drip(address(BOB), '111');

        // Bob after balances
        assertEq(BOB.ETHBalance(), bobETHBalanceBefore + 1 ether);
        assertEq(BOB.DAIBalance(), bobDAIBalanceBefore + 1_000e18);
    }

    /// @notice Prevent dripping if not approved operator
    function testFailDripIfNotOperator() public {
        BOB.drip(address(ALICE), '123');
    }

    /// @notice Can add approved operator and they can drip
    function testAddApprovedOperator() public {
        // Alice adds Bob as approved operator
        ALICE.updateApprovedOperator(address(BOB), true);

        // Ensure Bob is an approved operator
        assertTrue(FAUCET.approvedOperators(address(BOB)));

        // Ensure Bob can drip
        BOB.drip(address(ALICE), '123211111');
    }

    /// @notice Can remove approved operator and they can't drip
    function testRemoveApprovedOperator() public {
        // Alice adds Bob as approved operator
        ALICE.updateApprovedOperator(address(BOB), true);
        assertTrue(FAUCET.approvedOperators(address(BOB)));

        // Alice removes Bob as approved operator
        ALICE.updateApprovedOperator(address(BOB), false);
        assertTrue(!FAUCET.approvedOperators(address(BOB)));
    }

    /// @notice Can update super operator
    function testUpdateSuperOperator() public {
        // Alice gives super operatorship to BOB
        ALICE.updateSuperOperator(address(BOB), true);

        // Verify Bob is now a super operator
        assertTrue(FAUCET.superOperators(address(BOB)));

        // Alice removes her super operatorship
        ALICE.updateSuperOperator(address(ALICE), false);

        // Verify Alice is removed as super operator
        assertTrue(!FAUCET.superOperators(address(ALICE)));
    }
    
    /// @notice Can drain contract if super operator
    function testCanDrainFaucet() public {
        // Bob before balances
        uint256 bobETHBalanceBefore = BOB.ETHBalance();
        uint256 bobDAIBalanceBefore = BOB.DAIBalance();

        // Alice drains to bob
        ALICE.drain(address(BOB));

        // Bob after balances
        assertEq(BOB.ETHBalance(), bobETHBalanceBefore + 100 ether);
        assertEq(BOB.DAIBalance(), bobDAIBalanceBefore + 100_000e18);
    }

    /// @notice Cannot drain contract if not super operator
    function testFailDrainIfNotSuperOperator() public {
        BOB.drain(address(BOB));
    }

    /// @notice Returns correct number of available drips
    function testCorrectDripCount() public {
        (uint256 ethDrips, uint256 daiDrips) = FAUCET.availableDrips();
        assertEq(ethDrips, 100);
        assertEq(daiDrips, 100);
    }

    /// @notice Allows super operators to update drip amounts
    function testAllowsUpdatingDripAmounts() public {
        // Bob before balances
        uint256 bobETHBalanceBefore = BOB.ETHBalance();
        uint256 bobDAIBalanceBefore = BOB.DAIBalance();

        // Alice updates drip amounts
        ALICE.updateDripAmounts(5, 5e18);

        // Alice drips to bob
        ALICE.drip(address(BOB), '232424');

        // Bob after balances
        assertEq(BOB.ETHBalance(), bobETHBalanceBefore + 5);
        assertEq(BOB.DAIBalance(), bobDAIBalanceBefore + 5e18);
    }
}