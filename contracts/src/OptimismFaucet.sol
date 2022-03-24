// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.0;

/// Internal Imports
import "./interfaces/IERC20.sol";

/// Faucet that drips ETH & ERC20 on Optimism
contract OptimismFaucet {

    /// Immutable storage

    /// @notice DAI ERC20 token
    IERC20 public immutable DAI;

    /// Mutable storage

    /// @notice ETH to disperse
    uint256 public ETH_AMOUNT = 1e18;
    /// @notice DAI to disperse
    uint256 public DAI_AMOUNT = 100e18;
    /// @notice TIME in seconds of a day
    uint256 public ONE_DAY_SECONDS = 86400;
    /// @notice Sting githubids with last claim time
    mapping(string => uint256) public lastClaim;
    /// @notice Addresses of approved operators
    mapping(address => bool) public approvedOperators;
    /// @notice Addresses of super operators
    mapping(address => bool) public superOperators;

    /// Modifiers

    /// @notice Requires sender to be contract super operator
    modifier isSuperOperator() {
        // Ensure sender is super operator
        require(superOperators[msg.sender], "Not super operator");
        _;
    }

    /// @notice Requires sender to be contract approved operator
    modifier isApprovedOperator() {
        // Ensure sender is in approved operators or is super operator
        require(
            approvedOperators[msg.sender] || superOperators[msg.sender], 
            "Not approved operator"
        );
        _;
    }

    /// Events

    /// @notice Emitted after faucet drips to a recipient
    /// @param recipient address dripped to
    event FaucetDripped(address indexed recipient);

    /// @notice Emitted after faucet drained to a recipient
    /// @param recipient address drained to
    event FaucetDrained(address indexed recipient);

    /// @notice Emitted after operator status is updated
    /// @param operator address being updated
    /// @param status new operator status
    event OperatorUpdated(address indexed operator, bool status);

    /// @notice Emitted after super operator is updated
    /// @param operator address being updated
    /// @param status new operator status
    event SuperOperatorUpdated(address indexed operator, bool status);

    /// Constructor

    /// @notice Creates a new OptimismFaucet contract
    /// @param _DAI address of DAI contract
    constructor(address _DAI) {
        DAI = IERC20(_DAI);
        superOperators[msg.sender] = true;
    }

    /// Functions

    /// @notice Drips and mints tokens to recipient
    /// @param _recipient to drip tokens to
    function drip(address _recipient, string memory _githubid) external isApprovedOperator {
        // Check if same githubid has claimed past 24hours
        require(canDrip(lastClaim[_githubid]), "Has claimed in the last 24hours");
        // Drip Ether
        (bool sent,) = _recipient.call{value: ETH_AMOUNT}("");
        require(sent, "Failed dripping ETH");
        lastClaim[_githubid] = block.timestamp;
        // Drip DAI
        require(DAI.transfer(_recipient, DAI_AMOUNT), "Failed dripping DAI");

        emit FaucetDripped(_recipient);
    }

    /// @notice Returns number of available drips by token
    /// @return ethDrips — available Ether drips
    /// @return daiDrips — available DAI drips
    function availableDrips() public view 
        returns (uint256 ethDrips, uint256 daiDrips) 
    {
        ethDrips = address(this).balance / ETH_AMOUNT;
        daiDrips = DAI.balanceOf(address(this)) / DAI_AMOUNT;
    }

    /// @notice Allows super operator to drain contract of tokens
    /// @param _recipient to send drained tokens to
    function drain(address _recipient) external isSuperOperator {
        // Drain all Ether
        (bool sent,) = _recipient.call{value: address(this).balance}("");
        require(sent, "Failed draining ETH");

        // Drain all DAI
        uint256 daiBalance = DAI.balanceOf(address(this));
        require(DAI.transfer(_recipient, daiBalance), "Failed draining DAI");

        emit FaucetDrained(_recipient);
    }

    /// @notice Allows super operator to update approved drip operator status
    /// @param _operator address to update
    /// @param _status of operator to toggle (true == allowed to drip)
    function updateApprovedOperator(address _operator, bool _status) 
        external 
        isSuperOperator 
    {
        approvedOperators[_operator] = _status;
        emit OperatorUpdated(_operator, _status);
    }

    /// @notice Allows super operator to update super operator
    /// @param _operator address to update
    /// @param _status of operator to toggle (true === is super operator)
    function updateSuperOperator(address _operator, bool _status) 
        external
        isSuperOperator
    {
        superOperators[_operator] = _status;
        emit SuperOperatorUpdated(_operator, _status);
    }

    /// @notice Allows super operator to update drip amounts
    /// @param _ethAmount ETH to drip
    /// @param _daiAmount DAI to drip
    function updateDripAmounts(
        uint256 _ethAmount,
        uint256 _daiAmount
    ) external isSuperOperator {
        ETH_AMOUNT = _ethAmount;
        DAI_AMOUNT = _daiAmount;
    }

    /// @notice Returns true if a _githubid can drip
    /// @param  _lastClaimTime uint256 time thet user last claimed
    /// @return bool has claimed past 24hours
    function canDrip(uint256 _lastClaimTime) internal view returns (bool) {
        // incorrect lastClaimTime, is bigger than current time
        if(_lastClaimTime > block.timestamp)  {
            return false;
        }

        if(_lastClaimTime <= 0) {
            return true;
        }

        return ((block.timestamp - _lastClaimTime) >= ONE_DAY_SECONDS);
    }

    /// @notice Allows receiving ETH
    receive() external payable {}
}
