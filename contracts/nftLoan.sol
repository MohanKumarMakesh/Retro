// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract NftLoan is ReentrancyGuard {
    /// @param amountToBeRepayed is the amount after interest
    /// @param loanDuration in minutes for testing purposes
    struct Loan {
        uint256 loanAmount;
        uint256 interest;
        uint256 amountToBeRepayed;
        uint256 nftId;
        uint256 loanDuration;
        uint256 loanIndex;
        uint256 loanDurationEndTimestamp;
        address nftAddress;
        address payable borrower;
        address payable lender;
        Status status;
    }

    enum Status {
        Open,
        Loaned,
        Closed
    }

    mapping(uint256 => Loan) public loanList;

    using Counters for Counters.Counter;
    Counters.Counter private loanId;

    // Modifiers
    modifier onlyBorrower(uint256 _loanId) {
        require(
            msg.sender == loanList[_loanId].borrower,
            "Only the borrower can access this function"
        );
        _;
    }

    modifier isOpen(uint256 _loanId) {
        require(
            loanList[_loanId].status == Status.Open,
            "Loan is not Open"
        );
        _;
    }

    modifier isLoaned(uint256 _loanId) {
        require(
            loanList[_loanId].status == Status.Loaned,
            "The loan is not in loaned state"
        );
        _;
    }

    // Events
    event NewLoan(address borrower, uint256 indexed loanId);
    event Loaned(address borrower, address lender, uint256 indexed loanId, uint256 loanAmount);
    event RequestClosed(address borrower, uint256 indexed loanId);
    event LoanRepayed(address borrower, address lender, uint256 indexed loanId, uint256 loanAmount);
    event NftCeased(address borrower, address lender, uint256 indexed loanId);

    //----------------------------------------------------------------------------------------------------------------------

    /// @dev Users make a loan request by transferring their NFT to the contract
    /// @param _loanDuration in minutes for testing purposes
    function askForLoan(
        uint256 _nftId,
        address _nft,
        uint256 _amount,
        uint256 _loanDuration,
        uint256 _interest
    ) public nonReentrant {
        IERC721(_nft).transferFrom(msg.sender, address(this), _nftId);
        uint256 amountToBeRepayed = _amount + mulDiv(_amount, _interest, 100);
        uint256 _loanId = loanId.current();
        loanList[_loanId] = Loan(
            _amount,
            _interest,
            amountToBeRepayed,
            _nftId,
            _loanDuration,
            _loanId,
            0,
            _nft,
            payable(msg.sender),
            payable(address(0)),
            Status.Open
        );
        loanId.increment();
        emit NewLoan(msg.sender, _loanId);
    }

    /// @dev Other users can view the request details and lend money
    function lendMoney(uint256 _loanId) public payable isOpen(_loanId) {
        Loan storage loan = loanList[_loanId];
        require(msg.sender != loan.borrower, "You cannot loan yourself");
        require(msg.value == loan.loanAmount, "Send correct loanAmount");
        (bool success, ) = loan.borrower.call{value: msg.value}("");
        require(success, "Payment to borrower failed");
        loan.loanDurationEndTimestamp = block.timestamp + loan.loanDuration * 1 minutes;
        loan.lender = payable(msg.sender);
        loan.status = Status.Loaned;
        emit Loaned(loan.borrower, loan.lender, _loanId, loan.loanAmount);
    }

    /// @dev If no user lends money, the borrower can close the request and get their NFT back
    function closeBorrowRequest(uint256 _loanId) public onlyBorrower(_loanId) isOpen(_loanId) nonReentrant {
        Loan storage loan = loanList[_loanId];
        IERC721(loan.nftAddress).transferFrom(address(this), msg.sender, loan.nftId);
        loan.status = Status.Closed;
        emit RequestClosed(msg.sender, _loanId);
    }

    /// @dev Borrower can return the money and get their NFT back
    function repayLoan(uint256 _loanId) public payable onlyBorrower(_loanId) isLoaned(_loanId) nonReentrant {
        Loan storage loan = loanList[_loanId];
        require(loan.loanDurationEndTimestamp > block.timestamp, "Loan duration ended");
        require(msg.value == loan.amountToBeRepayed, "Send correct repayment amount");
        (bool success, ) = loan.lender.call{value: msg.value}("");
        require(success, "Payment to lender failed");
        IERC721(loan.nftAddress).transferFrom(address(this), msg.sender, loan.nftId);
        loan.status = Status.Closed;
        emit LoanRepayed(msg.sender, loan.lender, _loanId, loan.loanAmount);
    }

    /// @dev If the borrower fails to pay back the money, after the loan duration ends, the NFT is transferred to the lender
    function ceaseNft(uint256 _loanId) public isLoaned(_loanId) {
        Loan storage loan = loanList[_loanId];
        require(msg.sender == loan.lender, "Only the lender can cease the NFT");
        require(loan.loanDurationEndTimestamp < block.timestamp, "Loan duration not over");
        IERC721(loan.nftAddress).transferFrom(address(this), msg.sender, loan.nftId);
        loan.status = Status.Closed;
        emit NftCeased(loan.borrower, loan.lender, _loanId);
    }

    /// @dev Helper function to calculate the percentage interest
    function mulDiv(uint256 x, uint256 y, uint256 z) internal pure returns (uint256) {
        uint256 a = x / z;
        uint256 b = x % z; // x = a * z + b
        uint256 c = y / z;
        uint256 d = y % z; // y = c * z + d
        return a * b * z + a * d + b * c + b * d / z;
    }

    /// @dev View function that returns the required details of the loan
    function getDetails(uint256 _loanId)
        public
        view
        returns (
            uint256 loanAmount,
            uint256 interest,
            uint256 amountToBeRepayed,
            uint256 nftId,
            uint256 loanDuration,
            uint256 loanDurationEndTimestamp,
            uint256 loanIndex,
            address nftAddress,
            address payable borrowerAddress,
            address payable lenderAddress,
            Status status
        )
    {
        require(_loanId < loanId.current(), "Loan does not exist");
        Loan storage loan = loanList[_loanId];
        return (
            loan.loanAmount,
            loan.interest,
            loan.amountToBeRepayed,
            loan.nftId,
            loan.loanDuration,
            loan.loanDurationEndTimestamp,
            loan.loanIndex,
            loan.nftAddress,
            loan.borrower,
            loan.lender,
            loan.status
        );
    }

    /// @dev View the current loan ID
    function getId() public view returns (uint256 id) {
        return loanId.current();
    }
}