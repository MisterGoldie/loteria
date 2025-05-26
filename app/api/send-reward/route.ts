import { NextResponse } from 'next/server';
import { ThirdwebSDK } from "@thirdweb-dev/sdk/evm";
import { Base } from "@thirdweb-dev/chains";

// USDC contract on Base
const USDC_CONTRACT = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';

// Our LoteriaRewards contract address
const LOTERIA_REWARDS_CONTRACT = '0x6A27A08A1c43B995E483C9304a992B8dDDB7D41c';

// Test Mode for local development
// FORCE PRODUCTION MODE - Override all test mode settings
const TEST_MODE = false;

// Thirdweb Client ID 
const THIRDWEB_CLIENT_ID = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || '444f6c9a0e50261e2d494748c7cf930e';

// Base chain definition with Coinbase RPC URL
const BASE_CHAIN = {
  ...Base,
  // Use Coinbase RPC endpoint with your API key
  rpc: ["https://api.developer.coinbase.com/rpc/v1/base/Sjvb9zgNSr0BCuwLQquZ3QXUK7MN5PGw"],
};

// ABI for our LoteriaRewards contract
const LOTERIA_REWARDS_ABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "player",
        "type": "address"
      }
    ],
    "name": "sendReward",
    "outputs": [
      {
        "internalType": "bool",
        "name": "success",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function" // Explicitly set type to "function"
  }
] as const; // Add as const to make it a readonly array

// Function to send rewards using our LoteriaRewards contract
async function sendReward(recipientAddress: string) {
  try {
    console.log('Starting sendReward function, recipient:', recipientAddress);
    console.log('Environment check - is production?', process.env.NODE_ENV === 'production');
    console.log('TREASURY_PRIVATE_KEY exists?', !!process.env.TREASURY_PRIVATE_KEY);
    console.log('Using RPC URLs:', BASE_CHAIN.rpc);
    
    // Verify we have a private key
    if (!process.env.TREASURY_PRIVATE_KEY) {
      console.error('Missing TREASURY_PRIVATE_KEY environment variable');
      throw new Error('Treasury private key not configured');
    }
    
    // Make sure private key has the 0x prefix
    const privateKey = process.env.TREASURY_PRIVATE_KEY.startsWith('0x') 
      ? process.env.TREASURY_PRIVATE_KEY 
      : `0x${process.env.TREASURY_PRIVATE_KEY}`;
    
    // Initialize the Thirdweb SDK with the treasury private key and secret key
    console.log('Creating thirdweb SDK with explicit RPC');
    
    // Check for secret key
    const secretKey = process.env.NEXT_PUBLIC_THIRDWEB_SECRET_KEY;
    console.log('Secret key available:', !!secretKey);
    console.log('Treasury wallet should be: 0xe37c201a5d062fB5808E2655efe5eA1541CBC143');
    
    // Override the RPC URL directly on the chain object
    const chainWithCustomRpc = {
      ...BASE_CHAIN,
      rpc: ["https://base.llamarpc.com", "https://mainnet.base.org", ...BASE_CHAIN.rpc]
    };
    
    try {
      // Create SDK with detailed logging and direct RPC configuration
      console.log('Creating SDK with private key starting with:', privateKey.substring(0, 10) + '...');
      console.log('Using Coinbase RPC endpoint');
      
      // Create SDK with explicit configuration
      const sdk = ThirdwebSDK.fromPrivateKey(
        privateKey, 
        BASE_CHAIN, 
        {
          // Use existing secret key
          secretKey: secretKey,
        }
      );
      
      // Log SDK creation success
      console.log('SDK created successfully');
      
      // Get our rewards contract with explicit ABI
      console.log('Getting contract instance');
      const contract = await sdk.getContract(LOTERIA_REWARDS_CONTRACT, LOTERIA_REWARDS_ABI);
      console.log('Contract instance obtained successfully');
      
      // Verify the treasury wallet is the contract owner
      try {
        const owner = await contract.call("owner");
        console.log('Contract owner is:', owner);
        console.log('Treasury wallet is owner:', owner.toLowerCase() === '0xe37c201a5d062fb5808e2655efe5ea1541cbc143'.toLowerCase());
        
        // Also verify the wallet has ETH
        const provider = sdk.getProvider();
        const balance = await provider.getBalance('0xe37c201a5d062fB5808E2655efe5eA1541CBC143');
        console.log('Treasury wallet ETH balance:', balance.toString());
      } catch (ownerError) {
        console.log('Could not get contract owner:', ownerError);
      }
      
      console.log('Sending transaction');
      const tx = await contract.call("sendReward", [recipientAddress]);
      const transactionHash = tx.receipt.transactionHash;
      
      console.log('Transaction successful:', transactionHash);
      return { transactionHash };
    } catch (error) {
      console.error("Error in sendReward:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error in sendReward:", error);
    throw error;
  }
}

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json();
    const { recipient } = body;
    
    console.log('API endpoint called with recipient:', recipient);
    console.log('TREASURY_PRIVATE_KEY exists?', !!process.env.TREASURY_PRIVATE_KEY);
    console.log('TREASURY_PRIVATE_KEY format check:', process.env.TREASURY_PRIVATE_KEY ? 
      `Starts with 0x: ${process.env.TREASURY_PRIVATE_KEY.startsWith('0x')}, Length: ${process.env.TREASURY_PRIVATE_KEY.length}` : 'N/A');
    console.log('NODE_ENV:', process.env.NODE_ENV);
    
    // Validate input
    if (!recipient) {
      return NextResponse.json(
        { error: 'Recipient address is required' },
        { status: 400 }
      );
    }

    // BYPASS ALL TEST MODE CHECKS - FORCE PRODUCTION MODE
    console.log('FORCING PRODUCTION MODE NOW - SENDING REAL TRANSACTION');
    
    // Skip test mode entirely and go straight to production
    if (false) {
      // Simulate sending in test mode
      console.log('Running in TEST MODE - simulating transaction');
      
      // Generate a fake transaction hash
      const mockTxHash = `0x${Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
      
      return NextResponse.json({
        success: true,
        transactionHash: mockTxHash,
        message: `TEST MODE: Simulated sending 0.002 USDC to ${recipient}`,
        testMode: true
      });
    } else {
      // Production mode - actually send the transaction
      console.log('Running in PRODUCTION MODE - sending real transaction');
      
      try {
        // Send the reward using our contract
        const { transactionHash } = await sendReward(recipient);
        
        return NextResponse.json({
          success: true,
          transactionHash: transactionHash,
          message: `Successfully sent 0.002 USDC to ${recipient}`,
          testMode: false
        });
      } catch (contractError: any) {
        console.error('Contract error:', contractError);
        console.error('Error details:', JSON.stringify(contractError, null, 2));
        
        // Log specific information about the error to help debug
        const errorInfo = {
          message: contractError.message,
          code: contractError.code,
          reason: contractError.reason,
          data: contractError.data,
          stack: contractError.stack?.split('\n').slice(0, 3).join('\n')
        };
        console.error('Detailed error info:', errorInfo);
        
        // Check if it's an RPC error
        if (contractError.message?.includes('missing response') || 
            contractError.message?.includes('SERVER_ERROR')) {
          console.error('RPC CONNECTION ERROR: The Base RPC endpoint is not responding properly');
        }
        
        // Fallback to test mode if contract call fails
        console.log('Contract call failed, falling back to test mode');
        const mockTxHash = `0x${Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
        
        return NextResponse.json({
          success: true,
          transactionHash: mockTxHash,
          message: `FALLBACK MODE: Simulated sending 0.002 USDC to ${recipient}`,
          testMode: true,
          fallback: true,
          error: contractError.message,
          errorDetails: errorInfo
        });
      }
    }
    
  } catch (error: any) {
    console.error('Error sending USDC reward:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'An error occurred while sending the reward'
      },
      { status: 500 }
    );
  }
}
