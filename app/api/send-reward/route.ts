import { NextResponse } from 'next/server';
import { ThirdwebSDK } from "@thirdweb-dev/sdk/evm";
import { Base } from "@thirdweb-dev/chains";

// USDC contract on Base
const USDC_CONTRACT = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';

// Our LoteriaRewards contract address
const LOTERIA_REWARDS_CONTRACT = '0x6A27A08A1c43B995E483C9304a992B8dDDB7D41c';

// Test Mode for local development
const TEST_MODE = process.env.NODE_ENV !== 'production';

// Thirdweb Client ID 
const THIRDWEB_CLIENT_ID = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || '444f6c9a0e50261e2d494748c7cf930e';

// Base chain definition
const BASE_CHAIN = Base;

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
    
    // Verify we have a private key
    if (!process.env.TREASURY_PRIVATE_KEY) {
      console.error('Missing TREASURY_PRIVATE_KEY environment variable');
      throw new Error('Treasury private key not configured');
    }
    
    // Make sure private key has the 0x prefix
    const privateKey = process.env.TREASURY_PRIVATE_KEY.startsWith('0x') 
      ? process.env.TREASURY_PRIVATE_KEY 
      : `0x${process.env.TREASURY_PRIVATE_KEY}`;
    
    // Initialize the Thirdweb SDK with the treasury private key
    console.log('Creating thirdweb SDK');
    const sdk = ThirdwebSDK.fromPrivateKey(privateKey, BASE_CHAIN, {
      clientId: THIRDWEB_CLIENT_ID,
    });
    
    // Get our rewards contract
    console.log('Getting contract instance');
    const contract = await sdk.getContract(LOTERIA_REWARDS_CONTRACT, LOTERIA_REWARDS_ABI);
    
    console.log('Sending transaction');
    const tx = await contract.call("sendReward", [recipientAddress]);
    const transactionHash = tx.receipt.transactionHash;
    
    console.log('Transaction successful:', transactionHash);
    return { transactionHash };
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
    
    // Validate input
    if (!recipient) {
      return NextResponse.json(
        { error: 'Recipient address is required' },
        { status: 400 }
      );
    }

    // Force test mode if we don't have a private key, even in production
    const forceTestMode = TEST_MODE || !process.env.TREASURY_PRIVATE_KEY;
    
    if (forceTestMode) {
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
        
        // Fallback to test mode if contract call fails
        console.log('Contract call failed, falling back to test mode');
        const mockTxHash = `0x${Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
        
        return NextResponse.json({
          success: true,
          transactionHash: mockTxHash,
          message: `FALLBACK MODE: Simulated sending 0.002 USDC to ${recipient}`,
          testMode: true,
          fallback: true,
          error: contractError.message
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
