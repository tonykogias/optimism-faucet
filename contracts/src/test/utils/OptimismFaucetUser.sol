// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.0;

/// Internal Imports

import "../../OptimismFaucet.sol";
import "../../interfaces/IERC20.sol";

/// @notice Mock user to test interacting with OptimismFaucet
contract OptimismFaucetUser {

    /// Immutable storage

    /// @notice DAI contract
    IERC20 immutable internal DAI;
    /// @notice Faucet contract
    OptimismFaucet immutable internal FAUCET;

    /// Constructor

    /// @notice Creates a new OptimismFaucet
    /// @param _DAI contract address
    /// @param _FAUCET contract
    constructor(OptimismFaucet _FAUCET, address _DAI) {
        DAI = IERC20(_DAI);
        FAUCET = _FAUCET;
    }

    /// Functions

    /// @notice Returns ETH balance of user
    function ETHBalance() public view returns (uint256) {
        return address(this).balance;
    }

    /// @notice Returns DAI balance of user
    function DAIBalance() public view returns (uint256) {
        return DAI.balanceOf(address(this));
    }

    /// Inherited Functionality

    /// @notice Drips from faucet to recipient
    /// @param _recipient to drip to
    /// @param _githubid to check if claimed last 24hours
    function drip(address _recipient, string memory _githubid) public {
        FAUCET.drip(_recipient, _githubid);
    }

    /// @notice Drains faucet to a recipient address
    /// @param _recipient to drain to
    function drain(address _recipient) public {
        FAUCET.drain(_recipient);
    }

    /// @notice Adds or removes approved operator
    /// @param _operator address
    /// @param _status to update for operator (true == allowed to drip)
    function updateApprovedOperator(
        address _operator, 
        bool _status
    ) public {
        FAUCET.updateApprovedOperator(_operator, _status);
    }

    /// @notice Updates super operator
    /// @param _operator address
    /// @param _status of operator
    function updateSuperOperator(address _operator, bool _status) public {
        FAUCET.updateSuperOperator(_operator, _status);
    }

    /// @notice Updates drip amounts
    /// @param _ethAmount ETH to drip
    /// @param _daiAmount DAI to drip
    function updateDripAmounts(uint256 _ethAmount, uint256 _daiAmount) public {
        FAUCET.updateDripAmounts(
            _ethAmount, 
            _daiAmount
        );
    }

    /// @notice Allows receiving ETH
    receive() external payable {}
}